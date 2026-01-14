import Image from "next/image";

interface ErrorStateProps {
    title: string;
    description: string;
    image?: string;
}
export const ErrorState = ({ title, description, image = "/empty.svg" }: ErrorStateProps) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center gap-y-6 max-w-md text-center">
                {image && <Image src={image} alt={title} width={200} height={200} />}
                <div className="flex flex-col gap-y-2 text-center">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    )
}