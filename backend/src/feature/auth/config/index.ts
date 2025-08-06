import { config } from "@/core/config";
import client from "@/core/dataSource/mongoDbClient";
import { ExpressAuthConfig } from "@auth/express";
import GitHub from "@auth/express/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

export const authConfig: ExpressAuthConfig = {
  providers: [GitHub],
  adapter: MongoDBAdapter(client),
  secret: config.authSecret,
  callbacks: {
    async session({ session }) {
      const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      }
      return {expires: session.expires, user};
    }
  }
}
