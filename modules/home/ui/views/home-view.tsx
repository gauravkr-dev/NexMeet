"use client"

import { trpc } from "@/trpc/client"





export const HomeView = () => {
    const hello = trpc.hello.useQuery({ text: "from tRPC" })

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading...</p>}
        </div>
    )
}

