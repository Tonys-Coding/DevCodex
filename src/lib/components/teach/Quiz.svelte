<script lang="ts" module>
	export type QuizQuestion = {
		prompt: string;
		options: string[];
		answer: number;
		explain: string;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '../Icon.svelte';

	let { questions, title = 'Quick check' }: { questions: QuizQuestion[]; title?: string } = $props();
	const uid = $props.id();
	let picks = $state<(number | null)[]>(untrack(() => questions.map(() => null)));
	const right = $derived(picks.filter((p, i) => p === questions[i].answer).length);
	const answered = $derived(picks.filter((p) => p !== null).length);
</script>

<section class="quiz" class:single={questions.length === 1} aria-labelledby="{uid}-title">
	<div class="head">
		<h2 id="{uid}-title">{title}</h2>
		{#if questions.length > 1}<span class="score">{right}/{questions.length}</span>{/if}
	</div>
	{#each questions as q, qi (qi)}
		{@const pick = picks[qi]}
		<div class="q">
			<p class="prompt" id="{uid}-q{qi}">{q.prompt}</p>
			<div class="answers" role="group" aria-labelledby="{uid}-q{qi}">
				{#each q.options as option, oi (oi)}
					<button
						type="button"
						class:right={pick !== null && oi === q.answer}
						class:wrong={pick === oi && oi !== q.answer}
						aria-pressed={pick === oi}
						onclick={() => (picks[qi] = oi)}
					>
						<span>{option}</span>
						{#if pick !== null && oi === q.answer}<Icon name="check" stroke={2.5} />{/if}
					</button>
				{/each}
			</div>
			{#if pick !== null}
				<p class="feedback" class:ok={pick === q.answer} role="status">
					<strong>{pick === q.answer ? 'Nice.' : 'Not quite.'}</strong>
					{q.explain}
				</p>
			{/if}
		</div>
	{/each}
	{#if questions.length > 1 && answered === questions.length}
		<p class="total" role="status">{right === questions.length ? 'All correct.' : `${right} of ${questions.length} correct. The explanations above show where the others went.`}</p>
	{/if}
</section>

<style>
	.quiz {
		margin-top: 2.5rem;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.score {
		font-family: var(--display);
		font-weight: 800;
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	.q + .q {
		margin-top: 1.6rem;
	}

	/* Wide article column: questions sit side by side as cards. */
	@container prose (min-width: 46rem) {
		.quiz {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1rem;
		}

		.head,
		.total,
		.single .q {
			grid-column: 1 / -1;
		}

		.q {
			padding: 0.4rem 1.2rem 1.2rem;
			border-radius: 22px;
			border: 1px solid var(--rule);
			background: var(--panel);
		}

		.q + .q {
			margin-top: 0;
		}
	}

	.prompt {
		margin: 0.7rem 0 0.8rem;
		font-size: 1.12rem;
		font-weight: 700;
	}

	.answers {
		display: grid;
		gap: 0.55rem;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3.4rem;
		padding: 0.75rem 1.05rem;
		border-radius: 18px;
		border: 2px solid var(--rule);
		background: var(--panel);
		color: var(--ink);
		font: inherit;
		font-size: 1.05rem;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition: transform 160ms ease-out;
	}

	button:hover {
		border-color: var(--ink-3);
	}

	button:active {
		transform: scale(0.98);
	}

	button.right {
		border-color: var(--structures);
		background: rgb(31 207 169 / 0.12);
	}

	button.wrong {
		border-color: var(--miss);
		background: rgb(255 107 129 / 0.1);
	}

	.feedback {
		margin-top: 0.8rem;
		padding: 0.85rem 1rem;
		border-radius: 16px;
		background: var(--panel);
		color: var(--ink-2);
	}

	.feedback strong {
		color: var(--miss);
	}

	.feedback.ok strong {
		color: var(--structures);
	}

	.total {
		margin-top: 1.2rem;
		font-weight: 700;
		color: var(--ink-2);
	}
</style>
