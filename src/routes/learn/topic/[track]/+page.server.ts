import { error } from '@sveltejs/kit';
import { tracks, articlesInTrack } from '#lib/content/catalog.js';
import { articleIndex } from '#lib/content/article-index.server.js';
import type { TrackId } from '#lib/content/types.js';
import type { EntryGenerator, PageServerLoad } from './$types';

// One prerendered page per topic.
export const entries: EntryGenerator = () => tracks.map((t) => ({ track: t.id }));

export const load: PageServerLoad = ({ params }) => {
	const track = tracks.find((t) => t.id === params.track);
	if (!track) error(404, 'There is no topic with that name.');
	const ids = articlesInTrack(track.id as TrackId).map((a) => a.id);
	// Only this topic's slice of the lesson index: sections and quick checks, for pack status on the cards.
	const index = Object.fromEntries(ids.filter((id) => articleIndex[id]).map((id) => [id, articleIndex[id]]));
	return { trackId: track.id as TrackId, index };
};
