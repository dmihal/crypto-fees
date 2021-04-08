import knex from 'knex';

if (!process.env.REDIS_URL) {
  console.warn('Env var PG_CONNECTION_STRING not set, Postgres will be disabled');
}

const db = process.env.PG_CONNECTION_STRING
  ? knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
      pool: { min: 0, max: 2 },
    })
  : null;

export const get = db
  ? (query: any) => db.from('fee_cache').select('value').where(query)
  : async (_: any) => [];

export const set = db ? (doc: any) => db('fee_cache').insert(doc) : async (_: any) => null;
