<script lang="ts" module>
	import type { Depth, ArticleMeta } from '../../content/types';
	import type { TocEntry } from '../../content/article-markup';
	import type { QuizInfo } from '../../progress/requirements';

	/** What the article shell shares with its layers. */
	export type LayerContext = {
		isOpen: (depth: Exclude<Depth, 'core'>) => boolean;
		setOpen: (depth: Exclude<Depth, 'core'>, open: boolean) => void;
		article: () => ArticleMeta;
		sections: () => TocEntry[];
		quizzes: () => QuizInfo[];
	};
</script>

<script lang="ts">
	import { getContext, tick, type Snippet } from 'svelte';
	import { depthById } from '../../content/levels';
	import { bonusCards } from '../../content/cards';
	import { progress } from '../../progress/progress.svelte';
	import { layerRequirements } from '../../progress/requirements';
	import Icon from '../Icon.svelte';
	import CollectCard from '../CollectCard.svelte';

	/**
	 * An optional layer of a lesson: Going deeper or Under the hood. Closed, it is one
	 * header line saying what's inside; open, its sections read like the rest of the
	 * article and end with a small checklist and a bonus card.
	 */
	let { depth, summary, children }: { depth: Exclude<Depth, 'core'>; summary: string; children: Snippet } = $props();

	const ctx = getContext<LayerContext>('devcodex:layers');
	const info = $derived(depthById(depth));
	const open = $derived(ctx?.isOpen(depth) ?? true);
	const article = $derived(ctx?.article());
	const sections = $derived((ctx?.sections() ?? []).filter((s) => s.depth === depth));
	const minutes = $derived(Math.max(1, Math.round(sections.reduce((n, s) => n + s.words, 0) / 160)));
	const bonus = $derived(article ? bonusCards(article.id, depth) : []);
	const coreDone = $derived(article ? progress.isDone(article.id) : false);
	const done = $derived(article ? progress.layerDone(article.id, depth) : false);
	const checklist = $derived(article ? layerRequirements(progress.data, article.id, depth, ctx.sections(), ctx.quizzes()) : []);
	const ready = $derived(checklist.length > 0 && checklist.every((r) => r.met));

	let head = $state<HTMLElement>();
	let justCollected = $state(false);

	async function toggle() {
		ctx?.setOpen(depth, !open);
		if (open) return;
		await tick();
		head?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	}

	function collect() {
		if (!article) return;
		progress.finishLayer(article.id, depth);
		justCollected = true;
	}
</script>

