import Image from "next/image";

interface EmptyStateProps {
    title: string;
    description: string;
}
export const EmptyState = ({ title, description }: EmptyStateProps) => {
    return (
        <div className="py-4 px-8 flex flex-col items-center justify-center">
            <Image className="size-6 text-destructive" src="/favicon.ico" alt="Empty State" width={100} height={100} />
            <div className="flex flex-col gap-y-6 text-center">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}