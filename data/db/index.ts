import * as mongo from './mongo';
import * as redis from './redis';

export const getValue = async (protocol: string, attribute: string, date: string) => {
  const key = `${protocol}-${attribute}-${date}`;
  const redisVal = await redis.get(key);

  if (redisVal) {
    return parseFloat(redisVal);
  }

  const response = await mongo.get({ protocol, attribute, date });

  if (response) {
    const value = parseFloat(response.value);
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

  await Promise.all([mongo.set({ protocol, attribute, date, value }), redis.set(key, value)]);
};
