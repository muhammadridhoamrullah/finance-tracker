const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URI;

if (!url) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

const client = new MongoClient(url);

async function connect() {
  try {
    client.db("mobile-finance-tracker");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    await client.close();
  }
}

async function getDB() {
  return client.db("mobile-finance-tracker");
}

module.exports = {
  connect,
  getDB,
};
