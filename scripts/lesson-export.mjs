// Writes an existing lesson in the Markdown lesson format, so it can be edited outside
// the repo and imported back. Usage: node scripts/lesson-export.mjs <id> [out.md]
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toMarkdown } from './lesson-format.mjs';
import { articles, cards, practiceFor, placeOf, root } from './lesson-load.mjs';

const [id, out] = process.argv.slice(2);
const meta = articles.find((a) => a.id === id);
if (!meta) {
	console.error(`No lesson called “${id}” in the catalog.`);
	process.exit(1);
}
const svelte = await readFile(join(root, `src/lib/content/articles/${id}.svelte`), 'utf8');
const { md, raw, total } = toMarkdown(svelte, meta, cards.filter((c) => c.unlockedBy === id), practiceFor[id], placeOf(id));
if (out) await writeFile(out, md);
else process.stdout.write(md);
if (out) console.log(`Wrote ${out}: ${total - raw} of ${total} blocks in the Markdown format, ${raw} kept as raw Svelte.`);
