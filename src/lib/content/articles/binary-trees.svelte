<script lang="ts">
	import TreeLab from '../../components/teach/TreeLab.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	Open the folders on your computer and you are walking a tree: one top folder, folders inside it, and folders inside those, until you reach plain
	files. Web pages are trees of elements, JSON is a tree of values, and your code becomes a tree before it runs.
</p>
<p>
	This lesson is about the most useful kind: the <strong>binary tree</strong>, where every node has at most two children, and its sorted version,
	the <strong>binary search tree</strong>. A binary search tree puts binary search into a shape that can grow, so it can find, add and remove values
	quickly without re-sorting anything.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>the words for every part of a tree,</li>
	<li>the one rule that makes a binary search tree searchable,</li>
	<li>the four ways to visit every node, and what each is for,</li>
	<li>how to write insert, search and traversal in JavaScript and Python, and</li>
	<li>why the order you insert values in can make a tree fast or slow.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Tree</dt>
		<dd>Nodes connected by parent–child links, starting from one top node, with no loops.</dd>
	</div>
	<div>
		<dt>Root</dt>
		<dd>The top node. It is the only node without a parent.</dd>
	</div>
	<div>
		<dt>Parent and child</dt>
		<dd>A node directly above another is its parent; the one below is its child. In a binary tree each node has a left and a right child, either of which can be missing.</dd>
	</div>
	<div>
		<dt>Leaf</dt>
		<dd>A node with no children, at the bottom edge of the tree.</dd>
	</div>
	<div>
		<dt>Subtree</dt>
		<dd>Any node together with everything below it. Each child is the root of its own smaller tree.</dd>
	</div>
	<div>
		<dt>Height</dt>
		<dd>How many levels the tree has: the number of nodes on the longest path from the root down to a leaf.</dd>
	</div>
	<div>
		<dt>Traversal</dt>
		<dd>Visiting every node exactly once, in a chosen order.</dd>
	</div>
</dl>

<h2>The shape of a tree</h2>
<p>
	A tree starts at the <strong><Term def="The top node. It is the only node without a parent.">root</Term></strong> (computer trees grow downwards). Each node can have children; a node with none is a
	<strong><Term def="A node with no children, at the bottom edge of the tree.">leaf</Term></strong>. In a <strong>binary</strong> tree, each node has at most two children, called left and right:
</p>

<Code
	lang="text"
	code={`            50            ← root
          /    \\
        30      70        ← children of 50
       /  \\    /  \\
      20  40  60  80      ← leaves: no children`}
	caption="Seven nodes on three levels. The 30 node and everything under it form the left subtree of 50."
/>

<p>
	Look at any node and the part below it is a complete tree on its own: a <strong><Term def="Any node together with everything below it. Each child is the root of its own smaller tree.">subtree</Term></strong>. That is why trees and
	<strong>recursion</strong> fit so well. A function that handles one node and then calls itself on the two subtrees handles the whole tree.
</p>

<h2>The search tree rule</h2>
<p>A <strong>binary search tree</strong> (BST) is a binary tree with one rule, at every node:</p>
<ul>
	<li>everything in the <strong>left</strong> subtree is <strong>smaller</strong> than the node, and</li>
	<li>everything in the <strong>right</strong> subtree is <strong>bigger</strong>.</li>
</ul>
<p>
	To find 60 in the tree above, start at the root: 60 is bigger than 50, go right. At 70, 60 is smaller, go left. There it is: two comparisons.
	Each step throws away a whole subtree, exactly like binary search throws away half a list. Adding a value works the same way: follow the rule
	down until you reach an empty spot, and put it there.
</p>

<Note title="An everyday picture" tone="plain">
	It is a game of “higher or lower” where every answer sends you down one of two corridors. Each corridor leads to a smaller copy of the same game.
</Note>

<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'In the tree above, where would a new value 45 be inserted?',
			options: ['As the left child of 70', 'As the right child of 40', 'As the right child of 20'],
			answer: 1,
			explain: '45 < 50, go left to 30. 45 > 30, go right to 40. 45 > 40, and 40 has no right child, so 45 goes there.'
		}
	]}
/>

