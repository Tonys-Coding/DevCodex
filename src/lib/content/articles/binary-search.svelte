<script lang="ts">
	import BinarySearchLab from '../../components/teach/BinarySearchLab.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	Think of a number between 1 and 100, and let a friend guess. If you only say “higher” or “lower”, a smart friend never needs more than seven
	guesses. They start at 50, then 25 or 75, and so on: every answer throws away half of what is left.
</p>
<p>
	That game is <strong>binary search</strong>, one of the most useful ideas in programming. It finds an item in a sorted list of a million things in
	about 20 looks, where checking one by one could take a million.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>how halving finds things so quickly, and why the list must be sorted,</li>
	<li>how to write binary search in JavaScript and Python,</li>
	<li>the small mistakes at the edges that catch almost everyone,</li>
	<li>what Python gives you ready-made, and</li>
	<li>where binary search hides in tools you already use.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Sorted</dt>
		<dd>In order, smallest to largest (or A to Z). Binary search only works on sorted data.</dd>
	</div>
	<div>
		<dt>Index</dt>
		<dd>An item’s position in a list, counting from 0. In <code>[4, 9, 15]</code>, 15 is at index 2.</dd>
	</div>
	<div>
		<dt>Search range</dt>
		<dd>The part of the list where the target could still be. Binary search keeps it between two indexes, <code>lo</code> and <code>hi</code>.</dd>
	</div>
	<div>
		<dt>Middle</dt>
		<dd>The item halfway through the search range, at index <code>(lo + hi) // 2</code>, rounded down.</dd>
	</div>
	<div>
		<dt>Linear search</dt>
		<dd>Checking items one by one from the start. Simple, and fine for short lists, but slow for long ones.</dd>
	</div>
	<div>
		<dt>O(log n)</dt>
		<dd>Said “order log n”. The work grows by one step each time the data <em>doubles</em>, which is very slowly.</dd>
	</div>
</dl>

<h2>The idea: throw away half</h2>
<p>
	Say you are looking for 42 in a sorted list. Look at the <strong><Term def="The item halfway through the search range, at index (lo + hi) // 2, rounded down.">middle</Term></strong> item first. Three things can happen:
</p>
<ol>
	<li><strong>It is 42.</strong> Done.</li>
	<li><strong>It is bigger than 42.</strong> Everything after it is bigger still, because the list is sorted. Throw away the right half.</li>
	<li><strong>It is smaller than 42.</strong> Everything before it is smaller still. Throw away the left half.</li>
</ol>
<p>
	Then do the same with the half that is left: look at its middle, and halve again. The <Term def="The part of the list where the target could still be. Binary search keeps it between two indexes, lo and hi.">search range</Term> shrinks 16, 8, 4, 2, 1, until you find the
	item or there is nothing left, which proves it isn’t there.
</p>

<Note title="An everyday picture" tone="plain">
	Finding a word in a paper dictionary works the same way. You open it near the middle, see you are in “M”, and flip toward the front for “cat”. You
	never read page by page, because the words are in order.
</Note>

<h2>Try it</h2>
<p>
	You are the search. The lab marks the middle of what is left. Compare it with the target, then keep the half that could still hold it. Count the
	steps, then compare with checking one by one.
</p>

<BinarySearchLab nums={[3, 8, 12, 19, 23, 27, 31, 42, 46, 50, 57, 63, 71, 78, 85]} />

<p>Things to try on purpose:</p>
<ol>
	<li>Find the target with as few steps as you can. With 15 numbers it never takes more than four looks.</li>
	<li>Press “Try another number” until you get one that isn’t in the list. Watch how the search proves it is missing.</li>
	<li>Choose the wrong half on purpose and read why that half can’t hold the target.</li>
</ol>

<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'You are searching a sorted list for 30 and the middle item is 45. What do you do next?',
			options: ['Search the right half', 'Search the left half', 'Start again from the beginning'],
			answer: 1,
			explain: '30 is smaller than 45. In a sorted list everything to the right of 45 is even bigger, so only the left half can hold 30.'
		}
	]}
/>

