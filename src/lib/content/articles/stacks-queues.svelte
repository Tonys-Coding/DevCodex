<script lang="ts">
	import StackQueueLab from '../../components/teach/StackQueueLab.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
</script>

<p>
	Programs are full of things that have to wait their turn: clicks waiting to be handled, pages waiting to be printed, edits waiting to be undone.
	When things wait, the important question is <em>which one goes next</em>. Stacks and queues are the two simplest answers, and between them they
	turn up in almost every piece of software you use.
</p>
<p>
	Both hold a collection of items. Both let you add an item and take one out. The only difference is <em>which</em> item comes out. That one rule
	changes what each is good for.
</p>
<p>In this article you will learn:</p>
<ul>
	<li>how a stack and a queue each decide what comes out next,</li>
	<li>the names programmers use for adding, removing and looking,</li>
	<li>how to build both in JavaScript and Python, including one trap that makes queues slow,</li>
	<li>where each one hides in apps you already use, and</li>
	<li>how a stack checks that brackets in code are matched up.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Data structure</dt>
		<dd>A way of organising data in a program so that some jobs are easy and fast. A list, a stack and a queue are all data structures.</dd>
	</div>
	<div>
		<dt>Item</dt>
		<dd>One thing stored in the structure: a number, a word, a task. Programmers also say <em>element</em>.</dd>
	</div>
	<div>
		<dt>Stack</dt>
		<dd>A collection where you only ever add to, or take from, the top.</dd>
	</div>
	<div>
		<dt>Queue</dt>
		<dd>A collection where you add at the back and take from the front, like people waiting in line.</dd>
	</div>
	<div>
		<dt>LIFO and FIFO</dt>
		<dd>Short for <strong>L</strong>ast <strong>I</strong>n, <strong>F</strong>irst <strong>O</strong>ut (a stack) and <strong>F</strong>irst <strong>I</strong>n, <strong>F</strong>irst <strong>O</strong>ut (a queue).</dd>
	</div>
	<div>
		<dt>Push and pop</dt>
		<dd>Adding an item to the top of a stack, and removing the top item.</dd>
	</div>
	<div>
		<dt>Enqueue and dequeue</dt>
		<dd>Adding an item to the back of a queue, and removing the item at the front. Said “en-cue” and “dee-cue”.</dd>
	</div>
	<div>
		<dt>Peek</dt>
		<dd>Looking at the next item that would come out, without removing it.</dd>
	</div>
	<div>
		<dt>Deque</dt>
		<dd>A double-ended queue, said “deck”: you can add and remove at both ends, so it can act as a stack or a queue.</dd>
	</div>
</dl>

<h2>Two ways to take turns</h2>
<p>You already know both from everyday life:</p>
<ul>
	<li>
		A <strong><Term def="A collection where you only ever add to, or take from, the top.">stack</Term></strong> is a pile of plates. You put a clean plate on top, and when you need one, you take the top plate. The plate at the
		bottom has been there longest, and it comes out last.
	</li>
	<li>
		A <strong><Term def="A collection where you add at the back and take from the front, like people waiting in line.">queue</Term></strong> is a line at a coffee counter. New people join at the back, and the person at the front is served next. Whoever has
		waited longest goes first. That is the fair order.
	</li>
</ul>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col"></th><th scope="col">Stack</th><th scope="col">Queue</th></tr></thead>
		<tbody>
			<tr><th scope="row">Rule</th><td>Last in, first out (LIFO)</td><td>First in, first out (FIFO)</td></tr>
			<tr><th scope="row">Add at</th><td>The top</td><td>The back</td></tr>
			<tr><th scope="row">Remove from</th><td>The top, the same end</td><td>The front, the other end</td></tr>
			<tr><th scope="row">Add A, B, C, then remove one</th><td>You get C</td><td>You get A</td></tr>
			<tr><th scope="row">Everyday picture</th><td>A pile of plates</td><td>A line at a counter</td></tr>
			<tr><th scope="row">Good for</th><td>Going back: undo, “back”, nested things</td><td>Fairness: handling things in the order they arrived</td></tr>
		</tbody>
	</table>