<h2>Four ways to visit every node</h2>
<p>
	A list has one natural order. A tree has several, and each <strong><Term def="Visiting every node exactly once, in a chosen order.">traversal</Term></strong> suits a different job. For the tree above:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Traversal</th><th scope="col">Rule at each node</th><th scope="col">Visits</th><th scope="col">Used for</th></tr></thead>
		<tbody>
			<tr><th scope="row">In-order</th><td>Left, node, right</td><td>20 30 40 50 60 70 80</td><td>Getting a search tree’s values in sorted order</td></tr>
			<tr><th scope="row">Pre-order</th><td>Node, left, right</td><td>50 30 20 40 70 60 80</td><td>Copying or saving a tree, so it can be rebuilt in the same shape</td></tr>
			<tr><th scope="row">Post-order</th><td>Left, right, node</td><td>20 40 30 60 80 70 50</td><td>Work that needs the children done first: deleting a tree, adding up folder sizes</td></tr>
			<tr><th scope="row">Level-order</th><td>One level at a time</td><td>50 30 70 20 40 60 80</td><td>Nearest-first jobs, like printing a tree by rows; uses a queue</td></tr>
		</tbody>
	</table>
</div>

<h2>Try it</h2>
<p>
	Play each traversal and watch the order build up. Then load the sorted set: seven numbers inserted smallest first make a very different
	shape.
</p>

<TreeLab />

<p>Things to try on purpose:</p>
<ol>
	<li>Play in-order. The tree is drawn so smaller values sit further left, and in-order reads it left to right: sorted.</li>
	<li>Insert a few numbers, then play level-order. It reads the tree row by row, top to bottom.</li>
	<li>Load the sorted set and look at the <Term def="How many levels the tree has: the number of nodes on the longest path from the root down to a leaf.">height</Term>: seven levels for seven nodes, where the shuffled set needed three.</li>
</ol>

<h2>The code</h2>
<p>A node holds a value and two child pointers. Insert, search and in-order traversal each fit in a few lines:</p>

<Code
	lang="py"
	title="bst.py"
	code={`class Node:
    def __init__(self, value):
        self.value = value
        self.left = None       # smaller values go here
        self.right = None      # bigger values go here

def insert(root, value):
    if root is None:
        return Node(value)                     # an empty spot: the new node goes here
    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)
    return root

def contains(root, value):
    node = root
    while node is not None:
        if value == node.value:
            return True
        node = node.left if value < node.value else node.right
    return False

def in_order(node, out):
    if node is not None:
        in_order(node.left, out)    # everything smaller first
        out.append(node.value)      # then this node
        in_order(node.right, out)   # then everything bigger
    return out

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)

print(contains(root, 60), contains(root, 65))   # True False
print(in_order(root, []))   # [20, 30, 40, 50, 60, 70, 80]`}
/>

<Code
	lang="js"
	title="bst.js"
	code={`class Node {
  constructor(value) {
    this.value = value;
    this.left = null;    // smaller values go here
    this.right = null;   // bigger values go here
  }
}

function insert(root, value) {
  if (root === null) return new Node(value);   // an empty spot: the new node goes here
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  return root;
}

function inOrder(node, out = []) {
  if (node !== null) {
    inOrder(node.left, out);    // everything smaller first
    out.push(node.value);       // then this node
    inOrder(node.right, out);   // then everything bigger
  }
  return out;
}

let root = null;
for (const v of [50, 30, 70, 20, 40, 60, 80]) root = insert(root, v);
console.log(inOrder(root)); // [20, 30, 40, 50, 60, 70, 80]`}
	caption="insert returns the root so that the very first insert, into an empty tree, can create it."
/>

<h2>Balanced or lopsided</h2>
<p>
	Every search, insert and removal walks one path from the root, so its cost is the tree’s height. How tall a tree grows depends on the order values
	arrive in:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Shape</th><th scope="col">Height for 1,000,000 values</th><th scope="col">Cost of a search</th></tr></thead>
		<tbody>
			<tr><th scope="row">Balanced (bushy)</th><td>About 20</td><td>O(log n), like binary search</td></tr>
			<tr><th scope="row">Values inserted in sorted order</th><td>1,000,000: a straight line</td><td>O(n), like a linked list</td></tr>
		</tbody>
	</table>
