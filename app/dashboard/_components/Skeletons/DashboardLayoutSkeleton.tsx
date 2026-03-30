"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
            <Card className="w-[320px] shadow-lg border border-border backdrop-blur">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-10">

                    {/* Spinner */}
                    <div className="relative">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            Loading session
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Please wait while we prepare your dashboard...
                        </p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}