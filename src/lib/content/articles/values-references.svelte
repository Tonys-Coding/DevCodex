<script lang="ts">
	import CodeTrace, { type TraceStep } from '../../components/teach/CodeTrace.svelte';
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';

	const code = `let score = 10;
let copy = score;
copy = 11;
const team = ["ada"];
const same = team;
same.push("linus");
const fresh = [...team];
fresh.push("grace");`;

	const team1 = { id: 't', label: '["ada"]' };
	const team2 = { id: 't', label: '["ada","linus"]' };

	const steps: TraceStep[] = [
		{ line: 1, note: 'score holds the number 10 itself. Numbers are simple values.', vars: [{ name: 'score', value: '10' }], heap: [] },
		{ line: 2, note: 'copy gets its own 10. The value itself was copied.', vars: [{ name: 'score', value: '10' }, { name: 'copy', value: '10' }], heap: [] },
		{ line: 3, note: 'Giving copy a new value leaves score alone. They never shared anything.', vars: [{ name: 'score', value: '10' }, { name: 'copy', value: '11' }], heap: [] },
		{
			line: 4,
			note: 'An array is a collection. It is stored on its own, and team holds a reference to it: an arrow, not the array.',
			vars: [{ name: 'team', ref: 't' }],
			heap: [team1]
		},
		{
			line: 5,
			note: 'same = team copies the arrow. Now two names point at one array.',
			vars: [{ name: 'team', ref: 't' }, { name: 'same', ref: 't' }],
			heap: [team1]
		},
		{
			line: 6,
			note: 'Adding to the array through same changes the one shared array, so team sees "linus" too. This is the surprise.',
			vars: [{ name: 'team', ref: 't' }, { name: 'same', ref: 't' }],
			heap: [team2],
			output: 'team → ["ada", "linus"]'
		},
		{
			line: 7,
			note: '[...team] builds a brand-new array with the same items. fresh points at the new one.',
			vars: [{ name: 'team', ref: 't' }, { name: 'same', ref: 't' }, { name: 'fresh', ref: 'f' }],
			heap: [team2, { id: 'f', label: '["ada","linus"]' }]
		},
		{
			line: 8,
			note: 'Changing fresh leaves team alone. Two arrays, two separate stories.',
			vars: [{ name: 'team', ref: 't' }, { name: 'same', ref: 't' }, { name: 'fresh', ref: 'f' }],
			heap: [team2, { id: 'f', label: '[…,"grace"]' }],
			output: 'team  → ["ada", "linus"]\nfresh → ["ada", "linus", "grace"]'
		}
	];
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	A variable is a name you give to some data, like <code>score</code> or <code>team</code>. The question this article answers is: what does that
	name actually hold? For some kinds of data it holds the data itself. For others it holds directions to where the data is kept. That difference
	explains almost every “why did both of them change?” moment you will ever have.
</p>
<p>In this article you will learn:</p>
<ul>
	<li>the two kinds of data, and what copying each one gives you,</li>
	<li>the difference between <em>changing</em> something and <em>replacing</em> it,</li>
	<li>how to make a real, independent copy, and</li>
	<li>why two lists that look identical can still count as “not equal”.</li>
</ul>

<Note title="An everyday picture" tone="plain">
	<p>
		Imagine sticky notes. On one note you write a number: <strong>10</strong>. Copy that note and you have two separate 10s. Scribble on one, and
		the other is untouched.
	</p>
	<p>
		On another note you write a home address. Copy that note and you have two notes with the same address. Both lead to <em>one</em> house. If
		someone paints that house blue, everyone holding either note will find a blue house. The note is a <strong>reference</strong>; the house is
		the data.
	</p>
</Note>

