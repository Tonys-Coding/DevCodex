<script lang="ts">
	import EventLoopSim, { type LoopStep } from '../../components/teach/EventLoopSim.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';

	const code = `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`;

	const steps: LoopStep[] = [
		{ line: 1, note: 'The script runs as one task. console.log("A") executes synchronously on the call stack.', stack: ['script', 'log("A")'], apis: [], micro: [], tasks: [], out: ['A'] },
		{
			line: 2,
			note: 'setTimeout registers the callback with the host’s timer and returns at once. A 0 ms delay is a minimum, not a promise to run now.',
			stack: ['script', 'setTimeout'],
			apis: ['cb → B'],
			micro: [],
			tasks: [],
			out: ['A']
		},
		{
			line: 3,
			note: 'The promise is already fulfilled, so .then enqueues its reaction as a microtask immediately. It cannot run while the script occupies the stack.',
			stack: ['script', '.then'],
			apis: ['cb → B'],
			micro: ['cb → C'],
			tasks: [],
			out: ['A']
		},
		{
			line: 4,
			note: 'console.log("D") runs. Meanwhile the timer has expired and the host queued a task for its callback.',
			stack: ['script', 'log("D")'],
			apis: [],
			micro: ['cb → C'],
			tasks: ['cb → B'],
			out: ['A', 'D']
		},
		{
			note: 'The script task completes and the stack empties. Microtask checkpoint: the microtask queue is drained before anything else.',
			stack: [],
			apis: [],
			micro: ['cb → C'],
			tasks: ['cb → B'],
			out: ['A', 'D']
		},
		{ line: 3, note: 'The promise reaction runs and logs C. The microtask queue is empty, so the checkpoint ends.', stack: ['cb → C'], apis: [], micro: [], tasks: ['cb → B'], out: ['A', 'D', 'C'] },
		{ line: 2, note: 'Next loop iteration: the loop picks one task, the timer callback, which logs B.', stack: ['cb → B'], apis: [], micro: [], tasks: [], out: ['A', 'D', 'C', 'B'] },
		{ note: 'Final order A, D, C, B: synchronous code, then all microtasks, then tasks one at a time.', stack: [], apis: [], micro: [], tasks: [], out: ['A', 'D', 'C', 'B'] }
	];
</script>

<p>
	JavaScript has <strong>run-to-completion</strong> semantics: once a function starts, nothing else in the same realm runs until the call stack
	unwinds. There is no preemption and no shared-memory threading of ordinary objects. All concurrency comes from the <strong>host</strong>, the
	browser or Node.js, which performs I/O and timing off the main thread and schedules callbacks back onto it. ECMAScript only defines
	<em>jobs</em> (promise reactions). The scheduler itself is specified by the
	<a href="https://html.spec.whatwg.org/multipage/webappapis.html#event-loops" rel="external">HTML Standard</a> in browsers and implemented by libuv in
	Node.
</p>

<h2>The moving parts</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Part</th><th scope="col">What it is</th><th scope="col">Key property</th></tr></thead>
		<tbody>
			<tr><th scope="row">Call stack</th><td>Execution contexts for the currently running code</td><td>LIFO. If <code>a()</code> calls <code>b()</code> calls <code>c()</code>, <code>c()</code> returns first. Loop work happens only when it is empty</td></tr>
			<tr><th scope="row">Host APIs</th><td>Timers, network, DOM events, file I/O, implemented outside the JS engine</td><td>The waiting happens here, not on the stack. The engine never counts down a timer</td></tr>
			<tr><th scope="row">Task queues</th><td><em>Several</em> queues, one or more per task source (timers, user interaction, networking, messaging…)</td><td>The browser picks which queue to service next, so it can favour input. Order is guaranteed only within a source</td></tr>
			<tr><th scope="row">Microtask queue</th><td>One queue: promise reactions, <code>await</code> continuations, <code>queueMicrotask</code>, <code>MutationObserver</code></td><td>Drained completely at every checkpoint, including microtasks queued while draining</td></tr>
			<tr><th scope="row">Rendering steps</th><td>Animation-frame callbacks, style, layout, paint</td><td>Run between tasks when the browser decides a frame is due</td></tr>
		</tbody>
	</table>
</div>

<p>Predict the output before stepping through. The usual first guess is A, B, C, D.</p>

<EventLoopSim {code} {steps} />

<h2>The processing model</h2>
<p>Stripped of detail, one iteration of a window event loop is:</p>

