import type { CSSProperties } from "react";
import ChatItem from "./ChatItem";
import "@/styles.css";
import { useConversation } from "@/context/useConversation";

interface ChatItemsProps {
  onChatSelect?: () => void;
}

const ChatItems = ({ onChatSelect }: ChatItemsProps) => {
  const { conversations, selectedConversation, setSelectedConversation } = useConversation();

  const handleChatClick = (convo: typeof conversations[0]) => {
    setSelectedConversation(convo);
    onChatSelect?.();
  };

  if (conversations.length === 0) {
    return (
      <div className="reveal flex flex-col items-center px-6 pt-14 text-center" style={{ "--base": "300ms" } as CSSProperties}>
        <p className="font-display text-2xl italic text-paper-dim">A quiet line.</p>
        <p className="mt-2 text-sm text-paper-faint">Tap the + to start your first conversation.</p>
      </div>
    );
  }

  return (
    <div className="chat-items flex flex-col gap-1 h-full w-full overflow-y-scroll scrollbar-hidden">
      {conversations.map((convo, index) => (
        <ChatItem
          key={convo._id}
          index={index}
          conversation={convo}
          isActive={selectedConversation?._id === convo._id}
          onClick={() => handleChatClick(convo)}
        />
      ))}
    </div>
  );
};

export default ChatItems;
