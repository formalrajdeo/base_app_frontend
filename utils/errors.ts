// utils/errors.ts (or inside your page.tsx above mutations)
import { ZodError } from "zod";

export function getErrorMessage(err: unknown): string {
    // Handle Zod errors
    if (err instanceof ZodError) {
        return err.issues
            .map(issue => {
                const field = issue.path.length ? issue.path.join(".") : "Field";
                return `${field}: ${issue.message ?? "Invalid value"}`;
            })
            .join(", ");
    }

    // Handle Axios / API errors
    if (err && typeof err === "object") {
        const maybeAxiosErr = err as { response?: { data?: { message?: string } } };
        if (maybeAxiosErr.response?.data?.message) {
            return maybeAxiosErr.response.data.message;
        }
    }

    // Fallback
    return err instanceof Error ? err.message : "Something went wrong";
}