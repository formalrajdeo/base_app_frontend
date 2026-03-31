"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { authApi } from "@/lib/auth-api"

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  revokeOtherSessions: z.boolean(),
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    } as ChangePasswordForm,

    validators: {
      onSubmit: changePasswordSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        const { data } = await authApi.post("/auth/change-password", {
          ...value,
          callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/`,
        })

        if (!data?.user?.id) {
          throw new Error("Failed to change password")
        }

        toast.success("Password changed successfully")
        form.reset()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to change password"

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
      <FieldGroup>
        {/* Current Password */}
        <form.Field
          name="currentPassword"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Current Password
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

        {/* New Password */}
        <form.Field
          name="newPassword"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  New Password
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

        {/* Checkbox */}
        <form.Field
          name="revokeOtherSessions"
          children={(field) => {
            return (
              <Field orientation="horizontal">
                <Checkbox
                  id="revokeOtherSessions"
                  checked={field.state.value}
                  onCheckedChange={(val) =>
                    field.handleChange(!!val)
                  }
                />
                <FieldLabel htmlFor="revokeOtherSessions">
                  Log out other sessions
                </FieldLabel>
              </Field>
            )
          }}
        />
      </FieldGroup>

      {/* Submit */}
      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ isSubmitting }) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? "Changing Password..."
              : "Change Password"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}