</div>

<p>
	Random insertion orders usually give a reasonably bushy tree. Sorted or nearly sorted input, which is common in real data, gives the worst case.
	Production code uses <strong>self-balancing</strong> trees that reshape themselves as they grow, so the height stays around log n whatever the
	order. Under the hood looks at how.
</p>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'You insert 1, 2, 3, 4, 5 into an empty binary search tree. What is its height?',
			options: ['3', '5', '1'],
			answer: 1,
			explain: 'Each value is bigger than the last, so each goes to the right of the previous one: a line of five levels.'
		}
	]}
/>

<h2>Where trees show up</h2>
<ul>
	<li><strong>Files and folders.</strong> Your disk is a tree. Working out a folder’s total size is a post-order traversal.</li>
	<li><strong>Web pages.</strong> The DOM is a tree of elements. <code>querySelector</code> walks it in pre-order, document order.</li>
	<li><strong>Code.</strong> Compilers and linters turn source into a syntax tree before checking or running it.</li>
	<li><strong>Sorted maps and indexes.</strong> Java’s <code>TreeMap</code> and C++’s <code>std::map</code> are balanced search trees, and database indexes are B-trees: wide, shallow search trees.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Forgetting the empty tree.</strong> <code>root</code> can be <code>null</code>. Every recursive function needs that base case first.</li>
	<li><strong>Dropping the returned root.</strong> <code>insert(root, 5)</code> on an empty tree returns the new root. Write <code>root = insert(root, 5)</code>.</li>
	<li><strong>Checking only the children.</strong> In a valid search tree, <em>everything</em> below on the left is smaller, not just the left child. Going deeper shows the bug this causes.</li>
	<li><strong>Assuming it is fast.</strong> A plain BST fed sorted data is a slow linked list. Use a balanced tree, or another structure, for real workloads.</li>
</ul>

<h2>Recap</h2>
<ul>
	<li>A binary tree is nodes with at most two children, a left and a right, starting from one root.</li>
	<li>A binary search tree keeps smaller values in the left subtree and bigger ones in the right, at every node.</li>
	<li>Search and insert walk one path down, so they cost the tree’s height: about log n when balanced, n when lopsided.</li>
	<li>In-order gives sorted order; pre-order copies; post-order does children first; level-order goes row by row with a queue.</li>
	<li>Trees are recursive: each child is the root of a smaller tree.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'Which traversal of a binary search tree gives its values in sorted order?',
			options: ['Pre-order', 'In-order', 'Level-order'],
			answer: 1,
			explain: 'In-order visits the left subtree (all smaller), then the node, then the right subtree (all bigger): sorted.'
		},
		{
			prompt: 'Searching a balanced binary search tree of about 1,000,000 values takes roughly how many steps?',
			options: ['About 20', 'About 1,000', 'About 500,000'],
			answer: 0,
			explain: 'A balanced tree has a height of about log₂ of a million, which is about 20, and a search walks one path down.'
		},
		{
			prompt: 'What makes a node a leaf?',
			options: ['It is the root', 'It has no children', 'It holds the smallest value'],
			answer: 1,
			explain: 'Leaves are the nodes at the bottom edge, with no left or right child.'
		},
		{
			prompt: 'Adding up the sizes of all files in a folder tree needs each sub-folder’s total first. Which order fits?',
			options: ['Pre-order', 'Post-order', 'Level-order'],
			answer: 1,
			explain: 'Post-order finishes both children before the node itself, so every sub-folder total is ready when the parent adds them up.'
		},
		{
			prompt: 'Why can a binary search tree become as slow as a linked list?',
			options: ['If values arrive in sorted order, every node gets only one child', 'If it holds more than 1,000 values', 'If it stores text instead of numbers'],
			answer: 0,
			explain: 'Sorted input sends each new value the same way, building one long path. Every search then walks nearly all of it.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="The recursive pattern behind most tree problems, validating a search tree properly, iterative traversals with a queue and a stack, and deleting a node.">
<h2>One pattern solves most tree problems</h2>
<p>
	Ask the two subtrees the same question, then combine their answers with the current node. The empty tree is the base case. Height and count are
	each three lines:
</p>

<Code
	lang="py"
	code={`def height(node):
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

def count(node):
    if node is None:
        return 0
    return 1 + count(node.left) + count(node.right)`}
	caption="Both visit every node once: O(n) time, and O(height) memory for the call stack."
/>

<h2>Validating a search tree</h2>
<p>
	A tempting check compares each node only with its two children. It is wrong. This tree passes that check, yet 60 sits in the left subtree of 50,
	where everything must be smaller:
</p>

<Code
	lang="text"
	code={`      50
     /
   30
     \\
      60      ← bigger than 50, but on 50's left`}
/>

<p>The fix is to pass down the range each node must fall within. Going left tightens the upper limit; going right tightens the lower one:</p>

<Code
	lang="py"
	code={`def is_bst(node, low=float("-inf"), high=float("inf")):
    if node is None:
        return True
    if not (low < node.value < high):
        return False
    return (is_bst(node.left, low, node.value) and      # left: below this value
            is_bst(node.right, node.value, high))       # right: above it`}
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'is_bst reaches 60 in the tree above. What range must 60 fall within there?',
			options: ['Between 30 and 50', 'Bigger than 30, with no upper limit', 'Smaller than 50, with no lower limit'],
			answer: 0,
			explain: 'Going left at 50 sets the upper limit to 50; going right at 30 sets the lower limit to 30. 60 is outside, so the tree is invalid.'
		}
	]}
