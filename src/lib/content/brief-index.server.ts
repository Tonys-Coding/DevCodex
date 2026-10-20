import { keywordsOf, sectionsOf } from './article-markup';

/**
 * Section headings and key terms of every TL;DR, read from the source at build time,
 * so Learn search can find a term inside a brief without loading its code.
 */
export type BriefIndex = Record<string, { id: string; text: string; keywords: string[] }[]>;

const sources = import.meta.glob<string>('/src/lib/content/briefs/*.svelte', { eager: true, query: '?raw', import: 'default' });

export const briefIndex: BriefIndex = Object.fromEntries(
	Object.entries(sources).map(([path, code]) => {
		const id = path.split('/').pop()!.replace(/\.svelte$/, '');
		const keywords = keywordsOf(code);
		return [id, sectionsOf(code).map((t) => ({ id: t.id, text: t.text, keywords: keywords[t.id] ?? [] }))];
	})
);
