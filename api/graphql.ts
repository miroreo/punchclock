import { ApolloServer } from "apollo-server-micro";
import { getConnection } from "../src/database";

import typeDefs from "../src/graphql/schema";
import resolvers from "../src/graphql/resolvers";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => {
    const dbConn = await getConnection();

    return { dbConn };
  },
  introspection: true
});

export default apolloServer.createHandler({ path: "/api/graphql" });