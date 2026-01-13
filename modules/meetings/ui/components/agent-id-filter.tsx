import { useState } from "react";
import useMeetingsFilter from "../../hooks/use-meetings-filter";
import { trpc } from "@/trpc/client";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";


export const AgentIdFilter = () => {
    const [filters, setFilters] = useMeetingsFilter();
    const [agentSearch, setAgentSearch] = useState("");

    const trpcClient = trpc.agents.getMany.useQuery({
        pageSize: 100,
        search: agentSearch,
    });

    const { data } = trpcClient;

    return (
        <CommandSelect
            className="h-9"
            placeholder="Agent"
            options={(data?.items ?? []).map((agent) => ({
                id: agent.id,
                value: agent.id,
                children: (
                    <div className="flex items-center ">
                        <GeneratedAvatar
                            seed={agent.name}
                            variant="botttsNeutral"
                            className="size-4" />
                        {agent.name}
                    </div>
                )
            }))}
            onSelect={(agent) => setFilters({ agentId: agent })}
            onSearch={setAgentSearch}
            value={filters.agentId ?? ""}
        />
    )

}