"use client"

import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { MeetingGetMany } from "../../types"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { CircleCheckIcon, CircleXIcon, ClockArrowUpIcon, ClockFadingIcon, CornerDownRightIcon, LoaderIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration } from "@/lib/utils"

const statusIconMap = {
    upcoming: ClockArrowUpIcon,
    active: LoaderIcon,
    completed: CircleCheckIcon,
    processing: LoaderIcon,
    cancelled: CircleXIcon,
}

const statusColorMap = {
    upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
    active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
    completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
    processing: "bg-rose-500/20 text-rose-800 border-rose-800/5",
    cancelled: "bg-gray-500/20 text-gray-800 border-gray-800/5",
}

function normalizeStatus(raw?: string | null) {
    if (!raw) return "";
    const s = String(raw).toLowerCase().trim();

    // Normalize common status values and common misspellings/variants
    if (s === "upcoming" || s === "upcomming" || s.includes("upcom")) return "upcoming";
    if (s === "active" || s === "in progress" || s === "in-progress") return "active";
    if (s === "completed" || s === "complete" || s === "done") return "completed";
    if (s === "processing" || s === "processing..." || s === "in processing") return "processing";
    if (s === "cancelled" || s === "canceled" || s === "cancel") return "cancelled";

    return s;
}

export const columns: ColumnDef<MeetingGetMany[number]>[] = [
    {
        accessorKey: "name",
        header: "Meeting Name",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold capitalize">
                    {row.original.name}
                </span>

                <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1">
                        <CornerDownRightIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">{row.original.agent.name}</span>
                    </div>
                    <GeneratedAvatar
                        variant="botttsNeutral"
                        seed={row.original.agent.name}
                        className="w-4 h-4"
                    />
                    <span className="text-sm text-muted-foreground">{row.original.startedAt ? format(row.original.startedAt, "MMM d") : ""}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const rawStatus = String(row.original.status || "");
            const statusKey = normalizeStatus(rawStatus) as keyof typeof statusIconMap;
            const Icon = statusIconMap[statusKey];
            const colorClass = statusColorMap[statusKey as keyof typeof statusColorMap] ?? "";

            const display = statusKey ? statusKey.charAt(0).toUpperCase() + statusKey.slice(1) : rawStatus;

            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "capitalize flex items-center gap-x-2",
                        colorClass
                    )}>
                    {Icon ? (
                        <Icon
                            className={cn("w-4 h-4 stroke-current", statusKey === "processing" && "animate-spin")} />
                    ) : null}
                    {display}
                </Badge>
            )
        },

    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className="capitalize [&>svg]:size-4 flex items-center gap-x-2">
                <ClockFadingIcon className="text-blue-700" />
                {row.original.duration ? formatDuration(row.original.duration) : "No duration"}
            </Badge>
        )
    }

]

