import { ErrorState } from "@/components/error-state"
import { Button } from "@/components/ui/button"
import { VideoIcon } from "lucide-react"
import Link from "next/link"

interface StateProps {
    meetingId: string;
}

export const ActiveState = ({ meetingId }: StateProps) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <ErrorState title="Meeting is active" description="Meeting will end once all participants have left" image="/upcoming.svg" />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-4 w-full">
                <Button asChild
                    className="w-full lg:w-auto"
                >
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon />
                        Join Meeting
                    </Link>
                </Button>
            </div>
        </div>
    )
}