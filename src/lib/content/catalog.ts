import type { ArticleMeta, Level, Track, TrackId } from './types';

export const tracks: Track[] = [
	{ id: 'web', title: 'How the Web Works', short: 'Web', blurb: 'What really happens between typing an address and reading a page.' },
	{ id: 'programming', title: 'Programming Concepts', short: 'Code', blurb: 'The ideas every language shares, stated plainly.' },
	{ id: 'structures', title: 'Data Structures', short: 'Data', blurb: 'How to hold data, and what each choice costs you later.' }
];

const levelRank: Record<Level, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * Every article, grouped by track and ranked easiest first inside each track.
 * `soon` entries are honest placeholders, never linked.
 */
export const articles: ArticleMeta[] = [
	{
		id: 'load-a-page',
		track: 'web',
		level: 'easy',
		status: 'live',
		title: 'What happens when you load a web page',
		summary: 'Follow one visit from the address bar to the words on your screen.',
		dek: 'You type an address, press Enter, and a page appears in about a second. In that second your browser finds a computer on the other side of the world, makes a private line to it, asks for the page and draws it. Here is each step, in plain words.',
		assumes: 'Nothing beyond everyday use of a web browser.',
		minutes: 11
	},
	{
		id: 'cookies-sessions',
		builds: ['load-a-page'],
		track: 'web',
		level: 'medium',
		status: 'live',
		title: 'Cookies, sessions and staying signed in',
		summary: 'How a stateless protocol remembers who you are.',
		dek: 'HTTP forgets you between requests. A cookie is a small note the browser hands back every time, and a session turns that note into “signed in”. See how signing in really works, and the three settings that keep it safe.',
		assumes: 'You know what a request and a response are. “What happens when you load a web page” covers both.',
		minutes: 6
	},
	{
		id: 'http-caching',
		builds: ['load-a-page'],
		track: 'web',
		level: 'medium',
		status: 'live',
		title: 'Caching: the fastest request is no request',
		summary: 'Saved copies, how long they stay fresh, and how to ship an update.',
		dek: 'Most of what a returning visitor needs is already on their device. Caching decides which saved copies can be reused, for how long, and how to check a stale one cheaply. Follow one file through two caches and learn the four instructions you will see most.',
		assumes: 'You know what a request and a response are. “What happens when you load a web page” covers both.',
		minutes: 6
	},
	{
		id: 'cors',
		builds: ['load-a-page', 'cookies-sessions'],
		track: 'web',
		level: 'medium',
		status: 'live',
		title: 'CORS without the panic',
		summary: 'Why the browser blocks some requests, and what the server must say.',
		dek: 'A page on one site can’t read another site’s answers unless that site says yes, and CORS is how it says yes. Learn what the browser actually stops, the one header that grants access, why some requests ask first, and how to read the red error in the console.',
		assumes: 'You know what a request, a response and a header are, and what a cookie does.',
		minutes: 6
	},
	{
		id: 'values-references',
		track: 'programming',
		level: 'easy',
		status: 'live',
		title: 'Values and references',
		summary: 'Why changing one variable sometimes changes another.',
		dek: 'You change one variable and a different one changes too. It feels like a bug, but it follows one simple rule about what a variable actually holds. Learn the rule once and this surprise stops happening to you.',
		assumes: 'You have seen a few lines of code, in any language.',
		minutes: 8
	},
	{
		id: 'recursion',
		builds: ['stacks-queues'],
		track: 'programming',
		level: 'easy',
		status: 'live',
		title: 'Recursion, one frame at a time',
		summary: 'A function that calls itself, traced on the call stack.',
		dek: 'A function that calls itself sounds like a loop with no way out. It isn’t: each call gets its own note on a pile called the call stack, and one simple rule stops the pile from growing. Here is how it works, one call at a time.',
		assumes: 'You have seen a function in any language, even if you have not written one yet.',
		minutes: 14
	},
	{
		id: 'js-event-loop',
		builds: ['values-references'],
		track: 'programming',
		level: 'medium',
		status: 'live',
		title: 'The event loop',
		summary: 'How one thread juggles clicks, timers and promises without freezing.',
		dek: 'JavaScript does one thing at a time, yet a page stays responsive while it waits on the network. Watch the call stack, the queues and the loop that connects them, and learn the one rule that keeps a page from freezing.',
		assumes: 'You have written a little JavaScript, including a function and a callback.',
		minutes: 6
	},
	{
		id: 'stacks-queues',
		track: 'structures',
		level: 'easy',
		status: 'live',
		title: 'Stacks and queues',
		summary: 'Last in first out, first in first out, and where each shows up.',
		dek: 'A stack gives back the newest item; a queue gives back the one that has waited longest. That one rule decides how undo, print lines and bracket checks work. Try both side by side, then build them in JavaScript and Python.',
		assumes: 'You know what a list or array is, in any language.',
		minutes: 15
	},
	{
		id: 'hash-maps',
		track: 'structures',
		level: 'easy',
		status: 'live',
		title: 'Hash maps',
		summary: 'Find anything by its key in about one step, and why that works.',
		dek: 'A hash map finds a value by its key in about one step, however much it holds, like a coat check that knows exactly which hook your coat is on. See it work, use one in Python and JavaScript, and learn when a set is the better fit.',
		assumes: 'You know what a list or array is, in any language.',
		minutes: 7
	},
	{
		id: 'two-pointer-pattern',
		track: 'structures',
		level: 'easy',
		status: 'live',
		title: 'The two-pointer pattern',
		summary: 'Use sorted order to turn O(n²) pair searches into one pass.',
		dek: 'Finding a pair in a list usually means checking every pair, which gets slow fast. When the list is sorted, two fingers walking in from the ends find it in one pass. Play it, then write it.',
		assumes: 'You can read a simple loop in Python or JavaScript.',
		minutes: 6
	},
	{
		id: 'binary-search',
		builds: ['two-pointer-pattern'],
		track: 'structures',
		level: 'easy',
		status: 'live',
		title: 'Binary search: halve it every time',
		summary: 'Find anything in a sorted list in a handful of looks.',
		dek: 'Guessing a number between 1 and 100 never takes more than seven tries if every answer throws away half. That game is binary search: about 20 looks for a million sorted items. Play it, write it, and learn the small edge mistakes that catch almost everyone.',
		assumes: 'You know what a list is and can read a simple loop.',
		minutes: 10
	},
	{
		id: 'linked-lists',
		builds: ['stacks-queues'],
		track: 'structures',
		level: 'easy',
		status: 'live',
		title: 'Linked lists: a chain of nodes',
		summary: 'Items that point to the next item, and when that beats an array.',
		dek: 'A treasure hunt hands you one clue that points to the next. A linked list stores data the same way, which makes adding at the front instant and reaching the 500th item slow. Build one, splice items in and out, and learn when an array is the better choice.',
		assumes: 'You know what a list or array is, and what an object is.',
		minutes: 10
	},
	{
		id: 'binary-trees',
		builds: ['recursion', 'binary-search'],
		track: 'structures',
		level: 'medium',
		status: 'live',
		title: 'Binary trees and search trees',
		summary: 'Nodes with two children, the rule that makes them searchable, and four ways to walk them.',
		dek: 'Folders, web pages and your code are all trees. A binary search tree keeps smaller values to the left and bigger ones to the right, so finding, adding and removing stay fast as it grows, as long as it stays bushy. Grow one, walk it four ways, and see why insertion order matters.',
		assumes: 'You are comfortable with recursion and with how binary search halves a range.',
		minutes: 12
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
	'stacks-queues': ['valid-brackets', 'warmer-days'],
	'binary-search': ['find-sorted', 'sorted-pair-sum'],
	'linked-lists': ['reverse-list'],
	'binary-trees': ['tree-depth']
};
