<script lang="ts">
	import CallStackTrace, { type StackStep } from '../../components/teach/CallStackTrace.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';

	const code = `function factorial(n) {
  if (n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(3));`;

	const steps: StackStep[] = [
		{
			line: 8,
			note: 'The program asks for factorial(3). Calling a function puts a new frame on the call stack: a small note that remembers this call and its n, which is 3.',
			frames: [{ call: 'factorial(3)' }]
		},
		{
			line: 2,
			note: 'Is n equal to 1? No, it is 3. So this is not the base case, and the function moves on.',
			frames: [{ call: 'factorial(3)' }]
		},
		{
			line: 5,
			note: 'It wants to work out 3 × factorial(2), but it cannot multiply yet. It pauses and calls factorial(2). A second frame goes on top.',
			frames: [{ call: 'factorial(3)', waiting: '3 × ?' }, { call: 'factorial(2)' }]
		},
		{
			line: 2,
			note: 'The computer only ever works on the top frame. Here n is 2, still not 1.',
			frames: [{ call: 'factorial(3)', waiting: '3 × ?' }, { call: 'factorial(2)' }]
		},
		{
			line: 5,
			note: 'Same again: 2 × factorial(1) has to wait for factorial(1). A third frame goes on top. Notice each call has its own n.',
			frames: [{ call: 'factorial(3)', waiting: '3 × ?' }, { call: 'factorial(2)', waiting: '2 × ?' }, { call: 'factorial(1)' }]
		},
		{
			line: 3,
			note: 'Now n is 1. This is the base case: the answer is simply 1, with no more calls. The stack has stopped growing.',
			frames: [{ call: 'factorial(3)', waiting: '3 × ?' }, { call: 'factorial(2)', waiting: '2 × ?' }, { call: 'factorial(1)', returns: '1' }]
		},
		{
			line: 5,
			note: 'factorial(1) is finished, so its frame comes off the stack. factorial(2) picks up exactly where it paused: 2 × 1 = 2.',
			frames: [{ call: 'factorial(3)', waiting: '3 × ?' }, { call: 'factorial(2)', returns: '2' }]
		},
		{
			line: 5,
			note: 'factorial(2) comes off. factorial(3) gets its missing piece: 3 × 2 = 6.',
			frames: [{ call: 'factorial(3)', returns: '6' }]
		},
		{
			line: 8,
			note: 'The last frame comes off and the stack is empty again. The answer, 6, is printed. The calls went down three levels, then the answers came back up.',
			frames: [],
			output: '6'
		}
	];
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	Some problems contain a smaller copy of themselves. A folder can hold other folders, which hold more folders. A comment can have replies, which
	have replies of their own. <strong>Recursion</strong> is a way of writing code for problems like these: a function that solves a big case by
	calling itself on a smaller case, again and again, until the case is so small the answer is obvious.
</p>
<p>
	It can feel like magic the first time, or like a loop that never ends. It is neither. Underneath, the computer keeps a neat pile of notes, one
	per call, and once you can see that pile, recursion stops being mysterious.
</p>
<p>In this article you will learn:</p>
<ul>
	<li>the two rules every working recursive function follows,</li>
	<li>what the computer actually does when a function calls itself, using a tool called the call stack,</li>
	<li>why a missing rule crashes your program, and what the error says,</li>
	<li>when recursion is the clearest choice and when a plain loop is better, and</li>
	<li>a simple trick that makes some slow recursive code fast.</li>
</ul>

<Note title="An everyday picture" tone="plain">
	<p>
		You are in a dark cinema and want to know which row you are in. You can’t see the numbers, so you whisper to the person in front of you:
		“which row are you in?”. They don’t know either, so they ask the person in front of them, and so on.
	</p>
	<p>
		Eventually someone in the front row is asked. They know the answer without asking anyone: “row 1”. They whisper it back. The person behind
		adds one and says “row 2” to the person behind them, and the answers travel back until they reach you. That is recursion: pass a smaller
		question forward until someone can answer directly, then build the answer on the way back.
	</p>
