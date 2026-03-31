"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { authApi } from "@/lib/auth-api"

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1),
})

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>

export function ProfileUpdateForm({
  user,
}: {
  user: {
    email: string
    name: string
  }
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
    } as ProfileUpdateForm,
    validators: {
      onSubmit: profileUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        // Create an array to hold promises
        const promises: Promise<any>[] = [];

        // Always update name
        const updateUserPromise = authApi.post("/auth/update-user", {
          name: value.name,
        });
        promises.push(updateUserPromise);

        // Conditionally update email
        let emailPromise: Promise<any> | null = null;
        if (value.email !== user.email) {
          emailPromise = authApi.post("/auth/change-email", {
            newEmail: value.email,
            callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/dashboard/profile`,
          });
          promises.push(emailPromise);
        }

        // Wait for all API calls concurrently
        const results = await Promise.all(promises);
        const updateUserResult = results[0];
        const emailResult = emailPromise ? results[1] : null;

        // Handle name update errors
        if (updateUserResult?.error) {
          toast.error(updateUserResult.error.message || "Failed to update profile");
          return;
        }

        // Handle email update errors
        if (emailResult?.error) {
          toast.error(emailResult.error.message || "Failed to change email");
          return;
        }

        // Success notifications
        if (emailPromise) {
          toast.success("Verify your new email address to complete the change.");
        } else {
          toast.success("Profile updated successfully");
        }

        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
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
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}