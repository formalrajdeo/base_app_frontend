import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Not logged in
      window.location.href = "/auth/login";
    }

    if (status === 403) {
      // Logged in but not allowed
      toast.error("You are not authorized to perform this action 🚫");
    }

    return Promise.reject(error);
  }
);