</Note>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Function</dt>
		<dd>A named, reusable piece of code. You give it some inputs and it gives back a result, like a recipe that turns ingredients into a dish.</dd>
	</div>
	<div>
		<dt>Call</dt>
		<dd>Running a function. Writing <code>factorial(3)</code> calls the function named <code>factorial</code> with the input 3.</dd>
	</div>
	<div>
		<dt>Return</dt>
		<dd>Finishing a function and handing a result back to whoever called it.</dd>
	</div>
	<div>
		<dt>Recursion</dt>
		<dd>When a function calls itself to solve a smaller version of the same problem. A function that does this is called recursive.</dd>
	</div>
	<div>
		<dt>Base case</dt>
		<dd>The smallest version of the problem, answered directly without calling the function again. It is what makes recursion stop.</dd>
	</div>
	<div>
		<dt>Recursive case</dt>
		<dd>Every other version of the problem. It is answered by calling the function again on something smaller.</dd>
	</div>
	<div>
		<dt>Call stack</dt>
		<dd>The computer’s pile of unfinished calls. Each call adds a note to the top, and each return removes the top note.</dd>
	</div>
	<div>
		<dt>Frame</dt>
		<dd>One note on the call stack. It remembers which call it is, its inputs, and where to carry on once the call it is waiting for returns.</dd>
	</div>
	<div>
		<dt>Stack overflow</dt>
		<dd>The crash you get when the call stack grows too tall, usually because the recursion never reaches its base case.</dd>
	</div>
</dl>

<h2>The two rules</h2>
<p>Every recursive <Term def="A named, reusable piece of code. You give it some inputs and it gives back a result, like a recipe that turns ingredients into a dish.">function</Term> that works has exactly two parts. Leave either one out and it breaks.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Part</th><th scope="col">What it does</th><th scope="col">In the cinema</th><th scope="col">If it is missing</th></tr></thead>
		<tbody>
			<tr>
				<th scope="row">Base case</th>
				<td>Answers the smallest problem directly, with no more calls</td>
				<td>The front row says “row 1” without asking anyone</td>
				<td>The calls never stop, and the program crashes</td>
			</tr>
			<tr>
				<th scope="row">Recursive case</th>
				<td>Calls the function on a <em>smaller</em> problem, then uses that answer</td>
				<td>“Ask the row in front, then add one”</td>
				<td>The function can only answer the smallest case</td>
			</tr>
		</tbody>
	</table>
</div>

<p>
	The word <em>smaller</em> matters. Each <Term def="Running a function. Writing factorial(3) calls the function named factorial with the input 3.">call</Term> has to move closer to the <Term def="The smallest version of the problem, answered directly without calling the function again. It is what makes recursion stop.">base case</Term>, or you never get there. Counting down from 3 reaches 0.
	Counting up from 3 never does.
</p>


<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'What stops a recursive function from calling itself forever?',
			options: ['The recursive case', 'The base case', 'The return keyword alone'],
			answer: 1,
			explain: 'The base case answers the smallest version directly, without another call, so the chain of calls ends.'
		}
	]}
/>

<h2>Your first recursive function</h2>
<p>Here is a countdown that uses no loop at all. Read the two parts before reading the output.</p>

<Code
	lang="js"
	title="countdown.js"
	code={`function countdown(n) {
  if (n === 0) {              // base case: nothing left to count
    console.log("Liftoff!");
    return;
  }
  console.log(n);             // do one small piece of work...
  countdown(n - 1);           // ...then hand the rest to a smaller call
}

countdown(3);`}
	caption="Output: 3, 2, 1, Liftoff! Each call prints one number and asks a slightly smaller call to do the rest."
/>

