<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import type { TocEntry } from '../../content/article-markup';
	import { articleById } from '../../content/catalog';
	import { bonusCards, cardsUnlockedBy } from '../../content/cards';
	import { progress } from '../../progress/progress.svelte';
	import { requirements, type QuizInfo } from '../../progress/requirements';
	import { cardArt } from '../cardArt';
	import Icon from '../Icon.svelte';
	import LevelTag from './LevelTag.svelte';

	/**
	 * One lesson, dealt out under its topic: framed in its level colour, with where the
	 * reader is (read line, pack steps), what it builds on, and the concepts it unlocks.
	 */
	let {
		article,
		number,
		index
	}: { article: ArticleMeta; number: number; index?: { sections: TocEntry[]; quizzes: QuizInfo[] } } = $props();

	const pack = $derived(cardsUnlockedBy(article.id));
	const art = $derived(pack[0] ? cardArt[pack[0].id] : '');
	const live = $derived(article.status === 'live');
	const done = $derived(progress.isDone(article.id));
	const reading = $derived(progress.data.reading?.[article.id]);
	const steps = $derived(
		index && reading && !done
			? requirements(progress.data, article, index.sections, index.quizzes).filter((r) => r.met).length
			: 0
	);
	const bonus = $derived(bonusCards(article.id, 'deeper').length + bonusCards(article.id, 'hood').length);
	const collect = $derived(pack.slice(0, 3).map((c) => c.term));
	const builds = $derived((article.builds ?? []).map((id) => articleById(id)).filter((a) => !!a));
	/** Which deeper layers this lesson has, from the build-time index. */
	const layers = $derived((['deeper', 'hood'] as const).filter((d) => index?.sections.some((s) => s.depth === d)));
</script>

{#snippet face()}
	<span class="head">
		<span class="num">Lesson {number}</span>
		{#if done}
			<span class="state done"><Icon name="check" size={16} stroke={3} /> Finished</span>
		{:else if reading}
			<span class="state reading">{Math.round(reading.percent * 100)}% read</span>
		{/if}
	</span>
	<span class="art" aria-hidden="true">
		{#if art}<svg viewBox="0 0 120 64">{@html art}</svg>{:else}<Icon name="lock" size={26} stroke={2} />{/if}
	</span>
	<span class="body">
		<LevelTag level={article.level} />
		<span class="title">{article.title}</span>
		<span class="sum">{article.summary}</span>
		{#if collect.length}
			<span class="collect"><strong>Collect:</strong> {collect.join(', ')}{pack.length > 3 ? ` and ${pack.length - 3} more` : ''}</span>
		{/if}
		{#if builds.length}
			<span class="builds"><strong>Builds on:</strong> {builds.map((b) => b.title).join('; ')}</span>
		{/if}
		{#if layers.length}
			<span class="layers">
				<span class:ok={done}>{#if done}<Icon name="check" size={13} stroke={3} />{/if}Core</span>
				{#each layers as d (d)}
					<span class:ok={progress.layerDone(article.id, d)}>{#if progress.layerDone(article.id, d)}<Icon name="check" size={13} stroke={3} />{/if}{d === 'deeper' ? 'Going deeper' : 'Under the hood'}</span>
				{/each}
			</span>
		{/if}
		{#if reading && !done}
			<span class="line" aria-hidden="true"><i style="transform: scaleX({reading.percent})"></i></span>
		{/if}
		<span class="foot meta-row">
			{#if !live}
				<span>Coming soon</span>
			{:else if done}
				<span><Icon name="clock" size={15} stroke={2} /> {article.minutes} min</span>
				<span class="gold"><Icon name="cards" size={15} stroke={2} /> {pack.length} cards collected</span>
			{:else if reading}
				<span class="resume">Resume <Icon name="arrow-right" size={15} stroke={2.5} /></span>
				<span>Pack: {steps} of 3 steps</span>
			{:else}
				<span><Icon name="clock" size={15} stroke={2} /> {article.minutes} min</span>
				<span class="gold"><Icon name="cards" size={15} stroke={2} /> {pack.length} cards{bonus ? ` + ${bonus} bonus` : ''}</span>
			{/if}
		</span>
	</span>
{/snippet}

{#if live}
	<a
		class="lesson t-{article.track} lv-{article.level}"
		class:done
		href="{resolve('/learn/[slug]', { slug: article.id })}{reading?.section && !done ? `#${reading.section.id}` : ''}"
	>
		{@render face()}
	</a>
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
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.state.done {
		color: var(--structures);
	}

	.state.reading {
		color: var(--lv);
	}

	.art {
		display: grid;
		place-items: center;
		aspect-ratio: 3 / 1;
		border-radius: 8px;
		background: color-mix(in srgb, var(--t) 9%, var(--ground));
		color: var(--ink-3);
	}

	.art svg {
		height: 78%;
		width: auto;
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

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		flex: 1;
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

	.collect,
	.builds {
		font-size: 0.95rem;
		line-height: 1.4;
		color: var(--ink-2);
	}

	.collect strong,
	.builds strong {
		color: var(--ink);
	}

	.layers {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem 0.9rem;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.layers span {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.layers .ok {
		color: var(--structures);
	}

	.line {
		height: 4px;
		border-radius: 3px;
		background: var(--panel-2);
		overflow: hidden;
	}

	.line i {
		display: block;
		height: 100%;
		background: var(--lv);
		transform-origin: left;
	}

	.foot {
		margin-top: auto;
		padding-top: 0.2rem;
		font-size: 0.88rem;
	}

	.resume {
		color: var(--t);
	}

	/* Phones: a compact sideways card, stacked in a list rather than a carousel. */
	@media (max-width: 559px) {
		.lesson {
			display: grid;
			grid-template-columns: 4.5rem minmax(0, 1fr);
			grid-template-areas:
				'head head'
				'art body';
			gap: 0.5rem 0.85rem;
		}

		.head {
			grid-area: head;
		}

		.art {
			grid-area: art;
			aspect-ratio: 1;
			align-self: start;
		}

		.art svg {
			width: 80%;
			height: auto;
		}

		.body {
			grid-area: body;
		}

		.sum {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lesson {
			transition: none;
		}
	}
</style>
