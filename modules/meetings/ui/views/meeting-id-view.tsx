"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { useState } from "react";

interface Props {
    meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const trpcClient = trpc.meetings.getOne.useQuery({ id: meetingId });
    const { data, isLoading, error } = trpcClient;
    const utils = trpc.useContext();
    const router = useRouter();

    const removeMeeting = trpc.meetings.remove.useMutation({
        onSuccess: () => {
            // Invalidate the meetings list so the Meetings page updates immediately
            void utils.meetings.getMany.invalidate();
            // Also invalidate this meeting's `getOne` cache
            void utils.meetings.getOne.invalidate({ id: meetingId });
            router.push('/meetings');
            toast.success("Meeting removed successfully");
        },
        onError: () => {
            toast.error("Failed to remove meeting. Please try again.");
        }
    });

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        `The following action will remove this meeting permanently.`
    )

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        await removeMeeting.mutateAsync({ id: meetingId })
    };


    if (isLoading) {
        return <LoadingState
            title="Loading Meeting"
            description="Please wait while we fetch the meeting..."
        />;
    }
    if (error) {
        return <ErrorState
            title="Error Loading Meeting"
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
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={openUpdateDialog}
                onOpenChange={setOpenUpdateDialog}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setOpenUpdateDialog(true)}
                    onRemove={handleRemoveAgent}
                />
                <h1>{data.name}</h1>
            </div>
        </>
    )
}