import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Flame, MessageCircleReply, RefreshCw, Send, Users } from "lucide-react";
import type { AxiosError } from "axios";
import { fetchStats } from "@/api/stats";
import { socket } from "@/lib/socket";
import { useConversation } from "@/context/useConversation";
import { useUser } from "@/context/useUser";
import type { StatsRange, UserStats } from "@/types/stats.types";
import type { MessageResponse } from "@/types/message.types";
import Avatar from "@/components/chat/Avatar";
import ActivityChart from "./ActivityChart";
import ActivityHeatmap from "./ActivityHeatmap";
import TopConversations from "./TopConversations";
import { useCountUp } from "./useChartHelpers";

const RANGES: { days: StatsRange; label: string; title: string }[] = [
  { days: 7, label: "7D", title: "Your week" },
  { days: 30, label: "30D", title: "Your month" },
  { days: 90, label: "90D", title: "Your quarter" },
];

const at = (i: number) => ({ "--i": i, "--base": "120ms" }) as CSSProperties;

const Panel = ({ title, aside, children, className = "", i }: { title: string; aside?: ReactNode; children: ReactNode; className?: string; i: number }) => (
  <section className={`panel reveal ${className}`} style={at(i)}>
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="eyebrow !text-paper-dim">{title}</h2>
      {aside}
    </header>
    {children}
  </section>
);

