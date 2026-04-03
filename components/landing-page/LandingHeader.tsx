"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";

export function LandingHeader() {
    const { data: sessionData, isLoading } = useSession();
    const isLoggedIn = !!sessionData?.session;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
                <Link href="/" className="font-bold text-xl tracking-tight">
                    RBAC SaaS
                </Link>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : isLoggedIn ? (
                        <Link href="/dashboard" passHref>
                            <Button>Go to Dashboard</Button>
                        </Link>
                    ) : (
                        <Link href="/auth/login" passHref>
                            <Button variant="default">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}