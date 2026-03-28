import axios from "axios";

export const authApi = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});