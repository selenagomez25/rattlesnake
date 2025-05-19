import { MongoClient, Db, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set in environment variables");

const options: MongoClientOptions = {
  tls: true,
};

let client: MongoClient;
const clientPromise: Promise<MongoClient> = (() => {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
})();

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(dbName = "scanapp"): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
} 