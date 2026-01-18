import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";
import OpenAI from "openai";

/* ------------------------------------------------------------------ */
/* OpenRouter client (OpenAI compatible) */
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
export const meetingsProcessing = inngest.createFunction(
    { id: "meetings/processing" },
    { event: "meetings/processing" },
    async ({ event, step }) => {
        // 1️⃣ Fetch transcript
        const response = await step.run("fetch-transcript", async () => {
            return fetch(event.data.transcriptUrl).then((res) => res.text());
        });

        // 2️⃣ Parse transcript (JSONL)
        const transcript = await step.run("parse-transcript", async () => {
            return JSONL.parse(response) as unknown as StreamTranscriptItem[];
        });

        // 3️⃣ Add speaker info
        const transcriptWithSpeakers = await step.run("add-speakers", async () => {
            const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

            const userSpeakers = await db
                .select()
                .from(user)
                .where(inArray(user.id, speakerIds))
                .then((users) =>
                    users.map((u) => ({
                        id: u.id,
                        name: u.name,
                    }))
                );

            const agentSpeakers = await db
                .select()
                .from(agents)
                .where(inArray(agents.id, speakerIds))
                .then((agents) =>
                    agents.map((a) => ({
                        id: a.id,
                        name: a.name,
                    }))
                );

            const speakers = [...userSpeakers, ...agentSpeakers];

            return transcript.map((item) => {
                const speaker = speakers.find((s) => s.id === item.speaker_id);
                return {
                    ...item,
                    user: {
                        name: speaker?.name || "Unknown Speaker",
                    },
                };
            });
        });

        // 4️⃣ Summarize transcript with OpenRouter
        const { choices } = await llm.chat.completions.create({
            model: "allenai/molmo-2-8b:free",
            messages: [
                {
                    role: "system",
                    content: `
You are an expert summarizer. You write readable, concise, simple content.
Follow this markdown structure:

### Overview
- Detailed, engaging summary of session content
- Key features, user workflows, important takeaways

### Notes
- Break down key points with timestamps in bullet format
- Use sections for thematic grouping
          `.trim(),
                },
                {
                    role: "user",
                    content: JSON.stringify(transcriptWithSpeakers),
                },
            ],
        });

        const summaryText = choices[0]?.message?.content || "";

        // 5️⃣ Save summary to DB
        await step.run("save-summary", async () => {
            await db
                .update(meetings)
                .set({
                    summary: summaryText,
                    status: "completed",
                })
                .where(eq(meetings.id, event.data.meetingId));
        });
    }
);
