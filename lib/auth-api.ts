import axios from "axios";
import { toast } from "sonner";

export const authApi = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            toast.error("You don't have permission to access this resource.");

            // Optional: logout API call
            try {
                await authApi.post("/auth/sign-out", { callbackURL: "/login" }, { withCredentials: true });
            } catch { }

            // Force redirect
            window.location.href = "/?error=unauthorized";
        }

        return Promise.reject(error);
    }
);