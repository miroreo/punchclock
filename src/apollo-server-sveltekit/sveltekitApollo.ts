import { GraphQLOptions, runHttpQuery } from 'apollo-server-core';
import type { EndpointOutput, RequestHandler, Request, IncomingRequest } from '@sveltejs/kit';
import { send, json } from 'micro';
import url from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import typeis from 'type-is';
import type { CustomResponse } from '../apollo-server-sveltekit/ApolloServer';
// import type { MicroRequest } from './types';
import type { ValueOrPromise } from 'apollo-server-types';
import { Request as NodeRequest } from 'apollo-server-env';
// Allowed Micro Apollo Server options.
export interface MicroGraphQLOptionsFunction {
	(req?: IncomingRequest): ValueOrPromise<GraphQLOptions>;
}
type RequestHeaders = {
	[x: string]: string;
};

var enc = new TextDecoder('utf-8');
const convertHeaders = (inHead: RequestHeaders): Headers => {
	let out = new Headers();
	for (const [key, value] of Object.entries(inHead)) {
		out.set(key, value);
	}
	return out;
}
function setHeaders(res: CustomResponse, headers: Record<string, string>): void {
	Object.entries(headers).forEach(([header, value]) => {
		res.setHeader(header, value);
	});
}
const convertNodeHttpToRequest = (req: Request): Request  => {
  const headers = new Headers();
  Object.keys(req.headers).forEach((key) => {
    const values = req.headers[key]!;
    if (Array.isArray(values)) {
      values.forEach((value) => headers.append(key, value));
    } else {
      headers.append(key, values);
    }
  });

  return new NodeRequest("https://" + req.host + req.path, {
    headers,
    method: req.method,
		body: req.body
  });
}

export function graphqlSveltekit(options: GraphQLOptions | MicroGraphQLOptionsFunction) {
	if (!options) {
		throw new Error('Apollo Server requires options.');
	}

	if (arguments.length > 1) {
		throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
	}

	const graphqlHandler = async (args: Request, response: CustomResponse) => {
		const contentType = args.headers['content-type'];
		console.log(args);
		const query =
			args.method === 'POST'
				? contentType &&
				  contentType !== '0' &&
				  typeis.is(contentType, 'application/json') &&
				  (JSON.parse(JSON.stringify(args.body)))
				: args.query;
		console.log(query);
		try {
			console.log(args.body);
			console.log(convertNodeHttpToRequest(args).body);
			const { graphqlResponse, responseInit } = await 
			runHttpQuery([args], {
				method: args.method!,
				options,
				query: query as any,
				request: {
					url: "https://" + args.host + args.path,
					method: args.method,
					headers: convertHeaders(args.headers)
				}
			});

			setHeaders(response, responseInit.headers!);
			const statusCode = responseInit.status || 200;
			response.status = statusCode;
			response.body = graphqlResponse;
			response.send();

			return undefined;
		} catch (error) {
			if (error.name === 'HttpQueryError' && error.headers) {
				setHeaders(response, error.headers);
			}

			response.status = (error as any).statusCode || 500;
			response.body = (error as Error).message;
			response.send();
			return undefined;
		}
	};

	return graphqlHandler;
}
