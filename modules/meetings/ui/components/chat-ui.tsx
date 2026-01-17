import { trpc } from "@/trpc/client";
import { Channel as StreamChannel } from "stream-chat";
import { useEffect, useState } from "react";
import { Chat, useCreateChatClient, Channel, MessageInput, MessageList, Thread, Window } from "stream-chat-react"
import { LoadingState } from "@/components/loading-state";
import "stream-chat-react/dist/css/v2/index.css";

interface ChatUIProps {
    meetingId: string;
    meetingName: string;
    userId?: string;
    userName?: string;
    userImage?: string | null | undefined;
}

export const ChatUi = ({ meetingId, meetingName, userId, userName, userImage }: ChatUIProps) => {
    const { mutateAsync: generateChatToken } = trpc.meetings.generateChatToken.useMutation();
    const [channel, setChannel] = useState<StreamChannel>();

    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
        tokenOrProvider: generateChatToken,
        userData: {
            id: userId!,
            name: userName!,
            image: userImage || undefined,
        }
    })

    useEffect(() => {
        if (!client) return;

        const channel = client.channel("messaging", meetingId, {
            members: userId ? [userId] : [],
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChannel(channel);
    }, [client, meetingId, meetingName, userId])

    if (!client || !channel) {
        return <LoadingState
            title="Loading chat..."
            description="This may take a few seconds" />;
    }

    return (
        <div className="rounded-lg border overflow-hidden ">
            <Chat client={client} theme="messaging light">
                <Channel channel={channel}>
                    <Window>
                        <div className="flex-1 items-center overflow-y-auto max-h-[calc(100vh-23rem)] border-b">
                            <MessageList />
                        </div>
                        <MessageInput />
                    </Window>
                    <div>
                        <Thread />
                    </div>

                </Channel>
            </Chat>
        </div>
    )
}

