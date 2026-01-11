import { AgentGetOne } from "../../types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";


interface AgentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: AgentGetOne;
};


export const AgentForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: AgentFormProps) => {
    const utils = trpc.useContext();

    const createAgentMutation = trpc.agents.create.useMutation({
        onSuccess: () => {
            // Invalidate the `getMany` agents query so lists refresh
            void utils.agents.getMany.invalidate();
            if (initialValues?.id) {
                void utils.agents.getOne.invalidate({ id: initialValues.id });
            }
            onSuccess?.();
            toast.success("Agent created successfully");
        },
        onError: (error) => {
            toast.error(error.message);

            // TODO: if error is "Forbidden", redirect to /upgrade
        },
    });


    const updateAgentMutation = trpc.agents.update.useMutation({
        onSuccess: () => {
            // Invalidate the `getMany` agents query so lists refresh
            void utils.agents.getMany.invalidate();
            if (initialValues?.id) {
                void utils.agents.getOne.invalidate({ id: initialValues.id });
            }
            onSuccess?.();
            toast.success("Agent updated successfully");
        },
        onError: (error) => {
            toast.error(error.message);

            // TODO: if error is "Forbidden", redirect to /upgrade
        },
    });

    const form = useForm<z.infer<typeof agentInsertSchema>>({
        resolver: zodResolver(agentInsertSchema),
        defaultValues: {
            name: initialValues?.name || "",
            instructions: initialValues?.instructions || "",
        },
    })

    const isEdit = !!initialValues?.id;
    const isPending = createAgentMutation.isPending || updateAgentMutation.isPending;

    const onSubmit = (values: z.infer<typeof agentInsertSchema>) => {
        if (isEdit) {
            updateAgentMutation.mutate({ ...values, id: initialValues!.id });
        } else {
            createAgentMutation.mutate(values);
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <GeneratedAvatar
                    // eslint-disable-next-line react-hooks/incompatible-library
                    seed={form.watch("name")}
                    variant="botttsNeutral"
                    className="border size-16"
                />
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Agent name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="instructions"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Agent instructions" {...field} />
                            </FormControl>
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
                        {isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Agent" : "Create Agent")}
                    </Button>
                </div>
            </form>
        </Form>
    );
};