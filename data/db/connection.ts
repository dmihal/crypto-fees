import knex from 'knex';

export const db = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
});
