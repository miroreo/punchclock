import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (request: VercelRequest, response: VercelResponse) => {
	// block github auth in preview environment
	if (process.env.VERCEL_ENV == "preview") return response.status(403).send("GitHub Authentication is not supported in the preview environment.");

	return response.status(303).setHeader('location', `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=https://${process.env.VERCEL_URL}/api/auth/callback&scope=read:user,user:email`);
};