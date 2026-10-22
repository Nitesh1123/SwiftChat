interface ChatMessageProp {
  content: string;
  isOwn: boolean;
  createdAt?: string;
}

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatMessage = ({ content, isOwn, createdAt }: ChatMessageProp) => {
  const time = formatTime(createdAt);
  return (
    <div
      className={`msg-in flex w-full ${
        isOwn ? "justify-end pl-10 sm:pl-16 lg:pl-24" : "justify-start pr-10 sm:pr-16 lg:pr-24"
      }`}
    >
      <div className={`bubble max-w-[85%] sm:max-w-[72%] lg:max-w-[62%] ${isOwn ? "bubble-own" : "bubble-other"}`}>
        <p className="whitespace-pre-wrap">{content}</p>
        {time && (
          <span
            className={`mt-0.5 block text-right font-mono text-[10px] tracking-wide ${
              isOwn ? "text-white/65" : "text-paper-faint"
            }`}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
