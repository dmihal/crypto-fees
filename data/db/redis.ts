import redis from 'redis';
import { promisify } from 'util';

if (!process.env.REDIS_URL) {
  console.warn('Env var REDIS_URL not set, Redis will be disabled');
}

const client = process.env.REDIS_URL ? redis.createClient({ url: process.env.REDIS_URL }) : null;

export const get = client ? promisify(client.get).bind(client) : async (_: string) => null;

export const set = client ? promisify(client.set).bind(client) : async (_: string, __: any) => null;
