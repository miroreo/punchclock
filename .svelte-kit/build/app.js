import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "../../src/hooks.ts";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"/favicon.png\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\n\t\t" + head + "\n\t</head>\n\t<body>\n\t\t<div id=\"svelte\">" + body + "</div>\n\t</body>\n</html>\n";

let options = null;

const default_settings = { paths: {"base":"","assets":""} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	const hooks = get_hooks(user_hooks);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: assets + "/_app/start-42a36133.js",
			css: [assets + "/_app/assets/start-d977ffc4.css"],
			js: [assets + "/_app/start-42a36133.js",assets + "/_app/chunks/vendor-8b3525a6.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => assets + "/_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: (error, request) => {
			hooks.handleError({ error, request });
			error.stack = options.get_stack(error);
		},
		hooks,
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		prerender: true,
		read: settings.read,
		root,
		service_worker: null,
		router: true,
		ssr: true,
		target: "#svelte",
		template,
		trailing_slash: "never"
	};
}

// input has already been decoded by decodeURI
// now handle the rest that decodeURIComponent would do
const d = s => s
	.replace(/%23/g, '#')
	.replace(/%3[Bb]/g, ';')
	.replace(/%2[Cc]/g, ',')
	.replace(/%2[Ff]/g, '/')
	.replace(/%3[Ff]/g, '?')
	.replace(/%3[Aa]/g, ':')
	.replace(/%40/g, '@')
	.replace(/%26/g, '&')
	.replace(/%3[Dd]/g, '=')
	.replace(/%2[Bb]/g, '+')
	.replace(/%24/g, '$');

const empty = () => ({});

const manifest = {
	assets: [{"file":"favicon.png","size":1571,"type":"image/png"},{"file":"robots.txt","size":67,"type":"text/plain"},{"file":"svelte-welcome.png","size":360807,"type":"image/png"},{"file":"svelte-welcome.webp","size":115470,"type":"image/webp"}],
	layout: "src/routes/__layout.svelte",
	error: "src/routes/__error.svelte",
	routes: [
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/graphql\/?$/,
						params: empty,
						load: () => import("../../src/routes/graphql.ts")
					},
		{
						type: 'page',
						pattern: /^\/about\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/login\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/login.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/todos\.json$/,
						params: empty,
						load: () => import("../../src/routes/todos/index.json.ts")
					},
		{
						type: 'page',
						pattern: /^\/todos\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/todos/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/todos\/([^/]+?)\.json$/,
						params: (m) => ({ uid: d(m[1])}),
						load: () => import("../../src/routes/todos/[uid].json.ts")
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/github\/?$/,
						params: empty,
						load: () => import("../../src/routes/auth/github/index.ts")
					},
		{
						type: 'endpoint',
						pattern: /^\/auth\/github\/callback\/?$/,
						params: empty,
						load: () => import("../../src/routes/auth/github/callback.ts")
					},
		{
						type: 'endpoint',
						pattern: /^\/api\/hello\/?$/,
						params: empty,
						load: () => import("../../src/routes/api/hello.ts")
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, resolve }) => resolve(request)),
	handleError: hooks.handleError || (({ error }) => console.error(error.stack)),
	externalFetch: hooks.externalFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("../../src/routes/__layout.svelte"),"src/routes/__error.svelte": () => import("../../src/routes/__error.svelte"),"src/routes/index.svelte": () => import("../../src/routes/index.svelte"),"src/routes/about.svelte": () => import("../../src/routes/about.svelte"),"src/routes/login.svelte": () => import("../../src/routes/login.svelte"),"src/routes/todos/index.svelte": () => import("../../src/routes/todos/index.svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-4fc6b948.js","css":["assets/pages/__layout.svelte-53684cb8.css"],"js":["pages/__layout.svelte-4fc6b948.js","chunks/vendor-8b3525a6.js"],"styles":[]},"src/routes/__error.svelte":{"entry":"pages/__error.svelte-b41eb08f.js","css":[],"js":["pages/__error.svelte-b41eb08f.js","chunks/vendor-8b3525a6.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-db055285.js","css":["assets/pages/index.svelte-7523914d.css"],"js":["pages/index.svelte-db055285.js","chunks/vendor-8b3525a6.js"],"styles":[]},"src/routes/about.svelte":{"entry":"pages/about.svelte-1724db51.js","css":["assets/pages/about.svelte-eab7e969.css"],"js":["pages/about.svelte-1724db51.js","chunks/vendor-8b3525a6.js"],"styles":[]},"src/routes/login.svelte":{"entry":"pages/login.svelte-f978eb9b.js","css":[],"js":["pages/login.svelte-f978eb9b.js","chunks/vendor-8b3525a6.js"],"styles":[]},"src/routes/todos/index.svelte":{"entry":"pages/todos/index.svelte-3d16c66c.js","css":["assets/pages/todos/index.svelte-28da250b.css"],"js":["pages/todos/index.svelte-3d16c66c.js","chunks/vendor-8b3525a6.js"],"styles":[]}};

async function load_component(file) {
	const { entry, css, js, styles } = metadata_lookup[file];
	return {
		module: await module_lookup[file](),
		entry: assets + "/_app/" + entry,
		css: css.map(dep => assets + "/_app/" + dep),
		js: js.map(dep => assets + "/_app/" + dep),
		styles
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}