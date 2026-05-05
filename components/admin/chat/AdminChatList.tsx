"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { pusherClient } from "@/lib/pusher-client"
import { Search } from "lucide-react"
import "@/styles/admin/AdminChatList.scss"

interface ChatSession {
    id: string
    updatedAt: string
    unreadCount: number
    user: { id: string; name: string | null; email: string | null; image: string | null }
    messages: { text: string; sender: string; createdAt: string }[]
}

export const AdminChatList = () => {
    const router = useRouter()
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [search, setSearch] = useState("")
    const [, startTransition] = useTransition()

    const fetchSessions = () => {
        startTransition(async () => {
            const data = await fetch("/api/admin/messages").then((r) => r.json())
            setSessions(data)
        })
    }

    useEffect(() => {
        fetchSessions()

        if (!pusherClient) return

        // Real-time: refresh list when any new message comes in
        const channel = pusherClient.subscribe("admin-chat")
        channel.bind("new-message", () => fetchSessions())

        return () => {
            pusherClient?.unsubscribe("admin-chat")
        }
    }, [])

    const filtered = sessions.filter((s) => {
        const name = s.user.name?.toLowerCase() || ""
        const email = s.user.email?.toLowerCase() || ""
        const q = search.toLowerCase()
        return name.includes(q) || email.includes(q)
    })

    const getInitials = (name: string | null) =>
        name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"

    const formatTime = (date: string) => {
        const d = new Date(date)
        const now = new Date()
        const isToday = d.toDateString() === now.toDateString()
        return isToday
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : d.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    return (
        <main className="admin-chat-list">
            <div className="chat-list-header">
                <h2>Messages</h2>
                <p>{sessions.length} conversation{sessions.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="search-bar">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="sessions-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    filtered.map((s) => {
                        const lastMsg = s.messages[0]
                        return (
                            <div
                                key={s.id}
                                className={`session-item ${s.unreadCount > 0 ? "unread" : ""}`}
                                onClick={() => router.push(`/admin-chats/${s.id}`)}
                            >
                                <div className="avatar">
                                    {s.user.image ? (
                                        <img src={s.user.image} alt={s.user.name || ""} />
                                    ) : (
                                        <span>{getInitials(s.user.name)}</span>
                                    )}
                                </div>

                                <div className="session-info">
                                    <div className="session-top">
                                        <h3>{s.user.name || s.user.email || "Unknown"}</h3>
                                        <span className="time">{lastMsg ? formatTime(lastMsg.createdAt) : ""}</span>
                                    </div>
                                    <div className="session-bottom">
                                        <p className="preview">
                                            {lastMsg
                                                ? `${lastMsg.sender === "admin" ? "You: " : ""}${lastMsg.text}`
                                                : "No messages yet"}
                                        </p>
                                        {s.unreadCount > 0 && (
                                            <span className="badge">{s.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </main>
    )
}