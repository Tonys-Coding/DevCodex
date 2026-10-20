<script lang="ts">
	import HashMapLab from '../../components/teach/HashMapLab.svelte';
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	Say you have a list of 10,000 people and you want Ada’s phone number. If the list is in no particular order, you have to check names one by
	one until you find her. A <strong>hash map</strong> lets you jump straight to Ada instead, almost instantly, no matter how long the list
	is. It is one of the most used tools in all of programming.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>what a hash map stores, and how it finds things by name,</li>
	<li>what happens when two names want the same spot,</li>
	<li>how to use one in Python and JavaScript, and</li>
	<li>when you want a map and when you want a set.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Key</dt>
		<dd>The name you look something up by, such as <code>"ada"</code>. Each key appears once in a map.</dd>
	</div>
	<div>
		<dt>Value</dt>
		<dd>What is stored under a key, such as Ada’s phone number. Together they make a <strong>key–value pair</strong>.</dd>
	</div>
	<div>
		<dt>Hash function</dt>
		<dd>A small recipe that turns any key into a number. The same key always gives the same number.</dd>
	</div>
	<div>
		<dt>Bucket</dt>
		<dd>One of the numbered spots inside a hash map where pairs are kept.</dd>
	</div>
	<div>
		<dt>Collision</dt>
		<dd>Two different keys landing in the same bucket. It is normal and handled for you.</dd>
	</div>
</dl>

<h2>A coat check for data</h2>
<p>
	Think of a coat check at a theatre. You hand over your coat and get a ticket with a number. Later, you show the ticket and the attendant walks
	straight to hook number 42. Nobody searches every coat.
</p>
<p>
	A hash map works the same way, except it makes the ticket number itself, from the key. It runs the key through a <strong>hash function</strong>,
	which turns <code>"ada"</code> into a number, then uses that number to pick a bucket. To find Ada again later, it runs the same function, gets the
	same number and goes straight to the same bucket.
</p>

<h2>See it work</h2>
<p>
	This lab uses a very simple hash function: add up the character codes of the letters, then take the remainder after dividing by the number of
	buckets. Type a name and press Add to see which bucket it lands in, or Find to look one up.
</p>

<HashMapLab />

<p>
	Try adding <code>ada</code> and then <code>daa</code>. They have the same letters, so this simple recipe gives them the same number and they share a
	bucket. Real hash functions mix the letters much more thoroughly, so similar keys spread out.
</p>

<h2>When two keys share a bucket</h2>
<p>
	A <strong>collision</strong> is not an error. The map simply keeps a short list in that bucket. When you look a key up, it goes to the right
	bucket and checks the few keys there. As long as buckets stay short, that is still almost instant.
</p>
<p>
	To keep buckets short, a map <strong>grows</strong> before it gets crowded. When it holds too many pairs for its number of buckets, it makes a
	bigger set of buckets, usually twice as many, and moves every pair to its new spot. Press “Grow to 16 buckets” in the lab to watch that happen.
	Your code never has to do this; the map does it on its own.
</p>

<h2>Using one in your language</h2>
<p>Python calls its hash map a <strong>dictionary</strong>. JavaScript has <code>Map</code>. Both do the same four jobs: add, look up, check and remove.</p>

<Code
	lang="py"
	title="Python dictionary"
	code={`ages = {"ada": 36, "grace": 85}

ages["linus"] = 21        # add (or change) a pair
print(ages["ada"])        # 36: look up by key
print("alan" in ages)     # False: is this key here?
del ages["grace"]         # remove a pair`}
/>

<Code
	lang="js"
	title="JavaScript Map"
	code={`const ages = new Map([["ada", 36], ["grace", 85]]);

ages.set("linus", 21);    // add (or change) a pair
ages.get("ada");          // 36: look up by key
ages.has("alan");         // false: is this key here?
ages.delete("grace");     // remove a pair`}
/>

<p>A classic first use is counting things. Each word becomes a key, and its count is the value:</p>

<Code
	lang="py"
	code={`counts = {}
for word in "the cat and the hat".split():
    counts[word] = counts.get(word, 0) + 1

print(counts)  # {'the': 2, 'cat': 1, 'and': 1, 'hat': 1}`}
	caption="counts.get(word, 0) means “the count so far, or 0 if this word is new”."
