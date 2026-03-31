"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/auth-api"
import { getErrorMessage } from "@/utils/errors"
import { Eye, EyeOff, Loader2 } from "lucide-react"

/* ---------------- Zod Schema ---------------- */
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignUpForm = z.infer<typeof signupSchema>

/* ---------------- Component ---------------- */
export function SignUpTab({
  openEmailVerificationTab,
}: {
  openEmailVerificationTab: (email: string) => void
}) {
  const router = useRouter()
  const [form, setForm] = useState<SignUpForm>({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  const signupMutation = useMutation({
    mutationFn: async () => {
      // Validate using Zod before sending
      signupSchema.parse(form)
      const res = await authApi.post("/auth/sign-up/email", form)
      return res.data
    },
    onSuccess: (data) => {
      toast.success("Account created 🚀")
      if (!data.user.emailVerified) {
        openEmailVerificationTab(form.email)
      } else {
        router.push("/dashboard")
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err))
    },
  })

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      signupSchema.parse(form)
      signupMutation.mutate()
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(getErrorMessage(err))
      } else {
        toast.error("Something went wrong")
      }
    }
  }

  const isLoading = signupMutation.status === "pending";
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <div className="relative">
        <Input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <Button
        className="w-full flex items-center justify-center gap-2 cursor-pointer"
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  )
}