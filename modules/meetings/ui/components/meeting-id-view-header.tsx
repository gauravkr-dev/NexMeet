"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronRightIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

interface MeetingIdViewHeaderProps {
    meetingId: string;
    meetingName: string;
    onEdit: () => void;
    onRemove: () => void;
}

export const MeetingIdViewHeader = ({ meetingId, meetingName, onEdit, onRemove }: MeetingIdViewHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl">
                            <Link href="/meetings">
                                My Meetings
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-xl text-foreground font-medium [&>svg]:size-4">
                        <ChevronRightIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                            <Link href={`/meetings/${meetingId}`}>
                                {meetingName}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* // Without modal=false, the dialog that this dropdown opens cause the website to get unclickable. */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost'>
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <PencilIcon className="mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRemove}>
                        <TrashIcon className="mr-2" />
                        Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}