<p>Follow it by hand:</p>
<ol>
	<li><code>countdown(3)</code>: 3 is not 0, so it prints <strong>3</strong> and calls <code>countdown(2)</code>.</li>
	<li><code>countdown(2)</code> prints <strong>2</strong> and calls <code>countdown(1)</code>.</li>
	<li><code>countdown(1)</code> prints <strong>1</strong> and calls <code>countdown(0)</code>.</li>
	<li><code>countdown(0)</code> hits the base case, prints <strong>Liftoff!</strong> and returns.</li>
	<li>Each earlier call has nothing left to do after its own call, so they all finish, one after another.</li>
</ol>

<p>The same function in Python looks almost identical. The idea doesn’t belong to one language:</p>

<Code
	lang="py"
	title="countdown.py"
	code={`def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)

countdown(3)`}
/>

<h2>Watch the call stack</h2>
<p>
	A countdown doesn’t need anything back from its smaller call. Most recursive functions do. The classic example is the
	<strong>factorial</strong> of a number, written with an exclamation mark: 3! means 3 × 2 × 1, which is 6. Notice that 3! is just 3 × 2!, and
	2! is 2 × 1!. The problem contains a smaller copy of itself, and 1! is simply 1. That gives us both rules.
</p>
<p>
	Step through the code below. Watch the pile on the right: it grows while calls are waiting, stops at the base case, and shrinks as each answer
	is handed back.
</p>

<CallStackTrace title="factorial(3), one frame at a time" {code} {steps} />

<p>The most important thing the lab shows is that the three calls are <strong>separate</strong>:</p>
<ul>
	<li>Each <Term def="One note on the call stack. It remembers which call it is, its inputs, and where to carry on once the call it is waiting for returns.">frame</Term> has its own <code>n</code>. Calling <code>factorial(2)</code> does not change the <code>n</code> of 3 in the frame below it.</li>
	<li>A paused frame remembers exactly where it stopped, in the middle of <code>n * …</code>, and carries on from there.</li>
	<li>Only the top frame is ever running. The others wait their turn.</li>
</ul>

<h2>Going down, then coming back up</h2>
<p>Every recursive call has two halves, and it helps to name them:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Half</th><th scope="col">What happens</th><th scope="col">The call stack</th><th scope="col">For factorial(3)</th></tr></thead>
		<tbody>
			<tr><th scope="row">Going down</th><td>Each call asks a smaller call for help and waits</td><td>Grows by one frame per call</td><td>3 waits on 2, 2 waits on 1</td></tr>
			<tr><th scope="row">The bottom</th><td>The base case answers directly</td><td>At its tallest</td><td>factorial(1) returns 1</td></tr>
			<tr><th scope="row">Coming back up</th><td>Each waiting call finishes its sum with the answer it got</td><td>Shrinks by one frame per return</td><td>2 × 1 = 2, then 3 × 2 = 6</td></tr>
		</tbody>
	</table>
</div>

<p>
	Programmers sometimes call these halves <strong>winding</strong> and <strong>unwinding</strong>. The order matters for anything you print. Move
	the <code>console.log(n)</code> in the countdown to <em>after</em> the call, and it prints Liftoff! first, then 1, 2, 3: each number is printed on
	the way back up.
</p>

<Note title="Why “stack”?" tone="plain">
	It works like a stack of plates. You add a plate to the top and you take a plate from the top. The last call to start is always the first to
	finish. There is a whole article on stacks in the Data Structures track.
</Note>

<h2>When recursion goes wrong</h2>
<p>Here is factorial with the base case deleted:</p>

<Code
	lang="js"
	title="broken.js"
	code={`function broken(n) {
  return n * broken(n - 1);   // no base case: nothing ever says "stop"
}

broken(3);
// RangeError: Maximum call stack size exceeded`}
/>

