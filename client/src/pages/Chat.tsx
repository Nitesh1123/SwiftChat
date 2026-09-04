import {fetchConversations} from "@/api/conversations";
import ChatArea from "@/components/chat/ChatArea";
import ChatList from "@/components/chat/ChatList";
import Sidebar from "@/components/chat/Sidebar";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import UsernameDialog from "@/components/chat/UsernameDialog";
import {useUser} from "@/context/useUser";
import "@/styles.css";
import {useEffect, useState} from "react";
import {useConversation} from "@/context/useConversation.ts";

type TabType = "chats" | "groups" | "status" | "settings";

const Chat = () => {
    const {setConversations, selectedConversation, setSelectedConversation} = useConversation();
    const {user} = useUser();
    const [activeTab, setActiveTab] = useState<TabType>("chats");
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);

    useEffect(() => {
        fetchConversations().then(setConversations).catch((error) => {
            console.error("Failed to fetch conversations...", error);
        });
    }, [setConversations]);

    // Auto-open username dialog on first login if username is not set
    useEffect(() => {
        const askSetUsername = !!user && !user.username;
        if (askSetUsername && !usernameDialogOpen) {
            setUsernameDialogOpen(true);
        }
    }, [user, usernameDialogOpen]);

    useEffect(() => {
    }, []);

    // Handle mobile chat open/close
    useEffect(() => {
        // Only handle chat open/close when on chats tab
        if (activeTab === "chats") {
            if (selectedConversation) {
                setIsMobileChatOpen(true);
                // Lock body scroll when chat is open on mobile
                document.body.style.overflow = "hidden";
            } else {
                setIsMobileChatOpen(false);
                // Unlock body scroll when chat list is shown
                document.body.style.overflow = "";
            }
        } else {
            // Close chat when switching to other tabs
            setIsMobileChatOpen(false);
            setSelectedConversation(null);
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedConversation, activeTab, setSelectedConversation]);

    const handleBackToChatList = () => {
        setSelectedConversation(null);
        setIsMobileChatOpen(false);
    };

    return (
        <div className="main relative h-screen w-screen overflow-hidden">
            {/* Username Dialog - Show globally when username is not set */}
            <UsernameDialog open={usernameDialogOpen} setOpen={setUsernameDialogOpen} />
            
            {/* Desktop Layout (≥1024px) */}
            <div className="hidden lg:grid lg:grid-cols-[60px_1fr] h-full">
                <Sidebar/>
                <div className="chat flex overflow-hidden w-full h-full">
                    <ChatList/>
                    <ChatArea/>
                </div>
            </div>

            {/* Mobile/Tablet Layout (<1024px) */}
            <div className="lg:hidden flex flex-col h-full pb-16 safe-area-bottom">
                {/* Chats Tab Content */}
                {activeTab === "chats" && (
                    <>
                        {/* Chat List View */}
                        <div
                            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                                isMobileChatOpen ? "-translate-x-full" : "translate-x-0"
                            } flex flex-col bg-primary z-10`}
                        >
                            <ChatList onChatSelect={() => setIsMobileChatOpen(true)}/>
                        </div>

                        {/* Chat Area View */}
                        <div
                            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                                isMobileChatOpen ? "translate-x-0" : "translate-x-full"
                            } flex flex-col bg-primary z-20`}
                        >
                            <ChatArea onBack={handleBackToChatList}/>
                        </div>
                    </>
                )}

                {/* Groups Tab Content (Stub) */}
                {activeTab === "groups" && (
                    <div className="flex items-center justify-center h-full bg-primary">
                        <div className="text-center">
                            <p className="text-white/70">Groups feature coming soon</p>
                        </div>
                    </div>
                )}

                {/* Status Tab Content (Stub) */}
                {activeTab === "status" && (
                    <div className="flex items-center justify-center h-full bg-primary">
                        <div className="text-center">
                            <p className="text-white/70">Status feature coming soon</p>
                        </div>
                    </div>
                )}

                {/* Settings Tab Content (Stub) */}
                {activeTab === "settings" && (
                    <div className="flex items-center justify-center h-full bg-primary">
                        <div className="text-center">
                            <p className="text-white/70">Settings feature coming soon</p>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation - Hide when chat is open on mobile */}
                {!isMobileChatOpen && (
                    <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab}/>
                )}
            </div>
        </div>
    );
};

export default Chat;
