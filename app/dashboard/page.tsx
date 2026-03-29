"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DashboardPage() {
    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users")).data,
    });

    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
    });

    const { data: resources = [] } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => (await api.get("/resources")).data,
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => (await api.get("/permissions")).data,
    });

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