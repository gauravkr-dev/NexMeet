"use client";
import { trpc } from "@/trpc/client";
import {
    Call,
    CallingState,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { CallUi } from "./call-ui";

interface Props {
    meetingId: string;
    meetingName?: string;
    userId: string;
    userName: string;
    userImage: string;
}

export const CallConnect = ({ meetingId, meetingName, userId, userName, userImage }: Props) => {

    const [client, setClient] = useState<StreamVideoClient>();

    const { mutateAsync: generateToken } = trpc.meetings.generateToken.useMutation();

    useEffect(() => {
        const _client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage,
            },
            tokenProvider: generateToken,
        })
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClient(_client);

        return () => {
            _client.disconnectUser();
            setClient(undefined);
        }
    }, [userId, userName, userImage, generateToken]);

    const [call, setCall] = useState<Call>();

    useEffect(() => {
        if (!client) return;

        const _call = client.call("default", meetingId,);
        _call.camera.disable();
        _call.microphone.disable();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCall(_call);

        return () => {
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave();
                _call.endCall();
                setCall(undefined);
            }
        }
    }, [client, meetingId]);

    if (!client || !call) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="h-6 w-6 animate-spin text-white" />
            </div>
        );
    }
    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUi meetingId={meetingId} meetingName={meetingName} />
            </StreamCall>
        </StreamVideo>
    );
}