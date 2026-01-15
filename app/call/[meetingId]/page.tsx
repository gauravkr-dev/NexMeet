import { auth } from "@/lib/auth";
import { CallView } from "@/modules/call/ui/views/call-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ meetingId: string }>;
}

const Page = async ({ params }: Props) => {
    const { meetingId } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/sign-in')
    }
    return (
        <div>
            <CallView meetingId={meetingId} />
        </div>
    )
}

export default Page;