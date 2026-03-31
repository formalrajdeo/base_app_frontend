"use client"

import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/auth-api"

// Zod schema
const backupCodeSchema = z.object({
  code: z.string().min(1, "Backup code is required"),
})

type BackupCodeForm = z.infer<typeof backupCodeSchema>

export function BackupCodeTab() {
  const router = useRouter()

  const form = useForm({
    defaultValues: { code: "" } as BackupCodeForm,
    validators: {
      onSubmit: backupCodeSchema, // Zod schema works directly
    },
    onSubmit: async ({ value }) => {
      try {
        const { data } = await authApi.post(
          "/auth/two-factor/verify-backup-code",
          { ...value, trustDevice: true, disableSession: false }
        )

        if (!data?.user?.id) throw new Error("Invalid backup code")

        toast.success("Code verified successfully ✅")
        router.push("/")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error verifying backup code"
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
            <div data-invalid={isInvalid}>
              <label htmlFor={field.name}>Backup Code</label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
              {isInvalid &&
                field.state.meta.errors?.map((err, idx) => {
                  // Safely extract message if it exists, fallback to string
                  const message =
                    typeof err === "object" && 'message' in err && err.message
                      ? err.message
                      : String(err)

                  return (
                    <p key={idx} className="text-red-500 text-sm">
                      {message}
                    </p>
                  )
                })}
            </div>
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