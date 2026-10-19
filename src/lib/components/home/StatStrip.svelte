<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '../Icon.svelte';

	/** Key numbers. Each one is a link to where that number grows. One swipeable row on phones. */
	let {
		lessons,
		cards,
		problems,
		streak,
		minutes
	}: {
		lessons: [number, number];
		cards: [number, number];
		problems: [number, number];
		streak: number;
		minutes: number;
	} = $props();
</script>

<nav class="stats" aria-label="Your numbers">
	<a href={resolve('/learn')}><span class="n"><strong>{lessons[0]}</strong>/{lessons[1]}</span><span class="l">Lessons</span></a>
	<a href={resolve('/trivia')}><span class="n"><strong>{cards[0]}</strong>/{cards[1]}</span><span class="l">Cards</span></a>
	<a href={resolve('/practice')}><span class="n"><strong>{problems[0]}</strong>/{problems[1]}</span><span class="l">Problems</span></a>
	<a href="#this-week"><span class="n streak"><Icon name="flame" size={22} stroke={2} /><strong>{streak}</strong></span><span class="l">Day streak</span></a>
	<a href={resolve('/you')}><span class="n"><strong>{minutes}</strong></span><span class="l">Minutes learned</span></a>
</nav>

<style>
	.stats {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(6.25rem, 1fr);
		gap: 0.5rem;
		margin-inline: -1rem;
		padding: 0.25rem 1rem 0.5rem;
		overflow-x: auto;
		scroll-snap-type: x proximity;
		scroll-padding-inline: 1rem;
		scrollbar-width: none;
	}

	a {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-height: 3.5rem;
		padding: 0.35rem 0.25rem;
		border-radius: 10px;
		color: inherit;
		text-decoration: none;
		scroll-snap-align: start;
	}

	a:hover .l {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--gold);
		text-underline-offset: 0.25em;
	}

	.n {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	strong {
		font-size: 1.6rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
	}

	.streak {
		color: var(--web);
	}

	.l {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-2);
		white-space: nowrap;
	}

	@media (min-width: 900px) {
		.stats {
			margin-inline: 0;
			padding-inline: 0;
			overflow: visible;
		}

		strong {
			font-size: 2.1rem;
		}
	}
</style>
