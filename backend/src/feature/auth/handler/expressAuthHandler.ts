import client from "../../../core/dataSource/mongoDbClient";
import { ExpressAuth } from '@auth/express'
import GitHub from '@auth/express/providers/github'
import { MongoDBAdapter } from '@auth/mongodb-adapter'

export const ExpressAuthHandler = ExpressAuth({
  providers: [GitHub],
  adapter: MongoDBAdapter(client)
})