<h2>Two kinds of data</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Kind</th><th scope="col">In JavaScript</th><th scope="col">In Python</th><th scope="col">Copying the name gives you</th></tr></thead>
		<tbody>
			<tr>
				<th scope="row">Simple values</th>
				<td>numbers, strings, <code>true</code>/<code>false</code>, <code>null</code>, <code>undefined</code></td>
				<td>numbers, strings, <code>True</code>/<code>False</code>, <code>None</code></td>
				<td>A separate copy. Changing one never affects the other.</td>
			</tr>
			<tr>
				<th scope="row">Collections and objects</th>
				<td>arrays, objects, <code>Map</code>, <code>Set</code></td>
				<td>lists, dictionaries, sets, objects made from your own classes</td>
				<td>A second reference to the <em>same</em> thing. Changes show up through both names.</td>
			</tr>
		</tbody>
	</table>
</div>

<p>Step through this code one line at a time and watch the names on the left and the data on the right.</p>

<CodeTrace title="Two kinds of copy" {code} {steps} />

<h2>Changing it versus replacing it</h2>
<p>There are two different things you can do with a name that points at a collection, and they behave very differently:</p>
<ul>
	<li><strong>Change the thing</strong> it points at, for example add an item. Every name pointing at that thing sees the change.</li>
	<li><strong>Point the name at something else</strong> with <code>=</code>. Only that one name moves. The thing it used to point at, and every other name, stays as it was.</li>
</ul>

<Code
	lang="js"
	code={`const team = ["ada"];
let same = team;

same.push("linus");    // changes the shared array
console.log(team);     // ["ada", "linus"]

same = ["grace"];      // points same at a brand-new array
console.log(team);     // still ["ada", "linus"]`}
	caption="push changed the array both names share. The = on line 7 only moved same."
/>

<p>Here is how common operations sort into the two groups:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Changes the shared thing</th><th scope="col">Points the name somewhere new</th></tr></thead>
		<tbody>
			<tr><td><code>list.push(x)</code>, <code>list.pop()</code> (JS)<br /><code>list.append(x)</code>, <code>list.pop()</code> (Python)</td><td><code>list = [1, 2]</code></td></tr>
			<tr><td><code>list[0] = x</code></td><td><code>list = otherList</code></td></tr>
			<tr><td><code>user.name = "Ada"</code> (JS)<br /><code>user["name"] = "Ada"</code> (Python dict)</td><td><code>user = {'{'} name: "Ada" {'}'}</code></td></tr>
			<tr><td><code>list.sort()</code> in both languages</td><td><code>list = sorted(list)</code> (Python)<br /><code>list = list.toSorted()</code> (JS)</td></tr>
		</tbody>
	</table>
</div>

<Note title="Watch out: sort() changes the original" tone="warn">
	In both JavaScript and Python, <code>list.sort()</code> rearranges the list in place, so every name pointing at it sees the new order. If you
	want a sorted copy and the original left alone, use <code>sorted(list)</code> in Python or <code>list.toSorted()</code> in JavaScript.
</Note>

<h3>“const” does not mean “can’t change”</h3>
<p>
	In JavaScript, <code>const team = ["ada"]</code> only promises that the name <code>team</code> will always point at that same array. It does not
	freeze the array. <code>team.push("linus")</code> works fine. What fails is <code>team = []</code>, because that would point the name somewhere
	new.
</p>


<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'const a = [1]; const b = a; b.push(2). What is a now?',
			options: ['[1]', '[1, 2]'],
			answer: 1,
			explain: 'b and a point at the same array, so pushing through b changes the array a sees too.'
		}
	]}
/>

<h2>Python follows the same rule</h2>

<Code
	lang="py"
	code={`team = ["ada"]
same = team
same.append("linus")
print(team)          # ['ada', 'linus']  (shared)

fresh = team.copy()  # a new list with the same items
fresh.append("grace")
print(team)          # ['ada', 'linus']  (untouched)`}
/>

<Note title="Being precise about Python" tone="plain">
	Strictly speaking, every Python name points at an object, even a number. But numbers, strings and <code>True</code>/<code>False</code> can never
	be changed in place. <code>x = x + 1</code> makes a new number and points <code>x</code> at it. Since nobody can change the shared number, it
	behaves exactly like having your own copy, and the rule in the table above holds.
</Note>

