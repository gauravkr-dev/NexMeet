"use client";

import { startListening } from "@/lib/speechToText";
import { sendTextToAI } from "@/lib/sendToAI";
import { speak } from "@/lib/textToSpeech";
import { useState } from "react";

export default function AIVoiceAssistant() {
    const [listening, setListening] = useState(false);

    const handleTalk = () => {
        setListening(true);

        startListening(async (userText) => {
            setListening(false);

            console.log("User:", userText);

            const aiReply = await sendTextToAI(userText);

            console.log("AI:", aiReply);

            speak(aiReply);
        });
    };

    return (
        <button
            onClick={handleTalk}
            className="px-4 py-2 rounded bg-black text-white"
        >
            {listening ? "Listening..." : "Talk to AI"}
        </button>
    );
}
