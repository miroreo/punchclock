import { ApolloServer } from "apollo-server-micro";
import { getConnection } from "../src/database";
import { gql } from "apollo-server-micro";

// import noteSchema from "./note";
// import customSchema from "./custom";

const linkSchema = gql`
  type Query {
    _: Boolean
		getHello: String!
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

// import typeDefs from "../src/graphql/schema";
// import resolvers from "../src/graphql/resolvers";

const apolloServer = new ApolloServer({
  typeDefs: linkSchema,
  resolvers: {
		// Date: GraphQLDate,
		// Time: GraphQLTime,
		// DateTime: GraphQLDateTime,
		Query: {
			getHello: async (): Promise<String> => {
				return new Promise((res) => "Hello World!");
			},
		}
	},
  // context: async () => {
  //   const dbConn = await getConnection();

  //   return { dbConn };
  // },
  introspection: true
});

export default apolloServer.createHandler({ path: "/api/graphql" });