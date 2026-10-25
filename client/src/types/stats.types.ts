export type StatsRange = 7 | 30 | 90;

export interface DailyActivity {
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  sent: number;
  received: number;
}

export interface TopConversation {
  conversationId: string;
  type: "dm" | "group";
  name: string;
  avatar: string | null;
  otherUserId: string | null;
  sent: number;
  received: number;
  total: number;
  lastMessageAt: string;
}

export interface StatsContact {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  lastSeen: string;
  conversationId: string;
  isOnline: boolean;
}

export interface UserStats {
  range: { days: StatsRange; start: string };
  totals: { sent: number; received: number; conversations: number; contacts: number };
  window: { sent: number; received: number };
  streak: number;
  daily: DailyActivity[];
  /** heatmap[weekday 0=Sunday][hour 0-23] */
  heatmap: number[][];
  topConversations: TopConversation[];
  contacts: StatsContact[];
  truncated: boolean;
}
