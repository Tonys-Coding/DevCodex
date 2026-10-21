# DevCodex curriculum roadmap

The full path for each topic: what is live, and what comes next, in reading order. Within a topic, lessons run easiest concept first while keeping prerequisites in order (`builds`). Difficulty follows the rubric in PRODUCT.md "Difficulty and depth". Every lesson has a Core, a Going deeper layer and an Under the hood layer.

Each planned lesson lists what each layer covers, a lab idea (the interactive piece, built separately), and practice problems where they fit. Lesson ids are final once a lesson ships, because progress is stored by id.

**Status:** 14 live, 37 planned, 51 in all.

How to use this file:
- To write a planned lesson, turn its entry into a brief (`.claude/skills/lesson-writer/templates/lesson-brief.md`) and follow the lesson-writer skill.
- When a lesson ships, change its status here to Live, and update `.claudememory/progress.md`.
- A lesson can be listed in the catalog as `status: 'soon'` before it is written, so it shows as "Coming soon".

---

## How the Web Works (`web`)

What happens between typing an address and reading a page, and how sites stay fast and safe.

| # | Id | Lesson | Level | Builds on | Status |
|---|---|---|---|---|---|
| 1 | `load-a-page` | What happens when you load a web page | Easy | | Live |
| 2 | `http-requests` | HTTP requests: methods, headers and status codes | Easy | load-a-page | Live |
| 3 | `packets-tcp-udp` | How data crosses the internet: IP, TCP and UDP | Easy | load-a-page | Planned |
| 4 | `dns` | DNS: the internet's address book | Medium | packets-tcp-udp | Planned |
| 5 | `https-tls` | HTTPS and certificates | Medium | packets-tcp-udp | Planned |
| 6 | `cookies-sessions` | Cookies, sessions and staying signed in | Medium | load-a-page | Live |
| 7 | `http-caching` | Caching: the fastest request is no request | Medium | load-a-page | Live |
| 8 | `cors` | CORS without the panic | Medium | load-a-page, cookies-sessions | Live |
| 9 | `rest-apis` | Designing APIs: REST, JSON and errors | Medium | http-requests | Planned |
| 10 | `auth-passwords-tokens` | Signing in safely: passwords, hashing and tokens | Medium | cookies-sessions, https-tls | Planned |
| 11 | `realtime-web` | Real time: polling, server-sent events and WebSockets | Medium | http-requests | Planned |
| 12 | `storage-offline` | Storage and offline: localStorage, IndexedDB and service workers | Medium | http-caching | Planned |
| 13 | `web-performance` | Fast pages: the rendering path and Core Web Vitals | Medium | load-a-page, http-caching | Planned |
| 14 | `cdns-load-balancing` | Serving many people: CDNs, load balancers and proxies | Medium | dns, http-caching | Planned |
| 15 | `web-security` | The big web attacks: XSS, CSRF and injection | Hard | cookies-sessions, cors | Planned |
| 16 | `browser-internals` | Inside a browser engine | Hard | web-performance | Planned |

### 2. HTTP requests: methods, headers and status codes (Easy)
- **Core:** anatomy of a URL; a request line, headers and body; GET, POST, PUT, PATCH and DELETE; the five status families with the common codes; reading a request in DevTools.
- **Going deeper:** safe and idempotent methods and why retries depend on them; content negotiation (`Accept`, `Content-Type`); redirects (301, 302, 307, 308); query strings and encoding.
- **Under the hood:** HTTP semantics (RFC 9110) vs. message syntax; HTTP/1.1 framing (`Content-Length`, chunked) vs. HTTP/2 frames; header compression (HPACK, QPACK).
- **Lab:** a request builder. Pick a method, path and headers, then see the exact request text and a plausible response.
- **Practice:** "Read a query string" (`parse-query`), built.

