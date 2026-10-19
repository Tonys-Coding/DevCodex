import { error } from '@sveltejs/kit';
import { articleById, liveArticles } from '#lib/content/catalog.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => liveArticles.map((a) => ({ slug: a.id }));

export const load: PageLoad = ({ params }) => {
	const meta = articleById(params.slug);
	if (!meta || meta.status !== 'live') error(404, 'That article is not written yet.');
	return { meta };
};
