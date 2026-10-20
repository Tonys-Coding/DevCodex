<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>The cost of an import</h2>
<p>
	Every <code>import</code> at the top of a Python file runs that module’s code before your program does anything else. A command-line tool that
	imports a plotting library, a web framework and a database driver pays for all three even when you only ran <code>--help</code>. In big
	applications, start-up time is often mostly imports.
</p>
<p>You can see it yourself. Python prints a timing line for every module it loads with <code>-X importtime</code>:</p>

<Code lang="text" code={`python -X importtime -c "import json"`} caption="The right-hand column shows each module and its imports in microseconds, nested by what pulled them in." />

<h2>What Python 3.15 adds</h2>
<p>
	Python 3.15, released on 9 October 2026, adds a <code>lazy</code> keyword (PEP 810). Put it in front of an import and Python creates a lightweight
	placeholder instead of loading the module. The real import happens the first time the name is used:
</p>

<Code
	lang="py"
	run={false}
	code={`lazy import json
lazy from pathlib import Path

print("Starting up...")              # json and pathlib are not loaded yet

data = json.loads('{"key": "value"}')   # json loads here, on first use
p = Path(".")                            # pathlib loads here`}
	caption="Needs Python 3.15 or later. On older versions, lazy import is a syntax error."
/>

<p>
	Nothing else in the file changes. Code that uses <code>json</code> reads exactly as before; it simply stops paying for modules that a particular
	run never touches.
</p>

<h2>The rules</h2>
<ul>
	<li><strong>Top level only.</strong> <code>lazy</code> works at module scope. Inside a function, a class body or a <code>try</code> block it is a <code>SyntaxError</code>.</li>
	<li><strong>No star imports.</strong> <code>lazy from module import *</code> isn’t allowed, because Python would need to load the module to know the names.</li>
	<li><strong>Errors move.</strong> A missing module now fails where the name is first used, not on the import line. The traceback shows both places.</li>
	<li><strong>Side effects move too.</strong> If a module does something when imported, such as registering plugins, that now happens later, or not at all.</li>
</ul>

<Note title="Trying it on a whole program" tone="tip">
	Run with <code>-X lazy_imports=all</code> (or set <code>PYTHON_LAZY_IMPORTS=all</code>) to make every import lazy without editing code, and
	measure the difference. Libraries that must keep working on older Python can list modules in <code>__lazy_modules__</code> instead, which makes
	ordinary imports of those names lazy on 3.15 and is ignored before it.
</Note>

<h2>Also in 3.15</h2>
<ul>
	<li><strong>UTF-8 by default.</strong> <code>open("notes.txt")</code> now reads and writes UTF-8 on every system, ending a classic Windows bug (PEP 686).</li>
	<li><strong><code>frozendict</code>.</strong> A built-in dictionary that can’t be changed, and can be used as a key or cached safely (PEP 814).</li>
	<li><strong>Unpacking in comprehensions.</strong> <code>[*row for row in rows]</code> flattens a list of lists (PEP 798).</li>
	<li><strong>A sampling profiler.</strong> <code>profiling.sampling</code> watches a running program to show where time goes, with very little slowdown (PEP 799).</li>
</ul>

<h2>Why it matters to you</h2>
<p>
	If you write command-line tools, serverless functions or anything users start often, lazy imports are close to free speed. Measure with
	<code>-X importtime</code>, make the heavy imports lazy, and test the paths where an import might now fail later than it used to.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://docs.python.org/3.15/whatsnew/3.15.html" rel="external">What’s new in Python 3.15</a></li>
	<li><a href="https://peps.python.org/pep-0810/" rel="external">PEP 810: Explicit lazy imports</a></li>
</ul>
