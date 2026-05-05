"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { pusherClient } from "@/lib/pusher-client"
import { ArrowLeft } from "lucide-react"
import "@/styles/admin/AdminChatRoom.scss"

interface Message {
    id: string
    sender: string
    text: string
    createdAt: string
    read: boolean
}

export const AdminChatRoom = ({ sessionId }: { sessionId: string }) => {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [userName, setUserName] = useState("")
    const [isPending, startTransition] = useTransition()
    const bottomRef = useRef<HTMLDivElement>(null)

    // Load messages + mark as read
    useEffect(() => {
        fetch(`/api/admin/messages/${sessionId}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages(data)
                // Grab name from first user message context — fetched via sessions list
            })

        // Mark as read
        fetch("/api/admin/messages", {
            method: "PATCH",
            body: JSON.stringify({ sessionId }),
            headers: { "Content-Type": "application/json" },
        })
    }, [sessionId])

    // Fetch user name
    useEffect(() => {
        fetch("/api/admin/messages")
            .then((r) => r.json())
            .then((sessions: any[]) => {
                const s = sessions.find((s) => s.id === sessionId)
                if (s) setUserName(s.user.name || s.user.email || "User")
            })
    }, [sessionId])

    // Pusher — real-time messages for this session
    useEffect(() => {
        if (!pusherClient) return

        const channel = pusherClient.subscribe("admin-chat")
        channel.bind("new-message", (data: any) => {
            if (data.sessionId === sessionId) {
                setMessages((prev) => [...prev, data])

                // Mark as read immediately since admin is viewing
                fetch("/api/admin/messages", {
                    method: "PATCH",
                    body: JSON.stringify({ sessionId }),
                    headers: { "Content-Type": "application/json" },
                })
            }
        })
        return () => {
            pusherClient?.unsubscribe("admin-chat")
        }
    }, [sessionId])

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        const text = input.trim()
        setInput("")

        startTransition(async () => {
            await fetch("/api/admin/reply", {
                method: "POST",
                body: JSON.stringify({ sessionId, message: text }),
                headers: { "Content-Type": "application/json" },
            })
        })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <main className="admin-chat-room">
            <div className="room-header">
                <button className="back-btn" onClick={() => router.push("/admin/chats")}>
                    <ArrowLeft size={20} />
                </button>
                <div className="room-user-info">
                    <h2>{userName}</h2>
                    <span>Customer</span>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((msg, i) => (
                    <div
                        key={msg.id || i}
                        className={`message-wrapper ${msg.sender === "admin" ? "admin" : "user"}`}
                    >
                        <div className={`message ${msg.sender === "admin" ? "my-message" : "their-message"}`}>
                            <p>{msg.text}</p>
                            <span className="timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="input-bar">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type a reply..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isPending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isPending}
                        className={input.trim() ? "active" : ""}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
                <small>Press Enter to send</small>
            </div>
        </main>
    )
}