"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/users", label: "Users" },
        { href: "/dashboard/roles", label: "Roles" },
        { href: "/dashboard/permissions", label: "Permissions" },
    ];

    return (
        <aside className="w-64 border-r bg-background p-6">
            <h1 className="text-2xl font-bold mb-6">⚡ Admin</h1>

            <nav className="space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition",
                            pathname === link.href
                                ? "bg-primary text-white"
                                : "hover:bg-muted"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
