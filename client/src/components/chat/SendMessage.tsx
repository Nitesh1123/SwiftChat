import { sendMessage } from "@/api/messages";
import { useConversation } from "@/context/useConversation";
import { useState } from "react";
import { toast } from "sonner";

const SendMessage = () => {

    const { selectedConversation } = useConversation();
    const [message, setMessage] = useState("");
    const handleSend = async () => {
        if (!message.trim()) {
            return toast.error("Cannot send empty message.");
        }
        if (!selectedConversation?._id) {
            toast.error("Select a conversation first.");
            return;
        }
        try {
            await sendMessage({
                conversationId: selectedConversation._id,
                content: message,
            });
            setMessage("");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : null;

            toast.error(
                errorMessage
                    ? `Failed to send message: ${errorMessage}`
                    : "Failed to send message."
            );

            console.error("Failed to send message", err);
        }
    };

    return (
        <div
            className={`sticky bottom-0 w-full flex gap-2 items-center justify-center min-h-[80px] px-4 py-4 bg-primary z-30 border-t border-[rgba(255,255,255,0.08)] lg:border-t-0 send-message-container`}
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="max-w-3xl w-full bg-[#252A31] text-[#E5E7EB] placeholder-[#8B95A7] border border-[#30363D] rounded-lg
    px-3 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Type a message..."
            />
            <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg
            hover:bg-blue-600/90 transition disabled:opacity-50 whitespace-nowrap"
                disabled={!message.trim()}
            >
                Send
            </button>
        </div>
    );
};

export default SendMessage;
