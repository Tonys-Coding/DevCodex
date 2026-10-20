<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>Try it</h2>
<p>Open any JavaScript console or Python prompt and add two simple numbers:</p>

<Code
	lang="js"
	code={`0.1 + 0.2            // 0.30000000000000004
0.1 + 0.2 === 0.3    // false`}
/>

<p>Python prints exactly the same thing. So do Java, C, Go and Rust. This is not a bug in any one language; it is how almost every computer stores numbers with a fractional part.</p>

<h2>Why: binary can’t write 0.1</h2>
<p>
	In everyday decimal, <code>1/3</code> has no exact form. You write 0.3333… and stop somewhere, so it is slightly off. Computers store fractions in
	<strong>binary</strong>, and in binary it is <code>1/10</code> that never ends: 0.000110011001100… forever. The computer keeps the first 53 binary
	digits (the IEEE 754 “double” format) and rounds the rest.
</p>

<Code
	lang="py"
	code={`print(f"{0.1:.20f}")   # 0.10000000000000000555
print(f"{0.2:.20f}")   # 0.20000000000000001110`}
	caption="Ask for more digits and the rounding shows. 0.1 is stored as a number very slightly above 0.1."
/>

<p>
	Add two slightly-off numbers and the result lands one tiny step away from the stored value nearest to 0.3. The printer shows enough digits to tell
	the two apart, so you see <code>0.30000000000000004</code>.
</p>

<h2>Three habits that avoid trouble</h2>
<ol>
	<li>
		<strong>Never compare fractions with ==.</strong> Check whether they are close enough instead: <code>math.isclose(a, b)</code> in Python, or
		<code>Math.abs(a - b) &lt; 1e-9</code> in JavaScript, with a tolerance that suits your numbers.
	</li>
	<li>
		<strong>Keep money in whole units.</strong> Store cents as integers (<code>1999</code>, not <code>19.99</code>), or use a decimal type such as Python’s
		<code>decimal.Decimal</code>. Integers are exact up to a very large size.
	</li>
	<li><strong>Round only for display.</strong> Keep full precision while calculating, and format to two places when you show the result.</li>
</ol>

<Code
	lang="py"
	code={`import math
from decimal import Decimal

math.isclose(0.1 + 0.2, 0.3)          # True
Decimal("0.1") + Decimal("0.2")       # Decimal('0.3')
Decimal(0.1)                          # the float's real value, all 55 digits`}
	caption="Build a Decimal from a string. Building it from a float copies the float’s rounding error."
/>

<Note title="One more edge: very large whole numbers" tone="plain">
	JavaScript stores all its numbers as doubles, so whole numbers are only exact up to 9,007,199,254,740,991 (<code>Number.MAX_SAFE_INTEGER</code>). Past
	that, <code>9007199254740993</code> quietly becomes <code>9007199254740992</code>. Use <code>BigInt</code> for IDs and counters that large.
</Note>

<h2>Why it matters to you</h2>
<p>
	Floating point is fast and precise enough for graphics, physics and statistics. It goes wrong in exactly two places: comparing for equality, and
	adding up money. Avoid those two and you will rarely think about it again.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://docs.python.org/3/tutorial/floatingpoint.html" rel="external">Python tutorial: Floating-point arithmetic, issues and limitations</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER" rel="external">MDN: Number.MAX_SAFE_INTEGER</a></li>
</ul>
