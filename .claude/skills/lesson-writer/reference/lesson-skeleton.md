# Lesson skeleton

The exact shape of `src/lib/content/articles/<id>.svelte`. Copy it, then replace every `…`. Comments starting `RULE` explain constraints the checker or the app depends on; delete them in the real file. Section names in brackets are yours to write; the fixed ones (Words you will meet, Try it, Common mistakes, Recap, Sources and further reading) keep their exact wording.

```svelte
<script lang="ts">
	// RULE: import only what you use. The lab is imported by the reviewer later.
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<!-- RULE: two short opening paragraphs that start from something the reader already knows. -->
<p>…</p>
<p>…</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>…,</li>
	<li>…, and</li>
	<li>….</li>
</ul>

<h2>Words you will meet</h2>
<!-- RULE: 5 to 8 terms. Each is used later in the Core, first time wrapped in <Term> with this same definition. -->
<dl>
	<div>
		<dt>…</dt>
		<dd>One plain sentence. Code terms in <code>…</code>.</dd>
	</div>
</dl>

<h2>[The idea, in one plain heading]</h2>
<p>
	… <strong><Term def="Same text as in the glossary.">term</Term></strong> …
</p>

<Note title="An everyday picture" tone="plain">
	One everyday comparison that makes the idea click.
</Note>

<h2>Try it</h2>
<p>One paragraph saying what the lab lets the reader do.</p>

<!-- LAB: NameLab: what it shows. Spec in the handoff. -->

<p>Things to try on purpose:</p>
<ol>
	<li>…</li>
	<li>…</li>
	<li>…</li>
</ol>

<!-- RULE: a checkpoint is one question, right after the section it tests. Titles are exact. -->
<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: '…?',
			options: ['…', '…', '…'],
			answer: 1,
			explain: 'Why the right answer is right; why the tempting one is wrong.'
		}
	]}
/>

<h2>[How it works, or why it is fast]</h2>
<!-- RULE: tables always use this wrapper; the first cell of each body row is <th scope="row">. -->
<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">…</th><th scope="col">…</th></tr></thead>
		<tbody>
			<tr><th scope="row">…</th><td>…</td></tr>
		</tbody>
	</table>
</div>

<h2>The code</h2>
<!-- RULE: every sample is run before it goes in; output comments are real output. -->
<Code
	lang="js"
	title="name.js"
	code={`// runnable on its own
console.log(…); // real output`}
/>

<Code
	lang="py"
	title="name.py"
	code={`# runnable on its own
print(…)   # real output`}
	caption="One sentence on what to notice."
/>

<Note title="[A real pitfall]" tone="warn">
	…
</Note>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{ prompt: '…?', options: ['…', '…'], answer: 0, explain: '…' }
	]}
/>

<h2>Where it shows up</h2>
<ul>
	<li><strong>…</strong> …</li>
</ul>

<h2>Common mistakes</h2>
<ul>
	<li><strong>….</strong> …</li>
</ul>

<h2>Recap</h2>
<ul>
	<li>…</li>
</ul>

<!-- RULE: the final Core check has exactly 5 questions and no title (it defaults to "Quick check"). -->
<Quiz
	questions={[
		{ prompt: '…', options: ['…', '…', '…'], answer: 2, explain: '…' },
		{ prompt: '…', options: ['…', '…'], answer: 0, explain: '…' },
		{ prompt: '…', options: ['…', '…', '…'], answer: 1, explain: '…' },
		{ prompt: '…', options: ['…', '…', '…'], answer: 0, explain: '…' },
		{ prompt: '…', options: ['…', '…', '…'], answer: 1, explain: '…' }
	]}
/>

<!-- RULE: exactly one CorePack, between the Core and the layers. -->
<CorePack />

<!-- RULE: one deeper layer and one hood layer, in this order, each with <h2> sections. -->
<Layer depth="deeper" summary="One sentence listing what is inside.">
<h2>…</h2>
<p>…</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[{ prompt: '…', options: ['…', '…', '…'], answer: 1, explain: '…' }]}
/>

<h2>…</h2>
<p>…</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[{ prompt: '…', options: ['…', '…', '…'], answer: 0, explain: '…' }]}
/>
</Layer>

<Layer depth="hood" summary="One sentence listing what is inside.">
<h2>…</h2>
<p>…</p>

<h2>Recap: [the layer in one phrase]</h2>
<ol>
	<li>…</li>
</ol>

<!-- RULE: the last check in the hood is titled exactly "Under the hood check", 4 or 5 questions. -->
<Quiz
	title="Under the hood check"
	questions={[
		{ prompt: '…', options: ['…', '…', '…'], answer: 1, explain: '…' },
		{ prompt: '…', options: ['…', '…'], answer: 0, explain: '…' },
		{ prompt: '…', options: ['…', '…', '…'], answer: 2, explain: '…' },
		{ prompt: '…', options: ['…', '…', '…'], answer: 1, explain: '…' }
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://…" rel="external">Primary source: title</a></li>
</ul>
</Layer>
```

## Other teaching components you may use

Only when they genuinely help; most lessons need none of them.

- `Choice` (`../../components/teach/Choice.svelte`): tabs comparing options.
  - Props: `title`, `options: { label, body, code?, lang?, verdict? }[]`, `codeLabels?`.
  - Good for "which would you pick?".
- `CodeTrace`: step through code with a memory view.
  - Props: `title`, `code`, and `steps: { line, note, vars: { name, value?, ref? }[], heap: { id, label }[], output? }[]`.
  - Good for showing references and frames.
- `StepFlow`: a step-by-step network or system diagram.
  - Props: `title`, `tiles: { id, label, x, y, icon }[]`, and `steps: { label, title, body, active: string[], hop?: { from, to, message }, wire? }[]`.
  - Copy an existing use in `load-a-page.svelte` for layout values.
- `Diagram`: a sysketch SVG rendered by `npm run diagrams` from a YAML spec in `src/lib/content/diagrams/` (see the README there).
  - Props: `name`, `alt`, `caption?`.

## Card entry

```ts
{
	id: 'kebab-id',
	term: 'Two to four words',
	track: 'structures',
	question: 'A question the lesson answers?',
	answer: 'Short answer',
	detail: 'One or two sentences that teach the why.',
	unlockedBy: 'lesson-id',
	// layer: 'deeper',  // bonus cards only; then level 2. For 'hood', level 3.
	level: 1
}
```

## Card art entry

```ts
'kebab-id': '<rect x="40" y="20" width="40" height="24" rx="4"/><circle class="hot" cx="60" cy="32" r="5"/>',
```
