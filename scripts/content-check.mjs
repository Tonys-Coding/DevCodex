// Checks lessons and TL;DR reads before they ship: structure, card wiring, and every
// runnable code sample. Run with `npm run content:check`; it exits 1 when anything is wrong.
//
// A sample that is a fragment (not meant to run on its own) opts out with run={false} on
// its <Code>. A sample that is meant to fail, such as a demo of an error, says run="fails".
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { availableParallelism, tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// The content modules import each other without extensions ('./types'), the way Vite
// allows. Node strips their types natively; this hook only fills in the .ts extension.
registerHooks({
	resolve(specifier, context, next) {
		if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]s$/.test(specifier) && context.parentURL?.endsWith('.ts')) {
			const url = new URL(specifier + '.ts', context.parentURL);
			if (existsSync(url)) return next(url.href, context);
		}
		return next(specifier, context);
	}
});

const root = fileURLToPath(new URL('..', import.meta.url));
const content = join(root, 'src/lib/content');
const { articles, tracks } = await import('../src/lib/content/catalog.ts');
const { cards } = await import('../src/lib/content/cards.ts');
const { briefs } = await import('../src/lib/content/briefs.ts');
const { cardArt } = await import('../src/lib/components/cardArt.ts');
const { isoScenes, lessonScenes, topicScenes, frames } = await import('../src/lib/components/isoScenes.ts');
const { lintScene } = await import('../src/lib/components/iso/geometry.ts');
const { sectionsOf, quizzesOf, wordCount } = await import('../src/lib/content/article-markup.ts');

/** Soft and hard word limits for a TL;DR body. */
const BRIEF_WORDS = { warn: 900, error: 1000 };
const SAMPLE_TIMEOUT_MS = 10_000;

// Findings ------------------------------------------------------------------

/** @type {Map<string, { level: 'error' | 'warn', line: number, message: string }[]>} */
const findings = new Map();
const report = (level, file, line, message) => {
	const key = relative(root, file);
	if (!findings.has(key)) findings.set(key, []);
	findings.get(key).push({ level, line, message });
};
const error = (file, line, message) => report('error', file, line, message);
const warn = (file, line, message) => report('warn', file, line, message);

const lineAt = (text, index) => (index < 0 ? 0 : text.slice(0, index).split('\n').length);

const files = {
	catalog: join(content, 'catalog.ts'),
	cards: join(content, 'cards.ts'),
	briefs: join(content, 'briefs.ts'),
	cardArt: join(root, 'src/lib/components/cardArt.ts')
};
const sourceOf = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([k, f]) => [k, await readFile(f, 'utf8')])));
/** Line of a data entry in a .ts module, found by its `id: '…'` (or a quoted key). */
const entryLine = (src, id) => {
	const m = new RegExp(`(?:id: '${id}'|^\\s*'?${id}'?:)`, 'm').exec(src);
	return m ? lineAt(src, m.index) : 0;
};

// Code samples ----------------------------------------------------------------

/**
 * Every <Code> in a body: its language, run mode and source text, with the line its code
 * starts on. The code prop is a JS template literal, so escapes such as \x3C or \` are
 * cooked back into the characters the reader sees.
 */
function samplesOf(file, src) {
	const out = [];
	for (const m of src.matchAll(/<Code\b/g)) {
		const open = src.indexOf('code={', m.index);
		const end = src.indexOf('/>', m.index);
		if (open < 0 || (end >= 0 && end < open)) continue;
		if (src[open + 6] !== '`') {
			warn(file, lineAt(src, open), 'Code sample is not a template literal, so it was not run.');
			continue;
		}
		const start = open + 'code={`'.length;
		let i = start;
		let interpolated = false;
		for (; i < src.length && src[i] !== '`'; i++) {
			if (src[i] === '\\') i++;
			else if (src[i] === '$' && src[i + 1] === '{') interpolated = true;
		}
		const raw = src.slice(start, i);
		const close = src.indexOf('/>', i);
		const attrs = src.slice(m.index, open) + src.slice(i + 1, close);
		const lang = attrs.match(/\blang="(\w+)"/)?.[1] ?? 'js';
		const run = /\brun=\{false\}/.test(attrs) ? 'skip' : /\brun="fails"/.test(attrs) ? 'fails' : 'pass';
		const line = lineAt(src, start);
		if (interpolated) {
			error(file, line, 'Code sample contains ${…}, which Svelte fills in from the script. Escape it as \\${…}.');
			continue;
		}
		const code = new Function(`return \`${raw}\`;`)();
		const title = attrs.match(/\btitle="([^"]*)"/)?.[1];
		out.push({ file, line, lang, run, code, title });
	}
	return out;
}

