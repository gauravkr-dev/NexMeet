"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react"
import { DashboardCommand } from "./dashboard-command"
import { useEffect, useState } from "react"

export const DashboardNavbar = () => {
    const { state, toggleSidebar, isMobile } = useSidebar();
    const [commandOpen, setCommandOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandOpen(true);
            }
        }
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [])
    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
            <nav className="flex px-4 gap-x-4 items-center  py-3 border-b bg-background">
                <Button
                    className="size-9"
                    variant="outline"
                    onClick={toggleSidebar}>
                    {state === "collapsed" || isMobile ? <PanelLeftIcon /> : <PanelLeftCloseIcon />}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 md:w-72"
                    onClick={() => setCommandOpen(true)}>
                    <SearchIcon />
                    search
                    <kbd className="ml-auto pointer-events-none select-none bg-muted px-1 py-0.5 font-mono rounded-sm text-muted-foreground">
                        <span>⌘K</span>
                    </kbd>
                </Button>
            </nav>
        </>
    )
}