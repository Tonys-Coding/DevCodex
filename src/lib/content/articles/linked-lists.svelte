<script lang="ts">
	import LinkedListLab from '../../components/teach/LinkedListLab.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	A treasure hunt doesn’t hand you a map. You get one clue, and it tells you where to find the next clue, which points to the one after that. To
	reach the fifth clue you have to visit the first four.
</p>
<p>
	A <strong>linked list</strong> stores data exactly like that. Each item carries a pointer to the next one, so items can live anywhere in memory and
	still form a line. It makes some jobs very cheap and others surprisingly slow, and knowing which is which is the whole skill.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>what nodes, pointers, the head and <code>null</code> are,</li>
	<li>how a linked list differs from an array, and when each one wins,</li>
	<li>how to build one in JavaScript and Python, and add, find and remove items,</li>
	<li>the mistakes that lose half a list, and</li>
	<li>where linked lists still show up today.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Node</dt>
		<dd>One link in the chain: an object holding a value and a pointer to the next node.</dd>
	</div>
	<div>
		<dt>Pointer</dt>
		<dd>A reference to where another object lives. In JavaScript and Python, any variable holding an object is one.</dd>
	</div>
	<div>
		<dt>Head</dt>
		<dd>The first node. The list itself is usually just a pointer to the head.</dd>
	</div>
	<div>
		<dt>Tail</dt>
		<dd>The last node. Its pointer to the next node is empty.</dd>
	</div>
	<div>
		<dt>null and None</dt>
		<dd>“Nothing here”: JavaScript’s <code>null</code> and Python’s <code>None</code>. The tail’s next pointer holds it, which marks the end.</dd>
	</div>
	<div>
		<dt>Traverse</dt>
		<dd>To walk the list from the head, following one pointer at a time.</dd>
	</div>
</dl>

<h2>A chain of nodes</h2>
<p>
	Each <strong><Term def="One link in the chain: an object holding a value and a pointer to the next node.">node</Term></strong> holds two things: a value, and a <strong><Term def="A reference to where another object lives. In JavaScript and Python, any variable holding an object is one.">pointer</Term></strong> to the next node. The list only remembers where the
	<strong><Term def="The first node. The list itself is usually just a pointer to the head.">head</Term></strong> is. Everything else is found by following arrows:
</p>

<Code lang="text" code={`head → [ A | • ] → [ B | • ] → [ C | • ] → null`} caption="Three nodes. Each box is a value and a pointer; the last pointer is null, which marks the end." />

<p>
	Compare that with an <strong>array</strong> (a Python list or JavaScript array), which keeps its items side by side in one block of memory. Because
	they are side by side, the computer can jump straight to item 500 with a little arithmetic. A linked list can’t: item 500 is wherever item 499’s
	pointer says.
</p>

<Note title="An everyday picture" tone="plain">
	An array is a row of numbered lockers: go straight to locker 37. A linked list is a treasure hunt: start at clue 1 and follow the chain. But adding
	a new clue at the start is easy (write it, point it at the old first clue), while adding a locker at the front of a full row means moving every
	locker along by one.
</Note>

<h2>Try it</h2>
<p>
	Add to the front and to the end, remove from the front, and find a value. Watch the step count: some actions take one step whatever the length,
	and some have to walk the chain.
</p>

<LinkedListLab />

<p>Things to try on purpose:</p>
<ol>
	<li>Add to the front three times. Each one takes one step, because only the head changes.</li>
	<li>Add to the end with a long list. The lab walks every node to find the <Term def="The last node. Its pointer to the next node is empty.">tail</Term> first.</li>
	<li>Find a value near the end, then one at the head, and compare the steps.</li>
</ol>

<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'A linked list has 1,000 nodes and you only keep the head. How many nodes do you visit to reach the 500th?',
			options: ['1: jump straight there', '500: follow the pointers one by one', '1,000: the whole list'],
			answer: 1,
			explain: 'There is no index to jump to. You start at the head and follow 499 pointers to reach the 500th node.'
		}
	]}
/>

<h2>Linked list or array?</h2>
<p>Neither is better. They are good at opposite things:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Job</th><th scope="col">Array</th><th scope="col">Linked list</th></tr></thead>
		<tbody>
			<tr><th scope="row">Read item number k</th><td>Instant, O(1): jump straight there</td><td>Slow, O(n): walk k nodes</td></tr>
			<tr><th scope="row">Add or remove at the front</th><td>Slow, O(n): every item moves along</td><td>Instant, O(1): change the head</td></tr>
			<tr><th scope="row">Add or remove after a node you already have</th><td>Slow, O(n): items after it move</td><td>Instant, O(1): change two pointers</td></tr>
			<tr><th scope="row">Add at the end</th><td>Usually instant</td><td>O(n) unless you also keep a tail pointer</td></tr>
			<tr><th scope="row">Find a value</th><td>O(n)</td><td>O(n)</td></tr>
			<tr><th scope="row">Memory</th><td>Just the items</td><td>Each item also carries a pointer</td></tr>
		</tbody>
	</table>
