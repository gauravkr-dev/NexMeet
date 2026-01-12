import { MeetingGetOne } from "../../types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";


interface MeetingFormProps {
    onSuccess?: (id?: string) => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
};


export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: MeetingFormProps) => {
    const [agentSearch, setAgentSearch] = useState("");
    const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
    const utils = trpc.useContext();
    const agents = trpc.agents.getMany.useQuery({
        search: agentSearch,
        pageSize: 100,
    });

    const createMeetingMutation = trpc.meetings.create.useMutation({
        onSuccess: (data) => {
            // Invalidate the `getMany` agents query so lists refresh
            void utils.meetings.getMany.invalidate();
            if (initialValues?.id) {
                void utils.meetings.getOne.invalidate({ id: initialValues.id });
            }
            onSuccess?.(data.id);
            toast.success("Meeting created successfully");
        },
        onError: (error) => {
            toast.error(error.message);

            // TODO: if error is "Forbidden", redirect to /upgrade
        },
    });


    const updateMeetingMutation = trpc.meetings.update.useMutation({
        onSuccess: () => {
            // Invalidate the `getMany` agents query so lists refresh
            void utils.meetings.getMany.invalidate();
            if (initialValues?.id) {
                void utils.meetings.getOne.invalidate({ id: initialValues.id });
            }
            onSuccess?.(initialValues?.id);
            toast.success("Meeting updated successfully");
        },
        onError: (error) => {
            toast.error(error.message);

            // TODO: if error is "Forbidden", redirect to /upgrade
        },
    });

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name || "",
            agentId: initialValues?.agentId || "",
        },
    })

    const isEdit = !!initialValues?.id;
    const isPending = createMeetingMutation.isPending || updateMeetingMutation.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            updateMeetingMutation.mutate({ ...values, id: initialValues!.id });
        } else {
            createMeetingMutation.mutate(values);
        }
    };
    return (
        <>
            <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. English Conversation" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="agentId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent</FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        options={agents.data?.items.map(agent => ({
                                            id: agent.id,
                                            value: agent.id,
                                            children: (
                                                <div className="flex items-center gap-2">
                                                    <GeneratedAvatar
                                                        seed={agent.name}
                                                        variant="botttsNeutral"
                                                        className="border size-6"
                                                    />
                                                    <span>{agent.name}</span>
                                                </div>
                                            )
                                        })) || []}
                                        value={field.value}
                                        onSelect={field.onChange}
                                        onSearch={setAgentSearch}
                                        placeholder="Select an agent"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Not found what your&apos;re looking for?
                                    <Button
                                        onClick={() => setOpenNewAgentDialog(true)}
                                        variant="link"
                                        className="p-0 ml-1 text-primary"
                                        type="button">
                                        Create a new agent
                                    </Button>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2 justify-end">
                        {onCancel && (
                            <Button disabled={isPending} type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isPending} aria-busy={isPending}>
                            {isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Meeting" : "Create Meeting")}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};