/>

<h2>Map or set?</h2>
<p>A <strong>set</strong> is a hash map with keys and no values. It answers one question very quickly: “have I seen this before?”</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">You want to…</th><th scope="col">Use</th><th scope="col">Python</th><th scope="col">JavaScript</th></tr></thead>
		<tbody>
			<tr><th scope="row">Store something under each name</th><td>A map</td><td><code>dict</code></td><td><code>Map</code></td></tr>
			<tr><th scope="row">Only know if a name is there</th><td>A set</td><td><code>set</code></td><td><code>Set</code></td></tr>
		</tbody>
	</table>
</div>

<Note title="What about plain JavaScript objects?" tone="plain">
	A JavaScript object like <code>{'{'} ada: 36 {'}'}</code> also maps names to values, and you will see it everywhere. It works well for a fixed set of
	text keys. <code>Map</code> is the better choice when keys are added and removed while the program runs, or when they are not text.
</Note>

<h2>Why it is fast</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Job</th><th scope="col">Searching a plain list</th><th scope="col">Hash map</th></tr></thead>
		<tbody>
			<tr><th scope="row">Find one name</th><td>Gets slower as the list grows</td><td>About the same speed at any size</td></tr>
			<tr><th scope="row">Add one</th><td>Quick</td><td>Quick</td></tr>
			<tr><th scope="row">Check if a name is there</th><td>Gets slower as the list grows</td><td>About the same speed at any size</td></tr>
		</tbody>
	</table>
</div>

<p>
	Programmers write “about the same speed at any size” as <strong>O(1)</strong>, and “slower as it grows” as <strong>O(n)</strong>. A hash map is O(1)
	<em>on average</em>: if many keys crowd into one bucket, it slows down, which good hash functions make very unlikely. Going deeper explains how.
</p>

<h2>Recap</h2>
<ol>
	<li>A hash map stores <strong>key–value pairs</strong> and finds a key by name, not by position.</li>
	<li>A <strong>hash function</strong> turns the key into a number that picks a bucket, the same bucket every time.</li>
	<li>Two keys in one bucket is a <strong>collision</strong>; the map keeps a short list there.</li>
	<li>The map <strong>grows</strong> before buckets get crowded, so lookups stay fast.</li>
	<li>Python’s <code>dict</code> and JavaScript’s <code>Map</code> are hash maps; a <strong>set</strong> keeps keys only.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'Why can a hash map find "ada" without checking every key?',
			options: ['It keeps the keys in alphabetical order', 'It works out which bucket "ada" must be in', 'It remembers the last key you used'],
			answer: 1,
			explain: 'The same hash function always turns "ada" into the same number, so the map goes straight to that one bucket.'
		},
		{
			prompt: 'Two different keys land in the same bucket. What is that called?',
			options: ['A collision', 'An overflow', 'A duplicate'],
			answer: 0,
			explain: 'A collision. It is normal: the map keeps both keys in a short list in that bucket.'
		},
		{
			prompt: 'Why does a hash map grow before it is full?',
			options: ['To keep buckets short, so lookups stay fast', 'To sort the keys', 'Because buckets can only hold one key'],
			answer: 0,
			explain: 'More buckets means fewer keys per bucket, so each lookup checks only a few keys.'
		},
		{
			prompt: 'You only need to know “have I seen this word before?”. Which fits best?',
			options: ['A map', 'A set', 'A list'],
			answer: 1,
			explain: 'A set keeps keys with no values, and answers “is it here?” just as fast as a map.'
		},
		{
			prompt: 'In Python, counts = {} and then counts["cat"] = counts.get("cat", 0) + 1. What is counts["cat"]?',
			options: ['0', '1', 'An error, because "cat" was not there'],
			answer: 1,
			explain: 'get returns 0 for a missing key, so the count becomes 0 + 1 = 1.'
		}
	]}
/>

<CorePack />


