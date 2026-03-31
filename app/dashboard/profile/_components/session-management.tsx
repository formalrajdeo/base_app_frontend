"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { UAParser } from "ua-parser-js"
import { Monitor, Smartphone, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Session } from "@/types/session"
import { authApi } from "@/lib/auth-api"

export function SessionManagement({
  sessions,
  currentSessionToken,
}: {
  sessions: Session[]
  currentSessionToken: string
}) {
  const router = useRouter()
  const otherSessions = sessions.filter(s => s.token !== currentSessionToken)
  const currentSession = sessions.find(s => s.token === currentSessionToken)

  async function revokeOtherSessions(): Promise<{
    error: { message?: string } | null
  }> {
    try {
      if (!currentSession?.userId) {
        const message = "User ID not found for current session"
        toast.error(message)
        return { error: { message } }
      }

      const { data: revokeAllSessionsForUser } = await authApi.post(
        "/auth/admin/revoke-user-sessions",
        {
          userId: currentSession.userId,
        }
      );

      if (!revokeAllSessionsForUser?.success) {
        return { error: { message: "Failed to revoke other sessions" } }
      }

      router.refresh()
      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to revoke other sessions"
      toast.error(message)
      return { error: { message } }
    }
  }

  return (
    <div className="space-y-6">
      {currentSession && <SessionCard session={currentSession} isCurrentSession />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Other Active Sessions</h3>
          {otherSessions.length > 0 && (
            <Button variant="destructive" size="sm" onClick={revokeOtherSessions}>
              Revoke Other Sessions
            </Button>
          )}
        </div>
        {otherSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No other active sessions
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {otherSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  isCurrentSession = false,
}: {
  session: Session
  isCurrentSession?: boolean
}) {
  const router = useRouter()
  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null

  function getBrowserInformation() {
    if (!userAgentInfo) return "Unknown Device"
    return (
      [userAgentInfo.browser.name, userAgentInfo.os.name].filter(Boolean).join(", ") ||
      "Unknown Device"
    )
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  async function revokeSession(): Promise<{
    error: { message?: string } | null
  }> {
    try {

      const { data: revokeSpecificSessionForUserRes } = await authApi.post(
        "/auth/admin/revoke-user-session",
        {
          sessionToken: session.token,
        }
      );

      if (!revokeSpecificSessionForUserRes?.success) {
        return { error: { message: "Failed to revoke session" } }
      }

      router.refresh()
      return { error: null }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to revoke session"
      toast.error(message)
      return { error: { message } }
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>{getBrowserInformation()}</CardTitle>
        {isCurrentSession && <Badge>Current Session</Badge>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAgentInfo?.device.type === "mobile" ? <Smartphone /> : <Monitor />}
            <div>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(session.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires: {formatDate(session.expiresAt)}
              </p>
            </div>
          </div>
          {!isCurrentSession && (
            <Button
              variant="destructive"
              size="sm"
              onClick={revokeSession}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
