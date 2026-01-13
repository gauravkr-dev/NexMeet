"use client"

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client"
import { columns } from "../components/columns";

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

    if (!data) {
        return <ErrorState
            title="Meeting Not Found"
            description="The requested meeting could not be found."
        />;
    }
    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data?.items || []} columns={columns} />
        </div>
    )
}