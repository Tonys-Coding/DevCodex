<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	let { title = 'Same items, two rules' }: { title?: string } = $props();

	const MAX = 6;
	const names = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let next = $state(0);
	type Item = { id: number; label: string };
	let stack = $state<Item[]>([]);
	let queue = $state<Item[]>([]);
	let outStack = $state<string[]>([]);
	let outQueue = $state<string[]>([]);
	let said = $state('Add a few items, then remove some. Both get exactly the same items in the same order.');

	const ms = $derived(prefersReducedMotion.current ? 0 : 240);
	const full = $derived(stack.length >= MAX);
	// Top of the stack is drawn first.
	const stackShown = $derived([...stack].reverse());

	function add() {
		if (full) return;
		const item = { id: next, label: names[next % names.length] };
		next++;
		stack.push(item);
		queue.push(item);
		said = `Added ${item.label} to both. On the stack it sits on top; in the queue it joins the back.`;
	}

	function remove() {
		if (!stack.length) {
			said = 'Both are empty, so there is nothing to remove. Real code should check for this before removing.';
			return;
		}
		const s = stack.pop()!.label;
		const q = queue.shift()!.label;
		outStack.push(s);
		outQueue.push(q);
		said =
			s === q
				? `Both gave back ${s}.`
				: `The stack gave back ${s}, the newest item it holds. The queue gave back ${q}, the item that has waited longest.`;
	}

	function reset() {
		next = 0;
		stack = [];
		queue = [];
		outStack = [];
		outQueue = [];
		said = 'Cleared. Add a few items, then remove some.';
	}
</script>

<section class="lab" aria-label={title}>
	<h3>{title}</h3>

	<div class="pair">
		<div class="side">
			<p class="name">Stack <span>last in, first out</span></p>
			<ol class="pile" aria-label="Stack, top first">
				{#each stackShown as item, i (item.id)}
					<li class:edge={i === 0} animate:flip={{ duration: ms }} transition:fly={{ y: -16, duration: ms, easing: cubicOut }}>
						{item.label}{#if i === 0}<small>top</small>{/if}
					</li>
				{:else}
					<li class="empty">Empty</li>
				{/each}
			</ol>
			<p class="out">Came out: <code>{outStack.join(' ') || '—'}</code></p>
		</div>

		<div class="side">
			<p class="name">Queue <span>first in, first out</span></p>
			<div class="line-wrap">
				<span class="end" aria-hidden="true">front</span>
				<ol class="line" aria-label="Queue, front first">
					{#each queue as item, i (item.id)}
						<li class:edge={i === 0} animate:flip={{ duration: ms }} transition:fly={{ x: 16, duration: ms, easing: cubicOut }}>{item.label}</li>
					{:else}
						<li class="empty">Empty</li>
					{/each}
				</ol>
				<span class="end" aria-hidden="true">back</span>
			</div>
			<p class="out">Came out: <code>{outQueue.join(' ') || '—'}</code></p>
		</div>
	</div>

	<p class="said" aria-live="polite">{said}</p>

	<div class="controls">
		<button class="ghost" type="button" onclick={reset} aria-label="Clear both">
			<Icon name="refresh" stroke={2} />
		</button>
		<button class="ghost wide" type="button" onclick={remove}>Remove one</button>
		<button class="go" type="button" onclick={add} disabled={full}>{full ? 'Full' : `Add ${names[next % names.length]}`}</button>
	</div>
</section>

<style>
	.lab {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.pair {
		display: grid;
		gap: 0.7rem;
		margin-top: 0.9rem;
	}

	.side {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		border-radius: 16px;
		background: var(--ground);
	}

	.name {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.2rem 0.6rem;
		font-family: var(--display);
		font-weight: 800;
	}

	.name span {
		font-family: var(--body);
		font-size: 0.86rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	li {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 10px;
		background: var(--panel-2);
		color: var(--ink);
		font-family: var(--mono);
		font-weight: 700;
	}

	li.edge {
		background: var(--t);
		color: var(--t-ink);
	}

	li small {
		font-family: var(--body);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	li.empty {
		background: none;
		color: var(--ink-3);
		font-family: var(--body);
		font-weight: 600;
	}

	.pile {
		display: grid;
		align-content: end;
		gap: 0.35rem;
		min-height: 15rem;
		margin: 0.6rem auto 0;
		width: min(11rem, 100%);
		flex: 1;
		padding-bottom: 0.35rem;
		border-bottom: 3px solid var(--rule);
	}

	.pile li {
		height: 2.1rem;
	}

	.line-wrap {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.6rem;
		flex: 1;
	}

	.end {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.line {
		display: flex;
		gap: 0.3rem;
		flex: 1;
		min-height: 2.6rem;
		min-width: 0;
		padding: 0.25rem;
		border-radius: 10px;
		border: 2px dashed var(--rule);
	}

	.line li {
		width: 2.3rem;
		height: 2.1rem;
		flex: none;
	}

	.line li.empty {
		width: auto;
		flex: 1;
	}

	.out {
		margin-top: 0.7rem;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.said {
		margin-top: 0.9rem;
		font-size: 1.05rem;
		line-height: 1.6;
		min-height: 3.4em;
	}

	.controls {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
		margin-top: 0.8rem;
	}

	button {
		display: inline-grid;
		place-items: center;
		min-width: 3.25rem;
		min-height: 3.25rem;
		border-radius: 999px;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		cursor: pointer;
	}

	.ghost {
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
	}

	.wide,
	.go {
		padding: 0 1.2rem;
	}

	.go {
		border: 0;
		background: var(--t);
		color: var(--t-ink);
	}

	.go:disabled {
		opacity: 0.45;
		cursor: default;
	}

	@media (min-width: 720px) {
		.lab {
			padding: 1.5rem;
		}

		.pair {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
		}
	}
</style>
