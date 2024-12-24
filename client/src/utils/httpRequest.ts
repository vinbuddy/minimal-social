import { useAuthStore } from "@/hooks/store";
import axios from "axios";

export async function fetchData(url: string, options: RequestInit = {}) {
    const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + url, options);
    return await response.json();
}

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true, // Send cookies when cross-origin requests
});

// Response Interceptor: Handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 (Unauthorized) and request hasn't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/refresh", {}, { withCredentials: true });

            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export function fetcher(url: string) {
    return axiosInstance.get(url).then((res) => res.data);
}

export default axiosInstance;
