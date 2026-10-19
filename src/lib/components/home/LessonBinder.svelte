<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack, liveArticles } from '../../content/catalog';
	import { cardsUnlockedBy } from '../../content/cards';
	import { levelById, levels } from '../../content/levels';
	import { progress } from '../../progress/progress.svelte';
	import { cardArt } from '../cardArt';

	/**
	 * The binder page: one row of clear pockets per track. A finished lesson sits in
	 * its pocket as a card; empty pockets keep their place and say what they hold.
	 * This is also the track progress view, so the dashboard has no separate one.
	 */
	let { fresh = [] }: { fresh?: string[] } = $props();

	const rows = $derived(
		tracks.map((track) => {
			const lessons = articlesInTrack(track.id).filter((a) => a.status === 'live');
			return { track, lessons, done: lessons.filter((a) => progress.isDone(a.id)).length };
		})
	);
	const collected = $derived(liveArticles.filter((a) => progress.isDone(a.id)).length);

	const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
</script>

<section class="binder" aria-labelledby="binder-title">
	<div class="row-head">
		<h2 id="binder-title">Your binder</h2>
		<p class="count"><strong>{collected}</strong> of {liveArticles.length} lessons collected</p>
	</div>

	<div class="page">
		{#each rows as { track, lessons, done } (track.id)}
			<div class="track t-{track.id}">
				<h3><a href={resolve('/learn')}>{track.title}</a> <span>{done}/{lessons.length}</span></h3>
				<ol>
					{#each lessons as lesson, i (lesson.id)}
						{@const at = progress.data.completed[lesson.id]}
						{@const reading = progress.data.reading?.[lesson.id]}
						{@const level = levelById(lesson.level)}
						{@const pack = cardsUnlockedBy(lesson.id)}
						<li>
							<a
								class="slot lv-{lesson.level}"
								class:filled={!!at}
								class:fresh={fresh.includes(lesson.id)}
								href={resolve('/learn/[slug]', { slug: lesson.id })}
							>
								<span class="visually-hidden">
									{lesson.title}, {level.label}, {at ? `collected ${when(at)}` : reading ? `started, ${Math.round(reading.percent * 100)}% read` : 'not started'}.
								</span>
								{#if at}
									<span class="card" aria-hidden="true">
										<span class="top">
											<span class="pips">{#each [1, 2, 3] as n (n)}<i class:on={n <= level.pips}></i>{/each}</span>
											<span>#{i + 1}</span>
										</span>
										<span class="art"><svg viewBox="0 0 120 64">{@html pack[0] ? cardArt[pack[0].id] : ''}</svg></span>
										<span class="title">{lesson.title}</span>
										<span class="stamp">{when(at)}</span>
									</span>
								{:else}
									<span class="empty" class:started={!!reading} aria-hidden="true">
										<span class="top">
											<span class="pips">{#each [1, 2, 3] as n (n)}<i class:on={n <= level.pips}></i>{/each}</span>
											<span>#{i + 1}</span>
										</span>
										<span class="ghost-title">{lesson.title}</span>
										{#if reading}<span class="read"><i style="transform: scaleX({reading.percent})"></i></span>{/if}
										<span class="go">{reading ? 'Resume' : 'Start'} →</span>
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</div>

	<p class="legend">
		Pips show the level:
		{#each levels as l (l.id)}
			<span class="key lv-{l.id}"><span class="pips" aria-hidden="true">{#each [1, 2, 3] as n (n)}<i class:on={n <= l.pips}></i>{/each}</span>{l.label}</span>
		{/each}
	</p>
</section>

<style>
	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
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

	/* A binder page: a dark sheet holding a row of clear pockets per track. */
	.page {
		display: grid;
		gap: 1.1rem;
		margin-top: 0.9rem;
		padding: 0.9rem;
		border-radius: 18px;
		background: #0d0b10;
		box-shadow: inset 0 0 0 1px var(--rule);
	}

	h3 {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		font-size: 1.05rem;
		font-weight: 800;
	}

	h3 a {
		color: var(--t);
		text-decoration: none;
	}

	h3 a:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	h3 span {
		font-variant-numeric: tabular-nums;
		color: var(--ink-2);
	}

	ol {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 0.6rem;
		margin-top: 0.5rem;
	}

	.slot {
		position: relative;
		display: block;
		height: 100%;
		min-height: 10rem;
		border-radius: 10px;
		text-decoration: none;
		color: var(--ink);
	}

	/* The clear plastic of the pocket: a faint edge and a diagonal sheen. */
	.slot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07);
		background: linear-gradient(125deg, rgb(255 255 255 / 0.07) 0%, transparent 38%);
		pointer-events: none;
	}

	.card,
	.empty {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		height: 100%;
		padding: 0.5rem 0.55rem 0.55rem;
		border-radius: inherit;
	}

	.card {
		border: 2px solid var(--lv);
		background: var(--panel);
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.slot:hover .card,
	.slot:focus-visible .card {
		transform: translateY(-3px);
	}

	/* A lesson finished since the last visit slides into its pocket. */
	.fresh .card {
		animation: slide-in 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
		box-shadow: 0 0 0 2px var(--gold), 0 0 22px rgb(255 201 74 / 0.45);
	}

	@keyframes slide-in {
		from {
			transform: translateY(-40%) rotate(-6deg);
			opacity: 0;
		}
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	.pips {
		display: inline-flex;
		gap: 3px;
	}

	.pips i {
		width: 7px;
		height: 7px;
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
		font-size: 0.95rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.stamp {
		margin-top: auto;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--gold);
	}

	.empty {
		border: 1.5px dashed var(--rule);
	}

	.empty.started {
		border-style: solid;
		border-color: color-mix(in srgb, var(--lv) 55%, var(--rule));
	}

	.ghost-title {
		margin-top: auto;
		font-size: 0.95rem;
		line-height: 1.25;
		color: var(--ink-2);
	}

	.read {
		height: 4px;
		border-radius: 3px;
		background: var(--panel-2);
		overflow: hidden;
	}

	.read i {
		display: block;
		height: 100%;
		background: var(--lv);
		transform-origin: left;
	}

	/* What tapping the pocket does: shown on hover and focus, always shown once started. */
	.go {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--t);
		opacity: 0;
		transition: opacity 200ms ease-out;
	}

	.slot:hover .go,
	.slot:focus-visible .go,
	.started .go {
		opacity: 1;
	}

	.slot:hover .empty,
	.slot:focus-visible .empty {
		border-color: var(--t);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 1.1rem;
		margin-top: 0.7rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.key {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 700;
		color: var(--lv);
	}

	/* Touch screens have no hover, so the action always shows there. */
	@media (hover: none) {
		.go {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.go {
			transition: none;
		}

		.fresh .card {
			animation: none;
		}
	}
</style>