### 3. How data crosses the internet: IP, TCP and UDP (Easy)
- **Core:** packets; IP addresses and ports; routers forward hop by hop; TCP makes a reliable, ordered stream; UDP sends and forgets; when each is right.
- **Going deeper:** the three-way handshake; sequence numbers, acks and retransmission; flow and congestion control in plain terms; NAT; IPv4 vs. IPv6.
- **Under the hood:** the slow start and congestion window, with numbers; head-of-line blocking; why QUIC runs on UDP; MTU and fragmentation.
- **Lab:** a packet lane. Send a message as packets, drop one, and watch TCP resend it while UDP shows the gap.

### 4. DNS: the internet's address book (Medium)
- **Core:** names to addresses; resolvers and caches; TTL; record types (A, AAAA, CNAME, MX, TXT); why DNS changes "take time".
- **Going deeper:** the full lookup (stub, recursive resolver, root, TLD, authoritative); negative caching; CNAME rules and the apex problem; using `dig`.
- **Under the hood:** anycast; DNSSEC signatures and the chain of trust; DNS over HTTPS and TLS; cache poisoning and the defences.
- **Lab:** a lookup walker (StepFlow). Step through each server, with the cache short-circuiting a repeat lookup.

### 5. HTTPS and certificates (Medium)
- **Core:** what encryption protects and what it doesn't; certificates prove who a site is; certificate authorities; the padlock; mixed content.
- **Going deeper:** the TLS 1.3 handshake in steps; certificate chains and validation; HSTS; Let's Encrypt and automatic renewal.
- **Under the hood:** key exchange (ECDHE) and forward secrecy; Certificate Transparency logs; OCSP and revocation trade-offs; 0-RTT replay risk.
- **Lab:** a certificate chain explorer. Click through leaf, intermediate and root, and break a link to see validation fail.

### 9. Designing APIs: REST, JSON and errors (Medium)
- **Core:** resources and URLs; JSON; status codes for errors; pagination; versioning; idempotency keys for safe retries.
- **Going deeper:** consistent error bodies (RFC 9457 problem details); filtering and sorting; rate limits and `Retry-After`; when GraphQL or gRPC fit better.
- **Under the hood:** optimistic concurrency with ETags and `If-Match`; cursor vs. offset pagination at scale; backward-compatible changes.
- **Lab:** an endpoint designer. Choose a URL and method for each action and get feedback on REST conventions.

### 10. Signing in safely: passwords, hashing and tokens (Medium)
- **Core:** why sites never store passwords; hashing and salt; slow hashes (bcrypt, Argon2); multi-factor sign-in; passkeys in brief (links to the TL;DR).
- **Going deeper:** session cookies vs. JWTs, honestly compared; refresh tokens; signing out everywhere; brute-force limits.
- **Under the hood:** OAuth 2.0 and OpenID Connect flows with PKCE; JWT pitfalls (`alg: none`, key confusion); timing-safe comparison.
- **Lab:** a hash playground. Type a password and see salted hashes change, and how long cracking takes for fast vs. slow hashes.
- **Practice:** "Constant-time compare" (new, Easy).

### 11. Real time: polling, server-sent events and WebSockets (Medium)
- **Core:** why HTTP is request-first; polling and long polling; server-sent events; WebSockets; picking one.
- **Going deeper:** reconnecting and resuming; heartbeats; scaling many open connections; presence and fan-out.
- **Under the hood:** the WebSocket upgrade handshake and frames; backpressure; HTTP/2 and HTTP/3 streams vs. WebSockets; WebTransport.
- **Lab:** a race of three transports, showing messages and wasted requests over time.

### 12. Storage and offline: localStorage, IndexedDB and service workers (Medium)
- **Core:** where a browser keeps data; cookies vs. localStorage vs. IndexedDB; limits and eviction; offline pages with a service worker (DevCodex itself as the example).
- **Going deeper:** cache strategies (cache first, network first, stale while revalidate); updates and versioning; storage persistence requests.
- **Under the hood:** the service worker lifecycle (install, activate, fetch); IndexedDB transactions; storage partitioning by site.
- **Lab:** a cache strategy simulator with an on/off network switch.

