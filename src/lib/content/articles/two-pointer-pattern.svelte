<script lang="ts">
	import TwoPointerGame from '../../components/teach/TwoPointerGame.svelte';
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	You have a gift card for exactly $16 and a list of prices, sorted from cheapest to most expensive. Is there a pair of items that uses the card
	exactly? You could try every possible pair. Or you could put one finger on the cheapest item, one on the most expensive, and walk them toward
	each other. That second idea is the <strong>two-pointer pattern</strong>, and it turns a slow search into a fast one.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>why checking every pair gets slow so quickly,</li>
	<li>the two-finger trick, and how to decide which finger moves,</li>
	<li>why the trick never skips the right answer, and</li>
	<li>why it only works on a sorted list.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Sorted</dt>
		<dd>In order from smallest to largest, like <code>[2, 4, 5, 7, 9]</code>.</dd>
	</div>
	<div>
		<dt>Target</dt>
		<dd>The total you are looking for, such as 16.</dd>
	</div>
	<div>
		<dt>Pointer</dt>
		<dd>Here, just a position in the list: “the item at position 3”. Programmers often call it an <strong>index</strong>.</dd>
	</div>
	<div>
		<dt>Pair</dt>
		<dd>Two different items from the list. The same item can’t be used twice.</dd>
	</div>
</dl>

<h2>The slow way: try every pair</h2>
<p>
	The obvious approach adds up every pair and checks it. It always works, but the number of pairs grows much faster than the list. Each new item
	has to be paired with every item already there.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Items in the list</th><th scope="col">Pairs to check</th></tr></thead>
		<tbody>
			<tr><th scope="row">8</th><td>28</td></tr>
			<tr><th scope="row">1,000</th><td>499,500</td></tr>
			<tr><th scope="row">100,000</th><td>about 5 billion</td></tr>
		</tbody>
	</table>
</div>

<Code
	lang="py"
	title="Every pair"
	code={`def pair_sum_slow(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):   # every item after i
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`}
	caption="A loop inside a loop: for 100,000 prices, about 5 billion additions."
/>

<h2>The two-finger trick</h2>
<p>Because the list is sorted, one sum tells you which way to go. Start with a finger at each end, then repeat:</p>
<ol>
	<li><strong>Add</strong> the two numbers under your fingers.</li>
	<li><strong>Too small?</strong> You need a bigger number, so move the left finger one step right.</li>
	<li><strong>Too big?</strong> You need a smaller number, so move the right finger one step left.</li>
	<li><strong>Exactly right?</strong> You found the pair. Stop.</li>
	<li>If the fingers meet, there is no pair that works.</li>
</ol>

<h2>Try it</h2>
<p>Here are eight sorted prices and a target of 16. Decide which finger to move each time; the game tells you if a move was safe.</p>

<TwoPointerGame nums={[2, 4, 5, 7, 9, 12, 15, 18]} target={16} />

<h2>The code</h2>

<Code
	lang="py"
	title="Two pointers"
	code={`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1        # left finger, right finger
    while i < j:                   # stop when the fingers meet
        total = nums[i] + nums[j]
        if total == target:
            return [i, j]
        if total < target:
            i += 1                 # too small: move left finger right
        else:
            j -= 1                 # too big: move right finger left
    return []`}
/>

<p>
	Every step moves one finger, so for 8 prices it takes at most 7 steps instead of 28 checks. For 100,000 prices it is at most 99,999 steps
	instead of 5 billion. Programmers say the slow way is <strong>O(n²)</strong> and this way is <strong>O(n)</strong>: the work grows in step with the
	list, not with its square.
</p>

<h2>Why it never skips the answer</h2>
<p>
	Say the fingers are on 2 and 18, and the sum, 20, is too big. Could 18 still be part of the answer? The smallest number it could ever be paired
	with is 2, and even that is too big. Every other partner is larger. So 18 can never work, and it is safe to move the right finger past it.
</p>
<p>The same thinking works the other way round: when the sum is too small, the left number can’t reach the target even with the biggest number left, so it is safe to skip.</p>

<Note title="Only on a sorted list" tone="warn">
	On a shuffled list, “too big” doesn’t tell you which number to drop, so the trick stops working. Either sort the list first, or use a hash map,
	which finds a pair in one pass over an unsorted list.
</Note>

