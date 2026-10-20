<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>The problem f-strings can’t solve</h2>
<p>
	An f-string is finished the moment Python reaches it. <code>f"&lt;p&gt;Hello, {'{'}name{'}'}!&lt;/p&gt;"</code> drops whatever is in
	<code>name</code> straight into the text. If <code>name</code> came from a user and holds a <code>&lt;script&gt;</code> tag, the tag is now part of
	your page. The same thing happens with SQL, shell commands and log lines: by the time any library sees the string, it can no longer tell your text
	from the user’s.
</p>

<h2>A template instead of a string</h2>
<p>
	Python 3.14 added <strong>template strings</strong> (PEP 750). Swap the <code>f</code> for a <code>t</code> and you get a
	<code>Template</code> object, not a <code>str</code>. It keeps the pieces apart:
</p>

<Code
	lang="py"
	code={`name = "\x3Cscript>alert(1)\x3C/script>"
greeting = t"<p>Hello, {name}!</p>"

type(greeting).__name__                          # 'Template'
greeting.strings                                 # ('<p>Hello, ', '!</p>')
[i.expression for i in greeting.interpolations]  # ['name']`}
	caption="Each value also keeps its expression text, conversion (!r) and format spec, so a library knows exactly what was written."
/>

<p>
	Nothing has been joined yet. Whoever receives the template decides how each value becomes text, and that is where escaping can happen.
</p>

<h2>Write the processor once</h2>
<p>Iterating a template gives you the literal strings and the values in order. An HTML-safe renderer is a few lines:</p>

<Code
	lang="py"
	run={false}
	code={`from string.templatelib import Template, Interpolation
from html import escape

def html(t: Template) -> str:
    out = []
    for part in t:
        if isinstance(part, Interpolation):
            out.append(escape(str(part.value)))   # values are escaped
        else:
            out.append(part)                      # your own text is trusted
    return "".join(out)

print(html(t"<p>Hello, {name}!</p>"))
# <p>Hello, &lt;script&gt;alert(1)&lt;/script&gt;!</p>`}
/>

<p>
	The same shape works for SQL, where values become parameters instead of text, and for structured logs, where values become fields you can search.
	Libraries can accept a <code>Template</code> and simply refuse a plain <code>str</code>, which makes the unsafe version hard to write by accident.
</p>

<Note title="Not a drop-in for f-strings" tone="warn">
	A template has no useful <code>str()</code>: printing one shows its parts, not finished text. Use t-strings where something should process the
	values, and keep f-strings for everything else.
</Note>

<h2>Why it matters to you</h2>
<ul>
	<li>Expect web frameworks, database drivers and loggers to start accepting templates. Using them closes a whole class of injection bugs.</li>
	<li>It only needs Python 3.14 or later. Older versions treat <code>t"…"</code> as a syntax error.</li>
	<li>Ideas like this exist elsewhere: JavaScript’s tagged templates (<code>html`…`</code>) work the same way.</li>
</ul>

<h2>Sources</h2>
<ul>
	<li><a href="https://peps.python.org/pep-0750/" rel="external">PEP 750: Template Strings</a></li>
	<li><a href="https://docs.python.org/3/library/string.templatelib.html" rel="external">Python docs: string.templatelib</a></li>
	<li><a href="https://docs.python.org/3/whatsnew/3.14.html" rel="external">What’s new in Python 3.14</a></li>
</ul>
