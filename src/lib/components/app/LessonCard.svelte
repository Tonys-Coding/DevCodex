<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import type { TocEntry } from '../../content/article-markup';
	import { articleById } from '../../content/catalog';
	import { bonusCards, cardsUnlockedBy } from '../../content/cards';
	import { progress } from '../../progress/progress.svelte';
	import { requirements, type QuizInfo } from '../../progress/requirements';
	import { isoScenes, frames } from '../isoScenes';
	import IsoArt from '../IsoArt.svelte';
	import Icon from '../Icon.svelte';
	import LevelTag from './LevelTag.svelte';

	/**
	 * One lesson, dealt out under its topic: framed in its level colour, with an isometric
	 * banner, what it builds on, and where the reader is (read line, pack steps).
	 */
	let {
		article,
		number,
		index
	}: {
		article: ArticleMeta;
		number: number;
		index?: { sections: TocEntry[]; quizzes: QuizInfo[] };
	} = $props();

	const pack = $derived(cardsUnlockedBy(article.id));
	const live = $derived(article.status === 'live');
	const done = $derived(progress.isDone(article.id));
	const reading = $derived(progress.data.reading?.[article.id]);
	const steps = $derived(
		index && reading && !done
			? requirements(progress.data, article, index.sections, index.quizzes).filter((r) => r.met).length
			: 0
	);
	const bonus = $derived(bonusCards(article.id, 'deeper').length + bonusCards(article.id, 'hood').length);
	const builds = $derived((article.builds ?? []).map((id) => articleById(id)).filter((a) => !!a));
</script>

{#snippet face()}
	<span class="banner" aria-hidden="true">
		<span class="art"><IsoArt scene={isoScenes[article.id] ?? isoScenes[article.track] ?? []} frame={frames.lesson} /></span>
		<span class="over">
			<span class="num">Lesson {number}</span>
			{#if done}
				<span class="state done"><Icon name="check" size={15} stroke={3} /> Finished</span>
			{:else if reading}
				<span class="state reading">{Math.round(reading.percent * 100)}% read</span>
			{/if}
		</span>
	</span>
	<span class="body">
		<LevelTag level={article.level} />
		<span class="title">{article.title}</span>
		<span class="sum">{article.summary}</span>
		{#if builds.length}
			<span class="builds"><strong>Builds on</strong> {builds.map((b) => b.title).join('; ')}</span>
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
		height: 100%;
		border-radius: 16px;
		border: 2px solid var(--lv);
		background: var(--panel);
		color: var(--ink);
		text-decoration: none;
		overflow: hidden;
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

	/* A short banner: a faint isometric model of the idea, with the lesson number on it. */
	.banner {
		--art-ground: color-mix(in srgb, var(--t) 6%, var(--ground));
		position: relative;
		display: block;
		aspect-ratio: 5 / 2;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 65%, color-mix(in srgb, var(--t) 13%, transparent), transparent 70%),
			var(--art-ground);
	}

	.over {
		position: absolute;
		inset: 0.55rem 0.75rem auto;
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

	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 0.35rem;
		padding: 0.75rem 0.9rem 0.85rem;
	}

	.title {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.sum,
	.builds {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.95rem;
		line-height: 1.4;
		color: var(--ink-2);
	}

	.sum {
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.builds {
		-webkit-line-clamp: 1;
		line-clamp: 1;
		font-size: 0.88rem;
	}

	.builds strong {
		color: var(--ink);
	}

	.line {
		height: 4px;
		margin-top: 0.15rem;
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
		padding-top: 0.3rem;
		font-size: 0.88rem;
	}

	.resume {
		color: var(--t);
	}

	/* The picture fills the banner's fixed shape instead of stretching it. */
	.art {
		position: absolute;
		inset: 1.5rem 0.4rem 0.3rem;
		display: block;
	}

	@media (max-width: 559px) {
		.banner {
			aspect-ratio: 3 / 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lesson {
			transition: none;
		}
	}
</style>
