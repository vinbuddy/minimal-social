import { jwtDecode } from "jwt-decode";
import axiosInstance from "./httpRequest";

export function getTokenExpire(jwtToken: string): number | null {
    try {
        const decoded = jwtDecode(jwtToken) as { exp?: number };
        return decoded.exp ? decoded.exp * 1000 : null; // Chuyển đổi từ giây sang milliseconds
    } catch (err) {
        console.error("Invalid token", err);
        return null;
    }
}

// export async function refreshAccessToken(
//     onSuccess: (accessToken: string, refreshToken: string) => void
// ): Promise<void> {
//     try {
//         const response = await axiosInstance.post("/auth/refresh");

//         if (response.status == 200) {
//             onSuccess(response.data?.accessToken, response.data?.refreshToken);

//             console.log("Token refreshed: " + response.data?.accessToken);
//         }
//     } catch (error) {}
// }

interface IRefreshTokenResponse {
    newAccessToken?: string;
    newRefreshToken?: string;
}

export async function refreshAccessToken(): Promise<IRefreshTokenResponse> {
    try {
        // const response = await axiosInstance.post("/auth/refresh");
        // if (response.status == 200) {
        //     return {
        //         newAccessToken: response.data.accessToken,
        //         newRefreshToken: response.data.refreshToken,
        //     };
        // }
    } catch (error) {}

    return {};
}
