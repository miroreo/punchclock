const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../components/error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/about.svelte"),
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

	// src/routes/todos/index.json.ts
	[/^\/todos\.json$/],

	// src/routes/todos/index.svelte
	[/^\/todos\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/todos/[uid].json.ts
	[/^\/todos\/([^/]+?)\.json$/],

	// src/routes/api/graphql.ts
	[/^\/api\/graphql\/?$/],

	// src/routes/api/hello.ts
	[/^\/api\/hello\/?$/],

	// src/routes/api/auth/callback.ts
	[/^\/api\/auth\/callback\/?$/],

	// src/routes/api/auth/redirect.ts
	[/^\/api\/auth\/redirect\/?$/],

	// src/routes/api/auth/status.ts
	[/^\/api\/auth\/status\/?$/]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];