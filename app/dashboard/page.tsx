import { Suspense } from "react";
import { DashboardStats } from "./_components/DashboardStats";
import { DashboardStatsSkeleton } from "./_components/Skeletons/DashboardStatsSkeleton";
import { ErrorBoundary } from "react-error-boundary";

export default function DashboardPage() {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 text-red-500">
                    You are not authorized to view this data 🚫
                </div>
            }
        >
            <DashboardStats />
        </ErrorBoundary>
    );
}