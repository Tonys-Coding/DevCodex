<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What happened</h2>
<p>
	On 2 July 2019, at 13:42 UTC, Cloudflare engineers deployed a new rule to their web application firewall (WAF), the layer that inspects requests
	for attacks before they reach a customer’s site. Within moments, CPU use on every server in their network jumped to nearly 100%. Visitors to
	millions of sites behind Cloudflare got <code>502 Bad Gateway</code> errors. For about half an hour, a large share of the web was simply down.
</p>

<h2>The culprit: one regular expression</h2>
<p>The rule was meant to catch cross-site scripting attempts. Buried inside its pattern was this fragment:</p>

<Code lang="text" code={`.*(?:.*=.*)`} caption="Two greedy “match anything” parts, followed by an equals sign, followed by another." />

<p>
	Most regex engines, including the one the WAF used, work by <strong>backtracking</strong>. A greedy <code>.*</code> grabs as much as it can, then
	gives characters back one at a time whenever the rest of the pattern fails. With two <code>.*</code> in a row and an <code>=</code> that may never
	appear, the engine tries every way of splitting the text between them, then does it again from every starting position.
</p>

<h2>See it grow</h2>
<p>You can reproduce the shape in a few lines. Searching text with no <code>=</code> in it:</p>

<Code
	lang="py"
	code={`import re, time

pattern = re.compile(r".*.*=.*")
for n in (1000, 2000, 4000):
    start = time.perf_counter()
    pattern.search("x" * n)
    print(n, round(time.perf_counter() - start, 2), "s")`}
/>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Characters</th><th scope="col">Time on a laptop</th></tr></thead>
		<tbody>
			<tr><th scope="row">1,000</th><td>about 0.1 s</td></tr>
			<tr><th scope="row">2,000</th><td>about 1 s</td></tr>
			<tr><th scope="row">4,000</th><td>about 7 s</td></tr>
		</tbody>
	</table>
</div>

<p>
	Doubling the input makes it about eight times slower: the work grows with the cube of the length. Finding a plain <code>=</code> in the same
	4,000 characters takes a couple of microseconds. Now imagine that pattern running against every request, on every server, all at once.
</p>

<h2>Why it spread everywhere</h2>
<p>
	WAF rules were deployed globally in one step, because new attacks need defending against quickly. That speed meant there was no small group of
	servers to fail first and raise the alarm. The fix that night was a global switch that turned the WAF’s managed rules off, after which traffic
	recovered and the bad rule was removed.
</p>

<h2>What changed afterwards</h2>
<ul>
	<li><strong>A safer regex engine.</strong> Cloudflare moved toward engines such as RE2 and Rust’s <code>regex</code>, which don’t backtrack and guarantee time that grows linearly with the input.</li>
	<li><strong>Staged rollouts.</strong> Rule changes now go to a small slice of traffic first, with automatic checks before they go further.</li>
	<li><strong>Limits.</strong> Rules got CPU protections, so one bad pattern can’t starve everything else on the machine.</li>
</ul>

<Note title="Spot it in your own code" tone="tip">
	Be wary of nested or adjacent quantifiers over the same characters: <code>(a+)+</code>, <code>.*.*</code>, <code>(\w|\d)*</code>. This failure has a
	name, <strong>ReDoS</strong> (regular expression denial of service), and linters can flag the risky shapes for you.
</Note>

<h2>Why it matters to you</h2>
<p>
	Any regex that runs on text you don’t control is a performance risk, not just a correctness one. Test patterns against long, near-miss input,
	and prefer a linear-time engine where you can. And when a change can affect every server at once, roll it out to a few first.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/" rel="external">Cloudflare: Details of the Cloudflare outage on July 2, 2019</a></li>
	<li><a href="https://github.com/google/re2/wiki/WhyRE2" rel="external">RE2: why it guarantees linear time</a></li>
</ul>
