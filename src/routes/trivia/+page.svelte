<script lang="ts">
	import { resolve } from '$app/paths';
	import { prefersReducedMotion } from 'svelte/motion';
	import { articleById, trackById } from '#lib/content/catalog.js';
	import { cardById } from '#lib/content/cards.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import CollectCard from '#lib/components/CollectCard.svelte';

	/** This sitting's queue of card ids. Missed cards go to the back and come round again. */
	let queue = $state<string[]>([]);
	let started = $state(false);
	let knew = $state(0);
	let again = $state(0);

	$effect(() => {
		if (progress.loaded && !started) {
			queue = progress.deck.map((c) => c.id);
			started = true;
		}
	});

	const card = $derived(queue.length ? cardById(queue[0]) : undefined);
	const upcoming = $derived(queue.slice(1, 3).map((id) => cardById(id)!));

	let flipped = $state(false);
	let dx = $state(0);
	let dragging = $state(false);
	let leaving = $state<0 | 1 | -1>(0);
	let startX = 0;
	let moved = false;

	function decide(dir: 1 | -1) {
		if (leaving || !card) return;
		leaving = dir;
		const id = card.id;
		progress.grade(id, dir === 1);
		if (dir === 1) knew++;
		else again++;
		setTimeout(
			() => {
				queue = dir === 1 ? queue.slice(1) : [...queue.slice(1), id];
				flipped = false;
				leaving = 0;
				dx = 0;
			},
			prefersReducedMotion.current ? 0 : 260
		);
	}

	function restart() {
		queue = progress.deck.map((c) => c.id);
		knew = again = 0;
	}

	function down(e: PointerEvent) {
		startX = e.clientX;
		moved = false;
		dragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		dx = e.clientX - startX;
		if (Math.abs(dx) > 6) moved = true;
	}
	function up() {
		if (!dragging) return;
		dragging = false;
		if (dx > 90) decide(1);
		else if (dx < -90) decide(-1);
		else {
			if (!moved) flipped = !flipped;
			dx = 0;
		}
	}

	function onkeydown(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, a')) return;
		if ((e.key === ' ' || e.key === 'Enter') && t.closest('button')) return;
		if (e.key === 'ArrowRight') decide(1);
		else if (e.key === 'ArrowLeft') decide(-1);
		else if (e.key === ' ' || (e.key === 'Enter' && t.classList.contains('top-card'))) flipped = !flipped;
		else return;
		e.preventDefault();
	}

	const lean = $derived(leaving ? leaving * 600 : dx);
	const lockedSoonest = $derived(
		progress.lockedCards
			.map((c) => ({ card: c, from: articleById(c.unlockedBy!)! }))
			.sort((a, b) => Number(a.from.status === 'soon') - Number(b.from.status === 'soon'))
	);
</script>

<svelte:head>
	<title>Trivia · DevCodex</title>
</svelte:head>
<svelte:window {onkeydown} />

