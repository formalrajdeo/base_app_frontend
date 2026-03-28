"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Users,
    ShieldCheck,
    Key,
    FileText,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users")).data,
    });

    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data,
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => (await api.get("/permissions")).data,
    });

    const { data: posts = [] } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => (await api.get("/posts")).data,
    });

    const stats = [
        { title: "Users", value: users.length, icon: Users },
        { title: "Roles", value: roles.length, icon: ShieldCheck },
        { title: "Permissions", value: permissions.length, icon: Key },
        { title: "Posts", value: posts.length, icon: FileText },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* 🔥 HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your system efficiently
                    </p>
                </div>

                {/* 🔥 QUICK ACTION */}
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New User
                </Button>
            </div>

            {/* 🔥 STATS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row justify-between pb-2">
                                <CardTitle className="text-sm">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 🔥 SYSTEM OVERVIEW */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {users.slice(0, 5).map((u: any) => (
                            <div
                                key={u.id}
                                className="flex justify-between text-sm"
                            >
                                <span>{u.name}</span>
                                <span className="text-muted-foreground">
                                    {u.roles?.length || 0} roles
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Roles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Roles Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {roles.map((r: any) => (
                            <div
                                key={r.id}
                                className="flex justify-between text-sm"
                            >
                                <span>{r.name}</span>
                                <span className="text-muted-foreground">
                                    role
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* 🔥 SYSTEM RELATION VISUAL */}
            <Card>
                <CardHeader>
                    <CardTitle>Access Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="p-3 rounded-lg bg-muted">Users</div>
                        <span>→</span>
                        <div className="p-3 rounded-lg bg-muted">Roles</div>
                        <span>→</span>
                        <div className="p-3 rounded-lg bg-muted">
                            Permissions
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}