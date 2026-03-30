"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Users,
    ShieldCheck,
    Key,
    LayoutDashboard,
    Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { toast } from "sonner";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
    { name: "Permissions", href: "/dashboard/permissions", icon: Key },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // 🔥 Hooks first – never conditional
    const { data: sessionData, isLoading: sessionLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => (await authApi.get("/auth/get-session")).data,
    });

    const logout = useMutation({
        mutationFn: async () => authApi.post("/auth/sign-out"),
        onSuccess: () => {
            router.replace("/");
            toast.success("Logged out 👋");
        },
        onError: () => toast.error("Logout failed ❌"),
    });

    // 🔹 Conditional UI after hooks
    if (sessionLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading session...</p>
            </div>
        );
    }

    if (!sessionData?.session) {
        router.replace("/");
        return null;
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* 🔥 SIDEBAR */}
            <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
                <h2 className="text-xl font-semibold mb-6 tracking-tight">
                    Admin Panel
                </h2>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto text-xs text-muted-foreground">
                    © 2026 Admin
                </div>
            </aside>

            {/* 🔥 RIGHT SIDE */}
            <div className="flex flex-col flex-1">
                {/* 🔝 TOP BAR */}
                <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-background">
                    <h1 className="text-lg font-semibold">
                        {navItems.find((i) => pathname.startsWith(i.href))?.name ||
                            "Dashboard"}
                    </h1>

                    <div className="flex items-center gap-2">
                        <ModeToggle />

                        <Button
                            variant="destructive"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                        >
                            {logout.isPending ? "Logging out..." : "Logout"}
                        </Button>
                    </div>
                </header>

                {/* 🔥 CONTENT */}
                <main className="flex-1 overflow-y-auto p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}