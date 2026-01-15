import { LoaderIcon } from "lucide-react";

interface LoadingStateProps {
    title: string;
    description: string;
}
export const LoadingState = ({ title, description }: LoadingStateProps) => {
    return (
        <div className="py-4 px-8 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                <LoaderIcon className="size-6 animate-spin text-primary" />
                <div className="flex flex-col gap-y-2 text-center">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    )
}