<h2>Why halving is so fast</h2>
<p>
	Each look cuts the range in half, so the number of looks only grows by one when the list doubles in size. Compare the worst case for checking one by
	one with the worst case for binary search:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Items in the sorted list</th><th scope="col">Linear search, worst case</th><th scope="col">Binary search, worst case</th></tr></thead>
		<tbody>
			<tr><th scope="row">10</th><td>10 looks</td><td>4 looks</td></tr>
			<tr><th scope="row">100</th><td>100 looks</td><td>7 looks</td></tr>
			<tr><th scope="row">1,000</th><td>1,000 looks</td><td>10 looks</td></tr>
			<tr><th scope="row">1,000,000</th><td>1,000,000 looks</td><td>20 looks</td></tr>
			<tr><th scope="row">1,000,000,000</th><td>1,000,000,000 looks</td><td>30 looks</td></tr>
		</tbody>
	</table>
</div>

<p>
	Programmers write this as <strong><Term def="Said “order log n”. The work grows by one step each time the data doubles, which is very slowly.">O(log n)</Term></strong>. “Log” here means “how many times can you halve n before you reach 1?” For a billion that is
	about 30. A <Term def="Checking items one by one from the start. Simple, and fine for short lists, but slow for long ones.">linear search</Term> is O(n): its work grows in step with the list.
</p>

<h2>The code</h2>
<p>
	Keep two <Term def="An item’s position in a list, counting from 0. In [4, 9, 15], 15 is at index 2.">indexes</Term>: <code>lo</code> for the first place the target could be, and <code>hi</code> for the last. Look at the middle, then move one
	end past it. When <code>lo</code> passes <code>hi</code>, the range is empty and the target is not there, so return <code>-1</code>.
</p>

<Code
	lang="js"
	title="binarySearch.js"
	code={`function binarySearch(items, target) {
  let lo = 0;
  let hi = items.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (items[mid] === target) return mid;
    if (items[mid] < target) lo = mid + 1;   // target is in the right half
    else hi = mid - 1;                       // target is in the left half
  }
  return -1;
}

const ages = [3, 8, 12, 19, 23, 31, 42, 57];
console.log(binarySearch(ages, 23)); // 4
console.log(binarySearch(ages, 20)); // -1`}
/>

<Code
	lang="py"
	title="binary_search.py"
	code={`def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1       # target is in the right half
        else:
            hi = mid - 1       # target is in the left half
    return -1

ages = [3, 8, 12, 19, 23, 31, 42, 57]
print(binary_search(ages, 23))   # 4
print(binary_search(ages, 20))   # -1`}
/>

<h2>Watch the edges</h2>
<p>The idea is simple; the details are where people slip. Three rules keep the loop correct:</p>
<ol>
	<li><strong>Loop while <code>lo &lt;= hi</code>.</strong> With <code>&lt;</code> instead, a range of one item is skipped, and a target sitting there is never found.</li>
	<li><strong>Move past the middle: <code>mid + 1</code> and <code>mid - 1</code>.</strong> Setting <code>lo = mid</code> can leave the range the same size forever, and the loop never ends.</li>
	<li><strong>Return a clear “not found”.</strong> <code>-1</code> is the usual choice, because it can never be a real index.</li>
</ol>

<Note title="The list must be sorted" tone="warn">
	On an unsorted list, binary search doesn’t crash. It quietly returns the wrong answer, because throwing away “the bigger half” only makes sense when
	bigger things are all on one side. If the data isn’t sorted and you search it only once, a linear search is faster than sorting first.
</Note>

<h2>Python has it built in</h2>
<p>
	Python’s <code>bisect</code> module does binary search for you. <code>bisect_left</code> returns the index where the target is, or where it
	<em>would go</em> to keep the list sorted. Check that position to turn it into a “find”:
</p>

<Code
	lang="py"
	code={`import bisect

ages = [3, 8, 12, 19, 23, 31, 42, 57]
bisect.bisect_left(ages, 23)   # 4: it is here
bisect.bisect_left(ages, 20)   # 4: it would go here, before 23

def index_of(items, target):
    i = bisect.bisect_left(items, target)
    return i if i < len(items) and items[i] == target else -1`}
	caption="JavaScript has no built-in binary search: indexOf and includes check items one by one."
/>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'A loop uses while (lo < hi) instead of while (lo <= hi). What goes wrong?',
			options: ['Nothing, they are the same', 'When one item is left, it is never checked', 'It searches the list twice'],
			answer: 1,
			explain: 'When lo equals hi there is exactly one candidate left. With <, the loop stops before looking at it.'
		}
	]}
