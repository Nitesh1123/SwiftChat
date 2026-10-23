import { fetchConversations } from "@/api/conversations";
import { socket } from "@/lib/socket";
import type { Conversation } from "@/types/conversation.types";
import type { MessageResponse } from "@/types/message.types";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface ConversationContextType {
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  messages: MessageResponse[];
  setMessages: Dispatch<SetStateAction<MessageResponse[]>>;
  receiveMessage: (message: MessageResponse) => void;
}

export const ConversationContext =
  createContext<ConversationContextType | null>(null);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedConversation, _setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const prevConversationIdRef = useRef<string | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;

  const setSelectedConversation = (conversation: Conversation | null) => {
    selectedConversationRef.current = conversation;
    _setSelectedConversation((prev) => {
      if (prev?._id === conversation?._id) return prev;
      setMessages([]);
      return conversation;
    });
  };

  const addConversation = (conversation: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c._id === conversation._id);
      if (exists) return prev;
      return [conversation, ...prev];
    });
  };

  useEffect(() => {
    if (!selectedConversation) return;

    const conversationId = selectedConversation._id;

    if (
      prevConversationIdRef.current &&
      prevConversationIdRef.current !== conversationId
    ) {
      socket.emit("conversation:leave", prevConversationIdRef.current);
    }

    socket.emit("conversation:join", conversationId);
    prevConversationIdRef.current = conversationId;

    return () => {
      socket.emit("conversation:leave", conversationId);
    };
  }, [selectedConversation]);

  // Single entry point for a message, whether it came back from our own send
  // request or arrived over the socket. Deduped by id, since both can happen.
  const receiveMessage = useCallback((message: MessageResponse) => {
    if (message.conversationId === selectedConversationRef.current?._id) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    // A message for a chat we don't have yet means someone just started one
    // with us; reload the list so it shows up (it arrives with this message
    // already as its preview).
    if (!conversationsRef.current.some((c) => c._id === message.conversationId)) {
      fetchConversations()
        .then(setConversations)
        .catch((error) => console.error("Failed to refresh conversations:", error));
      return;
    }

    // Keep the conversation list preview current and float it to the top.
    setConversations((prev) => {
      const index = prev.findIndex((c) => c._id === message.conversationId);
      if (index === -1 || prev[index].lastMessage?._id === message.id) return prev;
      const convo = prev[index];
      const sender =
        convo.participants.find((p) => p._id === message.sender) ??
        { _id: message.sender, name: "", avatar: "" };
      const updated: Conversation = {
        ...convo,
        lastMessage: { ...message, _id: message.id, sender },
        updatedAt: message.createdAt,
      };
      return [updated, ...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, []);

  // Registered once — receiveMessage reads the selected conversation from a ref
  useEffect(() => {
    socket.on("message:new", receiveMessage);

    // Rooms are per-connection on the server, so rejoin after any reconnect
    // (Render restarts, cold starts, flaky networks).
    const rejoin = () => {
      const id = selectedConversationRef.current?._id;
      if (id) socket.emit("conversation:join", id);
    };
    socket.on("connect", rejoin);

    return () => {
      socket.off("message:new", receiveMessage);
      socket.off("connect", rejoin);
    };
  }, [receiveMessage]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        addConversation,
        setConversations,
        selectedConversation,
        setSelectedConversation,
        messages,
        setMessages,
        receiveMessage,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export default ConversationProvider;