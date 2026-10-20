<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack, practiceFor } from '#lib/content/catalog.js';
	import { cards, unlockHint } from '#lib/content/cards.js';
	import { problemById } from '#lib/content/problems.js';
	import { shorts } from '#lib/content/shorts.js';
	import { levels } from '#lib/content/levels.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { achievements, earned } from '#lib/progress/achievements.js';
	import IsoArt from '#lib/components/IsoArt.svelte';
	import { isoScenes, frames } from '#lib/components/isoScenes.js';
	import Icon from '#lib/components/Icon.svelte';
	import LevelTag from '#lib/components/app/LevelTag.svelte';
	import LessonCard from '#lib/components/app/LessonCard.svelte';
	import CollectCard from '#lib/components/CollectCard.svelte';
	import type { PageProps } from './$types';

	/**
	 * A topic's own page: everything about one topic in one place. Its progress and
	 * next step, the lesson path, the concept cards it unlocks, related practice,
	 * shorts and its achievement.
	 */
	let { data }: PageProps = $props();

	const track = $derived(tracks.find((t) => t.id === data.trackId)!);
	const lessons = $derived(articlesInTrack(data.trackId).filter((a) => a.status === 'live'));
	const finished = $derived(lessons.filter((a) => progress.isDone(a.id)));
	const minutes = $derived(lessons.reduce((n, a) => n + a.minutes, 0));
	const minutesLeft = $derived(lessons.filter((a) => !progress.isDone(a.id)).reduce((n, a) => n + a.minutes, 0));

	/** The next step in this topic: the lesson read most recently, else the first unfinished one (easiest first). */
	const next = $derived.by(() => {
		const reading = lessons
			.filter((a) => !progress.isDone(a.id) && progress.data.reading?.[a.id])
			.sort((a, b) => progress.data.reading![b.id].last.localeCompare(progress.data.reading![a.id].last))[0];
		if (reading) return { article: reading, resume: progress.data.reading![reading.id] };
		const fresh = lessons.find((a) => !progress.isDone(a.id));
		return fresh ? { article: fresh, resume: undefined } : null;
	});

	const topicCards = $derived(cards.filter((c) => c.track === data.trackId));
	const collected = $derived(topicCards.filter((c) => progress.isUnlocked(c)));

	const problems = $derived(
		[...new Set(lessons.flatMap((a) => practiceFor[a.id] ?? []))].map((id) => problemById(id)!).filter(Boolean)
	);
	const solved = $derived(problems.filter((p) => progress.data.solved[p.id]).length);

	const topicShorts = $derived(shorts.filter((s) => lessons.some((a) => a.id === s.articleId)));

	const badge = $derived(
		achievements({ data: progress.data, unlockedCards: progress.unlockedCards.length, bestStreak: progress.bestStreak }).find(
			(a) => a.id === `track-${data.trackId}`
		)
	);

	const byLevel = $derived(levels.map((l) => ({ level: l, count: lessons.filter((a) => a.level === l.id).length })).filter((x) => x.count));
	const hex = '50,4 90,27 90,73 50,96 10,73 10,27';
	let showCards = $state(false);
</script>

<svelte:head>
	<title>{track.title} · Learn · DevCodex</title>
	<meta name="description" content={track.blurb} />
</svelte:head>

