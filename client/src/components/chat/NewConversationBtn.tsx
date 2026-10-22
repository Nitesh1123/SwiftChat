import { Plus } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { User } from "@/types/auth.types";
import NewConversationDialog from "./NewConversationDialog";
import { createConversation } from "@/api/conversations.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@/context/useConversation.ts";

const NewConversationBtn = () => {
    const [isOpen, setOpen] = useState(false);
    const navigate = useNavigate();
    const { addConversation, setSelectedConversation } = useConversation();

    const handleStartConversation = async (user: User) => {

        try {
            const otherUserId = (user.id || user._id) as string;
            const conversation = await createConversation(otherUserId);
            if (!conversation) {
                setOpen(false);
                return toast.error("Unable to start conversation. Please try again later.");
            }
            addConversation(conversation);
            setSelectedConversation(conversation)
            navigate("/chat");
            setOpen(false);
        } catch (error: any) {
            toast.error("Unable to start conversation. Please try again later.");
            console.error(error.message);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn-shu reveal absolute bottom-20 lg:bottom-5 right-5 h-14 w-14 !rounded-2xl z-40 lg:h-12 lg:w-auto lg:px-5"
                style={{ "--base": "700ms" } as CSSProperties}
                aria-label="Start new conversation"
            >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden lg:inline">New chat</span>
            </button>

            <NewConversationDialog
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                onStartConversation={handleStartConversation}
            />
        </>
    );
};

export default NewConversationBtn;
