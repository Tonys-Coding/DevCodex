/**
 * A small, dependency-free highlighter for article code samples.
 * It recognises comments, strings, numbers, keywords, literals and calls,
 * which is all a teaching snippet needs. The practice editor uses CodeMirror instead.
 */
export type CodeLang = 'js' | 'py' | 'http' | 'text';

const JS_KEYWORDS =
	'async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|yield';
const JS_LITERALS = 'true|false|null|undefined|NaN|Infinity';
const PY_KEYWORDS =
	'and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield';
const PY_LITERALS = 'True|False|None';

const rules: Record<Exclude<CodeLang, 'text'>, RegExp> = {
	js: new RegExp(
		[
			String.raw`(?<c>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
			String.raw`(?<s>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|` + '`(?:[^`\\\\]|\\\\.)*`)',
			String.raw`(?<n>\b0x[\da-fA-F]+\b|\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?\b)`,
			String.raw`(?<k>\b(?:${JS_KEYWORDS})\b)`,
			String.raw`(?<l>\b(?:${JS_LITERALS})\b)`,
			String.raw`(?<f>[A-Za-z_$][\w$]*(?=\s*\())`
		].join('|'),
		'g'
	),
	py: new RegExp(
		[
			String.raw`(?<c>#[^\n]*)`,
			String.raw`(?<s>[rbfuRBFU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'))`,
			String.raw`(?<d>@[A-Za-z_][\w.]*)`,
			String.raw`(?<n>\b0x[\da-fA-F]+\b|\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b)`,
			String.raw`(?<k>\b(?:${PY_KEYWORDS})\b)`,
			String.raw`(?<l>\b(?:${PY_LITERALS})\b)`,
			String.raw`(?<f>[A-Za-z_][\w]*(?=\s*\())`
		].join('|'),
		'g'
	),
	// Request or status line, header names, and the blank line before a body.
	http: /(?<k>^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) |^HTTP\/[\d.]+)|(?<n>(?<=^HTTP\/[\d.]+ )\d{3})|(?<f>^[A-Za-z][\w-]*(?=:))|(?<s>"[^"\n]*")/gm
};

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Returns safe HTML: every character of `code` is escaped, tokens are wrapped in `<span class="tk-…">`. */
export function highlight(code: string, lang: CodeLang): string {
	if (lang === 'text') return escape(code);
	const rule = rules[lang];
	let html = '';
	let last = 0;
	for (const match of code.matchAll(rule)) {
		const kind = Object.entries(match.groups ?? {}).find(([, v]) => v !== undefined)?.[0];
		if (!kind || match.index === undefined) continue;
		html += escape(code.slice(last, match.index)) + `<span class="tk-${kind}">${escape(match[0])}</span>`;
		last = match.index + match[0].length;
	}
	return html + escape(code.slice(last));
}