</div>

<h2>Try it</h2>
<p>
	This lab sends every <Term def="One thing stored in the structure: a number, a word, a task. Programmers also say element.">item</Term> to both a stack and a queue at the same time. Add three or four, then remove them one at a time. Watch the two “came
	out” lines: one comes out in reverse order, the other in the original order.
</p>

<StackQueueLab />

<p>Try these on purpose:</p>
<ol>
	<li>Add A, B and C, then remove all three. The stack gives C B A; the queue gives A B C.</li>
	<li>Add A and B, remove one, then add C. Now the two hold different items. The order you mix adds and removes in changes everything.</li>
	<li>Remove until both are empty, then press Remove once more. There is nothing to give back. Real code has to handle this case too.</li>
</ol>


<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'Add A, then B, then C to a stack, then remove one item. Which comes out?',
			options: ['A', 'B', 'C'],
			answer: 2,
			explain: 'A stack is last in, first out: C went on last, so it comes off first.'
		}
	]}
/>

<h2>The operations, by name</h2>
<p>Each structure has a small set of actions. Built properly, every one of them takes the same short time however many items are stored, which is what makes stacks and queues so handy.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Action</th><th scope="col">On a stack</th><th scope="col">On a queue</th></tr></thead>
		<tbody>
			<tr><th scope="row">Add an item</th><td><strong>push</strong>: put it on top</td><td><strong>enqueue</strong>: put it at the back</td></tr>
			<tr><th scope="row">Remove an item</th><td><strong>pop</strong>: take the top one</td><td><strong>dequeue</strong>: take the front one</td></tr>
			<tr><th scope="row">Look without removing</th><td><strong>peek</strong> at the top</td><td><strong>peek</strong> at the front</td></tr>
			<tr><th scope="row">Is anything there?</th><td><strong>isEmpty</strong> or size</td><td><strong>isEmpty</strong> or size</td></tr>
		</tbody>
	</table>
</div>

<p>
	Notice what is missing: there is no “take the third item” or “insert in the middle”. Stacks and queues are deliberately limited. Giving up those
	choices is what makes them simple, fast and hard to misuse.
</p>

<h2>A stack in code</h2>
<p>
	You rarely need to build a stack yourself. In JavaScript an ordinary array already has <code>push</code> and <code>pop</code>, and both work at
	the end of the array. Treat the end as the top and you have a stack:
</p>

<Code
	lang="js"
	title="stack.js"
	code={`const stack = [];

stack.push("A");
stack.push("B");
stack.push("C");          // stack is now ["A", "B", "C"], with "C" on top

stack.at(-1);             // "C"  peek: .at(-1) means "the last item"
stack.pop();              // "C"  removed from the top
stack.pop();              // "B"
stack.length;             // 1    only "A" is left`}
/>

<p>Python’s list works the same way, with <code>append</code> in place of <Term def="Adding an item to the top of a stack, and removing the top item.">push</Term>:</p>

<Code
	lang="py"
	title="stack.py"
	code={`stack = []

stack.append("A")
stack.append("B")
stack.append("C")    # "C" is on top

stack[-1]            # "C"  peek: [-1] means "the last item"
stack.pop()          # "C"
stack.pop()          # "B"
len(stack)           # 1`}
/>

<Note title="Popping an empty stack" tone="warn">
	<p>The two languages disagree about what happens when there is nothing to pop:</p>
	<ul>
		<li>JavaScript quietly returns <code>undefined</code>, and your code carries on with a missing value.</li>
		<li>Python stops with <code>IndexError: pop from empty list</code>.</li>
	</ul>
	<p>Either way, check that the stack isn’t empty before you pop, unless an empty stack really is impossible.</p>
</Note>

<h2>A queue in code</h2>
<p>
	JavaScript arrays can act as a queue too: <code>push</code> adds at the back and <code>shift</code> removes from the front. It works, and for a
	few hundred items it is perfectly fine:
