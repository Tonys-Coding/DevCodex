import type { ArticleMeta, Level, Track, TrackId } from './types';

export const tracks: Track[] = [
	{ id: 'web', title: 'How the Web Works', short: 'Web', blurb: 'What really happens between typing an address and reading a page.' },
	{ id: 'programming', title: 'Programming Concepts', short: 'Code', blurb: 'The ideas every language shares, stated plainly.' },
	{ id: 'structures', title: 'Data Structures', short: 'Data', blurb: 'How to hold data, and what each choice costs you later.' }
];

const levelRank: Record<Level, number> = { entry: 0, experienced: 1, senior: 2 };

/**
 * Every article, grouped by track and ranked easiest first inside each track.
 * `soon` entries are honest placeholders, never linked.
 */
export const articles: ArticleMeta[] = [
	{
		id: 'load-a-page',
		track: 'web',
		level: 'entry',
		status: 'live',
		title: 'What happens when you load a web page',
		summary: 'Follow one visit from the address bar to the words on your screen.',
		dek: 'You type an address, press Enter, and a page appears in about a second. In that second your browser finds a computer on the other side of the world, makes a private line to it, asks for the page and draws it. Here is each step, in plain words.',
		assumes: 'Nothing beyond everyday use of a web browser.',
		minutes: 12
	},
	{
		id: 'cookies-sessions',
		track: 'web',
		level: 'experienced',
		status: 'live',
		title: 'Cookies, sessions and staying signed in',
		summary: 'How a stateless protocol remembers who you are.',
		dek: 'HTTP forgets you between requests. Cookies carry a little state back, and sessions turn that into “signed in”. Scope, SameSite and prefixes attribute by attribute, a session store that fits on one screen, signed tokens, and the attacks each design has to survive.',
		assumes: 'You read JavaScript and know what HTTP requests, responses and headers are.',
		minutes: 16
	},
	{
		id: 'http-caching',
		track: 'web',
		level: 'experienced',
		status: 'live',
		title: 'Caching: the fastest request is no request',
		summary: 'Freshness, validators, Cache-Control and the CDN in between.',
		dek: 'Most bytes a returning visitor needs are already on their device or at a CDN edge nearby. HTTP caching is the contract that decides which copies may be reused, for how long, and how to check them cheaply once they go stale.',
		assumes: 'You know what an HTTP request and response are, and have opened the Network tab once or twice.',
		minutes: 15
	},
	{
		id: 'cors',
		track: 'web',
		level: 'senior',
		status: 'live',
		title: 'CORS without the panic',
		summary: 'Why the browser blocks some requests, and what the server must say.',
		dek: 'The same-origin policy blocks reading, not sending, and CORS is how a server grants read access. The exact safelist, preflight and cache rules from the Fetch Standard, credentials, redirects and opaque responses, a correct server, and the misconfigurations that become vulnerabilities.',
		assumes: 'Fluent with HTTP, fetch() and browser security basics such as origins and cookies.',
		minutes: 18
	},
	{
		id: 'values-references',
		track: 'programming',
		level: 'entry',
		status: 'live',
		title: 'Values and references',
		summary: 'Why changing one variable sometimes changes another.',
		dek: 'You change one variable and a different one changes too. It feels like a bug, but it follows one simple rule about what a variable actually holds. Learn the rule once and this surprise stops happening to you.',
		assumes: 'You have seen a few lines of code, in any language.',
		minutes: 12
	},
	{
		id: 'recursion',
		track: 'programming',
		level: 'entry',
		status: 'live',
		title: 'Recursion, one frame at a time',
		summary: 'A function that calls itself, traced on the call stack.',
		dek: 'A function that calls itself sounds like a loop with no way out. It isn’t: each call gets its own note on a pile called the call stack, and one simple rule stops the pile from growing. Here is how it works, one call at a time.',
		assumes: 'You have seen a function in any language, even if you have not written one yet.',
		minutes: 13
	},
	{
		id: 'js-event-loop',
		track: 'programming',
		level: 'senior',
		status: 'live',
		title: 'The event loop',
		summary: 'Tasks, microtasks, rendering steps and the Node.js phases, as specified.',
		dek: 'One thread, one call stack, and a scheduler defined by the HTML Standard. Exact ordering of tasks, microtasks and rendering, why promises can starve a frame, how Node.js differs, and how to keep interactions under budget.',
		assumes: 'Fluent JavaScript, including promises and async/await.',
		minutes: 17
	},
	{
		id: 'stacks-queues',
		track: 'structures',
		level: 'entry',
		status: 'live',
		title: 'Stacks and queues',
		summary: 'Last in first out, first in first out, and where each shows up.',
		dek: 'A stack gives back the newest item; a queue gives back the one that has waited longest. That one rule decides how undo, print lines and bracket checks work. Try both side by side, then build them in JavaScript and Python.',
		assumes: 'You know what a list or array is, in any language.',
		minutes: 13
	},
	{
		id: 'two-pointer-pattern',
		track: 'structures',
		level: 'experienced',
		status: 'live',
		title: 'The two-pointer pattern',
		summary: 'Use sorted order to turn O(n²) pair searches into one pass.',
		dek: 'Pair searches look quadratic: every element against every other. When the input is sorted, two indices moving under a simple invariant discard a candidate on every step, so the whole search finishes in linear time with constant extra memory.',
		assumes: 'You can read Python or JavaScript loops and know what O(n) means.',
		minutes: 12
	},
	{
		id: 'hash-maps',
		track: 'structures',
		level: 'senior',
		status: 'live',
		title: 'Hash maps',
		summary: 'Hashing, collision schemes, resizing, attacks and real implementations.',
		dek: 'Expected O(1) is a probabilistic promise resting on a hash function, a load-factor policy and a collision scheme. How each choice behaves under load, what CPython, V8, Java and SwissTable actually do, and how the promise breaks under attack.',
		assumes: 'Comfort with arrays, Big-O, bit operations and at least one language’s built-in map.',
		minutes: 17
	}
];

/** The reading path: live articles from easiest to hardest, keeping track order within a level. */
export const liveArticles = articles
	.filter((x) => x.status === 'live')
	.sort((x, y) => levelRank[x.level] - levelRank[y.level]);
export const articleById = (id: string) => articles.find((x) => x.id === id);
export const trackById = (id: TrackId) => tracks.find((t) => t.id === id)!;
export const articlesInTrack = (id: TrackId) => articles.filter((x) => x.track === id);

/** The next live article after `id` on the reading path, wrapping to the start. */
export function nextArticle(id: string) {
	const i = liveArticles.findIndex((x) => x.id === id);
	return liveArticles[(i + 1) % liveArticles.length];
}

/** Practice problems that exercise each article's idea. */
export const practiceFor: Record<string, string[]> = {
	'hash-maps': ['pair-sum', 'has-duplicate', 'group-anagrams'],
	'two-pointer-pattern': ['sorted-pair-sum', 'is-palindrome', 'most-water'],
	'values-references': ['is-anagram'],
	'stacks-queues': ['valid-brackets', 'warmer-days']
};
