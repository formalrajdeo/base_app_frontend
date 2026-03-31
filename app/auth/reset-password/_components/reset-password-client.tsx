"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { authApi } from "@/lib/auth-api"
import { Input } from "@/components/ui/input"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordClient({
  searchParams,
}: {
  searchParams: { token?: string; error?: string }
}) {
  const router = useRouter()
  const token = searchParams.token
  const error = searchParams.error

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    defaultValues: { password: "" } as ResetPasswordForm,
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid token")
        return
      }

      setIsSubmitting(true)
      try {
        const { data } = await authApi.post("/auth/reset-password", {
          newPassword: value.password,
          token,
        })

        if (!data?.status) {
          throw new Error("Failed to change password")
        }

        toast.success("Password reset successful", {
          description: "Redirecting to login...",
        })
        setTimeout(() => router.push("/auth/login"), 1000)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to reset password"
        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (!token || error) {
    return (
      <div className="my-6 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="my-6 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <Input
                        id={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}