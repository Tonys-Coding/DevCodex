<script lang="ts" module>
	export type StackFrame = {
		/** The call as written, like `factorial(3)`. */
		call: string;
		/** Work this frame still has to finish once the call above it returns, like `3 × ?`. */
		waiting?: string;
		/** Set on the step where this frame hands back its answer. */
		returns?: string;
	};
	export type StackStep = {
		/** 1-based line about to run or just run. */
		line: number;
		note: string;
		/** Bottom of the stack first. */
		frames: StackFrame[];
		output?: string;
	};
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	let { title, code, steps }: { title: string; code: string; steps: StackStep[] } = $props();
	const lines = $derived(code.split('\n'));
	let at = $state(0);
	const step = $derived(steps[at]);
	// Top of the stack is drawn first, like a pile seen from above.
	const shown = $derived(step.frames.map((f, depth) => ({ ...f, depth })).reverse());
	const motion = $derived({ y: -18, duration: prefersReducedMotion.current ? 0 : 260, easing: cubicOut });
	const describe = $derived(
		step.frames.length
			? `Call stack, top first: ${shown.map((f) => f.call + (f.waiting ? `, waiting on ${f.waiting}` : '') + (f.returns ? `, returns ${f.returns}` : '')).join('; ')}`
			: 'The call stack is empty.'
	);
</script>

<section class="trace" aria-label={title}>
	<div class="head">
		<h3>{title}</h3>
		<span class="of">Line {step.line} · {at + 1} of {steps.length}</span>
	</div>

	<div class="split">
		<pre class="code" aria-label="Code"><code
				>{#each lines as text, i (i)}<span class="ln" class:now={i + 1 === step.line}><span class="n" aria-hidden="true">{i + 1}</span>{text || ' '}</span
					>{/each}</code
			></pre>

		<div class="stack" role="img" aria-label={describe}>
			<p class="label">Call stack <span>{step.frames.length} {step.frames.length === 1 ? 'frame' : 'frames'}</span></p>
			<ol aria-hidden="true">
				{#each shown as f, i (f.depth)}
					<li class="frame" class:top={i === 0} transition:fly={motion}>
						<code class="call">{f.call}</code>
						{#if f.returns}
							<span class="ret">returns {f.returns}</span>
						{:else if f.waiting}
							<span class="wait">waiting: {f.waiting}</span>
						{/if}
					</li>
				{:else}
					<li class="empty">Empty. Nothing is running.</li>
				{/each}
			</ol>
			<p class="floor">bottom</p>
		</div>
	</div>

	<p class="note" aria-live="polite">{step.note}</p>
	{#if step.output}<pre class="out"><span>console</span>{step.output}</pre>{/if}

	<div class="controls">
		<button class="round" type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous step">
			<Icon name="arrow-left" stroke={2} />
		</button>
		{#if at < steps.length - 1}
			<button class="next" type="button" onclick={() => at++}>Next step <Icon name="arrow-right" stroke={2} /></button>
		{:else}
			<button class="next" type="button" onclick={() => (at = 0)}>Start over <Icon name="refresh" stroke={2} /></button>
		{/if}
	</div>
</section>

<style>
	.trace {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.of {
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.split {
		display: grid;
		gap: 0.9rem;
		margin-top: 0.9rem;
	}

	.code {
		margin: 0;
		padding: 0.7rem 0;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.75;
		overflow-x: auto;
	}

	.ln {
		display: block;
		padding: 0 0.9rem 0 0;
		color: var(--ink-2);
		transition: background 200ms ease-out, color 200ms ease-out;
	}

	.ln.now {
		background: color-mix(in oklab, var(--t) 22%, transparent);
		color: var(--ink);
	}

	.n {
		display: inline-block;
		width: 2.4rem;
		padding-right: 0.8rem;
		text-align: right;
		color: var(--ink-3);
		user-select: none;
	}

	.stack {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		border-radius: 16px;
		background: var(--ground);
		min-height: 15rem;
	}

	.label {
		display: flex;
		justify-content: space-between;
		font-family: var(--display);
		font-weight: 800;
		font-size: 0.95rem;
	}

	.label span {
		font-family: var(--body);
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	ol {
		display: grid;
		align-content: end;
		gap: 0.4rem;
		flex: 1;
		margin-top: 0.6rem;
	}

	.frame {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.25rem 0.8rem;
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		background: var(--panel-2);
		color: var(--ink);
	}

	.frame.top {
		background: var(--t);
		color: var(--t-ink);
	}

	.call {
		font-family: var(--mono);
		font-weight: 700;
		font-size: 0.88rem;
		background: none;
		padding: 0;
		color: inherit;
	}

	.wait,
	.ret {
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.wait {
		opacity: 0.8;
	}

	.ret {
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
	}

	.empty {
		color: var(--ink-3);
		font-weight: 600;
	}

	.floor {
		margin-top: 0.45rem;
		padding-top: 0.3rem;
		border-top: 2px solid var(--rule);
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.note {
		margin-top: 0.9rem;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.out {
		margin: 0.7rem 0 0;
		padding: 0.6rem 0.85rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		white-space: pre-wrap;
	}

	.out span {
		display: block;
		font-size: 0.8rem;
		color: var(--ink-3);
		font-family: var(--body);
		font-weight: 700;
	}

	.controls {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.round {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		cursor: pointer;
	}

	.round:disabled {
		opacity: 0.35;
	}

	.next {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 3.25rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		border: 0;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		cursor: pointer;
	}

	@media (min-width: 720px) {
		.trace {
			padding: 1.5rem;
		}

		.split {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
			align-items: stretch;
		}
	}
</style>
