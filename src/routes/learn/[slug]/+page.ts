import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { articleById, liveArticles } from '#lib/content/catalog.js';
import type { TocEntry } from '#lib/content/article-markup.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => liveArticles.map((a) => ({ slug: a.id }));

// Each article body is its own chunk, loaded only when that article is opened.
const bodies = import.meta.glob<{ default: Component; toc?: TocEntry[] }>('/src/lib/content/articles/*.svelte');

export const load: PageLoad = async ({ params }) => {
	const meta = articleById(params.slug);
	const loader = bodies[`/src/lib/content/articles/${params.slug}.svelte`];
	if (!meta || meta.status !== 'live' || !loader) error(404, 'That article is not written yet.');
	const mod = await loader();
	return { meta, Body: mod.default, toc: mod.toc ?? [] };
};
