import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { articleMarkup } from './src/lib/content/article-markup';

// GitHub Pages serves this project from https://<user>.github.io/DevCodex/.
// `vite dev` stays at the domain root; the production build carries the /DevCodex base.
const base = process.env.NODE_ENV === 'production' ? '/DevCodex' : '';

export default defineConfig({
	// Runner workers use dynamic import (Pyodide), which needs ES-module workers.
	worker: { format: 'es' },
	plugins: [
		sveltekit({
			preprocess: [articleMarkup],
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				// Deep links that were never prerendered fall back to the shell page.
				fallback: '404.html',
				precompress: false,
				strict: false
			}),
			paths: {
				base
			}
		})
	]
});
