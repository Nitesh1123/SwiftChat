import { useUser } from "@/context/useUser";
import React, { useState } from "react";
import { toast } from "sonner";
import { setUsername } from "@/api/user";
import Seal from "@/components/brand/Seal";

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
        className="dialog-backdrop absolute inset-0"
        onClick={(e) => {
          // Prevent closing on backdrop click - username is required
          e.stopPropagation();
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="username-title"
        className="dialog-panel relative z-10 w-full max-w-md rounded-3xl p-6 sm:p-8"
      >
        <Seal size={44} animate delay={200} />
        <p className="eyebrow mt-6">One last thing</p>
        <h2 id="username-title" className="mt-2 mb-2 font-display text-[2.2rem] leading-none">
          Set your username
        </h2>

        <p className="text-sm text-paper-dim mb-6">
          This will be visible to other users in chats.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[15px] text-shu">
                @
              </span>
              <input
                autoFocus
                type="text"
                value={username}
                disabled={loading}
                onChange={(e) => setUsernameValue(e.target.value)}
                placeholder="Enter username"
                className="search-input !h-12 !pl-9 font-mono !text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-paper-faint">
              3–20 characters, letters, numbers, _ or .
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="btn-shu w-full"
          >
            {loading ? "Saving..." : "Save username"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameDialog;
