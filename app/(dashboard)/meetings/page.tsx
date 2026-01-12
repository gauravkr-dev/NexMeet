import { auth } from '@/lib/auth'
import { MeetingsListHeader } from '@/modules/meetings/ui/components/meetings-list-header'
import { MeetingsView } from '@/modules/meetings/ui/views/meetings-view'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/sign-in')
    }
    return (
        <>
            <MeetingsListHeader />
            <MeetingsView />
        </>
    )
}

export default page
