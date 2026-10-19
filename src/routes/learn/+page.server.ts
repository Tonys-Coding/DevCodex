import { articleIndex } from '#lib/content/article-index.server.js';
import type { PageServerLoad } from './$types';

// Prerendered: the index is computed at build time and shipped as page data.
export const load: PageServerLoad = () => ({ index: articleIndex });
