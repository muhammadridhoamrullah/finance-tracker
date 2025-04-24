import { MongoClient } from "mongodb";

const ConnectionString = process.env.MONGO_URI!;
const DBName = process.env.MONGO_DB!;

if (!ConnectionString) {
  throw new Error("Can't connect to mongoDB database");
}

let client: MongoClient;

export const GetMongoClientInstance = async () => {
  if (!client) {
    client = new MongoClient(ConnectionString);
    await client.connect();
  }
  return client;
};

export const GetDB = async () => {
  const client = await GetMongoClientInstance();
  const db = client.db(DBName);
  return db;
};
