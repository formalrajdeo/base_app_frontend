import axios from "axios";
import { toast } from "sonner";
import { authApi } from "./auth-api";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
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