<Layer depth="deeper" summary="How hash functions, collision schemes and resizing really work, the costs in Big-O, and a hash map built from scratch.">
<p>
	Under the bonnet, a hash map stores key–value pairs in an array of <em>m</em> slots and finds a key’s slot by computing it:
	<code>index = reduce(h(key), m)</code>. Insert, lookup and delete are O(1) <strong>expected</strong>. That word carries real weight. The bound
	assumes the hash spreads the keys you actually have, that the table is resized before it fills, and that nobody is choosing keys against you.
	Each assumption is an engineering decision, and each fails in a recognisable way.
</p>

<h2>Four decisions</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Decision</th><th scope="col">Options</th><th scope="col">Failure mode when wrong</th></tr></thead>
		<tbody>
			<tr><th scope="row">Hash function</th><td>Multiplicative, FNV, xxHash/wyhash, SipHash, AES-based</td><td>Clustering on real keys; or collisions an attacker can manufacture</td></tr>
			<tr><th scope="row">Index reduction</th><td><code>h mod p</code> for prime p, <code>h &amp; (m − 1)</code> for power-of-two m, Fibonacci multiply-shift</td><td>Masking keeps only low bits, so a hash with weak low bits collapses into a few slots</td></tr>
			<tr><th scope="row">Collision resolution</th><td>Separate chaining; open addressing (linear, quadratic, double hashing, Robin Hood, SwissTable groups)</td><td>Long chains or probe sequences; poor cache behaviour</td></tr>
			<tr><th scope="row">Resize policy</th><td>Maximum load factor, growth factor, shrink threshold, all-at-once or incremental rehash</td><td>Degraded probes near full; latency spikes during rehash; thrashing at a boundary</td></tr>
		</tbody>
	</table>
</div>

<h2>Hash functions</h2>
<p>Requirements, in order of non-negotiability:</p>
<ol>
	<li><strong>Deterministic</strong> within the lifetime of the table.</li>
	<li><strong>Consistent with equality:</strong> <code>a == b</code> implies <code>h(a) == h(b)</code>. The converse is never required.</li>
	<li><strong>Well-distributed</strong> on realistic key sets: flipping any input bit should flip about half the output bits (avalanche).</li>
	<li><strong>Fast</strong>, because it runs on every operation.</li>
	<li><strong>Unpredictable</strong> to outsiders, whenever keys can come from an untrusted source.</li>
</ol>

<Code
	lang="js"
	title="FNV-1a, 32-bit"
	code={`function fnv1a(str) {
  let h = 0x811c9dc5;                  // offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);      // FNV prime, 32-bit multiply
  }
  return h >>> 0;                      // as unsigned
}

fnv1a('ada') % 8;  // 3
fnv1a('daa') % 8;  // 5: order now matters`}
	caption="Real FNV-1a hashes bytes. This version hashes UTF-16 code units, which is the same thing for ASCII input."
/>

<p>
	FNV is fast and simple, but it has no secret key. Anyone who knows the function can compute large sets of colliding keys offline. Production
	runtimes split along that line:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Runtime</th><th scope="col">Default for strings</th><th scope="col">Keyed per process</th></tr></thead>
		<tbody>
			<tr><th scope="row">CPython</th><td>SipHash-1-3 (since 3.11; SipHash-2-4 before)</td><td>Yes, random by default since 3.3; fixed with <code>PYTHONHASHSEED</code></td></tr>
			<tr><th scope="row">Rust <code>std</code></th><td>SipHash-1-3 via <code>RandomState</code></td><td>Yes</td></tr>
			<tr><th scope="row">Go</th><td>AES-instruction hash where available, with a fallback</td><td>Yes, a random seed per map</td></tr>
			<tr><th scope="row">Java</th><td><code>String.hashCode()</code>: <code>s[0]·31ⁿ⁻¹ + … + s[n−1]</code></td><td>No, it is specified and stable; <code>HashMap</code> mitigates collisions with tree bins instead</td></tr>
		</tbody>
	</table>
</div>

