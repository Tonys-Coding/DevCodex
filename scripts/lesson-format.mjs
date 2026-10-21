// The DevCodex lesson format: a plain Markdown file a web AI can write, and the code that
// turns it into a lesson (`toSvelte`) and back (`toMarkdown`). The format is described for
// writers in .claude/skills/lesson-writer/web-edition.md; keep the two in step.
//
// Shape of a lesson file:
//   front matter (--- … ---)    id, track, level, title, summary, dek, assumes, builds,
//                               place, minutes, practice
//   Core blocks
//   === CORE PACK ===
//   === GOING DEEPER: <summary> ===        blocks
//   === UNDER THE HOOD: <summary> ===      blocks
//   === CARDS ===                          card entries
//   === HANDOFF ===                        claims ledger and lab spec (not imported)
//
// Blocks: paragraphs, ## and ### headings, - and 1. lists (nested by two spaces), | tables |,
// ```lang code fences, ```quiz, :::note … :::, :::glossary … :::, [[LAB: …]], and ```svelte
// for anything else, passed through untouched.
// Inline: **bold**, *italic*, `code`, [text](https://…), [[term|definition]], <sup>…</sup>,
// and backslash escapes (\* \` \[ \] \| \< \\).

import { parse } from 'svelte/compiler';

const TEACH = ['Quiz', 'Note', 'Code', 'Term', 'Layer', 'CorePack'];
const importLine = (name) => `\timport ${name} from '../../components/teach/${name}.svelte';`;

// ---------------------------------------------------------------------------------------
// Markdown → Svelte
// ---------------------------------------------------------------------------------------

