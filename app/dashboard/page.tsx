"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const { data: sessionData, isLoading: sessionLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => (await authApi.get("/auth/get-session")).data,
    });

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users")).data,
        enabled: !!sessionData?.session,
    });

    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
        enabled: !!sessionData?.session,
    });

    const { data: resources = [] } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => (await api.get("/resources")).data,
        enabled: !!sessionData?.session,
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () =>
            (await api.get("/permissions")).data?.data || [],
        enabled: !!sessionData?.session,
    });

    if (!sessionLoading && !sessionData?.session) {
        router.replace("/");
        return null;
    }

    if (sessionLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    Loading session...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
            {/* 📊 Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Users" value={users.length} />
                <StatCard title="Roles" value={roles.length} />
                <StatCard title="Permissions" value={permissions.length} />
                <StatCard title="Resources" value={resources.length} />
            </div>
        </div>
    );
}

// ✅ Dark mode friendly card
function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="
            rounded-xl border border-border 
            bg-card text-card-foreground 
            p-4 shadow-sm 
            transition-all hover:shadow-md
        ">
            <div className="text-sm text-muted-foreground">
                {title}
            </div>
            <div className="text-2xl font-bold">
                {value}
            </div>
        </div>
    );
}