<h2>Recap</h2>
<ol>
	<li>Checking every pair grows very fast: about 5 billion checks for 100,000 items.</li>
	<li>On a <strong>sorted</strong> list, put a pointer at each end and add.</li>
	<li>Too small: move the left one right. Too big: move the right one left.</li>
	<li>Each move safely rules out one number, so it takes at most one pass.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'Sorted list, the sum under your fingers is too small. What do you do?',
			options: ['Move the right finger left', 'Move the left finger right', 'Start again from the middle'],
			answer: 1,
			explain: 'Only a bigger left number can raise the sum, and every number to its right is at least as big.'
		},
		{
			prompt: 'The fingers are on 3 and 20, the target is 15, and the sum is 23. Can 20 be part of the answer?',
			options: ['Yes, with a smaller number', 'No: even with 3, the smallest left, it is too big'],
			answer: 1,
			explain: '3 is the smallest partner 20 can have, and 23 is already over 15, so 20 can be skipped.'
		},
		{
			prompt: 'About how many steps does the two-finger trick take on a sorted list of 1,000 numbers, at most?',
			options: ['About 1,000', 'About 500,000', 'About 1,000,000'],
			answer: 0,
			explain: 'Each step moves one finger inward, so it is at most 999 steps.'
		},
		{
			prompt: 'Why does the trick need a sorted list?',
			options: ['So the code is shorter', 'So one sum tells you which finger to move', 'Because unsorted lists have duplicates'],
			answer: 1,
			explain: 'Order is what makes “too big” mean “move the right finger”. Without it, a sum says nothing about which number to drop.'
		},
		{
			prompt: 'What happens when the two fingers meet without finding the target?',
			options: ['Start again with the fingers swapped', 'There is no pair that adds up to the target'],
			answer: 1,
			explain: 'Every number was ruled out safely along the way, so no pair can work.'
		}
	]}
/>

<CorePack />


<Layer depth="deeper" summary="The invariant that proves the trick correct, how it compares with sorting or a hash map, and the shapes the pattern takes.">
<h2>Why it is correct: the invariant</h2>

<p>
	Correctness rests on one <strong>invariant</strong>, a statement that holds before every iteration:
	<strong>if any valid pair exists, both of its indices lie in [i, j].</strong> It is true at the start, since the window is the whole array.
	Each move preserves it:
</p>
<ul>
	<li>
		<strong>Sum too big</strong> (<code>nums[i] + nums[j] &gt; target</code>). For every k in [i, j), <code>nums[k] ≥ nums[i]</code> because the array is
		sorted, so <code>nums[k] + nums[j] ≥ nums[i] + nums[j] &gt; target</code>. No partner for <code>j</code> remains, so dropping <code>j</code> loses
		nothing.
	</li>
	<li><strong>Sum too small.</strong> The mirror argument: <code>nums[i]</code> plus anything at or left of <code>j</code> is at most the current sum, so <code>i</code> has no partner either.</li>
</ul>
<p>
	The window shrinks by one each iteration and the loop stops when it has fewer than two elements, so there are at most n − 1 iterations. That is
	O(n) time and O(1) extra space, and when the loop exits without returning, the invariant proves no pair exists.
</p>

<Note title="Sorted is the whole trick" tone="warn">
	On unsorted input, “sum too big” says nothing about which element to drop, and the invariant collapses. You can sort first, but sorting
	destroys the original indices. If the problem asks for indices into the original array, either sort <code>(value, index)</code> pairs or use the
	one-pass hash-map approach from the Pair Sum practice problem instead.
</Note>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint"
	questions={[
		{
			prompt: 'Target 16. The pointers sit on 2 and 18, summing to 20. Which pointer moves?',
			options: ['The left one, rightwards', 'The right one, leftwards'],
			answer: 1,
			explain: 'The sum is too big, and 18 is too big even with the smallest value left, so the right pointer steps in.'
		}
	]}
/>

<h2>Comparing the approaches</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Approach</th><th scope="col">Time</th><th scope="col">Extra space</th><th scope="col">Input must be sorted</th></tr></thead>
		<tbody>
			<tr><th scope="row">Brute force</th><td>O(n²)</td><td>O(1)</td><td>No</td></tr>
			<tr><th scope="row">Binary search for each element’s complement</th><td>O(n log n)</td><td>O(1)</td><td>Yes</td></tr>
			<tr><th scope="row">Sort, then two pointers</th><td>O(n log n)</td><td>Depends on the sort; up to O(n) for the merge-based sorts in Python and V8</td><td>No</td></tr>
			<tr><th scope="row">Two pointers on sorted input</th><td>O(n)</td><td>O(1)</td><td>Yes</td></tr>
			<tr><th scope="row">Hash set, one pass</th><td>O(n) average</td><td>O(n)</td><td>No</td></tr>
		</tbody>
	</table>
