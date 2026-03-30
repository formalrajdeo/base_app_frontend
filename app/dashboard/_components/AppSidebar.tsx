"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Key,
    User,
    LogOut,
    Command,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/dashboard/users", icon: Users },
    { title: "Roles", url: "/dashboard/roles", icon: ShieldCheck },
    { title: "Permissions", url: "/dashboard/permissions", icon: Key },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                {/* 🔹 Header */}
                <div className="px-2 py-2 text-sm font-semibold tracking-tight p-2">
                    <div className="flex items-center gap-3">
                        <Command className="h-4 w-4 text-indigo-400" />
                        <span className="tracking-wide">Admin Panel</span>
                    </div>
                </div>

                {/* 🔹 Main Menu */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive =
                                    item.url === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.url);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url} className="flex items-center gap-2 w-full">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer (user section) */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Profile">
                            <User />
                            <span>Profile</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Logout">
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}