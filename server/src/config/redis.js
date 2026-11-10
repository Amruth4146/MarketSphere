import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Client connected');
    });

    redisClient.on('error', (err) => {
      console.warn(`[Redis] Connection warning: ${err.message}`);
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  try {
    const client = getRedisClient();
    await client.connect();
    return client;
  } catch (error) {
    console.warn(`[Redis] Could not connect: ${error.message}`);
  }
};

