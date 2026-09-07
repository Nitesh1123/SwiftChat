import axios from "axios";

let base = import.meta.env.VITE_API_BASE_URL as string;
if (base && !base.endsWith('/api')) {
    base = base.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: base,
    withCredentials: true
})

export default api;
