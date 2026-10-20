<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	/**
	 * A binary search tree to grow and walk. Insert numbers (or load a shuffled or a
	 * sorted set to see a balanced and a lopsided tree), then play each traversal and
	 * watch the visit order build up.
	 */
	type T = { value: number; left: T | null; right: T | null };
	type Order = 'in' | 'pre' | 'post' | 'level';

	const presets = {
		shuffled: [50, 30, 70, 20, 40, 60, 80],
		sorted: [10, 20, 30, 40, 50, 60, 70]
	};
	const MAX = 15;

	let values = $state<number[]>([...presets.shuffled]);
	let active = $state<number | null>(null);
	let visited = $state<number[]>([]);
	let playing = $state<Order | null>(null);
	let note = $state('A shuffled set gives a bushy tree. Play a traversal, or load the sorted set and compare the shape.');
	let run = 0;

	function insert(root: T | null, value: number): T {
		if (!root) return { value, left: null, right: null };
		if (value < root.value) root.left = insert(root.left, value);
		else root.right = insert(root.right, value);
		return root;
	}

	const root = $derived(values.reduce<T | null>((r, v) => insert(r, v), null));

	/** x from in-order position (so the picture is sorted left to right), y from depth. */
	const layout = $derived.by(() => {
		const nodes: { value: number; x: number; y: number }[] = [];
		const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
		let i = 0;
		let depth = 0;
		const place = (t: T | null, d: number): { x: number; y: number } | null => {
			if (!t) return null;
			const l = place(t.left, d + 1);
			const me = { x: 30 + i++ * 46, y: 28 + d * 54 };
			const r = place(t.right, d + 1);
			depth = Math.max(depth, d + 1);
			nodes.push({ value: t.value, ...me });
			for (const c of [l, r]) if (c) edges.push({ x1: me.x, y1: me.y, x2: c.x, y2: c.y });
			return me;
		};
		place(root, 0);
		return { nodes, edges, width: Math.max(160, 14 + i * 46), height: 4 + depth * 54, depth };
	});

	function order(kind: Order): number[] {
		const out: number[] = [];
		const walk = (t: T | null) => {
			if (!t) return;
			if (kind === 'pre') out.push(t.value);
			walk(t.left);
			if (kind === 'in') out.push(t.value);
			walk(t.right);
			if (kind === 'post') out.push(t.value);
		};
		if (kind === 'level') {
			const queue = root ? [root] : [];
			while (queue.length) {
				const t = queue.shift()!;
				out.push(t.value);
				if (t.left) queue.push(t.left);
				if (t.right) queue.push(t.right);
			}
		} else walk(root);
		return out;
	}

	const names: Record<Order, string> = { in: 'In-order', pre: 'Pre-order', post: 'Post-order', level: 'Level-order' };
	const rules: Record<Order, string> = {
		in: 'left subtree, then the node, then the right subtree. On a search tree that is sorted order.',
		pre: 'the node first, then its left and right subtrees. Copying a tree uses this order.',
		post: 'both subtrees first, then the node. Deleting a tree, or adding up folder sizes, uses this order.',
		level: 'one level at a time, top to bottom, using a queue.'
	};

	async function play(kind: Order) {
		const me = ++run;
		playing = kind;
		visited = [];
		note = `${names[kind]}: ${rules[kind]}`;
		const wait = prefersReducedMotion.current ? 0 : 520;
		for (const v of order(kind)) {
			if (me !== run) return;
			active = v;
			visited = [...visited, v];
			await new Promise((r) => setTimeout(r, wait));
		}
		if (me !== run) return;
		active = null;
		playing = null;
	}

	function stop() {
		run++;
		active = null;
		playing = null;
		visited = [];
	}

	function load(kind: keyof typeof presets) {
		stop();
		values = [...presets[kind]];
		note =
			kind === 'sorted'
				? 'Inserted in sorted order, every number goes right of the last: the tree is a long line, as slow to search as a linked list.'
				: 'A shuffled set gives a bushy tree: each level holds about twice as many nodes as the one above.';
	}

	function addRandom() {
		stop();
		const free = Array.from({ length: 98 }, (_, k) => k + 1).filter((n) => !values.includes(n));
		const v = free[Math.floor(Math.random() * free.length)];
		values = [...values, v];
		note = `Inserted ${v}: compare with each node from the top, going left when smaller and right when bigger, until there’s an empty spot.`;
	}