<Code
	lang="js"
	title="Event loop, simplified from the HTML Standard"
	code={`while (true) {
  const queue = chooseTaskQueue();   // implementation-defined priority
  if (queue) runTask(queue.shift()); // exactly one task

  performMicrotaskCheckpoint();      // drain until empty

  if (isRenderingOpportunity()) {    // roughly once per display frame
    runResizeAndScrollSteps();
    runAnimationFrameCallbacks();    // requestAnimationFrame
    updateIntersectionObservations();
    recalcStyleLayoutAndPaint();
  }

  if (hasIdleTime()) runIdleCallbacks(); // requestIdleCallback
}`}
	caption="Microtask checkpoints also occur whenever a callback returns and the stack becomes empty, not only after each task."
/>

<p>Three consequences drive almost every ordering question:</p>
<ol>
	<li><strong>All microtasks before the next task.</strong> A promise reaction always beats a timer that was already queued.</li>
	<li><strong>One task per iteration.</strong> Two queued timers are separated by a full microtask checkpoint, and possibly a frame.</li>
	<li><strong>Rendering only between tasks.</strong> No amount of DOM mutation inside one task shows intermediate states. The user sees the final result, or a frozen page while the task runs.</li>
</ol>

<h2>Where each API’s callback goes</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">API</th><th scope="col">Scheduled as</th><th scope="col">Runs</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>setTimeout</code>, <code>setInterval</code></th><td>Task (timer source)</td><td>No earlier than the delay; later if the loop is busy</td></tr>
			<tr><th scope="row">User input events</th><td>Task (user-interaction source)</td><td>Often prioritised by the browser</td></tr>
			<tr><th scope="row"><code>postMessage</code>, <code>MessageChannel</code></th><td>Task (posted-message source)</td><td>Next time that queue is chosen, without timer clamping</td></tr>
			<tr><th scope="row"><code>fetch</code> settlement</th><td>A networking task resolves the promise; your <code>.then</code> runs as a microtask after it</td><td>When the response headers arrive (body reads settle separately)</td></tr>
			<tr><th scope="row"><code>.then</code>, <code>await</code>, <code>queueMicrotask</code></th><td>Microtask</td><td>At the next checkpoint</td></tr>
			<tr><th scope="row"><code>MutationObserver</code></th><td>Microtask</td><td>At the next checkpoint, batched</td></tr>
			<tr><th scope="row"><code>requestAnimationFrame</code></th><td>Rendering step</td><td>Before the next paint; paused in background tabs</td></tr>
			<tr><th scope="row"><code>requestIdleCallback</code></th><td>Idle period</td><td>When the loop has spare time, or at its <code>timeout</code></td></tr>
		</tbody>
	</table>
</div>

<h2>A harder ordering puzzle</h2>

<Code
	lang="js"
	code={`console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => {
  console.log(3);
  setTimeout(() => console.log(4));
  queueMicrotask(() => console.log(5));
});
(async () => {
  console.log(6);
  await null;
  console.log(7);
})();
console.log(8);`}
/>

<Quiz
	title="Predict it"
	questions={[
		{
			prompt: 'What does the snippet above log?',
			options: ['1 6 8 3 5 7 2 4', '1 6 8 3 7 5 2 4', '1 8 6 3 7 5 2 4', '1 2 3 4 5 6 7 8'],
			answer: 1,
			explain:
				'Synchronous: 1, 6 (an async function runs synchronously until its first await), 8. The checkpoint queue is [then-callback, await-continuation]. The then-callback logs 3 and queues 5 behind the continuation, which logs 7; then 5. Tasks follow in timer order: 2, then 4.'
		}
	]}
/>

<h3>What await actually does</h3>
<p>
	<code>await v</code> suspends the async function and resumes the rest of its body in a microtask once <code>v</code> settles. It always yields,
	even when <code>v</code> is not a promise or is already fulfilled, which is why 7 above comes after 8. Awaiting a native promise costs one
	microtask hop. Awaiting a non-native thenable costs extra, because the engine first has to call its <code>then</code> method from a job of its
	own.
</p>

<Note title="await Promise.resolve() does not yield to the browser" tone="warn">
	A microtask hop never lets rendering or input handling run, because the checkpoint drains before the loop moves on. Breaking up long work with
	<code>await Promise.resolve()</code> or <code>await null</code> keeps the page just as frozen. You must yield to a <em>task</em>.
</Note>

<h2>Microtask checkpoints are more frequent than you think</h2>
<p>
	A checkpoint runs whenever a callback finishes and the JS stack becomes empty. That makes this code behave differently depending on who
	triggers the click:
</p>