<h2>Making a real copy</h2>
<p>
	When you want a collection you can change without affecting the original, you need a new one. There is a catch: collections can hold other
	collections. A <strong>shallow copy</strong> makes a new outer collection but keeps pointing at the same inner ones. A <strong>deep copy</strong>
	rebuilds everything, all the way down.
</p>

<Choice
	codeLabels
	title="Three ways to “copy” a list of lists"
	options={[
		{
			label: 'b = a',
			code: 'const a = [[1], [2]];\nconst b = a;\nb[0].push(9);  // a is [[1, 9], [2]]',
			body: 'No copy at all. Both names point at the same outer list, so every change is shared.',
			verdict: 'Shares everything.'
		},
		{
			label: 'b = [...a]',
			code: 'const a = [[1], [2]];\nconst b = [...a];\nb.push([3]);   // a unchanged\nb[0].push(9);  // a is [[1, 9], [2]]',
			body: 'A shallow copy. The outer list is new, but the inner lists are still shared.',
			verdict: 'Copies one level.'
		},
		{
			label: 'structuredClone(a)',
			code: 'const a = [[1], [2]];\nconst b = structuredClone(a);\nb[0].push(9);  // a unchanged',
			body: 'A deep copy. Every inner list is rebuilt, so nothing is shared. It does more work, so use it when you need it.',
			verdict: 'Copies all the way down.'
		}
	]}
/>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">You want</th><th scope="col">JavaScript</th><th scope="col">Python</th></tr></thead>
		<tbody>
			<tr><th scope="row">Shallow copy of a list</th><td><code>[...a]</code> or <code>a.slice()</code></td><td><code>a.copy()</code>, <code>list(a)</code> or <code>a[:]</code></td></tr>
			<tr><th scope="row">Shallow copy of an object or dict</th><td><code>{'{'} ...obj {'}'}</code></td><td><code>d.copy()</code> or <code>dict(d)</code></td></tr>
			<tr><th scope="row">Deep copy</th><td><code>structuredClone(a)</code></td><td><code>import copy</code>, then <code>copy.deepcopy(a)</code></td></tr>
		</tbody>
	</table>
</div>

<Note title="Watch out: the repeated-row trap" tone="warn">
	<p>
		<code>grid = [[0] * 3] * 3</code> in Python looks like a 3 × 3 grid, but it is <em>one</em> row referenced three times. Set
		<code>grid[0][0] = 1</code> and every row shows a 1. JavaScript’s <code>Array(3).fill([])</code> has the same problem.
	</p>
	<p>
		Build each row separately instead: <code>[[0] * 3 for _ in range(3)]</code> in Python, or
		<code>Array.from({'{'} length: 3 {'}'}, () =&gt; [])</code> in JavaScript.
	</p>
</Note>


<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'a = [[1], [2]]. Which copy still shares the inner lists with a?',
			options: ['[...a]', 'structuredClone(a)'],
			answer: 0,
			explain: 'Spread makes a new outer list but keeps pointing at the same inner lists. structuredClone copies all the way down.'
		}
	]}
/>

<h2>Functions get references too</h2>
<p>
	When you hand a list to a function, the function receives a copy of the <em>reference</em>, not a copy of the list. So if the function changes
	the list, the caller sees the change:
</p>

<Code
	lang="js"
	code={`function addBonus(scores) {
  scores.push(100);          // changes the caller's array
}

const mine = [80, 90];
addBonus(mine);
console.log(mine);           // [80, 90, 100]

function withBonus(scores) {
  return [...scores, 100];   // builds a new array instead
}

const yours = [70];
const boosted = withBonus(yours);
console.log(yours, boosted); // [70] [70, 100]`}
	caption="addBonus has a hidden side effect. withBonus leaves its input alone and hands back something new."
/>

<p>
	Both styles are legitimate, but a function that quietly changes its input is a common source of bugs, because the caller may not expect it.
	When in doubt, return a new collection. And note that writing <code>scores = []</code> inside a function only moves the function’s own name; the
	caller’s list is unaffected.
</p>

