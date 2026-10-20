<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta, Track } from '../../content/types';
	import { progress } from '../../progress/progress.svelte';
	import { isoScenes, frames } from '../isoScenes';
	import IsoArt from '../IsoArt.svelte';
	import Icon from '../Icon.svelte';

	/**
	 * A topic on the Learn page: an isometric banner across the top, then the title,
	 * blurb, progress and next step. It links to the topic's own page, so the Learn grid
	 * scales to any number of topics.
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
		<span class="banner" aria-hidden="true">
			<span class="art"><IsoArt scene={isoScenes[track.id] ?? []} frame={frames.topic} /></span>
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
	/* Same build as the binder's concept card (frame, face, art window, footer), quietened. */
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
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 10px;
		background: var(--panel);
		overflow: hidden;
	}

	/* The banner: a faint isometric model of the topic on a soft glow of its colour. */
	.banner {
		position: relative;
		--art-ground: color-mix(in srgb, var(--t) 6%, var(--ground));
		display: block;
		aspect-ratio: 16 / 7;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--t) 14%, transparent), transparent 70%),
			var(--art-ground);
		opacity: 0.92;
	}

	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 0.5rem;
		min-width: 0;
		padding: 0.9rem 1rem 1rem;
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
		margin-top: 0.2rem;
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
		padding-top: 0.2rem;
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

	/* The picture fills the banner's fixed shape instead of stretching it. */
	.art {
		position: absolute;
		inset: 1.1rem 2.2rem 0.8rem;
		display: block;
	}

	/* Phones: a shorter banner and a smaller title. */
	@media (max-width: 480px) {
		.banner {
			aspect-ratio: 5 / 2;
		}

		.title {
			font-size: 1.2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.topic,
		.toggle :global(svg) {
			transition: none;
		}
	}
</style>
