"use client"

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client"

export const MeetingsView = () => {
    const trpcClient = trpc.meetings.getMany.useQuery({});

    const { data, isLoading, error } = trpcClient;

    if (isLoading) {
        return <LoadingState
            title="Loading Agents"
            description="Please wait while we fetch the agents..."
        />;
    }
    if (error) {
        return <ErrorState
            title="Error Loading Agents"
            description="Please try again later."
        />;
    }
    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}