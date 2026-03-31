"use client"

import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/auth-api"
import { toast } from "sonner"

export function AccountDeletion() {
  async function deleteAccount() {
    try {
      const { data } = await authApi.post(
        "/auth/delete-user",
        {
          callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/`,
        }
      );

      if (!data?.success) throw new Error("Failed to delete account");
      toast.success("Account deletion initiated. Please check your email to confirm.")
      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete account"

      toast.error(message)
      return { error: { message } }
    }
  }

  return (
    <Button
      variant="destructive"
      className="w-full"
      onClick={deleteAccount}
    >
      Delete Account Permanently
    </Button>
  )
}
