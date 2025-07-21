import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "../config/index.ts";
import process from "node:process";

const uri = config.dbConnectionString;
const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }

let client: MongoClient;
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClient?: MongoClient
  }
 
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options)
  }
  client = globalWithMongo._mongoClient
} else {
  // In production do not use global variable
  client = new MongoClient(uri, )
}

export default client



