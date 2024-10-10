import adapter from '@sveltejs/adapter-node';
import {
	vitePreprocess
} from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build', // Output-mappen til GitHub Pages
			assets: 'build', // Samme som pages, så assets også bliver lagt i build
			fallback: null // Ingen fallback (f.eks. hvis du ikke bruger en SPA)
		}),
		paths: {
			base: '', // REPO-NAME er navnet på dit GitHub repo
		}
	},
	preprocess: vitePreprocess()
};

export default config;