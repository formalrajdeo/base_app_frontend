import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { TotpForm } from "./_components/totp-form"
import { BackupCodeTab } from "./_components/backup-code-tab"
import { authApi } from "@/lib/auth-api"

export default async function TwoFactorPage() {
  // Check session using authClient

  const nextHeaders = await headers()

  const { data: session } = await authApi
    .get("/auth/get-session", {
      headers: Object.fromEntries(nextHeaders.entries()), // FIX
    })
    .catch(() => ({ data: { session: null } }))

  if (session) return redirect("/")
  return (
    <div className="my-6 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="totp">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="totp">Authenticator</TabsTrigger>
              <TabsTrigger value="backup">Backup Code</TabsTrigger>
            </TabsList>

            <TabsContent value="totp">
              <TotpForm />
            </TabsContent>

            <TabsContent value="backup">
              <BackupCodeTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