</p>

<Code
	lang="js"
	title="queue.js"
	code={`const queue = [];

queue.push("A");
queue.push("B");
queue.push("C");          // front is "A", back is "C"

queue[0];                 // "A"  peek at the front
queue.shift();            // "A"  removed from the front
queue.shift();            // "B"
queue.length;             // 1`}
/>

<p>
	But there is a catch. An array keeps its items in numbered slots, starting at 0. Removing the item in slot 0 means every other item has to move
	down one slot, so on a big array each <code>shift</code> gets slower. Python has the same problem with <code>list.pop(0)</code>. We timed
	emptying a queue one item at a time, on a laptop:
</p>

<div class="table-wrap">
	<table>
		<caption>Time to remove every item from the front, one at a time</caption>
		<thead><tr><th scope="col">Items</th><th scope="col">JS array <code>shift()</code></th><th scope="col">Python <code>list.pop(0)</code></th><th scope="col">A real queue</th></tr></thead>
		<tbody>
			<tr><th scope="row">10,000</th><td>under 1 ms</td><td>4 ms</td><td>under 1 ms</td></tr>
			<tr><th scope="row">100,000</th><td>0.6 s</td><td>0.6 s</td><td>under 3 ms</td></tr>
			<tr><th scope="row">400,000</th><td>10 s</td><td>11 s</td><td>about 10 ms</td></tr>
		</tbody>
	</table>
</div>

<p>
	Four times the items took about sixteen times as long. That is the sign of work that grows faster than the data. A proper queue never moves
	the items at all. In Python, use <code>deque</code> from the standard library:
</p>

<Code
	lang="py"
	title="queue.py"
	code={`from collections import deque

queue = deque()

queue.append("A")      # enqueue at the back
queue.append("B")
queue.append("C")

queue[0]               # "A"  peek at the front
queue.popleft()        # "A"  dequeue from the front, fast at any size
queue.popleft()        # "B"
len(queue)             # 1`}
	caption="popleft() on an empty deque raises IndexError, just like pop() on an empty list."
/>

<p>
	JavaScript has no queue built in, but a small one is easy. Instead of moving the items, it remembers where the front is and moves that marker
	forward:
</p>

<Code
	lang="js"
	title="Queue.js"
	code={`class Queue {
  #items = [];
  #head = 0;               // position of the front item

  enqueue(item) {
    this.#items.push(item);
  }

  dequeue() {
    if (this.size === 0) return undefined;
    const item = this.#items[this.#head];
    this.#items[this.#head] = undefined;   // let the old slot be cleaned up
    this.#head++;                          // the front moves; nothing shifts
    return item;
  }

  peek() {
    return this.#items[this.#head];
  }

  get size() {
    return this.#items.length - this.#head;
  }
}

const line = new Queue();
line.enqueue("Ada");
line.enqueue("Grace");
line.enqueue("Linus");
line.dequeue();   // "Ada"
line.peek();      // "Grace"
line.size;        // 2`}
	caption="The # makes a field private: code outside the class can’t reach in and break the order."
/>

<Note title="Good enough is good enough" tone="plain">
	If your queue will only ever hold a few dozen items, such as a handful of pending messages, an array with <code>shift</code> is simpler and
	perfectly fast. Reach for a real queue when it could grow into the tens of thousands.
</Note>

<h2>Where stacks show up</h2>
<p>A stack fits any job where you go somewhere and later need to come back, in reverse order:</p>
<ul>
	<li><strong>Undo.</strong> Every edit is pushed. Undo pops the most recent one, so edits are undone newest first.</li>
	<li><strong>The back button.</strong> Your browser’s history behaves like a stack: each page you visit goes on top, and Back takes you to the one below.</li>
	<li><strong>Function calls.</strong> When one function calls another, the computer pushes a note to remember where to return. The newest call always finishes first. This is the call stack, and the recursion article shows it in action.</li>
	<li><strong>Matching pairs.</strong> Brackets, HTML tags and quotation marks open and close in reverse order, so a stack can check them. There is a worked example below.</li>