### 13. Fast pages: the rendering path and Core Web Vitals (Medium)
- **Core:** what makes a page feel slow; LCP, INP and CLS in plain words; images, fonts and scripts as the usual culprits.
- **Going deeper:** the critical rendering path; `defer`, `async` and `preload`; code splitting; measuring with Lighthouse and real-user data.
- **Under the hood:** the long-task budget and the event loop; layout thrashing; compositor-only animation; field vs. lab data.
- **Lab:** a page loading timeline. Toggle fixes and watch LCP and CLS move.

### 14. Serving many people: CDNs, load balancers and proxies (Medium)
- **Core:** one server isn't enough; CDNs copy content near people; load balancers spread requests; reverse proxies.
- **Going deeper:** health checks; sticky sessions and why to avoid them; cache keys at a CDN; purge vs. versioned URLs.
- **Under the hood:** L4 vs. L7 balancing; consistent hashing; anycast routing; TLS termination.
- **Lab:** a traffic map. Add servers and edges and watch latency and load change.

### 15. The big web attacks: XSS, CSRF and injection (Hard)
- **Core:** the three attacks, each with one concrete story; why "never trust input" matters; output encoding.
- **Going deeper:** Content Security Policy; SameSite and CSRF tokens; parameterised queries; safe HTML sanitising.
- **Under the hood:** DOM-based XSS and trusted types; clickjacking and frame-ancestors; SSRF; how the defences interact.
- **Lab:** a vulnerable comment box. Try a payload, then switch on each defence and see which one stops it.

### 16. Inside a browser engine (Hard)
- **Core:** the browser's processes; parse, style, layout, paint and composite; where JavaScript fits.
- **Going deeper:** the DOM and CSSOM; layers and the compositor; site isolation; why some CSS changes are cheap.
- **Under the hood:** JIT tiers in a JS engine; incremental and parallel styling; rasterisation on the GPU.
- **Lab:** a pipeline stepper. Change one CSS property and see which stages re-run.

---

## Programming Concepts (`programming`)

The ideas every language shares, stated plainly.

| # | Id | Lesson | Level | Builds on | Status |
|---|---|---|---|---|---|
| 1 | `values-references` | Values and references | Easy | | Live |
| 2 | `types` | Types: what kind of value is this? | Easy | values-references | Planned |
| 3 | `functions-scope` | Functions, scope and closures | Easy | values-references | Planned |
| 4 | `recursion` | Recursion, one frame at a time | Easy | stacks-queues | Live |
| 5 | `errors` | When things go wrong: errors and exceptions | Easy | functions-scope | Planned |
| 6 | `modules-packages` | Modules, packages and versions | Easy | functions-scope | Planned |
| 7 | `testing` | Testing your code | Easy | functions-scope | Planned |
| 8 | `git` | Git: how version control works | Medium | modules-packages | Planned |
| 9 | `js-event-loop` | The event loop | Medium | values-references | Live |
| 10 | `async-await` | Promises and async/await | Medium | js-event-loop | Planned |
| 11 | `objects-classes` | Objects, classes and composition | Medium | functions-scope | Planned |
| 12 | `functional` | Functional programming: map, filter and reduce | Medium | functions-scope | Planned |
| 13 | `memory-gc` | Memory: the stack, the heap and garbage collection | Medium | values-references, recursion | Planned |
| 14 | `strings-unicode` | Text is hard: strings, Unicode and encodings | Medium | types | Planned |
| 15 | `regex` | Regular expressions | Medium | strings-unicode | Planned |
| 16 | `concurrency` | Concurrency: threads, locks and race conditions | Hard | async-await, memory-gc | Planned |
| 17 | `how-code-runs` | How code runs: compilers, interpreters and JITs | Hard | memory-gc | Planned |

