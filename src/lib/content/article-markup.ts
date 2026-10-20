import type { PreprocessorGroup } from 'svelte/compiler';

/**
 * Build-time markup pass over src/lib/content/articles/*.svelte. It does two jobs:
 *
 * 1. Tables. On phones, `.prose` tables stack each row into a card (see app.css), so
 *    every cell needs its column name. Each `<th scope="col">` text is copied into a
 *    `data-label` on the matching body cell, and ARIA table roles are added so the
 *    stacked layout keeps its table semantics.
 * 2. Sections. Every `<h2>` gets an id, and the article exports `toc` (id, text, layer and
 *    size of each section) and `quizzes` (each check, with its layer) from a module script,
 *    so the shell can render contents, layers and pack rules at prerender time.
 */
const strip = (html: string) =>
	html
		.replace(/<br\s*\/?>/g, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\{'([{}])'\}/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();

const attr = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/[{}]/g, '');

function labelTable(table: string): string {
	const headRow = table.match(/<thead>[\s\S]*?<\/thead>/)?.[0];
	if (!headRow) return table;
	const labels = [...headRow.matchAll(/<th scope="col">([\s\S]*?)<\/th>/g)].map((m) => attr(strip(m[1])));

	// The roles look redundant to the compiler, but display: block on phones strips table semantics in some browsers.
	return table
		.replace('<table>', '<!-- svelte-ignore a11y_no_redundant_roles -->\n<table role="table">')
		.replace(/<(thead|tbody)>/g, '<$1 role="rowgroup">')
		.replace(/<th scope="col">/g, '<th scope="col" role="columnheader">')
		.replace(/<tbody role="rowgroup">([\s\S]*?)<\/tbody>/, (_, body: string) => {
			const rows = body.replace(/<tr>([\s\S]*?)<\/tr>/g, (_row, cells: string) => {
				let i = 0;
				const labelled = cells.replace(/<(td|th)(\s[^>]*)?>/g, (_cell, tag: string, rest = '') => {
					const role = tag === 'th' ? 'rowheader' : 'cell';
					const label = labels[i++] ?? '';
					return `<${tag}${rest} role="${role}" data-label="${label}">`;
				});
				return `<tr role="row">${labelled}</tr>`;
			});
			return `<tbody role="rowgroup">${rows}</tbody>`;
		})
		.replace(/(<thead role="rowgroup">\s*)<tr>/, '$1<tr role="row">');
}

import type { Depth } from './types.ts';

/** A section of an article: its heading, which layer it sits in, and roughly how many words it holds. */
export type TocEntry = { id: string; text: string; depth: Depth; words: number };

const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[’']/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/** Which layer a position in the source belongs to: inside <Layer depth="…">…</Layer>, or Core. */
function layerAt(code: string): (pos: number) => Depth {
	const regions: { from: number; to: number; depth: Depth }[] = [];
	for (const m of code.matchAll(/<Layer\b[^>]*\bdepth="(deeper|hood)"[^>]*>/g)) {
		const close = code.indexOf('</Layer>', m.index);
		regions.push({ from: m.index!, to: close < 0 ? code.length : close, depth: m[1] as Depth });
	}
	return (pos) => regions.find((r) => pos >= r.from && pos < r.to)?.depth ?? 'core';
}

/**
 * Reading size of a stretch of article source. Tags are dropped, a code sample counts
 * as six words a line (code reads slowly), and quiz prompts and options count as text.
 */
const wordCount = (html: string) =>
	html
		.replace(/<Code\b[\s\S]*?code=\{`([\s\S]*?)`\}([\s\S]*?)\/>/g, (_, c: string, rest: string) =>
			' w'.repeat(c.split('\n').length * 6) + ' ' + (rest.match(/caption="([^"]*)"/)?.[1] ?? '')
		)
		.replace(/<Quiz\b[\s\S]*?questions=\{\[([\s\S]*?)\]\}\s*\/>/g, (_, q: string) =>
			(q.match(/'(?:[^'\\]|\\.)*'/g) ?? []).join(' ')
		)
		.replace(/<script[\s\S]*?<\/script>/g, ' ')
		.replace(/<style[\s\S]*?<\/style>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.split(/\s+/)
		.filter((w) => /[A-Za-z0-9]/.test(w)).length;

/** The article's <h2> sections, with the ids the preprocessor gives them, their layer and size. */
export function sectionsOf(code: string): TocEntry[] {
	const toc: TocEntry[] = [];
	const seen = new Set<string>();
	const depthAt = layerAt(code);
	const heads = [...code.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
	heads.forEach((m, i) => {
		const text = strip(m[1]);
		let id = slug(text) || 'section';
		for (let n = 2; seen.has(id); n++) id = `${slug(text)}-${n}`;
		seen.add(id);
		const end = heads[i + 1]?.index ?? code.length;
		toc.push({ id, text, depth: depthAt(m.index!), words: wordCount(code.slice(m.index!, end)) });
	});
	return toc;
}

/**
 * Key terms per section: whatever the lesson sets in <strong>, <code> or <dt> between one
 * <h2> and the next. Search uses them to find "ETag" or "preflight" inside a section.
 */
export function keywordsOf(code: string): Record<string, string[]> {
	const toc = sectionsOf(code);
	const parts = code.split(/<h2>[\s\S]*?<\/h2>/).slice(1);
	return Object.fromEntries(
		toc.map((t, i) => {
			const words = new Set<string>();
			for (const [, inner] of (parts[i] ?? '').matchAll(/<(?:strong|code|dt)>([\s\S]*?)<\/(?:strong|code|dt)>/g)) {
				const word = strip(inner).replace(/^[“"]|[”".:]$/g, '');
				if (word.length > 1 && word.length <= 40) words.add(word);
			}
			return [t.id, [...words]];
		})
	);
}

/** Every <Quiz> in the article: its title (default "Quick check") and number of questions. */
export function quizzesOf(code: string, articleId: string) {
	const depthAt = layerAt(code);
	return [...code.matchAll(/<Quiz\b[\s\S]*?\n\/>/g)].map((m) => {
		const block = m[0];
		const title = block.match(/\btitle="([^"]+)"/)?.[1] ?? 'Quick check';
		return { key: `${articleId}:${title}`, title, total: (block.match(/\bprompt:/g) ?? []).length, depth: depthAt(m.index!) };
	});
}

function addSections(code: string, articleId: string): string {
	const toc = sectionsOf(code);
	const quizzes = quizzesOf(code, articleId);
	let i = 0;
	const withIds = code.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => `<h2 id="${toc[i++].id}">${inner}</h2>`);
	const exported = `\n\texport const toc = ${JSON.stringify(toc)};\n\texport const quizzes = ${JSON.stringify(quizzes)};\n`;
	const moduleScript = /<script lang="ts" module>/;
	return moduleScript.test(withIds)
		? withIds.replace(moduleScript, (m) => m + exported)
		: `<script lang="ts" module>${exported}</script>\n\n` + withIds;
}

export const articleMarkup: PreprocessorGroup = {
	name: 'devcodex-article-markup',
	markup({ content, filename }) {
		if (!filename || !/[/\\]content[/\\](?:articles|briefs)[/\\][^/\\]+\.svelte$/.test(filename)) return;
		const articleId = filename.split(/[/\\]/).pop()!.replace(/\.svelte$/, '');
		return { code: addSections(content.replace(/<table>[\s\S]*?<\/table>/g, labelTable), articleId) };
	}
};
