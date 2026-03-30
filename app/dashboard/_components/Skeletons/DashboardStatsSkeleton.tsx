"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-24 rounded-xl border border-border bg-card p-4">
                    <Skeleton className="h-4 w-20 mb-2 rounded-md" />
                    <Skeleton className="h-8 w-12 rounded-md" />
                </div>
            ))}
        </div>
    );
}