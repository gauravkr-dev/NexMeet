import { db } from "@/db";
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
import OpenAI from "openai";

/* ------------------------------------------------------------------ */
/* OpenRouter Client (OpenAI Compatible) */
/* ------------------------------------------------------------------ */
const llm = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "AI Meeting App",
    },
});

/* ------------------------------------------------------------------ */
function verifySignature(body: string, signature: string) {
    return streamVideo.verifyWebhook(body, signature);
}
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const body = await req.text();

    if (!verifySignature(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const eventType = payload?.type;

    /* ================================================================ */
    /* 1️⃣ CALL STARTED (NO AI CONNECTED HERE) */
    /* ================================================================ */
    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        const [meeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "active"))
                )
            );

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await db
            .update(meetings)
            .set({ status: "active", startedAt: new Date() })
            .where(eq(meetings.id, meetingId));

        // ⚠️ No OpenAI / No Realtime AI here
        // AI will be handled in browser (STT → OpenRouter → TTS)

    }

    /* ================================================================ */
    /* 2️⃣ PARTICIPANT LEFT → END CALL */
    /* ================================================================ */
    else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];
        const call = streamVideo.video.call("default", meetingId);
        await call.end();
    }

    /* ================================================================ */
    /* 3️⃣ CALL ENDED */
    /* ================================================================ */
    else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;

        await db
            .update(meetings)
            .set({ status: "processing", endedAt: new Date() })
            .where(eq(meetings.id, meetingId));
    }

    /* ================================================================ */
    /* 4️⃣ TRANSCRIPTION READY */
    /* ================================================================ */
    else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        const [meeting] = await db
            .update(meetings)
            .set({ transcriptUrl: event.call_transcription.url })
            .where(eq(meetings.id, meetingId))
            .returning();

        await inngest.send({
            name: "meetings/processing",
            data: { meetingId, transcriptUrl: meeting.transcriptUrl! },
        });
    }

    /* ================================================================ */
    /* 5️⃣ RECORDING READY */
    /* ================================================================ */
    else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        await db
            .update(meetings)
            .set({ recordingUrl: event.call_recording.url })
            .where(eq(meetings.id, meetingId));
    }

    /* ================================================================ */
    /* 6️⃣ POST-MEETING CHAT (OPENROUTER) */
    /* ================================================================ */
    else if (eventType === "message.new") {
        const event = payload as MessageNewEvent;
        const { user, channel_id, message } = event;

        if (!user || !channel_id || !message?.text) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const [meeting] = await db
            .select()
            .from(meetings)
            .where(and(eq(meetings.id, channel_id), eq(meetings.status, "completed")));

        if (!meeting) return NextResponse.json({}, { status: 200 });

        const [agent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, meeting.agentId));

        if (user.id === agent.id) return NextResponse.json({}, { status: 200 });

        const instructions = `
You are an AI assistant helping the user revisit a completed meeting.

MEETING SUMMARY:
${meeting.summary}

AGENT BEHAVIOR:
${agent.instructions}

Answer ONLY from the summary and conversation context.
If info is missing, say so politely.
`;

        const channel = streamChat.channel("messaging", channel_id);
        await channel.watch();

        const history = channel.state.messages
            .slice(-6)
            .map((m) => ({
                role: m.user?.id === agent.id ? "assistant" : "user",
                content: m.text!,
            }));

        const completion = await llm.chat.completions.create({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: [{ role: "system", content: instructions }, ...history] as any[],
        });

        const reply = completion.choices[0]?.message?.content;
        if (!reply) return NextResponse.json({}, { status: 200 });

        const avatar = generatedAvatarUri({
            seed: agent.name,
            variant: "botttsNeutral",
        });

        await streamChat.upsertUser({
            id: agent.id,
            name: agent.name,
            image: avatar,
        });

        await channel.sendMessage({
            text: reply,
            user: { id: agent.id, name: agent.name, image: avatar },
        });
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
