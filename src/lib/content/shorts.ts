import type { Short } from './types';

export const shorts: Short[] = [
	{
		kind: 'explainer',
		id: 'dns-in-five',
		title: 'DNS in five beats',
		articleId: 'load-a-page',
		nodes: [
			{ id: 'you', label: 'Browser', x: 180, y: 46 },
			{ id: 'resolver', label: 'Resolver', x: 180, y: 140 },
			{ id: 'root', label: 'Root', x: 62, y: 250 },
			{ id: 'tld', label: '.dev', x: 180, y: 250 },
			{ id: 'auth', label: 'devcodex.dev', x: 298, y: 250 }
		],
		links: [
			['resolver', 'you'],
			['resolver', 'root'],
			['resolver', 'tld'],
			['resolver', 'auth']
		],
		scenes: [
			{ caption: 'You type devcodex.dev. The browser only knows a name.', lit: ['you'] },
			{ caption: 'It asks a resolver: “where is devcodex.dev?”', lit: ['you', 'resolver'], hop: { from: 'you', to: 'resolver', label: 'where?' } },
			{ caption: 'The resolver asks a root server, which points it to the .dev servers.', lit: ['resolver', 'root'], hop: { from: 'resolver', to: 'root', label: '.dev?' } },
			{ caption: 'The .dev servers point to devcodex.dev’s own name server.', lit: ['resolver', 'tld'], hop: { from: 'resolver', to: 'tld', label: 'devcodex?' } },
			{ caption: 'That server answers with the address, and the resolver caches it.', lit: ['resolver', 'auth'], hop: { from: 'auth', to: 'resolver', label: '203.0.113.7' } },
			{ caption: 'Next visit, the cached answer skips every hop.', lit: ['you', 'resolver'], hop: { from: 'resolver', to: 'you', label: 'cached' } }
		]
	},
	{
		kind: 'myth',
		id: 'not-found-down',
		title: 'Myth or fact?',
		articleId: 'load-a-page',
		claim: 'A “404 Not Found” page means the website’s server is down.',
		isFact: false,
		explain: 'A 404 is an answer, so the server is up. It looked at the path you asked for and had nothing there. A server that is truly down never answers at all.'
	},
	{
		kind: 'myth',
		id: 'no-cache-myth',
		title: 'Myth or fact?',
		articleId: 'http-caching',
		claim: 'Cache-Control: no-cache tells the browser never to store the response.',
		isFact: false,
		explain: 'no-cache means “store it, but check with me before reusing it”. The header that forbids storing anything is no-store.'
	},
	{
		kind: 'bug',
		id: 'shared-array',
		title: 'Spot the bug',
		articleId: 'values-references',
		code: 'const defaults = ["dark"];\nconst mine = defaults;\nmine.push("compact");\nconsole.log(defaults);',
		question: 'What does the last line print?',
		options: ['["dark"]', '["dark", "compact"]', 'undefined'],
		answer: 1,
		explain: 'mine = defaults copies the reference, not the array. Both names point at the same list. Use [...defaults] for an independent copy.'
	},
	{
		kind: 'explainer',
		id: 'event-loop-six',
		title: 'The event loop in six beats',
		articleId: 'js-event-loop',
		nodes: [
			{ id: 'stack', label: 'Call stack', x: 86, y: 60 },
			{ id: 'apis', label: 'Web APIs', x: 274, y: 60 },
			{ id: 'tasks', label: 'Task queue', x: 274, y: 240 },
			{ id: 'micro', label: 'Microtasks', x: 86, y: 240 }
		],
		links: [
			['stack', 'apis'],
			['apis', 'tasks'],
			['tasks', 'stack'],
			['stack', 'micro']
		],
		scenes: [
			{ caption: 'console.log("A") runs straight away on the call stack.', lit: ['stack'] },
			{ caption: 'setTimeout hands its callback to the browser’s timer and moves on.', lit: ['stack', 'apis'], hop: { from: 'stack', to: 'apis', label: 'timer' } },
			{ caption: 'Promise.resolve().then(…) queues a microtask.', lit: ['stack', 'micro'], hop: { from: 'stack', to: 'micro', label: '.then' } },
			{ caption: 'The timer fires. Its callback joins the task queue.', lit: ['apis', 'tasks'], hop: { from: 'apis', to: 'tasks', label: 'callback' } },
			{ caption: 'The stack is empty, so every microtask runs first.', lit: ['micro', 'stack'], hop: { from: 'micro', to: 'stack', label: 'then cb' } },
			{ caption: 'Only then does the loop take one task from the queue.', lit: ['tasks', 'stack'], hop: { from: 'tasks', to: 'stack', label: 'timeout cb' } }
		]
	},
	{
		kind: 'bug',
		id: 'var-in-loop',
		title: 'Spot the bug',
		articleId: 'js-event-loop',
		code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
		question: 'What gets printed?',
		options: ['0  1  2', '3  3  3', '0  0  0'],
		answer: 1,
		explain: 'var gives one shared i for the whole loop. By the time the timeouts run, the loop has finished and i is 3. let creates a fresh i on every pass.'
	},
	{
		kind: 'pick',
		id: 'username-lookup',
		title: 'Which would you pick?',
		articleId: 'hash-maps',
		scenario: 'Sign-up form. You must check whether a username is taken, against 2 million names, on every keystroke.',
		options: [
			{ label: 'Array + includes()', cost: 'O(n) per check' },
			{ label: 'Set + has()', cost: 'O(1) average per check' }
		],
		answer: 1,
		explain: 'A set hashes each name to a bucket, so a check costs about the same at 2 million names as at 20. includes() walks the whole list.'
	},
	{
		kind: 'pick',
		id: 'sorted-pair',
		title: 'Which would you pick?',
		articleId: 'two-pointer-pattern',
		scenario: 'A sorted list of 100,000 prices. Find two that add up to a gift card’s exact value.',
		options: [
			{ label: 'Check every pair', cost: 'O(n²): about 5 billion checks' },
			{ label: 'Pointers at both ends', cost: 'O(n): at most 100,000 steps' }
		],
		answer: 1,
		explain: 'Because the list is sorted, a sum that is too small means move left forward, and a sum too big means move right back. Every step rules out a whole row of pairs.'
	}
];
