import { ApolloServer, gql } from 'apollo-server-micro';
import { getConnection } from '../src/database';
import cors from 'micro-cors';
const corsYay = cors();

const typeDefs = gql`
	type Query {
		sayHello: String
	}
`;

const resolvers = {
	Query: {
		sayHello(parent, args, context) {
			return 'Hello World!';
		}
	}
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export default apolloServer.start().then(() => {
	const handler = apolloServer.createHandler({ path: '/api/graphql' });
	return corsYay((req, res) =>
		req.method === 'OPTIONS' ? res.send(res, 200, 'ok') : handler(req, res)
	);
});
