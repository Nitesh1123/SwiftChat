import { sendMessage } from "@/api/messages";
import { useConversation } from "@/context/useConversation";
import { useState } from "react";
import { toast } from "sonner";
import { SendHorizontal } from "lucide-react";

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
            className={`sticky bottom-0 w-full px-3 sm:px-6 pt-3 z-30 border-t border-paper/[0.06] bg-ink-1/60 backdrop-blur-md lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none send-message-container`}
        >
            <div className="composer mx-auto flex max-w-4xl items-center gap-2 p-1.5 pl-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-paper placeholder:text-paper-faint outline-none"
                    placeholder="Type a message..."
                />
                <button
                    onClick={handleSend}
                    className="btn-shu h-10 w-10 shrink-0 !rounded-[11px] sm:w-auto sm:px-4"
                    disabled={!message.trim()}
                    aria-label="Send"
                >
                    <span className="hidden sm:inline text-sm">Send</span>
                    <SendHorizontal size={17} strokeWidth={2.2} />
                </button>
            </div>
            <p className="mx-auto mt-2 hidden max-w-4xl px-1 font-mono text-[10px] tracking-wide text-paper-faint lg:block">
                Enter to send
            </p>
        </div>
    );
};

export default SendMessage;
