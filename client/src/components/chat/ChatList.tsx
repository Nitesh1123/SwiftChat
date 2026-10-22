import type { CSSProperties } from "react";
import "@/styles.css";
import { Search } from "lucide-react";
import ChatItems from "./ChatItems";
import NewConversationBtn from "@/components/chat/NewConversationBtn";
import Seal from "@/components/brand/Seal";
import { useConversation } from "@/context/useConversation";

interface ChatListProps {
    onChatSelect?: () => void;
}

const ChatList = ({ onChatSelect }: ChatListProps) => {
    const { conversations } = useConversation();
    const unread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <div className="chat-list flex flex-col w-full lg:w-[340px] lg:shrink-0 h-full px-3 pt-5 gap-4 relative pb-20 lg:pb-5">

            <header className="flex items-end justify-between px-2">
                <div className="flex items-center gap-3">
                    <span className="lg:hidden"><Seal size={30} /></span>
                    <h1 className="reveal font-display text-[2.25rem] leading-none tracking-tight">Messages</h1>
                </div>
                <span className="reveal eyebrow pb-1" style={{ "--i": 1 } as CSSProperties}>
                    {unread > 0 ? `${unread} unread` : `${conversations.length} threads`}
                </span>
            </header>

            <div className="relative px-1 reveal" style={{ "--i": 2 } as CSSProperties}>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search chats..."
                />
            </div>

            <div className="ink-rule mx-2" style={{ "--base": "200ms" } as CSSProperties} />

            <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
                <ChatItems onChatSelect={onChatSelect} />
            </div>

            <NewConversationBtn />
        </div>
    );
};

export default ChatList;
