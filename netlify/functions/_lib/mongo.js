const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

/**
 * Return a shared MongoDB database instance for Netlify Function invocations.
 */
async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "yakemon";

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 5,
    });
  }

  await cachedClient.connect();
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

module.exports = {
  getDb,
};
