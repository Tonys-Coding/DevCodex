<script lang="ts" module>
	export type LoopStep = {
		line?: number;
		note: string;
		stack: string[];
		apis: string[];
		micro: string[];
		tasks: string[];
		out: string[];
	};
</script>

<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	let { code, steps }: { code: string; steps: LoopStep[] } = $props();
	const lines = $derived(code.split('\n'));
	let at = $state(0);
	const step = $derived(steps[at]);

	// Chips with the same label fly between lanes instead of blinking.
	const [send, receive] = crossfade({
		duration: () => (prefersReducedMotion.current ? 0 : 450),
		easing: cubicOut
	});

	const lanes = $derived([
		{ id: 'stack', title: 'Call stack', items: [...step.stack].reverse(), hint: 'Runs now, top first' },
		{ id: 'apis', title: 'Web APIs', items: step.apis, hint: 'Browser is waiting' },
		{ id: 'micro', title: 'Microtasks', items: step.micro, hint: 'Run before any task' },
		{ id: 'tasks', title: 'Task queue', items: step.tasks, hint: 'One per loop turn' }
	]);
</script>

<section class="sim" aria-label="Event loop, step by step">
	<div class="head">
		<h3>Watch the loop</h3>
		<span class="of">{at + 1} of {steps.length}</span>
	</div>

	<pre class="code" aria-label="Code"><code
			>{#each lines as text, i (i)}<span class="ln" class:now={i + 1 === step.line}><span class="n" aria-hidden="true">{i + 1}</span>{text || ' '}</span
				>{/each}</code
		></pre>

	<div class="lanes">
		{#each lanes as lane (lane.id)}
			<div class="lane {lane.id}">
				<p class="lane-title">{lane.title}</p>
				<ul aria-label={lane.title}>
					{#each lane.items as item (item)}
						<li in:receive={{ key: item }} out:send={{ key: item }}>{item}</li>
					{:else}
						<li class="empty">{lane.hint}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div class="console" aria-label="Console output">
		<span>Console</span>
		<code>{step.out.length ? step.out.join('  ') : '—'}</code>
	</div>

	<p class="note" aria-live="polite">{step.note}</p>

	<div class="controls">
		<button class="round" type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous step">
			<Icon name="arrow-left" stroke={2} />
		</button>
		{#if at < steps.length - 1}
			<button class="next" type="button" onclick={() => at++}>Next tick <Icon name="arrow-right" stroke={2} /></button>
		{:else}
			<button class="next" type="button" onclick={() => (at = 0)}>Start over <Icon name="refresh" stroke={2} /></button>
		{/if}
	</div>
</section>

<style>
	.sim {
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

	.code {
		margin: 0.9rem 0 0;
		padding: 0.6rem 0;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.75;
		overflow-x: auto;
	}

	.ln {
		display: block;
		padding-right: 0.9rem;
		color: var(--ink-2);
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

	.lanes {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
		margin-top: 0.9rem;
	}

	.lane {
		padding: 0.65rem;
		border-radius: 16px;
		background: var(--ground);
		min-height: 7.5rem;
	}

	.lane-title {
		font-family: var(--display);
		font-weight: 800;
		font-size: 0.95rem;
		margin-bottom: 0.45rem;
	}

	.lane ul {
		display: grid;
		gap: 0.35rem;
	}

	.lane li {
		padding: 0.35rem 0.6rem;
		border-radius: 10px;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.lane.apis li {
		background: var(--panel-2);
		color: var(--ink);
	}

	.lane.micro li {
		background: var(--gold);
		color: #1d1400;
	}

	.lane li.empty {
		background: none;
		color: var(--ink-3);
		font-family: var(--body);
		font-weight: 600;
		padding: 0;
	}

	.console {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		margin-top: 0.7rem;
		padding: 0.6rem 0.85rem;
		border-radius: 14px;
		background: var(--ground);
	}

	.console span {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.console code {
		font-size: 0.88rem;
		font-weight: 700;
	}

	.note {
		margin-top: 0.9rem;
		font-size: 1.05rem;
		line-height: 1.6;
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
		.sim {
			padding: 1.5rem;
		}

		.lanes {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
