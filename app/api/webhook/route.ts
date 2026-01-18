import { db } from "@/db";
import OpenAI from "openai";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { streamVideo } from "@/lib/stream-video";
import {
    CallEndedEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallTranscriptionReadyEvent,
    MessageNewEvent,
} from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { streamChat } from "@/lib/stream-chat";
import { generatedAvatarUri } from "@/lib/avatar";

// ===== Gemini API Client =====
const openaiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json({ error: "Missing signature or api key" }, { status: 400 });
    }

    const body = await req.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    // ==============================
    // ===== Real-time Video AI =====
    // ==============================

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;
        if (!meetingId) return NextResponse.json({ error: "Missing meetingId in call custom data" }, { status: 400 });

        // Fetch meeting & agent
        const [existingMeeting] = await db.select().from(meetings)
            .where(and(
                eq(meetings.id, meetingId),
                not(eq(meetings.status, "completed")),
                not(eq(meetings.status, "active")),
                not(eq(meetings.status, "cancelled")),
                not(eq(meetings.status, "processing"))
            ));
        if (!existingMeeting) return NextResponse.json({ error: "Meeting not found or invalid state" }, { status: 404 });

        const [existingAgent] = await db.select().from(agents).where(eq(agents.id, existingMeeting.agentId));
        if (!existingAgent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        // Update meeting status
        await db.update(meetings).set({ status: "active", startedAt: new Date() }).where(eq(meetings.id, meetingId));

        const call = streamVideo.video.call("default", meetingId);

        // === Connect Real-time Gemini AI ===
        const realtimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.GEMINI_API_KEY!,
            model: "gemini-2.5-flash",
            agentUserId: existingAgent.id,
        });

        // Initialize assistant instructions
        realtimeClient.updateSession({
            instructions: existingAgent.instructions || "You are a helpful assistant.",
        });

        // === Live speech handling ===
        realtimeClient.on("speechInput", async (speechText: string) => {
            // 1️⃣ Send live speech text to Gemini AI
            const GPTResponse = await openaiClient.chat.completions.create({
                model: "gemini-2.5-flash",
                messages: [
                    { role: "system", content: existingAgent.instructions || "You are a helpful assistant." },
                    { role: "user", content: speechText }
                ],
            });

            const replyText = GPTResponse.choices[0]?.message?.content;
            if (!replyText) return;

            // 2️⃣ Convert text to speech using Stream Voice / TTS (typed fallback)
            type RealtimeVoiceClient = {
                textToSpeech?: (text: string) => Promise<unknown>;
                playAudio?: (audio: unknown) => Promise<void>;
                play?: (audio: unknown) => Promise<void>;
            };
            const rtcVoice = realtimeClient as unknown as RealtimeVoiceClient;
            const audioStream = rtcVoice.textToSpeech ? await rtcVoice.textToSpeech(replyText) : null;

            // 3️⃣ Play audio in live call (use available method)
            if (audioStream) {
                if (rtcVoice.playAudio) {
                    await rtcVoice.playAudio(audioStream);
                } else if (rtcVoice.play) {
                    await rtcVoice.play(audioStream);
                }
            }
        });

        // ==============================
        // ===== Participant Left =====
        // ==============================
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];
        if (!meetingId) return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        const call = streamVideo.video.call("default", meetingId);
        await call.end();

        // ==============================
        // ===== Call Ended =====
        // ==============================
    } else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;
        if (!meetingId) return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        await db.update(meetings).set({ status: "processing", endedAt: new Date() }).where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

        // ==============================
        // ===== Transcription Ready =====
        // ==============================
    } else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];
        const [updatedMeeting] = await db.update(meetings).set({ transcriptUrl: event.call_transcription.url }).where(eq(meetings.id, meetingId)).returning();
        if (!updatedMeeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        await inngest.send({ name: "meetings/processing", data: { meetingId: updatedMeeting.id, transcriptUrl: updatedMeeting.transcriptUrl! } });

        // ==============================
        // ===== Recording Ready =====
        // ==============================
    } else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];
        const [updatedMeeting] = await db.update(meetings).set({ recordingUrl: event.call_recording.url }).where(eq(meetings.id, meetingId)).returning();
        if (!updatedMeeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        // ==============================
        // ===== Post-meeting Chat =====
        // ==============================
    } else if (eventType === "message.new") {
        const event = payload as MessageNewEvent;
        const userId = event.user?.id;
        const channelId = event.channel_id;
        const text = event.message?.text;
        if (!userId || !channelId || !text) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const [existingMeeting] = await db.select().from(meetings).where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));
        if (!existingMeeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

        const [existingAgent] = await db.select().from(agents).where(eq(agents.id, existingMeeting.agentId));
        if (!existingAgent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        if (userId !== existingAgent.id) {
            const instructions = `
You are an AI assistant helping the user revisit a recently completed meeting.
Summary: ${existingMeeting.summary}
Original Instructions: ${existingAgent.instructions}
      `;

            const channel = streamChat.channel("messaging", channelId);
            await channel.watch();

            const previousMessages = channel.state.messages.slice(-5)
                .filter(msg => msg.text && msg.text.trim() !== "")
                .map(msg => ({
                    role: msg.user?.id === existingAgent.id ? "assistant" : "user",
                    content: msg.text || "",
                }));

            const GPTResponse = await openaiClient.chat.completions.create({
                model: "gemini-2.5-flash",
                messages: ([
                    { role: "system", content: instructions },
                    ...previousMessages,
                    { role: "user", content: text },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ] as any),
            });

            const GPTResponseText = GPTResponse.choices[0]?.message?.content;
            if (!GPTResponseText) return NextResponse.json({ error: "AI failed" }, { status: 500 });

            const avatarUrl = generatedAvatarUri({ seed: existingAgent.name, variant: "botttsNeutral" });
            streamChat.upsertUser({ id: existingAgent.id, name: existingAgent.name, image: avatarUrl });
            channel.sendMessage({ text: GPTResponseText, user: { id: existingAgent.id, name: existingAgent.name, image: avatarUrl } });
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}

