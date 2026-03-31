/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
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
  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  })

  const { isSubmitting } = form.formState

  async function handleProfileUpdate(data: ProfileUpdateForm) {
    const promises: Promise<any>[] = []

    // 1) Always update user name
    const updateUserPromise = authClient.updateUser({ name: data.name })
    promises.push(updateUserPromise)

    // 2) Conditionally add email change
    let emailPromise: Promise<any> | null = null
    if (data.email !== user.email) {
      emailPromise = authClient.changeEmail({
        newEmail: data.email,
        callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/profile`,
      })
      promises.push(emailPromise)
    }

    // 3) Await results
    const [updateUserResult, emailResult] = await Promise.all(promises)

    // 4) Handle errors
    if (updateUserResult?.error) {
      toast.error(updateUserResult.error.message || "Failed to update profile")
      return
    }

    if (emailPromise && emailResult?.error) {
      toast.error(emailResult.error.message || "Failed to change email")
      return
    }

    // 5) Success
    if (emailPromise) {
      toast.success("Verify your new email address to complete the change.")
    } else {
      toast.success("Profile updated successfully")
    }

    router.refresh()
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleProfileUpdate)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>Update Profile</LoadingSwap>
        </Button>
      </form>
    </Form>
  )
}