/** Escapes text for a Svelte template: braces become expressions, stray < becomes &lt;. */
const textEsc = (s) => s.replace(/[{}]/g, (c) => `{'${c}'}`);
/** Escapes text for a double-quoted attribute value. */
export const attrEsc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
/** A single-quoted JavaScript string literal, as the lessons write them. */
export const jsStr = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
/** The body of a JavaScript template literal holding code. */
const tplEsc = (s) =>
	s
		.replace(/\\/g, '\\\\')
		.replace(/`/g, '\\`')
		.replace(/\$\{/g, '\\${')
		.replace(/<(\/?)script/gi, (_, slash) => `\\x3C${slash}script`);

const INLINE_TAG = /^<\/?(sup|sub|em|strong|code|kbd|br|abbr|span|small|mark|s|u|b|i)(\s[^<>]*)?\/?>/i;

/** Converts one line (or joined lines) of inline Markdown to Svelte markup. */
export function inline(src) {
	let out = '';
	let i = 0;
	let text = '';
	const flush = () => {
		out += textEsc(text).replace(/</g, '&lt;');
		text = '';
	};
	while (i < src.length) {
		const c = src[i];
		const rest = src.slice(i);
		if (c === '\\' && i + 1 < src.length) {
			text += src[i + 1];
			i += 2;
			continue;
		}
		if (c === '`') {
			const ticks = rest.match(/^`+/)[0];
			const end = src.indexOf(ticks, i + ticks.length);
			if (end > 0) {
				flush();
				let code = src.slice(i + ticks.length, end);
				if (ticks.length > 1) code = code.replace(/^ | $/g, '');
				// In a table cell, \| inside code stands for a plain pipe.
				code = code.replace(/\\\|/g, '|');
				out += `<code>${textEsc(code.replace(/&/g, '&amp;').replace(/</g, '&lt;'))}</code>`;
				i = end + ticks.length;
				continue;
			}
		}
		if (rest.startsWith('[[')) {
			const end = src.indexOf(']]', i);
			const body = end > 0 ? src.slice(i + 2, end) : '';
			const bar = body.indexOf('|');
			if (end > 0 && bar > 0) {
				flush();
				out += `<Term def="${attrEsc(unescapeMd(body.slice(bar + 1)))}">${inline(body.slice(0, bar))}</Term>`;
				i = end + 2;
				continue;
			}
		}
		if (c === '[') {
			const m = rest.match(/^\[((?:\\.|[^\]\\])*)\]\(([^)\s]+)\)/);
			if (m) {
				flush();
				const external = /^https?:/.test(m[2]);
				out += `<a href="${attrEsc(m[2])}"${external ? ' rel="external"' : ''}>${inline(m[1])}</a>`;
				i += m[0].length;
				continue;
			}
		}
		if (rest.startsWith('**')) {
			const end = findClose(src, i + 2, '**');
			if (end > 0) {
				flush();
				out += `<strong>${inline(src.slice(i + 2, end))}</strong>`;
				i = end + 2;
				continue;
			}
		}
		if (c === '*' && src[i + 1] !== ' ') {
			const end = findClose(src, i + 1, '*');
			if (end > 0) {
				flush();
				out += `<em>${inline(src.slice(i + 1, end))}</em>`;
				i = end + 1;
				continue;
			}
		}
		if (c === '<') {
			const m = rest.match(INLINE_TAG);
			if (m) {
				flush();
				out += m[0];
				i += m[0].length;
				continue;
			}
		}
		text += c;
		i++;
	}
	flush();
	return out;
}

/** The closing delimiter for emphasis, skipping escapes and code spans. */
function findClose(src, from, delim) {
	for (let j = from; j < src.length; j++) {
		if (src[j] === '\\') {
			j++;
			continue;
		}
		if (src[j] === '`') {
			const ticks = src.slice(j).match(/^`+/)[0];
			const end = src.indexOf(ticks, j + ticks.length);
			if (end > 0) {
				j = end + ticks.length - 1;
				continue;
			}
		}
		if (src.startsWith('[[', j)) {
			const end = src.indexOf(']]', j);
			if (end > 0) {
				j = end + 1;
				continue;
			}
		}
		if (src.startsWith(delim, j) && (delim !== '*' || src[j + 1] !== '*')) return j;
		if (delim === '*' && src.startsWith('**', j)) {
			const end = findClose(src, j + 2, '**');
			if (end > 0) {
				j = end + 1;
				continue;
			}
		}
	}
	return -1;
}

const unescapeMd = (s) => s.replace(/\\(.)/g, '$1');

/** Parses `key="value" other=word` pairs from a fence or directive line. */
function attrsOf(s) {
	const out = {};
	for (const m of s.matchAll(/(\w+)=(?:"((?:\\"|[^"])*)"|(\S+))/g)) out[m[1]] = m[2] !== undefined ? m[2].replace(/\\"/g, '"') : m[3];
	return out;
}

/** Splits lines into blocks and renders them, at a given indent (number of tabs). */
export function blocks(lines, depth = 0) {
	const out = [];
	const pad = '\t'.repeat(depth);
	let i = 0;
	const isListLine = (l) => /^(\s*)([-*]|\d+\.) /.test(l);
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i++;
			continue;
		}
		// Fences: code, quiz, raw svelte.
		const fence = line.match(/^(`{3,})(\S*)\s*(.*)$/);
		if (fence) {
			const close = fence[1];
			const body = [];
			i++;
			while (i < lines.length && lines[i].trim() !== close) body.push(lines[i++]);
			i++;
			const kind = fence[2];
			if (kind === 'svelte') out.push(body.join('\n'));
			else if (kind === 'svelte-script') continue;
			else if (kind === 'quiz') out.push(quizSvelte(body, pad));
			else out.push(codeSvelte(kind, attrsOf(fence[3]), body.join('\n'), pad));
			continue;
		}
		// Directives: :::note and :::glossary.
		const dir = line.match(/^:::(\w+)\s*(.*)$/);
		if (dir) {
			const body = [];
			let nest = 0;
			i++;
			while (i < lines.length) {
				if (/^:::\w/.test(lines[i])) nest++;
				else if (lines[i].trim() === ':::') {
					if (!nest) break;
					nest--;
				}
				body.push(lines[i++]);
			}
			i++;
			if (dir[1] === 'glossary') out.push(glossarySvelte(body, pad));
			else if (dir[1] === 'note') out.push(noteSvelte(attrsOf(dir[2]), body, depth));
			else throw new Error(`Unknown directive :::${dir[1]}`);
			continue;
		}
		const lab = line.match(/^\[\[LAB:\s*(.*)\]\]\s*$/);
		if (lab) {
			out.push(`${pad}<!-- LAB: ${lab[1]} -->`);
			i++;
			continue;
		}
		const h = line.match(/^(#{2,3}) (.*)$/);
		if (h) {
			const tag = h[1].length === 2 ? 'h2' : 'h3';
			out.push(`${pad}<${tag}>${inline(h[2])}</${tag}>`);
			i++;
			continue;
		}
		if (line.startsWith('|')) {
			const rows = [];
			while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
			out.push(tableSvelte(rows, pad));
			continue;
		}
		if (isListLine(line)) {
			const body = [];
			while (i < lines.length && lines[i].trim() && (isListLine(lines[i]) || /^\s/.test(lines[i]))) body.push(lines[i++]);
			out.push(listSvelte(body, depth));
			continue;
		}
		const para = [];
		while (i < lines.length && lines[i].trim() && !/^(`{3}|:::|#{2,3} |\||\[\[LAB:)/.test(lines[i]) && !isListLine(lines[i])) para.push(lines[i++].trim());
		out.push(`${pad}<p>${inline(para.join(' '))}</p>`);
	}
	return out.join('\n\n');
}

/** A nested list from `- ` / `1. ` lines; deeper indentation nests a list in the item above. */
function listSvelte(lines, depth) {
	const pad = '\t'.repeat(depth);
	const indentOf = (l) => l.match(/^\s*/)[0].replace(/\t/g, '  ').length;
	const base = indentOf(lines[0]);
	const ordered = /^\s*\d+\. /.test(lines[0]);
	const items = [];
	for (const l of lines) {
		const ind = indentOf(l);
		const m = l.match(/^\s*(?:[-*]|\d+\.) (.*)$/);
		if (ind === base && m) items.push({ text: [m[1]], sub: [] });
		else if (ind > base && m) items[items.length - 1].sub.push(l.slice(base + 2));
		else items[items.length - 1][items[items.length - 1].sub.length ? 'sub' : 'text'].push(l.trim());
	}
	const tag = ordered ? 'ol' : 'ul';
	const lis = items.map((it) => {
		const head = inline(it.text.join(' '));
		if (!it.sub.length) return `${pad}\t<li>${head}</li>`;
		return `${pad}\t<li>\n${pad}\t\t${head}\n${listSvelte(it.sub, depth + 2)}\n${pad}\t</li>`;
	});
	return `${pad}<${tag}>\n${lis.join('\n')}\n${pad}</${tag}>`;
}

function glossarySvelte(lines, pad) {
	const items = lines
		.filter((l) => l.trim())
		.reduce((acc, l) => {
			if (/^- /.test(l)) acc.push(l.slice(2));
			else acc[acc.length - 1] += ' ' + l.trim();
			return acc;
		}, []);
	const entries = items.map((it) => {
		const m = it.match(/^\*\*((?:\\.|[^*])+)\*\*:\s*(.*)$/);
		if (!m) throw new Error(`Glossary item must be "- **Term**: definition": ${it}`);
		return `${pad}\t<div>\n${pad}\t\t<dt>${inline(m[1])}</dt>\n${pad}\t\t<dd>${inline(m[2])}</dd>\n${pad}\t</div>`;
	});
	return `${pad}<dl>\n${entries.join('\n')}\n${pad}</dl>`;
}

function noteSvelte(a, lines, depth) {
	const pad = '\t'.repeat(depth);
	const attrs = `title="${attrEsc(a.title ?? '')}"${a.tone ? ` tone="${a.tone}"` : ''}`;
	const body = lines.join('\n').trim();
	// A single paragraph stays bare inside the note, as the lessons write it.
	const single = body && !/\n\s*\n/.test(body) && !/^(\s*([-*]|\d+\.) |```|:::|\|)/m.test(body);
	const inner = single ? `${pad}\t${inline(body.split('\n').map((l) => l.trim()).join(' '))}` : blocks(lines, depth + 1);
	return `${pad}<Note ${attrs}>\n${inner}\n${pad}</Note>`;
}

function tableSvelte(rows, pad) {
	const cells = (r) =>
		r
			.trim()
			.replace(/^\||\|$/g, '')
			.split(/(?<!\\)\|/)
			.map((c) => c.trim());
	const [head, , ...body] = rows;
	const th = cells(head).map((c) => `<th scope="col">${inline(c)}</th>`).join('');
	const trs = body.map((r) => {
		const [first, ...rest] = cells(r);
		return `${pad}\t\t\t<tr><th scope="row">${inline(first)}</th>${rest.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`;
	});
	return `${pad}<div class="table-wrap">\n${pad}\t<table>\n${pad}\t\t<thead><tr>${th}</tr></thead>\n${pad}\t\t<tbody>\n${trs.join('\n')}\n${pad}\t\t</tbody>\n${pad}\t</table>\n${pad}</div>`;
}

function codeSvelte(lang, a, code, pad) {
	const props = [`${pad}\tlang="${lang || 'text'}"`];
	if (a.title) props.push(`${pad}\ttitle="${attrEsc(a.title)}"`);
	if (a.run === 'false') props.push(`${pad}\trun={false}`);
	if (a.run === 'fails') props.push(`${pad}\trun="fails"`);
	props.push(`${pad}\tcode={\`${tplEsc(code)}\`}`);
	if (a.caption) props.push(`${pad}\tcaption="${attrEsc(a.caption)}"`);
	return `${pad}<Code\n${props.join('\n')}\n${pad}/>`;
}

/** Parses a ```quiz block: optional title:/variant: lines, then Q:, options (- wrong, * right), Why:. */
export function parseQuiz(lines) {
	const quiz = { questions: [] };
	let q;
	for (const raw of lines) {
		const l = raw.trim();
		if (!l) continue;
		let m;
		if (!q && (m = l.match(/^title:\s*(.*)$/))) quiz.title = m[1];
		else if (!q && (m = l.match(/^variant:\s*(.*)$/))) quiz.variant = m[1];
		else if ((m = l.match(/^Q:\s*(.*)$/))) quiz.questions.push((q = { prompt: m[1], options: [], answer: -1, explain: '' }));
		else if (q && (m = l.match(/^([-*])\s+(.*)$/))) {
			if (m[1] === '*') q.answer = q.options.length;
			q.options.push(m[2]);
		} else if (q && (m = l.match(/^Why:\s*(.*)$/))) q.explain = m[1];
		else if (q && q.explain) q.explain += ' ' + l;
		else throw new Error(`Unexpected line in quiz: ${l}`);
	}
	for (const x of quiz.questions) if (x.answer < 0) throw new Error(`Question has no * correct option: ${x.prompt}`);
	return quiz;
}

function quizSvelte(lines, pad) {
	const quiz = parseQuiz(lines);
	const qs = quiz.questions.map(
		(x) =>
			`${pad}\t\t{\n${pad}\t\t\tprompt: ${jsStr(x.prompt)},\n${pad}\t\t\toptions: [${x.options.map(jsStr).join(', ')}],\n${pad}\t\t\tanswer: ${x.answer},\n${pad}\t\t\texplain: ${jsStr(x.explain)}\n${pad}\t\t}`
	);
	const props = [];
	if (quiz.variant) props.push(`${pad}\tvariant="${quiz.variant}"`);
	if (quiz.title) props.push(`${pad}\ttitle="${attrEsc(quiz.title)}"`);
	props.push(`${pad}\tquestions={[\n${qs.join(',\n')}\n${pad}\t]}`);
	return `${pad}<Quiz\n${props.join('\n')}\n${pad}/>`;
}

/** Simple front matter: `key: value` and `key: [a, b]`. */
export function frontMatter(text) {
	const out = {};
	for (const line of text.split('\n')) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (!m) continue;
		let v = m[2].trim();
		if (/^\[.*\]$/.test(v))
			v = v
				.slice(1, -1)
				.split(',')
				.map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
		else if (/^".*"$/.test(v)) v = v.slice(1, -1).replace(/\\"/g, '"');
		out[m[1]] = v;
	}
	return out;
}

/** Parses the === CARDS === section. */
export function parseCards(lines) {
	const cards = [];
	let c;
	for (const raw of lines) {
		const l = raw.trim();
		if (!l) continue;
		let m;
		if ((m = l.match(/^card:\s*(.*)$/))) {
			const [id, term, level, layer] = m[1].split('|').map((x) => x.trim());
			c = { id, term, level: Number(level.replace(/\D/g, '')), ...(layer ? { layer } : {}) };
			cards.push(c);
		} else if (c && (m = l.match(/^Q:\s*(.*)$/))) c.question = m[1];
		else if (c && (m = l.match(/^A:\s*(.*)$/))) c.answer = m[1];
		else if (c && (m = l.match(/^Detail:\s*(.*)$/))) c.detail = m[1];
		else throw new Error(`Unexpected line in cards: ${l}`);
	}
	return cards;
}

/**
 * Converts a whole lesson file. Returns the Svelte body, the catalog fields, the cards,
 * the practice ids and the handoff text.
 */
export function toSvelte(md) {
	const text = md.replace(/\r\n/g, '\n');
	const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!fm) throw new Error('Missing front matter (--- … ---) at the top.');
	const meta = frontMatter(fm[1]);
	const body = text.slice(fm[0].length);
	const parts = body.split(/^=== (.+?) ===\s*$/m);
	const sections = [{ name: 'CORE', text: parts[0] }];
	for (let k = 1; k < parts.length; k += 2) sections.push({ name: parts[k], text: parts[k + 1] ?? '' });

	const scriptExtra = [];
	const out = [];
	let cards = [];
	let handoff = '';
	for (const s of sections) {
		const lines = s.text.split('\n');
		// ```svelte-script blocks add to the component script.
		for (let k = 0; k < lines.length; k++) {
			if (/^`{3,}svelte-script\s*$/.test(lines[k])) {
				const close = lines[k].match(/^`+/)[0];
				let j = k + 1;
				while (j < lines.length && lines[j].trim() !== close) scriptExtra.push(lines[j++]);
			}
		}
		if (s.name === 'CORE') out.push(blocks(lines));
		else if (s.name === 'CORE PACK') {
			out.push('<CorePack />');
			if (s.text.trim()) out.push(blocks(lines));
		} else if (/^GOING DEEPER:/.test(s.name) || /^UNDER THE HOOD:/.test(s.name)) {
			const depth = s.name.startsWith('GOING') ? 'deeper' : 'hood';
			const summary = s.name.replace(/^[^:]+:\s*/, '');
			out.push(`<Layer depth="${depth}" summary="${attrEsc(summary)}">\n${blocks(lines)}\n</Layer>`);
		} else if (s.name === 'CARDS') cards = parseCards(lines);
		else if (s.name === 'HANDOFF') handoff = s.text.trim();
		else throw new Error(`Unknown section marker: === ${s.name} ===`);
	}
	const markup = out.filter((x) => x.trim()).join('\n\n') + '\n';

	// Imports: the teaching components the markup uses, plus any raw ones, unless the
	// script block already imports them.
	const script = scriptExtra.join('\n');
	// Code samples can mention components in their text, so they are left out of the scan.
	const scan = markup.replace(/code=\{`(?:\\.|[^`\\])*`\}/g, '');
	const used = [...new Set([...scan.matchAll(/<([A-Z]\w*)[\s/>]/g)].map((m) => m[1]))];
	const imports = used.filter((n) => !new RegExp(`import\\s+${n}\\b|import\\s*\\{[^}]*\\b${n}\\b`).test(script)).map(importLine);
	const svelte = `<script lang="ts">\n${[...imports, ...(script.trim() ? [script] : [])].join('\n')}\n</script>\n\n${markup}`;
	return { meta, svelte, cards, practice: meta.practice ?? [], handoff };
}

// ---------------------------------------------------------------------------------------
// Svelte → Markdown (for exporting existing lessons, and the round-trip test)
// ---------------------------------------------------------------------------------------

const mdEsc = (s) => s.replace(/[\\*`[\]|<]/g, (c) => `\\${c}`);
const ws = (s) => s.replace(/\s+/g, ' ');

function attrValue(a, src) {
	if (a.value === true) return true;
	if (Array.isArray(a.value)) return a.value.map((v) => (v.type === 'Text' ? v.data : src.slice(v.start, v.end))).join('');
	return { expr: a.value.expression };
}
const attrsMap = (node, src) => Object.fromEntries(node.attributes.map((a) => [a.name, attrValue(a, src)]));
const exprString = (e) => (e && e.type === 'Literal' && typeof e.value === 'string' ? e.value : null);

/** True when an element's children are all inline content. */
const INLINE = new Set(['strong', 'em', 'code', 'a', 'sup', 'sub', 'br', 'kbd', 'abbr', 'span', 'small', 'mark', 's', 'u', 'b', 'i']);
const isInline = (n) => n.type === 'Text' || n.type === 'ExpressionTag' || (n.type === 'RegularElement' && INLINE.has(n.name)) || (n.type === 'Component' && n.name === 'Term');

function inlineMd(nodes, src) {
	let out = '';
	for (const n of nodes) {
		if (n.type === 'Text') out += mdEsc(ws(n.data));
		else if (n.type === 'ExpressionTag') {
			const s = exprString(n.expression);
			if (s === null) throw new Unsupported('expression in text');
			out += mdEsc(s);
		} else if (n.type === 'Component' && n.name === 'Term') {
			const a = attrsMap(n, src);
			out += `[[${inlineMd(n.fragment.nodes, src)}|${mdEsc(a.def)}]]`;
		} else if (n.type === 'RegularElement') {
			const inner = () => inlineMd(n.fragment.nodes, src);
			if (n.name === 'strong' && !n.attributes.length) out += `**${inner()}**`;
			else if (n.name === 'em' && !n.attributes.length) out += `*${inner()}*`;
			else if (n.name === 'code' && !n.attributes.length) {
				const text = n.fragment.nodes.map((c) => (c.type === 'Text' ? c.data : exprString(c.expression) ?? (() => { throw new Unsupported('code expression'); })())).join('');
				if (/\n/.test(text)) throw new Unsupported('multi-line inline code');
				const ticks = text.includes('`') ? '``' : '`';
				const padded = ticks.length > 1 ? ` ${text} ` : text;
				out += `${ticks}${padded}${ticks}`;
			} else if (n.name === 'a') {
				const a = attrsMap(n, src);
				const keys = Object.keys(a).sort().join(',');
				const ext = /^https?:/.test(a.href);
				if (typeof a.href === 'string' && ((ext && keys === 'href,rel' && a.rel === 'external') || (!ext && keys === 'href'))) out += `[${inner()}](${a.href})`;
				else throw new Unsupported('link attributes');
			} else out += src.slice(n.start, n.end).replace(/\s+/g, ' ');
		} else throw new Unsupported(`${n.type} inline`);
	}
	return out;
}

class Unsupported extends Error {}

/** Markdown for one block node; anything without a Markdown form becomes a raw ```svelte block. */
function blockMd(n, src, depth = 0) {
	const raw = () => '```svelte\n' + src.slice(n.start, n.end) + '\n```';
	try {
		if (n.type === 'Comment') {
			const m = n.data.match(/^\s*LAB:\s*(.*?)\s*$/);
			return m ? `[[LAB: ${m[1]}]]` : raw();
		}
		if (n.type === 'RegularElement') {
			if (n.attributes.length && !(n.name === 'div' && n.attributes.length === 1 && attrsMap(n, src).class === 'table-wrap')) return raw();
			if (n.name === 'p') return inlineMd(n.fragment.nodes, src).trim();
			if (n.name === 'h2' || n.name === 'h3') return `${n.name === 'h2' ? '##' : '###'} ${inlineMd(n.fragment.nodes, src).trim()}`;
			if (n.name === 'ul' || n.name === 'ol') return listMd(n, src, 0);
			if (n.name === 'dl') return glossaryMd(n, src);
			if (n.name === 'div') return tableMd(n, src);
			return raw();
		}
		if (n.type === 'Component') {
			const a = attrsMap(n, src);
			if (n.name === 'Note') return noteMd(n, a, src, depth);
			if (n.name === 'Code') return codeMd(a);
			if (n.name === 'Quiz') return quizMd(a);
			return raw();
		}
		return raw();
	} catch (e) {
		if (e instanceof Unsupported) return raw();
		throw e;
	}
}

const children = (n) => n.fragment.nodes.filter((c) => !(c.type === 'Text' && !c.data.trim()));

function listMd(n, src, indent) {
	const pad = '  '.repeat(indent);
	const items = children(n).map((li, k) => {
		if (li.type !== 'RegularElement' || li.name !== 'li' || li.attributes.length) throw new Unsupported('list item');
		const marker = n.name === 'ol' ? `${k + 1}.` : '-';
		const kids = li.fragment.nodes;
		const firstBlock = kids.findIndex((c) => c.type === 'RegularElement' && (c.name === 'ul' || c.name === 'ol'));
		const head = firstBlock < 0 ? kids : kids.slice(0, firstBlock);
		if (head.some((c) => !isInline(c))) throw new Unsupported('block in list item');
		let s = `${pad}${marker} ${inlineMd(head, src).trim()}`;
		if (firstBlock >= 0) {
			const rest = kids.slice(firstBlock).filter((c) => !(c.type === 'Text' && !c.data.trim()));
			if (rest.length !== 1) throw new Unsupported('list item content');
			s += '\n' + listMd(rest[0], src, indent + 1);
		}
		return s;
	});
	return items.join('\n');
}

function glossaryMd(n, src) {
	const items = children(n).map((div) => {
		const kids = div.type === 'RegularElement' && div.name === 'div' ? children(div) : [];
		const dt = kids.find((k) => k.name === 'dt');
		const dd = kids.find((k) => k.name === 'dd');
		if (kids.length !== 2 || !dt || !dd || div.attributes.length) throw new Unsupported('glossary');
		return `- **${inlineMd(dt.fragment.nodes, src).trim()}**: ${inlineMd(dd.fragment.nodes, src).trim()}`;
	});
	return `:::glossary\n${items.join('\n')}\n:::`;
}

function tableMd(div, src) {
	const table = children(div);
	if (table.length !== 1 || table[0].name !== 'table') throw new Unsupported('table wrapper');
	const parts = children(table[0]);
	const thead = parts.find((p) => p.name === 'thead');
	const tbody = parts.find((p) => p.name === 'tbody');
	if (!thead || !tbody || parts.length !== 2) throw new Unsupported('table parts');
	// Every pipe in a cell is escaped, including inside code, so the row splits cleanly.
	const cellMd = (c) => inlineMd(c.fragment.nodes, src).trim().replace(/(?<!\\)\|/g, '\\|');
	const headRow = children(thead);
	if (headRow.length !== 1) throw new Unsupported('table head');
	const heads = children(headRow[0]);
	if (heads.some((h) => h.name !== 'th' || attrsMap(h, src).scope !== 'col' || h.attributes.length !== 1)) throw new Unsupported('table head cells');
	const rows = children(tbody).map((tr) => {
		const cells = children(tr);
		cells.forEach((c, k) => {
			const want = k === 0 ? c.name === 'th' && attrsMap(c, src).scope === 'row' && c.attributes.length === 1 : c.name === 'td' && !c.attributes.length;
			if (!want) throw new Unsupported('table body cells');
		});
		return `| ${cells.map(cellMd).join(' | ')} |`;
	});
	return [`| ${heads.map(cellMd).join(' | ')} |`, `|${heads.map(() => '---').join('|')}|`, ...rows].join('\n');
}

function noteMd(n, a, src, depth) {
	if (typeof a.title !== 'string' || Object.keys(a).some((k) => k !== 'title' && k !== 'tone')) throw new Unsupported('note attributes');
	const head = `:::note${a.tone ? ` tone="${a.tone}"` : ''} title="${a.title.replace(/"/g, '\\"')}"`;
	const kids = children(n);
	const body = kids.every(isInline) ? inlineMd(n.fragment.nodes, src).trim() : kids.map((k) => blockMd(k, src, depth + 1)).join('\n\n');
	return `${head}\n${body}\n:::`;
}

function codeMd(a) {
	const e = a.code?.expr;
	if (!e || e.type !== 'TemplateLiteral' || e.expressions.length) throw new Unsupported('code');
	const allowed = ['lang', 'title', 'caption', 'run', 'code'];
	if (Object.keys(a).some((k) => !allowed.includes(k))) throw new Unsupported('code attributes');
	const info = [a.lang ?? 'js'];
	if (a.title) info.push(`title="${a.title.replace(/"/g, '\\"')}"`);
	if (a.caption) info.push(`caption="${a.caption.replace(/"/g, '\\"')}"`);
	if (a.run && a.run.expr?.type === 'Literal' && a.run.expr.value === false) info.push('run=false');
	else if (a.run === 'fails') info.push('run=fails');
	else if (a.run) throw new Unsupported('run value');
	const code = e.quasis[0].value.cooked;
	const fence = code.includes('```') ? '````' : '```';
	return `${fence}${info.join(' ')}\n${code}\n${fence}`;
}

function quizMd(a) {
	const e = a.questions?.expr;
	if (!e || e.type !== 'ArrayExpression') throw new Unsupported('quiz');
	const lines = [];
	if (a.title !== undefined) lines.push(`title: ${a.title}`);
	if (a.variant !== undefined) lines.push(`variant: ${a.variant}`);
	if (Object.keys(a).some((k) => !['title', 'variant', 'questions'].includes(k))) throw new Unsupported('quiz attributes');
	for (const q of e.elements) {
		if (q.type !== 'ObjectExpression') throw new Unsupported('quiz question');
		const f = Object.fromEntries(q.properties.map((p) => [p.key.name ?? p.key.value, p.value]));
		const str = (v) => {
			if (v?.type !== 'Literal' || typeof v.value !== 'string' || /\n/.test(v.value)) throw new Unsupported('quiz string');
			return v.value;
		};
		if (f.options?.type !== 'ArrayExpression' || f.answer?.type !== 'Literal' || Object.keys(f).length !== 4) throw new Unsupported('quiz fields');
		lines.push('', `Q: ${str(f.prompt)}`);
		f.options.elements.forEach((o, k) => lines.push(`${k === f.answer.value ? '*' : '-'} ${str(o)}`));
		lines.push(`Why: ${str(f.explain)}`);
	}
	return '```quiz\n' + lines.join('\n') + '\n```';
}

/**
 * Converts a lesson body back to the Markdown format, with its catalog entry, cards and
 * practice. Returns the Markdown and how many top-level blocks needed a raw ```svelte block.
 */
export function toMarkdown(svelte, meta, cards, practice, place) {
	const ast = parse(svelte, { modern: true });
	// The script: plain default imports of teaching components are implied; anything else is kept.
	const script = ast.instance
		? ast.instance.content.body
				.filter((st) => !(st.type === 'ImportDeclaration' && st.specifiers.length === 1 && st.specifiers[0].type === 'ImportDefaultSpecifier' && /components\/teach\/\w+\.svelte$/.test(st.source.value)))
				.map((st) => svelte.slice(st.start, st.end))
		: [];
	const out = [];
	let raw = 0;
	let total = 0;
	const emit = (n, depth = 0) => {
		if (n.type === 'Text' && !n.data.trim()) return;
		if (n.type === 'Component' && n.name === 'CorePack' && !n.attributes.length) return out.push('=== CORE PACK ===');
		if (n.type === 'Component' && n.name === 'Layer') {
			const a = attrsMap(n, svelte);
			out.push(`=== ${a.depth === 'deeper' ? 'GOING DEEPER' : 'UNDER THE HOOD'}: ${a.summary} ===`);
			n.fragment.nodes.forEach((c) => emit(c, depth));
			return;
		}
		const md = blockMd(n, svelte, depth);
		total++;
		if (md.startsWith('```svelte\n')) raw++;
		out.push(md);
	};
	ast.fragment.nodes.forEach((n) => emit(n));

	const fm = [
		'---',
		`id: ${meta.id}`,
		`track: ${meta.track}`,
		`level: ${meta.level}`,
		`title: ${meta.title}`,
		`summary: ${meta.summary}`,
		`dek: ${meta.dek}`,
		`assumes: ${meta.assumes}`,
		...(meta.builds?.length ? [`builds: [${meta.builds.join(', ')}]`] : []),
		...(place ? [`place: ${place}`] : []),
		`minutes: ${meta.minutes}`,
		...(practice?.length ? [`practice: [${practice.join(', ')}]`] : []),
		'---',
		''
	];
	// Statements are copied as they are: re-indenting would change multi-line strings.
	const scriptBlock = script.length ? ['```svelte-script', ...script.map((s) => '\t' + s), '```', ''] : [];
	const cardLines = cards.flatMap((c) => [
		`card: ${c.id} | ${c.term} | level ${c.level}${c.layer ? ` | ${c.layer}` : ''}`,
		`Q: ${c.question}`,
		`A: ${c.answer}`,
		`Detail: ${c.detail}`,
		''
	]);
	const md = [...fm, ...scriptBlock, out.join('\n\n'), '', '=== CARDS ===', '', ...cardLines].join('\n');
	return { md, raw, total };
}

// ---------------------------------------------------------------------------------------
// Canonical form: what a lesson means, ignoring formatting, for comparing two versions
// ---------------------------------------------------------------------------------------

const BLOCK = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);

function canonExpr(node) {
	if (Array.isArray(node)) return node.map(canonExpr);
	if (!node || typeof node !== 'object') return node;
	const out = {};
	for (const k of Object.keys(node).sort()) {
		if (['start', 'end', 'loc', 'range', 'raw', 'leadingComments', 'trailingComments', 'metadata'].includes(k)) continue;
		out[k] = canonExpr(node[k]);
	}
	return out;
}

function canonNodes(nodes, src, blockParent) {
	const toks = [];
	for (const n of nodes) {
		if (n.type === 'Text') toks.push({ t: n.data });
		else if (n.type === 'ExpressionTag' && exprString(n.expression) !== null) toks.push({ t: exprString(n.expression) });
		else if (n.type === 'Comment') toks.push({ c: n.data.trim() });
		else if (n.type === 'RegularElement' || n.type === 'Component') {
			const attrs = n.attributes
				.map((a) => {
					const v = attrValue(a, src);
					return [a.name, v === true ? true : typeof v === 'string' ? v : canonExpr(v.expr)];
				})
				.sort((x, y) => (x[0] < y[0] ? -1 : 1));
			const block = n.type === 'Component' || BLOCK.has(n.name);
			toks.push({ el: n.name, attrs, kids: canonNodes(n.fragment.nodes, src, block) });
		} else toks.push({ other: n.type, src: src.slice(n.start, n.end) });
	}
	// Merge adjacent text, collapse whitespace, drop whitespace-only text in block parents.
	const merged = [];
	for (const t of toks) {
		if ('t' in t && merged.length && 't' in merged[merged.length - 1]) merged[merged.length - 1].t += t.t;
		else merged.push({ ...t });
	}
	for (const t of merged) if ('t' in t) t.t = t.t.replace(/\s+/g, ' ');
	if (blockParent) {
		if (merged.length && 't' in merged[0]) merged[0].t = merged[0].t.replace(/^ /, '');
		if (merged.length && 't' in merged[merged.length - 1]) merged[merged.length - 1].t = merged[merged.length - 1].t.replace(/ $/, '');
		return merged.filter((t) => !('t' in t) || t.t !== '').filter((t, k, all) => !('t' in t && t.t === ' ' && (k === 0 || k === all.length - 1 || ('el' in all[k - 1] && (BLOCK.has(all[k - 1].el) || /^[A-Z]/.test(all[k - 1].el))) || ('el' in (all[k + 1] ?? {}) && (BLOCK.has(all[k + 1].el) || /^[A-Z]/.test(all[k + 1].el))))));
	}
	return merged;
}

/** A canonical JSON string for a lesson file: script statements plus the markup tree. */
export function canonical(svelte) {
	const ast = parse(svelte, { modern: true });
	const script = ast.instance ? ast.instance.content.body.map((st) => JSON.stringify(canonExpr(st))).sort() : [];
	return JSON.stringify({ script, markup: canonNodes(ast.fragment.nodes, svelte, true) });
}
