"use client"

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button"
import { Card, CardContent } from "@/components/ui/card"
import { authClient } from "@/lib/auth/auth-client"
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
  SupportedOAuthProvider,
} from "@/lib/o-auth-providers"
import { formatDateStable } from "@/lib/utils"
import { Plus, Shield, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Account = {
  id: string
  providerId: string
  accountId: string
  createdAt: string
}

export function AccountLinking({ currentAccounts }: { currentAccounts: Account[] }) {
  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Link Other Accounts</h3>
        <div className="grid gap-3">
          {SUPPORTED_OAUTH_PROVIDERS.filter(
            provider => !currentAccounts.find(acc => acc.providerId === provider),
          ).map(provider => (
            <AccountCard key={provider} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AccountCard({ provider, account }: { provider: string; account?: Account }) {
  const router = useRouter()

  const providerDetails = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider as SupportedOAuthProvider] ?? {
    name: provider,
    Icon: Shield,
  }

  async function linkAccount() {
    try {
      const { data: linkAccountRes } = await authClient.linkAccount({
        provider,
        callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/profile`,
      })

      if (!linkAccountRes?.redirect) {
        return { error: { message: "Failed to start OAuth" } }
      }

      if (linkAccountRes.url) {
        window.location.assign(linkAccountRes.url)
      }

      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete account"

      toast.error(message)
      return { error: { message } }
    }
  }

  async function unlinkAccount() {
    if (!account) return { error: { message: "Account not found" } }
    try {
      const { data: unLinkAccountRes } = await authClient.unLinkAccount({
        providerId: provider,
        accountId: account.accountId,
      })

      if (!unLinkAccountRes?.status) {
        return { error: { message: "Failed to unlink account" } }
      }
      router.refresh()
      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to accept invitation"

      toast.error(message)
      return { error: { message } }
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <providerDetails.Icon className="size-5" />
            <div>
              <p className="font-medium">{providerDetails.name}</p>
              {account == null ? (
                <p className="text-sm text-muted-foreground">
                  Connect your {providerDetails.name} account for easier sign-in
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {/* Linked on {new Date(account.createdAt).toLocaleDateString()} */}
                  Linked on {formatDateStable(account.createdAt)}
                </p>
              )}
            </div>
          </div>

          {account == null ? (
            <BetterAuthActionButton variant="outline" size="sm" action={linkAccount}>
              <Plus /> Link
            </BetterAuthActionButton>
          ) : (
            <BetterAuthActionButton variant="destructive" size="sm" action={unlinkAccount}>
              <Trash2 /> Unlink
            </BetterAuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
