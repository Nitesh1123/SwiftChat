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

  return (
    <div className="chat-items flex flex-col gap-1 h-full w-full overflow-y-scroll scrollbar-hidden">
      {conversations.map((convo) => (
        <ChatItem
          key={convo._id}
          conversation={convo}
          isActive={selectedConversation?._id === convo._id}
          onClick={() => handleChatClick(convo)}
        />
      ))}
    </div>
  );
};

export default ChatItems;
