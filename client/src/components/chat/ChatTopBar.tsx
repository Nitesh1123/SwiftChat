import { ArrowLeft, LogOut, MoreVertical, Phone, Video } from "lucide-react";
import Avatar from "./Avatar";
import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@/context/useUser";
import { useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";

interface ChatTopBarProp {
  conversationName?: string;
  isOnline?: boolean;
  lastSeen?: string | null;
  otherUserId: string | null;
  participantsCount: number;
  onBack?: () => void;
}

const ChatTopBar = ({
  conversationName,
  isOnline = false,
  lastSeen: initialLastSeen = null,
  otherUserId = null,
  participantsCount,
  onBack,
}: ChatTopBarProp) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [online, setOnline] = useState(isOnline);
  const [lastSeen, setLastSeen] = useState<string | null>(initialLastSeen);

  useEffect(() => {
    setOnline(isOnline);
    setLastSeen(initialLastSeen);
  }, [isOnline, initialLastSeen]);

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Offline";
    const date = new Date(lastSeen);
    return `last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleOnline = useCallback((data: { userId: string }) => {
    if (otherUserId === null) return;
    if (data.userId === otherUserId) setOnline(true);
  }, [otherUserId])

  const handleOffline = useCallback((data: { userId: string, lastSeen: string }) => {
    if (otherUserId === null) return;
    if (otherUserId === data.userId) {
      setOnline(false);
      setLastSeen(data.lastSeen)
    }

  }, [otherUserId])

  useEffect(() => {
    socket.on('user:online', handleOnline)
    socket.on('user:offline', handleOffline)

    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 h-[68px] px-4 lg:px-6 border-b border-paper/[0.07] bg-ink-1/70 backdrop-blur-md">
      {/* Back button (mobile only) */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 text-paper-dim hover:text-paper hover:bg-paper/5 rounded-xl transition-colors"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <Avatar name={conversationName || "?"} size={42} online={participantsCount <= 2 && online} />

      <div className="flex-1 min-w-0">
        <p className="font-display text-[1.45rem] leading-tight truncate">{conversationName}</p>
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-paper-faint">
          {participantsCount <= 2 ? (
            <>
              <span className={online ? "online-dot" : "offline-dot"} />
              <span className={online ? "text-matcha" : ""}>
                {online ? "Online" : formatLastSeen(lastSeen)}
              </span>
            </>
          ) : (
            `${participantsCount} members`
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden lg:flex items-center gap-1.5">
          <button className="rail-btn" aria-label="Voice call" title="Voice call">
            <Phone size={18} strokeWidth={1.8} />
          </button>
          <button className="rail-btn" aria-label="Video call" title="Video call">
            <Video size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* Profile menu button (mobile) */}
        <div className="lg:hidden relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-2 text-paper-dim hover:text-paper hover:bg-paper/5 rounded-xl transition-colors"
            aria-label="Profile menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showProfileMenu && (
            <div className="menu-panel absolute right-0 top-full mt-2 w-56 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-paper/[0.08]">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="font-mono text-[11px] text-paper-faint truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-shu hover:bg-shu/10 transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatTopBar;
