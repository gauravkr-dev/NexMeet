import React from 'react'
interface layoutProps {
    children: React.ReactNode
}

const layout = ({ children }: layoutProps) => {
    return (
        <div className='bg-muted flex min-h-screen items-center justify-center p-6 md:p-10'>
            <div className='w-full max-w-sm md:max-w-3xl'>
                {children}
            </div>
        </div>
    )
}

export default layout
