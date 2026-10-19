<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, liveArticles, articlesInTrack, articleById } from '#lib/content/catalog.js';
	import { cards, cardsUnlockedBy } from '#lib/content/cards.js';
	import { problems } from '#lib/content/problems.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import CollectCard from '#lib/components/CollectCard.svelte';
	import LevelTag from '#lib/components/app/LevelTag.svelte';
	import Greeting from '#lib/components/home/Greeting.svelte';
	import LessonBinder from '#lib/components/home/LessonBinder.svelte';
	import Medals from '#lib/components/home/Medals.svelte';

	const started = (id: string) => !!progress.data.reading?.[id];

	/** The featured lesson: the next one on the path that hasn't been started; failing that, the next unfinished one. */
	const featured = $derived(
		liveArticles.find((a) => !progress.isDone(a.id) && !started(a.id)) ?? liveArticles.find((a) => !progress.isDone(a.id))
	);
	const featuredCards = $derived(featured ? cardsUnlockedBy(featured.id) : []);

	const continuing = $derived(
		progress.inProgress
			.map(({ id, reading }) => ({ article: articleById(id), reading }))
			.filter((x) => x.article && x.article.status === 'live' && x.article.id !== featured?.id)
			.slice(0, 3)
	);

	const finished = $derived(liveArticles.filter((a) => progress.isDone(a.id)));
	const minutes = $derived(finished.reduce((n, a) => n + a.minutes, 0));
	const solved = $derived(Object.keys(progress.data.solved).length);
	const newCount = $derived(progress.unlockedCards.filter((c) => progress.isNew(c)).length);
	const recentCards = $derived(progress.unlockedCards.slice(-5));
	let showCards = $state(false);
</script>

<svelte:head>
	<title>DevCodex: learn software engineering, one card at a time</title>
</svelte:head>

