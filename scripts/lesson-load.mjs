// Loads the content modules (TypeScript) for the lesson scripts. Node strips the types;
// this hook only fills in the .ts extension that Vite lets the sources leave out.
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

registerHooks({
	resolve(specifier, context, next) {
		if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]s$/.test(specifier) && context.parentURL?.endsWith('.ts')) {
			const url = new URL(specifier + '.ts', context.parentURL);
			if (existsSync(url)) return next(url.href, context);
		}
		return next(specifier, context);
	}
});

export const root = fileURLToPath(new URL('..', import.meta.url));
export const { articles, practiceFor } = await import('../src/lib/content/catalog.ts');
export const { cards } = await import('../src/lib/content/cards.ts');
export const { sectionsOf } = await import('../src/lib/content/article-markup.ts');
export const { problems } = await import('../src/lib/content/problems.ts');

/** Where an article sits in its topic's path, as a `place` value for the lesson file. */
export function placeOf(id) {
	const a = articles.find((x) => x.id === id);
	const same = articles.filter((x) => x.track === a.track);
	const k = same.indexOf(a);
	if (k > 0) return `after ${same[k - 1].id}`;
	if (same.length > 1) return `before ${same[1].id}`;
	return undefined;
}

/** Core reading time: Core words ÷ 160, as the catalog's `minutes`. */
export function coreMinutes(svelte) {
	const words = sectionsOf(svelte)
		.filter((s) => s.depth === 'core')
		.reduce((n, s) => n + s.words, 0);
	return Math.max(1, Math.round(words / 160));
}
