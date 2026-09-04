import api from "./api"

export const fetchConversations = async () => {
    const res = await api.get('/conversations');
    return res.data.conversations;
}

export const createConversation = async (otherUserId: string) => {
    const res = await api.get(`/conversations/dm/${otherUserId}`)
    return res.data.conversation;
}