### 2. Types: what kind of value is this? (Easy)
- **Core:** values have types; numbers, strings, booleans, lists, objects; dynamic (Python, JavaScript) vs. static (TypeScript, Java); type errors and when you find them.
- **Going deeper:** strong vs. weak typing and coercion surprises (`"5" + 1`); `null` and `undefined`; type annotations and inference; generics in brief.
- **Under the hood:** structural (TypeScript) vs. nominal (Java) typing; type erasure; how a type checker narrows a union.
- **Lab:** a coercion table. Pick two values and an operator, and see the result in JavaScript and Python side by side.

### 3. Functions, scope and closures (Easy)
- **Core:** functions take inputs and return outputs; parameters vs. arguments; local and global scope; a closure is a function that remembers where it was made.
- **Going deeper:** closures for counters and private state; the loop-variable trap (`var` vs. `let`); default and keyword arguments; first-class functions.
- **Under the hood:** environment records and scope chains; Python's LEGB rule and `nonlocal`; closures and memory leaks.
- **Lab:** a scope explorer (CodeTrace). Step through code and watch which variables each frame can see.
- **Practice:** "Make a counter" (new, Easy, closures).

### 5. When things go wrong: errors and exceptions (Easy)
- **Core:** errors vs. bugs; throwing and catching; reading a traceback; fail early with a clear message.
- **Going deeper:** custom error types; `finally` and cleanup (`with`, `using`); retry vs. give up; errors in async code.
- **Under the hood:** stack unwinding; the cost of exceptions; result types (Rust, Go-style returns) compared.
- **Lab:** a traceback reader. Click each line of a real traceback to see what it means.

### 6. Modules, packages and versions (Easy)
- **Core:** splitting code into modules; import and export; packages and registries (npm, PyPI); semantic versioning.
- **Going deeper:** lock files and reproducible installs; version ranges (`^`, `~`); dev vs. runtime dependencies; virtual environments.
- **Under the hood:** how npm and pip resolve a dependency tree; ES modules vs. CommonJS; supply-chain attacks and defences.
- **Lab:** a semver range tester. Type a range and see which versions match.

### 7. Testing your code (Easy)
- **Core:** why test; a unit test with an assertion; arrange, act, assert; running tests.
- **Going deeper:** test doubles (fakes, stubs, mocks); test-driven development; what coverage does and doesn't tell you.
- **Under the hood:** property-based testing; mutation testing; flaky tests and their causes.
- **Lab:** a red-green loop. Edit a small function until all its tests pass.

### 8. Git: how version control works (Medium)
- **Core:** snapshots called commits; branches; merging; remotes, push and pull; a safe everyday workflow.
- **Going deeper:** merge vs. rebase; resolving conflicts; `reset`, `revert` and `restore`; `git bisect` (links to binary search).
- **Under the hood:** blobs, trees, commits and refs; content addressing by hash; packfiles; why history is a graph.
- **Lab:** a commit graph you can branch, merge and rebase by clicking.

### 10. Promises and async/await (Medium)
- **Core:** waiting without freezing; callbacks to promises to `async`/`await`; handling errors; running things in parallel.
- **Going deeper:** `Promise.all`, `allSettled`, `race` and `any`; cancellation with `AbortController`; Python's `asyncio`.
- **Under the hood:** promises as microtasks; how `async` functions compile to state machines; unhandled rejections.
- **Lab:** a timeline of three requests, sequential vs. parallel.

### 11. Objects, classes and composition (Medium)
- **Core:** bundling data with behaviour; classes and instances; methods and `this`/`self`; encapsulation.
- **Going deeper:** inheritance and its traps; composition over inheritance; interfaces and duck typing; dataclasses and records.
- **Under the hood:** JavaScript prototypes; method lookup (MRO in Python, vtables in compiled languages).
- **Lab:** a class builder that shows the prototype or method-lookup chain.

### 12. Functional programming: map, filter and reduce (Medium)
- **Core:** pure functions (the starter "Pure function" card); map, filter and reduce; avoiding shared state.
- **Going deeper:** higher-order functions; immutability in practice; composing functions; laziness (generators).
- **Under the hood:** persistent data structures and structural sharing; tail calls revisited.
- **Lab:** a pipeline builder. Chain map, filter and reduce over sample data and watch each stage.

