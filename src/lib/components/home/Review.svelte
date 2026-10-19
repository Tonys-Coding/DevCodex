<script lang="ts">
	import { resolve } from '$app/paths';
	import { cards } from '../../content/cards';
	import { progress } from '../../progress/progress.svelte';
	import { cardOfDay, dueCards, reviewMinutes } from '../../progress/dashboard';
	import Icon from '../Icon.svelte';
	import CollectCard from '../CollectCard.svelte';

	/** A ten-second review on the dashboard (one card a day), and a sized invitation to the full deck. */
	let { now }: { now: Date } = $props();

	const card = $derived(cardOfDay(progress.unlockedCards, now));
	const due = $derived(dueCards(progress.unlockedCards, progress.data));
	const batch = $derived(Math.min(due.length, 10));
	let revealed = $state(false);
	let graded = $state<'knew' | 'again' | null>(null);

	function grade(knew: boolean) {
		if (!card) return;
		progress.grade(card.id, knew);
		graded = knew ? 'knew' : 'again';
	}
</script>

<section class="review" aria-labelledby="review-title">
	<div class="row-head">
		<h2 id="review-title">Card of the day</h2>
		<p class="count"><strong>{progress.unlockedCards.length}</strong> of {cards.length} cards</p>
	</div>

	{#if card}
		<div class="body">
			<!-- Face down until the answer is revealed, then it turns over. -->
			<div class="card"><CollectCard {card} face={revealed ? 'front' : 'back'} tilt={false} /></div>
			<div class="side">
				<p class="q">{card.question}</p>
				{#if revealed}
					<p class="a">{card.answer}</p>
					<p class="detail">{card.detail}</p>
					{#if graded}
						<p class="thanks" role="status">{graded === 'knew' ? 'Nice. It moves further back in your deck.' : 'It will come back early in your next review.'}</p>
					{:else}
						<div class="grade">
							<button type="button" class="knew" onclick={() => grade(true)}><Icon name="check" size={18} stroke={2.5} /> Knew it</button>
							<button type="button" class="again" onclick={() => grade(false)}><Icon name="refresh" size={18} stroke={2} /> Not yet</button>
						</div>
					{/if}
				{:else}
					<button type="button" class="reveal" onclick={() => (revealed = true)}><Icon name="flip" size={18} stroke={2} /> Reveal the answer</button>
				{/if}
			</div>
		</div>
	{/if}

	<div class="deck">
		{#if batch}
			<p><strong>Review {batch} {batch === 1 ? 'card' : 'cards'}</strong> · about {reviewMinutes(batch)} {reviewMinutes(batch) === 1 ? 'minute' : 'minutes'}</p>
		{:else}
			<p><strong>Your deck is sharp.</strong> Every card you have is known.</p>
		{/if}
		<a class="cta" href={resolve('/trivia')}>{batch ? 'Start review' : 'Play the deck'} <Icon name="arrow-right" size={20} stroke={2} /></a>
	</div>
</section>

<style>
	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.count {
		color: var(--ink-3);
		font-weight: 700;
	}

	.count strong {
		font-family: var(--display);
		font-size: 1.35rem;
		color: var(--gold);
	}

	.body {
		display: grid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: 1.1rem;
		align-items: start;
		margin-top: 1rem;
	}

	.q {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.a {
		margin-top: 0.6rem;
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 800;
		color: var(--gold);
	}

	.detail {
		margin-top: 0.3rem;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.reveal,
	.grade button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.9rem;
		margin-top: 0.8rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-weight: 800;
		cursor: pointer;
	}

	.reveal:hover,
	.grade button:hover {
		border-color: var(--gold);
	}

	.grade {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.5rem;
	}

	.grade .knew {
		color: var(--structures);
	}

	.grade .again {
		color: var(--miss);
	}

	.thanks {
		margin-top: 0.8rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	@media (max-width: 559px) {
		.body {
			grid-template-columns: 6.5rem minmax(0, 1fr);
			gap: 0.9rem;
		}

		.q {
			font-size: 1.05rem;
		}
	}

	.deck {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem 1rem;
		margin-top: 1.4rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.deck p {
		color: var(--ink-2);
	}

	.deck strong {
		color: var(--ink);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 3rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-family: var(--display);
		font-weight: 800;
		text-decoration: none;
	}
</style>