<p>
	It calls itself with 2, then 1, 0, −1, −2, and on forever. Every call adds a frame, and the computer only sets aside a limited amount of memory
	for the <Term def="The computer’s pile of unfinished calls. Each call adds a note to the top, and each return removes the top note.">call stack</Term>. When that runs out, the program stops with a <strong><Term def="The crash you get when the call stack grows too tall, usually because the recursion never reaches its base case.">stack overflow</Term></strong>. (Yes, that is where the website Stack
	Overflow gets its name.) The message depends on where your code runs:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Where it runs</th><th scope="col">The error you see</th></tr></thead>
		<tbody>
			<tr><th scope="row">Chrome, Edge, Node.js</th><td><code>RangeError: Maximum call stack size exceeded</code></td></tr>
			<tr><th scope="row">Safari</th><td><code>RangeError: Maximum call stack size exceeded.</code></td></tr>
			<tr><th scope="row">Firefox</th><td><code>InternalError: too much recursion</code></td></tr>
			<tr><th scope="row">Python</th><td><code>RecursionError: maximum recursion depth exceeded</code></td></tr>
		</tbody>
	</table>
</div>

<p>
	How tall the stack may grow depends on the language, the browser and how much each frame holds. Python stops at 1,000 calls by default. In our
	tests, a tiny function managed about 10,000 calls in Node.js, which uses the same JavaScript engine as Chrome, and about 53,000 in the engine
	Safari uses.
</p>

<p>When you see one of these, check three things, in this order:</p>
<ol>
	<li><strong>Is there a base case?</strong> Find the line that returns without calling the function again.</li>
	<li><strong>Can it be reached?</strong> <code>if (n === 0)</code> never matches if you start at 2.5, or at −1, and keep subtracting 1.</li>
	<li><strong>Does every call get smaller?</strong> Calling <code>f(n)</code> from inside <code>f(n)</code>, or <code>f(n + 1)</code>, moves away from the base case.</li>
</ol>

<Note title="A real limit, not just a bug" tone="warn">
	Even correct recursion can overflow if the input is huge. Counting down from 100,000 one call at a time needs 100,000 frames, which is more than any of the limits above. For problems that go that deep, use a loop.
</Note>


<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'A recursive function never reaches its base case. What happens?',
			options: ['It quietly returns nothing', 'It keeps calling until the call stack runs out: a stack overflow', 'The computer finds the answer anyway'],
			answer: 1,
			explain: 'Every call adds a frame to the call stack, and the stack has a limit. Run out and the program stops with a stack overflow.'
		}
	]}
/>

<h2>Recursion or a loop?</h2>
<p>Anything you can write with <Term def="When a function calls itself to solve a smaller version of the same problem. A function that does this is called recursive.">recursion</Term>, you can also write with a loop. Here is factorial again, done the loop way:</p>

<Code
	lang="js"
	title="factorial with a loop"
	code={`function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;              // multiply in 2, then 3, then 4…
  }
  return result;
}

factorial(5);   // 120`}
/>

<p>So which should you choose? It depends on the shape of the problem:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Question</th><th scope="col">Loop</th><th scope="col">Recursion</th></tr></thead>
		<tbody>
			<tr><th scope="row">The data is a simple line, like a list of numbers</th><td>Usually clearer</td><td>Works, but adds nothing</td></tr>
			<tr><th scope="row">The data is nested, like folders inside folders</th><td>Possible, but you must keep your own to-do list</td><td>Usually much clearer</td></tr>
			<tr><th scope="row">The problem may go thousands of levels deep</th><td>Safe</td><td>Risks a stack overflow</td></tr>
			<tr><th scope="row">Memory use</th><td>Stays the same as it runs</td><td>One frame per level of depth</td></tr>
		</tbody>
	</table>
</div>

<h2>Where recursion shines</h2>
<p>
	Recursion earns its place when the data is nested and you don’t know how deep it goes. Say you have a list where some items are numbers and
	some items are more lists, and you want the total:
</p>