/>

<h2>Where it shows up</h2>
<ul>
	<li><strong>Finding a bug in history.</strong> <code>git bisect</code> binary-searches your commits: you mark one good and one bad, and it halves the gap until it finds the commit that broke things.</li>
	<li><strong>Databases.</strong> An index keeps values sorted, so finding one row among millions takes a few dozen comparisons, not a full scan.</li>
	<li><strong>Autocomplete and spell check.</strong> A sorted word list finds where “progr…” would go, and the matches sit right there together.</li>
	<li><strong>Games and graphics.</strong> Finding which frame of an animation a moment in time falls into, in a sorted list of timestamps.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Searching unsorted data.</strong> You get a confident wrong answer. Sort first, or keep the data sorted as you add to it.</li>
	<li><strong>Off-by-one ends.</strong> Use <code>lo &lt;= hi</code> with <code>mid ± 1</code>, and test a list of 0, 1 and 2 items.</li>
	<li><strong>Using it on a tiny list.</strong> For ten items a simple loop is just as fast and easier to read.</li>
	<li><strong>Expecting the first match.</strong> With duplicates, plain binary search returns <em>a</em> match, not necessarily the first. Going deeper shows how to get the first one.</li>
</ul>

<h2>Recap</h2>
<ul>
	<li>Binary search looks at the middle and throws away the half that can’t hold the target, again and again.</li>
	<li>It only works on <strong><Term def="In order, smallest to largest (or A to Z). Binary search only works on sorted data.">sorted</Term></strong> data.</li>
	<li>It takes O(log n) looks: about 20 for a million items and 30 for a billion.</li>
	<li>Keep <code>lo</code> and <code>hi</code>, loop while <code>lo &lt;= hi</code>, move to <code>mid ± 1</code>, and return <code>-1</code> when the range is empty.</li>
	<li>In Python, <code>bisect.bisect_left</code> does it for you. JavaScript’s <code>indexOf</code> does not: it checks every item.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'About how many looks does binary search need, at most, for a sorted list of 1,000,000 items?',
			options: ['About 20', 'About 1,000', 'About 500,000'],
			answer: 0,
			explain: 'Halving a million 20 times gets you down to 1, because 2 to the power 20 is just over a million.'
		},
		{
			prompt: 'Binary search is run on the unsorted list [9, 2, 7, 4]. What happens?',
			options: ['It sorts the list first', 'It may return a wrong answer without any error', 'It throws an error'],
			answer: 1,
			explain: 'Nothing checks that the list is sorted. Throwing away half is only safe when the order is right, so results can be wrong.'
		},
		{
			prompt: 'The list doubles from 1,000 to 2,000 items. How does the worst case for binary search change?',
			options: ['It doubles', 'It goes up by about one look', 'It stays exactly the same'],
			answer: 1,
			explain: 'One extra look halves 2,000 back to 1,000. That is what O(log n) means.'
		},
		{
			prompt: 'Searching [3, 8, 12, 19] for 12, the first middle index is (0 + 3) // 2. Which item is that?',
			options: ['3', '8', '12'],
			answer: 1,
			explain: '(0 + 3) // 2 is 1, rounded down, and index 1 holds 8. 12 is bigger, so the search moves right.'
		},
		{
			prompt: 'Why does the loop set lo = mid + 1 instead of lo = mid?',
			options: ['To make it faster by one look', 'Because the middle was already checked, and lo = mid can loop forever', 'It doesn’t matter'],
			answer: 1,
			explain: 'The middle is not the target, so it can be excluded. Keeping it can leave the range unchanged, and the loop never ends.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Finding the first match and insertion points with a lower bound, then binary searching an answer instead of a list.">
<h2>The first match: lower bound</h2>
<p>
	With duplicates, “where is 20?” has several answers. Often you want the <strong>first</strong> one, or the place a new value should go. That is a
	<strong>lower bound</strong>: the first index whose item is not less than the target. It uses a <em>half-open</em> range, where <code>hi</code> is one
	past the last candidate, and it never stops early:
</p>

<Code
	lang="py"
	code={`def lower_bound(items, target):
    lo, hi = 0, len(items)          # hi is one past the end
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < target:
            lo = mid + 1            # everything up to mid is too small
        else:
            hi = mid                # mid might be the answer: keep it
    return lo

scores = [10, 20, 20, 20, 30]
lower_bound(scores, 20)   # 1: the first 20
lower_bound(scores, 25)   # 4: where 25 would go
lower_bound(scores, 99)   # 5: past the end`}
	caption="This is exactly what bisect.bisect_left does. Notice < instead of <=, and hi = mid instead of mid - 1: both follow from the half-open range."
/>

<p>
	Its partner, the <strong>upper bound</strong> (<code>bisect_right</code>), finds the first item <em>greater</em> than the target. The difference between
	the two counts the copies: <code>bisect_right(scores, 20) - bisect_left(scores, 20)</code> is 3, found in O(log n) without scanning.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Style</th><th scope="col">Range</th><th scope="col">Loop</th><th scope="col">Moves</th><th scope="col">Best for</th></tr></thead>
		<tbody>
			<tr><th scope="row">Closed</th><td><code>[lo, hi]</code></td><td><code>lo &lt;= hi</code></td><td><code>mid ± 1</code></td><td>Is it there, and where?</td></tr>
			<tr><th scope="row">Half-open</th><td><code>[lo, hi)</code></td><td><code>lo &lt; hi</code></td><td><code>lo = mid + 1</code>, <code>hi = mid</code></td><td>First match, insertion point, counting</td></tr>
		</tbody>
	</table>
</div>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'What does a lower bound return for 25 in [10, 20, 20, 20, 30]?',
			options: ['-1, because 25 isn’t there', '4, the index where 25 would go', '3, the last 20'],
			answer: 1,
			explain: 'A lower bound never says “missing”. It returns the first index whose item is at least 25, which is 4, where 30 sits.'
		}
	]}
