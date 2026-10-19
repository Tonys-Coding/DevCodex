<script lang="ts" module>
	export type TraceVar = { name: string; value?: string; ref?: string };
	export type TraceStep = {
		/** 1-based line just executed. */
		line: number;
		note: string;
		vars: TraceVar[];
		heap: { id: string; label: string }[];
		output?: string;
	};
</script>

<script lang="ts">
	import Icon from '../Icon.svelte';

	let { title, code, steps }: { title: string; code: string; steps: TraceStep[] } = $props();
	const uid = $props.id();
	const lines = $derived(code.split('\n'));
	let at = $state(0);
	const step = $derived(steps[at]);

	const ROW = 58;
	const height = $derived(Math.max(step.vars.length, step.heap.length, 1) * ROW + 12);
	const heapY = (id: string) => step.heap.findIndex((h) => h.id === id) * ROW + 10;
</script>

<section class="trace" aria-label={title}>
	<div class="head">
		<h3>{title}</h3>
		<span class="of">Line {step.line} · {at + 1} of {steps.length}</span>
	</div>

	<div class="split">
		<pre class="code" aria-label="Code"><code
				>{#each lines as text, i (i)}<span class="ln" class:now={i + 1 === step.line} class:done={i + 1 < step.line}
						><span class="n" aria-hidden="true">{i + 1}</span>{text || ' '}</span
					>{/each}</code
			></pre>

		<figure class="memory">
			<svg viewBox="0 0 320 {height}" role="img" aria-label="Memory after line {step.line}: {step.vars.map((v) => `${v.name} ${v.ref ? 'points to ' + step.heap.find((h) => h.id === v.ref)?.label : 'is ' + v.value}`).join('; ')}">
				<defs>
					<marker id="{uid}-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
						<path d="M0 0 10 5 0 10z" fill="var(--t)" />
					</marker>
				</defs>
				{#each step.vars as v, i (v.name)}
					{@const y = i * ROW + 10}
					<g transform="translate(6 {y})">
						<rect width="112" height="44" rx="12" class="var" />
						<text x="12" y="27" class="name">{v.name}</text>
						{#if v.ref}
							<circle cx="96" cy="22" r="5" class="dot" />
						{:else}
							<text x="100" y="27" class="val" text-anchor="end">{v.value}</text>
						{/if}
					</g>
					{#if v.ref && heapY(v.ref) >= 10}
						<path d="M102 {y + 32} C 150 {y + 32}, 140 {heapY(v.ref) + 22}, 186 {heapY(v.ref) + 22}" class="arrow" marker-end="url(#{uid}-tip)" />
					{/if}
				{/each}
				{#each step.heap as h, j (h.id)}
					<g transform="translate(190 {j * ROW + 10})">
						<rect width="124" height="44" rx="12" class="obj" />
						<text x="62" y="27" text-anchor="middle" class="objtext">{h.label}</text>
					</g>
				{/each}
			</svg>
			<figcaption>Names on the left, objects on the right.</figcaption>
		</figure>
	</div>

	<p class="note" aria-live="polite">{step.note}</p>
	{#if step.output}<pre class="out"><span>console</span>{step.output}</pre>{/if}

	<div class="controls">
		<button class="round" type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous line">
			<Icon name="arrow-left" stroke={2} />
		</button>
		{#if at < steps.length - 1}
			<button class="next" type="button" onclick={() => at++}>Run next line <Icon name="arrow-right" stroke={2} /></button>
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
		color: var(--ink-3);
		transition: background 200ms ease-out, color 200ms ease-out;
	}

	.ln.done {
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

	.memory {
		margin: 0;
	}

	svg {
		width: 100%;
		max-width: 22rem;
		display: block;
	}

	.var {
		fill: var(--panel-2);
	}

	.name {
		font-family: var(--mono);
		font-size: 15px;
		font-weight: 700;
		fill: var(--ink);
	}

	.val {
		font-family: var(--mono);
		font-size: 15px;
		fill: var(--t);
		font-weight: 700;
	}

	.dot {
		fill: var(--t);
	}

	.arrow {
		fill: none;
		stroke: var(--t);
		stroke-width: 2.5;
	}

	.obj {
		fill: var(--t);
	}

	.objtext {
		font-family: var(--mono);
		font-size: 12.5px;
		font-weight: 700;
		fill: var(--t-ink);
	}

	figcaption {
		margin-top: 0.3rem;
		font-size: 0.8rem;
		color: var(--ink-3);
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
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: start;
		}
	}
</style>
