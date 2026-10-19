// Renders every sysketch spec in src/lib/content/diagrams/*.yaml to an SVG beside it.
// Run with `npm run diagrams` after editing a spec, and commit both files.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'sysketch';

const dir = fileURLToPath(new URL('../src/lib/content/diagrams/', import.meta.url));
const specs = (await readdir(dir)).filter((f) => f.endsWith('.yaml')).sort();
/** Intrinsic sizes, so the page can reserve each diagram's space before it loads. */
const sizes = {};

for (const file of specs) {
	const spec = await readFile(join(dir, file), 'utf8');
	const svg = await render(spec);
	const name = file.replace(/\.yaml$/, '');
	await writeFile(join(dir, `${name}.svg`), svg);
	const [, width, height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? [];
	sizes[name] = { width: Number(width), height: Number(height) };
	console.log(`rendered ${file}`);
}

await writeFile(join(dir, 'sizes.json'), JSON.stringify(sizes, null, '\t') + '\n');
