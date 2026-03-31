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
import { authApi } from "@/lib/auth-api"
import { useSession } from "@/hooks/useSession"

type Tab = "signin" | "signup" | "email-verification" | "forgot-password"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [selectedTab, setSelectedTab] = useState<Tab>("signin")

  const { data: sessionData, isLoading } = useSession();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !sessionData?.session) {
      router.replace("/auth/login");
    }
  }, [isLoading, sessionData, router]);

  function openEmailVerificationTab(email: string) {
    setEmail(email)
    setSelectedTab("email-verification")
  }

  return (
    <div className="">
      <div className="max-w-4xl mx-auto my-6 px-4">
        <Tabs
          value={selectedTab}
          onValueChange={t => setSelectedTab(t as Tab)}
          className="max-auto w-full my-6 px-4"
        >
          {(selectedTab === "signin" || selectedTab === "signup") && (
            <TabsList>
              <TabsTrigger value="signin" className="cursor-pointer">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="cursor-pointer">
                Sign Up
              </TabsTrigger>
            </TabsList>
          )}
          <TabsContent value="signin">
            <Card>
              <CardHeader className="text-2xl font-bold">
                <CardTitle>Sign In</CardTitle>
              </CardHeader>
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

          <TabsContent value="signup">
            <Card>
              <CardHeader className="text-2xl font-bold">
                <CardTitle>Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
              </CardContent>

              <Separator />

              <CardFooter className="grid grid-cols-1 gap-3">
                <SocialAuthButtons />
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="email-verification">
            <Card>
              <CardHeader className="text-2xl font-bold">
                <CardTitle>Verify Your Email</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailVerification email={email} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forgot-password">
            <Card>
              <CardHeader className="text-2xl font-bold">
                <CardTitle>Forgot Password</CardTitle>
              </CardHeader>
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
