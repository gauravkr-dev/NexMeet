import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";
import OpenAI from "openai";

// ===== Gemini Client =====
const geminiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const meetingsProcessing = inngest.createFunction(
    { id: "meetings/processing" },
    { event: "meetings/processing" },
    async ({ event, step }) => {
        // 1️⃣ Fetch transcript from URL
        const response = await step.run("fetch-transcript", async () => {
            return fetch(event.data.transcriptUrl).then((res) => res.text());
        });

        // 2️⃣ Parse JSONL transcript
        const transcript = await step.run("parse-transcript", async () => {
            return JSONL.parse(response) as unknown as StreamTranscriptItem[];
        });

        // 3️⃣ Attach speaker info
        const transcriptWithSpeakers = await step.run("add-speakers", async () => {
            const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

            const userSpeakers = await db
                .select()
                .from(user)
                .where(inArray(user.id, speakerIds));

            const agentSpeakers = await db
                .select()
                .from(agents)
                .where(inArray(agents.id, speakerIds));

            const speakers = [...userSpeakers, ...agentSpeakers];

            return transcript.map((item) => {
                const speaker = speakers.find((s) => s.id === item.speaker_id);

                if (!speaker) return { ...item, user: { name: "Unknown Speaker" } };

                return { ...item, user: { name: speaker.name } };
            });
        });

        // 4️⃣ Generate summary using Gemini
        const systemPrompt = `
You are an expert summarizer. You write readable, concise, simple content. 
You are given a meeting transcript and need to summarize it.

Use the following markdown structure:

### Overview
Detailed summary focusing on major features, workflows, and key takeaways.

### Notes
Break down key content into sections with timestamps. Use bullet points.
`.trim();

        const completion = await geminiClient.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(transcriptWithSpeakers) },
            ],
        });

        const summaryText = completion.choices[0]?.message?.content ?? "";

        // 5️⃣ Save summary and mark meeting completed
        await step.run("save-summary", async () => {
            await db
                .update(meetings)
                .set({ summary: summaryText, status: "completed" })
                .where(eq(meetings.id, event.data.meetingId));
        });
    }
);
