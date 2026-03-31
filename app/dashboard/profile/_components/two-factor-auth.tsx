"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { authApi } from "@/lib/auth-api"

const twoFactorAuthSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

const qrSchema = z.object({
  token: z.string().length(6, "Code must be 6 digits"),
})

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>
type QrForm = z.infer<typeof qrSchema>

type TwoFactorData = {
  totpURI: string
  backupCodes: string[]
}

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const [twoFactorData, setTwoFactorData] =
    React.useState<TwoFactorData | null>(null)

  const router = useRouter()

  const form = useForm({
    defaultValues: {
      password: "",
    } as TwoFactorAuthForm,

    validators: {
      onSubmit: twoFactorAuthSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        if (isEnabled) {
          // Disable 2FA
          const { data } = await authApi.post(
            "/auth/two-factor/disable",
            {
              password: value.password,
            }
          )

          if (!data?.status) {
            throw new Error("Failed to disable 2FA")
          }

          toast.success("Disabled 2FA successfully")
          router.refresh()
          form.reset()
        } else {
          // Enable 2FA
          const { data } = await authApi.post(
            "/auth/two-factor/enable",
            {
              password: value.password,
            }
          )

          if (!data?.totpURI) {
            throw new Error("Invalid password")
          }

          setTwoFactorData(data)
          toast.success("Password matched successfully")
          form.reset()
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong"
        toast.error(message)
      }
    },
  })

  if (twoFactorData) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => setTwoFactorData(null)}
      />
    )
  }

  return (
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
            const isInvalid =
              field.state.meta.isTouched &&
              !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Password
                </FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  aria-invalid={isInvalid}
                />

                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ isSubmitting }) => (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant={isEnabled ? "destructive" : "default"}
          >
            {isEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

/* ---------------- QR VERIFY ---------------- */

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const [successfullyEnabled, setSuccessfullyEnabled] =
    React.useState(false)

  const router = useRouter()

  const form = useForm({
    defaultValues: {
      token: "",
    } as QrForm,

    validators: {
      onSubmit: qrSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        const { data } = await authApi.post(
          "/auth/two-factor/verify-totp",
          {
            code: value.token,
          }
        )

        if (!data?.user?.id) {
          throw new Error("Invalid verify code")
        }

        toast.success("Code verified successfully.")
        setSuccessfullyEnabled(true)
        router.refresh()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to verify code"
        toast.error(message)
      }
    },
  })

  if (successfullyEnabled) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          Save these backup codes in a safe place.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Scan this QR code and enter the code below:
      </p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="token"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Code
                  </FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                    aria-invalid={isInvalid}
                  />

                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          />
        </FieldGroup>

        <form.Subscribe
          selector={(state) => ({
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ isSubmitting }) => (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Verifying..." : "Submit Code"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="p-4 bg-white w-fit">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  )
}