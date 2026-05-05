"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CardWrapper } from "./CardWrapper"
import { FormError } from "./FormError"
import { FormSuccess } from "./FormSuccess"
import { verifyOTP, resendOTP } from "@/actions/otp"
import "@/styles/auth/AuthForm.scss"
import "@/styles/auth/OTPForm.scss"

export const OTPForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // digits only

    const updated = [...otp]
    updated[index] = value.slice(-1) // one digit per box
    setOtp(updated)

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const updated = Array(6).fill("")
    pasted.split("").forEach((char, i) => (updated[i] = char))
    setOtp(updated)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const code = otp.join("")
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    startTransition(() => {
      verifyOTP(email, code).then((data) => {
        if (data?.error) {
          setError(data.error)
          setOtp(Array(6).fill(""))
          inputRefs.current[0]?.focus()
          return
        }
        setSuccess(data?.success)
        setTimeout(() => router.push("/auth/login"), 1500)
      })
    })
  }

  const handleResend = () => {
    setError("")
    setSuccess("")
    setCanResend(false)
    setCountdown(60)

    startTransition(() => {
      resendOTP(email).then((data) => {
        if (data?.error) setError(data.error)
        else setSuccess("A new OTP has been sent to your email.")
      })
    })
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
    a + "*".repeat(b.length) + c
  )

  return (
    <CardWrapper
      headerLabel="Verify Email"
      headerWriteUp={`We sent a 6-digit code to ${maskedEmail}`}
      showBackLink
      backLinkHref="/auth/login"
      backLinkLabel="Sign In"
      backLinkWriteUp="Already verified?"
    >
      <form onSubmit={onSubmit} className="form">
        <div className="form-container">
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isPending}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`otp-box ${digit ? "filled" : ""}`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div className="resend-container">
            {canResend ? (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
                disabled={isPending}
              >
                Resend Code
              </button>
            ) : (
              <p className="resend-timer">
                Resend code in <span>{countdown}s</span>
              </p>
            )}
          </div>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <button
          className={isPending ? "pending" : ""}
          disabled={isPending}
        >
          {isPending ? "Please wait ..." : "Verify Email"}
        </button>
      </form>
    </CardWrapper>
  )
}