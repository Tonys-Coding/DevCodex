<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack } from '#lib/content/catalog.js';
	import { cardsUnlockedBy } from '#lib/content/cards.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { levels } from '#lib/content/levels.js';
	import type { Level } from '#lib/content/types.js';
	import Icon from '#lib/components/Icon.svelte';
	import LevelTag from '#lib/components/app/LevelTag.svelte';

	let query = $state('');
	let level = $state<Level | 'all'>('all');
	const q = $derived(query.trim().toLowerCase());
	const match = (text: string) => !q || text.toLowerCase().includes(q);
	const groups = $derived(
		tracks
			.map((track) => ({
				track,
				list: articlesInTrack(track.id).filter((a) => (level === 'all' || a.level === level) && match(`${a.title} ${a.summary}`))
			}))
			.filter((g) => g.list.length)
	);
</script>

<svelte:head>
	<title>Learn · DevCodex</title>
</svelte:head>

<div class="library">
	<header class="head">
		<h1>Learn</h1>
		<p>Hands-on articles, ranked easiest first in every track. Each one ends with a pack of concept cards for your binder.</p>
		<label class="search">
			<Icon name="search" size={20} stroke={2} />
			<span class="visually-hidden">Search articles</span>
			<input type="search" bind:value={query} placeholder="Search articles" autocomplete="off" />
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
	</header>

	{#each groups as { track, list } (track.id)}
		<section class="track t-{track.id}" aria-labelledby="track-{track.id}">
			<h2 id="track-{track.id}">{track.title}</h2>
			<p class="blurb">{track.blurb}</p>
			<ul>
				{#each list as a (a.id)}
					{@const done = progress.isDone(a.id)}
					<li>
						{#if a.status === 'live'}
							<a class="item lv-{a.level}" href={resolve('/learn/[slug]', { slug: a.id })}>
								<LevelTag level={a.level} />
								<span class="title">{a.title}</span>
								<span class="sum">{a.summary}</span>
								<span class="meta">
									<span>{a.minutes} min</span>
									{#if done}
										<span class="done"><Icon name="check" size={15} stroke={2.5} /> Finished</span>
									{:else}
										<span class="cards"><Icon name="cards" size={15} stroke={2} /> {cardsUnlockedBy(a.id).length} cards</span>
									{/if}
								</span>
							</a>
						{:else}
							<div class="item soon lv-{a.level}">
								<LevelTag level={a.level} />
								<span class="title">{a.title}</span>
								<span class="sum">{a.summary}</span>
								<span class="meta"><span>Coming soon</span></span>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="none">No articles match{q ? ` “${query}”` : ''}{level !== 'all' ? ' at this level' : ''}.</p>
	{/each}
</div>

<style>
	.library {
		display: grid;
		gap: 2.25rem;
		max-width: 56rem;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.head p {
		margin-top: 0.4rem;
		color: var(--ink-2);
	}

	.search {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 1rem;
		padding: 0 1rem;
		min-height: 3.1rem;
		border-radius: 999px;
		background: var(--panel);
		border: 2px solid var(--rule);
		color: var(--ink-3);
	}

	.search:focus-within {
		border-color: var(--gold);
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

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--t);
	}

	.blurb {
		color: var(--ink-2);
		margin: 0.2rem 0 0.8rem;
	}

	ul {
		display: grid;
		gap: 0.6rem;
	}

	.levels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin: 0.85rem 0 0;
		padding: 0;
		border: 0;
	}

	.levels label {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		color: var(--ink-2);
		font-weight: 800;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.levels label:not(.all) {
		border-color: color-mix(in srgb, var(--lv) 45%, transparent);
		color: var(--lv);
	}

	.levels label.on {
		background: var(--lv, var(--ink));
		border-color: var(--lv, var(--ink));
		color: var(--lv-ink, var(--ground));
	}

	.levels label:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	/* Each article sits in a border of its level colour. */
	.item {
		display: grid;
		justify-items: start;
		gap: 0.3rem;
		padding: 1rem 1.15rem 1.05rem;
		border-radius: 22px;
		background: var(--panel);
		border: 2px solid var(--lv);
		text-decoration: none;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease-out;
	}

	.item :global(.level) {
		margin-bottom: 0.25rem;
	}

	a.item:hover {
		transform: translateY(-2px);
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--lv) 22%, transparent);
	}

	.title {
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.2rem;
		line-height: 1.2;
		letter-spacing: -0.015em;
	}

	.sum {
		color: var(--ink-2);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.3rem;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.done {
		color: var(--structures);
	}

	.cards {
		color: var(--gold);
	}

	.soon {
		border-style: dashed;
		border-color: color-mix(in srgb, var(--lv) 55%, transparent);
		background: none;
	}

	.soon .title {
		color: var(--ink-2);
	}

	.none {
		color: var(--ink-2);
	}

	@media (min-width: 760px) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
