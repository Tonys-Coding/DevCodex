<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack, articleById, liveArticles } from '#lib/content/catalog.js';
	import { cards } from '#lib/content/cards.js';
	import { levels, levelById } from '#lib/content/levels.js';
	import type { ArticleMeta, Level, TrackId } from '#lib/content/types.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import TopicCard from '#lib/components/app/TopicCard.svelte';
	import LessonCard from '#lib/components/app/LessonCard.svelte';
	import type { PageProps } from './$types';

	/**
	 * Learn: a grid of topics that scales to any number of them. Each topic opens its
	 * own page. Search finds lessons, sections and concepts across every topic, and a
	 * level on its own lists every lesson at that level.
	 */
	let { data }: PageProps = $props();

	let query = $state('');
	let level = $state<Level | 'all'>('all');
	const q = $derived(query.trim().toLowerCase());
	const levelOk = (a: ArticleMeta) => level === 'all' || a.level === level;

	const topics = $derived(
		tracks.map((track, i) => ({ track, number: i + 1, lessons: articlesInTrack(track.id).filter((a) => a.status === 'live') }))
	);

	// Older links pointed at /learn#topic-web; they now open that topic's page.
	onMount(() => {
		const id = location.hash.match(/^#topic-([\w-]+)$/)?.[1];
		if (id && tracks.some((t) => t.id === id)) goto(resolve('/learn/topic/[track]', { track: id }), { replaceState: true });
	});

	/** The lesson read most recently and not yet finished, for a one-line "continue" above the grid. */
	const continuing = $derived(
		progress.inProgress.map(({ id, reading }) => ({ article: articleById(id), reading })).find((x) => x.article?.status === 'live')
	);

	const atLevel = $derived(level === 'all' ? [] : liveArticles.filter((a) => a.level === level));

	/** Search covers lesson titles and summaries, section headings, key terms in sections, and concept-card terms. */
	type Hit = { kind: 'lesson' | 'section' | 'concept'; article: ArticleMeta; text: string; href: string; key: string; via?: string };
	const LIMIT = 24;
	const hits = $derived.by((): Hit[] => {
		if (!q) return [];
		const out: Hit[] = [];
		for (const t of topics)
			for (const a of t.lessons) {
				if (!levelOk(a)) continue;
				const base = resolve('/learn/[slug]', { slug: a.id });
				if (`${a.title} ${a.summary}`.toLowerCase().includes(q)) out.push({ kind: 'lesson', article: a, text: a.title, href: base, key: a.id });
				for (const s of data.index[a.id]?.sections ?? []) {
					const via = s.text.toLowerCase().includes(q) ? undefined : s.keywords.filter((k) => k.toLowerCase().includes(q)).sort((x, y) => x.length - y.length)[0];
					if (s.text.toLowerCase().includes(q) || via)
						out.push({ kind: 'section', article: a, text: s.text, href: `${base}#${s.id}`, key: `${a.id}#${s.id}`, via });
				}
			}
		for (const c of cards) {
			const a = c.unlockedBy ? articleById(c.unlockedBy) : undefined;
			if (!a || a.status !== 'live' || !levelOk(a)) continue;
			if (`${c.term} ${c.question}`.toLowerCase().includes(q))
				out.push({ kind: 'concept', article: a, text: c.term, href: resolve('/learn/[slug]', { slug: a.id }), key: `card-${c.id}` });
		}
		return out.slice(0, LIMIT);
	});

	/** Splits text around the query so the match can be marked. */
	function mark(text: string) {
		const i = text.toLowerCase().indexOf(q);
		return i < 0 ? [text, '', ''] : [text.slice(0, i), text.slice(i, i + q.length), text.slice(i + q.length)];
	}

	const trackTitle = (id: TrackId) => tracks.find((t) => t.id === id)?.title ?? '';
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
				<span class="visually-hidden">Search lessons, sections and concepts</span>
				<input type="search" bind:value={query} placeholder="Search lessons, sections and concepts" autocomplete="off" />
			</label>
			<div class="levels" role="radiogroup" aria-label="Difficulty">
				<button type="button" role="radio" aria-checked={level === 'all'} class="all" class:on={level === 'all'} onclick={() => (level = 'all')}>All levels</button>
				{#each levels as l (l.id)}
					<button type="button" role="radio" aria-checked={level === l.id} class="lv-{l.id}" class:on={level === l.id} title={l.blurb} onclick={() => (level = l.id)}>{l.label}</button>
				{/each}
			</div>
		</div>
	</header>

	{#if q}
		<section class="results" aria-labelledby="results-title">
			<h2 id="results-title" aria-live="polite">
				{hits.length ? `${hits.length}${hits.length === LIMIT ? '+' : ''} ${hits.length === 1 ? 'match' : 'matches'}` : 'No matches'}
				<span>for “{query.trim()}”{level !== 'all' ? ` in ${levelById(level).label}` : ''}</span>
			</h2>
			{#if hits.length}
				<ul>
					{#each hits as h (h.key)}
						{@const parts = mark(h.text)}
						<li class="t-{h.article.track} lv-{h.article.level}">
							<a href={h.href}>
								<span class="kind">{h.kind === 'lesson' ? 'Lesson' : h.kind === 'section' ? 'Section' : 'Concept card'}</span>
								<span class="hit-text">{parts[0]}<mark>{parts[1]}</mark>{parts[2]}</span>
								{#if h.via}
									{@const v = mark(h.via)}
									<span class="where">mentions <span class="kw">{v[0]}<mark>{v[1]}</mark>{v[2]}</span></span>
								{/if}
								{#if h.kind !== 'lesson'}<span class="where">in {h.article.title}</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="none">Try a shorter word, or a concept like “cache”, “stack” or “cookie”.</p>
			{/if}
		</section>
	{:else}
		{#if level !== 'all'}
			<section class="level-list" aria-labelledby="level-title">
				<h2 id="level-title" class="lv-{level}">{levelById(level).label} lessons <span>{atLevel.length} across every topic</span></h2>
				<ol class="grid-lessons">
					{#each atLevel as article (article.id)}
						<li>
							<p class="from t-{article.track}">{trackTitle(article.track)}</p>
							<LessonCard {article} number={articlesInTrack(article.track).filter((a) => a.status === 'live').indexOf(article) + 1} index={data.index[article.id]} />
						</li>
					{/each}
				</ol>
			</section>
		{:else if continuing?.article}
			<p class="continue lv-{continuing.article.level}">
				<span>Continue <strong>{continuing.article.title}</strong> <span class="pct">{Math.round(continuing.reading.percent * 100)}% read</span></span>
				<a href="{resolve('/learn/[slug]', { slug: continuing.article.id })}{continuing.reading.section ? `#${continuing.reading.section.id}` : ''}">Resume <Icon name="arrow-right" size={16} stroke={2.5} /></a>
			</p>
		{/if}

		<section aria-labelledby="topics-title">
			<div class="row-head">
				<h2 id="topics-title">Topics</h2>
				<p class="count">{topics.length} topics · {liveArticles.length} lessons</p>
			</div>
			<ul class="topics">
				{#each topics as topic (topic.track.id)}
					{@const n = level === 'all' ? 0 : topic.lessons.filter(levelOk).length}
					<li>
						<TopicCard
							track={topic.track}
							lessons={topic.lessons}
							number={topic.number}
							total={tracks.length}
							matches={level === 'all' ? undefined : { count: n, label: `${levelById(level).label} ${n === 1 ? 'lesson' : 'lessons'}` }}
						/>
					</li>
				{/each}
			</ul>
		</section>
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
		max-width: 34rem;
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
	}

	.levels button {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0;
		border: 0;
		border-bottom: 3px solid transparent;
		background: none;
		color: var(--ink-3);
		font-weight: 800;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.levels button:not(.all) {
		color: color-mix(in srgb, var(--lv) 75%, var(--ink-3));
	}

	.levels button:hover {
		color: var(--ink);
	}

	.levels button.on {
		color: var(--lv, var(--ink));
		border-bottom-color: var(--lv, var(--ink));
	}

	/* Search results: one flat list right under the search box. */
	.results h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.6rem;
		font-size: 1.35rem;
		font-weight: 800;
	}

	.results h2 span {
		font-family: var(--body);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.results ul {
		display: grid;
		margin-top: 0.6rem;
		max-width: 46rem;
	}

	.results a {
		display: grid;
		gap: 0.1rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--rule);
		color: var(--ink);
		text-decoration: none;
	}

	.results a:hover .hit-text {
		color: var(--t);
	}

	.kind {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--lv);
	}

	.hit-text {
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 800;
		line-height: 1.25;
	}

	mark {
		background: none;
		color: var(--gold);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.18em;
	}

	.kw {
		font-family: var(--mono);
		font-size: 0.9em;
		color: var(--ink);
	}

	.where {
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	/* The topic grid: as many columns as fit, so it scales to many topics. */
	.topics {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: 1.1rem;
		margin-top: 0.9rem;
	}

	.topics li {
		display: grid;
	}

	.row-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.25rem 1rem;
	}

	.row-head h2,
	.level-list h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.count {
		color: var(--ink-2);
		font-weight: 700;
	}

	.level-list h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.75rem;
		color: var(--lv);
	}

	.level-list h2 span {
		font-family: var(--body);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.grid-lessons {
		display: grid;
		gap: 1rem;
		margin-top: 0.9rem;
	}

	.grid-lessons li {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 0.35rem;
	}

	.from {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--t);
	}

	/* One line above the grid: the lesson read most recently. */
	.continue {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.3rem 1rem;
		padding: 0.7rem 0;
		border-block: 1px solid var(--rule);
		color: var(--ink-2);
	}

	.continue strong {
		color: var(--ink);
	}

	.pct {
		margin-left: 0.4rem;
		font-weight: 700;
		color: var(--lv);
	}

	.continue a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		color: var(--gold);
		font-weight: 800;
		text-decoration: none;
	}

	.none {
		color: var(--ink-2);
	}

	@media (min-width: 560px) {
		.grid-lessons {
			grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		}
	}
</style>
