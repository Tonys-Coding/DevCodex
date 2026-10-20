/**
 * TL;DR: short, ungrouped reads (about five minutes each) on new tech, small concepts,
 * real incidents, how everyday things work, and debates with a clear answer. Bodies live
 * in ./briefs/<id>.svelte and load on their own, like articles.
 */

export type BriefKind = 'new' | 'concept' | 'story' | 'how' | 'debate';

export type BriefMeta = {
	id: string;
	kind: BriefKind;
	title: string;
	/** One line that makes someone want to read it. */
	hook: string;
	/** The TL;DR itself: three short bullets. Many readers stop here, and that's fine. */
	tldr: [string, string, string];
	minutes: number;
	/** Local date, YYYY-MM-DD. The list is newest first. */
	published: string;
	/** For time-sensitive pieces: when the facts were last checked. */
	checked?: string;
	/** A full lesson to continue with, when one exists. */
	deeper?: string;
};

export const briefKinds: { id: BriefKind; label: string; blurb: string }[] = [
	{ id: 'new', label: 'What’s new', blurb: 'A recent release or standard, explained.' },
	{ id: 'concept', label: 'Small concept', blurb: 'An idea too small for a full lesson.' },
	{ id: 'story', label: 'Incident story', blurb: 'A real outage, retold, with the lesson.' },
	{ id: 'how', label: 'How it works', blurb: 'Everyday tech, opened up.' },
	{ id: 'debate', label: 'Debate', blurb: 'A trade-off with a clear answer.' }
];

export const briefKind = (id: BriefKind) => briefKinds.find((k) => k.id === id)!;

const all: BriefMeta[] = [
	{
		id: 'python-t-strings',
		kind: 'new',
		title: 'Python’s t-strings: f-strings that wait',
		hook: 'Python 3.14 added a string prefix that hands you the pieces instead of the finished text.',
		tldr: [
			't"…" looks like an f-string but builds a Template object, not a str.',
			'The template keeps the literal text and each value apart, so a library can escape values before joining them.',
			'That makes safe HTML, SQL and log messages possible without new syntax for each one.'
		],
		minutes: 4,
		published: '2026-10-17',
		checked: '2026-10-17'
	},
	{
		id: 'regex-outage',
		kind: 'story',
		title: 'The regex that took down Cloudflare',
		hook: 'One rule, pushed everywhere at once, pinned every CPU in a global network for about half an hour.',
		tldr: [
			'In July 2019 a new firewall rule contained a regular expression that backtracked badly.',
			'Matching it pinned CPUs on every Cloudflare server at once, and sites behind it returned 502 errors.',
			'The fixes: a regex engine with guaranteed linear time, and staged rollouts for rule changes.'
		],
		minutes: 5,
		published: '2026-10-14'
	},
	{
		id: 'passkeys',
		kind: 'how',
		title: 'How a passkey signs you in',
		hook: 'No password, nothing to phish, and nothing useful to steal from the server.',
		tldr: [
			'A passkey is a key pair: the private half stays with you, and the site keeps only the public half.',
			'To sign in, your device signs a fresh challenge from the site after you unlock it with a fingerprint, face or PIN.',
			'The browser only uses a passkey on the site it was made for, so a look-alike phishing site gets nothing.'
		],
		minutes: 5,
		published: '2026-10-10',
		deeper: 'cookies-sessions'
	},
	{
		id: 'floating-point',
		kind: 'concept',
		title: 'Why 0.1 + 0.2 isn’t 0.3',
		hook: 'It isn’t a bug in your language. It’s binary, and every language does it.',
		tldr: [
			'Computers store most decimals in binary, where 0.1 has no exact form, so it is rounded.',
			'Tiny rounding errors add up: 0.1 + 0.2 gives 0.30000000000000004 in JavaScript and Python alike.',
			'Compare with a tolerance, and keep money in whole cents or a decimal type.'
		],
		minutes: 4,
		published: '2026-10-07'
	},
	{
		id: 'monolith-first',
		kind: 'debate',
		title: 'Monolith or microservices?',
		hook: 'Microservices solve an organisation problem. If you don’t have that problem yet, they are mostly cost.',
		tldr: [
			'Start with one well-organised app (a modular monolith) and split only where you have a concrete reason.',
			'Microservices pay off when many teams need to ship independently, or parts need to scale very differently.',
			'The costs are real: network calls that fail, data spread across services, and far more to deploy and watch.'
		],
		minutes: 5,
		published: '2026-10-03'
	}
];

/** Newest first. */
export const briefs: BriefMeta[] = [...all].sort((a, b) => b.published.localeCompare(a.published));

export const briefById = (id: string) => briefs.find((b) => b.id === id);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "Oct 17", or "Oct 17, 2025" when it isn't the newest brief's year. Fixed English text,
 * so the prerendered page and the browser always agree.
 */
export function briefDate(iso: string) {
	const [y, m, d] = iso.split('-').map(Number);
	const latest = Number(briefs[0]?.published.slice(0, 4));
	return `${MONTHS[m - 1]} ${d}${y !== latest ? `, ${y}` : ''}`;
}
