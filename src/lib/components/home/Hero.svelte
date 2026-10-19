<script lang="ts">
	import { resolve } from '$app/paths';
	import { cardsUnlockedBy } from '../../content/cards';
	import type { Hero } from '../../progress/dashboard';
	import { timeAgo } from '../../progress/dashboard';
	import Icon from '../Icon.svelte';
	import CollectCard from '../CollectCard.svelte';
	import LevelTag from '../app/LevelTag.svelte';

	/** The one next step: resume what was read recently, or start the next lesson on the path. */
	let { hero, now }: { hero: Hero; now: Date } = $props();

	const pack = $derived(hero.mode === 'done' ? [] : cardsUnlockedBy(hero.article.id));
	const href = $derived.by(() => {
		if (hero.mode === 'done') return resolve('/trivia');
		const base = resolve('/learn/[slug]', { slug: hero.article.id });
		return hero.mode === 'resume' && hero.reading.section ? `${base}#${hero.reading.section.id}` : base;
	});
</script>

{#if hero.mode === 'done'}
	<section class="hero" aria-labelledby="hero-title">
		<div class="text">
			<h2 id="hero-title">Every lesson collected</h2>
			<p class="sub">You have finished every lesson written so far. Keep your cards sharp in Trivia while new ones are on the way.</p>
			<a class="cta" {href}>Play the deck <Icon name="arrow-right" size={20} stroke={2} /></a>
		</div>
	</section>
{:else}
	{@const a = hero.article}
	<section class="hero t-{a.track} lv-{a.level}" aria-labelledby="hero-title">
		<div class="text">
			<LevelTag level={a.level} solid />
			<h2 id="hero-title">{a.title}</h2>
			{#if hero.mode === 'resume'}
				<p class="sub">
					You stopped at {hero.reading.section ? `“${hero.reading.section.text}”` : 'the start'}, {timeAgo(hero.reading.last, now)}.
				</p>
				<div class="bar" role="progressbar" aria-label="{a.title} read" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hero.reading.percent * 100)}>
					<span style="transform: scaleX({hero.reading.percent})"></span>
				</div>
				<p class="meta">{Math.round(hero.reading.percent * 100)}% read · {a.minutes} min lesson · {pack.length} cards inside</p>
			{:else}
				<p class="sub">{a.summary}</p>
				<p class="meta">Next on your path · {a.minutes} min · {pack.length} cards inside</p>
			{/if}
			<a class="cta" {href}>
				{hero.mode === 'resume' ? 'Resume lesson' : 'Start this lesson'}
				<Icon name="arrow-right" size={20} stroke={2} />
			</a>
		</div>
		<div class="fan" aria-hidden="true">
			{#each pack as card, i (card.id)}
				<div class="fan-card" style="--i: {i - (pack.length - 1) / 2}">
					<CollectCard {card} face="back" tilt={false} />
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* The track owns the field: the one loud surface on the dashboard. */
	.hero {
		display: grid;
		gap: 1.25rem;
		height: 100%;
		padding: 1.4rem 1.25rem 1.5rem;
		border-radius: 28px;
		background: var(--t);
		color: var(--t-ink);
		overflow: hidden;
	}

	h2 {
		margin-top: 0.7rem;
		font-size: clamp(2rem, 5vw, 2.75rem);
		font-weight: 800;
		line-height: 1.05;
		letter-spacing: -0.035em;
	}

	.sub {
		margin-top: 0.6rem;
		max-width: 38ch;
		font-size: 1.12rem;
		font-weight: 600;
		line-height: 1.45;
	}

	.bar {
		height: 8px;
		max-width: 26rem;
		margin-top: 0.9rem;
		border-radius: 3px;
		background: color-mix(in srgb, var(--t-ink) 22%, transparent);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--t-ink);
		transform-origin: left;
	}

	.meta {
		margin-top: 0.55rem;
		font-size: 0.95rem;
		font-weight: 700;
		opacity: 0.85;
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
		height: 9rem;
		display: flex;
		justify-content: center;
	}

	.fan-card {
		position: absolute;
		bottom: 0;
		width: 6rem;
		transform-origin: 50% 120%;
		transform: rotate(calc(var(--i) * 9deg)) translateX(calc(var(--i) * 0.3rem));
		transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero:hover .fan-card {
		transform: rotate(calc(var(--i) * 13deg)) translateX(calc(var(--i) * 0.6rem)) translateY(-0.4rem);
	}

	/* Phones keep the fan small so the button stays near the top. */
	@media (max-width: 559px) {
		.fan {
			display: none;
		}
	}

	@media (min-width: 900px) {
		.hero {
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			align-items: center;
			padding: 2rem;
		}

		.fan {
			height: 10rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fan-card,
		.cta {
			transition: none;
		}
	}
</style>
