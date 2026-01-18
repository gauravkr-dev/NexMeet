"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
import { CallProvider } from "../components/call-provider";
import AIVoiceAssistant from "../components/ai-voice-assistant";

interface Props {
    meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {

    const trpcClient = trpc.meetings.getOne.useQuery({
        id: meetingId
    });

    const { data, isLoading, error } = trpcClient;


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingState
                    title="Loading Call"
                    description="Please wait while we fetch the call details..."
                />
            </div>
        );
    }
    if (error) {
        return <ErrorState
            title="Error Loading Call"
            description="Please try again later."
        />;
    }

    if (data?.status === "completed") {
        return (
            <div className="flex h-screen items-center justify-center">
                <ErrorState
                    title="Meeting has ended"
                    description="You can no longer join this meeting." />
            </div>
        )
    }
    return (
        <div>
            <CallProvider meetingId={meetingId} meetingName={data?.name} />
            <AIVoiceAssistant />
        </div>
    )
}