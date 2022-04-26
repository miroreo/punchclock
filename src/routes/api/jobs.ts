import { getConnection } from '../../database';
import { Job } from '../../database/models';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import type { EndpointOutput, IncomingRequest } from '@svelte/kit';

export const get = async (args: IncomingRequest): EndpointOutput => {
	const dbConnection = await getConnection();
	const currentURL =
		import.meta.env.MODE == 'development'
			? 'https://punchclock.roblockhead.repl.co'
			: 'https://punchclock.vercel.app';
	const cookies = cookie.parse(args.headers.cookie || '');
	if(!cookies.punchclock_auth) return {
		status: 401,
		body: {
			error: "You aren't logged in!"
		},
		headers: {
			'WWW-Authenticate': 'Basic realm="/api/jobs"'
		}
	}
	let decoded;
	try {
		decoded = jwt.verify(cookies.punchclock_auth, import.meta.env.VITE_JWT_SECRET);
	}	catch(err) {
		return {
			status: 401,
			body: {
				error: "Invalid Token"
			},
			headers: {
				'WWW-Authenticate': 'Basic realm="/api/jobs"'
			}
		}	
	}
	let jobs = Job.find({
		owner: decoded.id
	})
	if(!jobs) return {
		status: 200,
		body: {}
	}
	return {
		status: 200,
		body: {
			...jobs
		}
	}
};
