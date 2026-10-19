<script lang="ts">
	import { resolve } from '$app/paths';
	import { progress } from '../../progress/progress.svelte';
	import { achievements, earned } from '../../progress/achievements';
	import Icon from '../Icon.svelte';

	/**
	 * Achievements as hexagonal medals. `summary` (the dashboard) shows what is earned
	 * as a compact row plus the next three within reach; `full` (the You page) shows them all.
	 */
	let { mode = 'summary', fresh = [] }: { mode?: 'summary' | 'full'; fresh?: string[] } = $props();

	const list = $derived(
		achievements({ data: progress.data, unlockedCards: progress.unlockedCards.length, bestStreak: progress.bestStreak })
			.map((a) => ({ ...a, won: earned(a), ratio: Math.min(1, a.have / a.need) }))
			.sort((a, b) => Number(b.won) - Number(a.won) || b.ratio - a.ratio)
	);
	const won = $derived(list.filter((a) => a.won));
	const next = $derived(list.filter((a) => !a.won).slice(0, 3));

	// Flat-top hexagon on a 100 × 100 box.
	const hex = '50,4 90,27 90,73 50,96 10,73 10,27';
	const toGo = (a: { have: number; need: number }) => a.need - Math.min(a.have, a.need);
</script>

{#snippet medal(a: (typeof list)[number], size: 'sm' | 'lg')}
	<span class="medal {size}" class:won={a.won} aria-hidden="true">
		<svg viewBox="0 0 100 100">
			<polygon class="base" points={hex} />
			{#if !a.won}<polygon class="track" points={hex} pathLength="100" stroke-dasharray="{a.ratio * 100} 100" />{/if}
		</svg>
		<span class="ico"><Icon name={a.icon} size={size === 'sm' ? 22 : 30} stroke={2} /></span>
	</span>
{/snippet}

<section class="medals" id="achievements" aria-labelledby="medals-title">
	<div class="row-head">
		<h2 id="medals-title">Achievements</h2>
		<p class="count"><strong>{won.length}</strong> of {list.length} earned</p>
	</div>

	{#if mode === 'summary'}
		{#if won.length}
			<ul class="earned" aria-label="Earned">
				{#each won as a (a.id)}
					<li class:fresh={fresh.includes(a.id)}>
						{@render medal(a, 'sm')}
						<span class="title">{a.title}</span>
						{#if fresh.includes(a.id)}<span class="new">New</span>{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if next.length}
			<h3>Within reach</h3>
			<ul class="next">
				{#each next as a (a.id)}
					<li>
						{@render medal(a, 'sm')}
						<span class="text">
							<span class="title">{a.title}</span>
							<span class="goal">{a.goal}</span>
							<span class="state">{Math.min(a.have, a.need)} / {a.need}{toGo(a) === 1 ? ' · one to go' : ''}</span>
						</span>
					</li>
				{/each}
			</ul>
		{/if}
		<a class="more" href="{resolve('/you')}#achievements">See all {list.length} achievements <Icon name="arrow-right" size={16} stroke={2.5} /></a>
	{:else}
		<ul class="all">
			{#each list as a (a.id)}
				<li class:won={a.won}>
					{@render medal(a, 'lg')}
					<span class="title">{a.title}</span>
					<span class="goal">{a.goal}</span>
					<span class="state">{a.won ? 'Earned' : `${Math.min(a.have, a.need)} / ${a.need}`}</span>
				</li>
			{/each}
		</ul>
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

	h3 {
		margin-top: 1.4rem;
		font-size: 1.12rem;
		font-weight: 800;
	}

	.count {
		color: var(--ink-2);
		font-weight: 700;
	}

	.count strong {
		font-family: var(--display);
		font-size: 1.35rem;
		color: var(--gold);
	}

	/* Medals */
	.medal {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		aspect-ratio: 1;
	}

	.medal.sm {
		width: 3.5rem;
	}

	.medal.lg {
		width: 5.5rem;
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
		font-weight: 800;
		line-height: 1.15;
	}

	.goal {
		font-size: 0.95rem;
		line-height: 1.4;
		color: var(--ink-2);
	}

	.state {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	/* Summary: earned medals as a compact wrap of small medals with names. */
	.earned {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.25rem;
		margin-top: 1rem;
	}

	.earned li {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		width: 5.5rem;
		text-align: center;
	}

	.earned .title {
		font-size: 0.95rem;
	}

	.earned li.fresh .medal {
		animation: strike 1s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes strike {
		from {
			transform: scale(0.4) rotate(-30deg);
			opacity: 0;
		}
	}

	.new {
		position: absolute;
		top: -0.4rem;
		right: 0;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-size: 0.8rem;
		font-weight: 800;
	}

	.next {
		display: grid;
		gap: 0.2rem;
		margin-top: 0.4rem;
	}

	.next li {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.text {
		display: grid;
		gap: 0.1rem;
	}

	.next .title {
		font-size: 1.05rem;
		color: var(--ink);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-top: 0.6rem;
		color: var(--gold);
		font-weight: 800;
		text-decoration: none;
	}

	.more:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	/* Full gallery */
	.all {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem 1rem;
		margin-top: 1.1rem;
	}

	.all li {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
		text-align: center;
	}

	.all .title {
		font-size: 1.05rem;
	}

	.all li:not(.won) .title {
		color: var(--ink-2);
	}

	.all .won .state {
		color: var(--gold);
	}

	@media (min-width: 560px) {
		.all {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.earned li.fresh .medal {
			animation: none;
		}
	}
</style>