### 13. Memory: the stack, the heap and garbage collection (Medium)
- **Core:** where values live; stack frames vs. the heap; references keep things alive; garbage collection frees what nothing points to.
- **Going deeper:** reference counting (CPython) vs. tracing (V8); cycles; memory leaks in long-running apps.
- **Under the hood:** generational GC, mark-and-sweep and compaction; pause times; manual memory and ownership (Rust) in brief.
- **Lab:** a heap view. Create objects and links, drop references, and run a collection.

### 14. Text is hard: strings, Unicode and encodings (Medium)
- **Core:** characters vs. bytes; Unicode code points; UTF-8; why text "turns into question marks".
- **Going deeper:** string length surprises (emoji, accents); normalisation; case folding; string immutability.
- **Under the hood:** UTF-16 and surrogate pairs in JavaScript; grapheme clusters; encoding bugs in practice.
- **Lab:** a byte inspector. Type text and see code points, UTF-8 bytes and UTF-16 units.
- **Practice:** "Reverse a string correctly" (new, Medium).

### 15. Regular expressions (Medium)
- **Core:** patterns for text; literal characters, classes, quantifiers and anchors; testing a pattern.
- **Going deeper:** groups and captures; lookaround; greedy vs. lazy; flags.
- **Under the hood:** backtracking vs. linear-time engines (links to the Cloudflare TL;DR); ReDoS.
- **Lab:** a live matcher that highlights matches and shows the engine's steps.

### 16. Concurrency: threads, locks and race conditions (Hard)
- **Core:** concurrency vs. parallelism; threads; a race condition you can see; locks.
- **Going deeper:** deadlock and how to avoid it; atomic operations; message passing vs. shared memory; Python's GIL and free-threading.
- **Under the hood:** memory models and visibility; compare-and-swap; lock-free structures.
- **Lab:** two threads updating a counter, with and without a lock.

### 17. How code runs: compilers, interpreters and JITs (Hard)
- **Core:** source to machine; compiling vs. interpreting; bytecode; why Python and JavaScript feel different.
- **Going deeper:** tokens, parse trees and the AST; optimisation passes; WebAssembly in brief.
- **Under the hood:** JIT tiers and deoptimisation; inline caches and hidden classes; CPython's specialising interpreter.
- **Lab:** a tokenizer and AST viewer for a one-line expression.

---

## Data Structures (`structures`)

How to hold data, and what each choice costs later. Includes the core algorithm patterns that go with them.

| # | Id | Lesson | Level | Builds on | Status |
|---|---|---|---|---|---|
| 1 | `big-o-arrays` | Big-O and arrays: how code scales | Easy | | Planned |
| 2 | `stacks-queues` | Stacks and queues | Easy | big-o-arrays | Live |
| 3 | `hash-maps` | Hash maps | Easy | big-o-arrays | Live |
| 4 | `two-pointer-pattern` | The two-pointer pattern | Easy | big-o-arrays | Live |
| 5 | `sliding-window` | The sliding window pattern | Easy | two-pointer-pattern | Planned |
| 6 | `prefix-sums` | Prefix sums and running totals | Easy | big-o-arrays | Planned |
| 7 | `binary-search` | Binary search: halve it every time | Easy | two-pointer-pattern | Live |
| 8 | `sorting` | Sorting: from insertion sort to merge sort | Easy | big-o-arrays, recursion | Planned |
| 9 | `linked-lists` | Linked lists: a chain of nodes | Easy | stacks-queues | Live |
| 10 | `binary-trees` | Binary trees and search trees | Medium | recursion, binary-search | Live |
| 11 | `heaps` | Heaps and priority queues | Medium | binary-trees | Planned |
| 12 | `graphs` | Graphs: nodes, edges, BFS and DFS | Medium | stacks-queues, binary-trees | Planned |
| 13 | `tries` | Tries: trees for words | Medium | binary-trees, hash-maps | Planned |
| 14 | `backtracking` | Backtracking: try, undo, try again | Medium | recursion | Planned |
| 15 | `greedy` | Greedy algorithms | Medium | sorting, heaps | Planned |
| 16 | `bit-manipulation` | Bits and bit manipulation | Medium | big-o-arrays | Planned |
| 17 | `dynamic-programming` | Dynamic programming | Hard | recursion, backtracking | Planned |
| 18 | `graph-algorithms` | Graph algorithms: shortest paths, topological sort and union-find | Hard | graphs, heaps | Planned |
| 19 | `balanced-trees` | Balanced trees and B-trees | Hard | binary-trees | Planned |

