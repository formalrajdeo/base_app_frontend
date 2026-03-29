// C:\Users\HP\OneDrive\Desktop\rajdeo\base_app\base_app_frontend\app\dashboard\layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    ShieldCheck,
    Key,
    LayoutDashboard,
    Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Users",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        name: "Roles",
        href: "/dashboard/roles",
        icon: ShieldCheck,
    },
    {
        name: "Permissions",
        href: "/dashboard/permissions",
        icon: Key,
    }
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen">
            {/* 🔥 SIDEBAR */}
            <aside className="w-64 border-r bg-muted/40 p-4">
                <h2 className="text-xl font-bold mb-6">
                    Admin Panel
                </h2>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "hover:bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* 🔥 MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}