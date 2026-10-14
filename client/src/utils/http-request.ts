import { ENV } from "@/config/env";
import axios from "axios";

export async function fetchData(url: string, options: RequestInit = {}) {
    const response = await fetch(ENV.API_BASE_URL + url, options);
    return await response.json();
}

const axiosInstance = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // Send cookies when cross-origin requests
});

// Share one in-flight refresh between concurrent 401s: the server rotates the refresh
// token on each call, so parallel refreshes would invalidate each other
let refreshPromise: Promise<unknown> | null = null;

export function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(ENV.API_BASE_URL + "/auth/refresh", {}, { withCredentials: true })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

// Response Interceptor: Handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 (Unauthorized) and request hasn't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            await refreshAccessToken();

            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export function fetcher(url: string) {
    return axiosInstance.get(url).then((res) => res.data);
}

export default axiosInstance;