</div>

<p>
	In everyday code, arrays win most of the time. Linked lists earn their place when you add and remove at the front a lot, or splice items in and out
	of the middle of something you are already walking through.
</p>

<h2>Build one</h2>
<p>A node is a tiny class. The list is just a variable holding the head:</p>

<Code
	lang="js"
	title="linkedList.js"
	code={`class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;      // the next node, or null at the end
  }
}

let head = new Node("A", new Node("B", new Node("C")));

function show(head) {
  const parts = [];
  for (let node = head; node !== null; node = node.next) parts.push(node.value);
  return parts.join(" → ") + " → null";
}
console.log(show(head)); // A → B → C → null

head = new Node("Z", head);          // add to the front: one step
console.log(show(head)); // Z → A → B → C → null`}
/>

<Code
	lang="py"
	title="linked_list.py"
	code={`class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next       # the next node, or None at the end

head = Node("A", Node("B", Node("C")))

def show(head):
    parts = []
    node = head
    while node is not None:
        parts.append(node.value)
        node = node.next
    return " → ".join(parts) + " → None"

print(show(head))          # A → B → C → None
head = Node("Z", head)     # add to the front
print(show(head))          # Z → A → B → C → None`}
/>

<p>
	The loop in <code>show</code> is how you <strong><Term def="To walk the list from the head, following one pointer at a time.">traverse</Term></strong> any linked list: start at the head, do something with each node,
	move to <code>node.next</code>, and stop at <code><Term def="“Nothing here”: JavaScript’s null and Python’s None. The tail’s next pointer holds it, which marks the end.">null</Term></code>.
</p>

<h2>Insert and remove in the middle</h2>
<p>
	Once you are holding a node, changing what comes after it takes one step. To insert, point the new node at what came next, then point the current
	node at the new one. To remove, point the node <em>before</em> it past it:
</p>

<Code
	lang="js"
	code={`class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}
const show = (head) => {
  const parts = [];
  for (let node = head; node !== null; node = node.next) parts.push(node.value);
  return parts.join(" → ") + " → null";
};
let head = new Node("Z", new Node("A", new Node("B", new Node("C"))));

function find(head, value) {
  for (let node = head; node !== null; node = node.next) {
    if (node.value === value) return node;
  }
  return null;
}

const b = find(head, "B");
b.next = new Node("X", b.next);      // insert after B
console.log(show(head)); // Z → A → B → X → C → null

function remove(head, value) {
  if (head === null) return null;
  if (head.value === value) return head.next;   // removing the head
  let prev = head;
  while (prev.next !== null && prev.next.value !== value) prev = prev.next;
  if (prev.next !== null) prev.next = prev.next.next;   // skip over it
  return head;
}

head = remove(head, "X");
console.log(show(head)); // Z → A → B → C → null`}
	caption="Node and show are repeated from above so this runs on its own. remove returns the head, because removing the first node gives the list a new head."
/>

<Note title="Order matters" tone="warn">
	When inserting, set the new node’s <code>next</code> <em>before</em> changing the old node’s. Do it the other way round and nothing points to the
	rest of the list any more: it is lost.
</Note>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'To remove node C from A → B → C → D, which pointer changes?',
			options: ['C.next is set to null', 'B.next is set to D', 'A.next is set to C'],
			answer: 1,
			explain: 'Removing means skipping over C: the node before it, B, now points at the node after it, D.'
		}
	]}
/>

<h2>Where linked lists show up</h2>
<ul>
	<li><strong>Undo and history.</strong> Each state points back to the previous one, so going back is following a pointer.</li>
	<li><strong>Music playlists and slideshows.</strong> “Next” and “previous” are literally pointers, and moving a song is unlinking and relinking it.</li>
	<li><strong>Caches.</strong> A “least recently used” cache keeps entries in a linked list, moving each one to the front when it is used and dropping from the back. Going deeper builds one.</li>
	<li><strong>Inside other structures.</strong> Python’s <code>deque</code> is a linked list of blocks, and many hash maps chain colliding keys into short linked lists.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Losing the rest of the list.</strong> Overwriting a <code>next</code> pointer before saving what it pointed to. Save it in a variable first.</li>
	<li><strong>Forgetting the empty list.</strong> <code>head</code> can be <code>null</code>. Check before reading <code>head.value</code>.</li>
	<li><strong>Forgetting the new head.</strong> Removing or adding at the front changes the head. Functions should return it, and callers must use it.</li>
	<li><strong>Walking off the end.</strong> Reading <code>node.next.value</code> when <code>node.next</code> is <code>null</code> crashes. Check as you go.</li>
