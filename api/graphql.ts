import { ApolloServer, gql } from "apollo-server-micro";
import { getConnection } from "../src/database";
// import {  } from "apollo-server-micro";

// import noteSchema from "./note";
// import customSchema from "./custom";

// const linkSchema = gql`
//   type Query {
// 		getHello: String!
//   }
// `;

// // import typeDefs from "../src/graphql/schema";
// // import resolvers from "../src/graphql/resolvers";

// const apolloServer = new ApolloServer({
//   typeDefs: linkSchema,
//   resolvers: {
// 		// Date: GraphQLDate,
// 		// Time: GraphQLTime,
// 		// DateTime: GraphQLDateTime,
// 		Query: {
// 			getHello: async (): Promise<String> => {
// 				return new Promise((res) => "Hello World!");
// 			},
// 		}
// 	},
//   // context: async () => {
//   //   const dbConn = await getConnection();

//   //   return { dbConn };
//   // },
//   // introspection: true
// });


const typeDefs = gql`
  type Query {
    sayHello: String
  }
`;

const resolvers = {
  Query: {
    sayHello(parent, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export default apolloServer.createHandler({ path: "/api/graphql" });