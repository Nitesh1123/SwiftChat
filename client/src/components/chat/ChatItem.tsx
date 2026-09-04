import { useUser } from "@/context/useUser";
import type { Conversation } from "@/types/conversation.types";

interface ChatItemProp {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}
const ChatItem = ({ conversation, isActive, onClick }: ChatItemProp) => {
  const fallbackAvatar = "/profile-placeholder.jpg";
  const isGroup = conversation.type === "group";
  const { user } = useUser();
  const loggedInUserId = user?.id || user?._id;
  const profileImg = isGroup
    ? "../public/profile-placeholder.jpg"
    : conversation.participants.find((p) => p._id !== loggedInUserId)?.avatar;
  const chatName = isGroup
    ? conversation.name
    : conversation.participants.find((p) => p._id !== loggedInUserId)?.name;
  const lastMessage = conversation.lastMessage?.content;
  const lastSender = conversation.lastMessage?.sender.name;
  return (
    <div
      role="button"
      tabIndex={0}
      className={`chat-item ${isActive ? "active" : ""
        } w-full h-[50px] flex items-center`}
      onClick={onClick}
    >
      <div className="chat-img h-[40px] w-[40px]  rounded-md">
        <img
          src={profileImg || fallbackAvatar}
          alt="profile-image"
          className="h-full w-full object-cover rounded-md"
        />
      </div>

      <div className="chat-info flex flex-col flex-1 min-w-0  pl-2 pr-2">
        <p>{chatName}</p>
        {lastMessage && (
          <p className="truncate text-sm tracking-tighter text-[#9aa4bf]">
            {lastSender}: {lastMessage}
          </p>
        )}
      </div>
      {conversation.unreadCount > 0 && (
        <div
          className="ml-2 flex h-5 min-w-[20px] items-center justify-center 
                  rounded-full bg-teal-500 px-1.5 text-xs font-medium text-white"
        >
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );
};

export default ChatItem;