<Code
	lang="js"
	code={`button.addEventListener('click', () => {
  Promise.resolve().then(() => console.log('micro 1'));
  console.log('listener 1');
});
button.addEventListener('click', () => {
  Promise.resolve().then(() => console.log('micro 2'));
  console.log('listener 2');
});`}
/>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Trigger</th><th scope="col">Output</th><th scope="col">Why</th></tr></thead>
		<tbody>
			<tr><th scope="row">A real user click</th><td>listener 1, micro 1, listener 2, micro 2</td><td>The browser invokes each listener from an empty stack, so a checkpoint runs after each one</td></tr>
			<tr><th scope="row"><code>button.click()</code> from script</th><td>listener 1, listener 2, micro 1, micro 2</td><td>The calling script is still on the stack while both listeners run, so the checkpoint waits until it returns</td></tr>
		</tbody>
	</table>
</div>

<p>This matters in tests that dispatch synthetic events: code that depends on microtask timing can pass under test and behave differently for real users.</p>

<h3>Starvation</h3>
<p>Because a checkpoint drains until empty, a microtask that keeps queueing microtasks never lets the loop advance:</p>

<Code
	lang="js"
	code={`function spinMicro() { queueMicrotask(spinMicro); }
spinMicro(); // the tab never paints or handles input again

function spinTask() { setTimeout(spinTask); }
spinTask();  // wasteful, but rendering and input still get turns`}
/>

<h2>Timers are minimums</h2>
<ul>
	<li><strong>Clamping.</strong> Once timers are nested more than five levels deep, the HTML Standard raises any delay below 4 ms to 4 ms. A chain of <code>setTimeout(f, 0)</code> therefore settles at roughly 4 ms per hop.</li>
	<li><strong>Background throttling.</strong> Hidden tabs throttle timers heavily, commonly to once per second or less, and pause <code>requestAnimationFrame</code> entirely.</li>
	<li><strong>Drift.</strong> <code>setInterval</code> fires no earlier than scheduled and slips whenever the loop is busy. For animation, use <code>requestAnimationFrame</code> and compute from its timestamp rather than counting ticks.</li>
</ul>

<h2>Rendering and forced layout</h2>
<p>
	Style and layout are normally computed once per frame, lazily. Reading a geometry property such as <code>offsetWidth</code> after a style write
	forces the browser to compute layout synchronously, right there in your task. Interleaving reads and writes in a loop does that on every
	iteration, a pattern known as <strong>layout thrashing</strong>:
</p>

<Code
	lang="js"
	code={`// Forced layout on every iteration: write, then read.
for (const el of items) {
  el.style.width = box.offsetWidth + 'px';
}

// One layout: read once, then only write.
const width = box.offsetWidth;
for (const el of items) {
  el.style.width = width + 'px';
}`}
/>

<h2>Long tasks and responsiveness</h2>
<p>
	Any task over 50 ms counts as a <strong>long task</strong>. Input arriving during it waits. <strong>Interaction to Next Paint</strong> (INP), the
	Core Web Vital that replaced First Input Delay in March 2024, measures the time from an interaction to the next frame painted after it; 200 ms or
	less at the 75th percentile counts as good. The remedy is to break work into tasks and yield between them:
</p>

<Code
	lang="js"
	code={`function yieldToMain() {
  // scheduler.yield() resumes ahead of other tasks of the same priority.
  // Not every browser has it yet, so feature-detect.
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processAll(items) {
  let deadline = performance.now() + 10;
  for (const item of items) {
    process(item);
    if (performance.now() > deadline) {
      await yieldToMain();              // input and rendering run here
      deadline = performance.now() + 10;
    }
  }
}`}
	caption="Yielding on a time budget, not every item, keeps the overhead of extra tasks small."
/>

<h2>Workers: a second loop, not a second stack</h2>
<p>
	A Web Worker is a separate thread with its own realm, heap, call stack and event loop. Communication is by <code>postMessage</code>, which
	structured-clones data, or transfers ownership of <code>ArrayBuffer</code>s with no copy. True shared memory requires
	<code>SharedArrayBuffer</code> plus <code>Atomics</code>, and browsers only expose it on cross-origin-isolated pages, served with
	<code>Cross-Origin-Opener-Policy: same-origin</code> and <code>Cross-Origin-Embedder-Policy: require-corp</code>.
</p>

<Note title="DevCodex uses one">
	Practice runs your code in a worker. A <code>while (true)</code> blocks only the worker’s loop; the page’s loop keeps handling input, notices the
	time limit, and calls <code>terminate()</code>, the only way to stop a stack that never unwinds.
</Note>

