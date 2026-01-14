import { ErrorState } from "@/components/error-state"

export const CancelState = () => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <ErrorState title="Meeting is cancelled" description="This meeting has been cancelled and is no longer active." image="/cancelled.svg" />
        </div>
    )
}