When `big-o-arrays` ships, add it to `builds` for stacks-queues, hash-maps and two-pointer-pattern.

### 1. Big-O and arrays: how code scales (Easy)
- **Core:** counting steps as input grows; O(1), O(log n), O(n), O(n log n), O(n²) with everyday examples; arrays and indexing; why appending is cheap and inserting at the front isn't (the starter "Big-O notation" card).
- **Going deeper:** best, worst and average case; space complexity; amortised cost (dynamic arrays); reading the complexity of nested loops.
- **Under the hood:** caches and memory layout (why O(n) arrays beat O(n) linked lists); constant factors; when Big-O misleads.
- **Lab:** a growth race. Drag n and watch operation counts for each complexity class.
- **Practice:** "Pair that hits the target" (`pair-sum`) and "Any repeats?" (`has-duplicate`), both existing.

### 5. The sliding window pattern (Easy)
- **Core:** a window over a list that grows and shrinks; fixed vs. variable windows; turning O(n²) into O(n).
- **Going deeper:** windows with a hash map (longest substring without repeats); the shrink condition as an invariant.
- **Under the hood:** monotonic deques for window maximums; proofs of linear time.
- **Lab:** a window you move by hand over a string, with the running state shown.
- **Practice:** "Buy low, sell later" (`best-profit`) and "Longest run without repeats" (`longest-unique`), both existing.

### 6. Prefix sums and running totals (Easy)
- **Core:** precomputing running totals; any range sum in O(1); everyday uses (sales by day).
- **Going deeper:** prefix sums with a hash map (subarrays that sum to k); 2D prefix sums.
- **Under the hood:** difference arrays; Fenwick trees in brief.
- **Lab:** pick any range and see its sum from two prefix values.
- **Practice:** "Range sum" (new, Easy).

### 8. Sorting: from insertion sort to merge sort (Easy)
- **Core:** why sorted data helps; insertion sort by hand; merge sort's split-and-merge idea; O(n²) vs. O(n log n); just use the built-in sort.
- **Going deeper:** quicksort and pivots; stability and why it matters; sorting objects by key; counting sort.
- **Under the hood:** Timsort (Python, V8): runs and galloping; the O(n log n) lower bound for comparison sorts.
- **Lab:** a sort visualiser with two algorithms racing on the same data.

### 11. Heaps and priority queues (Medium)
- **Core:** always get the smallest (or largest) next; a heap as a tree stored in an array; push and pop in O(log n); `heapq`.
- **Going deeper:** heapify in O(n); top-k problems; merging sorted lists; scheduling.
- **Under the hood:** sift-up and sift-down proofs; d-ary heaps; why Dijkstra needs a heap.
- **Lab:** a heap you push to and pop from, shown as both a tree and an array.
- **Practice:** "The k most common" (`top-k-frequent`, existing); "Kth largest" (new, Medium).

### 12. Graphs: nodes, edges, BFS and DFS (Medium)
- **Core:** nodes and edges everywhere (maps, friends, links); directed vs. undirected; adjacency lists; BFS with a queue, DFS with a stack.
- **Going deeper:** connected components; cycle detection; grids as graphs; shortest path in unweighted graphs.
- **Under the hood:** adjacency matrix vs. list costs; iterative deepening; graph size in real systems.
- **Lab:** draw a small graph, then run BFS and DFS step by step.
- **Practice:** "Count islands" (new, Medium).

