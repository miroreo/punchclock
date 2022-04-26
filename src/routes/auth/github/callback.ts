import type { EndpointOutput, RequestHandler, IncomingRequest } from '@sveltejs/kit';
import axios, {AxiosResponse} from 'axios';
import { User } from '../../../database/models';
import { getConnection } from '../../../database';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const get = async (args: IncomingRequest) => {
	const cookies = cookie.parse(args.headers.cookie || '');

	// get current URL
	const currentURL =
		import.meta.env.MODE == 'development'
			? 'https://punchclock.roblockhead.repl.co'
			: 'https://punchclock.vercel.app';

	// get a database connection
	const dbConnection = await getConnection();
	
	const code = args.query.get('code') || null;
	const state = args.query.get('state') || null;
	if (!code) return { status: 404, body: 'No code provided.' };
	const resp = await axios.post<string, AxiosResponse<{error: string, error_description: string, access_token: string}>>(
		'https://github.com/login/oauth/access_token',
		`client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&client_secret=${
			import.meta.env.VITE_GITHUB_SECRET
		}&code=${code}`,
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			}
		}
	);
	console.log('Running OAuth Callback for code ' + code);
	// send client error if there's an error
	if (resp.data.error) {
		return {
			status: 400,
			body: `Error: ${resp.data.error}, ${resp.data.error_description}`
		};
	}
	const userAuthToken = resp.data.access_token;
	const userResp = await axios.get<{
		id?: number;
		login: string;
	}>('https://api.github.com/user', {
		headers: {
			Authorization: `token ${userAuthToken}`,
			Accept: 'application/json'
		}
	});
	const userEmail = await axios.get<
		{
			email: string;
		}[]
	>('https://api.github.com/user/emails', {
		headers: {
			Authorization: `token ${userAuthToken}`,
			Accept: 'application/json'
		}
	});

	let user = await User.findOne({
		authProvider: {
			name: 'github',
			userId: userResp.data.id
		}
	});

	if (!user)
		user = await User.create({
			username: userResp.data.login,
			authProvider: {
				name: 'github',
				userId: userResp.data.id
			},
			email: userEmail.data[0].email,
			oauthToken: userAuthToken,
			status: {
				clockedIn: false
			}
		});
	let token;
	if (
		!cookies.punchclock_auth ||
		!jwt.verify(cookies.punchclock_auth, import.meta.env.VITE_JWT_SECRET)
	)
		token = jwt.sign(
			{
				id: user._id,
				auth_provider: 'github',
				username: userResp.data.login,
				iat: Math.floor(Date.now() / 1000)
			},
			import.meta.env.VITE_JWT_SECRET,
			{ expiresIn: '60d' }
		);
	else token = cookies.punchclock_auth;

	return {
		status: 303,
		headers: {
			'Set-Cookie': `punchclock_auth=${token};path=/`,
			location: currentURL + '/'
		},
		body: 'Redirecting...'
	};
};
