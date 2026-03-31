"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { authApi } from "@/lib/auth-api"

// Zod schema
const totpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
})

type TotpForm = z.infer<typeof totpSchema>

export function TotpForm() {
  const router = useRouter()

  // TanStack Form setup
  const form = useForm({
    defaultValues: { code: "" } as TotpForm,
    validators: {
      onSubmit: totpSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data } = await authApi.post(
          "/auth/two-factor/verify-totp",
          { ...value, trustDevice: true }
        )

        if (!data?.user?.id) {
          throw new Error("Invalid verify code")
        }

        toast.success("Code verified successfully ✅")
        router.push("/")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error verifying TOTP code"
        toast.error(message)
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="code"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Code</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
              {isInvalid &&
                field.state.meta.errors?.map((err, idx) => {
                  // Zod errors have a 'message' property
                  const message =
                    typeof err === "object" && 'message' in err && err.message
                      ? err.message
                      : "Invalid value"

                  return <FieldError key={idx}>{message}</FieldError>
                })}
            </Field>
          )
        }}
      />

      <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
        {({ isSubmitting }) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}