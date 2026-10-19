<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack } from '../../content/catalog';
	import { cardsUnlockedBy } from '../../content/cards';
	import { levelById } from '../../content/levels';
	import { progress } from '../../progress/progress.svelte';
	import { cardArt } from '../cardArt';

	/**
	 * Finished lessons as cards slid into the pockets of a binder page. Empty
	 * pockets keep their place, so the page shows what is left to collect.
	 */
	const pockets = $derived(
		tracks.flatMap((track) => articlesInTrack(track.id).filter((a) => a.status === 'live'))
	);
	const collected = $derived(pockets.filter((a) => progress.isDone(a.id)).length);

	const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
</script>

<section class="binder" aria-labelledby="binder-title">
	<div class="row-head">
		<h2 id="binder-title">Lessons collected</h2>
		<p class="count"><strong>{collected}</strong> of {pockets.length}</p>
	</div>

	<ol class="page">
		{#each pockets as lesson, i (lesson.id)}
			{@const at = progress.data.completed[lesson.id]}
			{@const pack = cardsUnlockedBy(lesson.id)}
			<li class="pocket">
				<a
					class="slot t-{lesson.track} lv-{lesson.level}"
					class:filled={!!at}
					href={resolve('/learn/[slug]', { slug: lesson.id })}
					aria-label={at ? `${lesson.title}, collected ${when(at)}` : `${lesson.title}, not collected yet`}
				>
					{#if at}
						<span class="card">
							<span class="top">
								<span class="pips" aria-hidden="true">
									{#each [1, 2, 3] as n (n)}<i class:on={n <= levelById(lesson.level).pips}></i>{/each}
								</span>
								<span>#{String(i + 1).padStart(2, '0')}</span>
							</span>
							<span class="art" aria-hidden="true">
								<svg viewBox="0 0 120 64">{@html pack[0] ? cardArt[pack[0].id] : ''}</svg>
							</span>
							<span class="title">{lesson.title}</span>
							<span class="stamp">{when(at)}</span>
						</span>
					{:else}
						<span class="empty">
							<span class="num">#{String(i + 1).padStart(2, '0')}</span>
							<span class="ghost-title">{lesson.title}</span>
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ol>
	<p class="legend">Every pocket holds one lesson, easiest first in each track. Finish a lesson to slide its card in.</p>
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
		font-variant-numeric: tabular-nums;
	}

	.count strong {
		font-family: var(--display);
		font-size: 1.35rem;
		color: var(--gold);
	}

	/* A binder page: a dark sheet of clear pockets. */
	.page {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.7rem;
		margin-top: 0.9rem;
		padding: 0.8rem;
		border-radius: 18px;
		background: #0d0b10;
		box-shadow: inset 0 0 0 1px var(--rule);
	}

	.slot {
		position: relative;
		display: block;
		height: 100%;
		/* Pockets grow to fit their card; every pocket in a row shares one height. */
		min-height: 9.5rem;
		border-radius: 10px;
		text-decoration: none;
		color: var(--ink);
		overflow: hidden;
	}

	/* The clear plastic of the pocket: a faint edge and a diagonal sheen over whatever sits in it. */
	.slot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07);
		background: linear-gradient(125deg, rgb(255 255 255 / 0.07) 0%, transparent 38%);
		pointer-events: none;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		height: 100%;
		padding: 0.45rem 0.5rem;
		border-radius: inherit;
		border: 2px solid var(--lv);
		background: var(--panel);
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.slot:hover .card {
		transform: translateY(-3px);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.pips {
		display: inline-flex;
		gap: 3px;
	}

	.pips i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		border: 1.5px solid var(--lv);
	}

	.pips i.on {
		background: var(--lv);
	}

	.art {
		display: grid;
		place-items: center;
		aspect-ratio: 2 / 1;
		border-radius: 6px;
		background: color-mix(in srgb, var(--t) 14%, var(--ground));
	}

	.art svg {
		width: 74%;
		overflow: visible;
		fill: none;
		stroke: color-mix(in srgb, var(--t) 75%, var(--ink-2));
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.art :global(.hot) {
		fill: color-mix(in srgb, var(--t) 75%, var(--ink-2));
	}

	.title {
		font-family: var(--display);
		font-size: 0.88rem;
		font-weight: 800;
		line-height: 1.15;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.stamp {
		margin-top: auto;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--gold);
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding: 0.55rem;
		border-radius: inherit;
		border: 1.5px dashed var(--rule);
	}

	.slot:hover .empty {
		border-color: color-mix(in srgb, var(--t) 60%, var(--rule));
	}

	.num {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.ghost-title {
		font-size: 0.8rem;
		line-height: 1.25;
		color: var(--ink-3);
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.legend {
		margin-top: 0.6rem;
		font-size: 0.88rem;
		color: var(--ink-3);
	}

	@media (min-width: 560px) {
		.page {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
