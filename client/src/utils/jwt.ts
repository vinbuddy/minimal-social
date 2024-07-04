import { jwtDecode } from "jwt-decode";

export function getTokenExpire(jwtToken: string): number | null {
    try {
        const decoded = jwtDecode(jwtToken) as { exp?: number };
        return decoded.exp ? decoded.exp * 1000 : null; // Chuyển đổi từ giây sang milliseconds
    } catch (err) {
        console.error("Invalid token", err);
        return null;
    }
}
