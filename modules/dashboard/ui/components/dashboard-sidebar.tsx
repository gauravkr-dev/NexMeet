"use client"

import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { BotIcon, MessagesSquare, StarIcon, VideoIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DashboardUserButton } from "./dashboard-user-button"

const firstSection = [
    {
        icon: VideoIcon,
        label: 'Meetings',
        href: '/meetings'
    },
    {
        icon: BotIcon,
        label: "Agents",
        href: '/agents'
    },
    {
        icon: MessagesSquare,
        label: "Chatbots",
        href: '/chatbots'
    }
]

const secondSection = [
    {
        icon: StarIcon,
        label: 'Upgrade',
        href: '/upgrade'
    },

]
export const DashboardSidebar = () => {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center justify-center gap-2 px-2 pt-2">
                    <p className="text-center text-xl font-bold font-sans">NexMeet</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-50 text-black-600" />
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild className={cn(pathname === item.href && 'bg-sidebar-accent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-accent-foreground')}>
                                        <Link href={item.href} className="flex items-center gap-2">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="px-4 py-2">
                    <Separator className="opacity-50 text-black-600" />
                </div>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild className={cn(pathname === item.href && 'bg-sidebar-accent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-accent-foreground')}>
                                        <Link href={item.href} className="flex items-center gap-2">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    )
}