</ul>

<p>Undo and redo together use two stacks. Undoing moves a state from one to the other, and redoing moves it back:</p>

<Code
	lang="js"
	title="undo.js"
	code={`const undoStack = [];
const redoStack = [];
let text = "";

function edit(newText) {
  undoStack.push(text);    // remember how it looked before
  redoStack.length = 0;    // a fresh edit wipes the redo history
  text = newText;
}

function undo() {
  if (undoStack.length === 0) return;   // nothing to undo
  redoStack.push(text);
  text = undoStack.pop();
}

function redo() {
  if (redoStack.length === 0) return;   // nothing to redo
  undoStack.push(text);
  text = redoStack.pop();
}

edit("Hi");
edit("Hi there");
edit("Hi there!");
undo();   // text is "Hi there"
undo();   // text is "Hi"
redo();   // text is "Hi there"`}
	caption="This is why making a new edit after undoing loses the redo history in most apps."
/>

<h2>Where queues show up</h2>
<p>A queue fits any job where things arrive faster than they can be handled, and the fair order is the order they arrived:</p>
<ul>
	<li><strong>Printing.</strong> Documents sent to a printer wait in a print queue and come out in the order they were sent.</li>
	<li><strong>Typing.</strong> Key presses are queued, so fast typing still comes out in the right order even if the computer is briefly busy.</li>
	<li><strong>Web pages.</strong> Clicks and timers in a browser wait in a task queue until the page is free to handle them. The event loop article goes deep on this.</li>
	<li><strong>Servers.</strong> Jobs like “send this email” or “resize this photo” wait in a queue until a worker is free.</li>
	<li><strong>Searching nearest-first.</strong> To find the shortest route on a map, or friends-of-friends in a social network, programs check places in the order they discover them, using a queue. This is called breadth-first search.</li>
</ul>


<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'A printer prints jobs in the order they were sent. Which structure fits?',
			options: ['A stack', 'A queue'],
			answer: 1,
			explain: 'First sent, first printed: that is first in, first out, which is a queue.'
		}
	]}
/>

<h2>Worked example: checking brackets</h2>
<p>
	Code editors underline a bracket that is never closed. A stack does that check in one pass from left to right, with one simple rule: an opening
	bracket is pushed, and a closing bracket must match whatever is on top.
