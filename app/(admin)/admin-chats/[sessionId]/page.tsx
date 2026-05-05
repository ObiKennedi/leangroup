import { Suspense } from "react"
import { AdminChatRoom } from "@/components/admin/chat/AdminChatRoom"

interface PageProps {
    params: Promise<{ sessionId: string }>;
}

const AdminChatRoomPage = async ({ params }: PageProps) => {

    const { sessionId } = await params;

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <AdminChatRoom sessionId={sessionId} />
        </Suspense>
    )
}

export default AdminChatRoomPage