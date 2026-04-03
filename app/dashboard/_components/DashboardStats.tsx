"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Lock } from "lucide-react";

export function DashboardStats() {
    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                const res = await api.get("/users");
                return res.data || [];
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const rolesQuery = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            try {
                const res = await api.get("/roles");
                return res.data || [];
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const permissionsQuery = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            try {
                const res = await api.get("/permissions");
                return res.data.data || [];
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    const resourcesQuery = useQuery({
        queryKey: ["resources"],
        queryFn: async () => {
            try {
                const res = await api.get("/resources");
                return res.data || [];
            } catch (err: any) {
                if (err.response?.status === 403) return null;
                throw err;
            }
        },
    });

    return (
        <div className="w-full bg-background text-foreground">
            <div
                className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          xl:grid-cols-4
        "
            >
                <StatCard
                    title="Users"
                    data={usersQuery.data}
                    isLoading={usersQuery.isLoading}
                />
                <StatCard
                    title="Roles"
                    data={rolesQuery.data}
                    isLoading={rolesQuery.isLoading}
                />
                <StatCard
                    title="Permissions"
                    data={permissionsQuery.data}
                    isLoading={permissionsQuery.isLoading}
                />
                <StatCard
                    title="Resources"
                    data={resourcesQuery.data}
                    isLoading={resourcesQuery.isLoading}
                />
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    data?: any[] | null;
    isLoading?: boolean;
}

export function StatCard({ title, data, isLoading }: StatCardProps) {
    const isForbidden = data === null;

    return (
        <div
            className="
        rounded-xl border border-border bg-card text-card-foreground 
        p-4 shadow-sm transition-all hover:shadow-md 
        h-24 flex flex-col justify-center
      "
        >
            {/* Title */}
            <div className="text-sm text-muted-foreground mb-1">{title}</div>

            <div className="flex items-center h-10 gap-2">
                {isLoading ? (
                    <>
                        <span className="text-2xl font-bold opacity-0">0</span>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </>
                ) : isForbidden ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <Lock className="h-4 w-4" />
                        No Access
                    </div>
                ) : (
                    <span className="text-2xl font-bold">
                        {data?.length ?? 0}
                    </span>
                )}
            </div>
        </div>
    );
}