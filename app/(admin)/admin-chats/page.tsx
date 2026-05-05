import { Suspense } from "react"
import { AdminChatList } from "@/components/admin/chat/AdminChatList"

const AdminChatsPage = () => {
    return (
        <Suspense>
            <AdminChatList />
        </Suspense>
    )
}

export default AdminChatsPage