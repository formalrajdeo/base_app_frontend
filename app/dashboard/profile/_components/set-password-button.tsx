"use client"

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"

export function SetPasswordButton({ email }: { email: string }) {
  async function requestPasswordReset() {
    const { data: requestPasswordResetRes } = await authClient.requestPasswordReset({
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
    <BetterAuthActionButton
      action={requestPasswordReset}
      successMessage="Password reset email sent"
      variant="outline"
    >
      Send Password Reset Email
    </BetterAuthActionButton>
  )
}
