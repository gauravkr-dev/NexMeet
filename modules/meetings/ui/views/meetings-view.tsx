"use client"

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client"

export const MeetingsView = () => {
    const trpcClient = trpc.meetings.getMany.useQuery({});

    const { data, isLoading, error } = trpcClient;

    if (isLoading) {
        return <LoadingState
            title="Loading Meetings"
            description="Please wait while we fetch your meetings..."
        />;
    }
    if (error) {
        return <ErrorState
            title="Error Loading Meetings"
            description="Please try again later."
        />;
    }
    return (
        <div className="">
            {JSON.stringify(data, null, 2)}
        </div>
    )
}