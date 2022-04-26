import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (request: VercelRequest, response: VercelResponse) => {
	const currentURL =
		process.env.VERCEL_ENV == 'development'
			? 'https://punchclock.roblockhead.repl.co'
			: 'https://punchclock.vercel.app';
	// block github auth in preview environment
	console.log('handling redirect. environment: ' + process.env.VERCEL_ENV);
	if (process.env.VERCEL_ENV == 'preview')
		response.status(503).send('GitHub Authentication is not supported in the preview environment.');
	else
		response
			.status(303)
			.setHeader(
				'location',
				`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${currentURL}/api/auth/callback&scope=read:user,user:email`
			)
			.send(' ');
};
