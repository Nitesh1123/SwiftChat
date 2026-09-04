interface ChatMessageProp {
  content: string;
  isOwn: boolean;
}

const ChatMessage = ({ content, isOwn }: ChatMessageProp) => {
  return (
    <div
      className={`flex w-full ${
        isOwn ? "justify-end pl-8 sm:pl-12 lg:pl-16" : "justify-start pr-8 sm:pr-12 lg:pr-16"
      }`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[65%] px-3 py-2 rounded-2xl text-sm break-words shadow-sm ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-[#252A31] text-[#E5E7EB] rounded-bl-md border border-[#30363D]"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
