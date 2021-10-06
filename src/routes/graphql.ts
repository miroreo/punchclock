import type { EndpointOutput, RequestHandler } from "@sveltejs/kit";
import { ApolloServer, gql } from "../apollo-server-sveltekit";
import { ApolloServerBase, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import typeDefs from '../graphql/schema'
import resolvers from '../graphql/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  introspection: true,
});
let serverStarted;
const getServer = async (): Promise<void> => {
	if(serverStarted) return new Promise((resolve,reject) => resolve());
	else serverStarted = true;
	return await apolloServer.start();
}

const handler: RequestHandler = async (args) => {

	return await new Promise<EndpointOutput>((resolve, reject) => {
		getServer().then(() => {
			apolloServer.createHandler()(args, (result) => {
				resolve({
					status: result.statusCode,
					body: result.body,
					headers: result.headers as any
				})
			})
		});
	});
	// graphqlHandler({}, {})
  // return await new Promise<EndpointOutput>((resolve, reject) => {
  //   graphqlHandler(
  //     {
  //       httpMethod: args.method,
  //       headers: args.headers,
  //       path: args.path,
  //       body: args.rawBody,
  //     },
  //     {} as any,
  //     (err, result) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve({
  //           status: result.statusCode,
  //           body: result.body,
  //           headers: result.headers as any,
  //         });
  //       }
  //     }
  //   ) as any;
  // });
};

export const head = handler;
export const get = handler;
export const post = handler;