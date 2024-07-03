import { IUser } from "@/libs/types/user";
import axiosInstance from "@/utils/httpRequest";
import { create } from "zustand";

interface AuthState {
    currentUser: null | IUser;
    setAuth: (user: IUser) => void;
    isAuthenticated: boolean;
    logout: () => Promise<boolean>;
}

const useAuthStore = create<AuthState>((set, get) => ({
    currentUser: null,
    isAuthenticated: false,
    setAuth: (user: IUser) => set((state) => ({ currentUser: user, isAuthenticated: true })),
    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout");

            return res.status === 200;
        } catch (error) {
            console.log("error: ", error);
            return false;
        }
    },
}));

export default useAuthStore;