const run = (cmd, args, cwd) =>
	new Promise((done) =>
		execFile(cmd, args, { cwd, timeout: SAMPLE_TIMEOUT_MS, maxBuffer: 4 << 20, env: { PATH: process.env.PATH, HOME: process.env.HOME } }, (err, stdout, stderr) =>
			done({ ok: !err, timedOut: Boolean(err?.killed), missing: err?.code === 'ENOENT', stdout, stderr })
		)
	);

/** The sample's own line that failed, if the traceback names one, and a short reason. */
function explain(lang, stderr, name) {
	const lines = stderr.split('\n').map((l) => l.trimEnd()).filter(Boolean);
	const escaped = name.replace('.', '\\.');
	let at = 0;
	if (lang === 'py') {
		for (const m of stderr.matchAll(new RegExp(`${escaped}", line (\\d+)`, 'g'))) at = Number(m[1]);
		return { at, reason: lines.at(-1) ?? 'exited with an error' };
	}
	at = Number(stderr.match(new RegExp(`${escaped}:(\\d+)`))?.[1] ?? 0);
	const reason = lines.find((l) => /^(?:Uncaught )?\w*(?:Error|Exception)\b/.test(l)) ?? lines.find((l) => /Error/.test(l)) ?? lines[0];
	return { at, reason: reason ?? 'exited with an error' };
}

async function runSamples(samples) {
	const dir = await mkdtemp(join(tmpdir(), 'devcodex-samples-'));
	const counts = { js: 0, py: 0, skipped: 0 };
	let next = 0;
	async function worker() {
		while (next < samples.length) {
			const n = next++;
			const s = samples[n];
			if (s.run === 'skip') {
				counts.skipped++;
				continue;
			}
			counts[s.lang]++;
			const name = `sample${n}.${s.lang}`;
			await writeFile(join(dir, name), s.code);
			const result = s.lang === 'py' ? await run('python3', ['-I', name], dir) : await run(process.execPath, [name], dir);
			const label = s.title ? `“${s.title}”` : `${s.lang === 'py' ? 'Python' : 'JavaScript'} sample`;
			if (result.missing) {
				error(s.file, s.line, `${label}: python3 is not installed, so it could not run.`);
			} else if (result.timedOut) {
				error(s.file, s.line, `${label} ran longer than ${SAMPLE_TIMEOUT_MS / 1000} s.`);
			} else if (s.run === 'fails' && result.ok) {
				error(s.file, s.line, `${label} is marked run="fails" but ran cleanly.`);
			} else if (s.run === 'pass' && !result.ok) {
				const { at, reason } = explain(s.lang, result.stderr, name);
				error(s.file, at ? s.line + at - 1 : s.line, `${label} failed: ${reason}`);
			}
		}
	}
	await Promise.all(Array.from({ length: Math.min(availableParallelism(), 8) }, worker));
	await rm(dir, { recursive: true, force: true });
	return counts;
}

// Lessons ---------------------------------------------------------------------

const articleIds = new Set(articles.map((a) => a.id));
const liveIds = new Set(articles.filter((a) => a.status === 'live').map((a) => a.id));
const articleDir = join(content, 'articles');
const articleFiles = (await readdir(articleDir)).filter((f) => f.endsWith('.svelte'));
const samples = [];

for (const a of articles) {
	for (const b of a.builds ?? [])
		if (!articleIds.has(b)) error(files.catalog, entryLine(sourceOf.catalog, a.id), `“${a.id}” builds on “${b}”, which is not in the catalog.`);
	if (a.status === 'live' && !articleFiles.includes(`${a.id}.svelte`))
		error(files.catalog, entryLine(sourceOf.catalog, a.id), `“${a.id}” is live but has no body file articles/${a.id}.svelte.`);
	// Lesson cards fall back to the topic's scene, so a missing one is only a warning.
	if (a.status === 'live' && !isoScenes[a.id])
		warn(files.catalog, entryLine(sourceOf.catalog, a.id), `Lesson “${a.id}” has no banner scene in components/isoScenes.ts; its card uses the topic’s.`);
}
for (const t of tracks)
	if (!isoScenes[t.id]) error(files.catalog, entryLine(sourceOf.catalog, t.id), `Topic “${t.id}” has no banner scene in components/isoScenes.ts.`);

