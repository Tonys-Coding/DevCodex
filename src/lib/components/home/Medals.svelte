<script lang="ts">
	import { progress } from '../../progress/progress.svelte';
	import { achievements, earned } from '../../progress/achievements';
	import Icon from '../Icon.svelte';

	/** Achievements as hexagonal medals: struck in gold once earned, outlined with progress until then. */
	let showAll = $state(false);

	const list = $derived(
		achievements({ data: progress.data, unlockedCards: progress.unlockedCards.length, bestStreak: progress.bestStreak })
			// Earned first, then the ones closest to done.
			.map((a) => ({ ...a, won: earned(a), ratio: Math.min(1, a.have / a.need) }))
			.sort((a, b) => Number(b.won) - Number(a.won) || b.ratio - a.ratio)
	);
	const won = $derived(list.filter((a) => a.won).length);
	const shown = $derived(showAll ? list : list.slice(0, 8));

	// Flat-top hexagon on a 100 × 100 box.
	const hex = '50,4 90,27 90,73 50,96 10,73 10,27';
</script>

<section class="medals" aria-labelledby="medals-title">
	<div class="row-head">
		<h2 id="medals-title">Achievements</h2>
		<p class="count"><strong>{won}</strong> of {list.length} earned</p>
	</div>

	<ul>
		{#each shown as a (a.id)}
			<li class:won={a.won}>
				<span class="medal" aria-hidden="true">
					<svg viewBox="0 0 100 100">
						<polygon class="base" points={hex} />
						{#if !a.won}
							<!-- Progress runs round the edge of the hexagon. -->
							<polygon class="track" points={hex} pathLength="100" stroke-dasharray="{a.ratio * 100} 100" />
						{/if}
					</svg>
					<span class="ico"><Icon name={a.icon} size={30} stroke={2} /></span>
				</span>
				<span class="title">{a.title}</span>
				<span class="goal">{a.goal}</span>
				<span class="state">
					{#if a.won}Earned{:else}{Math.min(a.have, a.need)} / {a.need}{/if}
				</span>
			</li>
		{/each}
	</ul>

	{#if list.length > 8}
		<button type="button" class="more" onclick={() => (showAll = !showAll)} aria-expanded={showAll}>
			{showAll ? 'Show fewer' : `Show all ${list.length} achievements`}
			<Icon name="chevron-right" size={18} stroke={2.5} />
		</button>
	{/if}
</section>

<style>
	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.count {
		color: var(--ink-3);
		font-weight: 700;
	}

	.count strong {
		font-family: var(--display);
		font-size: 1.35rem;
		color: var(--gold);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem 1rem;
		margin-top: 1.1rem;
	}

	li {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
		text-align: center;
	}

	.medal {
		position: relative;
		display: grid;
		place-items: center;
		width: 5.5rem;
		aspect-ratio: 1;
		margin-bottom: 0.3rem;
	}

	.medal svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.base {
		fill: var(--panel);
		stroke: var(--rule);
		stroke-width: 3;
		stroke-dasharray: 5 5;
	}

	.track {
		fill: none;
		stroke: var(--ink-3);
		stroke-width: 4;
		stroke-linecap: round;
	}

	.ico {
		position: relative;
		color: var(--ink-3);
	}

	.won .base {
		fill: rgb(255 201 74 / 0.14);
		stroke: var(--gold);
		stroke-width: 4;
		stroke-dasharray: none;
		filter: drop-shadow(0 0 10px rgb(255 201 74 / 0.35));
	}

	.won .ico {
		color: var(--gold);
	}

	.title {
		font-family: var(--display);
		font-size: 1.05rem;
		font-weight: 800;
		line-height: 1.15;
	}

	li:not(.won) .title {
		color: var(--ink-2);
	}

	.goal {
		font-size: 0.88rem;
		line-height: 1.35;
		color: var(--ink-3);
	}

	.state {
		font-size: 0.8rem;
		font-weight: 800;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.won .state {
		color: var(--gold);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-top: 1rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--gold);
		font-weight: 800;
		cursor: pointer;
	}

	.more[aria-expanded='true'] :global(svg) {
		transform: rotate(-90deg);
	}

	@media (min-width: 560px) {
		ul {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
