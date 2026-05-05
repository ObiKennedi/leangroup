import { Suspense } from "react"
import { AdminChatRoom } from "@/components/admin/chat/AdminChatRoom"

const AdminChatRoomPage = ({ params }: { params: { sessionId: string } }) => {
    return (
        <Suspense>
            <AdminChatRoom sessionId={params.sessionId} />
        </Suspense>
    )
}

export default AdminChatRoomPage