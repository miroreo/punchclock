import type { EndpointOutput, RequestHandler } from "@sveltejs/kit";
import { ApolloServer, gql, makeExecutableSchema } from "apollo-server-lambda";
import typeDefs from '../graphql/schema';
import resolvers from '../graphql/resolvers';
import authDirective from "../graphql/directives/auth";
import AuthDirective2 from '../graphql/directives/auth2';
import cookie from 'cookie';
import { getConnection } from '../database';
import { User } from '../database/models';
import jwt from 'jsonwebtoken';

// let schema = makeExecutableSchema({
//   typeDefs,
//   resolvers
// });

// transform schema to use auth directive
// schema = authDirective(schema, 'auth');
const apolloServer = new ApolloServer({
  typeDefs,
	resolvers,
	context: ({req, event, ...args}) => {
		return {
			token: cookie.parse(event.headers['cookie'] || "")['punchclock_auth'],
			userToken: (() => {
				let decoded;
				try {
					decoded = jwt.verify(cookie.parse(event.headers['cookie'] || "")['punchclock_auth'], import.meta.env.VITE_JWT_SECRET);
				}	catch(err) {
					decoded = {}	
				}
				return decoded;
			})(),
		};
	},
	schemaDirectives: {
		auth: AuthDirective2
	},
  playground: true,
  introspection: true,
  tracing: false,
	uploads: false,
});

const graphqlHandler = apolloServer.createHandler();

const handler: RequestHandler = async (args) => {
	// const reqBod: string = Buffer.from(args.rawBody).toString('utf-8')
	const reqBod: string = Buffer.from(args.rawBody || "")?.toString('utf-8') || "";
	// console.log(reqBod);
	return await new Promise<EndpointOutput>((resolve, reject) => {
    graphqlHandler(
      {
        httpMethod: args.method,
        headers: args.headers,
        path: args.path,
        body: reqBod
      } as any,
      {} as any,
      (err, result) => {
				console.log(err, result);
        if (err) {
					console.error(err);
          reject({
						status: 500,
						body: err
					});
        } else {
          resolve({
            status: result.statusCode,
            body: result.body,
            headers: result.headers as any,
          });
        }
      }
    ) as any;
  });
};

export const head = handler;
export const get = handler;
export const post = handler;
