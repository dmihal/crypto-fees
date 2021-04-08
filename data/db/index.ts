import { db } from './connection';
import * as redis from './redis';

export const getValue = async (protocol: string, attribute: string, date: string) => {
  const key = `${protocol}-${attribute}-${date}`;
  const redisVal = await redis.get(key);

  if (redisVal) {
    return parseFloat(redisVal);
  }

  const response = await db.from('fee_cache').select('value').where({ protocol, attribute, date });

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

  await Promise.all([
    db('fee_cache').insert({ protocol, attribute, date, value }),
    redis.set(key, value),
  ]);
};
