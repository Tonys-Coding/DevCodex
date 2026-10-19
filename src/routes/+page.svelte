<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, liveArticles, articlesInTrack, articleById } from '#lib/content/catalog.js';
	import { cards, cardsUnlockedBy } from '#lib/content/cards.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import CollectCard from '#lib/components/CollectCard.svelte';
	import LevelTag from '#lib/components/app/LevelTag.svelte';

	const quest = $derived(liveArticles.find((a) => !progress.isDone(a.id)));
	const questCards = $derived(quest ? cardsUnlockedBy(quest.id) : []);
	const newCount = $derived(progress.unlockedCards.filter((c) => progress.isNew(c)).length);
</script>

<svelte:head>
	<title>DevCodex: learn software engineering, one card at a time</title>
</svelte:head>

<div class="home">
	{#if quest}
		<section class="quest t-{quest.track}" aria-labelledby="quest-title">
			<div class="quest-text">
				<LevelTag level={quest.level} solid />
				<h1 id="quest-title">{quest.title}</h1>
				<p class="quest-sub">
					{quest.minutes} minutes. Work through it, answer the checks, and open a pack of {questCards.length} cards.
				</p>
				<a class="cta" href={resolve('/learn/[slug]', { slug: quest.id })}>
					{progress.data.completed && Object.keys(progress.data.completed).length ? 'Keep going' : 'Start reading'}
					<Icon name="arrow-right" size={20} stroke={2} />
				</a>
			</div>
			<div class="fan" aria-hidden="true">
				{#each questCards as card, i (card.id)}
					<div class="fan-card" style="--i: {i - (questCards.length - 1) / 2}">
						<CollectCard {card} face="back" tilt={false} />
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<section class="quest" aria-labelledby="quest-title">
			<div class="quest-text">
				<h1 id="quest-title">Every pack collected</h1>
				<p class="quest-sub">You have finished every article written so far. Keep your cards sharp in Trivia while new articles are on the way.</p>
				<a class="cta" href={resolve('/trivia')}>Play the deck <Icon name="arrow-right" size={20} stroke={2} /></a>
			</div>
		</section>
	{/if}

	<section class="tracks" aria-labelledby="tracks-title">
		<div class="row-head">
			<h2 id="tracks-title">Tracks</h2>
			<a href={resolve('/learn')} class="small-link">All articles <Icon name="arrow-right" size={16} stroke={2} /></a>
		</div>
		<ul>
			{#each tracks as track (track.id)}
				{@const list = articlesInTrack(track.id)}
				{@const done = list.filter((a) => progress.isDone(a.id)).length}
				<li class="t-{track.id}">
					<div class="track-top">
						<h3>{track.title}</h3>
						<span class="frac">{done}/{list.length}</span>
					</div>
					<p>{track.blurb}</p>
					<div class="segs" aria-label="{done} of {list.length} articles finished">
						{#each list as a (a.id)}
							<span class:on={progress.isDone(a.id)} class:now={a.id === quest?.id} class:soon={a.status === 'soon'} title={a.title}></span>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section class="binder" aria-labelledby="binder-title">
		<div class="row-head">
			<h2 id="binder-title">Your binder</h2>
			<a href={resolve('/trivia')} class="small-link">
				{newCount ? `${newCount} new to review` : 'Play the deck'}
				<Icon name="arrow-right" size={16} stroke={2} />
			</a>
		</div>
		<p class="count">{progress.unlockedCards.length} of {cards.length} cards collected</p>
		<div class="sleeves">
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
	</section>
</div>

<style>
	.home {
		display: grid;
		gap: 2rem;
	}

	.quest {
		display: grid;
		gap: 1.5rem;
		padding: 1.4rem 1.25rem 1.5rem;
		border-radius: 28px;
		background: var(--t);
		color: var(--t-ink);
		overflow: hidden;
	}

	.quest h1 {
		margin-top: 0.8rem;
		font-size: clamp(2.1rem, 7vw, 3.3rem);
		font-weight: 800;
		line-height: 1.02;
		letter-spacing: -0.035em;
	}

	.quest-sub {
		margin-top: 0.7rem;
		font-size: 1.05rem;
		font-weight: 600;
		max-width: 36ch;
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

	.fan {
		position: relative;
		height: 11rem;
		display: flex;
		justify-content: center;
	}

	.fan-card {
		position: absolute;
		bottom: 0;
		width: 7rem;
		transform-origin: 50% 120%;
		transform: rotate(calc(var(--i) * 9deg)) translateX(calc(var(--i) * 0.3rem));
		transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.quest:hover .fan-card {
		transform: rotate(calc(var(--i) * 13deg)) translateX(calc(var(--i) * 0.6rem)) translateY(-0.4rem);
	}

	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
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

	.tracks ul {
		display: grid;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.tracks li {
		padding: 1rem 1.1rem 1.1rem;
		border-radius: 22px;
		background: var(--panel);
		border: 1px solid var(--rule);
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

	.tracks p {
		margin-top: 0.2rem;
		color: var(--ink-2);
		font-size: 0.95rem;
	}

	.segs {
		display: grid;
		grid-auto-flow: column;
		gap: 5px;
		margin-top: 0.8rem;
	}

	.segs span {
		height: 10px;
		border-radius: 6px;
		background: var(--panel-2);
	}

	.segs span.on {
		background: var(--t);
	}

	.segs span.now {
		background: repeating-linear-gradient(-45deg, var(--t) 0 4px, transparent 4px 8px);
		box-shadow: inset 0 0 0 1.5px var(--t);
	}

	.segs span.soon {
		background: none;
		box-shadow: inset 0 0 0 1.5px var(--panel-2);
	}

	.count {
		color: var(--ink-3);
		font-size: 0.95rem;
		font-variant-numeric: tabular-nums;
	}

	.sleeves {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 0.85rem;
		margin-top: 0.9rem;
		padding: 0.9rem;
		border-radius: 22px;
		background: #0d0b10;
		border: 1px solid var(--rule);
	}

	@media (min-width: 560px) {
		.sleeves {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 900px) {
		.home {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
			grid-template-areas:
				'quest binder'
				'tracks binder';
			align-items: start;
			column-gap: 2rem;
		}

		.quest {
			grid-area: quest;
			padding: 2rem 2rem 1.75rem;
		}

		.tracks {
			grid-area: tracks;
		}

		.binder {
			grid-area: binder;
		}
	}

	@media (min-width: 1280px) {
		.sleeves {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fan-card {
			transition: none;
		}
	}
</style>
