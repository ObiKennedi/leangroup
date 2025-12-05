"use client"

import { TopNav } from "@/components/TopNav"
import { SessionProvider } from 'next-auth/react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <TopNav />
            <SessionProvider>
                {children}
            </SessionProvider>
        </>
    )
}

export default DashboardLayout