</div>

<p>
	Two pointers win when the input is already sorted or memory is tight. The hash set wins on unsorted input when you can spare O(n) memory.
	Interviewers often ask for both and want you to name this trade-off.
</p>

<h2>Variations you will meet</h2>

<Choice
	title="Same idea, different shapes"
	options={[
		{
			label: 'Opposite ends',
			lang: 'py',
			code: 'i, j = 0, len(a) - 1\nwhile i < j:\n    if should_move_left(a[i], a[j]):\n        i += 1\n    else:\n        j -= 1',
			body: 'Pointers start at both ends and walk inward, discarding one end per step. Pair sums, palindromes and the biggest container.',
			verdict: 'Practice: Pair sum in a sorted list, Reads the same both ways, The biggest tank.'
		},
		{
			label: 'Read and write',
			lang: 'py',
			code: 'def dedupe_sorted(nums):\n    if not nums:\n        return 0\n    write = 1\n    for read in range(1, len(nums)):\n        if nums[read] != nums[read - 1]:\n            nums[write] = nums[read]\n            write += 1\n    return write  # nums[:write] is unique',
			body: 'Both move left to right. The read pointer scans every element; the write pointer marks where the next kept element goes. Filters an array in place with O(1) extra space.',
			verdict: 'Use for: removing duplicates or unwanted values in place.'
		},
		{
			label: 'Two arrays',
			lang: 'py',
			code: 'def merge(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    return out + a[i:] + b[j:]',
			body: 'One pointer per sorted input, always advancing the smaller head. This is the merge step of merge sort, O(len(a) + len(b)).',
			verdict: 'Use for: merging, intersecting or diffing sorted lists.'
		},
		{
			label: 'Sliding window',
			lang: 'py',
			code: 'left = 0\nfor right in range(len(a)):\n    add(a[right])          # grow the window\n    while window_is_invalid():\n        remove(a[left])    # shrink from the left\n        left += 1',
			body: 'Both pointers move rightward, bounding a contiguous window. Each index enters and leaves at most once, so the total work is O(n) even with the inner loop.',
			verdict: 'Practice: Buy low, sell later; Longest run without repeats.'
		},
		{
			label: 'Fast and slow',
			lang: 'py',
			code: 'slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        return True  # cycle\nreturn False',
			body: 'One pointer moves twice as fast. If the list has a cycle they must meet inside it (Floyd’s algorithm). With no cycle, slow is at the middle when fast runs out.',
			verdict: 'Use for: cycle detection, finding the middle of a linked list.'
		}
	]}
/>

<h2>Recognising a two-pointer problem</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Signal in the problem</th><th scope="col">Likely variant</th></tr></thead>
		<tbody>
			<tr><th scope="row">Sorted input, find a pair or triple with some sum</th><td>Opposite ends</td></tr>
			<tr><th scope="row">Compare a sequence with its own reverse</th><td>Opposite ends</td></tr>
			<tr><th scope="row">Modify an array in place, O(1) extra space</th><td>Read and write</td></tr>
			<tr><th scope="row">Two sorted sequences to combine</th><td>Two arrays</td></tr>
			<tr><th scope="row">Longest or shortest contiguous subarray or substring with a property</th><td>Sliding window</td></tr>
			<tr><th scope="row">Linked list: cycle, middle, k-th from the end</th><td>Fast and slow</td></tr>
		</tbody>
	</table>
</div>

<h2>Pitfalls</h2>
<ul>
	<li><strong><code>while i &lt;= j</code> instead of <code>i &lt; j</code></strong> lets an element pair with itself.</li>
	<li><strong>Sorting when indices matter.</strong> The answer refers to positions in the sorted copy unless you carried the original indices along.</li>
	<li><strong>Moving both pointers by default.</strong> Only move both after a match, as in 3Sum. Otherwise you can skip a valid pair.</li>
	<li><strong>Forgetting duplicates.</strong> Problems asking for <em>unique</em> combinations need explicit skips, or the output repeats.</li>
	<li><strong>Assuming sorted.</strong> If the statement doesn’t say so, either sort and pay O(n log n), or reach for a hash map.</li>