// Banner art: every scene's geometry (no objects passing through each other, arrows that
// start and end at surfaces with their heads in view) and its fit in the shared frame.
const scenesFile = join(root, 'src/lib/components/isoScenes.ts');
const scenesSrc = await readFile(scenesFile, 'utf8');
for (const [group, frame] of [[lessonScenes, frames.lesson], [topicScenes, frames.topic]])
	for (const [id, scene] of Object.entries(group))
		for (const f of lintScene(scene, frame)) report(f.level, scenesFile, entryLine(scenesSrc, id), `Scene “${id}”: ${f.message}`);

for (const f of articleFiles) {
	const file = join(articleDir, f);
	const id = f.replace(/\.svelte$/, '');
	const src = await readFile(file, 'utf8');
	const meta = articles.find((a) => a.id === id);
	if (!meta) error(file, 1, `No catalog entry for “${id}”, so this body is never shown.`);
	else if (meta.status !== 'live') warn(file, 1, `“${id}” has a body but is marked ${meta.status} in the catalog.`);
	checkLesson(file, id, src);
	samples.push(...samplesOf(file, src));
}

function checkLesson(file, id, src) {
	const at = (i) => lineAt(src, i);
	const pack = [...src.matchAll(/<CorePack\s*\/>/g)];
	const layers = [...src.matchAll(/<Layer\b[^>]*\bdepth="(\w+)"[^>]*>/g)];
	const deeper = layers.filter((m) => m[1] === 'deeper');
	const hood = layers.filter((m) => m[1] === 'hood');

	if (pack.length !== 1) return error(file, at(pack[1]?.index ?? -1), `Expected one <CorePack />, found ${pack.length}.`);
	if (deeper.length !== 1 || hood.length !== 1 || layers.length !== 2)
		return error(file, 0, `Expected one <Layer depth="deeper"> and one <Layer depth="hood">, found: ${layers.map((m) => m[1]).join(', ') || 'none'}.`);

	const packAt = pack[0].index;
	const deeperOpen = deeper[0].index;
	const deeperClose = src.indexOf('</Layer>', deeperOpen);
	const hoodOpen = hood[0].index;
	const hoodClose = src.indexOf('</Layer>', hoodOpen);
	if (!(packAt < deeperOpen && deeperOpen < hoodOpen))
		return error(file, at(deeperOpen), 'Order must be Core, <CorePack />, Going deeper, then Under the hood.');
	if (deeperClose < 0 || deeperClose > hoodOpen) return error(file, at(deeperOpen), 'The Going deeper layer is not closed before Under the hood starts.');
	if (hoodClose < 0) return error(file, at(hoodOpen), 'The Under the hood layer is never closed.');

	const between = (from, to) => src.slice(from, to).replace(/<!--[\s\S]*?-->/g, '').trim();
	const packEnd = packAt + pack[0][0].length;
	if (between(packEnd, deeperOpen)) error(file, at(packEnd), 'Something sits between <CorePack /> and the Going deeper layer; the Core must end with <CorePack />.');
	if (between(deeperClose + 8, hoodOpen)) error(file, at(deeperClose + 8), 'Something sits between the Going deeper and Under the hood layers.');
	if (between(hoodClose + 8, src.length)) error(file, at(hoodClose + 8), 'Something follows the Under the hood layer; it must be the end of the lesson.');

	const sections = sectionsOf(src);
	const heads = [...src.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
	if (!sections.some((s) => s.depth === 'core')) error(file, 0, 'The Core has no <h2> sections.');
	if (heads[0] && heads[0].index > packAt) error(file, at(heads[0].index), 'The lesson must open with its Core, before <CorePack />.');
	for (const depth of ['deeper', 'hood'])
		if (!sections.some((s) => s.depth === depth)) error(file, at(depth === 'deeper' ? deeperOpen : hoodOpen), `The ${depth === 'deeper' ? 'Going deeper' : 'Under the hood'} layer has no <h2> sections.`);

	// Quizzes: quizzesOf only sees a <Quiz> that closes with /> on its own line.
	const quizTags = [...src.matchAll(/<Quiz\b/g)];
	const quizzes = quizzesOf(src, id);
	if (quizTags.length !== quizzes.length) error(file, 0, `Found ${quizTags.length} <Quiz> tags but the pack rules see ${quizzes.length}; close each Quiz with /> on its own line.`);
	const quizLines = quizTags.map((m) => at(m.index));
	const seen = new Map();
	quizzes.forEach((q, i) => {
		if (seen.has(q.title)) error(file, quizLines[i], `Two checks are titled “${q.title}” (also line ${seen.get(q.title)}); progress keys them by title.`);
		seen.set(q.title, quizLines[i]);
		if (q.total === 0) error(file, quizLines[i], `“${q.title}” has no questions.`);
	});
	if (!quizzes.some((q) => q.depth === 'core')) error(file, at(packAt), 'The Core has no Quiz; it needs at least one check before the pack.');
	const deeperQuizzes = quizzes.map((q, i) => ({ ...q, line: quizLines[i] })).filter((q) => q.depth === 'deeper');
	const hoodQuizzes = quizzes.map((q, i) => ({ ...q, line: quizLines[i] })).filter((q) => q.depth === 'hood');
	for (const q of deeperQuizzes)
		if (!/^Going deeper checkpoint\b/.test(q.title)) error(file, q.line, `Going deeper check “${q.title}” should be titled “Going deeper checkpoint …”.`);
	hoodQuizzes.forEach((q, i) => {
		const last = i === hoodQuizzes.length - 1;
		if (last && q.title !== 'Under the hood check') error(file, q.line, `The last check in Under the hood should be titled “Under the hood check”, not “${q.title}”.`);
		if (!last && !/^Under the hood checkpoint\b/.test(q.title)) error(file, q.line, `Under the hood check “${q.title}” should be titled “Under the hood checkpoint …”.`);
	});
	if (!hoodQuizzes.length) error(file, at(hoodOpen), 'Under the hood has no “Under the hood check”.');

	// The hood layer ends: final check, then Sources as its last section.
	const hoodHeads = heads.filter((h) => h.index > hoodOpen && h.index < hoodClose);
	const lastHead = hoodHeads.at(-1);
	const finalCheck = hoodQuizzes.at(-1);
	if (!lastHead || !/^Sources\b/.test(sectionsOf(lastHead[0])[0]?.text ?? '')) {
		error(file, at(hoodClose), 'Under the hood must end with a Sources section (an <h2> starting “Sources”).');
	} else if (finalCheck && finalCheck.line > at(lastHead.index)) {
		error(file, finalCheck.line, 'The “Under the hood check” should come before the Sources section.');
	} else if (!/<a\s[^>]*href=/.test(src.slice(lastHead.index, hoodClose))) {
		error(file, at(lastHead.index), 'The Sources section has no links.');
	}
}

// Cards -------------------------------------------------------------------------

const cardIds = new Set();
for (const c of cards) {
	const line = entryLine(sourceOf.cards, c.id);
	if (cardIds.has(c.id)) error(files.cards, line, `Card id “${c.id}” is used twice.`);
	cardIds.add(c.id);
	if (!cardArt[c.id]) error(files.cards, line, `Card “${c.id}” has no art in components/cardArt.ts.`);
	if (c.unlockedBy && !articleIds.has(c.unlockedBy)) error(files.cards, line, `Card “${c.id}” is unlocked by “${c.unlockedBy}”, which is not an article.`);
	else if (c.unlockedBy && !liveIds.has(c.unlockedBy)) warn(files.cards, line, `Card “${c.id}” is unlocked by “${c.unlockedBy}”, which is not live yet.`);
	if (c.layer && !c.unlockedBy) error(files.cards, line, `Bonus card “${c.id}” has a layer but no unlockedBy lesson.`);
}
for (const id of Object.keys(cardArt))
	if (!cardIds.has(id)) warn(files.cardArt, entryLine(sourceOf.cardArt, id), `Art “${id}” belongs to no card.`);

// Each bonus card's layer must exist and be finishable; a live lesson's Core needs a pack.
for (const id of liveIds) {
	const file = join(articleDir, `${id}.svelte`);
	if (!existsSync(file)) continue;
	const src = await readFile(file, 'utf8');
	const sections = sectionsOf(src);
	if (!cards.some((c) => c.unlockedBy === id && !c.layer)) warn(files.catalog, entryLine(sourceOf.catalog, id), `Lesson “${id}” unlocks no Core cards, so its pack is empty.`);
	for (const depth of ['deeper', 'hood']) {
		const bonus = cards.filter((c) => c.unlockedBy === id && c.layer === depth);
		const label = depth === 'deeper' ? 'Going deeper' : 'Under the hood';
		const opener = src.search(new RegExp(`<Layer\\b[^>]*depth="${depth}"`));
		if (bonus.length && opener < 0) {
			for (const c of bonus) error(files.cards, entryLine(sourceOf.cards, c.id), `Bonus card “${c.id}” points at ${label} in “${id}”, which has no such layer.`);
		} else if (bonus.length && !sections.some((s) => s.depth === depth)) {
			for (const c of bonus) error(files.cards, entryLine(sourceOf.cards, c.id), `Bonus card “${c.id}” points at ${label} in “${id}”, which has no sections to read.`);
		} else if (!bonus.length && opener >= 0) {
			warn(file, lineAt(src, opener), `${label} has no bonus card in cards.ts.`);
		}
	}
}

// TL;DR reads ---------------------------------------------------------------------

const briefDir = join(content, 'briefs');
const briefFiles = (await readdir(briefDir)).filter((f) => f.endsWith('.svelte'));
const briefIds = new Set();
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

for (const b of briefs) {
	const line = entryLine(sourceOf.briefs, b.id);
	if (briefIds.has(b.id)) error(files.briefs, line, `Brief id “${b.id}” is used twice.`);
	briefIds.add(b.id);
	if (!briefFiles.includes(`${b.id}.svelte`)) error(files.briefs, line, `“${b.id}” has no body file briefs/${b.id}.svelte.`);
	if (!Array.isArray(b.tldr) || b.tldr.length !== 3) error(files.briefs, line, `“${b.id}” needs exactly 3 TL;DR bullets, has ${b.tldr?.length ?? 0}.`);
	else b.tldr.forEach((t, i) => !t.trim() && error(files.briefs, line, `“${b.id}” TL;DR bullet ${i + 1} is empty.`));
	if (!isDate(b.published)) error(files.briefs, line, `“${b.id}” published date “${b.published}” is not YYYY-MM-DD.`);
	if (b.kind === 'new' && !b.checked) error(files.briefs, line, `“${b.id}” is a What’s new read, so it needs a checked date.`);
	if (b.checked && !isDate(b.checked)) error(files.briefs, line, `“${b.id}” checked date “${b.checked}” is not YYYY-MM-DD.`);
	if (b.deeper && !liveIds.has(b.deeper)) error(files.briefs, line, `“${b.id}” continues with “${b.deeper}”, which is not a live lesson.`);
}

for (const f of briefFiles) {
	const file = join(briefDir, f);
	const id = f.replace(/\.svelte$/, '');
	const src = await readFile(file, 'utf8');
	if (!briefIds.has(id)) error(file, 1, `No entry in briefs.ts for “${id}”, so this body is never shown.`);
	const heads = sectionsOf(src).map((s) => s.text);
	if (!heads.includes('Why it matters to you')) error(file, 0, 'Missing the “Why it matters to you” section (<h2>).');
	if (!heads.some((h) => /^Sources\b/.test(h))) error(file, 0, 'Missing the Sources section (<h2>).');
	else if (!/^Sources\b/.test(heads.at(-1))) warn(file, 0, 'Sources should be the last section.');
	if (/<(?:Layer|CorePack|Quiz)\b/.test(src)) warn(file, 0, 'TL;DR reads have no layers, packs or quizzes.');
	const words = wordCount(src);
	if (words > BRIEF_WORDS.error) error(file, 0, `${words} words; a TL;DR read stays under about ${BRIEF_WORDS.warn}.`);
	else if (words > BRIEF_WORDS.warn) warn(file, 0, `${words} words; a TL;DR read stays under about ${BRIEF_WORDS.warn}.`);
	samples.push(...samplesOf(file, src));
}

// Run the samples, then report ----------------------------------------------------

const runnable = samples.filter((s) => s.lang === 'js' || s.lang === 'py');
const counts = await runSamples(runnable);

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
let errors = 0;
let warnings = 0;
console.log(paint('1', 'DevCodex content check'));
for (const [file, list] of [...findings].sort(([a], [b]) => a.localeCompare(b))) {
	console.log(`\n${paint('4', file)}`);
	for (const f of list.sort((a, b) => a.line - b.line)) {
		const where = f.line ? `${file}:${f.line}` : file;
		if (f.level === 'error') errors++;
		else warnings++;
		console.log(`  ${f.level === 'error' ? paint('31', '✗ error') : paint('33', '! warn ')}  ${f.message}\n           ${paint('2', where)}`);
	}
}
const skipped = counts.skipped ? `, skipped ${counts.skipped} marked run={false}` : '';
console.log(
	`\nChecked ${liveIds.size} lessons, ${briefs.length} TL;DR reads and ${cards.length} cards. Ran ${counts.js} JavaScript and ${counts.py} Python samples${skipped}.`
);
const summary = `${errors} ${errors === 1 ? 'error' : 'errors'}, ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}.`;
console.log(errors ? paint('31', summary) : paint('32', summary));
process.exit(errors ? 1 : 0);