<h2>“Equal” has two meanings</h2>
<p>
	Two lists can contain the same items and still be two separate lists, like two identical houses on different streets. Languages give you ways
	to ask both questions:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Expression</th><th scope="col">Question it asks</th><th scope="col">Result</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>[1, 2] === [1, 2]</code> (JS)</th><td>Is this the same list?</td><td><code>false</code></td></tr>
			<tr><th scope="row"><code>"hi" === "hi"</code> (JS)</th><td>Same value?</td><td><code>true</code></td></tr>
			<tr><th scope="row"><code>[1, 2] == [1, 2]</code> (Python)</th><td>Same contents?</td><td><code>True</code></td></tr>
			<tr><th scope="row"><code>[1, 2] is [1, 2]</code> (Python)</th><td>Is this the same list?</td><td><code>False</code></td></tr>
		</tbody>
	</table>
</div>

<p>
	JavaScript has no built-in “same contents” check for arrays and objects, so you compare the items yourself. Python’s <code>==</code> does that
	for you, and <code>is</code> asks whether two names point at the very same object.
</p>

<h2>Recap</h2>
<ol>
	<li>Simple values (numbers, strings, booleans) behave like separate copies when you copy a name.</li>
	<li>Collections and objects are reached through references. Copying the name gives a second arrow to the same thing.</li>
	<li>Changing a shared thing is visible through every name. Pointing one name elsewhere with <code>=</code> is not.</li>
	<li>Shallow copies copy one level; deep copies copy everything.</li>
	<li>Functions receive references, so they can change what you pass them.</li>
	<li>Same contents is not the same object: <code>[1, 2] === [1, 2]</code> is <code>false</code>.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'let a = "hi"; let b = a; b = "bye". What is a?',
			options: ['"hi"', '"bye"', 'undefined'],
			answer: 0,
			explain: 'Strings are simple values. b got its own copy, and giving b a new value does not touch a.'
		},
		{
			prompt: 'const user = { name: "Ada" }; const other = user; other.name = "Grace". What is user.name?',
			options: ['"Ada"', '"Grace"'],
			answer: 1,
			explain: 'Both names point at one object, so changing it through either name changes it for both.'
		},
		{
			prompt: 'let a = [1]; let b = a; b = [2]. What is a?',
			options: ['[1]', '[2]', '[1, 2]'],
			answer: 0,
			explain: 'b = [2] only points b at a new array. Nothing changed the array a points at.'
		},
		{
			prompt: 'Which makes a fully independent copy of a = [[1], [2]], inner lists included?',
			options: ['[...a]', 'a', 'structuredClone(a)'],
			answer: 2,
			explain: 'Spread copies only the outer list. structuredClone copies the inner lists too.'
		},
		{
			prompt: 'In Python, nums = [3, 1, 2]; other = nums; other.sort(). What is nums?',
			options: ['[3, 1, 2]', '[1, 2, 3]'],
			answer: 1,
			explain: 'sort() rearranges the one shared list in place. Use sorted(nums) for a sorted copy.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Pass by sharing, immutability you choose, what deep copies keep and lose, and Python’s mutable default-argument trap.">
<h2>Pass by sharing</h2>
<p>
	Both JavaScript and Python pass arguments the same way, often called <strong>call by sharing</strong>: the function receives a copy of whatever the
	caller’s variable holds. For a number that is the number; for an object it is the reference. Two consequences follow, and both surprise people:
</p>

<Code
	lang="js"
	code={`function swap(a, b) { const t = a; a = b; b = t; }
let x = 1, y = 2;
swap(x, y);
console.log(x, y);          // 1 2: swap only moved its own names

function rename(user) {
  user.name = "Grace";      // changes the caller's object
  user = { name: "Linus" }; // points the local name elsewhere; caller unaffected
}
const u = { name: "Ada" };
rename(u);
console.log(u.name);        // "Grace"`}
	caption="Mutating through a parameter is visible to the caller; reassigning the parameter is not."
/>

<h2>Immutability on purpose</h2>
<p>The safest shared object is one nobody can change. Both languages give you tools, with different strengths:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Tool</th><th scope="col">What it guarantees</th><th scope="col">The catch</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Object.freeze(obj)</code></th><td>The object’s own properties can’t be added, removed or changed</td><td>Shallow: nested objects stay mutable. Writes fail silently outside strict mode and throw a <code>TypeError</code> inside it</td></tr>
			<tr><th scope="row">Python <code>tuple</code>, <code>frozenset</code></th><td>The container can’t change</td><td>A tuple can still hold a list, and that list can change</td></tr>
			<tr><th scope="row">Update by copying</th><td><code>{'{'} ...user, name: "Ada" {'}'}</code> or <code>[...list, item]</code> make new objects instead of changing old ones</td><td>Each update allocates; fine for app state, costly in tight loops</td></tr>
		</tbody>
	</table>
</div>

<Code
	lang="py"
	run="fails"
	code={`t = ([1], 2)
t[0] = [9]        # TypeError: the tuple itself can't change
t[0].append(9)    # allowed: the list inside it can
print(t)          # ([1, 9], 2)`}
/>

<h2>Deep copies and their limits</h2>
<p><code>structuredClone</code> and Python’s <code>copy.deepcopy</code> copy everything reachable, including cycles. The common shortcut <code>JSON.parse(JSON.stringify(x))</code> is not a substitute:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Value inside</th><th scope="col"><code>JSON</code> round trip</th><th scope="col"><code>structuredClone</code></th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Date</code></th><td>Becomes a string</td><td>Stays a <code>Date</code></td></tr>
			<tr><th scope="row"><code>Map</code>, <code>Set</code></th><td>Becomes <code>{'{'}{'}'}</code></td><td>Copied</td></tr>
			<tr><th scope="row"><code>undefined</code> property</th><td>Dropped</td><td>Kept</td></tr>
			<tr><th scope="row">A cycle (<code>a.self = a</code>)</th><td>Throws</td><td>Copied, cycle intact</td></tr>
			<tr><th scope="row">A function</th><td>Dropped</td><td>Throws <code>DataCloneError</code></td></tr>
		</tbody>
	</table>
</div>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'const o = Object.freeze({ tags: ["a"] }); o.tags.push("b"). What is o.tags?',
			options: ['["a"]', '["a", "b"]', 'It throws'],
			answer: 1,
			explain: 'freeze is shallow: o can’t get new properties, but the array it points to is still mutable.'
		}
	]}
