"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export function PasskeyButton() {
  const router = useRouter()

  // TanStack Query mutation
  const passkeySignInMutation = useMutation({
    mutationFn: async (body: { autoFill?: boolean } = {}) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/sign-in/passkey`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || "Failed to sign in with passkey")
      }

      return res.json()
    },
    onSuccess: () => {
      router.push("/")
      toast.success("Signed in successfully ✅")
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to sign in with passkey"
      toast.error(message)
    },
  })

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => passkeySignInMutation.mutate({ autoFill: true })} // optional autoFill
      disabled={passkeySignInMutation.isPending}
    >
      {passkeySignInMutation.isPending ? "Signing in..." : "Use Passkey"}
    </Button>
  )
}