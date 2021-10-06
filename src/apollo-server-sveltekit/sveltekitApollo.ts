import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
	
} from 'apollo-server-core';
import type { EndpointOutput, RequestHandler, IncomingRequest } from "@sveltejs/kit";
import { send, json } from 'micro';
import url from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import typeis from 'type-is';
import type {CustomResponse} from '../apollo-server-sveltekit/ApolloServer';
// import type { MicroRequest } from './types';
import type { ValueOrPromise } from 'apollo-server-types';

// Allowed Micro Apollo Server options.
export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): ValueOrPromise<GraphQLOptions>;
}
var enc = new TextDecoder("utf-8");

function setHeaders(
  res: CustomResponse,
  headers: Record<string, string>,
): void {
  Object.entries(headers).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
}

export function graphqlSveltekit(
  options: GraphQLOptions | MicroGraphQLOptionsFunction,
) {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (args: IncomingRequest, response: CustomResponse) => {
    const contentType = args.headers['content-type'];
    const query = 
      args.method === 'POST'
        ? (contentType &&
            args.headers['content-length'] &&
            args.headers['content-length'] !== '0' &&
            typeis.is(contentType, 'application/json') &&
            (await JSON.parse(enc.decode(args.rawBody))))
        : args.query;

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([args], {
        method: args.method!,
        options,
        query: query as any,
        request: convertNodeHttpToRequest(args as unknown as IncomingMessage),
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