</p>
<p>Here is a string that is correctly matched, <code>{'{[()]}'}</code>:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Read</th><th scope="col">What happens</th><th scope="col">Stack after (top on the right)</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>{'{'}</code></th><td>An opener: push it</td><td><code>{'{'}</code></td></tr>
			<tr><th scope="row"><code>[</code></th><td>An opener: push it</td><td><code>{'{ ['}</code></td></tr>
			<tr><th scope="row"><code>(</code></th><td>An opener: push it</td><td><code>{'{ [ ('}</code></td></tr>
			<tr><th scope="row"><code>)</code></th><td>A closer. The top is <code>(</code>, which matches: pop it</td><td><code>{'{ ['}</code></td></tr>
			<tr><th scope="row"><code>]</code></th><td>A closer. The top is <code>[</code>, which matches: pop it</td><td><code>{'{'}</code></td></tr>
			<tr><th scope="row"><code>{'}'}</code></th><td>A closer. The top is <code>{'{'}</code>, which matches: pop it</td><td>empty</td></tr>
		</tbody>
	</table>
</div>

<p>The string is used up and the stack is empty, so every bracket was closed in the right order. Now one that looks almost the same, <code>([)]</code>:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Read</th><th scope="col">What happens</th><th scope="col">Stack after (top on the right)</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>(</code></th><td>An opener: push it</td><td><code>(</code></td></tr>
			<tr><th scope="row"><code>[</code></th><td>An opener: push it</td><td><code>( [</code></td></tr>
			<tr><th scope="row"><code>)</code></th><td>A closer, but the top is <code>[</code>. They don’t match: <strong>stop, not valid</strong></td><td><code>( [</code></td></tr>
		</tbody>
	</table>
</div>

<p>The full check fails in exactly three ways. Learn them and you can write it yourself:</p>
<ol>
	<li>A closer arrives and the top of the stack is a different kind of opener.</li>
	<li>A closer arrives and the stack is empty, as in <code>())</code>: nothing is waiting to be closed.</li>
	<li>The string ends but the stack still holds openers, as in <code>((</code>: something was never closed.</li>
</ol>

<Note title="Practice it">
	The Practice section has this exact problem, “Brackets that close properly”, in JavaScript and Python. A harder stack problem, “Days until it
	gets warmer”, keeps a stack of days that are still waiting for an answer.
</Note>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Removing from an empty stack or queue.</strong> Check the size first. In JavaScript you get a silent <code>undefined</code>; in Python, a crash.</li>
	<li><strong>Using the wrong end.</strong> In JavaScript, <code>push</code> with <code>shift</code> is a queue, but <code>unshift</code> with <code>shift</code> is a stack at the front. Mixing them up by accident reverses your order.</li>
	<li><strong>A big queue on a plain array.</strong> <code>shift()</code> and <code>pop(0)</code> slow down as the queue grows. Use <code>deque</code> in Python or a small queue class in JavaScript.</li>
	<li><strong>Reaching into the middle.</strong> If you find yourself needing the third item, you probably want a plain list, not a stack or a queue.</li>
</ul>

<h2>Recap</h2>
<ul>
	<li>A <strong>stack</strong> is last in, first out. Add and remove at the top with <strong>push</strong> and <strong>pop</strong>.</li>
	<li>A <strong>queue</strong> is first in, first out. Add at the back with <strong><Term def="Adding an item to the back of a queue, and removing the item at the front. Said “en-cue” and “dee-cue”.">enqueue</Term></strong> and remove from the front with <strong>dequeue</strong>.</li>
	<li><strong><Term def="Looking at the next item that would come out, without removing it.">Peek</Term></strong> looks at the next item without removing it. Always handle the empty case.</li>
	<li>Stacks are for going back: undo, the back button, function calls, matching brackets.</li>
	<li>Queues are for fairness: printing, key presses, event handling, background jobs, nearest-first search.</li>
	<li>In Python, use a list as a stack and <code>deque</code> as a queue. In JavaScript, an array is a fine stack; a big queue needs more than <code>shift()</code>.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'You push 1, 2 and 3 onto a stack, then pop twice. What is left?',
			options: ['1', '3', '2 and 3'],
			answer: 0,
			explain: 'The pops remove 3 and then 2, the two most recent. Only 1, the first one pushed, remains.'
		},
		{
			prompt: 'You enqueue 1, 2 and 3, then dequeue once. What comes out?',
			options: ['1', '3', '2'],
			answer: 0,
			explain: 'A queue is first in, first out, so the item that has waited longest, 1, comes out first.'
		},
		{
			prompt: 'Which one should hold documents waiting for a shared printer?',
			options: ['A stack, so the newest prints first', 'A queue, so they print in the order they were sent'],
			answer: 1,
			explain: 'With a stack, a busy printer could keep printing new jobs while the first one waits forever. A queue is fair.'
		},
		{
			prompt: 'Checking brackets with a stack, you read ")" and the stack is empty. What does that mean?',
			options: ['The string is valid so far', 'There is a closer with no opener, so it is not valid', 'Push the ")"'],
			answer: 1,
			explain: 'An empty stack means nothing is waiting to be closed, so this closer has no partner.'
		},
		{
			prompt: 'Your Python program uses list.pop(0) to empty a queue of 200,000 tasks and it is very slow. What is the fix?',
			options: ['Use collections.deque and popleft()', 'Use list.pop() instead', 'Sort the list first'],
			answer: 0,
			explain: 'pop(0) moves every remaining item each time. A deque removes from the front without moving anything. list.pop() is fast but takes from the wrong end.'
		}
	]}
/>
