import { socket } from "@/lib/socket";
import type { Conversation } from "@/types/conversation.types";
import type { MessageResponse } from "@/types/message.types";
import {
  createContext,
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

  // Registered once — uses ref to always read the latest selected conversation
  useEffect(() => {
    const handleNewMessage = (message: MessageResponse) => {
      if (message.conversationId !== selectedConversationRef.current?._id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, []); // ✅ empty deps — registers exactly once, no re-registration on conversation switch

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
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export default ConversationProvider;