/>

<h2>Traversals without recursion</h2>
<p>
	Level-order uses a <strong>queue</strong>: take a node from the front, then add its children at the back. In-order can use your own
	<strong>stack</strong> instead of the call stack, which avoids recursion limits on very deep trees:
</p>

<Code
	lang="py"
	code={`from collections import deque

def level_order(root):
    out, queue = [], deque([root] if root else [])
    while queue:
        node = queue.popleft()
        out.append(node.value)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return out

def in_order_iter(root):
    out, stack, node = [], [], root
    while stack or node:
        while node:                 # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()          # the smallest value not yet visited
        out.append(node.value)
        node = node.right
    return out`}
	caption="This is the stacks-and-queues lesson at work: a queue gives breadth-first order, a stack gives depth-first."
/>

<h2>Deleting a node</h2>
<p>Removal has three cases, depending on how many children the node has:</p>
<ol>
	<li><strong>No children:</strong> just remove it.</li>
	<li><strong>One child:</strong> lift that child into its place.</li>
	<li><strong>Two children:</strong> copy in the next bigger value (the leftmost node of the right subtree), then delete that node instead. It has at most one child, so it is case 1 or 2.</li>
</ol>

<Code
	lang="py"
	code={`def delete(root, value):
    if root is None:
        return None
    if value < root.value:
        root.left = delete(root.left, value)
    elif value > root.value:
        root.right = delete(root.right, value)
    else:
        if root.left is None:       # no left child: lift the right one
            return root.right
        if root.right is None:      # no right child: lift the left one
            return root.left
        nxt = root.right            # two children: find the next bigger value
        while nxt.left is not None:
            nxt = nxt.left
        root.value = nxt.value      # copy it here
        root.right = delete(root.right, nxt.value)   # and remove it below
    return root`}
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Deleting 50 from the seven-node tree (50, 30, 70, 20, 40, 60, 80), which value moves into its place?',
			options: ['40', '60', '70'],
			answer: 1,
			explain: '50 has two children, so it takes the next bigger value: the leftmost node of its right subtree, which is 60.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="How AVL and red-black trees keep themselves balanced, where they run in real systems, why heaps are trees stored in arrays, and the recursion limit waiting in deep trees.">
<h2>Self-balancing trees</h2>
<p>
	A balanced tree repairs itself after each insert or delete with <strong>rotations</strong>: a parent and child swap places while keeping the
	left-smaller, right-bigger rule. A rotation only changes a few pointers, so it costs O(1), and at most O(log n) of them happen per change.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Tree</th><th scope="col">Rule it keeps</th><th scope="col">Worst-case height</th><th scope="col">Trade-off</th></tr></thead>
		<tbody>
			<tr><th scope="row">AVL</th><td>At every node, the two subtrees’ heights differ by at most 1</td><td>About 1.44 log₂ n</td><td>Shorter, so lookups are slightly faster; more rotations on insert and delete</td></tr>
			<tr><th scope="row">Red-black</th><td>Nodes are coloured so that no path is more than twice as long as another</td><td>At most 2 log₂(n + 1)</td><td>A little taller, but fewer rotations, so changes are cheaper</td></tr>
		</tbody>
	</table>
