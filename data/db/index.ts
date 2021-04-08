import * as postgres from './postgres';
import * as redis from './redis';

export const getValue = async (protocol: string, attribute: string, date: string) => {
  const key = `${protocol}-${attribute}-${date}`;
  const redisVal = await redis.get(key);

  if (redisVal) {
    return parseFloat(redisVal);
  }

  const response = await postgres.get({ protocol, attribute, date });

  if (response.length > 0) {
    const value = parseFloat(response[0].value);
    await redis.set(key, value);
    return value;
  }

  return null;
};

export const setValue = async (
  protocol: string,
  attribute: string,
  date: string,
  value: number
) => {
  const key = `${protocol}-${attribute}-${date}`;

  await Promise.all([postgres.set({ protocol, attribute, date, value }), redis.set(key, value)]);
};
