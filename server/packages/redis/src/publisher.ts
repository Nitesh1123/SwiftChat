import Redis from "ioredis";

const publisher = process.env.REDIS_URL 
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

publisher.on("connect", () => {
    console.log("Redis publisher connected.");
})

publisher.on("error", (err) => {
    console.log("Redis publisher error.", err);
})

async function publishMessage(channel: string, message: object): Promise<void> {
    try {
        await publisher.publish(channel, JSON.stringify(message));
    } catch (error) {
        console.error(`[Redis] Failed to publish to ${channel}:`, error);
        throw error;
    }
}

export { publishMessage };