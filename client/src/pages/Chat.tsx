import {fetchConversations} from "@/api/conversations";
import ChatArea from "@/components/chat/ChatArea";
import ChatList from "@/components/chat/ChatList";
import Sidebar, {type DesktopView} from "@/components/chat/Sidebar";
import MobileBottomNav, {type TabType} from "@/components/chat/MobileBottomNav";
import UsernameDialog from "@/components/chat/UsernameDialog";
import Dashboard from "@/components/dashboard/Dashboard";
import {useUser} from "@/context/useUser";
import "@/styles.css";
import {useEffect, useState} from "react";
import {useConversation} from "@/context/useConversation.ts";

const Chat = () => {
    const {conversations, setConversations, selectedConversation, setSelectedConversation} = useConversation();
    const {user} = useUser();
    const [activeTab, setActiveTab] = useState<TabType>("chats");
    const [desktopView, setDesktopView] = useState<DesktopView>("chats");
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

    // Jump from the dashboard straight into a conversation.
    const openConversation = async (conversationId: string) => {
        let list = conversations;
        if (!list.some((c) => c._id === conversationId)) {
            list = await fetchConversations().catch(() => list);
            setConversations(list);
        }
        const target = list.find((c) => c._id === conversationId);
        if (!target) return;
        setSelectedConversation(target);
        setDesktopView("chats");
        setActiveTab("chats");
    };

    return (
        <div className="main atmosphere relative h-dvh w-screen overflow-hidden">
            {/* Username Dialog - Show globally when username is not set */}
            <UsernameDialog open={usernameDialogOpen} setOpen={setUsernameDialogOpen} />
            
            {/* Desktop Layout (≥1024px) */}
            <div className="hidden lg:grid lg:grid-cols-[76px_1fr] h-full">
                <Sidebar view={desktopView} onViewChange={setDesktopView}/>
                {desktopView === "overview" ? (
                    <Dashboard onOpenConversation={openConversation}/>
                ) : (
                    <div className="chat flex overflow-hidden w-full h-full">
                        <ChatList/>
                        <ChatArea/>
                    </div>
                )}
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
                            } flex flex-col bg-ink-1 z-10`}
                        >
                            <ChatList onChatSelect={() => setIsMobileChatOpen(true)}/>
                        </div>

                        {/* Chat Area View */}
                        <div
                            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                                isMobileChatOpen ? "translate-x-0" : "translate-x-full"
                            } flex flex-col bg-ink-1 z-20`}
                        >
                            <ChatArea onBack={handleBackToChatList}/>
                        </div>
                    </>
                )}

                {/* Groups Tab Content (Stub) */}
                {activeTab === "groups" && (
                    <div className="flex h-full items-center justify-center px-8">
                        <div className="reveal text-center">
                            <p className="eyebrow">{"groups"}</p>
                            <p className="mt-3 font-display text-4xl leading-none">Coming soon.</p>
                            <p className="mt-3 text-sm text-paper-dim">{"Groups feature coming soon"}</p>
                        </div>
                    </div>
                )}

                {/* Overview Tab Content */}
                {activeTab === "overview" && (
                    <Dashboard onOpenConversation={openConversation}/>
                )}

                {/* Settings Tab Content (Stub) */}
                {activeTab === "settings" && (
                    <div className="flex h-full items-center justify-center px-8">
                        <div className="reveal text-center">
                            <p className="eyebrow">{"settings"}</p>
                            <p className="mt-3 font-display text-4xl leading-none">Coming soon.</p>
                            <p className="mt-3 text-sm text-paper-dim">{"Settings feature coming soon"}</p>
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
