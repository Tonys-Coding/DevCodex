<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import { trackById, nextArticle, practiceFor } from '../../content/catalog';
	import { cardsUnlockedBy } from '../../content/cards';
	import { problemById } from '../../content/problems';
	import { progress } from '../../progress/progress.svelte';
	import Icon from '../Icon.svelte';
	import CollectCard from '../CollectCard.svelte';
	import LevelTag from './LevelTag.svelte';
	import type { TocEntry } from '../../content/article-markup';

	let { meta, toc = [], children }: { meta: ArticleMeta; toc?: TocEntry[]; children: Snippet } = $props();

	const track = $derived(trackById(meta.track));
	const pack = $derived(cardsUnlockedBy(meta.id));
	const next = $derived(nextArticle(meta.id));
	const practice = $derived((practiceFor[meta.id] ?? []).map((id) => problemById(id)!).filter(Boolean));
	const done = $derived(progress.isDone(meta.id));

	/** Set when the pack is opened during this visit, so cards can be flipped one by one. */
	let opening = $state(false);
	let revealed = $state<boolean[]>([]);
	const allRevealed = $derived(revealed.length > 0 && revealed.every(Boolean));

	function open() {
		progress.finish(meta.id);
		revealed = pack.map(() => false);
		opening = true;
	}

	/** The section being read: the last heading that has scrolled past the top band. */
	let current = $state('');
	$effect(() => {
		const ids = toc.map((t) => t.id);
		let frame = 0;
		const update = () => {
			frame = 0;
			let at = '';
			for (const id of ids) {
				const el = document.getElementById(id);
				if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) at = id;
			}
			current = at;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

{#snippet sections()}
	<ol>
		{#each toc as t (t.id)}
			<li><a href="#{t.id}" aria-current={current === t.id ? 'location' : undefined}>{t.text}</a></li>
		{/each}
		<li class="to-pack"><a href="#pack-title"><Icon name="cards" size={16} stroke={2} /> {done ? 'Your cards' : 'Open your pack'}</a></li>
	</ol>
{/snippet}

<article class="read t-{meta.track}">
	<a class="back" href={resolve('/learn')}><Icon name="arrow-left" size={18} stroke={2} /> Learn</a>
	<header class="cover lv-{meta.level}">
		<p class="tags">
			<LevelTag level={meta.level} />
			<span class="chip">{track.title}</span>
		</p>
		<h1>{meta.title}</h1>
		<p class="dek">{meta.dek}</p>
		<div class="facts">
			<p class="assumes"><strong>Assumes:</strong> {meta.assumes}</p>
			<p class="chips">
				<span class="chip"><Icon name="clock" size={15} stroke={2} /> {meta.minutes} min</span>
				<span class="chip">{toc.length} sections</span>
				{#if done}
					<span class="chip done"><Icon name="check" size={15} stroke={2.5} /> Finished</span>
				{:else}
					<span class="chip gold"><Icon name="cards" size={15} stroke={2} /> {pack.length} cards inside</span>
				{/if}
			</p>
		</div>
	</header>

	<div class="layout">
		<div class="main">
			{#if toc.length}
				<details class="toc-inline">
					<summary>On this page <span>{toc.length} sections</span></summary>
					<nav aria-label="On this page">{@render sections()}</nav>
				</details>
			{/if}

			<div class="prose">
				{@render children()}
			</div>

			<section class="packzone" aria-labelledby="pack-title">
				{#if !done}
					<h2 id="pack-title">Your pack is ready</h2>
					<p>Finish the article to open a pack of {pack.length} concept cards. They join your binder and your trivia deck.</p>
					<button class="big gold" type="button" onclick={open}>
						<Icon name="spark" stroke={2} /> Finish and open pack
					</button>
				{:else}
					<h2 id="pack-title">{opening && !allRevealed ? 'Tap each card to reveal it' : 'In your binder'}</h2>
					<div class="pack">
						{#each pack as card, i (card.id)}
							{@const shown = !opening || revealed[i]}
							<button
								type="button"
								class="slot"
								class:flipped={shown}
								style="--d: {opening ? 0 : i * 90}ms"
								onclick={() => (revealed[i] = true)}
								aria-label={shown ? card.term : `Reveal card ${i + 1}`}
							>
								<span class="side b"><CollectCard {card} face="back" tilt={false} /></span>
								<span class="side f"><CollectCard {card} fresh={progress.isNew(card)} tilt={false} /></span>
							</button>
						{/each}
					</div>
					<div class="after">
						{#if opening && !allRevealed}
							<button class="ghost" type="button" onclick={() => (revealed = pack.map(() => true))}>Reveal all</button>
						{:else}
							<a class="big" href={resolve('/trivia')}>Review them in Trivia <Icon name="arrow-right" stroke={2} /></a>
						{/if}
					</div>
				{/if}
			</section>

			{#if practice.length}
				<section class="practice" aria-labelledby="practice-title">
					<h2 id="practice-title">Try it in code</h2>
					<ul>
						{#each practice as p (p.id)}
							<li>
								<a href={resolve('/practice/[slug]', { slug: p.id })}>
									<span class="p-title">{p.title}</span>
									<span class="p-meta">{p.pattern} · {p.difficulty}</span>
									<Icon name="arrow-right" size={18} stroke={2} />
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<a class="next t-{next.track}" href={resolve('/learn/[slug]', { slug: next.id })}>
				<span class="next-level"><LevelTag level={next.level} solid /></span>
				<span class="next-title">{next.title}</span>
				<span class="next-sum"><strong>Up next.</strong> {next.summary}</span>
			</a>
		</div>

		{#if toc.length}
			<nav class="rail" aria-label="On this page">
				<p class="rail-title">On this page</p>
				{@render sections()}
			</nav>
		{/if}
	</div>
</article>

<style>
	/*
	 * Phones and tablets: one column. Desktop: the article fills the app width, with
	 * reading text held to a comfortable measure, wide blocks (labs, tables, code,
	 * diagrams) using the whole main column, and a sticky "On this page" rail.
	 */
	.read {
		max-width: 78rem;
		margin-inline: auto;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.main {
		min-width: 0;
	}

	.toc-inline {
		margin-top: 1.25rem;
		border-radius: 22px;
		border: 1px solid var(--rule);
		background: var(--panel);
	}

	.toc-inline summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		min-height: 3rem;
		padding: 0 1.1rem;
		font-family: var(--display);
		font-weight: 800;
		cursor: pointer;
	}

	.toc-inline summary span {
		font-family: var(--body);
		font-size: 0.88rem;
		color: var(--ink-3);
	}

	.toc-inline nav {
		padding: 0 0.6rem 0.8rem;
	}

	.layout ol {
		display: grid;
		gap: 0.1rem;
	}

	.layout ol a {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.5rem;
		padding: 0.35rem 0.6rem;
		border-radius: 10px;
		color: var(--ink-2);
		font-size: 0.95rem;
		line-height: 1.35;
		text-decoration: none;
	}

	.layout ol a:hover {
		background: var(--panel-2);
		color: var(--ink);
	}

	.layout ol a[aria-current] {
		background: var(--panel-2);
		color: var(--t);
		font-weight: 700;
	}

	.to-pack a {
		color: var(--gold);
		font-weight: 700;
	}

	.rail {
		display: none;
	}

	.rail-title {
		margin: 0 0 0.4rem 0.6rem;
		font-family: var(--display);
		font-weight: 800;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.75rem;
		color: var(--ink-2);
		font-weight: 700;
		text-decoration: none;
	}

	.back:hover {
		color: var(--ink);
	}

	/* The difficulty frame: every lesson opens inside a border in its level colour. */
	.cover {
		margin-top: 0.4rem;
		padding: 1.1rem 1.1rem 1.2rem;
		border-radius: 28px;
		border: 2px solid var(--lv);
		background: var(--panel);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-bottom: 0.9rem;
	}

	.assumes {
		margin-top: 0.9rem;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.assumes strong {
		color: var(--lv);
	}

	h1 {
		font-size: clamp(2.1rem, 7vw, 3.3rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.dek {
		margin-top: 1rem;
		font-size: 1.2rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 1rem;
	}

	.prose {
		margin-top: 2rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		background: var(--ground);
		border: 1px solid var(--rule);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.chip.gold {
		color: var(--gold);
		border-color: rgb(255 201 74 / 0.35);
	}

	.chip.done {
		color: var(--structures);
		border-color: rgb(31 207 169 / 0.35);
	}

	.packzone,
	.practice {
		margin-top: 3rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
		line-height: 1.15;
		margin-bottom: 0.6rem;
	}

	.packzone > p {
		font-size: 1.05rem;
		color: var(--ink-2);
	}

	.big {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		min-height: 3.25rem;
		padding: 0 1.4rem;
		border-radius: 999px;
		border: 0;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		text-decoration: none;
		cursor: pointer;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.big:hover {
		transform: translateY(-2px);
	}

	.big:active {
		transform: translateY(1px) scale(0.98);
	}

	.big.gold {
		width: 100%;
		margin-top: 1rem;
		background: var(--gold);
		color: #1d1400;
	}

	.ghost {
		min-height: 3rem;
		padding: 0 1.4rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-weight: 800;
		cursor: pointer;
	}

	.pack {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.slot {
		position: relative;
		aspect-ratio: 5 / 7;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		perspective: 1000px;
		border-radius: 16px;
	}

	.side {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		transition: transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: var(--d);
	}

	.side.f {
		transform: rotateY(180deg);
	}

	.slot.flipped .side.b {
		transform: rotateY(-180deg);
	}

	.slot.flipped .side.f {
		transform: rotateY(0);
	}

	.slot:not(.flipped):hover .side.b {
		transform: translateY(-4px) rotate(-1.5deg);
		transition-delay: 0ms;
	}

	.after {
		margin-top: 1.25rem;
		display: flex;
		justify-content: center;
	}

	.practice ul {
		display: grid;
		gap: 0.5rem;
	}

	.practice a {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.1rem 1rem;
		padding: 0.85rem 1.1rem;
		border-radius: 18px;
		background: var(--panel);
		border: 1px solid var(--rule);
		text-decoration: none;
	}

	.practice a:hover {
		border-color: var(--t);
	}

	.p-title {
		font-weight: 700;
	}

	.p-meta {
		grid-row: 2;
		font-size: 0.88rem;
		color: var(--ink-3);
	}

	.practice a :global(svg) {
		grid-row: 1 / span 2;
		grid-column: 2;
		color: var(--t);
	}

	.next {
		display: grid;
		gap: 0.2rem;
		margin-top: 3rem;
		padding: 1.3rem 1.3rem 1.4rem;
		border-radius: 24px;
		background: var(--t);
		color: var(--t-ink);
		text-decoration: none;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.next:hover {
		transform: translateY(-2px);
	}

	.next-level {
		margin-bottom: 0.4rem;
	}

	.next-title {
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.6rem;
		line-height: 1.1;
		letter-spacing: -0.025em;
	}

	.next-sum {
		font-weight: 600;
	}

	@media (min-width: 640px) {
		.cover {
			padding: 1.6rem 1.75rem 1.7rem;
		}
	}

	@media (min-width: 900px) {
		.cover {
			display: grid;
			grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 1fr);
			column-gap: 2.5rem;
			align-items: end;
			padding: 2rem 2.25rem 2.1rem;
		}

		.cover > :not(.facts) {
			grid-column: 1;
		}

		.cover .facts {
			grid-column: 2;
			grid-row: 2 / span 2;
			align-self: end;
			padding: 1.1rem 1.2rem;
			border-radius: 18px;
			background: var(--ground);
		}

		.cover .assumes {
			margin-top: 0;
		}

		.dek {
			max-width: 46rem;
		}
	}

	@media (min-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 15rem;
			column-gap: 3rem;
			align-items: start;
		}

		.toc-inline {
			display: none;
		}

		.rail {
			display: block;
			position: sticky;
			top: 5.5rem;
			margin-top: 2rem;
			max-height: calc(100dvh - 7rem);
			overflow-y: auto;
			padding: 1rem 0.5rem;
			border-radius: 22px;
			border: 1px solid var(--rule);
			background: var(--panel);
		}

		.packzone,
		.practice,
		.next {
			max-width: none;
		}
	}

	@media (min-width: 640px) {
		.pack {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.side {
			transition: none;
		}
	}
</style>
