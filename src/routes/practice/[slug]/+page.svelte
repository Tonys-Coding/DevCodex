<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Language } from '#lib/content/types.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { Runner, type RunResult } from '#lib/runner/runner.js';
	import { show } from '#lib/runner/compare.js';
	import CodeEditor from '#lib/components/practice/CodeEditor.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const problem = $derived(data.problem);

	const LANG_KEY = 'devcodex:language';
	let language = $state<Language>('python');
	let code = $state('');
	let result = $state<RunResult | null>(null);
	let running = $state(false);
	let status = $state('');
	let showHint = $state(false);
	let showSolution = $state(false);

	let runner: Runner | undefined;

	onMount(() => {
		try {
			const saved = localStorage.getItem(LANG_KEY);
			if (saved === 'python' || saved === 'javascript') language = saved;
		} catch {
			/* storage blocked: keep the default */
		}
		runner = new Runner();
		runner.onStatus = (text) => (status = text);
	});
	onDestroy(() => runner?.dispose());

	// Load the learner's draft for this problem and language, or the starter code.
	$effect(() => {
		const id = problem.id;
		const lang = language;
		const loaded = progress.loaded;
		untrack(() => {
			code = (loaded && progress.draft(id, lang)) || problem.starter[lang];
			result = null;
			showSolution = false;
		});
	});

	// Save drafts as the learner types (the store debounces writes).
	$effect(() => {
		const current = code;
		untrack(() => {
			if (!progress.loaded || !current) return;
			progress.saveDraft(problem.id, language, current === problem.starter[language] ? undefined : current);
		});
	});

	function pick(next: Language) {
		language = next;
		try {
			localStorage.setItem(LANG_KEY, next);
		} catch {
			/* not essential */
		}
	}

	async function run() {
		if (!runner || running) return;
		running = true;
		result = null;
		status = language === 'python' ? 'Starting Python…' : 'Running tests…';
		const outcome = await runner.run(problem, language, code);
		result = outcome;
		running = false;
		status = '';
		if (outcome.kind === 'done' && outcome.passed === outcome.cases.length) progress.solve(problem.id, language);
	}

	function resetCode() {
		code = problem.starter[language];
		result = null;
	}

	const allPassed = $derived(result?.kind === 'done' && result.passed === result.cases.length);
	const colour = $derived(
		({ 'Arrays & Hashing': 't-structures', 'Two Pointers': 't-web', 'Sliding Window': 't-programming', Stack: 't-structures', 'Binary Search': 't-web', 'Linked List': 't-programming', Trees: 't-structures', Strings: 't-web' } as const)[problem.pattern]
	);
</script>

<svelte:head>
	<title>{problem.title} · Practice · DevCodex</title>
</svelte:head>

