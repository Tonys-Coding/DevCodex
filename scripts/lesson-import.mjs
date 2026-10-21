// Imports lessons written in the Markdown lesson format (see
// .claude/skills/lesson-writer/web-edition.md) into the app: the lesson body, its catalog
// entry, its cards and its practice links. Re-importing a lesson replaces it in place.
//
//   npm run lesson:import -- <file.md | folder>       write into the app
//   npm run lesson:import -- <file.md | folder> --out <dir>   write to a folder instead
//
// After importing, run `npm run content:check`: it runs every code sample, checks the
// structure, and lists the card art and banner scene still to draw.
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { jsStr, toSvelte } from './lesson-format.mjs';
import { articles, coreMinutes, problems as practiceProblems, root } from './lesson-load.mjs';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : undefined;
const target = args.find((a, k) => !a.startsWith('--') && (outIdx < 0 || k !== outIdx + 1));
if (!target) {
	console.error('Usage: npm run lesson:import -- <file.md | folder> [--out <dir>]');
	process.exit(1);
}

const TRACKS = ['web', 'programming', 'structures'];
const LEVELS = ['easy', 'medium', 'hard'];

/** Reads every .md lesson file at the target (a file or a folder). */
async function files(path) {
	if ((await stat(path)).isDirectory()) return (await readdir(path)).filter((f) => f.endsWith('.md') && !/^readme/i.test(f)).map((f) => join(path, f));
	return [path];
}

/** Builds the catalog entry and cards from a converted lesson, or lists what's wrong. */
function entries(lesson) {
	const m = lesson.meta;
	const problems = [];
	for (const k of ['id', 'track', 'level', 'title', 'summary', 'dek', 'assumes']) if (!m[k]) problems.push(`front matter is missing “${k}”`);
	if (m.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) problems.push(`id “${m.id}” must be lowercase words joined by hyphens`);
	if (m.track && !TRACKS.includes(m.track)) problems.push(`track must be one of ${TRACKS.join(', ')}`);
	if (m.level && !LEVELS.includes(m.level)) problems.push(`level must be one of ${LEVELS.join(', ')}`);
	for (const b of [].concat(m.builds ?? [])) if (!articles.some((a) => a.id === b)) problems.push(`builds on “${b}”, which is not in the catalog`);
	for (const p of [].concat(m.practice ?? [])) if (!practiceProblems.some((x) => x.id === p)) problems.push(`practice “${p}” is not a problem in problems.ts`);
	const minutes = !m.minutes || m.minutes === 'auto' ? coreMinutes(lesson.svelte) : Number(m.minutes);
	const catalog = {
		id: m.id,
		...(m.builds?.length ? { builds: [].concat(m.builds) } : {}),
		track: m.track,
		level: m.level,
		status: 'live',
		title: m.title,
		summary: m.summary,
		dek: m.dek,
		assumes: m.assumes,
		minutes
	};
	const cards = lesson.cards.map((c) => {
		for (const k of ['question', 'answer', 'detail']) if (!c[k]) problems.push(`card “${c.id}” is missing ${k}`);
		if (![1, 2, 3].includes(c.level)) problems.push(`card “${c.id}” needs level 1, 2 or 3`);
		if (c.layer && !['deeper', 'hood'].includes(c.layer)) problems.push(`card “${c.id}” layer must be deeper or hood`);
		return {
			id: c.id,
			term: c.term,
			track: m.track,
			question: c.question,
			answer: c.answer,
			detail: c.detail,
			unlockedBy: m.id,
			...(c.layer ? { layer: c.layer } : {}),
			level: c.level
		};
	});
	return { catalog, cards, practice: [].concat(lesson.practice ?? []), place: m.place, problems };
}

/** An object literal in the content files' style, indented by `tabs`. */
function toTs(obj, tabs) {
	const pad = '\t'.repeat(tabs);
	const val = (v) => (Array.isArray(v) ? `[${v.map(val).join(', ')}]` : typeof v === 'string' ? jsStr(v) : String(v));
	return `${pad}{\n${Object.entries(obj)
		.map(([k, v]) => `${pad}\t${k}: ${val(v)}`)
		.join(',\n')}\n${pad}}`;
}

/** The span of an object literal `{ … id: '<id>' … }` at one tab of indent, or null. */
function objectSpan(text, id, from = 0) {
	const at = text.indexOf(`\t\tid: '${id}',`, from);
	if (at < 0) return null;
	const start = text.lastIndexOf('\n\t{', at) + 1;
	const end = text.indexOf('\n\t}', at) + 3;
	return [start, end];
}

