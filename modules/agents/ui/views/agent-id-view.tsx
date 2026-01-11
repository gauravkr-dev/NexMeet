"use client"

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client"
import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";
import { UpdateAgentDialog } from "../components/update-agent-dialog";

interface AgentIdViewProps {
    agentId: string;
}
export const AgentIdView = ({ agentId }: AgentIdViewProps) => {
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const router = useRouter();
    const trpcClient = trpc.agents.getOne.useQuery({ id: agentId });
    const { data, isLoading, error } = trpcClient;
    const utils = trpc.useContext();

    const removeAgent = trpc.agents.remove.useMutation({
        onSuccess: () => {
            // Invalidate the agents list so the Agents page updates immediately
            void utils.agents.getMany.invalidate();
            // Also invalidate this agent's `getOne` cache
            void utils.agents.getOne.invalidate({ id: agentId });
            router.push('/agents');
            toast.success("Agent removed successfully");
        },
        onError: () => {
            toast.error("Failed to remove agent. Please try again.");
        }
    });

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        `The following action will remove ${data?.meetingCount} associated meetings`
    )

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        await removeAgent.mutateAsync({ id: agentId })
    };

    if (isLoading) {
        return <LoadingState
            title="Loading Agent"
            description="Please wait while we fetch the agent..."
        />;
    }
    if (error) {
        return <ErrorState
            title="Error Loading Agent"
            description="Please try again later."
        />;
    }

    if (!data) {
        return <ErrorState
            title="Agent Not Found"
            description="The requested agent could not be found."
        />;
    }

    return (
        <>
            <RemoveConfirmation />
            <UpdateAgentDialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog} initialValues={data} />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <AgentIdViewHeader
                    agentId={agentId}
                    agentName={data?.name || 'Unknown Agent'}
                    onEdit={() => setOpenUpdateDialog(true)}
                    onRemove={handleRemoveAgent}
                />
                <div className="bg-white rounded-lg border">
                    <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                        <div className="flex items-center gap-x-3">
                            <GeneratedAvatar
                                variant="botttsNeutral"
                                seed={data?.name || 'Unknown Agent'}
                                className="size-10" />
                            <h2 className="text-2xl font-medium">{data?.name || 'Unknown Agent'}</h2>

                        </div>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-x-2 [&>svg]:size-4" >
                            <VideoIcon className="text-blue-500" />
                            {data?.meetingCount} {data?.meetingCount === 1 ? 'Meeting' : 'Meetings'}
                        </Badge>
                        <div className="flex flex-col gap-y-4">
                            <p className="text-lg font-medium">Instructions</p>
                            <p className="text-neutral-800">{data?.instructions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}