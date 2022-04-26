// get current URL
const currentURL = !import.meta.env.PROD
	? 'https://punchclock.roblockhead.repl.co'
	: 'https://punchclock.vercel.app';

export const getCurrentAuthState = async (): Promise<Boolean> => {
	// const res = await fetch(currentURL + '/api/auth/status')
	// if ((await res.text()).indexOf("Authenticated as") !== -1) {
	// 	return true
	// } else return false;
	return false;
};
