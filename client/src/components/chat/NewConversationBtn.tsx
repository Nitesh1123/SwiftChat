import { Plus } from "lucide-react";
import { useState } from "react";
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
                className="absolute bottom-20 lg:bottom-4 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
                aria-label="Start new conversation"
            >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
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
