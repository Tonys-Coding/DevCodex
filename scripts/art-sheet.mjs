// Renders every banner scene large on one page, with the app's real colours and the clay
// CSS, so the art can be reviewed closely after a change. Run `npm run art:sheet`, then
// open the file it prints. Pass a path to write somewhere else.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Content modules import each other without extensions, the way Vite allows.
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
const { lessonScenes, topicScenes, frames } = await import('../src/lib/components/isoScenes.ts');
const { renderSvg, lintScene } = await import('../src/lib/components/iso/geometry.ts');
const { articles, tracks } = await import('../src/lib/content/catalog.ts');

const appCss = await readFile(join(root, 'src/app.css'), 'utf8');
const isoCss = await readFile(join(root, 'src/lib/components/iso/iso.css'), 'utf8');
// Only the colour tokens and track classes from the app, not its layout.
const tokens = [...appCss.matchAll(/(:root\s*\{[\s\S]*?\n\}|\.t-[a-z]+\s*\{[\s\S]*?\n\})/g)].map((m) => m[1]).join('\n');

const tile = (id, track, scene, frame, kind) => {
	const issues = lintScene(scene, frame);
	return `<figure class="t-${track} ${kind}"><div class="banner"><div class="fit">${renderSvg(scene, frame, id)}</div></div>
	<figcaption>${id}${issues.map((f) => ` <b class="${f.level}">${f.level}: ${f.message}</b>`).join('')}</figcaption></figure>`;
};

const html = `<!doctype html><meta charset="utf-8"><title>DevCodex banner art</title>
<style>${tokens}
${isoCss}
body { margin: 24px; background: #121016; color: #c0b8cf; font: 14px system-ui, sans-serif; }
h2 { color: #f5f2f9; margin: 28px 0 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, 560px); gap: 18px; }
figure { margin: 0; }
.banner { --art-ground: color-mix(in srgb, var(--t) 6%, var(--ground)); position: relative; overflow: hidden; border-radius: 14px;
	background: radial-gradient(ellipse at 50% 65%, color-mix(in srgb, var(--t) 13%, transparent), transparent 70%), var(--art-ground); }
.lesson .banner { aspect-ratio: 3 / 1; }
.topic .banner { aspect-ratio: 2.4 / 1; }
.fit { position: absolute; inset: 6% 3%; }
figcaption { margin-top: 6px; }
.error { color: #ff6b81; } .warn { color: #ffc94a; }
</style>
<h2>Topics (topic card frame)</h2><div class="grid">${tracks.map((t) => tile(t.id, t.id, topicScenes[t.id] ?? [], frames.topic, 'topic')).join('')}</div>
<h2>Lessons (lesson card frame)</h2><div class="grid">${articles
	.filter((a) => lessonScenes[a.id])
	.map((a) => tile(a.id, a.track, lessonScenes[a.id], frames.lesson, 'lesson'))
	.join('')}</div>`;

const out = process.argv[2] ?? join(tmpdir(), 'devcodex-art-sheet.html');
await writeFile(out, html);
console.log(out);
