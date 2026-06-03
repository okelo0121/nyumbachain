import { create } from 'zustand';

export interface User {
    id: string;
    email: string;
    role: 'landlord' | 'tenant' | 'admin';
    full_name: string;
    phone?: string;
    stellar_wallet?: string;
    kyc_verified?: boolean;
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    setAccessToken: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    setAuth: (token, user) => set({ accessToken: token, user }),
    setAccessToken: (token) => set({ accessToken: token }),
    logout: () => set({ accessToken: null, user: null }),
}));