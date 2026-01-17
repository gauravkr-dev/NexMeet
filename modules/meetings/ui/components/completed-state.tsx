import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingGetOne } from "../../types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpenTextIcon, ClockFadingIcon, FileTextIcon, FileVideoIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import Markdown from "react-markdown"

interface Props {
    data: MeetingGetOne;
}
export const CompletedState = ({ data }: Props) => {
    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="summary">
                <div className="rounded-lg border ">
                    <ScrollArea>
                        <TabsList className="p-0 justify-start h-13">
                            <TabsTrigger
                                value="summary"
                                className="data-[state=active]:bg-primary/10 flex items-center gap-x-2 px-4 h-13"
                            >
                                <BookOpenTextIcon />
                                Summary
                            </TabsTrigger>
                            <TabsTrigger
                                value="transcript"
                                className="data-[state=active]:bg-primary/10 flex items-center gap-x-2 px-4 h-13"
                            >
                                <FileTextIcon />
                                Transcript
                            </TabsTrigger>
                            <TabsTrigger
                                value="recording"
                                className="data-[state=active]:bg-primary/10 flex items-center gap-x-2 px-4 h-13"
                            >
                                <FileVideoIcon />
                                Recording
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="data-[state=active]:bg-primary/10 flex items-center gap-x-2 px-4 h-13"
                            >
                                <SparklesIcon />
                                Ask AI
                            </TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />

                    </ScrollArea>
                </div>
                <TabsContent value="recording">
                    <div className="mt-4 rounded-lg border px-4 py-5">
                        <video src={data.recordingUrl!}
                            className="w-full rounded-lg"
                            controls
                        />
                    </div>
                </TabsContent>
                <TabsContent value="summary">
                    <div className="rounded-lg border">
                        <div className="px-4 py-5 flex flex-col col-span-5">
                            <h2 className="text-lg font-semibold">{data.name}</h2>
                            <div className="flex gap-x-2 items-center mt-2">
                                <Link href={`/agents/${data.agentId}`} className="underline flex items-center gap-x-2 capitalize text-sm hover:opacity-80">
                                    <GeneratedAvatar
                                        seed={data.agent.name}
                                        variant="botttsNeutral"
                                        className="size-5"
                                    />
                                    {data.agent.name}
                                </Link>{" "}
                                <p className="text-sm">{data.startedAt ? format(data.startedAt, "PPP") : "Jan 1st, 2026"}</p>
                            </div>

                            <div className="flex gap-x-2 items-center mt-4 text-sm text-gray-600">
                                <SparklesIcon className="size-5" />
                                <p>General summary</p>
                            </div>
                            <Badge
                                variant="outline"
                                className="flex items-center mt-4 gap-x-2 [&>svg]:size-4" >
                                <ClockFadingIcon className="text-blue-700" />
                                {data.duration ? formatDuration(data.duration) : "0 seconds"}
                            </Badge>
                            <div className="mt-4 prose max-w-none">
                                <Markdown
                                    components={{
                                        h1: (props) => (
                                            <h1 className="text-2xl font-bold my-4" {...props} />
                                        ),
                                        h2: (props) => (
                                            <h2 className="text-xl font-semibold my-3" {...props} />
                                        ),
                                        h3: (props) => (
                                            <h3 className="text-lg font-semibold my-2" {...props} />
                                        ),
                                        h4: (props) => (
                                            <h4 className="text-md font-semibold my-2" {...props} />
                                        ),
                                        p: (props) => (
                                            <p className="my-2" {...props} />
                                        ),
                                        ul: (props) => (
                                            <ul className="my-2 list-disc list-inside" {...props} />
                                        ),
                                        ol: (props) => (
                                            <ol className="my-2 list-decimal list-inside" {...props} />
                                        ),
                                        li: (props) => (
                                            <li className="my-1" {...props} />
                                        ),
                                        strong: (props) => (
                                            <strong className="font-semibold" {...props} />
                                        ),
                                        code: (props) => (
                                            <code className="bg-muted px-1 rounded font-mono text-sm" {...props} />
                                        ),
                                        blockquote: (props) => (
                                            <blockquote className="border-l-4 pl-4 italic text-muted my-2" {...props} />
                                        ),
                                    }} >
                                    {data.summary || "No summary available."}
                                </Markdown>
                            </div>
                        </div>

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}