/>

<h2>Python’s default-argument trap</h2>
<p>Default values are created once, when the function is defined, not on every call. A mutable default is therefore shared by every call that uses it:</p>

<Code
	lang="py"
	code={`def add(item, items=[]):
    items.append(item)
    return items

print(add(1), add(2))      # [1, 2] [1, 2]: one list, shared

def add_fixed(item, items=None):
    if items is None:
        items = []         # a new list on every call
    items.append(item)
    return items

print(add_fixed(1), add_fixed(2))   # [1] [2]`}
	caption="Linters flag this pattern; None-then-create is the standard fix."
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Inside a function, which change does the caller see?',
			options: ['param = []', 'param.append(1)', 'Neither'],
			answer: 1,
			explain: 'append changes the shared list. param = [] only points the function’s own name at a new list.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="What a Python name is, CPython’s small-int cache and interning, how V8 stores values, and JavaScript’s three kinds of equality.">
<h2>What a Python name really is</h2>
<p>
	In Python every value is an object on the heap, and a variable is a name bound to one. <code>id(x)</code> gives the object’s identity and
	<code>x is y</code> compares identities. Numbers and strings only <em>behave</em> like values because they can’t be changed.
</p>
<p>CPython adds caches that make identity misleading for immutable values. These are implementation details, not language rules:</p>
<ul>
	<li><strong>Small integers</strong> from −5 to 256 are created once and reused, so <code>256 is int("256")</code> is <code>True</code> but <code>257 is int("257")</code> is <code>False</code>.</li>
	<li><strong>Some strings are interned</strong>, such as identifiers and constants in the same code object, so <code>is</code> may happen to work on them.</li>
