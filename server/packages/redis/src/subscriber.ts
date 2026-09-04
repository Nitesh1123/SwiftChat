import Redis from "ioredis";

const subscriber = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, {
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        }
    })
    : new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === "true" ? {} : undefined,
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        },
    });

subscriber.on("connect", () => {
    console.log("Redis subscriber connected.");
})

subscriber.on("error", (err) => {
    console.log("Redis subscriber error.", err);
})

type MessageHandler = (message: object, channel: string) => void;

async function subscribe(pattern: string, onMessage: MessageHandler): Promise<void> {
    try {
        await subscriber.psubscribe(pattern);
        subscriber.on("pmessage", (_pattern, channel, message) => {
            onMessage(JSON.parse(message), channel);
        });
    } catch (error) {
        console.error(`[Redis] Failed to subscribe to ${pattern}:`, error);
        throw error;
    }
}

export { subscribe };