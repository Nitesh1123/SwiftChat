import EmptyMessages from "./EmptyMessages";
import { useConversation } from "@/context/useConversation";
import { useUser } from "@/context/useUser";
import ChatMessage from "./ChatMessage";
import { fetchMessages } from "@/api/messages";
import { useEffect, useState, useRef } from "react";

const MessagesArea = () => {
  const { selectedConversation, messages, setMessages } = useConversation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmpty = !selectedConversation?.lastMessage && messages.length === 0;

  useEffect(() => {
    if (!selectedConversation?._id) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await fetchMessages({
          conversationId: selectedConversation._id,
        });
        setMessages(data);
        // Scroll to bottom after messages load
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        }, 100);
      } catch (err) {
        console.log("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [selectedConversation?._id, setMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && !loading) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, loading]);

  return (
    <div className={`flex-1 flex flex-col ${isEmpty ? "justify-center items-center" : ""} overflow-y-auto thin-scroll`}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <span className="typing-dots inline-flex gap-1"><span /> <span /> <span /></span>
            <span className="eyebrow">Loading messages...</span>
          </div>
        </div>
      ) : (isEmpty ? (
        <EmptyMessages />
      ) : (
        <div className="mx-auto mt-auto flex flex-col gap-2 px-3 sm:px-6 py-4 sm:py-6 w-full max-w-4xl">
          {messages.map((msg) => (
            <ChatMessage
              key={(msg as any)._id}
              content={msg.content}
              isOwn={msg.sender === (user?.id || user?._id)}
              createdAt={msg.createdAt}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      ))}
    </div>
  );
};

export default MessagesArea;
