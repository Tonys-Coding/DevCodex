<script lang="ts">
	import TwoPointerGame from '../../components/teach/TwoPointerGame.svelte';
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
</script>

<p>
	The canonical problem: given a <em>sorted</em> array and a target, find two elements that sum to the target. The obvious solution checks every
	pair, which is n(n − 1) / 2 checks: 28 for 8 elements, about 5 billion for 100,000. In Python, that many checks takes minutes.
</p>

<Code
	lang="py"
	title="Brute force: O(n²)"
	code={`def pair_sum_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`}
/>

<p>
	The brute force ignores the one thing we were given for free: order. With sorted input, a single comparison tells you not just “this pair is
	wrong” but <em>which direction</em> the answer lies in. The two-pointer pattern exploits that to eliminate one candidate per step.
</p>

<h2>Play it first</h2>
<p>Start with a pointer at each end. Look at the sum and decide which pointer to move. The game checks every move against the rule.</p>

<TwoPointerGame nums={[2, 4, 5, 7, 9, 12, 15, 18]} target={16} />

<h2>The algorithm</h2>

<Code
	lang="py"
	title="Two pointers: O(n) time, O(1) space"
	code={`def pair_sum_sorted(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:                  # i == j would reuse one element
        total = nums[i] + nums[j]
        if total == target:
            return [i, j]
        if total < target:
            i += 1                # need a bigger sum
        else:
            j -= 1                # need a smaller sum
    return []`}
/>

<h3>Why discarding is safe: the invariant</h3>
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

<h2>Recap</h2>
<ol>
	<li>Two pointers replace a pair search with a sweep that discards one candidate per step.</li>
	<li>Correctness comes from an invariant: any answer still lies between the pointers.</li>
	<li>On sorted input that gives O(n) time and O(1) space; with a sort first, O(n log n).</li>
	<li>The pattern generalises to read/write filtering, merging, sliding windows and fast/slow traversal.</li>
</ol>

<Quiz
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
