import type { CSSProperties } from "react";
import type { TopConversation } from "@/types/stats.types";
import Avatar from "@/components/chat/Avatar";

interface TopConversationsProps {
  items: TopConversation[];
  onOpen: (conversationId: string) => void;
}

const TopConversations = ({ items, onOpen }: TopConversationsProps) => {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-paper-faint">No conversations in this range.</p>;
  }

  const max = Math.max(...items.map((c) => c.total));

  return (
    <ol className="flex flex-col gap-1">
      {items.map((c, i) => (
        <li key={c.conversationId}>
          <button
            type="button"
            onClick={() => onOpen(c.conversationId)}
            className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-paper/[0.05] focus-visible:bg-paper/[0.05] focus-visible:outline-none"
            title={`Open chat with ${c.name}`}
          >
            <span className="w-4 shrink-0 font-mono text-[11px] text-paper-faint">{i + 1}</span>
            <Avatar name={c.name} src={c.avatar} size={34} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14px] font-medium">{c.name}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-paper-dim">{c.total}</span>
              </span>
              {/* Stacked bar: sent | 2px gap | received, scaled to the busiest chat */}
              <span className="mt-1.5 flex h-[6px] gap-[2px]" style={{ width: `${Math.max(8, (c.total / max) * 100)}%` } as CSSProperties}>
                {c.sent > 0 && <span className="h-full rounded-l-[3px] bg-shu last:rounded-r-[3px] bar-grow" style={{ flex: c.sent }} />}
                {c.received > 0 && <span className="h-full rounded-r-[3px] bg-ai first:rounded-l-[3px] bar-grow" style={{ flex: c.received }} />}
              </span>
            </span>
            <span className="eyebrow !text-shu opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Open</span>
          </button>
        </li>
      ))}
    </ol>
  );
};

export default TopConversations;