/>

<h2>Binary search on the answer</h2>
<p>
	Binary search doesn’t need a list at all. It needs a yes/no question that flips once as a number grows: “no, no, no, yes, yes”. Then you can search
	for the first “yes”. For example, the whole-number square root is the largest <code>m</code> with <code>m * m &lt;= n</code>:
</p>

<Code
	lang="py"
	code={`def int_sqrt(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2      # round up, so lo always moves
        if mid * mid <= n:
            lo = mid                  # mid works: the answer is mid or bigger
        else:
            hi = mid - 1
    return lo

[int_sqrt(n) for n in (15, 16, 17, 10**12)]   # [3, 4, 4, 1000000]`}
/>

<p>
	The same move solves “what is the smallest truck that ships these parcels in 5 days?”. A big enough truck always works and a smaller one may not,
	so binary-search the capacity, between the heaviest parcel and the total weight, and check each guess with a quick simulation:
</p>

<Code
	lang="py"
	code={`def ship_within(weights, days):
    def days_needed(capacity):
        d, load = 1, 0
        for w in weights:
            if load + w > capacity:   # full: start a new day
                d += 1
                load = 0
            load += w
        return d

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(mid) <= days:
            hi = mid                  # mid works: try smaller
        else:
            lo = mid + 1
    return lo

ship_within([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)   # 15`}
	caption="The check is O(n) and runs O(log of the weight range) times. Trying every capacity in turn would be far slower."
/>

<Note title="Spotting it" tone="tip">
	“Find the smallest/largest value such that…” with a check that only gets easier as the value grows is the signal. The question is monotonic: once
	it says yes, it keeps saying yes.
</Note>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Which question can you binary-search on the answer?',
			options: [
				'Is this number prime?',
				'Can a team of size k finish the job by Friday? (bigger teams never make it slower)',
				'Which word appears most often?'
			],
			answer: 1,
			explain: 'The answers go no, no, yes, yes as k grows, so you can search for the first yes. Primality jumps around with no such order.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="The midpoint overflow that hid in Java for nine years, exactly how many comparisons a search takes, and why databases search wide pages instead of halving one item at a time.">
<h2>A bug that hid for nine years</h2>
<p>
	In 2006 Joshua Bloch wrote that the binary search he had put in Java’s <code>Arrays.binarySearch</code> was broken, and had been for about nine
	years. The line was <code>int mid = (low + high) / 2;</code>. Java’s <code>int</code> holds up to 2,147,483,647. For an array of more than about a
	billion items, <code>low + high</code> passes that limit, wraps around to a negative number, and the program crashes with an out-of-bounds index.
