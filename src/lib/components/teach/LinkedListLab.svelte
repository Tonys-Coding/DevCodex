<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	/**
	 * A linked list to poke at: adding at the front takes one step, while adding at the
	 * end or finding a value walks the chain node by node, and the walk is shown.
	 */
	const MAX = 7;
	const pool = ['D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'P', 'R'];
	let nodes = $state<{ id: number; value: string }[]>([
		{ id: 1, value: 'A' },
		{ id: 2, value: 'B' },
		{ id: 3, value: 'C' }
	]);
	let nextId = 4;
	let nextValue = 0;
	let visiting = $state(-1);
	let fresh = $state(-1);
	let busy = $state(false);
	let steps = $state<number | null>(null);
	let message = $state('Each node holds a value and an arrow to the next node. The list only knows where its head is.');

	const label = () => pool[nextValue++ % pool.length];
	const sleep = (ms: number) => new Promise((r) => setTimeout(r, prefersReducedMotion.current ? 0 : ms));

	/** Walks from the head to index `to`, lighting each node on the way. */
	async function walk(to: number) {
		for (let k = 0; k <= to; k++) {
			visiting = k;
			await sleep(380);
		}
	}

	async function addFront() {
		const value = label();
		const id = nextId++;
		nodes = [{ id, value }, ...nodes];
		fresh = id;
		steps = 1;
		message = `Added ${value} at the front: it points at the old head, and becomes the new head. One step, however long the list is.`;
	}

	async function addEnd() {
		busy = true;
		const n = nodes.length;
		if (n) await walk(n - 1);
		const value = label();
		const id = nextId++;
		nodes = [...nodes, { id, value }];
		fresh = id;
		visiting = -1;
		steps = n + 1;
		message = `Added ${value} at the end. With no shortcut to the tail, the list walked past all ${n} node${n === 1 ? '' : 's'} first.`;
		busy = false;
	}

	function removeFront() {
		const [gone, ...rest] = nodes;
		nodes = rest;
		fresh = -1;
		steps = 1;
		message = rest.length
			? `Removed ${gone.value}: the head now points at ${rest[0].value}. One step.`
			: `Removed ${gone.value}. The list is empty: the head points at null.`;
	}

	async function find() {
		busy = true;
		const k = Math.floor(Math.random() * nodes.length);
		const value = nodes[k].value;
		message = `Looking for ${value}, starting at the head…`;
		await walk(k);
		steps = k + 1;
		message = `Found ${value} after visiting ${k + 1} node${k === 0 ? '' : 's'}. There is no index to jump to: you follow the arrows.`;
		busy = false;
		await sleep(900);
		visiting = -1;
	}
</script>

<section class="lab" aria-label="Linked list lab">
	<div class="head">
		<h3>A linked list</h3>
		{#if steps !== null}<span class="steps">Last action: {steps} step{steps === 1 ? '' : 's'}</span>{/if}
	</div>

	<ol class="chain" aria-label="Nodes from head to end">
		<li class="label" aria-hidden="true">head</li>
		{#each nodes as node, k (node.id)}
			<li class="node" class:visit={k === visiting} class:fresh={node.id === fresh}>
				<span class="value">{node.value}</span>
				<span class="next" aria-hidden="true"></span>
				<span class="visually-hidden">{k === visiting ? 'visiting' : ''}</span>
			</li>
			<li class="arrow" aria-hidden="true">→</li>
		{/each}
		<li class="null">null</li>
	</ol>

	<p class="msg" aria-live="polite">{message}</p>

	<div class="controls">
		<button class="ghost" type="button" onclick={addFront} disabled={busy || nodes.length >= MAX}>Add to front</button>
		<button class="ghost" type="button" onclick={addEnd} disabled={busy || nodes.length >= MAX}>Add to end</button>
		<button class="ghost" type="button" onclick={removeFront} disabled={busy || !nodes.length}>Remove front</button>
		<button class="ghost" type="button" onclick={find} disabled={busy || !nodes.length}><Icon name="search" size={18} stroke={2} /> Find a value</button>
	</div>
	{#if nodes.length >= MAX}<p class="hint">That’s a full lab. Remove one to add more.</p>{/if}
</section>

<style>
	.lab {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.25rem 1rem;
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.steps {
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.chain {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.35rem;
		min-height: 4.5rem;
		margin-top: 1rem;
	}

	.label,
	.null {
		font-family: var(--mono);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.label {
		margin-right: 0.2rem;
		color: var(--t);
	}

	/* A node: the value, then a small "next" slot the arrow leaves from. */
	.node {
		display: grid;
		grid-template-columns: auto 0.9rem;
		align-items: stretch;
		height: 3rem;
		border-radius: 14px;
		background: var(--panel-2);
		overflow: hidden;
		transition: background 200ms ease-out, color 200ms ease-out;
	}

	.value {
		display: grid;
		place-items: center;
		min-width: 2.6rem;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
	}

	.next {
		border-left: 2px solid var(--ground);
		background: color-mix(in srgb, var(--t) 30%, var(--panel-2));
	}

	.visit {
		background: var(--t);
		color: var(--t-ink);
	}

	.fresh {
		box-shadow: inset 0 0 0 2px var(--gold);
		animation: drop-in 400ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes drop-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
	}

	.arrow {
		color: var(--ink-3);
		font-weight: 800;
	}

	.msg {
		margin-top: 0.8rem;
		padding: 0.75rem 0.95rem;
		border-radius: 14px;
		background: var(--ground);
		line-height: 1.5;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 3rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		cursor: pointer;
	}

	.ghost:hover:not(:disabled) {
		border-color: var(--t);
	}

	.ghost:disabled {
		color: var(--ink-3);
		cursor: not-allowed;
	}

	.hint {
		margin-top: 0.5rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	@media (min-width: 640px) {
		.lab {
			padding: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fresh {
			animation: none;
		}
	}
</style>
