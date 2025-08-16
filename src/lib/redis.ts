import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('Please define the REDIS_URL environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached: RedisClientType | null = global.redis;

if (!cached) {
  const client = createClient({
    url: REDIS_URL,
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  cached = global.redis = client;
}

async function redisConnect() {
  if (!cached.isOpen) {
    await cached.connect();
  }

  return cached;
}

// Utility function to publish events to Redis
export async function publish(channel: string, message: any) {
  const client = await redisConnect();
  await client.publish(channel, JSON.stringify(message));
}

export default redisConnect;