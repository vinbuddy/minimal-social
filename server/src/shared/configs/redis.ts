import Redis, { RedisOptions } from "ioredis";
import envConfig from "./env";
import logger from "./logger";

if (envConfig.ENVIRONMENT === "production" && !envConfig.REDIS_URL) {
    throw new Error("REDIS_URL is required in production");
}

const REDIS_URL = envConfig.REDIS_URL || "redis://localhost:6379";

/**
 * Every client needs its own error listener: ioredis emits "error" on each connection
 * failure, and an unhandled "error" event crashes the process.
 */
function attachLogging(client: Redis, name: string) {
    client.on("connect", () => logger.info(`✅ Redis (${name}) connected`));
    client.on("error", (error) => logger.error(`Redis (${name}) error: ${error.message}`));
    return client;
}

function createRedisClient(name: string, options: RedisOptions = {}) {
    return attachLogging(new Redis(REDIS_URL, options), name);
}

// Main client for caching and BullMQ (BullMQ requires maxRetriesPerRequest: null)
export const redisClient = createRedisClient("main", { maxRetriesPerRequest: null });

// Pub/Sub clients for the Socket.IO Redis adapter
export const pubClient = createRedisClient("pub");
export const subClient = attachLogging(pubClient.duplicate(), "sub");

export default redisClient;
