import { auth } from '@/lib/auth';
import { MeetingIdView } from '@/modules/meetings/ui/views/meeting-id-view';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    params: Promise<{ meetingId: string }>
}
const page = async ({ params }: Props) => {
    const { meetingId } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/sign-in')
    }


    return (
        <div>
            <MeetingIdView meetingId={meetingId} />
        </div>
    )
}

export default page
