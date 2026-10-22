import type { CSSProperties } from "react";
import { useUser } from "@/context/useUser";
import type { Conversation } from "@/types/conversation.types";
import Avatar from "./Avatar";

interface ChatItemProp {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  index?: number;
}

const formatStamp = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const ChatItem = ({ conversation, isActive, onClick, index = 0 }: ChatItemProp) => {
  const isGroup = conversation.type === "group";
  const { user } = useUser();
  const loggedInUserId = user?.id || user?._id;
  const profileImg = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== loggedInUserId)?.avatar;
  const chatName = isGroup
    ? conversation.name
    : conversation.participants.find((p) => p._id !== loggedInUserId)?.name;
  const lastMessage = conversation.lastMessage?.content;
  const lastSender = conversation.lastMessage?.sender.name;
  const hasUnread = conversation.unreadCount > 0;
  return (
    <div
      role="button"
      tabIndex={0}
      className={`chat-item reveal-x ${isActive ? "active" : ""} w-full flex items-center gap-3`}
      style={{ "--i": Math.min(index, 12), "--base": "300ms" } as CSSProperties}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <Avatar name={chatName || "?"} src={profileImg} size={44} />

      <div className="chat-info flex flex-col flex-1 min-w-0 gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`truncate text-[15px] ${hasUnread ? "font-semibold text-paper" : "font-medium text-paper/90"}`}>
            {chatName}
          </p>
          <span className={`shrink-0 font-mono text-[10.5px] ${hasUnread ? "text-shu" : "text-paper-faint"}`}>
            {formatStamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className={`truncate text-[13px] flex-1 ${hasUnread ? "text-paper-dim" : "text-paper-faint"}`}>
            {lastMessage ? (
              <>
                <span className="text-paper-dim">{lastSender}:</span> {lastMessage}
              </>
            ) : (
              <span className="italic">No messages yet</span>
            )}
          </p>
          {hasUnread && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-shu px-1.5 font-mono text-[11px] font-medium text-ink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
