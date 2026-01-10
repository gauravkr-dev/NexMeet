import { auth } from '@/lib/auth'
import { AgentsListHeader } from '@/modules/agents/ui/components/agent-header'
import { AgentsView } from '@/modules/agents/ui/views/agents-view'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/sign-in')
    }
    return (
        <>
            <AgentsListHeader />
            <AgentsView />
        </>

    )
}

export default page
