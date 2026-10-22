import { useEffect, useState, type CSSProperties } from "react";
import { Search, X } from "lucide-react";
import type { User } from "@/types/auth.types";
import { fetchSearchedUsers } from "@/api/user";
import { useDebounce } from "@/utils/debounceHook";
import Avatar from "./Avatar";

export interface NewConversationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStartConversation: (user: User) => void;
}

const NewConversationDialog = ({
    isOpen,
    onClose,
    onStartConversation,
}: NewConversationDialogProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(searchQuery);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const users = await fetchSearchedUsers(debouncedQuery);
                setUsers(users);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [debouncedQuery, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="dialog-backdrop fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-conversation-title"
                className="dialog-panel w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <p className="eyebrow">Start a thread</p>
                        <h2 id="new-conversation-title" className="mt-1.5 font-display text-[2rem] leading-none">
                            New Conversation
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rail-btn -mr-2 -mt-1"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pb-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-faint" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input !h-11"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="ink-rule mx-6" style={{ "--base": "150ms" } as CSSProperties} />

                {/* User List */}
                <div className="max-h-[55vh] sm:max-h-96 overflow-y-auto thin-scroll px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {loading && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <span className="typing-dots inline-flex gap-1"><span /> <span /> <span /></span>
                            <span className="eyebrow">Searching...</span>
                        </div>
                    )}

                    {!loading && users.length === 0 && (
                        <div className="text-center py-8">
                            <p className="font-display text-xl italic text-paper-dim">No users found</p>
                        </div>
                    )}

                    {!loading &&
                        users.map((user, i) => (
                            <button
                                key={user.id || user._id}
                                onClick={() => onStartConversation(user)}
                                className="chat-item group reveal-x w-full flex items-center gap-3 text-left"
                                style={{ "--i": Math.min(i, 10) } as CSSProperties}
                            >
                                <Avatar name={user.name} src={user.avatar} size={42} online={user.isOnline} />
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium">
                                        {user.name}
                                    </div>
                                    <div className="truncate font-mono text-[11px] text-paper-faint">
                                        {user.username ? `@${user.username}` : ""}
                                    </div>
                                </div>
                                <span className="eyebrow !text-shu opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                    Message
                                </span>
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default NewConversationDialog;
