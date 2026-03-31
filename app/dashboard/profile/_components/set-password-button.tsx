"use client"

import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/auth-api"
import { toast } from "sonner"

export function SetPasswordButton({ email }: { email: string }) {
  async function requestPasswordReset() {
    const { data: requestPasswordResetRes } = await authApi.post("/auth/request-password-reset", {
      email: email,
      redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/auth/reset-password`,
    })

    if (!requestPasswordResetRes.status) {
      return { error: { message: "Failed to send reset email" } }
    }
    toast.success("Password reset email sent")

    return { error: null }
  }

  return (
    <Button
      onClick={requestPasswordReset}
      variant="outline"
    >
      Send Password Reset Email
    </Button>
  )
}
