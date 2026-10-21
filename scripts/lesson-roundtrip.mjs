// Proves the Markdown lesson format covers every live lesson: each one is exported to the
// format and converted back, and the result must mean exactly the same as the original
// (same markup, text, attributes and quiz data, ignoring whitespace and formatting), with
// the same catalog entry, cards and practice links. Run: npm run lesson:roundtrip
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { canonical, toMarkdown, toSvelte } from './lesson-format.mjs';
import { articles, cards, coreMinutes, placeOf, practiceFor, root } from './lesson-load.mjs';

/** The first place two JSON values differ, as a readable path. */
function firstDiff(a, b, path = '') {
	if (JSON.stringify(a) === JSON.stringify(b)) return null;
	if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return `${path || '(root)'}: ${JSON.stringify(a)?.slice(0, 160)} ≠ ${JSON.stringify(b)?.slice(0, 160)}`;
	for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
		const d = firstDiff(a[k], b[k], `${path}/${k}`);
		if (d) return d;
	}
	return null;
}

let failures = 0;
let rawTotal = 0;
let blockTotal = 0;
for (const meta of articles.filter((a) => a.status === 'live')) {
	const svelte = await readFile(join(root, `src/lib/content/articles/${meta.id}.svelte`), 'utf8');
	const own = cards.filter((c) => c.unlockedBy === meta.id);
	const { md, raw, total } = toMarkdown(svelte, meta, own, practiceFor[meta.id], placeOf(meta.id));
	rawTotal += raw;
	blockTotal += total;
	const back = toSvelte(md);
	const problems = [];

	const body = firstDiff(JSON.parse(canonical(svelte)), JSON.parse(canonical(back.svelte)));
	if (body) problems.push(`body differs at ${body}`);

	const m = back.meta;
	const catalogBack = {
		id: m.id,
		...(m.builds?.length ? { builds: [].concat(m.builds) } : {}),
		track: m.track,
		level: m.level,
		status: 'live',
		title: m.title,
		summary: m.summary,
		dek: m.dek,
		assumes: m.assumes,
		minutes: Number(m.minutes)
	};
	const cat = firstDiff(meta, catalogBack);
	if (cat) problems.push(`catalog differs at ${cat}`);

	const cardsBack = back.cards.map((c) => ({ id: c.id, term: c.term, track: m.track, question: c.question, answer: c.answer, detail: c.detail, unlockedBy: m.id, ...(c.layer ? { layer: c.layer } : {}), level: c.level }));
	const cd = firstDiff(own, cardsBack);
	if (cd) problems.push(`cards differ at ${cd}`);

	const pr = firstDiff(practiceFor[meta.id] ?? [], [].concat(back.practice ?? []));
	if (pr) problems.push(`practice differs at ${pr}`);

	// The importer's automatic reading time should agree with the catalog, within a minute.
	const auto = coreMinutes(back.svelte);
	const note = Math.abs(auto - meta.minutes) > 1 ? ` (auto minutes would be ${auto}, catalog says ${meta.minutes})` : '';

	if (problems.length) {
		failures++;
		console.log(`✗ ${meta.id}\n${problems.map((p) => `    ${p}`).join('\n')}`);
	} else console.log(`✓ ${meta.id}: ${total - raw}/${total} blocks in Markdown${raw ? `, ${raw} raw Svelte` : ''}${note}`);
}
console.log(`\n${failures ? `${failures} lessons did not round-trip.` : 'Every live lesson round-trips exactly.'} ${blockTotal - rawTotal} of ${blockTotal} blocks use the Markdown format.`);
process.exit(failures ? 1 : 0);