async function writeCatalog(e) {
	const path = join(root, 'src/lib/content/catalog.ts');
	let text = await readFile(path, 'utf8');
	const open = text.indexOf('export const articles: ArticleMeta[] = [');
	const close = text.indexOf('\n];', open);
	const objs = [...text.slice(open, close).matchAll(/\t\{\n[\s\S]*?\n\t\}/g)].map((m) => m[0]);
	const ids = objs.map((o) => o.match(/id: '([^']+)'/)[1]);
	const entry = toTs(e.catalog, 1);
	const existing = ids.indexOf(e.catalog.id);
	if (existing >= 0) objs[existing] = entry;
	else {
		let k = objs.length;
		const m = (e.place ?? '').match(/^(after|before)\s+(\S+)$/);
		if (m && ids.includes(m[2])) k = ids.indexOf(m[2]) + (m[1] === 'after' ? 1 : 0);
		else {
			// No place given: after the last lesson in the same topic.
			const last = ids.map((id, i) => [id, i]).filter(([id]) => articles.find((a) => a.id === id)?.track === e.catalog.track).pop();
			if (last) k = last[1] + 1;
		}
		objs.splice(k, 0, entry);
	}
	const head = text.slice(0, open) + 'export const articles: ArticleMeta[] = [\n';
	text = head + objs.join(',\n') + text.slice(close);

	// Practice links.
	const pOpen = text.indexOf('export const practiceFor');
	const pClose = text.indexOf('\n};', pOpen);
	let block = text.slice(pOpen, pClose);
	const line = `\t'${e.catalog.id}': [${e.practice.map((p) => `'${p}'`).join(', ')}]`;
	const re = new RegExp(`\\n\\t'${e.catalog.id}': \\[[^\\]]*\\],?`);
	if (re.test(block)) block = e.practice.length ? block.replace(re, `\n${line},`) : block.replace(re, '');
	else if (e.practice.length) block = block.replace(/,?\s*$/, '') + `,\n${line}`;
	block = block.replace(/,(\s*)$/, '$1');
	text = text.slice(0, pOpen) + block + text.slice(pClose);
	await writeFile(path, text);
}

async function writeCards(e) {
	const path = join(root, 'src/lib/content/cards.ts');
	let text = await readFile(path, 'utf8');
	const end = text.indexOf('\n];\n\nexport const cardById');
	const fresh = [];
	for (const c of e.cards) {
		const span = objectSpan(text.slice(0, end), c.id);
		if (span) text = text.slice(0, span[0]) + toTs(c, 1) + text.slice(span[1]);
		else fresh.push(c);
	}
	if (fresh.length) {
		const at = text.indexOf('\n];\n\nexport const cardById');
		text = text.slice(0, at).replace(/,?\s*$/, '') + ',\n\n' + fresh.map((c) => toTs(c, 1)).join(',\n') + text.slice(at);
	}
	await writeFile(path, text);
}

let failed = false;
for (const file of await files(target)) {
	let lesson;
	try {
		lesson = toSvelte(await readFile(file, 'utf8'));
	} catch (err) {
		console.error(`✗ ${basename(file)}: ${err.message}`);
		failed = true;
		continue;
	}
	const e = entries(lesson);
	if (e.problems.length) {
		console.error(`✗ ${basename(file)}:\n${e.problems.map((p) => `    ${p}`).join('\n')}`);
		failed = true;
		continue;
	}
	const id = e.catalog.id;
	if (outDir) {
		await mkdir(outDir, { recursive: true });
		await writeFile(join(outDir, `${id}.svelte`), lesson.svelte);
		await writeFile(join(outDir, `${id}.json`), JSON.stringify({ catalog: e.catalog, cards: e.cards, practice: e.practice, place: e.place, handoff: lesson.handoff }, null, '\t'));
		console.log(`✓ ${id}: written to ${outDir}`);
		continue;
	}
	await writeFile(join(root, `src/lib/content/articles/${id}.svelte`), lesson.svelte);
	await writeCatalog(e);
	await writeCards(e);
	console.log(`✓ ${id}: lesson, catalog entry (${e.catalog.minutes} min), ${e.cards.length} cards${e.practice.length ? `, practice ${e.practice.join(', ')}` : ''}`);
}
if (!outDir && !failed) console.log('\nNext: npm run content:check (runs every code sample and lists the card art and banner still to draw).');
process.exit(failed ? 1 : 0);
