import { MongoClient } from 'mongodb';

if (!process.env.MONGO_CONNECTION_STRING) {
  console.warn('Env var MONGO_CONNECTION_STRING not set, Postgres will be disabled');
}

const db = process.env.MONGO_CONNECTION_STRING
  ? new MongoClient(process.env.MONGO_CONNECTION_STRING, {
      useUnifiedTopology: true,
    })
  : null;

let dbPromise: any = null;

if (db) {
  dbPromise = db.connect();
}

export const get = dbPromise
  ? (query: any) => dbPromise.then(() => db.db('cryptofees').collection('fee_cache').findOne(query))
  : async (_: any) => [];

export const set = dbPromise
  ? (doc: any) => dbPromise.then(() => db.db('cryptofees').collection('fee_cache').updateOne({
    protocol: doc.protocol,
    attribute: doc.attribute,
    date: doc.date,
  }, { $set: doc }, { upsert: true }))
  : async (_: any) => null;
