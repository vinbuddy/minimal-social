import http from "@/lib/http";
import { IUser } from "@/types/user";

/** Username search used by the mention picker */
export async function searchUsers(query: string) {
    const res = await http.get<{ data: IUser[] }>("/user/search", { params: { query } });
    return res.data.data;
}

export async function getUser(userId: string) {
    const res = await http.get<{ data: IUser }>(`/user/${userId}`);
    return res.data.data;
}
