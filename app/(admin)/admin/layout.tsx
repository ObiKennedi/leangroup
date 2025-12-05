import { AdminTopNav } from "@/components/admin/AdminTopNav"
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {

    const session = await auth();

    return (
        <>
            <AdminTopNav />
            <SessionProvider session={session}>
                {children}
            </SessionProvider>
        </>
    )
}

export default AdminLayout