<section class="layer {depth}" class:open data-layer={depth} aria-labelledby="layer-{depth}-title">
	<header class="layer-head" bind:this={head}>
		<div class="title-row">
			<span class="pips" aria-hidden="true">{#each [1, 2, 3] as n (n)}<i class:on={n <= info.pips}></i>{/each}</span>
			<h2 id="layer-{depth}-title" class="layer-title">{info.label}</h2>
			{#if done}<span class="done"><Icon name="check" size={16} stroke={3} /> Finished</span>{/if}
		</div>
		<p class="summary">{summary}</p>
		<p class="meta">
			<span>{sections.length} {sections.length === 1 ? 'section' : 'sections'} · about {minutes} min</span>
			{#if bonus.length}<span class="gold"><Icon name="cards" size={15} stroke={2} /> {bonus.length} bonus {bonus.length === 1 ? 'card' : 'cards'}</span>{/if}
		</p>
		<button type="button" class="toggle" aria-expanded={open} aria-controls="layer-{depth}-body" onclick={toggle}>
			{open ? `Close ${info.label}` : `Open ${info.label}`}
			<Icon name="chevron-right" size={18} stroke={2.5} />
		</button>
	</header>

	<div class="prose layer-body" id="layer-{depth}-body" hidden={!open}>
		{@render children()}

		<div class="layer-end">
			{#if done}
				<p class="end-title">{justCollected ? 'Bonus collected' : `${info.label}: finished`}</p>
				{#if bonus.length}
					<div class="bonus" class:fresh={justCollected}>
						{#each bonus as card (card.id)}
							<div class="bonus-card"><CollectCard {card} fresh={progress.isNew(card)} tilt={false} /></div>
						{/each}
					</div>
				{/if}
			{:else}
				<p class="end-title">Finish {info.label}</p>
				<ul class="end-steps">
					{#each checklist as r (r.id)}
						<li class:met={r.met}>
							<span class="tick" aria-hidden="true">{#if r.met}<Icon name="check" size={13} stroke={3} />{/if}</span>
							<span><strong>{r.label}</strong> <span class="detail">{r.detail}</span></span>
							<span class="visually-hidden">{r.met ? 'Done.' : 'Not done yet.'}</span>
						</li>
					{/each}
				</ul>
				<button type="button" class="collect" onclick={collect} disabled={!ready || !coreDone}>
					<Icon name={ready && coreDone ? 'spark' : 'lock'} size={18} stroke={2} />
					{bonus.length ? `Collect ${bonus.length === 1 ? 'the bonus card' : 'the bonus cards'}` : `Mark ${info.label} finished`}
				</button>
				{#if ready && !coreDone}<p class="hint">Open the lesson’s Core pack first; the bonus joins it.</p>{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	/* A layer is set off by a full-width rule and its own heading, not a box. */
	.layer {
		margin: 3rem 0 0;
		padding-top: 1.25rem;
		border-top: 2px solid var(--rule);
	}

	.layer.hood {
		border-top-style: double;
		border-top-width: 4px;
	}

	.title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 0.7rem;
	}

	.pips {
		display: inline-flex;
		align-items: flex-end;
		gap: 3px;
		color: var(--gold);
	}

	.pips i {
		width: 5px;
		border-radius: 3px;
		background: currentColor;
		opacity: 0.3;
	}

	.pips i:nth-child(1) {
		height: 9px;
	}
	.pips i:nth-child(2) {
		height: 13px;
	}
	.pips i:nth-child(3) {
		height: 17px;
	}

	.pips i.on {
		opacity: 1;
	}

	.layer-title {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.done {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--structures);
	}

	.summary {
		margin-top: 0.4rem;
		max-width: 52rem;
		font-size: 1.12rem;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.25rem;
		margin-top: 0.4rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.gold {
		color: var(--gold);
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 3rem;
		margin-top: 0.6rem;
		padding: 0 1.2rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-weight: 800;
		cursor: pointer;
	}

	.toggle:hover {
		border-color: var(--gold);
	}

	.toggle :global(svg) {
		transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.open .toggle :global(svg) {
		transform: rotate(90deg);
	}

	.layer-body {
		margin-top: 1rem;
	}

	/* The end of a layer: what's left, then the bonus. */
	.layer-end {
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.end-title {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
	}

	.end-steps {
		display: grid;
		gap: 0.3rem;
		margin-top: 0.6rem;
	}

	.end-steps li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem;
		align-items: start;
		font-size: 1.05rem;
	}

	.tick {
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		margin-top: 0.15rem;
		border-radius: 50%;
		border: 2px solid var(--rule);
		color: #032a21;
	}

	.met .tick {
		border-color: var(--structures);
		background: var(--structures);
	}

	.detail {
		color: var(--ink-2);
	}

	.collect {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 3rem;
		margin-top: 1rem;
		padding: 0 1.3rem;
		border: 0;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-family: var(--display);
		font-weight: 800;
		cursor: pointer;
	}

	.collect:disabled {
		background: var(--panel-2);
		color: var(--ink-3);
		cursor: not-allowed;
	}

	.hint {
		margin-top: 0.5rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.bonus {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.8rem;
	}

	.bonus-card {
		width: 10rem;
	}

	.bonus.fresh .bonus-card {
		animation: deal-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes deal-in {
		from {
			opacity: 0;
			transform: translateY(-24px) rotate(-6deg) scale(0.92);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toggle :global(svg) {
			transition: none;
		}

		.bonus.fresh .bonus-card {
			animation: none;
		}
	}
</style>