<div class="dash">
	<div class="greet"><Greeting /></div>

	<dl class="stats">
		<div><dt>Lessons</dt><dd><strong>{finished.length}</strong>/{liveArticles.length}</dd></div>
		<div><dt>Cards</dt><dd><strong>{progress.unlockedCards.length}</strong>/{cards.length}</dd></div>
		<div><dt>Problems</dt><dd><strong>{solved}</strong>/{problems.length}</dd></div>
		<div>
			<dt>Day streak</dt>
			<dd class="streak"><Icon name="flame" size={22} stroke={2} /><strong>{progress.streak}</strong></dd>
		</div>
		<div><dt>Minutes learned</dt><dd><strong>{minutes}</strong></dd></div>
	</dl>

	<div class="feature">
		{#if featured}
			<section class="quest t-{featured.track}" aria-labelledby="quest-title">
				<div class="quest-text">
					<LevelTag level={featured.level} solid />
					<h2 id="quest-title">{featured.title}</h2>
					<p class="quest-sub">{featured.summary}</p>
					<p class="quest-meta">Featured for you · {featured.minutes} min · {featuredCards.length} cards inside</p>
					<a class="cta" href={resolve('/learn/[slug]', { slug: featured.id })}>
						{started(featured.id) ? 'Keep reading' : 'Start this lesson'}
						<Icon name="arrow-right" size={20} stroke={2} />
					</a>
				</div>
				<div class="fan" aria-hidden="true">
					{#each featuredCards as card, i (card.id)}
						<div class="fan-card" style="--i: {i - (featuredCards.length - 1) / 2}">
							<CollectCard {card} face="back" tilt={false} />
						</div>
					{/each}
				</div>
			</section>
		{:else}
			<section class="quest" aria-labelledby="quest-title">
				<div class="quest-text">
					<h2 id="quest-title">Every lesson collected</h2>
					<p class="quest-sub">You have finished every lesson written so far. Keep your cards sharp in Trivia while new ones are on the way.</p>
					<a class="cta" href={resolve('/trivia')}>Play the deck <Icon name="arrow-right" size={20} stroke={2} /></a>
				</div>
			</section>
		{/if}
	</div>

	<section class="continue" aria-labelledby="continue-title">
		<h2 id="continue-title">Pick up where you left off</h2>
		{#if continuing.length}
			<ul>
				{#each continuing as { article, reading } (article!.id)}
					{@const a = article!}
					<li class="t-{a.track} lv-{a.level}">
						<LevelTag level={a.level} />
						<a class="c-title" href="{resolve('/learn/[slug]', { slug: a.id })}{reading.section ? `#${reading.section.id}` : ''}">{a.title}</a>
						<p class="c-where">
							{reading.section ? `Stopped at “${reading.section.text}”` : 'Opened, not started yet'}
						</p>
						<div class="bar" role="progressbar" aria-label="{a.title} read" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(reading.percent * 100)}>
							<span style="transform: scaleX({reading.percent})"></span>
						</div>
						<p class="c-pct">{Math.round(reading.percent * 100)}% read</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">
				{finished.length
					? 'Nothing half-read. Start the featured lesson and it will wait for you here.'
					: 'Lessons you open but don’t finish wait for you here, at the section where you stopped.'}
			</p>
		{/if}
	</section>

	<div class="binder"><LessonBinder /></div>

	<section class="tracks" aria-labelledby="tracks-title">
		<div class="row-head">
			<h2 id="tracks-title">Tracks</h2>
			<a href={resolve('/learn')} class="small-link">All lessons <Icon name="arrow-right" size={16} stroke={2} /></a>
		</div>
		<ul>
			{#each tracks as track (track.id)}
				{@const list = articlesInTrack(track.id).filter((a) => a.status === 'live')}
				{@const done = list.filter((a) => progress.isDone(a.id)).length}
				<li class="t-{track.id}">
					<div class="track-top">
						<h3>{track.title}</h3>
						<span class="frac">{done}/{list.length}</span>
					</div>
					<div class="segs" aria-label="{done} of {list.length} lessons finished">
						{#each list as a (a.id)}
							<span class="lv-{a.level}" class:on={progress.isDone(a.id)} class:reading={!progress.isDone(a.id) && started(a.id)} title="{a.title}"></span>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
		<p class="seg-key">Each segment is a lesson, filled in its level colour once finished. Striped means started.</p>
	</section>

	<div class="medals"><Medals /></div>

	<section class="cards" aria-labelledby="cards-title">
		<div class="row-head">
			<h2 id="cards-title">Your cards</h2>
			<p class="count"><strong>{progress.unlockedCards.length}</strong> of {cards.length} collected</p>
		</div>
		<div class="cards-body">
			<div class="hand" aria-hidden="true">
				{#each recentCards as card, i (card.id)}
					<div class="hand-card" style="--i: {i - (recentCards.length - 1) / 2}">
						<CollectCard {card} fresh={progress.isNew(card)} tilt={false} />
					</div>
				{/each}
			</div>
			<div class="review">
				<p>
					{newCount
						? `${newCount} new ${newCount === 1 ? 'card is' : 'cards are'} waiting in your trivia deck.`
						: 'Keep what you learned fresh: a few swipes through the deck is enough.'}
				</p>
				<a class="cta dark" href={resolve('/trivia')}>Play the deck <Icon name="arrow-right" size={20} stroke={2} /></a>
				<button type="button" class="more" onclick={() => (showCards = !showCards)} aria-expanded={showCards} aria-controls="all-cards">
					{showCards ? 'Hide the collection' : `Show all ${cards.length} cards`}
					<Icon name="chevron-right" size={18} stroke={2.5} />
				</button>
			</div>
		</div>
		{#if showCards}
			<div class="sleeves" id="all-cards">
				{#each cards as card (card.id)}
					{@const open = progress.isUnlocked(card)}
					<div class="sleeve">
						<CollectCard
							{card}
							face={open ? 'front' : 'locked'}
							fresh={progress.isNew(card)}
							lockedHint={open ? undefined : `Finish “${articleById(card.unlockedBy!)?.title}”`}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.dash {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.5rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
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

	.small-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		color: var(--gold);
		font-weight: 700;
		text-decoration: none;
	}

	/* Key numbers, boxless: big figures with their labels underneath. */
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
		gap: 1.25rem 1.5rem;
		margin-top: -1rem;
		padding-top: 1.25rem;
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
		color: var(--ink-3);
	}

	.stats dd {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.stats strong {
		font-size: 2.1rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
	}

	.stats dd.streak {
		color: var(--web);
	}

	/* Featured lesson: the track owns the field. */
	.quest {
		display: grid;
		gap: 1.5rem;
		height: 100%;
		padding: 1.4rem 1.25rem 1.5rem;
		border-radius: 28px;
		background: var(--t);
		color: var(--t-ink);
		overflow: hidden;
	}

	.quest h2 {
		margin-top: 0.8rem;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.05;
		letter-spacing: -0.035em;
	}

	.quest-sub {
		margin-top: 0.6rem;
		font-size: 1.12rem;
		font-weight: 600;
		max-width: 36ch;
	}

	.quest-meta {
		margin-top: 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		opacity: 0.8;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 1.2rem;
		min-height: 3.25rem;
		padding: 0 1.4rem;
		border-radius: 999px;
		background: var(--t-ink);
		color: var(--ink);
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.12rem;
		text-decoration: none;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.cta:hover {
		transform: translateY(-2px);
	}

	.cta.dark {
		margin-top: 0.9rem;
		background: var(--gold);
		color: #1d1400;
	}

	.fan {
		position: relative;
		height: 10rem;
		display: flex;
		justify-content: center;
	}

	.fan-card {
		position: absolute;
		bottom: 0;
		width: 6.5rem;
		transform-origin: 50% 120%;
		transform: rotate(calc(var(--i) * 9deg)) translateX(calc(var(--i) * 0.3rem));
		transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.quest:hover .fan-card {
		transform: rotate(calc(var(--i) * 13deg)) translateX(calc(var(--i) * 0.6rem)) translateY(-0.4rem);
	}

	/* Continue reading: a plain list with progress lines, no boxes. */
	.continue ul {
		display: grid;
		margin-top: 0.6rem;
	}

	.continue li {
		display: grid;
		gap: 0.3rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.c-title {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--ink);
		text-decoration: none;
	}

	.c-title:hover {
		color: var(--t);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.c-where {
		color: var(--ink-2);
	}

	.bar {
		height: 6px;
		margin-top: 0.3rem;
		border-radius: 3px;
		background: var(--panel-2);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--lv);
		transform-origin: left;
	}

	.c-pct {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.empty {
		margin-top: 0.6rem;
		color: var(--ink-3);
	}

	/* Tracks: rows with one segment per lesson, filled in the lesson's level colour. */
	.tracks ul {
		display: grid;
		margin-top: 0.4rem;
	}

	.tracks li {
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.track-top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	.tracks h3 {
		font-size: 1.12rem;
		font-weight: 800;
		color: var(--t);
	}

	.frac {
		font-family: var(--display);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.segs {
		display: grid;
		grid-auto-flow: column;
		gap: 5px;
		margin-top: 0.6rem;
	}

	.segs span {
		height: 10px;
		border-radius: 6px;
		background: var(--panel-2);
	}

	.segs span.on {
		background: var(--lv);
	}

	.segs span.reading {
		background: repeating-linear-gradient(-45deg, var(--lv) 0 3px, transparent 3px 7px);
		box-shadow: inset 0 0 0 1.5px var(--lv);
	}

	.seg-key {
		margin-top: 0.6rem;
		font-size: 0.88rem;
		color: var(--ink-3);
	}

	/* Cards: a fanned hand of recent pulls beside the review prompt. */
	.cards-body {
		display: grid;
		gap: 1.25rem;
		margin-top: 1rem;
	}

	.hand {
		position: relative;
		height: 12.5rem;
		display: flex;
		justify-content: center;
	}

	.hand-card {
		position: absolute;
		bottom: 0;
		width: 7.5rem;
		transform-origin: 50% 130%;
		transform: rotate(calc(var(--i) * 8deg)) translateX(calc(var(--i) * 1.6rem));
	}

	.review p {
		max-width: 34rem;
		font-size: 1.12rem;
		color: var(--ink-2);
	}

	.more {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-top: 0.6rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--gold);
		font-weight: 800;
		cursor: pointer;
	}

	.more[aria-expanded='true'] :global(svg) {
		transform: rotate(90deg);
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

	@media (min-width: 560px) {
		.sleeves {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.cards-body {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: center;
		}
	}

	@media (min-width: 900px) {
		.dash {
			grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
			grid-template-areas:
				'greet greet'
				'stats stats'
				'feature continue'
				'binder tracks'
				'medals medals'
				'cards cards';
			column-gap: 2.5rem;
			align-items: start;
		}

		.greet {
			grid-area: greet;
		}

		.stats {
			grid-area: stats;
		}

		.feature {
			grid-area: feature;
			align-self: stretch;
		}

		.continue {
			grid-area: continue;
		}

		.binder {
			grid-area: binder;
		}

		.tracks {
			grid-area: tracks;
		}

		.medals {
			grid-area: medals;
		}

		.cards {
			grid-area: cards;
		}

		.quest {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
			align-items: center;
			padding: 2rem;
		}
	}

	@media (min-width: 1280px) {
		.sleeves {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fan-card,
		.cta {
			transition: none;
		}
	}
</style>
