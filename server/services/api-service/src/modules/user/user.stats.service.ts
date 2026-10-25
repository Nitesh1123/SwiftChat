import { prisma } from "@swiftchat/prisma";
import { RedisService } from "@swiftchat/redis";

const DAY_MS = 24 * 60 * 60 * 1000;
// Upper bound on rows pulled for bucketing, so one very chatty account
// can't make this endpoint scan the whole table.
const MAX_SCAN = 50_000;
const STREAK_LOOKBACK_DAYS = 365;

interface StatsParams {
  userId: string;
  days: number;
  /** Minutes behind UTC, as returned by JS Date#getTimezoneOffset(). */
  tzOffset: number;
}

const toLocal = (date: Date, tzOffset: number) =>
  new Date(date.getTime() - tzOffset * 60_000);

const localDayKey = (date: Date, tzOffset: number) =>
  toLocal(date, tzOffset).toISOString().slice(0, 10);

/** Start of the local day `daysAgo` days before today, as a UTC instant. */
const localDayStart = (daysAgo: number, tzOffset: number) => {
  const local = toLocal(new Date(), tzOffset);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - daysAgo * DAY_MS + tzOffset * 60_000);
};

const isOnline = async (userId: string) => {
  try {
    return Boolean(await RedisService.isUserOnline(userId));
  } catch {
    return false;
  }
};

export const getUserStatsService = async ({ userId, days, tzOffset }: StatsParams) => {
  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: {
      conversation: {
        select: {
          id: true,
          type: true,
          name: true,
          participants: {
            select: {
              user: {
                select: { id: true, name: true, username: true, avatar: true, lastSeen: true },
              },
            },
          },
        },
      },
    },
  });

  const conversations = memberships.map((m) => m.conversation);
  const conversationIds = conversations.map((c) => c.id);
  const windowStart = localDayStart(days - 1, tzOffset);

  const [sentTotal, receivedTotal, windowMessages, recentSent] = await Promise.all([
    prisma.message.count({ where: { senderId: userId } }),
    prisma.message.count({
      where: { conversationId: { in: conversationIds }, senderId: { not: userId } },
    }),
    prisma.message.findMany({
      where: { conversationId: { in: conversationIds }, createdAt: { gte: windowStart } },
      select: { senderId: true, conversationId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: MAX_SCAN,
    }),
    prisma.message.findMany({
      where: {
        senderId: userId,
        createdAt: { gte: localDayStart(STREAK_LOOKBACK_DAYS, tzOffset) },
      },
      select: { createdAt: true },
      take: MAX_SCAN,
    }),
  ]);

  // Daily series, oldest first, one entry per local day in the window.
  const daily = Array.from({ length: days }, (_, i) => ({
    date: localDayKey(localDayStart(days - 1 - i, tzOffset), tzOffset),
    sent: 0,
    received: 0,
  }));
  const dayIndex = new Map(daily.map((d, i) => [d.date, i]));

  // heatmap[weekday 0=Sun][hour 0-23], local time, all messages in the window.
  const heatmap = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const perConversation = new Map<string, { sent: number; received: number; lastAt: Date }>();

  for (const msg of windowMessages) {
    const own = msg.senderId === userId;
    const index = dayIndex.get(localDayKey(msg.createdAt, tzOffset));
    if (index !== undefined) daily[index][own ? "sent" : "received"]++;

    const local = toLocal(msg.createdAt, tzOffset);
    heatmap[local.getUTCDay()][local.getUTCHours()]++;

    const entry = perConversation.get(msg.conversationId) ?? {
      sent: 0,
      received: 0,
      lastAt: msg.createdAt,
    };
    entry[own ? "sent" : "received"]++;
    if (msg.createdAt > entry.lastAt) entry.lastAt = msg.createdAt;
    perConversation.set(msg.conversationId, entry);
  }

  // Streak: consecutive local days, ending today (or yesterday if nothing
  // has been sent yet today), on which the user sent at least one message.
  const sentDays = new Set(recentSent.map((m) => localDayKey(m.createdAt, tzOffset)));
  let streak = 0;
  let offset = sentDays.has(localDayKey(new Date(), tzOffset)) ? 0 : 1;
  while (sentDays.has(localDayKey(localDayStart(offset, tzOffset), tzOffset))) {
    streak++;
    offset++;
  }

  const others = (c: (typeof conversations)[number]) =>
    c.participants.map((p) => p.user).filter((u) => u.id !== userId);

  const topConversations = [...perConversation.entries()]
    .map(([conversationId, counts]) => {
      const convo = conversations.find((c) => c.id === conversationId)!;
      const other = convo.type === "dm" ? others(convo)[0] : undefined;
      return {
        conversationId,
        type: convo.type,
        name: convo.type === "group" ? convo.name ?? "Group" : other?.name ?? "Unknown",
        avatar: other?.avatar ?? null,
        otherUserId: other?.id ?? null,
        sent: counts.sent,
        received: counts.received,
        total: counts.sent + counts.received,
        lastMessageAt: counts.lastAt.toISOString(),
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Everyone the user has a DM with, plus whether they're online right now.
  const contactMap = new Map<string, { id: string; name: string; username: string | null; avatar: string | null; lastSeen: string; conversationId: string }>();
  for (const convo of conversations) {
    if (convo.type !== "dm") continue;
    for (const user of others(convo)) {
      contactMap.set(user.id, {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        lastSeen: user.lastSeen.toISOString(),
        conversationId: convo.id,
      });
    }
  }
  const contacts = await Promise.all(
    [...contactMap.values()].map(async (c) => ({ ...c, isOnline: await isOnline(c.id) }))
  );

  const windowSent = daily.reduce((sum, d) => sum + d.sent, 0);
  const windowReceived = daily.reduce((sum, d) => sum + d.received, 0);

  return {
    range: { days, start: windowStart.toISOString() },
    totals: {
      sent: sentTotal,
      received: receivedTotal,
      conversations: conversations.length,
      contacts: contacts.length,
    },
    window: { sent: windowSent, received: windowReceived },
    streak,
    daily,
    heatmap,
    topConversations,
    contacts: contacts.sort((a, b) => Number(b.isOnline) - Number(a.isOnline) || a.name.localeCompare(b.name)),
    truncated: windowMessages.length === MAX_SCAN,
  };
};
