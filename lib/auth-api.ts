import axios from "axios";
import { toast } from "sonner";

export const authApi = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

// authApi.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const status = error.response?.status;
//         const url = error.config?.url || "";

//         if (status === 403) {

//             toast.error("You don't have permission to access this resource.");

//             try {
//                 await authApi.post("/auth/sign-out", { callbackURL: "/login" }, { withCredentials: true });
//             } catch { }

//             window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/?error=unauthorized`;
//         }

//         return Promise.reject(error);
//     }
// );