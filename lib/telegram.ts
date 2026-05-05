const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export const sendTelegramAlert = async (userName: string, message: string) => {
    const text = `💬 *New message from ${userName}*\n\n"${message}"\n\n👉 Reply from your admin dashboard.`

    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
            text,
            parse_mode: "Markdown",
        }),
    })
}