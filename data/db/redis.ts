import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

export const get = promisify(client.get).bind(client);
export const set = promisify(client.set).bind(client);
