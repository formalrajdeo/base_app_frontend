"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SignUpTab } from "./_components/sign-up-tab"
import { SignInTab } from "./_components/sign-in-tab"
import { useRouter } from "next/navigation"
import { EmailVerification } from "./_components/email-verification"
import { ForgotPassword } from "./_components/forgot-password"
import { SocialAuthButtons } from "./_components/social-auth-buttons"
import { useSession } from "@/hooks/useSession"
import { Loader2 } from "lucide-react"

type Tab = "signin" | "signup" | "email-verification" | "forgot-password"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [selectedTab, setSelectedTab] = useState<Tab>("signin")

  const { data: sessionData, isLoading } = useSession()

  // Redirect logged-in users
  useEffect(() => {
    if (!isLoading && sessionData?.session) {
      router.replace("/") // or your dashboard route
    }
  }, [isLoading, sessionData, router])

  function openEmailVerificationTab(email: string) {
    setEmail(email)
    setSelectedTab("email-verification")
  }

  // Show nothing while loading the session to avoid flash
  if (isLoading || sessionData?.session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="px-4 w-lg">
        <Tabs
          value={selectedTab}
          onValueChange={t => setSelectedTab(t as Tab)}
          className="w-full"
        >
          {(selectedTab === "signin" || selectedTab === "signup") && (
            <TabsList>
              <TabsTrigger value="signin" className="cursor-pointer">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="cursor-pointer">Sign Up</TabsTrigger>
            </TabsList>
          )}

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card>
              <CardHeader><CardTitle className="text-2xl font-bold">Sign In</CardTitle></CardHeader>
              <CardContent>
                <SignInTab
                  openEmailVerificationTab={openEmailVerificationTab}
                  openForgotPassword={() => setSelectedTab("forgot-password")}
                />
              </CardContent>
              <Separator />
              <CardFooter className="grid grid-cols-1 gap-3">
                <SocialAuthButtons />
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader><CardTitle className="text-2xl font-bold">Sign Up</CardTitle></CardHeader>
              <CardContent>
                <SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
              </CardContent>
              <Separator />
              <CardFooter className="grid grid-cols-1 gap-3">
                <SocialAuthButtons />
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Email Verification Tab */}
          <TabsContent value="email-verification">
            <Card>
              <CardHeader><CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle></CardHeader>
              <CardContent><EmailVerification email={email} /></CardContent>
            </Card>
          </TabsContent>

          {/* Forgot Password Tab */}
          <TabsContent value="forgot-password">
            <Card>
              <CardHeader><CardTitle className="text-2xl font-bold">Forgot Password</CardTitle></CardHeader>
              <CardContent>
                <ForgotPassword openSignInTab={() => setSelectedTab("signin")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}