"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function DashboardStats() {
    const usersQuery = useSuspenseQuery({
        queryKey: ["users"],
        queryFn: async () => (await api.get("/users")).data || [],
    });

    const rolesQuery = useSuspenseQuery({
        queryKey: ["roles"],
        queryFn: async () => (await api.get("/roles")).data || [],
    });

    const permissionsQuery = useSuspenseQuery({
        queryKey: ["permissions"],
        queryFn: async () =>
            (await api.get("/permissions")).data.data || [],
    });

    const resourcesQuery = useSuspenseQuery({
        queryKey: ["resources"],
        queryFn: async () => (await api.get("/resources"))?.data || [],
    });

    return (
        <div className="w-full bg-background text-foreground">
            <div
                className="
          grid gap-4
          grid-cols-1        // mobile
          sm:grid-cols-2     // ≥640px
          md:grid-cols-3     // ≥768px
          xl:grid-cols-4     // ≥1280px
        "
            >
                <StatCard
                    title="Users"
                    value={usersQuery.data?.length}
                    isLoading={usersQuery.isFetching}
                />
                <StatCard
                    title="Roles"
                    value={rolesQuery.data?.length}
                    isLoading={rolesQuery.isFetching}
                />
                <StatCard
                    title="Permissions"
                    value={permissionsQuery.data?.length}
                    isLoading={permissionsQuery.isFetching}
                />
                <StatCard
                    title="Resources"
                    value={resourcesQuery.data?.length}
                    isLoading={resourcesQuery.isFetching}
                />
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value?: number;
    isLoading?: boolean;
}

export function StatCard({ title, value, isLoading }: StatCardProps) {
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

            {/* Value + spinner */}
            <div className="flex items-center h-10 gap-2">
                {isLoading ? (
                    <>
                        {/* Reserve space so layout doesn't jump */}
                        <span className="text-2xl font-bold leading-none opacity-0">0</span>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </>
                ) : (
                    <span
                        className="text-2xl font-bold leading-none transition-opacity opacity-100"
                    >
                        {value}
                    </span>
                )}
            </div>
        </div>
    );
}


