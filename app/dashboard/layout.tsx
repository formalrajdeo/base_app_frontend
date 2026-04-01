"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import { useSession } from "@/hooks/useSession";
import { authApi } from "@/lib/auth-api";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { DashboardLayoutSkeleton } from "./_components/Skeletons/DashboardLayoutSkeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: sessionData, isLoading } = useSession();

    // Logout mutation
    const logout = useMutation({
        mutationFn: () => authApi.post("/auth/sign-out"),
        onSuccess: () => {
            router.replace("/");
            toast.success("Logged out 👋");
        },
    });

    // Redirect based on authentication
    useEffect(() => {
        if (!isLoading) {
            if (!sessionData?.session) {
                // User is not logged in -> redirect to login page
                router.replace("/auth/login")
            }
        }
    }, [isLoading, sessionData, router])

    if (isLoading || !sessionData?.session) {
        return <DashboardLayoutSkeleton />;
    }

    return (
        <SidebarProvider>
            <TooltipProvider>
                <div className="flex min-h-screen w-full bg-background text-foreground">
                    {/* Sidebar */}
                    <AppSidebar />

                    {/* Main Content */}
                    <SidebarInset>
                        {/* Topbar */}
                        <header className="flex items-center justify-between border-b px-4 py-3 bg-card dark:bg-card/80">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger />
                                <h1 className="text-lg font-semibold">Dashboard</h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <ModeToggle />

                                <Button
                                    variant="destructive"
                                    onClick={() => logout.mutate()}
                                    disabled={logout.isPending}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    {logout.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {logout.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>

                        {/* Main */}
                        <main className="flex-1 p-4 md:p-6">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    );
}