import '@/styles.css'
import { useUser } from "@/context/useUser";
import type { CSSProperties } from "react";
import { Bookmark, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from "lucide-react";
import Logo from "@/components/brand/Logo";
import Avatar from "./Avatar";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type DesktopView = "chats" | "overview";

// Items with a `view` switch the main pane; the rest are placeholders.
const railItems: { label: string; icon: typeof MessageSquare; view?: DesktopView }[] = [
  { label: "Chats", icon: MessageSquare, view: "chats" },
  { label: "Overview", icon: LayoutDashboard, view: "overview" },
  { label: "Groups", icon: Users },
  { label: "Saved", icon: Bookmark },
];

interface SidebarProps {
  view: DesktopView;
  onViewChange: (view: DesktopView) => void;
}

const Sidebar = ({ view, onViewChange }: SidebarProps) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="rail flex flex-col items-center justify-between py-5" aria-label="Primary">
      <Logo size={40} animate />

      {/* Section switcher */}
      <div className="flex flex-col items-center gap-2">
        {railItems.map(({ label, icon: Icon, view: target }, i) => {
          const active = target === view;
          return (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`rail-btn reveal-x ${active ? "active" : ""}`}
            style={{ "--i": i, "--base": "250ms" } as CSSProperties}
            onClick={() => target && onViewChange(target)}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
          </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button type="button" title="Settings" aria-label="Settings" className="rail-btn">
          <Settings size={20} strokeWidth={1.8} />
        </button>

        {/* Profile Avatar */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="block rounded-[30%] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shu"
            aria-label="Profile menu"
          >
            <Avatar name={user?.name || "U"} src={user?.avatar} size={40} online />
          </button>

          {showProfileMenu && (
            <div className="menu-panel absolute bottom-0 left-full z-50 ml-3 w-60 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-paper/[0.08] px-4 py-3.5">
                <Avatar name={user?.name || "U"} src={user?.avatar} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate font-mono text-[11px] text-paper-faint">
                    {user?.username ? `@${user.username}` : user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-shu transition-colors hover:bg-shu/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
