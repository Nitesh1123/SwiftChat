import '@/styles.css'
import { useUser } from "@/context/useUser";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
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
    <div className="flex flex-col items-center p-2 gap-4 justify-between pb-4 pt-4">
      {/* Profile Avatar */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="profile-img h-[45px] w-[45px] bg-white rounded-full overflow-hidden hover:opacity-80 transition-opacity"
          aria-label="Profile menu"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary text-lg font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </button>

        {showProfileMenu && (
          <div className="absolute left-full ml-2 top-0 w-48 bg-[#252A31] border border-[#30363D] rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-[#30363D]">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-[#8B95A7]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Items - Placeholder icons */}
      <div className="sidebar-items flex flex-col gap-4 mb-[50px]">
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
      </div>

      {/* Settings */}
      <div className="settings">
        <div className="sidebar-item rounded-full bg-white h-[45px] w-[45px]"></div>
      </div>
    </div>
  )
}

export default Sidebar