</ul>

<h2>Recap</h2>
<ul>
	<li>A linked list is a chain of <strong>nodes</strong>; each holds a value and a pointer to the next. The tail points at <code>null</code>.</li>
	<li>Adding or removing at the head, or right after a node you hold, takes one step: O(1).</li>
	<li>Reaching item k means walking k nodes: O(n). There is no jumping to an index.</li>
	<li>Arrays win at reading by position; linked lists win at changing the front and splicing.</li>
	<li>Save <code>next</code> before you overwrite it, and always handle the empty list.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'Which is fast on a linked list but slow on an array?',
			options: ['Reading the 1,000th item', 'Adding a new item at the very front', 'Finding the largest value'],
			answer: 1,
			explain: 'A linked list just points the new node at the old head. An array has to move every item along by one.'
		},
		{
			prompt: 'What does the last node’s next pointer hold?',
			options: ['The head', 'null (None in Python)', 'Its own value'],
			answer: 1,
			explain: 'null marks the end. A traversal loop stops when it reaches it.'
		},
		{
			prompt: 'You overwrite node.next with a new node without saving the old node.next first. What happens?',
			options: ['Nothing; it is saved automatically', 'Every node after it is lost from the list', 'The list is sorted'],
			answer: 1,
			explain: 'The old next pointer was the only route to the rest of the chain. Overwrite it, and those nodes can no longer be reached.'
		},
		{
			prompt: 'Your code reads items by position over and over, like scores[i]. Which structure suits it?',
			options: ['An array', 'A linked list'],
			answer: 0,
			explain: 'Arrays jump straight to any position. A linked list would walk from the head every time.'
		},
		{
			prompt: 'remove(head, value) can return a different head than it was given. When?',
			options: ['When the value is not found', 'When the value was in the first node', 'Never'],
			answer: 1,
			explain: 'Removing the first node makes the second node the new head, so the caller must use what remove returns.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Reversing a list in place, fast and slow pointers for the middle and for cycles, dummy head nodes, and a least-recently-used cache.">
<h2>Reverse a list in place</h2>
<p>
	The classic linked-list exercise. Walk the list once, turning each arrow around. Three variables do it: the node you are on, the one before it, and
	the one after it, saved before its pointer is overwritten.
</p>

<Code
	lang="py"
	code={`def reverse(head):
    prev = None
    node = head
    while node is not None:
        nxt = node.next        # remember the rest
        node.next = prev       # turn this arrow around
        prev = node            # step forward
        node = nxt
    return prev                # the old tail is the new head`}
	caption="O(n) time and O(1) extra memory: no new nodes are made."
/>

<h2>Fast and slow pointers</h2>
<p>
	Send two pointers down the list, one moving one step at a time and one moving two. When the fast one reaches the end, the slow one is in the
	<strong>middle</strong>. And if the list loops back on itself, the fast one laps the slow one and they meet. That is Floyd’s
	<strong>cycle detection</strong>, and it needs no extra memory:
</p>

<Code
	lang="py"
	code={`def middle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next           # one step
        fast = fast.next.next      # two steps
    return slow

def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:           # the fast pointer lapped the slow one
            return True
    return False`}
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'Why does has_cycle compare with "is" (the same node) instead of "==" (the same value)?',
			options: ['It is faster to type', 'Two different nodes can hold equal values; only meeting on the same node proves a loop', 'Python requires it'],
			answer: 1,
			explain: 'A list like 1 → 2 → 1 has a repeated value but no cycle. Only arriving at the very same node means the chain loops.'
		}
	]}
/>

<h2>Dummy head nodes</h2>
<p>
	Removing the head is a special case in <code>remove</code>. Put a fake <strong>dummy</strong> node (also called a sentinel) in front of the head, and
	every real node has a node before it, so the special case disappears:
</p>

<Code
	lang="py"
	code={`def remove_all(head, value):
    dummy = Node(None, head)       # a fake node before the head
    prev = dummy
    while prev.next is not None:
        if prev.next.value == value:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next              # the real head, whatever happened`}
/>

<h2>Doubly linked lists and an LRU cache</h2>
<p>
	A <strong>doubly linked list</strong> gives each node a <code>prev</code> pointer too. That costs memory, but lets you remove any node you hold in one
	step and walk backwards. Pair it with a hash map from key to node and you get a <strong>least recently used (LRU) cache</strong>: find any entry in
	O(1), move it to the front when it is used, and drop from the back when full. Python’s <code>OrderedDict</code> is built exactly that way:
</p>

