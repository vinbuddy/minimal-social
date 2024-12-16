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

// Before sending a request, do something with it
axiosInstance.interceptors.request.use(
    (config) => {
        if (process.env.NEXT_PUBLIC_BASED_AUTH == "bearer-token") {
            // const token = localStorage.getItem("accessToken");
            const token = useAuthStore.getState().accessToken;
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function fetcher(url: string) {
    return axiosInstance.get(url).then((res) => res.data);
}

// // Response interceptor
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error: AxiosError) => {
//         const originalRequest = error.config;

//         if (error.response && error.response.status === 401 && originalRequest) {
//             try {
//                 // Check if request has not cookie
//                 if (!originalRequest.withCredentials) {
//                     window.location.href = process.env.NEXT_PUBLIC_CLIENT_BASE_URL + "/login";
//                 }

//                 const result = await axiosInstance.post("/auth/refresh");

//                 if (process.env.NEXT_PUBLIC_BASED_AUTH == "bearer-token") {
//                     localStorage.setItem("accessToken", result.data?.accessToken);
//                     localStorage.setItem("refreshToken", result.data?.refreshToken);

//                     // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${result.data.accessToken}`;
//                     originalRequest.headers["Authorization"] = `Bearer ${result.data?.accessToken}`;
//                 }

//                 return axiosInstance(originalRequest);
//             } catch (error) {
//                 console.log("error refreshToken: ", error);
//                 // Redirect to login page
//                 window.location.href = process.env.NEXT_PUBLIC_CLIENT_BASE_URL + "/login";
//             }
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
