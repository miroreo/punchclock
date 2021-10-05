import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async (request: VercelRequest, response: VercelResponse) => {
	console.log("Checking an authentication request!")
	if (!request.cookies.punchclock_auth) return response.status(401).send("Not authenticated.");
	try {
		const token = jwt.verify(request.cookies.punchclock_auth, process.env.JWT_SECRET)
		return response.status(200).send("Authenticated as " + token.username);	
	} catch(err) {
		return response.status(401).send("Invalid or Expired Authentication.");
	}
	
};