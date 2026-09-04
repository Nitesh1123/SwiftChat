import api from "./api";

export const setUsername = async (username: string) => {
    const res = await api.post("/user/set-username", {username});
    return res.data.data;
}

export const fetchSearchedUsers = async (searchQuery: string) => {
    const res = await api.get(`/user/search?q=${encodeURIComponent(searchQuery)}`);
    return res.data.data;
}