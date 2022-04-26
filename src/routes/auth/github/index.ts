import type { IncomingRequest } from '@svelte/kit';

export const get = (args: IncomingRequest) => {
	const currentURL =
		import.meta.env.MODE == 'development'
			? 'https://punchclock.roblockhead.repl.co'
			: 'https://punchclock.vercel.app';
	// block github auth in preview environment
	if (import.meta.env.VITE_VERCEL_ENV == 'preview')
		return {
			status: 503,
			body: 'GitHub Authentication is not supported in the preview environment.'
		};
	else
		return {
			status: 303,
			headers: {
				location: `https://github.com/login/oauth/authorize?client_id=${
					import.meta.env.VITE_GITHUB_CLIENT_ID
				}&redirect_uri=${currentURL}/auth/github/callback&scope=read:user,user:email`
			},
			body: 'Redirecting...'
		};
};