<Code
	lang="js"
	title="sumAll.js"
	code={`function sumAll(list) {
  let total = 0;
  for (const item of list) {
    if (Array.isArray(item)) {
      total += sumAll(item);   // a list inside: let a smaller call handle it
    } else {
      total += item;           // a plain number: add it
    }
  }
  return total;
}

sumAll([1, [2, [3, 4]], 5]);   // 15`}
	caption="The base case is hidden in plain sight: a list with no lists inside it makes no further calls."
/>

<p>
	A plain loop can’t do this alone, because it doesn’t know how many levels to dig through. The recursive version doesn’t need to know: each call
	deals with one level and trusts a smaller call with the rest. The same shape turns up all over real software:
</p>
<ul>
	<li><strong>Files and folders:</strong> the size of a folder is the size of its files plus the size of each folder inside it.</li>
	<li><strong>Web pages:</strong> a page is a tree of elements inside elements. Browsers walk it this way.</li>
	<li><strong>Comment threads:</strong> to show a comment, show its text, then show each reply the same way, indented.</li>
	<li><strong>Menus:</strong> a menu item can open a sub-menu, which can open another.</li>
</ul>

<h2>A trap: asking the same question twice</h2>
<p>
	The Fibonacci numbers start 0, 1, and then each one is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13… That definition turns into
	recursion directly:
</p>

<Code
	lang="js"
	title="fib.js"
	code={`function fib(n) {
  if (n < 2) return n;              // base cases: fib(0) is 0, fib(1) is 1
  return fib(n - 1) + fib(n - 2);   // two smaller calls
}

fib(10);   // 55`}
/>

<p>
	It is correct, and it is very slow for bigger numbers. To get <code>fib(5)</code>, it works out <code>fib(3)</code> twice and
	<code>fib(2)</code> three times, because each call starts two more and none of them share their answers. The number of calls explodes:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">You ask for</th><th scope="col">Answer</th><th scope="col">Calls made</th></tr></thead>
		<tbody>
			<tr><th scope="row">fib(5)</th><td>5</td><td>15</td></tr>
			<tr><th scope="row">fib(10)</th><td>55</td><td>177</td></tr>
			<tr><th scope="row">fib(20)</th><td>6,765</td><td>21,891</td></tr>
			<tr><th scope="row">fib(30)</th><td>832,040</td><td>2,692,537</td></tr>
			<tr><th scope="row">fib(40)</th><td>102,334,155</td><td>331,160,281</td></tr>
		</tbody>
	</table>
</div>

<p>
	The fix is to write answers down. Before working something out, check your notes; after working it out, save it. This is called
	<strong>memoization</strong> (from “memo”, a note to yourself, not “memorize”):
</p>

<Code
	lang="js"
	title="fib, with notes"
	code={`const memo = new Map();   // a lookup table: n → answer

function fib(n) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);   // already worked out? reuse it
  const answer = fib(n - 1) + fib(n - 2);
  memo.set(n, answer);                    // save it for next time
  return answer;
}

fib(40);   // 102334155, in 79 calls instead of 331 million`}
/>

<Note title="Python has this built in">
	In Python, putting <code>@cache</code> from the <code>functools</code> module on the line above <code>def fib(n):</code> saves every answer for
	you, with no extra code.
</Note>

<h2>How to write your own</h2>
<p>When a problem looks recursive, work through these steps in order:</p>
<ol>
	<li><strong>Find the smallest case</strong> you can answer without thinking: an empty list, the number 0 or 1, a folder with no folders in it. That is your base case. Write it first.</li>
	<li><strong>Find the smaller copy</strong> hiding inside the problem: the rest of the list, <code>n - 1</code>, each sub-folder.</li>
	<li><strong>Trust the smaller call.</strong> Assume it returns the right answer, and ask only: how do I turn that answer into mine? This leap of faith is the heart of recursion.</li>
	<li><strong>Check that every call gets smaller</strong> and will definitely reach the base case.</li>
	<li><strong>Test the tiny inputs</strong> by hand: the base case, then one step above it.</li>
</ol>

