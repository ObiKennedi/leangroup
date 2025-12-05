import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import "@/styles/Settings.scss"

const AdminDefaultLayout =  ({ children }: { children: React.ReactNode }) => {

    return (
        <>
            {children}
            <AdminBottomNav/>
        </>
    )
}

export default AdminDefaultLayout