import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { User } from "@/types/auth.types";
import { fetchSearchedUsers } from "@/api/user";
import { useDebounce } from "@/utils/debounceHook";

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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">
                        New Conversation
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                        aria-label="Close dialog"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="max-h-96 overflow-y-auto px-2 pb-2">
                    {loading && (
                        <div className="text-center py-6 text-gray-400">
                            Searching...
                        </div>
                    )}

                    {!loading && users.length === 0 && (
                        <div className="text-center py-6 text-gray-400">
                            No users found
                        </div>
                    )}

                    {!loading &&
                        users.map((user) => (
                            <button
                                key={user.id || user._id}
                                onClick={() => onStartConversation(user)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg text-left"
                            >
                                <div
                                    className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                                    {user.avatar ?? "👤"}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium">
                                        {user.name}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        {user.username ? `@${user.username}` : ""}
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default NewConversationDialog;
