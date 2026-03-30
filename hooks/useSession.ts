"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { SessionResponse } from "@/types/session";

export function useSession() {
    return useQuery<SessionResponse>({
        queryKey: ["session"],
        queryFn: async () => (await authApi.get("/auth/get-session")).data,
        retry: false, // no infinite retries
    });
}