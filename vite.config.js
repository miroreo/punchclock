import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		svelte()
	],
	server: {
		hmr: {
			clientPort: 443
		},
		// proxy: {
		// 	'/api': 'http://127.0.0.1:5000/api/'
		// }
	}
})
