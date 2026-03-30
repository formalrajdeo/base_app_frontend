import { Suspense } from "react";
import { DashboardStats } from "./_components/DashboardStats";
import { DashboardStatsSkeleton } from "./_components/Skeletons/DashboardStatsSkeleton";
export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardStatsSkeleton />}>
            <DashboardStats />
        </Suspense>
    );
}