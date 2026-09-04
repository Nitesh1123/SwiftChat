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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-[rgba(255,255,255,0.08)] safe-area-bottom backdrop-blur-sm">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? "text-blue-500"
                  : "text-[#8B95A7] hover:text-[#E5E7EB]"
              }`}
              aria-label={tab.label}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium transition-all ${
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