<h3>Index reduction</h3>
<p>
	<code>h mod p</code> with prime <em>p</em> uses every bit of <em>h</em> but costs a division. Power-of-two tables use <code>h &amp; (m − 1)</code>,
	a single AND that keeps only the low <em>log₂ m</em> bits. If the hash is weak in those bits, the table degrades no matter how large it gets. Java’s
	<code>HashMap</code> therefore folds the high half into the low half, <code>h ^ (h &gt;&gt;&gt; 16)</code>, before masking. Fibonacci hashing
	instead multiplies by ⌊2⁶⁴/φ⌋ and keeps the <em>top</em> bits, which mixes and reduces in one step.
</p>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'A power-of-two table picks the slot with h & (m − 1). Which bits of the hash decide the slot?',
			options: ['The low bits', 'The high bits', 'All of them equally'],
			answer: 0,
			explain: 'The mask keeps only the low log₂ m bits, which is why weak low bits hurt and tables mix the high bits in first.'
		}
	]}
/>

<h2>Collision resolution</h2>

<Choice
	title="Where does the second key go?"
	options={[
		{
			label: 'Separate chaining',
			lang: 'text',
			code: 'slot 3 → ("ada", 1) → ("daa", 2) → ∅',
			body: 'Each slot holds a list (or tree) of entries. Deletion is trivial and the load factor may exceed 1. Each hop is a pointer dereference, often a cache miss.',
			verdict: 'Java HashMap; V8 Map and Set chain through indices into an insertion-ordered entries array.'
		},
		{
			label: 'Linear probing',
			lang: 'text',
			code: 'probe: i, i+1, i+2, …  (mod m)\nslot 3: "ada"   slot 4: "daa"',
			body: 'Entries live in the array itself; on a collision, try the next slot. Sequential probing is extremely cache-friendly, but occupied runs merge into long clusters (primary clustering) as the load rises.',
			verdict: 'Fast at moderate load. Deletion needs tombstones or backward-shift deletion.'
		},
		{
			label: 'Perturbed probing',
			lang: 'py',
			code: '# CPython dictobject.c\nperturb = hash\ni = hash & mask\nwhile slot_occupied(i):\n    perturb >>= 5\n    i = (i * 5 + perturb + 1) & mask',
			body: 'Shifting the unused hash bits into the first probes makes them depend on the whole hash, not just the low bits. Once those bits run out, the recurrence i → 5i + 1 (mod 2ⁿ) is guaranteed to visit every slot.',
			verdict: 'CPython dict and set.'
		},
		{
			label: 'Robin Hood',
			lang: 'text',
			code: 'on insert: if my probe distance > occupant’s,\n           swap and keep inserting the occupant',
			body: 'Linear probing that “takes from the rich”: entries far from home displace entries close to home. Probe-length variance drops sharply, and lookups can stop early.',
			verdict: 'Rust std::HashMap before 1.36.'
		},
		{
			label: 'SwissTable',
			lang: 'text',
			code: 'H1 = hash >> 7   → which group of 16 slots\nH2 = hash & 0x7f → 7-bit tag in a control byte\nSIMD-compare H2 against 16 control bytes at once',
			body: 'Open addressing over groups. A parallel byte comparison filters candidates, so most lookups touch one control group and one slot. Maximum load is 7/8.',
			verdict: 'Abseil flat_hash_map, Rust hashbrown (std since 1.36), Go maps since 1.24.'
		}
	]}
/>

<h3>Expected cost by load factor</h3>
<p>
	Under the uniform-hashing assumption, with load factor α = n / m, the standard textbook estimates of the expected number of slots or entries
	examined are below: CLRS’s for chaining, counting the bucket access as 1, and Knuth’s for linear probing.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th scope="col">α</th><th scope="col">Chaining, hit<br />1 + α/2</th><th scope="col">Chaining, miss<br />1 + α</th><th scope="col">Linear probing, hit<br />½(1 + 1/(1−α))</th><th scope="col">Linear probing, miss<br />½(1 + 1/(1−α)²)</th></tr>
		</thead>
		<tbody>
			<tr><th scope="row">0.50</th><td>1.25</td><td>1.50</td><td>1.5</td><td>2.5</td></tr>
			<tr><th scope="row">0.75</th><td>1.38</td><td>1.75</td><td>2.5</td><td>8.5</td></tr>
			<tr><th scope="row">0.90</th><td>1.45</td><td>1.90</td><td>5.5</td><td>50.5</td></tr>
		</tbody>
	</table>
