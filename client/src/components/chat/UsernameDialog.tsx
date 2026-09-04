import { useUser } from "@/context/useUser";
import React, { useState } from "react";
import { toast } from "sonner";
import { setUsername } from "@/api/user";

interface UsernameDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

const UsernameDialog = ({ open, setOpen }: UsernameDialogProps) => {
  const { setUser } = useUser();
  const [username, setUsernameValue] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(value)) {
      return toast.error(
        "Username must be 3–20 characters and can contain letters, numbers, _ or ."
      );
    }

    try {
      setLoading(true);
      const res = await setUsername(value);
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          username: res.username,
        };
      });
      toast.success("Username set successfully");
      setOpen(false);
    } catch (err:any) {
      const message = err?.response?.data?.message || "Failed to set username";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          // Prevent closing on backdrop click - username is required
          e.stopPropagation();
        }}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#252A31] border border-[#30363D] p-6 sm:p-8 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          Set your username
        </h2>

        <p className="text-sm text-[#8B95A7] mb-6">
          This will be visible to other users in chats.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              value={username}
              disabled={loading}
              onChange={(e) => setUsernameValue(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border border-[#30363D] bg-[#1A1D23] px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#8B95A7] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-[#8B95A7]">
              3–20 characters, letters, numbers, _ or .
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? "Saving..." : "Save username"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameDialog;