</div>

<p>
	Red-black trees are the common default: Java’s <code>TreeMap</code> is one, the usual C++ <code>std::map</code> implementations use one, and the
	Linux kernel ships a red-black tree library used across many subsystems. Python has no built-in balanced tree; its <code>dict</code> is a hash
	map, and for sorted collections people reach for <code>bisect</code> on a list or a library.
</p>

<h2>Heaps: a tree stored in an array</h2>
<p>
	A <strong>binary heap</strong> is a binary tree with a different rule: every parent is smaller than its children (for a min-heap). Because it is
	always filled level by level, it needs no pointers at all. It lives in a plain array where the children of index <code>i</code> sit at
	<code>2i + 1</code> and <code>2i + 2</code>:
</p>

<Code
	lang="py"
	code={`import heapq

heap = []
for v in [5, 1, 8, 3, 2]:
    heapq.heappush(heap, v)

print(heap)      # [1, 2, 8, 5, 3]: a tree, read level by level
print(heap[0])   # 1: the smallest is always at the root`}
	caption="Index 0 is the root; its children are indexes 1 and 2 (values 2 and 8); 2’s children are indexes 3 and 4 (5 and 3). Priority queues are heaps."
/>

<h2>Deep trees meet the recursion limit</h2>
<p>
	The recursive <code>insert</code> above goes one call deeper per level. CPython stops at a recursion limit of 1,000 by default, so inserting values
	in sorted order crashes after about a thousand of them with <code>RecursionError</code>. Balanced trees stay around 20 levels for a million values,
	so they never come close. For trees you don’t control, use the iterative versions from Going deeper.
</p>

<h2>Recap: under the hood</h2>
<ol>
	<li>AVL and red-black trees keep height near log n with cheap rotations; red-black trades a little height for fewer changes.</li>
	<li>Sorted maps in Java, C++ and the Linux kernel are red-black trees.</li>
	<li>Heaps are complete binary trees stored in arrays, with children at 2i + 1 and 2i + 2.</li>
	<li>Recursion depth equals tree height, so lopsided trees hit Python’s recursion limit.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'What does a rotation do?',
			options: ['Sorts the whole tree again', 'Swaps a parent and child while keeping the search-tree rule, changing only a few pointers', 'Reverses every left and right child'],
			answer: 1,
			explain: 'A rotation is a local O(1) rearrangement that reduces height without breaking the order.'
		},
		{
			prompt: 'Which keeps a slightly shorter tree: AVL or red-black?',
			options: ['AVL', 'Red-black'],
			answer: 0,
			explain: 'AVL’s stricter rule bounds height at about 1.44 log₂ n, against 2 log₂(n + 1) for red-black, at the cost of more rotations.'
		},
		{
			prompt: 'In a heap stored as an array, where are the children of index 3?',
			options: ['Indexes 4 and 5', 'Indexes 7 and 8', 'Indexes 6 and 7'],
			answer: 1,
			explain: 'Children of i are at 2i + 1 and 2i + 2: 7 and 8.'
		},
		{
			prompt: 'A recursive insert crashes after about 1,000 sorted values in Python. Why?',
			options: ['The tree is full', 'Each level adds a call, and the line-shaped tree passes the recursion limit', 'Python can’t compare numbers above 1,000'],
			answer: 1,
			explain: 'Sorted input makes the tree a line, so its height equals the number of values, and CPython’s default limit is 1,000 calls.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html" rel="external">Java: TreeMap (a red-black tree)</a></li>
	<li><a href="https://docs.kernel.org/core-api/rbtree.html" rel="external">Linux kernel: Red-black trees</a></li>
	<li><a href="https://docs.python.org/3/library/heapq.html" rel="external">Python: heapq</a></li>
</ul>
</Layer>
