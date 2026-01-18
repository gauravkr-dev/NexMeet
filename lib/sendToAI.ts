// lib/sendToAI.ts
export async function sendTextToAI(text: string) {
    const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    const data = await res.json();
    return data.reply as string;
}