</ul>
</Layer>


<Layer depth="hood" summary="Harder uses that need a proof, not a hunch: the biggest-container problem and 3Sum without duplicates.">
<h2>A harder case: the biggest container</h2>
<p>
	Given heights of vertical lines, pick two that hold the most water: area = <code>(j − i) × min(h[i], h[j])</code>. The array is not sorted, yet two
	pointers still work, because the invariant comes from the area formula instead of from order.
</p>
<p>
	Start at both ends, which gives the widest possible container. Now consider the shorter line, say <code>h[i]</code>. Every other container that
	uses line i is narrower, and its height can be at most <code>h[i]</code>. So none of them can beat the current area, and line i can be discarded.
	Move the pointer at the shorter line; moving the taller one could never help.
</p>
<p>That is the general lesson: two pointers apply whenever you can prove that one end can be discarded on every step. Sorted order is only the most common source of that proof. You can write this one yourself in Practice as “The biggest tank”.</p>

<h2>Extending to three: 3Sum</h2>
<p>
	Find every unique triple that sums to zero. Sort once, fix the first element, and run the opposite-ends search on the rest. That is O(n²)
	overall, down from O(n³), and the only subtle part is skipping duplicates so each triple appears once.
</p>

<Code
	lang="py"
	code={`def three_sum(nums):
    nums.sort()                  # note: sorts the caller's list in place
    out = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue             # same anchor as last time
        i, j = k + 1, len(nums) - 1
        while i < j:
            total = nums[k] + nums[i] + nums[j]
            if total < 0:
                i += 1
            elif total > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1       # same second element as last time
    return out`}
	caption="three_sum([-1, 0, 1, 2, -1, -4]) returns [[-1, -1, 2], [-1, 0, 1]]."
/>


<Quiz
	variant="checkpoint"
	title="Under the hood checkpoint"
	questions={[
		{
			prompt: 'Why does 3Sum sort the input first?',
			options: ['So each comparison says which pointer to move', 'Sorting removes duplicates by itself', 'Sorted arrays use less memory'],
			answer: 0,
			explain: 'Sorted order is what lets one comparison rule out a whole end of the range.'
		}
	]}
/>

<h2>Recap: the full pattern</h2>
<ol>
	<li>Two pointers replace a pair search with a sweep that discards one candidate per step.</li>
	<li>Correctness comes from an invariant: any answer still lies between the pointers.</li>
	<li>On sorted input that gives O(n) time and O(1) space; with a sort first, O(n log n).</li>
	<li>The pattern generalises to read/write filtering, merging, sliding windows and fast/slow traversal.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Sorted array, the pointers’ sum is too small. What do you do?',
			options: ['Move the right pointer left', 'Move the left pointer right', 'Move both inward'],
			answer: 1,
			explain: 'Only a bigger left value can raise the sum, and every value to the right of i is at least nums[i].'
		},
		{
			prompt: 'At most how many iterations does the opposite-ends search take on 1,000 elements?',
			options: ['999', 'About 500,000', 'About 1,000,000'],
			answer: 0,
			explain: 'Each iteration shrinks the window by one until fewer than two elements remain: n − 1 iterations.'
		},
		{
			prompt: 'In the biggest-container problem, h[i] = 3 and h[j] = 8. Which pointer moves?',
			options: ['i, because it is the shorter line', 'j, because it is the taller line', 'Both'],
			answer: 0,
			explain: 'Every narrower container using line i is capped at height 3, so none can beat the current one. Line i is discarded.'
		},
		{
			prompt: 'Unsorted input, you need the original indices of a pair summing to k, fastest average time. What do you use?',
			options: ['Sort, then two pointers', 'A hash map in one pass', 'Brute force'],
			answer: 1,
			explain: 'A hash map is O(n) on average and keeps original indices. Sorting costs O(n log n) and scrambles the indices.'
		},
		{
			prompt: 'Why is a sliding window O(n) despite its inner while loop?',
			options: ['The inner loop runs at most once', 'Each index is added once and removed at most once', 'It is actually O(n²)'],
			answer: 1,
			explain: 'left only ever moves forward, so across the whole run the inner loop does at most n removals in total.'
		}
	]}
/>
</Layer>
