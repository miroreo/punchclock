export const get = (req) => {
	return {
		status: 200,
		body: `Hello ${req.query.name ? req.query.name : 'World'}!`
	};
};
