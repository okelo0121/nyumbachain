/**
 * Axios instance — single configured HTTP client.
 * - Reads access token from Zustand (in-memory) — NEVER localStorage.
 * - Refresh token handled by backend via HttpOnly cookie.
 * - 401 → auto-refresh once, retry original request.
 */
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // send HttpOnly refresh cookie
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token from memory store
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status !== 401 || original._retry || original.url?.includes('/auth/')) {
            return Promise.reject(error);
        }
        if (isRefreshing) {
            return new Promise((resolve) => {
                pendingQueue.push((token) => {
                    original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
                    resolve(api(original));
                });
            });
        }
        original._retry = true;
        isRefreshing = true;
        try {
            const res = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
            const newToken = (res.data as { accessToken: string }).accessToken;
            useAuthStore.getState().setAccessToken(newToken);
            pendingQueue.forEach((cb) => cb(newToken));
            pendingQueue = [];
            original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
            return api(original);
        } catch (refreshErr) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    },
);
