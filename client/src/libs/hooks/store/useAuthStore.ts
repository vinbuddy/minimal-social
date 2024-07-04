import { IUser } from "@/libs/types/user";
import axiosInstance from "@/utils/httpRequest";
import { create } from "zustand";

interface AuthState {
    currentUser: null | IUser;
    setAuth: (user: IUser) => void;
    isAuthenticated: boolean;
    isLoaded: boolean;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
}

const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: undefined,
    refreshToken: undefined,
    currentUser: null,
    isAuthenticated: false,
    isLoaded: false,
    setAuth: (user: IUser) => set((state) => ({ currentUser: user, isAuthenticated: true })),
}));

export default useAuthStore;