const Kpi = ({ icon, label, value, hint, accent, i }: { icon: ReactNode; label: string; value: number; hint: string; accent: string; i: number }) => {
  const shown = useCountUp(value);
  return (
    <div className="panel reveal !p-4 sm:!p-5" style={at(i)}>
      <div className="flex items-center gap-2 text-paper-dim">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${accent}`}>{icon}</span>
        <span className="text-[13px]">{label}</span>
      </div>
      <p className="mt-3 font-display text-[2.6rem] leading-none tabular-nums">{shown.toLocaleString()}</p>
      <p className="mt-1.5 font-mono text-[10.5px] tracking-wide text-paper-faint">{hint}</p>
    </div>
  );
};

const lastSeenLabel = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

interface DashboardProps {
  onOpenConversation: (conversationId: string) => void;
}

const Dashboard = ({ onOpenConversation }: DashboardProps) => {
  const { user } = useUser();
  const { conversations } = useConversation();
  const [days, setDays] = useState<StatsRange>(7);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (range: StatsRange) => {
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchStats(range));
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message || "Couldn't load your stats. The server may be waking up — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  // Live: presence flips and incoming messages update the board in place.
  useEffect(() => {
    const myId = user?.id || user?._id;
    const setPresence = (userId: string, isOnline: boolean, lastSeen?: string) =>
      setStats((prev) =>
        prev && {
          ...prev,
          contacts: prev.contacts
            .map((c) => (c.id === userId ? { ...c, isOnline, lastSeen: lastSeen ?? c.lastSeen } : c))
            .sort((a, b) => Number(b.isOnline) - Number(a.isOnline) || a.name.localeCompare(b.name)),
        }
      );
    const onOnline = ({ userId }: { userId: string }) => setPresence(userId, true);
    const onOffline = ({ userId, lastSeen }: { userId: string; lastSeen: string }) => setPresence(userId, false, lastSeen);
    const onMessage = (m: MessageResponse) => {
      if (m.sender === myId) return;
      setStats((prev) => {
        if (!prev) return prev;
        const daily = [...prev.daily];
        const today = daily[daily.length - 1];
        daily[daily.length - 1] = { ...today, received: today.received + 1 };
        return { ...prev, daily, window: { ...prev.window, received: prev.window.received + 1 } };
      });
    };

    socket.on("user:online", onOnline);
    socket.on("user:offline", onOffline);
    socket.on("message:new", onMessage);
    return () => {
      socket.off("user:online", onOnline);
      socket.off("user:offline", onOffline);
      socket.off("message:new", onMessage);
    };
  }, [user]);

  const unread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const range = RANGES.find((r) => r.days === days)!;
  const online = stats?.contacts.filter((c) => c.isOnline) ?? [];
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="dashboard h-full overflow-y-auto thin-scroll">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="reveal eyebrow" style={at(0)}>
              Overview{firstName ? ` · ${firstName}` : ""}
            </p>
            <h1 className="reveal mt-2 font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-[3.2rem]" style={at(1)}>
              {range.title} <span className="italic text-shu">on the line.</span>
            </h1>
          </div>
          <div className="reveal flex items-center gap-2" style={at(2)}>
            <div className="seg" role="tablist" aria-label="Time range">
              {RANGES.map((r) => (
                <button key={r.days} role="tab" aria-selected={days === r.days} className={days === r.days ? "on" : ""} onClick={() => setDays(r.days)}>
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => load(days)} className="rail-btn !h-9 !w-9 border border-paper/[0.08]" aria-label="Refresh stats" title="Refresh">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {error && (
          <div className="reveal mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-shu/30 bg-shu/10 px-4 py-3 text-sm">
            <span>{error}</span>
            <button type="button" className="btn-link" onClick={() => load(days)}>
              Try again
            </button>
          </div>
        )}

        {!stats && loading && (
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="panel h-[132px] animate-pulse" />
            ))}
            <div className="panel col-span-2 h-[320px] animate-pulse lg:col-span-4" />
          </div>
        )}

        {stats && (
          <>
            {/* KPIs */}
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi i={3} icon={<Send size={14} />} accent="bg-shu/15 text-shu" label="Sent" value={stats.window.sent} hint={`${stats.totals.sent.toLocaleString()} all time`} />
              <Kpi i={4} icon={<MessageCircleReply size={14} />} accent="bg-ai/15 text-ai" label="Received" value={stats.window.received} hint={`${stats.totals.received.toLocaleString()} all time`} />
              <Kpi i={5} icon={<Flame size={14} />} accent="bg-kaki/15 text-kaki" label="Day streak" value={stats.streak} hint={stats.streak > 0 ? "days in a row you've sent" : "send one today to start"} />
              <Kpi i={6} icon={<Users size={14} />} accent="bg-matcha/15 text-matcha" label="Unread" value={unread} hint={`${stats.totals.conversations} conversations`} />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <Panel i={7} title="Messages per day" className="lg:col-span-2">
                <ActivityChart daily={stats.daily} />
              </Panel>

              <Panel
                i={8}
                title="Online now"
                aside={<span className="font-mono text-[11px] text-matcha">{online.length} live</span>}
              >
                {stats.contacts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-paper-faint">Start a conversation and your people show up here.</p>
                ) : (
                  <ul className="flex max-h-[268px] flex-col gap-0.5 overflow-y-auto thin-scroll">
                    {stats.contacts.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => onOpenConversation(c.conversationId)}
                          className={`flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-paper/[0.05] ${c.isOnline ? "" : "opacity-60"}`}
                        >
                          <Avatar name={c.name} src={c.avatar} size={32} online={c.isOnline} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px]">{c.name}</span>
                            <span className="block truncate font-mono text-[10.5px] text-paper-faint">
                              {c.isOnline ? "online" : `seen ${lastSeenLabel(c.lastSeen)}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel i={9} title="When you talk" className="lg:col-span-2">
                <ActivityHeatmap heatmap={stats.heatmap} />
              </Panel>

              <Panel
                i={10}
                title="Top chats"
                aside={
                  <span className="flex items-center gap-3 font-mono text-[10.5px] text-paper-faint">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-shu" />sent</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ai" />received</span>
                  </span>
                }
              >
                <TopConversations items={stats.topConversations} onOpen={onOpenConversation} />
              </Panel>
            </div>

            {stats.truncated && (
              <p className="mt-4 font-mono text-[10.5px] text-paper-faint">
                Very busy range: charts use your most recent 50,000 messages.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