<Code
	lang="py"
	code={`from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return None
        self.items.move_to_end(key)          # now the most recently used
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)   # drop the least recently used

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
cache.get("a")
cache.put("c", 3)           # evicts "b"
print(list(cache.items))    # ['a', 'c']`}
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Why does an LRU cache pair a hash map with a doubly linked list?',
			options: [
				'The map finds an entry in O(1); the list moves it to the front and drops the oldest in O(1)',
				'To store everything twice in case one copy is lost',
				'Because hash maps can’t store values'
			],
			answer: 0,
			explain: 'Each structure covers the other’s weakness: the map gives instant lookup, and the list keeps the usage order cheap to change.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="Why pointer chasing is slow on real hardware, what a node costs in memory, and the places linked lists still win: kernels, lock-free queues and skip lists.">
<h2>Pointer chasing and the cache</h2>
<p>
	Big-O says walking an array and walking a linked list are both O(n). On real hardware the array is often many times faster. The processor reads
	memory in <strong>cache lines</strong> of 64 bytes and prefetches the next ones when you go in order. An array’s items sit next to each other, so most
	reads are already in the cache. A linked list’s nodes can be anywhere, and the next address isn’t known until the current node has loaded. Each hop
	can be a <strong>cache miss</strong>: a trip to main memory costing on the order of 100 nanoseconds, enough time for hundreds of simple
	instructions.
</p>
<p>
	That is why “insert in the middle is O(1)” rarely wins in practice: you usually have to walk there first, and the walk is the slow part. Measure
	before choosing a linked list for speed.
</p>

<h2>What a node costs</h2>
<p>
	In CPython on a 64-bit machine, even a slim node class with <code>__slots__ = ("value", "next")</code> takes 48 bytes before counting the value. A
	Python list spends 8 bytes per item on its pointer. Without <code>__slots__</code>, each node also carries a dictionary for its attributes, which is
	larger again. In C, a node is the value plus one pointer (8 bytes), plus whatever the memory allocator adds.
</p>

<h2>Where they still win</h2>
<ul>
	<li><strong>Operating system kernels.</strong> The Linux kernel embeds a small <code>list_head</code> inside its own structures (an “intrusive” list), so linking an object in or out never allocates memory, and one object can sit on several lists at once.</li>
	<li><strong>Lock-free queues.</strong> Concurrent queues often use linked nodes, because a single atomic pointer swap can add or remove a node without locking the whole structure.</li>
	<li><strong>Skip lists.</strong> Several linked lists stacked in layers, each skipping further ahead, give O(log n) search on average. Redis uses a skip list for its sorted sets.</li>
	<li><strong>Persistent data.</strong> In functional languages, two lists can share the same tail. Adding to the front makes a new list without copying or changing the old one.</li>
</ul>

<h2>Recap: under the hood</h2>
<ol>
	<li>Linked lists and arrays share the same Big-O for a full walk, but arrays are far friendlier to the CPU cache.</li>
	<li>Every node carries a pointer, and in Python a whole object, so memory use is much higher than an array’s.</li>
	<li>They win where nodes are linked in place without moving data: kernels, concurrent queues, skip lists and shared immutable lists.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Walking an array and a linked list are both O(n). Why is the array usually much faster?',
			options: ['Arrays use fewer comparisons', 'Its items sit next to each other, so the CPU cache and prefetcher help', 'Linked lists are interpreted'],
			answer: 1,
			explain: 'Contiguous memory loads in cache lines and is prefetched. Linked nodes can be anywhere, so each hop risks a slow trip to memory.'
		},
		{
			prompt: 'What makes the Linux kernel’s list_head “intrusive”?',
			options: ['It is embedded inside the objects it links, so linking never allocates', 'It can only hold integers', 'It locks the whole kernel'],
			answer: 0,
			explain: 'The link fields live inside each object, so adding an object to a list just sets pointers.'
		},
		{
			prompt: 'Roughly how much does a cache miss to main memory cost?',
			options: ['About 1 nanosecond', 'On the order of 100 nanoseconds', 'About 1 millisecond'],
			answer: 1,
			explain: 'Main memory is on the order of 100 ns away, long enough for hundreds of simple instructions.'
		},
		{
			prompt: 'Which structure does Redis use for sorted sets, giving O(log n) average search?',
			options: ['A singly linked list', 'A skip list', 'An unsorted array'],
			answer: 1,
			explain: 'A skip list stacks linked lists in layers that skip further ahead, so searches can jump over most nodes.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://docs.python.org/3/library/collections.html#collections.OrderedDict" rel="external">Python: collections.OrderedDict</a></li>
	<li><a href="https://docs.kernel.org/core-api/list.html" rel="external">Linux kernel: Linked lists in Linux</a></li>
	<li><a href="https://redis.io/docs/latest/develop/data-types/sorted-sets/" rel="external">Redis: Sorted sets</a></li>
</ul>
</Layer>
