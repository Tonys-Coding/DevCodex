<script lang="ts">
	import type { ArticleMeta, Track } from '../../content/types';
	import { trackArt } from '../cardArt';
	import Icon from '../Icon.svelte';

	/**
	 * A topic on the Learn page, drawn as a landscape binder card in quiet colours.
	 * It is a disclosure button: pressing it deals out the topic's lesson cards.
	 */
	let {
		track,
		lessons,
		finished,
		number,
		total,
		open,
		matches,
		controls,
		onclick
	}: {
		track: Track;
		lessons: ArticleMeta[];
		finished: number;
		number: number;
		total: number;
		open: boolean;
		/** While searching or filtering: how many lessons match. */
		matches?: number;
		controls: string;
		onclick: () => void;
	} = $props();
</script>

<button type="button" class="topic t-{track.id}" class:open aria-expanded={open} aria-controls={controls} {onclick}>
	<span class="face">
		<span class="art" aria-hidden="true">
			<svg viewBox="0 0 120 64">{@html trackArt[track.id] ?? ''}</svg>
		</span>
		<span class="body">
			<span class="head">
				<span class="title">{track.title}</span>
				<span class="num">#{String(number).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
			</span>
			<span class="blurb">{track.blurb}</span>
			<span class="foot">
				<span class="meta-row">
					<span>{lessons.length} lessons</span>
					{#if matches !== undefined}
						<span class="gold">{matches} {matches === 1 ? 'match' : 'matches'}</span>
					{:else}
						<span class:done={finished > 0}>{finished} finished</span>
					{/if}
				</span>
				<span class="toggle">
					{open ? 'Hide lessons' : 'Show lessons'}
					<Icon name="chevron-right" size={18} stroke={2.5} />
				</span>
			</span>
		</span>
	</span>
</button>

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
		transition:
			transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
			background-color 200ms ease-out;
	}

	.topic:hover {
		transform: translateY(-3px);
	}

	.topic.open {
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

	.open .toggle :global(svg) {
		transform: rotate(90deg);
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
