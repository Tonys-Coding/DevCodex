<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
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
	import { requirements, type QuizInfo } from '../../progress/requirements';

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

	// Quick checks inside the article record their scores against this id, and register so the pack can wait for them.
	setContext('devcodex:article', () => meta.id);
	let quizzes = $state<QuizInfo[]>([]);
	setContext('devcodex:quizzes', (quiz: QuizInfo) => {
		if (!quizzes.some((q) => q.key === quiz.key)) quizzes = [...quizzes, quiz];
	});

	/** What still stands between the reader and the pack. */
	const checklist = $derived(requirements(progress.data, meta, toc.map((t) => t.id), quizzes));
	const unlocked = $derived(checklist.every((r) => r.met));

	/**
	 * Active reading time: counted in 5-second ticks while the tab is visible and the
	 * reader has scrolled, pointed, typed or tapped in the last minute.
	 */
	$effect(() => {
		const id = meta.id;
		if (done) return;
		let lastActive = Date.now();
		const active = () => (lastActive = Date.now());
		const events = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;
		for (const e of events) window.addEventListener(e, active, { passive: true });
		const tick = setInterval(() => {
			if (document.visibilityState === 'visible' && Date.now() - lastActive < 60_000) progress.readTime(id, 5);
		}, 5000);
		return () => {
			clearInterval(tick);
			for (const e of events) window.removeEventListener(e, active);
		};
	});

	let proseEl = $state<HTMLElement>();

	/**
	 * The section being read: the last heading that has scrolled past the top band.
	 * The same pass records reading progress for "Pick up where you left off".
	 */
	let current = $state('');
	$effect(() => {
		const ids = toc.map((t) => t.id);
		const id = meta.id;
		// Re-run once stored progress has loaded, so simply opening an article counts as starting it.
		void progress.loaded;
		let frame = 0;
		const update = () => {
			frame = 0;
			let at = '';
			for (const tocId of ids) {
				const el = document.getElementById(tocId);
				if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) at = tocId;
			}
			current = at;
			if (proseEl && progress.loaded && !progress.isDone(id)) {
				const r = proseEl.getBoundingClientRect();
				const percent = (window.innerHeight - r.top) / Math.max(r.height, 1);
				const entry = toc.find((t) => t.id === at);
				progress.read(id, percent, entry ? { id: entry.id, text: entry.text } : undefined);
			}
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		// First pass on the next frame, outside this effect, so recording progress never re-triggers it.
		frame = requestAnimationFrame(update);
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
		<p class="tags meta-row">
			<LevelTag level={meta.level} />
			<span>{track.title}</span>
		</p>
		<h1>{meta.title}</h1>
		<p class="dek">{meta.dek}</p>
		<div class="facts">
			<p class="assumes"><strong>Assumes:</strong> {meta.assumes}</p>
			<p class="chips meta-row">
				<span><Icon name="clock" size={16} stroke={2} /> {meta.minutes} min</span>
				<span>{toc.length} sections</span>
				{#if done}
					<span class="done"><Icon name="check" size={16} stroke={2.5} /> Finished</span>
				{:else}
					<span class="gold"><Icon name="cards" size={16} stroke={2} /> {pack.length} cards inside</span>
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

			<div class="prose" bind:this={proseEl}>
				{@render children()}
			</div>

			<section class="packzone" aria-labelledby="pack-title">
				{#if !done}
					<h2 id="pack-title">{unlocked ? 'Your pack is ready' : 'Earn your pack'}</h2>
					<p>
						{unlocked
							? `You worked through it. Open your pack of ${pack.length} concept cards; they join your binder and trivia deck.`
							: `A pack of ${pack.length} concept cards opens once you have really worked through this lesson:`}
					</p>
					<ul class="checklist">
						{#each checklist as r (r.id)}
							<li class:met={r.met}>
								<span class="tick" aria-hidden="true">{#if r.met}<Icon name="check" size={16} stroke={3} />{/if}</span>
								<span class="what">
									<span class="label">{r.label}</span>
									<span class="detail">{r.detail}</span>
									{#if !r.met}<span class="line" aria-hidden="true"><i style="transform: scaleX({r.ratio})"></i></span>{/if}
								</span>
								<span class="visually-hidden">{r.met ? 'Done.' : 'Not done yet.'}</span>
							</li>
						{/each}
					</ul>
					<button class="big gold" type="button" onclick={open} disabled={!unlocked} aria-describedby={unlocked ? undefined : 'pack-locked'}>
						<Icon name={unlocked ? 'spark' : 'lock'} stroke={2} /> {unlocked ? 'Finish and open pack' : 'Pack locked'}
					</button>
					{#if !unlocked}<p class="locked-note" id="pack-locked">The checklist updates as you read. Nothing is sent anywhere.</p>{/if}
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
		margin-top: 1rem;
	}

	.prose {
		margin-top: 2rem;
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

	/* The pack checklist: plain rows, a tick per requirement, a thin line toward each one. */
	.checklist {
		display: grid;
		gap: 0.2rem;
		margin-top: 1rem;
	}

	.checklist li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.8rem;
		align-items: start;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.tick {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		border: 2px solid var(--rule);
		color: #032a21;
	}

	.met .tick {
		border-color: var(--structures);
		background: var(--structures);
	}

	.what {
		display: grid;
		gap: 0.15rem;
	}

	.label {
		font-weight: 800;
	}

	.met .label {
		color: var(--ink-2);
	}

	.detail {
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.line {
		height: 4px;
		margin-top: 0.35rem;
		border-radius: 3px;
		background: var(--panel-2);
		overflow: hidden;
	}

	.line i {
		display: block;
		height: 100%;
		background: var(--gold);
		transform-origin: left;
		transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.locked-note {
		margin-top: 0.6rem;
		font-size: 0.95rem;
		color: var(--ink-3);
	}

	.big.gold {
		width: 100%;
		margin-top: 1rem;
		background: var(--gold);
		color: #1d1400;
	}

	/* Locked: same size and place as the open button, clearly not pressable yet. */
	.big.gold:disabled {
		background: var(--panel-2);
		color: var(--ink-3);
		cursor: not-allowed;
		transform: none;
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
