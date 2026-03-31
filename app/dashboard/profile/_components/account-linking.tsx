"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Shield } from "lucide-react"
import { authApi } from "@/lib/auth-api"

/* ---------------- ICONS ---------------- */

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.4 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.8s2.5-5.8 5.6-5.8c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.4 14.6 2.4 12 2.4 6.9 2.4 2.8 6.6 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  )
}

function DiscordIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.30z" />
    </svg>
  )
}

/* ---------------- UTILS ---------------- */

function formatDateStable(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

type Account = {
  id: string
  providerId: string
  accountId: string
  createdAt: string
}

/* ---------------- ACCOUNT CARD ---------------- */

function AccountCard({ provider, account }: { provider: string; account?: Account }) {
  const router = useRouter()

  const providerMap: Record<string, { name: string; Icon: React.ElementType }> = {
    github: { name: "GitHub", Icon: GitHubIcon },
    google: { name: "Google", Icon: GoogleIcon },
    discord: { name: "Discord", Icon: DiscordIcon },
  }

  const { name, Icon } = providerMap[provider] ?? { name: provider, Icon: Shield }

  async function linkAccount() {
    try {
      const { data } = await authApi.post("/auth/link-social", {
        provider,
        callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/profile`,
      })

      if (!data?.url) return toast.error("Failed to start OAuth")
      window.location.assign(data.url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to link account"
      toast.error(message)
    }
  }

  async function unlinkAccount() {
    if (!account) return
    try {
      const { data } = await authApi.post("/auth/unlink-account", {
        providerId: provider,
        accountId: account.accountId,
      })

      if (!data?.status) return toast.error("Failed to unlink account")
      router.refresh()
      toast.success(`${name} account unlinked`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to unlink account"
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="size-5" />
            <div>
              <p className="font-medium">{name}</p>
              {account ? (
                <p className="text-sm text-muted-foreground">
                  Linked on {formatDateStable(account.createdAt)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect your {name} account for easier sign-in
                </p>
              )}
            </div>
          </div>

          {account ? (
            <Button variant="destructive" size="sm" onClick={unlinkAccount}>
              <Trash2 /> Unlink
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={linkAccount}>
              <Plus /> Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- ACCOUNT LINKING PAGE ---------------- */

export function AccountLinking({ currentAccounts }: { currentAccounts: Account[] }) {
  const availableProviders = ["github", "google", "discord"]

  return (
    <div className="space-y-6">
      {/* Linked Accounts */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Linked Accounts</h3>
        {currentAccounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-secondary-muted">
              No linked accounts found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentAccounts.map(acc => (
              <AccountCard key={acc.id} provider={acc.providerId} account={acc} />
            ))}
          </div>
        )}
      </div>

      {/* Link Other Accounts */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Link Other Accounts</h3>
        <div className="grid gap-3">
          {availableProviders
            .filter(p => !currentAccounts.find(acc => acc.providerId === p))
            .map(p => (
              <AccountCard key={p} provider={p} />
            ))}
        </div>
      </div>
    </div>
  )
}