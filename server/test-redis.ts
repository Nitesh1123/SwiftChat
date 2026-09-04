import "dotenv/config";
import redis from "./packages/redis/src/index";

async function testRedis() {
    try {
        console.log("Waiting for connection...");
        
        // 1. Test a basic SET and GET
        console.log("\nTesting Set/Get...");
        await redis.set("test-zolo-key", "Hello from Upstash!");
        const value = await redis.get("test-zolo-key");
        console.log("Value retrieved from Upstash:", value);
        
        if (value === "Hello from Upstash!") {
            console.log("✅ Redis is working perfectly!");
        } else {
            console.log("❌ Something is wrong.");
        }

        // Clean up
        await redis.del("test-zolo-key");
        process.exit(0);

    } catch (error) {
        console.error("❌ Redis Test Failed:", error);
        process.exit(1);
    }
}

testRedis();