<div class="room">
	<header class="head">
		<h1>Trivia deck</h1>
		<p>Tap to flip. Swipe right if you knew it, left to see it again. On a keyboard: Space flips, ← and → decide.</p>
	</header>

	<div class="table">
		{#if !progress.loaded}
			<p class="loading">Shuffling your deck…</p>
		{:else if card}
			<div class="stack">
				{#each upcoming.toReversed() as next, k (next.id + k)}
					<div class="under" style="--k: {upcoming.length - k}">
						<CollectCard card={next} face="back" tilt={false} />
					</div>
				{/each}

				<div
					class="top-card t-{card.track}"
					class:dragging
					class:flipped
					style="--x: {lean}px; --r: {lean / 18}deg"
					role="button"
					tabindex="0"
					aria-label="{card.term}. {flipped ? `Answer: ${card.answer}. ${card.detail}` : card.question} Press space to flip."
					onpointerdown={down}
					onpointermove={move}
					onpointerup={up}
					onpointercancel={up}
				>
					<div class="face front"><CollectCard {card} fresh={progress.isNew(card)} tilt={false} /></div>
					<div class="face back">
						<div class="answer">
							<span class="tag">{trackById(card.track).short} · {card.term}</span>
							<p class="a">{card.answer}</p>
							<p class="d">{card.detail}</p>
						</div>
					</div>
					<span class="stamp yes" style="opacity: {Math.max(0, Math.min(1, lean / 90))}">Knew it</span>
					<span class="stamp no" style="opacity: {Math.max(0, Math.min(1, -lean / 90))}">Again</span>
				</div>
			</div>

			<div class="choices">
				<button class="choice no" type="button" onclick={() => decide(-1)} aria-label="Again: show it later">
					<Icon name="refresh" size={26} stroke={2.5} />
				</button>
				<button class="choice flip" type="button" onclick={() => (flipped = !flipped)} aria-label="Flip card">
					<Icon name="flip" size={22} stroke={2.5} />
				</button>
				<button class="choice yes" type="button" onclick={() => decide(1)} aria-label="I knew it">
					<Icon name="check" size={28} stroke={2.5} />
				</button>
			</div>
			<p class="tally"><strong>{knew}</strong> knew · <strong>{again}</strong> again · {queue.length} left</p>
		{:else}
			<div class="cleared">
				<h2>Deck cleared</h2>
				<p>{knew} known this round. Cards you missed most will come up first next time.</p>
				<button class="go" type="button" onclick={restart}>Shuffle again <Icon name="refresh" stroke={2} /></button>
			</div>
		{/if}
	</div>

	<section class="locked" aria-labelledby="locked-title">
		<h2 id="locked-title">Still sealed</h2>
		{#if lockedSoonest.length}
			<p class="sub">{lockedSoonest.length} cards unlock as you finish articles.</p>
			<div class="rows">
				{#each lockedSoonest as { card: c, from } (c.id)}
					{#if from.status === 'live'}
						<a class="sealed" href={resolve('/learn/[slug]', { slug: from.id })}>
							<CollectCard card={c} face="locked" tilt={false} lockedHint="Finish “{from.title}”" />
						</a>
					{:else}
						<div class="sealed"><CollectCard card={c} face="locked" tilt={false} lockedHint="“{from.title}” is coming soon" /></div>
					{/if}
				{/each}
			</div>
		{:else}
			<p class="sub">Every card written so far is in your deck.</p>
		{/if}
	</section>
</div>

<style>
	.room {
		display: grid;
		gap: 2rem;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.head p {
		margin-top: 0.4rem;
		color: var(--ink-2);
	}

	.table {
		display: grid;
		justify-items: center;
		gap: 1.25rem;
	}

	.loading {
		color: var(--ink-3);
		padding: 4rem 0;
	}

	.stack {
		position: relative;
		width: min(78vw, 19rem);
		aspect-ratio: 5 / 7;
	}

	.under {
		position: absolute;
		inset: 0;
		transform: translateY(calc(var(--k) * 10px)) scale(calc(1 - var(--k) * 0.04));
		opacity: calc(1 - var(--k) * 0.25);
	}

	.top-card {
		position: absolute;
		inset: 0;
		cursor: grab;
		touch-action: pan-y;
		perspective: 1100px;
		transform: translateX(var(--x)) rotate(var(--r));
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
		border-radius: 16px;
	}

	.top-card.dragging {
		transition: none;
		cursor: grabbing;
	}

	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.back {
		transform: rotateY(180deg);
	}

	.flipped .front {
		transform: rotateY(-180deg);
	}

	.flipped .back {
		transform: rotateY(0);
	}

	.answer {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding: 1.3rem 1.2rem;
		border-radius: 16px;
		background: var(--t);
		color: var(--t-ink);
		box-shadow: 0 18px 36px -18px rgb(0 0 0 / 0.85);
		overflow-y: auto;
	}

	.tag {
		font-weight: 800;
		font-size: 0.86rem;
		opacity: 0.8;
	}

	.a {
		font-family: var(--display);
		font-size: 1.6rem;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.025em;
	}

	.d {
		font-size: 1.05rem;
		line-height: 1.45;
		font-weight: 600;
	}

	.stamp {
		position: absolute;
		top: 1.2rem;
		padding: 0.3rem 0.8rem;
		border-radius: 10px;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.2rem;
		border: 3px solid;
		pointer-events: none;
		background: var(--ground);
	}

	.stamp.yes {
		left: 1rem;
		color: var(--structures);
		rotate: -10deg;
	}

	.stamp.no {
		right: 1rem;
		color: var(--miss);
		rotate: 10deg;
	}

	.choices {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.choice {
		display: grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		border: 0;
		cursor: pointer;
		transition: transform 160ms ease-out;
	}

	.choice:active {
		transform: scale(0.92);
	}

	.choice.no {
		background: var(--panel-2);
		color: var(--miss);
	}

	.choice.yes {
		width: 4.6rem;
		height: 4.6rem;
		background: var(--structures);
		color: #032a21;
	}

	.choice.flip {
		width: 3.2rem;
		height: 3.2rem;
		background: var(--panel);
		color: var(--ink);
		border: 1px solid var(--rule);
	}

	.tally {
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.tally strong {
		color: var(--ink);
	}

	.cleared {
		display: grid;
		justify-items: center;
		gap: 0.6rem;
		padding: 3rem 1rem;
		text-align: center;
	}

	.cleared p {
		color: var(--ink-2);
		max-width: 32ch;
	}

	.go {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 3.25rem;
		margin-top: 0.5rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		border: 0;
		background: var(--gold);
		color: #1d1400;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		cursor: pointer;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.sub {
		margin-top: 0.3rem;
		color: var(--ink-2);
	}

	.rows {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
		gap: 0.9rem;
		margin-top: 0.9rem;
	}

	.sealed {
		display: block;
		border-radius: 16px;
		text-decoration: none;
	}

	a.sealed:hover {
		transform: translateY(-2px);
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@media (min-width: 900px) {
		.room {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			column-gap: 3rem;
			align-items: start;
		}

		.head {
			grid-column: 1 / -1;
		}

		.stack {
			width: 21rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.face,
		.top-card {
			transition: none;
		}
	}
</style>
