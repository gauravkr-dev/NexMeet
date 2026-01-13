"use client"

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client"
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import useAgentsFilter from "../../hooks/use-agents-filter";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";

export const AgentsView = () => {
    const router = useRouter();
    const [filters, setFilters] = useAgentsFilter();
    const trpcClient = trpc.agents.getMany.useQuery({
        ...filters,
    });

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
        <div className="flex-1 px-4 pb-4 md:px-8 flex flex-col gap-y-4">
            <DataTable
                data={data?.items ?? []}
                columns={columns}
                onRowClick={(row) => router.push(`/agents/${row.id}`)} />
            <DataPagination
                page={filters.page}
                totalPages={data?.totalPages ?? 0}
                onPageChange={(page) => setFilters({ page })} />
            {data?.items.length === 0 && (
                <EmptyState
                    title="No Agents Found"
                    description="There are no agents to display at the moment."
                />
            )}
        </div>
    )
}