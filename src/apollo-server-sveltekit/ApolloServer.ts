import type { EndpointOutput, RequestHandler, IncomingRequest } from "@sveltejs/kit";
import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import type { ServerResponse } from 'http';
// import { send } from 'micro';
// import { parseAll } from '@hapi/accept';

import { graphqlSveltekit } from './sveltekitApollo';
// import type { MicroRequest } from './types';
import type { LandingPage } from 'apollo-server-plugin-base';

type RequestHeaders = {
	[x: string]: string | string[];
}

export class ApolloServer extends ApolloServerBase {
  // Extract Apollo Server options from the request.
  async createGraphQLServerOptions(args): Promise<GraphQLOptions> {
    return super.graphQLServerOptions(args);
  }
	response = new CustomResponse(null);
  // Prepares and returns an async function that can be used by Micro to handle
  // GraphQL requests.
  public createHandler(path?: string) {
    this.assertStarted('createHandler');

    this.graphqlPath = path || '/graphql';

    const landingPage = this.getLandingPage();

    return async (args: IncomingRequest, callback: (res) => void) => {
      try {
				// console.log(this);
				this.response.callback = (res) => callback(res);

        if (
          landingPage &&
          this.handleGraphqlRequestsWithLandingPage({ args, landingPage })
        ) {
          return;
        }
				let serverHandled = await this.handleGraphqlRequestsWithServer(args);
        if (serverHandled) {
          return;
        }
				console.log(this.response);
        this.response.status = 404;
				return;
      } catch (errorObj: any) {
        // Like Micro's sendError but without the logging.
        const statusCode = errorObj.statusCode || errorObj.status;
				this.response.status = statusCode || 500;
				this.response.body = JSON.stringify(errorObj.stack);
        callback(this.response);
      }
    };
  }

  private handleGraphqlRequestsWithLandingPage({
    args,
    landingPage,
  }: {
    args: IncomingRequest;
    landingPage: LandingPage;
  }): boolean {
    let handled = false;
    const url = args.path!.split('?')[0];
    if (args.method === 'GET' && url === this.graphqlPath) {
      const accept = args.headers['accept'] || args.headers['Accept']
			const prefersHtml = accept.indexOf("html") !== -1;

      if (prefersHtml) {
        this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
        this.response.body = landingPage.html;
				this.response.send();
        handled = true;
      }
    }

    return handled;
  }

  // Handle incoming GraphQL requests using Apollo Server.
  private async handleGraphqlRequestsWithServer(args: IncomingRequest): Promise<boolean> {
    let handled = false;
    const url = args.path!.split('?')[0];
    if (url === this.graphqlPath) {
      const graphqlHandler = graphqlSveltekit(() => {
        return this.createGraphQLServerOptions(args);
      });
      const responseData = await graphqlHandler(args, this.response);
      this.response.status = 200;
			this.response.body = responseData;
			this.response.send();
      handled = true;
    }
    return handled;
  }
}

type ResponseHeaders = {
	[x: string]: string | string[];
}

export class CustomResponse implements EndpointOutput {
	callback: (resp) => void = () => {};
	status: number = 200;
	headers: ResponseHeaders = {};
	body;

	constructor (cb: (resp) => void) {
		this.callback = cb;
	}
	
	send() {
		this.callback({
			status: this.status,
			headers: this.headers,
			body: this.body,
		})
	}
	
	setStatus(code: number) {
		this.status = code;
	}

	setHeader(key, value) {
		this.headers[key] = value;
	}
}