"use server"

import { db } from "@/lib/db"
import { getUserByEmail } from "@/data/user"
import { sendOTPEmail } from "@/lib/mail"

// ─── Generate & store OTP ────────────────────────────────────────────────────
export const generateOTP = async (email: string) => {
  // Delete any existing OTPs for this email
  await db.oTP.deleteMany({ where: { email } })

  const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await db.oTP.create({
    data: { email, code, expiresAt },
  })

  await sendOTPEmail(email, code)

  return { success: "OTP sent to your email" }
}

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOTP = async (email: string, code: string) => {
  const otpRecord = await db.oTP.findFirst({
    where: { email, code },
    orderBy: { createdAt: "desc" },
  })

  if (!otpRecord) {
    return { error: "Invalid OTP code" }
  }

  if (new Date() > otpRecord.expiresAt) {
    await db.oTP.delete({ where: { id: otpRecord.id } })
    return { error: "OTP has expired. Please request a new one." }
  }

  // Mark email as verified on the user
  await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  // Clean up used OTP
  await db.oTP.delete({ where: { id: otpRecord.id } })

  return { success: "Email verified successfully" }
}

// ─── Resend OTP ──────────────────────────────────────────────────────────────
export const resendOTP = async (email: string) => {
  const user = await getUserByEmail(email)

  if (!user) {
    return { error: "No account found with this email." }
  }

  return generateOTP(email)
}