</script>

<section class="lab" aria-label="Binary search tree lab">
	<div class="head">
		<h3>A binary search tree</h3>
		<span class="facts">{values.length} nodes · height {layout.depth}</span>
	</div>

	<div class="stage">
		<svg viewBox="0 0 {layout.width} {layout.height}" style="max-width: {layout.width * 1.4}px" role="img" aria-label="Tree with {values.length} nodes and height {layout.depth}. Inserted in this order: {values.join(', ')}">
			{#each layout.edges as e, k (k)}
				<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
			{/each}
			{#each layout.nodes as n (n.value)}
				<g class="node" class:active={n.value === active} class:seen={visited.includes(n.value) && n.value !== active}>
					<circle cx={n.x} cy={n.y} r="19" />
					<text x={n.x} y={n.y}>{n.value}</text>
				</g>
			{/each}
		</svg>
	</div>

	<p class="order" aria-live="polite">
		<span class="order-label">{playing ? names[playing] : visited.length ? 'Visited' : 'Visit order'}</span>
		{#if visited.length}{visited.join(' → ')}{:else}<span class="soft">Pick a traversal below.</span>{/if}
	</p>
	<p class="msg">{note}</p>

	<div class="controls">
		{#each ['in', 'pre', 'post', 'level'] as const as kind (kind)}
			<button class="ghost" class:on={playing === kind} type="button" onclick={() => play(kind)}>{names[kind]}</button>
		{/each}
	</div>
	<div class="controls">
		<button class="ghost small" type="button" onclick={addRandom} disabled={values.length >= MAX}><Icon name="spark" size={16} stroke={2} /> Insert a number</button>
		<button class="ghost small" type="button" onclick={() => load('shuffled')}>Shuffled set</button>
		<button class="ghost small" type="button" onclick={() => load('sorted')}>Sorted set</button>
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

	.facts {
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.stage {
		display: grid;
		place-items: center;
		margin-top: 0.8rem;
		padding: 0.6rem 0;
		border-radius: 16px;
		background: var(--ground);
		overflow-x: auto;
	}

	svg {
		width: 100%;
		height: auto;
		min-width: 18rem;
	}

	line {
		stroke: var(--rule);
		stroke-width: 2.5;
	}

	circle {
		fill: var(--panel-2);
		stroke: color-mix(in srgb, var(--t) 45%, var(--rule));
		stroke-width: 2;
		transition: fill 200ms ease-out;
	}

	text {
		fill: var(--ink);
		font-family: var(--display);
		font-size: 0.95rem;
		font-weight: 800;
		text-anchor: middle;
		dominant-baseline: central;
	}

	.seen circle {
		fill: color-mix(in srgb, var(--t) 28%, var(--panel-2));
	}

	.active circle {
		fill: var(--t);
		stroke: var(--t);
	}

	.active text {
		fill: var(--t-ink);
	}

	.order {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.6rem;
		min-height: 2rem;
		margin-top: 0.8rem;
		font-family: var(--mono);
		font-size: 0.95rem;
		font-weight: 700;
		word-break: break-word;
	}

	.order-label {
		font-family: var(--body);
		color: var(--t);
		font-weight: 800;
	}

	.soft {
		font-family: var(--body);
		font-weight: 400;
		color: var(--ink-3);
	}

	.msg {
		margin-top: 0.5rem;
		padding: 0.75rem 0.95rem;
		border-radius: 14px;
		background: var(--ground);
		line-height: 1.5;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.8rem;
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

	.ghost.small {
		min-height: 2.75rem;
		font-size: 0.95rem;
	}

	.ghost:hover:not(:disabled),
	.ghost.on {
		border-color: var(--t);
	}

	.ghost:disabled {
		color: var(--ink-3);
		cursor: not-allowed;
	}

	@media (min-width: 640px) {
		.lab {
			padding: 1.5rem;
		}
	}
</style>