<h2>Recap</h2>
<ul>
	<li>A recursive function solves a problem by calling itself on a smaller version of it.</li>
	<li>It needs a <strong>base case</strong> that stops, and a <strong><Term def="Every other version of the problem. It is answered by calling the function again on something smaller.">recursive case</Term></strong> that moves closer to it on every call.</li>
	<li>Each call gets its own <strong>frame</strong> on the <strong>call stack</strong>. The stack grows on the way down and shrinks as answers come back up.</li>
	<li>No base case, or one that is never reached, means a <strong>stack overflow</strong>.</li>
	<li>Use recursion for nested data of unknown depth. Use a loop for long, flat sequences.</li>
	<li>If a recursive function keeps asking the same question, save the answers: <strong>memoization</strong>.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'What is the job of the base case?',
			options: ['To call the function again', 'To answer the smallest problem directly, so the calls stop', 'To print the result'],
			answer: 1,
			explain: 'The base case returns an answer without making another call. Without it the calls never stop.'
		},
		{
			prompt: 'factorial(4) is called with the code from the lab. How many frames are on the call stack at its tallest?',
			options: ['1', '3', '4'],
			answer: 2,
			explain: 'factorial(4), factorial(3), factorial(2) and factorial(1) are all on the stack at the moment the base case is reached.'
		},
		{
			prompt: 'A function calls f(n + 1) and its base case is n === 0. Starting from f(5), what happens?',
			options: ['It returns 0', 'It counts down and stops at 0', 'It moves away from the base case and overflows the stack'],
			answer: 2,
			explain: 'Each call makes n bigger, so it never reaches 0. The frames pile up until the stack runs out of room.'
		},
		{
			prompt: 'You need to add up every number in a list nested to an unknown depth. Which fits best?',
			options: ['A single plain loop', 'Recursion: each call handles one level', 'Neither can do it'],
			answer: 1,
			explain: 'Recursion handles any depth, because each call only deals with its own level and passes nested lists to a smaller call.'
		},
		{
			prompt: 'Why is the simple recursive fib(40) so slow?',
			options: ['Addition is slow', 'It works out the same smaller answers over and over', 'Recursion is always slow'],
			answer: 1,
			explain: 'Each call starts two more without sharing results, so fib(40) makes over 331 million calls. Saving answers (memoization) cuts that to 79.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Real recursion limits, rewriting recursion as a loop with your own stack, divide and conquer with merge sort, and backtracking.">
<h2>Limits in practice</h2>
<p>Every language puts a ceiling on recursion depth, and you hit it sooner than you might expect:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Language</th><th scope="col">Limit</th><th scope="col">What you see</th></tr></thead>
		<tbody>
			<tr><th scope="row">Python</th><td>1,000 frames by default (<code>sys.getrecursionlimit()</code>)</td><td><code>RecursionError: maximum recursion depth exceeded</code></td></tr>
			<tr><th scope="row">JavaScript</th><td>Set by the engine and the size of each frame, typically some thousands</td><td><code>RangeError: Maximum call stack size exceeded</code></td></tr>
		</tbody>
	</table>
</div>

<p>
	Python lets you raise the limit with <code>sys.setrecursionlimit</code>, but that only moves the guard rail: go deep enough and the process can
	crash outright. For input that may be thousands of levels deep, such as a long linked list, prefer a loop.
</p>

<h2>Turning recursion into a loop</h2>
<p>
	The call stack is just a to-do list the language keeps for you. You can keep it yourself instead, in an ordinary array. Here is the Core’s
	<code>sumAll</code> with no recursion at all:
</p>

<Code
	lang="js"
	code={`function sumAllIterative(list) {
  let total = 0;
  const stack = [list];             // the to-do list the calls used to keep for us
  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) stack.push(...item);
    else total += item;
  }
  return total;
}

sumAllIterative([1, [2, [3, 4]], 5]);   // 15`}
	caption="Same answer, no depth limit beyond memory. The order items are visited changes, which doesn’t matter for a sum."
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'A recursive Python function is called on a linked list 5,000 nodes long, one call per node. What happens with default settings?',
			options: ['It works, just slowly', 'RecursionError, because the default limit is 1,000', 'It silently returns None'],
			answer: 1,
			explain: 'Each node adds a frame, and Python stops at about 1,000. A loop handles any length.'
		}
	]}