</div>

<p>
	Chaining degrades gracefully, while linear probing falls off a cliff as α → 1, which is why open-addressing tables cap the load lower. Probe
	counts are not the whole story, though. The next linear probe is usually in the same or the next cache line, while one chain hop is a dependent
	load from anywhere in memory. At moderate load, flat open-addressing tables usually win on real hardware.
</p>

<h2>Resizing and amortised cost</h2>
<p>
	When α crosses a threshold, the table allocates a larger array, typically doubling it, and re-inserts every entry, since each index depends
	on <em>m</em>. One insert then costs O(n). Spread over the inserts that caused it, it is O(1): the resize at size n moves n entries, the one
	before it about n/2, and so on, so all resizes together move fewer than n + n/2 + n/4 + … = 2n entries and n inserts cost O(n) overall.
</p>
<ul>
	<li><strong>Tail latency.</strong> Amortised O(1) still hides a full O(n) pause. Redis avoids it by keeping two tables and migrating a few buckets on each operation (incremental rehashing).</li>
	<li><strong>Pre-sizing.</strong> If you know n, allocate once. In Java, <code>HashMap.newHashMap(n)</code> (JDK 19+) accounts for the load factor for you, while <code>new HashMap&lt;&gt;(n)</code> sets the raw capacity, and the table still resizes once it holds 0.75 × capacity entries, possibly before n.</li>
	<li><strong>Hysteresis.</strong> If a table shrinks at the same threshold it grows at, alternating inserts and deletes at the boundary rehash every time. Shrink at a much lower load, or never.</li>
	<li><strong>Growth factor.</strong> 2× keeps masks valid and amortisation simple. Smaller factors waste less memory but rehash more often.</li>
</ul>

<h2>A complete minimal implementation</h2>

<Code
	lang="py"
	title="chained_map.py"
	code={`class HashMap:
    def __init__(self, capacity=8):
        self._buckets = [[] for _ in range(capacity)]
        self._size = 0

    def _bucket(self, key):
        return self._buckets[hash(key) % len(self._buckets)]

    def get(self, key, default=None):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return default

    def put(self, key, value):
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)       # overwrite in place
                return
        bucket.append((key, value))
        self._size += 1
        if self._size > 0.75 * len(self._buckets):
            self._resize(2 * len(self._buckets))

    def _resize(self, capacity):
        old = self._buckets
        self._buckets = [[] for _ in range(capacity)]
        for bucket in old:
            for k, v in bucket:
                self._bucket(k).append((k, v))  # every index changes`}
	caption="Production tables also cache each entry’s hash, so a resize never calls __hash__ again, and compare cached hashes before calling __eq__."
/>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Doubling the table whenever it fills makes a single insert…',
			options: ['O(1) in the worst case', 'O(1) amortised, with occasional O(n) pauses', 'O(log n) always'],
			answer: 1,
			explain: 'Each resize moves every entry once, but resizes get rarer as the table grows: amortised O(1), with a slow insert now and then.'
		}
	]}
/>

<h2>The equality–hash contract</h2>
<p>A table finds candidates by hash and confirms them by equality. Break the link between the two and entries disappear:</p>

<Code
	lang="py"
	code={`class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))   # equal points, equal hashes

p = Point(1, 2)
seen = {p}
p.x = 5                 # mutate a key that is already stored
p in seen               # False: searches near hash((5, 2))
Point(1, 2) in seen     # False: right slot, but the key now equals (5, 2)
Point(5, 2) in seen     # False: the entry is unreachable`}
/>