<h2>Node.js: same idea, different loop</h2>
<p>Node runs libuv’s loop, which cycles through fixed phases. Each phase has its own FIFO queue of callbacks:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Phase</th><th scope="col">Runs</th></tr></thead>
		<tbody>
			<tr><th scope="row">timers</th><td><code>setTimeout</code> and <code>setInterval</code> callbacks whose threshold has passed</td></tr>
			<tr><th scope="row">pending callbacks</th><td>Some system I/O callbacks deferred from the previous iteration, such as certain TCP errors</td></tr>
			<tr><th scope="row">idle, prepare</th><td>Internal use only</td></tr>
			<tr><th scope="row">poll</th><td>Retrieves new I/O events and runs their callbacks; may block here waiting for I/O</td></tr>
			<tr><th scope="row">check</th><td><code>setImmediate</code> callbacks</td></tr>
			<tr><th scope="row">close callbacks</th><td>Close events, such as <code>socket.on('close')</code></td></tr>
		</tbody>
	</table>
</div>

<p>
	On top of the phases, Node drains two queues after every individual callback (since Node 11, this matches browsers): first
	<code>process.nextTick</code>, then promise microtasks.
</p>

<Code
	lang="js"
	title="order.cjs"
	code={`setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');`}
	caption="As CommonJS: sync, nextTick, promise, then timeout and immediate in either order."
/>

<ul>
	<li><strong>timeout vs immediate</strong> from the main module is not deterministic: it depends on whether the 1 ms timer threshold has passed when the loop starts. Inside an I/O callback, <code>setImmediate</code> always wins, because check comes right after poll.</li>
	<li><strong>nextTick vs promise</strong> flips in an ES module: module evaluation is itself asynchronous, so the promise microtask runs before the nextTick queue is processed. Don’t rely on the relative order of the two.</li>
	<li><strong>Recursive <code>process.nextTick</code></strong> starves I/O exactly like recursive microtasks starve rendering.</li>
</ul>

<h2>Recap</h2>
<ol>
	<li>One stack per agent; host APIs do the waiting and enqueue callbacks.</li>
	<li>Per iteration: one task, a full microtask drain, then maybe a rendering update.</li>
	<li>Checkpoints also follow every callback that empties the stack, which is why real and synthetic events order microtasks differently.</li>
	<li><code>await</code> always yields a microtask, and a microtask never yields to the browser. Yield to a task to stay responsive.</li>
	<li>Timer delays are minimums, clamped when nested and throttled in the background.</li>
	<li>Node replaces the task queues with libuv phases and adds <code>process.nextTick</code> ahead of promise microtasks.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'A resolved promise’s .then and an already-expired setTimeout(…, 0) are both waiting. Which runs first?',
			options: ['The setTimeout callback', 'The promise callback', 'Whichever was registered first'],
			answer: 1,
			explain: 'The microtask queue is drained completely before the loop takes the next task.'
		},
		{
			prompt: 'A function does 2 s of work in a loop, calling await Promise.resolve() every 10 ms. Can the user click anything meanwhile?',
			options: ['Yes, each await yields to the browser', 'No, microtask hops never let input or rendering run'],
			answer: 1,
			explain: 'Each continuation is a microtask, drained in the same checkpoint. Use scheduler.yield() or setTimeout to yield to a task.'
		},
		{
			prompt: 'Who counts down a setTimeout?',
			options: ['The JavaScript engine, on the call stack', 'The host, outside JavaScript'],
			answer: 1,
			explain: 'Timers are a host API. The engine only sees the callback once the host queues it as a task.'
		},
		{
			prompt: 'In Node, inside an fs.readFile callback, you schedule setTimeout(f, 0) and setImmediate(g). Which runs first?',
			options: ['f', 'g', 'It varies'],
			answer: 1,
			explain: 'The callback runs in the poll phase, and the check phase (setImmediate) comes before the loop wraps around to timers.'
		},
		{
			prompt: 'Which of these never lets a frame paint until it stops?',
			options: ['A setTimeout that reschedules itself', 'A microtask that queues itself', 'A requestAnimationFrame callback that requests another'],
			answer: 1,
			explain: 'The checkpoint keeps draining as long as microtasks keep arriving, so the loop never reaches the rendering steps.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://html.spec.whatwg.org/multipage/webappapis.html#event-loops" rel="external">HTML Standard: event loops</a></li>
	<li><a href="https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/" rel="external">Jake Archibald: Tasks, microtasks, queues and schedules</a></li>
	<li><a href="https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" rel="external">Node.js: the event loop, timers and process.nextTick()</a></li>
	<li><a href="https://web.dev/articles/inp" rel="external">web.dev: Interaction to Next Paint</a></li>
	<li><a href="https://web.dev/articles/optimize-long-tasks" rel="external">web.dev: Optimize long tasks</a></li>
</ul>
