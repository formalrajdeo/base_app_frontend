"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

export function Topbar({ logout, title }: { logout: any; title: string }) {
    return (
        <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-background">
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Button variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}>
                    {logout.isPending ? "Logging out..." : "Logout"}
                </Button>
            </div>
        </header>
    );
}