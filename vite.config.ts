import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sitePlugin } from './tools/vite-plugin-site.ts';

export default defineConfig({
	plugins: [
		// virtual:site-config (site.config.toml) and virtual:sample-data
		sitePlugin(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Fully prerendered. GitHub Pages serves 404.html for unknown paths;
			// it boots the app, which renders src/routes/+error.svelte.
			adapter: adapter({ fallback: '404.html', strict: true }),
			// The org site lives at the root of exynos-linux.github.io.
			paths: { base: '' },
			prerender: {
				entries: ['*'],
				handleHttpError: 'fail',
				handleMissingId: 'fail'
			}
		})
	]
});
