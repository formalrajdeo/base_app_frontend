import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authApi } from "@/lib/auth-api"
import { ArrowLeft, Key, LinkIcon, Loader2Icon, Shield, Trash2, User } from "lucide-react"
import { cookies, headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ReactNode, Suspense } from "react"
// import { ProfileUpdateForm } from "./_components/profile-update-form"
// import { SetPasswordButton } from "./_components/set-password-button"
import { ChangePasswordForm } from "./_components/change-password-form"
import { SessionManagement } from "./_components/session-management"
// import { AccountLinking } from "./_components/account-linking"
import { AccountDeletion } from "./_components/account-deletion"
// import { TwoFactorAuth } from "./_components/two-factor-auth"
import { unstable_noStore } from "next/cache"

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: string
  refreshTokenExpiresAt?: string
  scope?: string
  password?: string
  createdAt: string
  updatedAt: string
}


export default async function ProfilePage() {
  unstable_noStore() // Ensure this page is always rendered on the server and never cached
  const cookieStore = await cookies()
  const sessionCookieData = cookieStore.get('better-auth.session_token')

  const sessionData = await authApi
    .get("/auth/get-session", {
      headers: {
        cookie: `better-auth.session_token=${sessionCookieData?.value}`,
      },
    })
    .then(res => res.data)
    .catch(() => null);

  console.log({ sessionData })
  if (!sessionData?.session) {
    return redirect(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`);
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center space-x-4">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {sessionData.user.image ? (
              <Image
                width={64}
                height={64}
                src={sessionData.user.image}
                alt="User Avatar"
                className="object-cover"
              />
            ) : (
              <User className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex gap-1 justify-between items-start">
              <h1 className="text-3xl font-bold">{sessionData.user.name || "User Profile"}</h1>
              {/* <Badge>{sessionData.user.role}</Badge> */}role hai todo
            </div>
            <p className="text-muted-foreground">{sessionData.user.email}</p>
          </div>
        </div>
      </div>

      <Tabs className="space-y-2" defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="cursor-pointer">
            <User />
            <span className="max-sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="cursor-pointer">
            <Shield />
            <span className="max-sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="cursor-pointer">
            <Key />
            <span className="max-sm:hidden">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="cursor-pointer">
            <LinkIcon />
            <span className="max-sm:hidden">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="cursor-pointer">
            <Trash2 />
            <span className="max-sm:hidden">Danger</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent>
              ProfileUpdateForm
              {/* <ProfileUpdateForm user={sessionData.user} /> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <LoadingSuspense>
            <SecurityTab
              email={sessionData.user.email}
              // isTwoFactorEnabled={sessionData.user.twoFactorEnabled ?? false}
              isTwoFactorEnabled={false}
            />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="sessions">
          <LoadingSuspense>
            <SessionsTab currentSessionToken={sessionData.session.token} />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="accounts">
          <LoadingSuspense>
            <LinkedAccountsTab />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountDeletion />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function LinkedAccountsTab() {
  unstable_noStore() // Ensure this page is always rendered on the server and never cached
  const cookieStore = await cookies()
  const sessionCookieData = cookieStore.get('better-auth.session_token')
  const accounts: Account[] = await authApi
    .get("/auth/list-accounts", {
      headers: {
        cookie: `better-auth.session_token=${sessionCookieData?.value}`,
      },
    })
    .then(res => res.data)
    .catch(() => null);

  const nonCredentialAccounts = accounts.filter(a => a.providerId !== "credential");
  const hasPasswordAccount = accounts.some(a => a.providerId === "credential");

  return (
    <Card>
      <CardContent>
        AccountLinking
        {/* <AccountLinking currentAccounts={nonCredentialAccounts} /> */}
      </CardContent>
    </Card>
  )
}
async function SessionsTab({ currentSessionToken }: { currentSessionToken: string }) {
  unstable_noStore() // Ensure this page is always rendered on the server and never cached
  const cookieStore = await cookies()
  const sessionCookieData = cookieStore.get('better-auth.session_token')

  const sessions: any[] = await authApi
    .get("/auth/list-sessions", {
      headers: {
        cookie: `better-auth.session_token=${sessionCookieData?.value}`,
      },
    })
    .then(res => res.data)
    .catch(() => null);

  return (
    <Card>
      <CardContent>
        <SessionManagement sessions={sessions} currentSessionToken={currentSessionToken} />
      </CardContent>
    </Card>
  )
}

async function SecurityTab({
  email,
  isTwoFactorEnabled,
}: {
  email: string
  isTwoFactorEnabled: boolean
}) {
  unstable_noStore() // Ensure this page is always rendered on the server and never cached
  const cookieStore = await cookies()
  const sessionCookieData = cookieStore.get('better-auth.session_token')
  // const [passkeys, accounts] = await Promise.all([
  //   auth.api.listPasskeys({ headers: await headers() }),
  //   auth.api.listUserAccounts({ headers: await headers() }),
  // ])
  const accounts: Account[] = await authApi
    .get("/auth/list-accounts", {
      headers: {
        cookie: `better-auth.session_token=${sessionCookieData?.value}`,
      },
    })
    .then(res => res.data)
    .catch(() => null);

  // const [accounts] = await Promise.all([
  //   auth.api.listUserAccounts({ headers: await headers() }),
  // ])
  const hasPasswordAccount = accounts.some((a: Account) => a.providerId === "credential") ?? false

  return (
    <div className="space-y-6">
      {hasPasswordAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password for improved security.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription>
              We will send you a password reset email to set up a password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            SetPasswordButton
            {/* <SetPasswordButton email={email} /> */}
          </CardContent>
        </Card>
      )}
      {hasPasswordAccount && (
        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Two-Factor Authentication</CardTitle>
            <Badge variant={isTwoFactorEnabled ? "default" : "secondary"}>
              {isTwoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardHeader>
          <CardContent>
            TwoFactorAuth
            {/* <TwoFactorAuth isEnabled={isTwoFactorEnabled} /> */}
          </CardContent>
        </Card>
      )}

      {/* <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
        </CardHeader>
        <CardContent>
          <PasskeyManagement passkeys={passkeys} />
        </CardContent>
      </Card> */}
    </div>
  )
}

function LoadingSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loader2Icon className="size-20 animate-spin" />}>{children}</Suspense>
}
