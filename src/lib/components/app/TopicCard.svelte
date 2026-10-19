<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta, Track } from '../../content/types';
	import { trackArt } from '../cardArt';
	import { progress } from '../../progress/progress.svelte';
	import Icon from '../Icon.svelte';

	/**
	 * A topic on the Learn page, drawn as a landscape binder card in quiet colours.
	 * It links to the topic's own page, so the Learn grid scales to any number of topics.
	 */
	let {
		track,
		lessons,
		number,
		total,
		matches
	}: {
		track: Track;
		lessons: ArticleMeta[];
		number: number;
		total: number;
		/** While filtering by level: how many lessons match. */
		matches?: { count: number; label: string };
	} = $props();

	const minutes = $derived(lessons.reduce((n, a) => n + a.minutes, 0));
	const finished = $derived(lessons.filter((a) => progress.isDone(a.id)).length);
	const started = $derived(lessons.some((a) => !progress.isDone(a.id) && !!progress.data.reading?.[a.id]));
</script>

<!-- The accessible name is short; the blurb and counts are its description. -->
<a
	class="topic t-{track.id}"
	class:active={started}
	href={resolve('/learn/topic/[track]', { track: track.id })}
	aria-label="{track.title}, {lessons.length} lessons"
	aria-describedby="topic-desc-{track.id}"
>
	<span class="face">
		<span class="art" aria-hidden="true">
			<svg viewBox="0 0 120 64">{@html trackArt[track.id] ?? ''}</svg>
		</span>
		<span class="body">
			<span class="head">
				<span class="title">{track.title}</span>
				<span class="num">#{String(number).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
			</span>
			<span class="blurb" id="topic-desc-{track.id}">{track.blurb}<span class="visually-hidden"> {finished} of {lessons.length} finished, about {minutes} minutes in all.</span></span>
			<span class="segs" aria-hidden="true">
				{#each lessons as a (a.id)}
					<i class="lv-{a.level}" class:on={progress.isDone(a.id)} class:reading={!progress.isDone(a.id) && !!progress.data.reading?.[a.id]}></i>
				{/each}
			</span>
			<span class="foot">
				<span class="meta-row">
					<span>{lessons.length} lessons · about {minutes} min</span>
					{#if matches}
						<span class="gold">{matches.count} {matches.label}</span>
					{:else}
						<span class:done={finished > 0}>{finished} finished</span>
					{/if}
				</span>
				<span class="toggle">
					{finished === lessons.length && lessons.length ? 'Review topic' : started || finished ? 'Continue' : 'Open topic'}
					<Icon name="arrow-right" size={18} stroke={2.5} />
				</span>
			</span>
		</span>
	</span>
</a>

<style>
	/* Same build as the binder's concept card (frame, face, art window, footer), turned sideways and quietened. */
	.topic {
		display: block;
		width: 100%;
		height: 100%;
		padding: 6px;
		border: 0;
		border-radius: 16px;
		background: var(--panel-2);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		box-shadow: 0 18px 36px -18px rgb(0 0 0 / 0.85);
		text-decoration: none;
		transition:
			transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
			background-color 200ms ease-out;
	}

	.topic:hover {
		transform: translateY(-3px);
	}

	/* A topic with a lesson under way gets a muted frame in its colour. */
	.topic.active,
	.topic:hover,
	.topic:focus-visible {
		background: color-mix(in srgb, var(--t) 38%, var(--panel-2));
	}

	.face {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: 1rem;
		height: 100%;
		padding: 0.9rem;
		border-radius: 10px;
		background: var(--panel);
	}

	.art {
		display: grid;
		place-items: center;
		border-radius: 8px;
		background: color-mix(in srgb, var(--t) 9%, var(--ground));
	}

	.art svg {
		width: 82%;
		overflow: visible;
		fill: none;
		stroke: color-mix(in srgb, var(--t) 70%, var(--ink-2));
		stroke-width: 3.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.art :global(.hot) {
		fill: color-mix(in srgb, var(--t) 70%, var(--ink-2));
	}

	.art :global(.cut) {
		stroke: var(--panel);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.title {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.num {
		flex: none;
		padding-top: 0.2rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.blurb {
		font-size: 0.95rem;
		line-height: 1.45;
		color: var(--ink-2);
	}

	/* One segment per lesson: filled in its level colour once finished, striped once started. */
	.segs {
		display: grid;
		grid-auto-flow: column;
		gap: 4px;
	}

	.segs i {
		height: 7px;
		border-radius: 3px;
		background: var(--panel-2);
	}

	.segs i.on {
		background: var(--lv);
	}

	.segs i.reading {
		background: repeating-linear-gradient(-45deg, var(--lv) 0 3px, transparent 3px 6px);
		box-shadow: inset 0 0 0 1px var(--lv);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem 1rem;
		margin-top: auto;
	}

	.foot .meta-row {
		font-size: 0.88rem;
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--t);
	}

	.toggle :global(svg) {
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.topic:hover .toggle :global(svg) {
		transform: translateX(3px);
	}

	/* Phones keep the sideways card: a narrower art window and a smaller title. */
	@media (max-width: 480px) {
		.face {
			grid-template-columns: minmax(0, 0.6fr) minmax(0, 1.4fr);
			gap: 0.8rem;
			padding: 0.75rem;
		}

		.title {
			font-size: 1.2rem;
		}

		.blurb {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.topic,
		.toggle :global(svg) {
			transition: none;
		}
	}
</style>
