import { error } from '@sveltejs/kit';
import { problemById, problems } from '#lib/content/problems.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => problems.map((p) => ({ slug: p.id }));

export const load: PageLoad = ({ params }) => {
	const problem = problemById(params.slug);
	if (!problem) error(404, 'No practice problem with that name.');
	return { problem };
};
