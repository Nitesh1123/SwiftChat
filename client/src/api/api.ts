import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

let base = import.meta.env.VITE_API_BASE_URL as string;
if (base && !base.endsWith('/api')) {
    base = base.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: base,
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
