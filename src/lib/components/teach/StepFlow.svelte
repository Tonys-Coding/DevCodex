<script lang="ts" module>
	export type FlowTile = { id: string; label: string; x: number; y: number; icon: string };
	export type FlowStep = {
		label: string;
		title: string;
		body: string;
		active: string[];
		hop?: { from: string; to: string; message: string };
		wire?: string;
	};

	/** Hand-drawn 24px-grid glyphs for common machines, centred on 0,0. */
	export const glyphs = {
		browser: 'M-14 -10h28v20h-28zM-14 -4h28',
		resolver: 'M-12 -12h24v24h-24zM-7 -5h14M-7 1h14M-7 7h9',
		server: 'M-14 -12h28v7h-28zM-14 -3h28v7h-28zM-14 6h28v7h-28z',
		screen: 'M-15 -12h30v19h-30zM-6 13h12M0 7v6',
		cache: 'M-12 -12h24v24h-24zM-12 -4h24M-12 4h24',
		globe: 'M0 -13a13 13 0 1 0 0.01 0zM-13 0h26M0 -13c-7 7-7 19 0 26M0 -13c7 7 7 19 0 26'
	};
</script>

<script lang="ts">
	import Icon from '../Icon.svelte';

	let { tiles, steps, title }: { tiles: FlowTile[]; steps: FlowStep[]; title: string } = $props();

	const uid = $props.id();
	const W = 120;
	const H = 66;
	let at = $state(0);
	const step = $derived(steps[at]);
	const byId = $derived(Object.fromEntries(tiles.map((t) => [t.id, t])));
	const center = (id: string) => ({ x: byId[id].x + W / 2, y: byId[id].y + H / 2 });

	const arrow = $derived.by(() => {
		if (!step.hop) return undefined;
		const a = center(step.hop.from);
		const b = center(step.hop.to);
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy);
		const diagonal = dx !== 0 && dy !== 0;
		const pad = diagonal ? 62 : Math.abs(dx) > 0 ? W / 2 + 8 : H / 2 + 8;
		// Labels sit in open space: below a horizontal hop, beside a vertical one.
		const lx = diagonal || dx !== 0 ? (a.x + b.x) / 2 : (a.x + b.x) / 2 + (a.x < 180 ? 92 : -92);
		const ly = diagonal || dy !== 0 ? (a.y + b.y) / 2 : (a.y + b.y) / 2 + (a.y < 130 ? 52 : -52);
		return { x1: a.x + (dx / len) * pad, y1: a.y + (dy / len) * pad, x2: b.x - (dx / len) * pad, y2: b.y - (dy / len) * pad, lx, ly };
	});

	const describe = $derived(
		step.hop ? `${byId[step.hop.from].label} sends ${step.hop.message} to ${byId[step.hop.to].label}.` : step.title
	);
</script>

<section class="lab" aria-label={title}>
	<div class="head">
		<h3>Step {at + 1}: {step.title}</h3>
		<span class="of">{at + 1} of {steps.length}</span>
	</div>

	<svg viewBox="0 0 360 260" role="img" aria-label={describe}>
		<defs>
			<marker id="{uid}-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
				<path d="M0 0 10 5 0 10z" fill="var(--t)" />
			</marker>
		</defs>
		{#each tiles as t (t.id)}
			<g class="tile" class:lit={step.active.includes(t.id)} transform="translate({t.x} {t.y})">
				<rect width={W} height={H} rx="16" />
				<path d={t.icon} transform="translate(24 {H / 2}) scale(0.85)" class="ico" />
				<text x="42" y={H / 2 + 5}>{t.label}</text>
			</g>
		{/each}
		{#if arrow && step.hop}
			{#key at}
				<line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} class="shot" marker-end="url(#{uid}-arrow)" />
				<g transform="translate({arrow.lx} {arrow.ly})">
					<g class="chip">
						<rect x={-(step.hop.message.length * 5.4 + 12)} y="-15" width={step.hop.message.length * 10.8 + 24} height="30" rx="15" />
						<text y="5">{step.hop.message}</text>
					</g>
				</g>
			{/key}
		{/if}
	</svg>

	<p class="explain" aria-live="polite">{step.body}</p>
	{#if step.wire}<pre class="wire" aria-label="What travels on the wire">{step.wire}</pre>{/if}

	<div class="controls">
		<div class="dots" aria-hidden="true">
			{#each steps as s, i (i)}<i class:on={i <= at}></i>{/each}
		</div>
		<button class="round" type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous step">
			<Icon name="arrow-left" stroke={2} />
		</button>
		{#if at < steps.length - 1}
			<button class="next" type="button" onclick={() => at++}>
				Next: {steps[at + 1].label} <Icon name="arrow-right" stroke={2} />
			</button>
		{:else}
			<button class="next" type="button" onclick={() => (at = 0)}>
				Replay <Icon name="refresh" stroke={2} />
			</button>
		{/if}
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
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.of {
		flex: none;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	svg {
		display: block;
		width: 100%;
		max-width: 26rem;
		margin: 1rem auto 0.5rem;
	}

	.tile rect {
		fill: var(--panel-2);
		stroke: var(--rule);
		stroke-width: 2;
		transition: fill 250ms ease-out, stroke 250ms ease-out;
	}

	.tile .ico {
		fill: none;
		stroke: var(--ink-3);
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.tile text {
		font-family: var(--display);
		font-weight: 800;
		font-size: 14.5px;
		fill: var(--ink-3);
	}

	.tile.lit rect {
		fill: var(--t);
		stroke: var(--t);
	}

	.tile.lit .ico {
		stroke: var(--t-ink);
	}

	.tile.lit text {
		fill: var(--t-ink);
	}

	.shot {
		stroke: var(--t);
		stroke-width: 7;
		stroke-linecap: round;
		stroke-dasharray: 300;
		stroke-dashoffset: 300;
		animation: shoot 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.chip {
		animation: pop 380ms 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.chip rect {
		fill: var(--ink);
	}

	.chip text {
		text-anchor: middle;
		font-family: var(--mono);
		font-size: 17px;
		font-weight: 700;
		fill: var(--ground);
	}

	@keyframes shoot {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes pop {
		from {
			opacity: 0;
			scale: 0.6;
		}
	}

	.explain {
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.wire {
		margin: 0.8rem 0 0;
		padding: 0.75rem 0.9rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.6;
		white-space: pre-wrap;
		color: var(--ink-2);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 1.1rem;
		flex-wrap: wrap;
	}

	.dots {
		display: flex;
		gap: 6px;
		margin-right: auto;
	}

	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--panel-2);
	}

	.dots i.on {
		background: var(--t);
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

	@media (min-width: 640px) {
		.lab {
			padding: 1.5rem;
		}
	}

	/* Wide article column: diagram on the left, explanation and controls beside it. */
	@container prose (min-width: 46rem) {
		.lab {
			display: grid;
			grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
			grid-template-rows: auto auto auto 1fr;
			column-gap: 2.25rem;
			padding: 1.75rem 2rem;
		}

		.head {
			grid-column: 1 / -1;
		}

		svg {
			grid-column: 1;
			grid-row: 2 / span 3;
			align-self: center;
			max-width: 30rem;
			margin: 1.25rem 0 0.5rem;
		}

		.explain,
		.wire,
		.controls {
			grid-column: 2;
		}

		.explain {
			margin-top: 1.25rem;
			font-size: 1.1rem;
		}

		.controls {
			align-self: end;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shot,
		.chip {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
