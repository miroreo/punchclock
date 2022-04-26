import sveltePreprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';

export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		sveltePreprocess({
			// defaults: {
			// 	style: 'postcss'
			// },
			// postcss: true
		})
	],

	kit: {
		adapter: vercel(),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			server: {
				hmr: {
					clientPort: 443
				}
			}
		}
	}
};
