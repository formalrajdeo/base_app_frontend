"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { authApi } from "@/lib/auth-api"

export function ForgotPassword({ openSignInTab }: { openSignInTab: () => void }) {
  const [email, setEmail] = useState("")

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data: requestPasswordResetRes } = await authApi.post("/auth/request-password-reset", {
        email: email,
        redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/auth/reset-password`,
      })

      if (!requestPasswordResetRes.status) {
        return { error: { message: "Failed to send reset email" } }
      }
      toast.success("Password reset email sent")

    },
    onSuccess: () => {
      toast.success("Password reset email sent ✅")
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to send password reset email"
      toast.error(message)
    },
  })

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email) {
      toast.error("Email is required")
      return
    }
    resetPasswordMutation.mutate(email)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={openSignInTab}>
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Sending..." : "Send Reset Email"}
        </Button>
      </div>
    </form>
  )
}