<ul>
	<li><strong>Python</strong> sets <code>__hash__ = None</code> on any class that defines <code>__eq__</code> without <code>__hash__</code>, making it unhashable. That is why lists, which are mutable, can’t be dict keys and tuples can.</li>
	<li><strong>CPython quirks:</strong> <code>hash(-1) == -2</code>, because -1 signals an error in the C API. Integers hash modulo the Mersenne prime 2⁶¹ − 1 on 64-bit builds, so <code>hash(2**61 - 1) == 0</code>.</li>
	<li><strong>NaN:</strong> <code>float('nan') != float('nan')</code>, but CPython checks identity before equality, so <em>the same</em> NaN object can be found again and a different NaN cannot. JavaScript’s <code>Map</code> uses SameValueZero, so <code>new Map([[NaN, 1]]).get(NaN)</code> is <code>1</code>.</li>
	<li><strong>JS objects are not maps.</strong> Plain-object keys are coerced to strings (every object key becomes <code>"[object Object]"</code>), and integer-like keys iterate first, in ascending order. Use <code>Map</code> for arbitrary keys; it compares objects by identity.</li>
</ul>

<h2>When not to use a hash map</h2>
<ul>
	<li><strong>You need order or ranges</strong> (“all keys between a and b”, “the next larger key”). Use a balanced tree, a B-tree or a sorted array.</li>
	<li><strong>n is tiny.</strong> A linear scan over a contiguous array of a handful of entries often beats hashing on real hardware.</li>
	<li><strong>Hard latency bounds.</strong> Rehash pauses and probabilistic worst cases may be unacceptable without incremental resizing.</li>
	<li><strong>Memory is tight.</strong> Empty slots, metadata and per-entry overhead add up. A sorted array with binary search is far denser.</li>
	<li><strong>Keys are small dense integers.</strong> A plain array indexed by the key is a perfect hash.</li>
</ul>
</Layer>


<Layer depth="hood" summary="What CPython, Java, V8 and SwissTable actually do, the probe-count maths, and how hash flooding attacks break the O(1) promise.">
<h2>What real implementations do</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Implementation</th><th scope="col">Scheme</th><th scope="col">Load policy</th><th scope="col">Notable detail</th></tr></thead>
		<tbody>
			<tr>
				<th scope="row">CPython <code>dict</code></th>
				<td>Open addressing with perturbed probing</td>
				<td>Resizes once two-thirds of the index slots are used</td>
				<td>Compact layout: a sparse index array points into a dense, insertion-ordered entries array. Order is an implementation detail in 3.6 and guaranteed from 3.7</td>
			</tr>
			<tr>
				<th scope="row">Java <code>HashMap</code></th>
				<td>Chaining, power-of-two table</td>
				<td>Default capacity 16, load factor 0.75</td>
				<td>A bin with 8 or more entries becomes a red-black tree once the table has at least 64 slots, bounding worst-case lookups at O(log n) when keys are <code>Comparable</code></td>
			</tr>
			<tr>
				<th scope="row">V8 <code>Map</code> / <code>Set</code></th>
				<td>Deterministic hash table (Tyler Close’s design)</td>
				<td>Grows and shrinks by rehashing</td>
				<td>Buckets chain through an entries array kept in insertion order, which is how iteration order is guaranteed</td>
			</tr>
			<tr>
				<th scope="row">Abseil, hashbrown, Go 1.24+</th>
				<td>SwissTable: open addressing over SIMD-scanned groups</td>
				<td>Up to 7/8 full</td>
				<td>One control byte per slot holds 7 hash bits or an empty/deleted marker</td>
			</tr>
		</tbody>
	</table>
</div>

<h2>Hash flooding</h2>
<p>
	If an attacker can predict the hash, they can send n keys that all land in one slot. Each insert then scans the whole chain or probe sequence,
	so n inserts cost O(n²). In 2011, Alexander Klink and Julian Wälde showed at 28C3 that a single HTTP POST with many colliding form-field
	names could keep a server’s CPU busy far longer than the request took to send, because frameworks parse parameters into a hash table before application code ever runs. PHP,
	Java, Python, Ruby and ASP.NET were affected.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Mitigation</th><th scope="col">How it helps</th><th scope="col">Used by</th></tr></thead>
		<tbody>
			<tr><th scope="row">Keyed hash with a random per-process seed</th><td>Collisions can’t be computed offline</td><td>Python, Ruby, Rust (SipHash); Go (random seed per map)</td></tr>
			<tr><th scope="row">Balanced trees for overfull bins</th><td>Worst case becomes O(log n) per operation, for comparable keys</td><td>Java 8+ <code>HashMap</code></td></tr>
			<tr><th scope="row">Input limits</th><td>Caps n before parsing</td><td>PHP <code>max_input_vars</code> (default 1000)</td></tr>
		</tbody>
	</table>
