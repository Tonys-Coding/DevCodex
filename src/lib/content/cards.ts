import type { ConceptCard } from './types';

/** The full card set. Order is the collector number (#001 …). */
export const cards: ConceptCard[] = [
	// Open from the start ----------------------------------------------------
	{
		id: 'big-o',
		term: 'Big-O notation',
		track: 'structures',
		question: 'Looking up a value by index in an array is O(?)',
		answer: 'O(1), constant time',
		detail: 'The address of item i is computed directly from where the array starts, so the cost does not grow with the length.',
		level: 1
	},
	{
		id: 'stack-lifo',
		term: 'Stack',
		track: 'structures',
		question: 'Push A, push B, push C, then pop. Which comes out?',
		answer: 'C. Last in, first out',
		detail: 'A stack only touches its top. Undo history, the call stack and bracket matching all use this order.',
		level: 1
	},
	{
		id: 'queue-fifo',
		term: 'Queue',
		track: 'structures',
		question: 'Enqueue A, B, C, then dequeue. Which comes out?',
		answer: 'A. First in, first out',
		detail: 'A queue adds at the back and removes from the front, like a line at a counter. Print jobs and task queues work this way.',
		level: 1
	},
	{
		id: 'http-stateless',
		term: 'Stateless HTTP',
		track: 'web',
		question: 'Does an HTTP server remember your previous request by default?',
		answer: 'No. Each request stands alone',
		detail: 'Anything that must carry over, such as who you are, travels with every request, usually in a cookie or an Authorization header.',
		level: 1
	},
	{
		id: 'pure-function',
		term: 'Pure function',
		track: 'programming',
		question: 'What two rules make a function “pure”?',
		answer: 'Same inputs, same output; and no side effects',
		detail: 'A pure function reads nothing but its arguments and changes nothing outside itself, so it is easy to test and safe to cache.',
		level: 1
	},

	// What happens when you load a web page ----------------------------------
	{
		id: 'dns',
		term: 'DNS',
		track: 'web',
		question: 'What does a DNS resolver give back to the browser?',
		answer: 'An IP address for the name',
		detail: 'DNS translates names into addresses. The answer is cached for its TTL (time to live), so later visits skip the lookup.',
		unlockedBy: 'load-a-page',
		level: 1
	},
	{
		id: 'http-request',
		term: 'HTTP request',
		track: 'web',
		question: 'Name the three parts of a request line plus headers: GET / HTTP/2 …',
		answer: 'A method, a path and a protocol version, then headers',
		detail: 'GET says what to do, / says which resource, and headers such as accept and host describe the client and what it wants back.',
		unlockedBy: 'load-a-page',
		level: 1
	},
	{
		id: 'status-codes',
		term: 'HTTP status codes',
		track: 'web',
		question: '4xx or 5xx: which family means the server itself failed?',
		answer: '5xx',
		detail: '4xx means the request was wrong (404 not found, 401 unauthorised). 5xx means the server broke while handling a valid request (500, 503).',
		unlockedBy: 'load-a-page',
		level: 1
	},
	{
		id: 'tls',
		term: 'TLS handshake',
		track: 'web',
		question: 'What two things does the TLS handshake establish?',
		answer: 'Shared encryption keys, and proof of the server’s identity',
		detail: 'The server presents a certificate signed by a trusted authority, and both sides derive keys that encrypt everything after.',
		unlockedBy: 'load-a-page',
		level: 2
	},
	{
		id: 'render-pipeline',
		term: 'Render pipeline',
		track: 'web',
		question: 'Put in order: paint, parse, layout',
		answer: 'Parse → layout → paint',
		detail: 'The browser needs the document tree before it can size boxes, and box sizes before it can draw them.',
		unlockedBy: 'load-a-page',
		level: 2
	},

	// Caching ------------------------------------------------------------------
	{
		id: 'cache-control',
		term: 'Cache-Control',
		track: 'web',
		question: 'Which header tells a browser how long it may reuse a response without asking?',
		answer: 'Cache-Control: max-age=…',
		detail: 'max-age=3600 lets the browser reuse the response for an hour. During that hour, no request leaves the device at all.',
		unlockedBy: 'http-caching',
		level: 1
	},
	{
		id: 'revalidation',
		term: '304 Not Modified',
		track: 'web',
		question: 'The browser sends If-None-Match with an ETag. Nothing changed. What comes back?',
		answer: '304 Not Modified, with no body',
		detail: 'Revalidation costs one small round trip instead of a full download. The browser keeps using its stored copy.',
		unlockedBy: 'http-caching',
		level: 2
	},
	{
		id: 'no-cache',
		term: 'no-cache vs no-store',
		track: 'web',
		question: 'Which one forbids keeping a copy at all: no-cache or no-store?',
		answer: 'no-store',
		detail: 'no-cache still stores the response but must check with the server before each reuse. no-store keeps nothing.',
		unlockedBy: 'http-caching',
		level: 2
	},
	{
		id: 'cdn',
		term: 'CDN',
		track: 'web',
		question: 'Why does a CDN make a site faster for someone far from the origin server?',
		answer: 'It serves cached copies from a nearby edge location',
		detail: 'Distance is latency. A CDN keeps copies in many cities so most requests never travel to the origin.',
		unlockedBy: 'http-caching',
		level: 1
	},
	{
		id: 'cache-busting',
		term: 'Cache busting',
		track: 'web',
		question: 'app.3f9a1c.js is cached for a year. How do users get a new version?',
		answer: 'The new build gets a new file name',
		detail: 'Content-hashed names let files be cached forever. A change produces a new hash, so the HTML points to a URL no cache has seen.',
		unlockedBy: 'http-caching',
		level: 3
	},

	// Values and references ----------------------------------------------------
	{
		id: 'reference',
		term: 'Reference',
		track: 'programming',
		question: 'b = a, then a.push(4). Does b change if a is an array?',
		answer: 'Yes. Both names point at the same array',
		detail: 'Objects and arrays are shared by reference. Assignment copies the arrow, not the thing it points at.',
		unlockedBy: 'values-references',
		level: 1
	},
	{
		id: 'primitive-copy',
		term: 'Copying a primitive',
		track: 'programming',
		question: 'let x = 5; let y = x; y = 6. What is x?',
		answer: '5',
		detail: 'Numbers, strings and booleans are copied by value. Changing y gives y a new value and leaves x alone.',
		unlockedBy: 'values-references',
		level: 1
	},
	{
		id: 'shallow-copy',
		term: 'Shallow copy',
		track: 'programming',
		question: 'b = [...a] where a = [[1], [2]]. Then b[0].push(9). Does a change?',
		answer: 'Yes. The inner arrays are still shared',
		detail: 'Spread copies one level. Use structuredClone(a) for a deep copy when nested objects must be independent.',
		unlockedBy: 'values-references',
		level: 3
	},
	{
		id: 'reference-equality',
		term: 'Reference equality',
		track: 'programming',
		question: 'Is [1, 2] === [1, 2] true or false in JavaScript?',
		answer: 'False',
		detail: '=== on objects asks “is this the same object?”, not “do these look alike?”. Two separate arrays are never equal that way.',
		unlockedBy: 'values-references',
		level: 2
	},
	{
		id: 'mutation',
		term: 'Mutating an argument',
		track: 'programming',
		question: 'A function receives a list and appends to it. Does the caller see the change?',
		answer: 'Yes. The function got a reference to the same list',
		detail: 'Python and JavaScript pass references to objects. Return a new list instead if the caller’s data must not change.',
		unlockedBy: 'values-references',
		level: 2
	},

	// Event loop --------------------------------------------------------------
	{
		id: 'event-loop',
		term: 'Event loop',
		track: 'programming',
		question: 'setTimeout(fn, 0): does fn run immediately?',
		answer: 'No. It runs after the current code finishes',
		detail: 'The callback waits in the task queue until the call stack is empty, even with a 0 ms delay.',
		unlockedBy: 'js-event-loop',
		level: 2
	},
	{
		id: 'call-stack',
		term: 'Call stack',
		track: 'programming',
		question: 'a() calls b(), which calls c(). Which function finishes first?',
		answer: 'c(). It is on top of the stack',
		detail: 'Each call pushes a frame; each return pops one. The engine always works on the top frame.',
		unlockedBy: 'js-event-loop',
		level: 1
	},
	{
		id: 'microtask',
		term: 'Microtasks',
		track: 'programming',
		question: 'A resolved promise’s .then and a setTimeout(…, 0) are both waiting. Which runs first?',
		answer: 'The promise callback',
		detail: 'Microtasks (promise callbacks) drain completely after each task, before the loop picks the next timer or event.',
		unlockedBy: 'js-event-loop',
		level: 3
	},
	{
		id: 'blocking',
		term: 'Blocking the main thread',
		track: 'programming',
		question: 'A loop runs for 3 seconds. What happens to clicks during that time?',
		answer: 'They wait. The page cannot respond',
		detail: 'Events queue up while the stack is busy. Split long work into chunks or move it to a Web Worker.',
		unlockedBy: 'js-event-loop',
		level: 2
	},
	{
		id: 'web-apis',
		term: 'Web APIs',
		track: 'programming',
		question: 'Who actually counts down a setTimeout: the JavaScript engine or the browser?',
		answer: 'The browser',
		detail: 'Timers, network requests and DOM events are handled outside the engine, which only hears about them when a callback is queued.',
		unlockedBy: 'js-event-loop',
		level: 2
	},

	// Hash maps ---------------------------------------------------------------
	{
		id: 'hash-function',
		term: 'Hash function',
		track: 'structures',
		question: 'What must a hash function always do for the same key?',
		answer: 'Return the same number',
		detail: 'Determinism is the whole point: the key “ada” must land in the same bucket when stored and when looked up.',
		unlockedBy: 'hash-maps',
		level: 1
	},
	{
		id: 'hash-collision',
		term: 'Hash collision',
		track: 'structures',
		question: 'Two different keys land in the same bucket. What is that called?',
		answer: 'A collision',
		detail: 'Maps handle it by chaining items in a small list or by probing for the next free slot. Many collisions turn O(1) into O(n).',
		unlockedBy: 'hash-maps',
		level: 2
	},
	{
		id: 'load-factor',
		term: 'Load factor',
		track: 'structures',
		question: 'Why does a hash map grow its bucket array before it is full?',
		answer: 'To keep buckets short and lookups fast',
		detail: 'When entries ÷ buckets passes a threshold (often 0.75), the map allocates more buckets and re-hashes every key.',
		unlockedBy: 'hash-maps',
		level: 3
	},
	{
		id: 'set',
		term: 'Set',
		track: 'structures',
		question: 'You only need “have I seen this?”. Map or set?',
		answer: 'A set',
		detail: 'A set is a hash map with keys and no values. Membership checks are O(1) on average.',
		unlockedBy: 'hash-maps',
		level: 1
	},

	// Two pointers ------------------------------------------------------------
	{
		id: 'two-pointers',
		term: 'Two pointers',
		track: 'structures',
		question: 'Sorted array, find a pair that sums to k. Better than O(n²)?',
		answer: 'O(n), with a pointer at each end',
		detail: 'Sum too small? Move the left pointer right. Too big? Move the right pointer left. Each step rules out one candidate for good.',
		unlockedBy: 'two-pointer-pattern',
		level: 2
	},
	{
		id: 'sorted-precondition',
		term: 'Why sorted matters',
		track: 'structures',
		question: 'Why does the pair-sum two-pointer trick fail on an unsorted array?',
		answer: 'Moving a pointer no longer says whether the sum grows or shrinks',
		detail: 'Sorting is what makes each move safe. Sorting first costs O(n log n), which still beats O(n²).',
		unlockedBy: 'two-pointer-pattern',
		level: 2
	},
	{
		id: 'sliding-window',
		term: 'Sliding window',
		track: 'structures',
		question: 'Both pointers start at the left and move right. What is that variant called?',
		answer: 'A sliding window',
		detail: 'The right pointer grows the window, the left pointer shrinks it. It finds the best run of consecutive items in one pass.',
		unlockedBy: 'two-pointer-pattern',
		level: 3
	},

	// Recursion ---------------------------------------------------------------
	{
		id: 'recursion',
		term: 'Recursion',
		track: 'programming',
		question: 'What two parts does every working recursive function need?',
		answer: 'A base case and a recursive case',
		detail: 'The base case answers the smallest problem directly. The recursive case calls the function on something smaller, so every call moves toward the base case.',
		unlockedBy: 'recursion',
		level: 1
	},
	{
		id: 'stack-overflow',
		term: 'Stack overflow',
		track: 'programming',
		question: 'A recursive function has no base case. What happens when you call it?',
		answer: 'It never stops, and the call stack overflows',
		detail: 'Every call adds a frame. JavaScript throws “RangeError: Maximum call stack size exceeded”; Python stops at 1,000 nested calls by default with a RecursionError.',
		unlockedBy: 'recursion',
		level: 1
	},
	{
		id: 'unwinding',
		term: 'Going back up',
		track: 'programming',
		question: 'countdown(n) prints n after its recursive call instead of before. What does countdown(3) print after “Liftoff!”?',
		answer: '1, 2, 3',
		detail: 'Work placed after the call happens on the way back up, as each waiting frame finishes. The deepest call finishes first.',
		unlockedBy: 'recursion',
		level: 1
	},
	{
		id: 'memoization',
		term: 'Memoization',
		track: 'programming',
		question: 'The simple recursive fib(40) makes 331 million calls. How many with memoization?',
		answer: '79',
		detail: 'Saving each answer the first time means every fib(n) is worked out once. In Python, @functools.cache does the saving for you.',
		unlockedBy: 'recursion',
		level: 1
	},

	// Stacks and queues -------------------------------------------------------
	{
		id: 'peek',
		term: 'Peek',
		track: 'structures',
		question: 'What is the difference between pop and peek?',
		answer: 'Peek looks at the next item without removing it',
		detail: 'On a stack, peek shows the top; on a queue, the front. In JavaScript, stack.at(-1); in Python, stack[-1].',
		unlockedBy: 'stacks-queues',
		level: 1
	},
	{
		id: 'bracket-matching',
		term: 'Bracket matching',
		track: 'structures',
		question: 'Checking “([)]” with a stack, where does it fail?',
		answer: 'At “)”, because the top of the stack is “[”',
		detail: 'Push every opener. Each closer must match the top. It also fails if a closer finds the stack empty, or openers are left at the end.',
		unlockedBy: 'stacks-queues',
		level: 1
	},
	{
		id: 'deque',
		term: 'Deque',
		track: 'structures',
		question: 'In Python, what should hold a queue of 100,000 jobs?',
		answer: 'collections.deque, using popleft()',
		detail: 'list.pop(0) moves every remaining item each time. Emptying 100,000 items that way took about 0.6 s, against about 2 ms with a deque.',
		unlockedBy: 'stacks-queues',
		level: 1
	},
	{
		id: 'undo-redo',
		term: 'Undo and redo',
		track: 'structures',
		question: 'How many stacks does an editor need for undo plus redo?',
		answer: 'Two',
		detail: 'Undo pops the undo stack and pushes onto redo; redo does the reverse. A fresh edit clears the redo stack, which is why redo history disappears.',
		unlockedBy: 'stacks-queues',
		level: 1
	},

	// Cookies and sessions ----------------------------------------------------
	{
		id: 'samesite-lax',
		term: 'SameSite=Lax',
		track: 'web',
		question: 'SameSite=Lax: is the cookie sent when another site’s form POSTs to you?',
		answer: 'No. Only top-level GET navigations carry it',
		detail: 'Lax withholds the cookie from cross-site POSTs, iframes, images and fetch, which blocks the classic CSRF form post while keeping inbound links signed in.',
		unlockedBy: 'cookies-sessions',
		level: 2
	},
	{
		id: 'httponly',
		term: 'HttpOnly',
		track: 'web',
		question: 'What does HttpOnly stop?',
		answer: 'Script reading the cookie through document.cookie',
		detail: 'It keeps an XSS bug from stealing the session ID. Injected script can still send requests as the user, so it limits damage rather than preventing it.',
		unlockedBy: 'cookies-sessions',
		level: 2
	},
	{
		id: 'host-prefix',
		term: '__Host- prefix',
		track: 'web',
		question: 'What must a cookie named __Host-sid have, or the browser rejects it?',
		answer: 'Secure, Path=/ and no Domain',
		detail: 'That makes it host-only and HTTPS-only, so no sibling subdomain can set or shadow it.',
		unlockedBy: 'cookies-sessions',
		level: 2
	},
	{
		id: 'session-fixation',
		term: 'Session fixation',
		track: 'web',
		question: 'Why must the server issue a new session ID when someone signs in?',
		answer: 'So an ID the attacker planted beforehand never becomes authenticated',
		detail: 'Rotate the ID at sign-in and whenever privileges change. In express-session, call req.session.regenerate().',
		unlockedBy: 'cookies-sessions',
		level: 2
	},
	{
		id: 'same-site',
		term: 'Same-site vs same-origin',
		track: 'web',
		question: 'Are https://app.example.com and https://api.example.com the same site?',
		answer: 'Yes, though they are different origins',
		detail: 'A site is the scheme plus the registrable domain. Ports and subdomains don’t matter, so every subdomain is same-site with every other.',
		unlockedBy: 'cookies-sessions',
		level: 2
	},

	// CORS --------------------------------------------------------------------
	{
		id: 'same-origin-policy',
		term: 'Same-origin policy',
		track: 'web',
		question: 'Does the same-origin policy stop a cross-origin POST from reaching the server?',
		answer: 'No. It stops the page reading the response',
		detail: 'Requests a form could send go straight through. CORS only decides whether script may read what comes back, so it is not CSRF protection.',
		unlockedBy: 'cors',
		level: 3
	},
	{
		id: 'preflight',
		term: 'Preflight',
		track: 'web',
		question: 'Which triggers a CORS preflight: a POST with Content-Type text/plain, or a GET with an Authorization header?',
		answer: 'The GET with Authorization',
		detail: 'Authorization and application/json are never safelisted. Preflights carry no cookies, need a 2xx response and are never redirected.',
		unlockedBy: 'cors',
		level: 3
	},
	{
		id: 'cors-credentials',
		term: 'CORS with credentials',
		track: 'web',
		question: 'A fetch uses credentials: "include" and the server replies Access-Control-Allow-Origin: *. Can the page read it?',
		answer: 'No',
		detail: 'With credentials, every * is invalid. The server must echo the exact origin and send Access-Control-Allow-Credentials: true, on the preflight too.',
		unlockedBy: 'cors',
		level: 3
	},
	{
		id: 'preflight-cache',
		term: 'Preflight cache',
		track: 'web',
		question: 'Access-Control-Max-Age: 86400 in Chrome. What is cached, for how long?',
		answer: 'One result per exact URL, for at most two hours',
		detail: 'Chromium clamps Max-Age to 7,200 seconds, Firefox to 86,400. PUT /items/1 and /items/2 each need their own preflight.',
		unlockedBy: 'cors',
		level: 3
	}
];

export const cardById = (id: string) => cards.find((c) => c.id === id);
export const cardsUnlockedBy = (articleId: string) => cards.filter((c) => c.unlockedBy === articleId);
export const collectorNumber = (card: ConceptCard) => String(cards.indexOf(card) + 1).padStart(3, '0');
export const collectorTotal = String(cards.length).padStart(3, '0');
