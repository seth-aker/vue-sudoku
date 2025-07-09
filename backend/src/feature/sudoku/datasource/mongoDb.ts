import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "../../../core/config";
const uri = config.dbConnectionString;

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

