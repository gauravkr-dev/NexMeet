"use client";

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";
interface Props {
    meetingId: string;
    meetingName?: string;
}

export const CallUi = ({ meetingName }: Props) => {
    const call = useCall();
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

    const handleJoin = async () => {
        if (!call) {
            return;
        }
        await call.join();
        setShow("call");
    }

    const handleLeave = () => {
        if (!call) {
            return;
        }
        call.endCall();
        setShow("ended");
    }
    return (
        <StreamTheme className="flex items-center justify-center">
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    )
}