/>

<h2>Divide and conquer</h2>
<p>
	Some of the fastest algorithms are recursive because they split a problem in half, solve each half the same way, and combine the answers.
	Merge sort is the classic:
</p>

<Code
	lang="py"
	code={`def merge_sort(items):
    if len(items) <= 1:                 # base case: already sorted
        return items
    mid = len(items) // 2
    left = merge_sort(items[:mid])      # sort each half the same way
    right = merge_sort(items[mid:])
    merged, i, j = [], 0, 0             # merge two sorted halves
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]

print(merge_sort([5, 2, 9, 1, 5, 6]))   # [1, 2, 5, 5, 6, 9]`}
/>

<p>
	Halving means only about log₂ n levels of calls, and each level does n units of merging work in total, so the whole sort is O(n log n). The
	depth is tiny: a million items need only about 20 levels.
</p>

<h2>Backtracking: try, recurse, undo</h2>
<p>
	To list every possibility, recursion can make one choice, explore everything that follows, then undo the choice and try the next. Each call
	decides about one item, in or out:
</p>

<Code
	lang="py"
	code={`def subsets(items):
    out = []
    def go(i, chosen):
        if i == len(items):             # decided about every item
            out.append(chosen[:])
            return
        go(i + 1, chosen)               # leave items[i] out
        chosen.append(items[i])
        go(i + 1, chosen)               # put items[i] in
        chosen.pop()                    # undo, so the caller's list is unchanged
    go(0, [])
    return out

print(subsets(["a", "b", "c"]))   # 8 subsets, from [] to ['a', 'b', 'c']`}
	caption="The same try–recurse–undo shape solves permutations, Sudoku and N-queens."
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Merge sort on 1,000,000 items. Roughly how many levels deep does the recursion go?',
			options: ['About 20', 'About 1,000', 'About 1,000,000'],
			answer: 0,
			explain: 'Each level halves the list, and 2²⁰ is about a million, so about 20 levels.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="What a stack frame holds and how big the stack is, tail calls and who supports them, and solving recurrences for running time.">
<h2>What a stack frame holds</h2>
<p>
	Each call gets a <strong>frame</strong>: where to return to, the arguments, the local variables and some saved bookkeeping. In compiled languages
	these frames sit on the thread’s native stack, a fixed block of memory reserved when the thread starts.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Platform</th><th scope="col">Typical default stack size</th></tr></thead>
		<tbody>
			<tr><th scope="row">Linux, main thread</th><td>8 MB (<code>ulimit -s</code>)</td></tr>
			<tr><th scope="row">macOS, main thread / other threads</th><td>8 MB / 512 KB</td></tr>
			<tr><th scope="row">Windows</th><td>1 MB</td></tr>
		</tbody>
	</table>
</div>

<p>
	Frame size times depth must fit, which is why a function with large local arrays overflows at a smaller depth. Interpreters add their own
	limits on top: CPython’s recursion limit guards both its own frames and the native stack beneath them.
</p>

<h2>Tail calls</h2>
<p>
	A call is a <strong>tail call</strong> when it is the very last thing a function does, with nothing left to compute afterwards. Then the current
	frame isn’t needed any more and can be reused, so deep recursion uses constant stack space:
</p>

<Code
	lang="js"
	code={`"use strict";
// Not a tail call: the multiplication happens after the call returns.
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));

// A tail call: the running product travels in an accumulator.
const factTail = (n, acc = 1) => (n <= 1 ? acc : factTail(n - 1, n * acc));`}
/>

