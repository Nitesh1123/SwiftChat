import { MessageSquare, Users, Circle, Settings } from "lucide-react";

type TabType = "chats" | "groups" | "status" | "settings";

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const tabs: { id: TabType; label: string; icon: typeof MessageSquare }[] = [
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "groups", label: "Groups", icon: Users },
    { id: "status", label: "Status", icon: Circle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink-0/85 border-t border-paper/[0.08] safe-area-bottom backdrop-blur-md">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? "text-paper"
                  : "text-paper-faint hover:text-paper-dim"
              }`}
              aria-label={tab.label}
            >
              {isActive && (
                <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-shu" />
              )}
              <Icon
                className={`w-[22px] h-[22px] ${isActive ? "text-shu" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
