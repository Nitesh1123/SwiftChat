import Redis from "ioredis";

const createRedisClient = () => {
    return process.env.REDIS_URL
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
};

const redis = createRedisClient();

redis.on("connect", () => {
    console.log("Redis Connected");
})

redis.on("error", (err) => {
    console.log("Redis Error: ", err);
})

export default redis;
export const pubClient = createRedisClient();
export const subClient = createRedisClient();
export { RedisService } from "./redis.service";
export { publishMessage } from "./publisher";
export { subscribe } from "./subscriber";