"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    // Always call hooks
    const { data: sessionData, isLoading: sessionLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => (await authApi.get("/auth/get-session")).data,
    });

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users")).data,
        enabled: !!sessionData, // only fetch when session exists
    });

    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
        enabled: !!sessionData,
    });

    const { data: resources = [] } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => (await api.get("/resources")).data,
        enabled: !!sessionData,
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => (await api.get("/permissions")).data?.data,
        enabled: !!sessionData,
    });

    // Redirect if not logged in
    if (!sessionLoading && !sessionData?.session) {
        router.push("/"); // redirect to login
        return null;
    }

    if (sessionLoading) return (<div className="flex flex-col items-center justify-center py-10 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading session...</p>
    </div>);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-3 gap-4">
                <Card title="Users" value={users.length} />
                <Card title="Roles" value={roles.length} />
                <Card title="Permissions" value={permissions.length} />
                <Card title="Resources" value={resources.length} />
            </div>
        </div>
    );
}

function Card({ title, value }: any) {
    return (
        <div className="border rounded-xl p-4">
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}