import { AgentIdView } from '@/modules/agents/ui/views/agent-id-view'

interface Props {
    params: Promise<{ agentId: string }>
}

const page = async ({ params }: Props) => {
    const { agentId } = await params

    return (
        <div>
            <AgentIdView agentId={agentId} />
        </div>
    )
}

export default page
