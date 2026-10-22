import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Same-origin on purpose: vercel.json (prod) and the Vite dev proxy forward
// /api to the backend. Calling the backend's own domain directly makes the
// auth cookies third-party, and most browsers now refuse to store or send them.
const api = axios.create({
    baseURL: "/api",
    withCredentials: true
})

// The access token cookie lives 15 minutes. When a request is rejected for an
// expired token, refresh once (shared across concurrent requests) and retry.
const NO_RETRY = ["/auth/login", "/auth/register", "/auth/refresh-token"];
let refreshing: Promise<unknown> | null = null;

api.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    if (
        !config ||
        config._retried ||
        (status !== 401 && status !== 403) ||
        NO_RETRY.some((path) => config.url?.endsWith(path))
    ) {
        return Promise.reject(error);
    }

    config._retried = true;
    try {
        refreshing ??= api.post("/auth/refresh-token").finally(() => {
            refreshing = null;
        });
        await refreshing;
    } catch {
        return Promise.reject(error);
    }
    return api(config);
});

export default api;