</p>

<Code
	lang="js"
	code={`const lo = 2 ** 31 - 10, hi = 2 ** 31 - 2;

console.log(((lo + hi) | 0) / 2 | 0);         // -6: forced to 32 bits, the sum wraps
console.log(lo + Math.floor((hi - lo) / 2));  // 2147483642: never adds two big numbers
console.log((lo + hi) >>> 1);                 // 2147483642: unsigned shift, Java's fix`}
	caption="JavaScript numbers are not 32-bit, so this only goes wrong when forced with | 0. Python integers never overflow at all."
/>

<p>
	The fix is <code>low + (high - low) / 2</code>, or <code>(low + high) &gt;&gt;&gt; 1</code>. The story is a good warning: Donald Knuth noted that the
	idea was published in 1946, but the first version correct for every list size didn’t appear until 1962.
</p>

<h2>Exactly how many looks</h2>
<p>
	For <code>n</code> items, a successful or failed search needs at most <code>⌊log₂ n⌋ + 1</code> looks. For 1,000 that is 10, because
	2<sup>9</sup> = 512 ≤ 1,000 &lt; 1,024. On average a successful search needs about one fewer. Each step does one or two comparisons, so it is the
	number of halvings, not the comparisons, that sets the speed.
</p>

<h2>Why a database doesn’t halve one item at a time</h2>
<p>
	Binary search on a big array jumps all over memory: the first looks land far apart, and each one is likely a <strong>cache miss</strong>, a trip
	to main memory that costs far more than the comparison. On disk it is worse, because every jump can mean reading a whole page.
</p>
<ul>
	<li><strong>B-trees</strong>, used by almost every database index and file system, store hundreds of sorted keys per page. Each page read narrows the search by hundreds of times, not two, so a billion rows need only about four or five page reads. Inside each page, a plain binary search picks the next branch.</li>
	<li><strong>Cache-friendly layouts</strong>, such as storing the sorted array in the order a binary search visits it (the Eytzinger layout), keep the first few levels next to each other in memory, which makes searches noticeably faster on large arrays.</li>
</ul>

<h2>Recap: under the hood</h2>
<ol>
	<li><code>(lo + hi) / 2</code> overflows in fixed-size integers. Use <code>lo + (hi - lo) / 2</code> in languages like Java, C and C++.</li>
	<li>A search over n items takes at most ⌊log₂ n⌋ + 1 looks.</li>
	<li>Memory access, not comparisons, dominates on big data, which is why B-trees use wide nodes.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Why did (low + high) / 2 crash Java’s binary search on huge arrays?',
			options: ['Division by zero', 'The sum passed the largest int and wrapped to a negative number', 'The array was unsorted'],
			answer: 1,
			explain: 'Two indexes above about a billion add up to more than 2,147,483,647, which wraps to a negative int, an invalid index.'
		},
		{
			prompt: 'At most how many looks does binary search need for 1,000 items?',
			options: ['9', '10', '500'],
			answer: 1,
			explain: '⌊log₂ 1000⌋ + 1 = 9 + 1 = 10.'
		},
		{
			prompt: 'Does Python’s binary search need the overflow-safe midpoint?',
			options: ['Yes, always', 'No: Python integers grow as needed and never overflow'],
			answer: 1,
			explain: 'Python ints are arbitrary precision, so lo + hi is always exact. The safe form is still a good habit if you switch languages.'
		},
		{
			prompt: 'Why do database indexes use B-trees with many keys per page instead of one big sorted array?',
			options: ['B-trees use less disk space', 'Each page read narrows the search hundreds of times, so far fewer slow reads are needed', 'Sorted arrays can’t hold text'],
			answer: 1,
			explain: 'Reading a page is the slow part. Hundreds of keys per page means a handful of reads instead of about 30 scattered ones.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://ai.googleblog.com/2006/06/extra-extra-read-all-about-it-nearly.html" rel="external">Joshua Bloch: Nearly all binary searches and mergesorts are broken</a></li>
	<li><a href="https://docs.python.org/3/library/bisect.html" rel="external">Python: bisect</a></li>
	<li><a href="https://git-scm.com/docs/git-bisect" rel="external">Git: git bisect</a></li>
</ul>
</Layer>