<div class="portal t-{track.id}">
	<a class="back" href={resolve('/learn')}><Icon name="arrow-left" size={18} stroke={2} /> All topics</a>

	<!-- Header: the topic's identity, its progress, and the one next step. -->
	<header class="head">
		<div class="art" aria-hidden="true"><span class="art-fit"><IsoArt scene={isoScenes[track.id] ?? []} frame={frames.header} /></span></div>
		<div class="intro">
			<h1>{track.title}</h1>
			<p class="blurb">{track.blurb}</p>
			<p class="levels">
				{#each byLevel as { level, count } (level.id)}
					<span class="lv-{level.id}">{count} {level.label}</span>
				{/each}
			</p>
		</div>

		<dl class="stats">
			<div><dt>Lessons finished</dt><dd><strong>{finished.length}</strong>/{lessons.length}</dd></div>
			<div><dt>Cards collected</dt><dd><strong>{collected.length}</strong>/{topicCards.length}</dd></div>
			{#if problems.length}<div><dt>Problems solved</dt><dd><strong>{solved}</strong>/{problems.length}</dd></div>{/if}
			<div><dt>{minutesLeft ? 'Minutes left' : 'Minutes in all'}</dt><dd><strong>{minutesLeft || minutes}</strong></dd></div>
		</dl>

		<div class="segs" role="img" aria-label="{finished.length} of {lessons.length} lessons finished">
			{#each lessons as a (a.id)}
				<i class="lv-{a.level}" class:on={progress.isDone(a.id)} class:reading={!progress.isDone(a.id) && !!progress.data.reading?.[a.id]} title={a.title}></i>
			{/each}
		</div>

		{#if next}
			<div class="next lv-{next.article.level}">
				<div class="next-text">
					<LevelTag level={next.article.level} />
					<p class="next-title">{next.article.title}</p>
					<p class="next-meta">
						{#if next.resume}
							{next.resume.section ? `Stopped at “${next.resume.section.text}”` : 'Opened, not started'} · {Math.round(next.resume.percent * 100)}% read
						{:else}
							Next in this topic · {next.article.minutes} min
						{/if}
					</p>
				</div>
				<a class="cta" href="{resolve('/learn/[slug]', { slug: next.article.id })}{next.resume?.section ? `#${next.resume.section.id}` : ''}">
					{next.resume ? 'Resume' : finished.length ? 'Continue' : 'Start the topic'}
					<Icon name="arrow-right" size={20} stroke={2} />
				</a>
			</div>
		{:else}
			<p class="all-done"><Icon name="trophy" size={20} stroke={2} /> Every lesson in this topic is collected. Review its cards in Trivia, or revisit any lesson below.</p>
		{/if}
	</header>

	<section class="block" aria-labelledby="path-title">
		<div class="row-head">
			<h2 id="path-title">The path</h2>
			<p class="note">{lessons.length} lessons, easiest first · about {minutes} min in all</p>
		</div>
		<ol class="path">
			{#each lessons as article, i (article.id)}
				<li>
					<LessonCard {article} number={i + 1} index={data.index[article.id]} />
				</li>
			{/each}
		</ol>
	</section>

	<div class="split">
		<section class="block" aria-labelledby="cards-title">
			<div class="row-head">
				<h2 id="cards-title">Concept cards</h2>
				<p class="note"><strong>{collected.length}</strong> of {topicCards.length} collected</p>
			</div>
			<div class="sleeves" class:all={showCards}>
				{#each showCards ? topicCards : topicCards.slice(0, 6) as card (card.id)}
					{@const open = progress.isUnlocked(card)}
					<div class="sleeve">
						<CollectCard
							{card}
							face={open ? 'front' : 'locked'}
							fresh={progress.isNew(card)}
							lockedHint={open ? undefined : unlockHint(card, lessons.find((a) => a.id === card.unlockedBy)?.title ?? 'its lesson')}
						/>
					</div>
				{/each}
			</div>
			{#if topicCards.length > 6}
				<button type="button" class="more" onclick={() => (showCards = !showCards)} aria-expanded={showCards}>
					{showCards ? 'Show fewer' : `Show all ${topicCards.length} cards`} <Icon name="chevron-right" size={18} stroke={2.5} />
				</button>
			{/if}
			{#if collected.length}
				<a class="link" href={resolve('/trivia')}>Review this topic’s cards in Trivia <Icon name="arrow-right" size={16} stroke={2.5} /></a>
			{/if}
		</section>

		<div class="side">
			{#if badge}
				{@const won = earned(badge)}
				<section class="block badge" aria-labelledby="badge-title">
					<h2 id="badge-title">Topic achievement</h2>
					<div class="badge-row">
						<span class="medal" class:won aria-hidden="true">
							<svg viewBox="0 0 100 100">
								<polygon class="base" points={hex} />
								{#if !won}<polygon class="track" points={hex} pathLength="100" stroke-dasharray="{Math.min(1, badge.have / badge.need) * 100} 100" />{/if}
							</svg>
							<span class="ico"><Icon name={badge.icon} size={26} stroke={2} /></span>
						</span>
						<span>
							<span class="b-title">{badge.title}</span>
							<span class="b-goal">{badge.goal}</span>
							<span class="b-state">{won ? 'Earned' : `${Math.min(badge.have, badge.need)} / ${badge.need}`}</span>
						</span>
					</div>
				</section>
			{/if}

			{#if problems.length}
				<section class="block" aria-labelledby="practice-title">
					<h2 id="practice-title">Practice</h2>
					<ul class="rows">
						{#each problems as p (p.id)}
							<li>
								<a href={resolve('/practice/[slug]', { slug: p.id })}>
									<span class="r-title">{p.title}</span>
									<span class="r-meta">
										<span class={p.difficulty.toLowerCase()}>{p.difficulty}</span> · {p.pattern}
										{#if progress.data.solved[p.id]}· <span class="solved">Solved</span>{/if}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if topicShorts.length}
				<section class="block" aria-labelledby="shorts-title">
					<h2 id="shorts-title">Shorts</h2>
					<p class="note">{topicShorts.length} quick {topicShorts.length === 1 ? 'explainer' : 'explainers and quizzes'} from this topic.</p>
					<a class="link" href={resolve('/shorts')}>Watch shorts <Icon name="arrow-right" size={16} stroke={2.5} /></a>
				</section>
			{/if}
		</div>
	</div>
</div>

<style>
	.portal {
		display: grid;
		gap: 2.5rem;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.75rem;
		margin-bottom: -1.5rem;
		color: var(--ink-2);
		font-weight: 700;
		text-decoration: none;
	}

	.back:hover {
		color: var(--ink);
	}

	/* Header */
	.head {
		display: grid;
		gap: 1.25rem;
		padding: 1.25rem;
		border-radius: 28px;
		background: var(--panel);
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--t) 45%, var(--panel-2));
	}

	.art {
		--art-ground: color-mix(in srgb, var(--t) 6%, var(--ground));
		position: relative;
		aspect-ratio: 2 / 1;
		max-height: 9rem;
		border-radius: 14px;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--t) 14%, transparent), transparent 70%),
			var(--art-ground);
	}

	/* The picture fills the art box's fixed shape instead of stretching it. */
	.art-fit {
		position: absolute;
		inset: 0.6rem 0.8rem;
		display: block;
	}

	h1 {
		font-size: clamp(2.1rem, 6vw, 3.3rem);
		font-weight: 800;
		line-height: 1.02;
		letter-spacing: -0.04em;
	}

	.blurb {
		margin-top: 0.5rem;
		max-width: 40rem;
		font-size: 1.2rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.levels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 1.1rem;
		margin-top: 0.6rem;
		font-size: 0.95rem;
		font-weight: 800;
	}

	.levels span {
		color: var(--lv);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.stats div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.15rem;
	}

	.stats dt {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.stats dd {
		margin: 0;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.stats strong {
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
	}

	.segs {
		display: grid;
		grid-auto-flow: column;
		gap: 5px;
	}

	.segs i {
		height: 10px;
		border-radius: 6px;
		background: var(--panel-2);
	}

	.segs i.on {
		background: var(--lv);
	}

	.segs i.reading {
		background: repeating-linear-gradient(-45deg, var(--lv) 0 3px, transparent 3px 7px);
		box-shadow: inset 0 0 0 1.5px var(--lv);
	}

	/* The next step: the only loud element, the track-coloured button. */
	.next {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.next-title {
		margin-top: 0.3rem;
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.next-meta {
		margin-top: 0.2rem;
		color: var(--ink-2);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 3.25rem;
		padding: 0 1.4rem;
		border-radius: 999px;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.12rem;
		text-decoration: none;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.cta:hover {
		transform: translateY(-2px);
	}

	.all-done {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
		color: var(--ink-2);
	}

	.all-done :global(svg) {
		color: var(--gold);
		flex: none;
	}

	/* Sections */
	.row-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.25rem 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.note {
		color: var(--ink-2);
	}

	.note strong {
		font-family: var(--display);
		font-size: 1.2rem;
		color: var(--gold);
	}

	.path {
		display: grid;
		gap: 0.8rem;
		margin-top: 1rem;
	}

	.split {
		display: grid;
		gap: 2.5rem;
	}

	.side {
		display: grid;
		gap: 2.25rem;
		align-content: start;
	}

	.sleeves {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 0.85rem;
		margin-top: 1rem;
		padding: 0.9rem;
		border-radius: 18px;
		background: #0d0b10;
		box-shadow: inset 0 0 0 1px var(--rule);
	}

	.more,
	.link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-top: 0.6rem;
		margin-right: 1.25rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--gold);
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;
	}

	.more[aria-expanded='true'] :global(svg) {
		transform: rotate(-90deg);
	}

	/* Topic achievement */
	.badge-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.8rem;
	}

	.medal {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		width: 4.5rem;
		aspect-ratio: 1;
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
	}

	.won .ico {
		color: var(--gold);
	}

	.badge-row > span:last-child {
		display: grid;
		gap: 0.1rem;
	}

	.b-title {
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 800;
	}

	.b-goal {
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.b-state {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--ink-2);
	}

	/* Practice rows */
	.rows {
		display: grid;
		margin-top: 0.5rem;
	}

	.rows a {
		display: grid;
		gap: 0.1rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
	}

	.rows a:hover .r-title {
		color: var(--t);
	}

	.r-title {
		font-weight: 800;
	}

	.r-meta {
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.easy {
		color: var(--easy);
		font-weight: 700;
	}

	.medium {
		color: var(--medium);
		font-weight: 700;
	}

	.solved {
		color: var(--gold);
		font-weight: 700;
	}

	/* Phones: no art, and the next step sits right under the title, above the numbers. */
	@media (max-width: 559px) {
		.head {
			grid-template-areas:
				'intro'
				'next'
				'segs'
				'stats';
		}

		.art {
			display: none;
		}

		.intro {
			grid-area: intro;
		}

		.next,
		.all-done {
			grid-area: next;
		}

		.segs {
			grid-area: segs;
		}

		.stats {
			grid-area: stats;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.stats strong {
			font-size: 1.6rem;
		}

		.cta {
			width: 100%;
			justify-content: center;
		}
	}

	@media (min-width: 560px) {
		.path {
			grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
			gap: 0.9rem;
		}

		.sleeves {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 900px) {
		.head {
			grid-template-columns: 15rem minmax(0, 1fr);
			grid-template-areas:
				'art intro'
				'stats stats'
				'segs segs'
				'next next';
			column-gap: 2rem;
			padding: 2rem;
		}

		.art {
			grid-area: art;
			max-height: none;
			align-self: start;
		}

		.intro {
			grid-area: intro;
		}

		.stats {
			grid-area: stats;
		}

		.segs {
			grid-area: segs;
		}

		.next,
		.all-done {
			grid-area: next;
		}

		.split {
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			column-gap: 2.75rem;
			align-items: start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta {
			transition: none;
		}
	}
</style>
