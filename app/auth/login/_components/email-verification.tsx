"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function EmailVerification({ email }: { email: string }) {
  const [timeToNextResend, setTimeToNextResend] = useState(30)
  const [isSending, setIsSending] = useState(false)
  const interval = useRef<NodeJS.Timeout | null>(null)

  // Countdown logic
  useEffect(() => {
    startEmailVerificationCountdown()
    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [])

  function startEmailVerificationCountdown(time = 30) {
    setTimeToNextResend(time)
    if (interval.current) clearInterval(interval.current)

    interval.current = setInterval(() => {
      setTimeToNextResend(t => {
        const newT = t - 1
        if (newT <= 0) {
          clearInterval(interval.current!)
          return 0
        }
        return newT
      })
    }, 1000)
  }

  async function handleResendEmail() {
    setIsSending(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/send-verification-email`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/`,
          }),
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || "Failed to send verification email")
      }

      toast.success("Verification email sent! ✅")
      startEmailVerificationCountdown()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification email"
      toast.error(message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">
        We sent you a verification link. Please check your email and click the link to verify your
        account.
      </p>

      <Button
        variant="outline"
        className="w-full"
        disabled={timeToNextResend > 0 || isSending}
        onClick={handleResendEmail}
      >
        {timeToNextResend > 0
          ? `Resend Email (${timeToNextResend})`
          : isSending
            ? "Sending..."
            : "Resend Email"}
      </Button>
    </div>
  )
}