import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { User } from '../../src/database/models';
import { getConnection } from '../../src/database';
import jwt from 'jsonwebtoken';

export default async (request: VercelRequest, response: VercelResponse) => {
	// get current URL
	const currentURL = process.env.VERCEL_ENV == 'development' ? 'https://punchclock.roblockhead.repl.co' : 'https://punchclock.vercel.app';

	// get a database connection
	const dbConnection = await getConnection();

	// github CLIENT ID
	const clientId = "36f6c7eecba684a2ce94";

  const { code = null, state = null } = request.query;

	const resp = await axios.post("https://github.com/login/oauth/access_token", 
		`client_id=36f6c7eecba684a2ce94&client_secret=${process.env.GITHUB_SECRET}&code=${code}`, 
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			},
		});
	console.log("Running OAuth Callback for code " + code);
	// send client error if there's an error
	if ( resp.data.error ) {
		return response.status(400).send(`Error: ${resp.data.error}, ${resp.data.error_description}`);
	}
	const userAuthToken = resp.data.access_token;
	const userResp = await axios.get("https://api.github.com/user", {
		headers: {
			'Authorization': `token ${userAuthToken}`,
			'Accept': 'application/json',
		}
	});
	const userEmail = await axios.get("https://api.github.com/user/emails", {
		headers: {
			'Authorization': `token ${userAuthToken}`,
			'Accept': 'application/json',
		}
	});

	const user = await User.findOne({authProvider: {
		name: "github",
		userId: userResp.data.id,
	}});

	if (user.error)
		user = await User.create({
			username: userResp.data.login,
			authProvider: {
				name: "github",
				userId: userResp.data.id,
			},
			email: userEmail.data.email,
			oauthToken: userAuthToken,
			status: {
				clockedIn: false,
			},
		});

	const token = jwt.sign({
		id: user._id,
		auth_provider: "github",
		username: userResp.data.login,
		iat: Math.floor(Date.now() / 1000)
		}, process.env.JWT_SECRET, { expiresIn: '1yr' });

  response
		.status(303)
		.setHeader('Set-Cookie', [`punchclock_auth=${token};path=/`])
		.setHeader('location', currentURL + '/')
		// .send(`OAuth2 Response: ${JSON.stringify(userResp.data)}`);
};