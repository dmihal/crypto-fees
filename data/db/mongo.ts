import { MongoClient } from 'mongodb';

if (!process.env.MONGO_CONNECTION_STRING) {
  console.warn('Env var MONGO_CONNECTION_STRING not set, Postgres will be disabled');
}

const db = process.env.MONGO_CONNECTION_STRING
  ? new MongoClient(process.env.MONGO_CONNECTION_STRING, {
      useUnifiedTopology: true,
    })
  : null;

if (db) {
  db.connect();
}

export const get = db
  ? (query: any) => db.db('cryptofees').collection('fee_cache').findOne(query)
  : async (_: any) => [];

export const set = db
  ? (doc: any) => db.db('cryptofees').collection('fee_cache').insertOne(doc)
  : async (_: any) => null;