<div class="bench {colour}">
	<section class="brief" aria-labelledby="p-title">
		<a class="back" href={resolve('/practice')}><Icon name="arrow-left" size={18} stroke={2} /> Practice</a>
		<h1 id="p-title">{problem.title}</h1>
		<p class="badges meta-row">
			<span class="pattern">{problem.pattern}</span>
			<span class="{problem.difficulty.toLowerCase()}">{problem.difficulty}</span>
			{#if progress.data.solved[problem.id]}<span class="gold"><Icon name="check" size={16} stroke={3} /> Solved</span>{/if}
		</p>
		<p class="statement">{problem.statement}</p>
		<div class="examples">
			{#each problem.examples as ex, i (i)}
				<div class="ex">
					<code>{ex.input}</code>
					<span class="arrow" aria-label="returns"><Icon name="arrow-right" size={16} stroke={2.5} /></span>
					<code class="out">{ex.output}</code>
					{#if ex.note}<span class="note">{ex.note}</span>{/if}
				</div>
			{/each}
		</div>
		<div class="brief-foot">
			<button type="button" class="hintbtn" aria-expanded={showHint} onclick={() => (showHint = !showHint)}>
				<Icon name="spark" size={18} stroke={2} />
				{showHint ? 'Hide hint' : 'Need a hint?'}
			</button>
			<a href={problem.external.url} target="_blank" rel="noreferrer">{problem.external.label} <Icon name="external" size={15} stroke={2} /></a>
		</div>
		{#if showHint}<p class="hint">{problem.hint}</p>{/if}
	</section>

	<section class="work" aria-label="Your solution">
		<div class="tools">
			<div class="langs" role="radiogroup" aria-label="Language">
				<button type="button" role="radio" aria-checked={language === 'python'} onclick={() => pick('python')}>Python</button>
				<button type="button" role="radio" aria-checked={language === 'javascript'} onclick={() => pick('javascript')}>JavaScript</button>
			</div>
			<button type="button" class="ghost" onclick={resetCode}><Icon name="refresh" size={16} stroke={2} /> Reset</button>
		</div>

		<CodeEditor bind:value={code} {language} label="Solution in {language === 'python' ? 'Python' : 'JavaScript'}" onrun={run} />

		<button class="runbtn" type="button" onclick={run} disabled={running}>
			{#if running}
				<span class="spin" aria-hidden="true"></span> {status || 'Running…'}
			{:else}
				<Icon name="play" size={20} stroke={2.5} /> Run {problem.tests.length} tests
			{/if}
		</button>
		<p class="kbd">Shortcut: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> in the editor</p>

		<div class="results" aria-live="polite">
			{#if result?.kind === 'done'}
				<p class="score" class:all={allPassed}>
					<Icon name={allPassed ? 'bolt' : 'info'} size={20} stroke={2.5} />
					{result.passed}/{result.cases.length} tests passed{allPassed ? '. Solved!' : ''}
				</p>
				<ul>
					{#each result.cases as c, i (i)}
						<li class:pass={c.pass}>
							<span class="tick" aria-hidden="true"><Icon name={c.pass ? 'check' : 'close'} size={15} stroke={3} /></span>
							<div class="case">
								<code class="args">{problem.fn[language]}({c.args.map(show).join(', ')})</code>
								{#if c.outcome.ok}
									<span class="got">returned <code>{show(c.outcome.value)}</code>{#if !c.pass}, expected <code>{show(c.expected)}</code>{/if}</span>
								{:else}
									<span class="err">{c.outcome.error}</span>
								{/if}
							</div>
							<span class="visually-hidden">{c.pass ? 'passed' : 'failed'}</span>
						</li>
					{/each}
				</ul>
			{:else if result?.kind === 'error'}
				<p class="score bad"><Icon name="info" size={20} stroke={2.5} /> Your code did not run</p>
				<pre class="errbox">{result.message}</pre>
			{:else if result?.kind === 'timeout'}
				<p class="score bad"><Icon name="clock" size={20} stroke={2.5} /> Stopped after {result.seconds} seconds</p>
				<p class="explain">That usually means an infinite loop: a while condition that never becomes false, or a pointer that never moves.</p>
			{/if}
			{#if result && result.kind !== 'timeout' && result.stdout}
				<pre class="stdout"><span>Printed output</span>{result.stdout}</pre>
			{/if}
		</div>

		<details class="solution" bind:open={showSolution}>
			<summary>Show a reference solution</summary>
			<pre><code>{problem.solution[language]}</code></pre>
		</details>
	</section>
</div>

<style>
	.bench {
		display: grid;
		gap: 1.25rem;
	}

	.brief {
		padding: 1.2rem;
		border-radius: 28px;
		background: var(--panel);
		border: 1px solid var(--rule);
		align-self: start;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.75rem;
		color: var(--ink-2);
		font-weight: 700;
		text-decoration: none;
	}

	h1 {
		margin-top: 0.3rem;
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.badges {
		margin-top: 0.7rem;
	}

	.badges .pattern {
		color: var(--t);
	}

	.badges .easy {
		color: var(--easy);
	}

	.badges .medium {
		color: var(--medium);
	}

	.statement {
		margin-top: 0.9rem;
		font-size: 1.12rem;
		line-height: 1.6;
	}

	.examples {
		display: grid;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.ex {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 0.5rem;
		padding: 0.6rem 0.8rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
	}

	.ex .arrow {
		color: var(--ink-3);
	}

	.ex .out {
		color: var(--t);
		font-weight: 700;
	}

	.ex .note {
		flex-basis: 100%;
		color: var(--ink-3);
		font-size: 0.86rem;
	}

	.brief-foot {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		align-items: center;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.brief-foot a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--ink-2);
		font-size: 0.95rem;
		font-weight: 700;
	}

	.hintbtn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.75rem;
		padding: 0 1rem;
		border-radius: 999px;
		border: 2px solid var(--gold);
		background: none;
		color: var(--gold);
		font-weight: 800;
		cursor: pointer;
	}

	.hint {
		margin-top: 0.8rem;
		padding: 0.8rem 1rem;
		border-radius: 14px;
		background: rgb(255 201 74 / 0.1);
	}

	.work {
		display: grid;
		gap: 0.8rem;
		align-content: start;
		min-width: 0;
	}

	.tools {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
	}

	.langs {
		display: inline-grid;
		grid-auto-flow: column;
		padding: 0.3rem;
		border-radius: 999px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.langs button {
		min-height: 2.6rem;
		padding: 0 1.05rem;
		border-radius: 999px;
		border: 0;
		background: none;
		color: var(--ink-2);
		font-weight: 800;
		cursor: pointer;
	}

	.langs button[aria-checked='true'] {
		background: var(--ink);
		color: var(--ground);
	}

	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.75rem;
		padding: 0 0.95rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink-2);
		font-weight: 700;
		cursor: pointer;
	}

	.runbtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		min-height: 3.6rem;
		border-radius: 999px;
		border: 0;
		background: var(--structures);
		color: #032a21;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.12rem;
		cursor: pointer;
		transition: transform 160ms ease-out;
	}

	.runbtn:active {
		transform: scale(0.98);
	}

	.runbtn:disabled {
		opacity: 0.85;
		cursor: progress;
	}

	.kbd {
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-3);
	}

	kbd {
		padding: 0.05rem 0.35rem;
		border-radius: 6px;
		border: 1px solid var(--rule);
		font-size: 0.8rem;
	}

	.spin {
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 50%;
		border: 3px solid rgb(3 42 33 / 0.3);
		border-top-color: #032a21;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}

	/* The run result, set as a headline-sized line rather than a pill. */
	.score {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.2rem;
	}

	.score.all {
		color: var(--structures);
	}

	.score.bad {
		color: var(--miss);
	}

	.results ul {
		display: grid;
		gap: 0.4rem;
		margin-top: 0.75rem;
	}

	.results li {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		padding: 0.65rem 0.85rem;
		border-radius: 14px;
		background: var(--panel);
		border: 1px solid rgb(255 107 129 / 0.35);
	}

	.results li.pass {
		border-color: var(--rule);
	}

	.tick {
		flex: none;
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		background: var(--miss);
		color: var(--miss-ink);
	}

	.pass .tick {
		background: var(--structures);
		color: #032a21;
	}

	.case {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
		font-size: 0.86rem;
	}

	.args {
		overflow-wrap: anywhere;
	}

	.got {
		color: var(--ink-2);
	}

	.got code {
		color: var(--ink);
		overflow-wrap: anywhere;
	}

	.err {
		color: var(--miss);
		font-family: var(--mono);
		overflow-wrap: anywhere;
	}

	.errbox,
	.stdout {
		margin: 0.7rem 0 0;
		padding: 0.75rem 0.9rem;
		border-radius: 14px;
		background: var(--panel);
		font-size: 0.86rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.errbox {
		color: var(--miss);
	}

	.stdout span {
		display: block;
		margin-bottom: 0.3rem;
		font-family: var(--body);
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.explain {
		margin-top: 0.6rem;
		color: var(--ink-2);
	}

	.solution {
		margin-top: 0.5rem;
		padding: 0.8rem 1rem;
		border-radius: 18px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.solution summary {
		cursor: pointer;
		font-weight: 700;
		color: var(--ink-2);
		min-height: 1.75rem;
	}

	.solution pre {
		margin: 0.8rem 0 0;
		font-size: 0.86rem;
		line-height: 1.6;
		overflow-x: auto;
	}

	@media (min-width: 1000px) {
		.bench {
			grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
			gap: 2rem;
			align-items: start;
		}

		.brief {
			position: sticky;
			top: 5.5rem;
			padding: 1.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spin {
			animation: none;
		}
	}
</style>
