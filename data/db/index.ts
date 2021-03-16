import { db } from './connection';

export const getValue = async (protocol: string, attribute: string, date: string) => {
  const response = await db
    .from('fee_cache')
    .select('value')
    .where({ protocol, attribute, date });

  return response.length > 0 ? parseFloat(response[0].value) : null;
}

export const setValue = async (protocol: string, attribute: string, date: string, value: number) => {
  await db('fee_cache')
    .insert({ protocol, attribute, date, value });
}
