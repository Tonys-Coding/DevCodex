import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { briefById, briefs } from '#lib/content/briefs.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => briefs.map((b) => ({ slug: b.id }));

// Each brief's body is its own chunk, loaded only when it is opened.
const bodies = import.meta.glob<{ default: Component }>('/src/lib/content/briefs/*.svelte');

export const load: PageLoad = async ({ params }) => {
	const meta = briefById(params.slug);
	const loader = bodies[`/src/lib/content/briefs/${params.slug}.svelte`];
	if (!meta || !loader) error(404, 'That read doesn’t exist.');
	return { meta, Body: (await loader()).default };
};
