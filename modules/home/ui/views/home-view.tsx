"use client"
import React from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'



export const HomeView = () => {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (!session) {
        return (
            <p>Please sign in to continue.</p>
        )
    }
    return (
        <div>
            <div className='text-center mt-20'>
                <h1>Welcome, {session.user.name}</h1>
                <Button onClick={() => authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => router.push('/sign-in'),
                    }
                })}>Sign Out</Button>
            </div>
        </div>
    )
}

