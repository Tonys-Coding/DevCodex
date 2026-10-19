<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import { cardsUnlockedBy } from '../../content/cards';
	import { cardArt } from '../cardArt';
	import Icon from '../Icon.svelte';
	import LevelTag from './LevelTag.svelte';

	/** One lesson, dealt out under its topic: a portrait card framed in its level colour. */
	let { article, number, done }: { article: ArticleMeta; number: number; done: boolean } = $props();

	const pack = $derived(cardsUnlockedBy(article.id));
	const art = $derived(pack[0] ? cardArt[pack[0].id] : '');
	const live = $derived(article.status === 'live');
</script>

{#snippet face()}
	<span class="head">
		<span class="num">Lesson {number}</span>
		{#if done}<span class="done"><Icon name="check" size={16} stroke={3} /> Finished</span>{/if}
	</span>
	<span class="art" aria-hidden="true">
		{#if art}<svg viewBox="0 0 120 64">{@html art}</svg>{:else}<Icon name="lock" size={26} stroke={2} />{/if}
	</span>
	<LevelTag level={article.level} />
	<span class="title">{article.title}</span>
	<span class="sum">{article.summary}</span>
	<span class="foot meta-row">
		{#if live}
			<span><Icon name="clock" size={15} stroke={2} /> {article.minutes} min</span>
			<span class="gold"><Icon name="cards" size={15} stroke={2} /> {pack.length} cards</span>
		{:else}
			<span>Coming soon</span>
		{/if}
	</span>
{/snippet}

{#if live}
	<a class="lesson t-{article.track} lv-{article.level}" class:done href={resolve('/learn/[slug]', { slug: article.id })}>{@render face()}</a>
{:else}
	<div class="lesson soon t-{article.track} lv-{article.level}">{@render face()}</div>
{/if}

<style>
	/* The level frames the lesson: a full border in its level colour, never a fill. */
	.lesson {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 100%;
		padding: 0.9rem 0.95rem 1rem;
		border-radius: 16px;
		border: 2px solid var(--lv);
		background: var(--panel);
		color: var(--ink);
		text-decoration: none;
		box-shadow: 0 18px 36px -18px rgb(0 0 0 / 0.85);
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	a.lesson:hover {
		transform: translateY(-4px) rotate(-0.6deg);
	}

	.soon {
		border-style: dashed;
		opacity: 0.75;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.done {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--structures);
	}

	.art {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 7;
		border-radius: 8px;
		background: color-mix(in srgb, var(--t) 9%, var(--ground));
		color: var(--ink-3);
	}

	.art svg {
		width: 70%;
		overflow: visible;
		fill: none;
		stroke: color-mix(in srgb, var(--t) 70%, var(--ink-2));
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.art :global(.hot) {
		fill: color-mix(in srgb, var(--t) 70%, var(--ink-2));
	}

	.title {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.sum {
		font-size: 0.95rem;
		line-height: 1.45;
		color: var(--ink-2);
	}

	.foot {
		margin-top: auto;
		padding-top: 0.2rem;
		font-size: 0.88rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.lesson {
			transition: none;
		}
	}
</style>
