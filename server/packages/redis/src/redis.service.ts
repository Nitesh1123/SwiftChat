import redis from "@zolo/redis";

export const RedisService = {
  async setUserOnline(userId: string) {
    await redis.sadd("online:users", userId);
    await redis.set(`online:user:${userId}`, "1");
  },

  async setUserOffline(userId: string) {
    await redis.srem("online:users", userId);
    await redis.del(`online:user:${userId}`);
    await redis.set(`user:lastSeen:${userId}`, Date.now());
  },

  async isUserOnline(userId: string) {
    return redis.sismember("online:users", userId);
  },

  async getUserLastSeen(userId: string) {
    const ts = await redis.get(`user:lastSeen:${userId}`);
    if (!ts) return null;
    return new Date(parseInt(ts)).toISOString();
  },

  async addSocket(userId: string, socketId: string) {
    await redis.sadd(`socket:user:${userId}`, socketId);
    await redis.set(`socket:id:${socketId}`, userId, "EX", 500);
  },

  async removeSocket(userId: string, socketId: string) {
    await redis.srem(`socket:user:${userId}`, socketId);
    await redis.del(`socket:id:${socketId}`);
  },

  async getUserSockets(userId: string) {
    return redis.smembers(`socket:user:${userId}`);
  },

  async incUnreadCount(userId: string, conversationId: string) {
    await redis.incr(`unread:${userId}:${conversationId}`);
    await redis.incr(`unread:total:${userId}`);
  },

  async resetUnreadCount(userId: string, conversationId: string) {
    const key = `unread:${userId}:${conversationId}`;
    const totalKey = `unread:total:${userId}`;

    const count = parseInt((await redis.get(key)) || "0");

    if (count > 0) {
      const multi = redis.multi();

      multi.decrby(totalKey, count);
      multi.del(key);

      await multi.exec();
    }
  },

  async getSocketCount(userId: string) {
    return redis.scard(`socket:user:${userId}`);
  },
};
