// import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator"
// import ProductPrivate from "./_components/product-private"
// import ProductPublic from "./_components/product-public"
// import { authClient } from "@/lib/auth/auth-client"
// import { Button } from "@repo/ui/button"
// import { headers } from "next/headers"
// import { redirect } from "next/navigation"

import Link from "next/link";

export default async function Home() {
  // Get current session
  // const { data: sessionData } = await authClient.getSession({
  //   fetchOptions: { headers: await headers() },
  // })
  // if (!sessionData?.user) return redirect("/auth/login")
  // const isAuthenticated = Boolean(sessionData?.user?.id)

  return (
    <div className="">
      Welcome bro to our app login here!
      <Link href="/auth/login" className="text-blue-500 underline">
        Go to Login
      </Link>
      {/* <ImpersonationIndicator /> */}
      {/* <Button appName="web">Open alert</Button> */}
    </div>
  )
}
