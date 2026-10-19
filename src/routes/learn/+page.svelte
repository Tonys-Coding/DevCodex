<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { tracks, articlesInTrack } from '#lib/content/catalog.js';
	import { levels } from '#lib/content/levels.js';
	import type { Level, TrackId } from '#lib/content/types.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import TopicCard from '#lib/components/app/TopicCard.svelte';
	import LessonCard from '#lib/components/app/LessonCard.svelte';

	let query = $state('');
	let level = $state<Level | 'all'>('all');
	/** The topic whose lessons are dealt out. Searching or filtering shows every topic with a match. */
	let open = $state<TrackId | null>(null);

	const q = $derived(query.trim().toLowerCase());
	const filtering = $derived(q !== '' || level !== 'all');
	const matches = (a: { title: string; summary: string; level: Level }) =>
		(level === 'all' || a.level === level) && (!q || `${a.title} ${a.summary}`.toLowerCase().includes(q));

	const topics = $derived(
		tracks.map((track, i) => {
			const lessons = articlesInTrack(track.id);
			const shown = lessons.filter(matches);
			return {
				track,
				number: i + 1,
				lessons,
				shown,
				finished: lessons.filter((a) => progress.isDone(a.id)).length,
				isOpen: filtering ? shown.length > 0 : open === track.id
			};
		})
	);
	const anyMatch = $derived(topics.some((t) => t.shown.length));

	function toggle(id: TrackId) {
		if (filtering) {
			query = '';
			level = 'all';
		}
		open = open === id ? null : id;
	}

	/** Lesson cards are dealt in one after another, like cards off a deck. */
	function deal(_node: Element, { i }: { i: number }) {
		return {
			delay: prefersReducedMotion.current ? 0 : i * 70,
			duration: prefersReducedMotion.current ? 0 : 480,
			easing: cubicOut,
			css: (t: number) =>
				`opacity: ${t}; transform: translateY(${(1 - t) * -28}px) rotate(${(1 - t) * -5}deg) scale(${0.92 + t * 0.08});`
		};
	}
</script>

<svelte:head>
	<title>Learn · DevCodex</title>
</svelte:head>

<div class="library">
	<header class="head">
		<h1>Learn</h1>
		<p class="tagline">Your path to expertise.</p>
		<div class="tools">
			<label class="search">
				<Icon name="search" size={20} stroke={2} />
				<span class="visually-hidden">Search lessons</span>
				<input type="search" bind:value={query} placeholder="Search lessons" autocomplete="off" />
			</label>
			<fieldset class="levels">
				<legend class="visually-hidden">Difficulty</legend>
				<label class="all" class:on={level === 'all'}>
					<input type="radio" name="level" value="all" bind:group={level} class="visually-hidden" />All levels
				</label>
				{#each levels as l (l.id)}
					<label class="lv-{l.id}" class:on={level === l.id} title={l.blurb}>
						<input type="radio" name="level" value={l.id} bind:group={level} class="visually-hidden" />{l.label}
					</label>
				{/each}
			</fieldset>
		</div>
	</header>

	<div class="topics">
		{#each topics as topic (topic.track.id)}
			<div class="topic-slot">
				<TopicCard
					track={topic.track}
					lessons={topic.lessons}
					finished={topic.finished}
					number={topic.number}
					total={tracks.length}
					open={topic.isOpen}
					matches={filtering ? topic.shown.length : undefined}
					controls="lessons-{topic.track.id}"
					onclick={() => toggle(topic.track.id)}
				/>
			</div>
			{#if topic.isOpen}
				<section class="deal t-{topic.track.id}" id="lessons-{topic.track.id}" aria-label="{topic.track.title} lessons">
					<h2>{topic.track.title}<span>{topic.shown.length} {topic.shown.length === 1 ? 'lesson' : 'lessons'}, easiest first</span></h2>
					<ol>
						{#each topic.shown as article, i (article.id)}
							<li in:deal={{ i }}>
								<LessonCard {article} number={topic.lessons.indexOf(article) + 1} done={progress.isDone(article.id)} />
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		{/each}
	</div>

	{#if filtering && !anyMatch}
		<p class="none">No lessons match{q ? ` “${query}”` : ''}{level !== 'all' ? ' at this level' : ''}.</p>
	{/if}
</div>

<style>
	.library {
		display: grid;
		gap: 1.75rem;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.tagline {
		margin-top: 0.3rem;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.tools {
		display: grid;
		gap: 0.9rem;
		margin-top: 1.25rem;
	}

	/* Boxless search: an underlined field. */
	.search {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		max-width: 32rem;
		min-height: 3rem;
		border-bottom: 2px solid var(--rule);
		color: var(--ink-3);
	}

	.search:focus-within {
		border-bottom-color: var(--gold);
	}

	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		color: var(--ink);
		font-size: 1.05rem;
	}

	/* Level filter as text tabs: the chosen level is underlined in its colour. */
	.levels {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.4rem;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.levels label {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		border-bottom: 3px solid transparent;
		color: var(--ink-3);
		font-weight: 800;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.levels label:not(.all) {
		color: color-mix(in srgb, var(--lv) 75%, var(--ink-3));
	}

	.levels label:hover {
		color: var(--ink);
	}

	.levels label.on {
		color: var(--lv, var(--ink));
		border-bottom-color: var(--lv, var(--ink));
	}

	.levels label:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	.topics {
		display: grid;
		/* minmax(0, …) so the sideways-scrolling hand can't widen the column. */
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	/* Topic cards in a row share one height. */
	.topic-slot {
		display: grid;
	}

	/* The dealt hand: lesson cards in a row that scrolls sideways on phones. */
	.deal {
		min-width: 0;
		padding: 0.25rem 0 0.75rem;
	}

	.deal h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.75rem;
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--t);
	}

	.deal h2 span {
		font-family: var(--body);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.deal ol {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(15rem, 78%);
		gap: 0.9rem;
		margin-top: 0.8rem;
		padding: 0.5rem 0.25rem 1.25rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 0.25rem;
	}

	.deal li {
		scroll-snap-align: start;
	}

	.none {
		color: var(--ink-2);
	}

	/* Desktop: the three topic cards share a row, and the open topic's hand is dealt below them. */
	@media (min-width: 900px) {
		.topics {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1.25rem;
		}

		.topic-slot {
			order: 0;
		}

		.deal {
			order: 1;
			grid-column: 1 / -1;
		}

		.deal ol {
			grid-auto-flow: row;
			grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
			grid-auto-columns: auto;
			overflow: visible;
			padding-inline: 0;
		}
	}
</style>
