import { Suspense } from "react"
import { AdminChatList } from "@/components/admin/chat/AdminChatList"

const AdminChatsPage = () => {
    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <AdminChatList />
        </Suspense>
    )
}

export default AdminChatsPage