### 13. Tries: trees for words (Medium)
- **Core:** a tree where each edge is a letter; insert and search; prefixes and autocomplete.
- **Going deeper:** counting words with a prefix; deleting; memory trade-offs vs. a hash set.
- **Under the hood:** compressed tries (radix trees); tries in routers and IP lookup.
- **Lab:** type words and watch the trie grow; type a prefix to autocomplete.
- **Practice:** "Implement autocomplete" (new, Medium).

### 14. Backtracking: try, undo, try again (Medium)
- **Core:** exploring choices; recursion plus undo; subsets and permutations.
- **Going deeper:** pruning; N-queens and Sudoku; generating combinations without duplicates.
- **Under the hood:** state space size; constraint propagation.
- **Lab:** a decision tree that explores and backtracks visibly.
- **Practice:** "All subsets" (new, Medium).

### 15. Greedy algorithms (Medium)
- **Core:** take the best choice now; when that works (coins, activity selection) and when it fails.
- **Going deeper:** exchange-argument proofs in plain words; interval scheduling; Huffman coding.
- **Under the hood:** matroids in brief; greedy vs. dynamic programming.
- **Lab:** a coin-change machine where greedy succeeds with one coin set and fails with another.

### 16. Bits and bit manipulation (Medium)
- **Core:** binary numbers; AND, OR, XOR and shifts; flags and masks; two's complement.
- **Going deeper:** XOR tricks (find the single number); counting set bits; bitsets.
- **Under the hood:** CPU instructions (popcount); integer overflow (links to binary search's midpoint bug).
- **Lab:** a bit board you toggle, with each operator applied live.
- **Practice:** "The odd one out" (new, Easy).

### 17. Dynamic programming (Hard)
- **Core:** remember answers to subproblems (memoization from Recursion); top-down vs. bottom-up; climbing stairs and coin change.
- **Going deeper:** defining the state; 2D tables (edit distance, grid paths); reconstructing the answer.
- **Under the hood:** space optimisation; knapsack and pseudo-polynomial time; when DP doesn't apply.
- **Lab:** a table that fills cell by cell, showing which earlier cells each one uses.
- **Practice:** "Climbing stairs" and "Coin change" (new, Medium).

### 18. Graph algorithms: shortest paths, topological sort and union-find (Hard)
- **Core:** weighted edges; Dijkstra's idea; ordering tasks with dependencies; grouping with union-find.
- **Going deeper:** Dijkstra with a heap; Kahn's algorithm; union-find with path compression; minimum spanning trees.
- **Under the hood:** negative weights and Bellman-Ford; A* heuristics; inverse Ackermann time.
- **Lab:** a map where you run Dijkstra step by step.
- **Practice:** "Course schedule" (new, Medium).

### 19. Balanced trees and B-trees (Hard)
- **Core:** why search trees go lopsided; balance through rotations; B-trees store many keys per node.
- **Going deeper:** AVL vs. red-black rules; B-tree splits and merges; why databases use B+ trees.
- **Under the hood:** height bounds and proofs; write amplification; LSM trees compared.
- **Lab:** insert keys and watch rotations or node splits.

---

## Suggested writing order

Foundations first, then the lessons the existing ones point to.

1. **Wave 1:** big-o-arrays, http-requests, types, functions-scope, sliding-window, sorting.
2. **Wave 2:** packets-tcp-udp, async-await, heaps, graphs, testing, errors.
3. **Wave 3:** dns, https-tls, objects-classes, functional, prefix-sums, backtracking.
4. **Wave 4:** rest-apis, auth-passwords-tokens, memory-gc, tries, greedy, dynamic-programming.
5. **Wave 5:** the remaining Medium and Hard lessons.

## Topics to consider later

Not part of this roadmap, but natural next topics: Databases (SQL, indexes, transactions), System Design (scaling, queues, consistency), and Operating Systems (processes, files, networking basics).
