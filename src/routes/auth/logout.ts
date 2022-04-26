import type { EndpointOutput, RequestHandler, IncomingRequest } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const get = async (args: IncomingRequest) => {
	const cookies = cookie.parse(args.headers.cookie || '');

	// get current URL
	const currentURL =
		import.meta.env.MODE == 'development'
			? 'https://punchclock.roblockhead.repl.co'
			: 'https://punchclock.vercel.app';

	return {
		status: 303,
		headers: {
			'Set-Cookie': `punchclock_auth=revoked;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`,
			location: currentURL + '/'
		},
		body: 'Redirecting...'
	};
};