<ul>
	<li><strong>JavaScript:</strong> ES2015 specifies proper tail calls in strict mode, but only Safari’s JavaScriptCore implements them. Chrome, Firefox and Node will still overflow.</li>
	<li><strong>Python:</strong> no tail-call elimination, by design, so tracebacks always show every frame.</li>
	<li><strong>Scheme</strong> and many functional languages require it, which is why loops there are written as recursion.</li>
</ul>

<h2>How fast is a recursive function?</h2>
<p>Write the running time as a <strong>recurrence</strong>, the work at one level plus the cost of the calls it makes, then solve it:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Function</th><th scope="col">Recurrence</th><th scope="col">Solves to</th></tr></thead>
		<tbody>
			<tr><th scope="row">Factorial, sum of a list</th><td>T(n) = T(n − 1) + O(1)</td><td>O(n)</td></tr>
			<tr><th scope="row">Binary search</th><td>T(n) = T(n/2) + O(1)</td><td>O(log n)</td></tr>
			<tr><th scope="row">Merge sort</th><td>T(n) = 2T(n/2) + O(n)</td><td>O(n log n)</td></tr>
			<tr><th scope="row">Naive Fibonacci</th><td>T(n) = T(n − 1) + T(n − 2) + O(1)</td><td>O(φⁿ), about 1.618ⁿ</td></tr>
			<tr><th scope="row">Memoised Fibonacci</th><td>Each n computed once</td><td>O(n)</td></tr>
		</tbody>
	</table>
</div>

<p>The halving recurrences are cases of the <strong>master theorem</strong>, which gives the answer for any T(n) = aT(n/b) + f(n) by comparing f(n) with n^(log_b a).</p>

<h2>Recap: recursion under the hood</h2>
<ol>
	<li>Each call costs a frame on a fixed-size stack, so depth is limited by frame size and stack size.</li>
	<li>Tail calls can reuse the frame, but only Safari implements that in JavaScript, and Python never does.</li>
	<li>Running time comes from the recurrence: halving gives logs, branching twice per level gives exponentials.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Which JavaScript engine implements ES2015 proper tail calls?',
			options: ['V8 (Chrome, Node)', 'SpiderMonkey (Firefox)', 'JavaScriptCore (Safari)'],
			answer: 2,
			explain: 'Only JavaScriptCore ships proper tail calls; the others removed or never shipped them.'
		},
		{
			prompt: 'Is n * fact(n - 1) a tail call?',
			options: ['Yes', 'No, the multiplication happens after the call returns'],
			answer: 1,
			explain: 'Work remains after the call, so the frame must stay. Carrying the product in an accumulator makes it a tail call.'
		},
		{
			prompt: 'T(n) = 2T(n/2) + O(n) solves to…',
			options: ['O(n)', 'O(n log n)', 'O(n²)'],
			answer: 1,
			explain: 'log n levels, each doing O(n) work in total: O(n log n), as in merge sort.'
		},
		{
			prompt: 'Why does naive recursive Fibonacci take exponential time?',
			options: ['Each call makes two calls, recomputing the same values', 'The numbers get very large', 'The stack is too deep'],
			answer: 0,
			explain: 'The call tree branches twice per level and repeats work; memoising computes each value once.'
		},
		{
			prompt: 'Two recursive functions reach the same depth. Why might only one overflow?',
			options: ['Its frames are larger, for example big local arrays', 'It returns a bigger number', 'It was called first'],
			answer: 0,
			explain: 'The stack is a fixed size, so bigger frames mean fewer of them fit.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://docs.python.org/3/library/sys.html#sys.setrecursionlimit" rel="external">Python: sys.setrecursionlimit</a></li>
	<li><a href="https://webkit.org/blog/6240/ecmascript-6-proper-tail-calls-in-webkit/" rel="external">WebKit: ECMAScript 6 proper tail calls</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion" rel="external">MDN: InternalError: too much recursion</a></li>
</ul>
</Layer>