</div>

<Note title="Randomised hashing has a visible cost" tone="warn">
	With a per-process seed, the order of a Python <code>set</code> of strings changes from run to run, and so does anything that depends on it,
	such as test snapshots and generated files. <code>dict</code> is unaffected because it iterates in insertion order. Set <code>PYTHONHASHSEED=0</code>
	only to debug reproducibility, never in production.
</Note>

<h2>Recap: the engineering view</h2>
<ol>
	<li>O(1) is an expectation that depends on the hash function, the index reduction, the collision scheme and the resize policy.</li>
	<li>Masking for power-of-two tables needs good low bits; mix first.</li>
	<li>Chaining degrades gently; open addressing is faster at moderate load and collapses near full, so it caps lower.</li>
	<li>Doubling gives amortised O(1) inserts but O(n) individual pauses, unless you rehash incrementally.</li>
	<li>Equal keys must hash equally, and stored keys must not change.</li>
	<li>Untrusted keys need a keyed hash, or a bounded worst case.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'A power-of-two table indexes with h & (m − 1). Keys are multiples of 64 and h(k) = k. With m = 64, what happens?',
			options: ['Keys spread evenly', 'Every key lands in slot 0', 'Every key lands in slot 63'],
			answer: 1,
			explain: 'Multiples of 64 have their low 6 bits all zero, and the mask keeps only those bits. This is why tables mix the high bits in first.'
		},
		{
			prompt: 'Linear probing at load factor 0.9: roughly how many probes does an unsuccessful lookup take?',
			options: ['About 2', 'About 10', 'About 50'],
			answer: 2,
			explain: '½(1 + 1/(1 − 0.9)²) = ½(1 + 100) ≈ 50.5. That cliff is why open-addressing tables resize well before 0.9.'
		},
		{
			prompt: 'Why does doubling the table keep inserts O(1) amortised?',
			options: [
				'Resizing is O(1)',
				'All resizes together move fewer than 2n entries',
				'Doubling avoids collisions'
			],
			answer: 1,
			explain: 'Each resize moves the current entries, and the sizes halve going backwards: n + n/2 + n/4 + … < 2n, so the total is O(n) over n inserts.'
		},
		{
			prompt: 'A Python class defines __eq__ but not __hash__. What happens when you add an instance to a set?',
			options: ['It hashes by identity', 'TypeError: unhashable type', 'It hashes by its fields'],
			answer: 1,
			explain: 'Defining __eq__ sets __hash__ to None, so instances are unhashable unless you define __hash__ consistently with equality.'
		},
		{
			prompt: 'Which change defends a web framework’s parameter table against hash flooding?',
			options: ['A larger initial capacity', 'A keyed hash with a random per-process seed', 'A lower maximum load factor'],
			answer: 1,
			explain: 'Capacity and load factor only change constants. A secret seed stops attackers from computing colliding keys in advance.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://abseil.io/about/design/swisstables" rel="external">Abseil: Swiss Tables design notes</a></li>
	<li><a href="https://go.dev/blog/swisstable" rel="external">Go blog: Faster Go maps with Swiss Tables</a></li>
	<li><a href="https://github.com/python/cpython/blob/main/Objects/dictobject.c" rel="external">CPython: Objects/dictobject.c</a></li>
	<li><a href="https://docs.python.org/3/reference/datamodel.html#object.__hash__" rel="external">Python data model: object.__hash__</a></li>
	<li><a href="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html" rel="external">Java SE 21: HashMap</a></li>
	<li><a href="https://v8.dev/blog/hash-code" rel="external">V8 blog: Optimizing hash tables, hiding the hash code</a></li>
	<li><a href="https://www.aumasson.jp/siphash/siphash.pdf" rel="external">Aumasson and Bernstein: SipHash, a fast short-input PRF</a></li>
</ul>
</Layer>