</ul>
<p>The rule that follows: use <code>==</code> for values and keep <code>is</code> for singletons like <code>None</code>.</p>

<h2>How JavaScript engines hold values</h2>
<p>
	The language spec only says primitives behave as values and objects as references. Engines are free to store them however they like. V8, for
	example, stores small integers (<strong>Smis</strong>) directly in the pointer-sized slot, while heap numbers, strings and objects live on the heap
	behind a pointer. Strings are immutable, so an engine can share one copy among many variables without anyone being able to tell.
</p>

<h2>Equality in depth</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Comparison</th><th scope="col"><code>NaN</code> vs <code>NaN</code></th><th scope="col"><code>0</code> vs <code>-0</code></th><th scope="col">Used by</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>===</code></th><td><code>false</code></td><td><code>true</code></td><td>Your code, <code>indexOf</code></td></tr>
			<tr><th scope="row"><code>Object.is</code> (SameValue)</th><td><code>true</code></td><td><code>false</code></td><td>React’s state comparisons</td></tr>
			<tr><th scope="row">SameValueZero</th><td><code>true</code></td><td><code>true</code></td><td><code>includes</code>, <code>Map</code> and <code>Set</code> keys</td></tr>
		</tbody>
	</table>
</div>

<p>
	That is why <code>[NaN].includes(NaN)</code> is <code>true</code> while <code>[NaN].indexOf(NaN)</code> is <code>-1</code>. In Python, <code>==</code> calls
	<code>__eq__</code>, which classes define for value equality; a <code>@dataclass</code> generates one from its fields, so <code>P(1) == P(1)</code> is
	<code>True</code> while <code>P(1) is P(1)</code> is <code>False</code>.
</p>

<h2>Recap: what is really going on</h2>
<ol>
	<li>Arguments are passed by sharing: a copy of the reference, so mutation is shared and reassignment is not.</li>
	<li><code>Object.freeze</code> and tuples are shallow; deep copies need <code>structuredClone</code> or <code>deepcopy</code>, not JSON.</li>
	<li>Python names bind objects; CPython caches small ints and interns some strings, so never use <code>is</code> for values.</li>
	<li>JavaScript has three equalities: <code>===</code>, SameValue and SameValueZero.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'In CPython, x = 257 and y = int("257"). What is x is y?',
			options: ['True', 'False'],
			answer: 1,
			explain: 'Only −5 to 256 are cached, so these are two different int objects that happen to be equal.'
		},
		{
			prompt: 'What does [NaN].includes(NaN) return?',
			options: ['true', 'false'],
			answer: 0,
			explain: 'includes uses SameValueZero, which treats NaN as equal to itself. indexOf uses === and returns -1.'
		},
		{
			prompt: 'JSON.parse(JSON.stringify({ when: new Date(0) })).when is…',
			options: ['A Date', 'A string', 'undefined'],
			answer: 1,
			explain: 'JSON has no date type, so the Date is serialised as an ISO string and stays a string.'
		},
		{
			prompt: 'Which comparison does a JavaScript Map use for its keys?',
			options: ['===', 'SameValueZero', 'Object.is'],
			answer: 1,
			explain: 'SameValueZero: NaN can be a key and finds itself, and 0 and -0 are the same key.'
		},
		{
			prompt: 'A function swap(a, b) reassigns its two parameters. Does it swap the caller’s variables?',
			options: ['Yes', 'No'],
			answer: 1,
			explain: 'Parameters are the function’s own names. Reassigning them never changes the caller’s variables.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone" rel="external">MDN: structuredClone</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness" rel="external">MDN: Equality comparisons and sameness</a></li>
	<li><a href="https://docs.python.org/3/reference/datamodel.html" rel="external">Python: the data model</a></li>
	<li><a href="https://v8.dev/blog/pointer-compression" rel="external">V8 blog: Pointer compression</a></li>
</ul>
</Layer>
