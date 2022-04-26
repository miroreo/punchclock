const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../../../src/routes/__error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/about.svelte"),
	() => import("../../../src/routes/login.svelte"),
	() => import("../../../src/routes/todos/index.svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/graphql.ts
	[/^\/graphql\/?$/],

	// src/routes/about.svelte
	[/^\/about\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/login.svelte
	[/^\/login\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/todos/index.json.ts
	[/^\/todos\.json$/],

	// src/routes/todos/index.svelte
	[/^\/todos\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/todos/[uid].json.ts
	[/^\/todos\/([^/]+?)\.json$/],

	// src/routes/auth/github/index.ts
	[/^\/auth\/github\/?$/],

	// src/routes/auth/github/callback.ts
	[/^\/auth\/github\/callback\/?$/],

	// src/routes/auth/logout.ts
	[/^\/auth\/logout\/?$/],

	// src/routes/api/hello.ts
	[/^\/api\/hello\/?$/],

	// src/routes/api/jobs.ts
	[/^\/api\/jobs\/?$/]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];