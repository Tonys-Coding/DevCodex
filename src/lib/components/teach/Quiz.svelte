<script lang="ts" module>
	export type QuizQuestion = {
		prompt: string;
		options: string[];
		answer: number;
		explain: string;
	};
</script>

<script lang="ts">
	import { getContext, onMount, tick, untrack } from 'svelte';
	import { progress } from '../../progress/progress.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import Icon from '../Icon.svelte';

	/**
	 * One question at a time. Answering locks the choice and shows feedback; the
	 * learner moves on when ready, and the last step shows the score.
	 */
	let { questions, title = 'Quick check' }: { questions: QuizQuestion[]; title?: string } = $props();
	const uid = $props.id();
	let picks = $state<(number | null)[]>(untrack(() => questions.map(() => null)));
	let at = $state(0);
	let prompt = $state<HTMLElement>();

	const q = $derived(questions[at]);
	const pick = $derived(at < questions.length ? picks[at] : null);
	const finished = $derived(at >= questions.length);
	const right = $derived(picks.filter((p, i) => p === questions[i].answer).length);
	const many = $derived(questions.length > 1);
	const enter = $derived({ x: prefersReducedMotion.current ? 0 : 24, duration: prefersReducedMotion.current ? 0 : 320, easing: cubicOut });

	/** Inside an article, the best score is kept for the dashboard and achievements. */
	const articleId = getContext<(() => string) | undefined>('devcodex:article');
	// The article's pack waits until every quick check in it is passed.
	const register = getContext<((quiz: { key: string; title: string; total: number }) => void) | undefined>('devcodex:quizzes');
	onMount(() => {
		const id = articleId?.();
		if (id) register?.({ key: `${id}:${title}`, title, total: questions.length });
	});

	/** A check finished on an earlier visit opens on its best score instead of starting over. */
	let restored = $state<{ best: number; total: number } | null>(null);
	let checkedStore = false;
	$effect(() => {
		if (checkedStore || !progress.loaded) return;
		checkedStore = true;
		const id = articleId?.();
		const record = id ? progress.data.quizzes?.[`${id}:${title}`] : undefined;
		if (record && questions.length > 1 && untrack(() => at === 0 && picks.every((p) => p === null))) {
			restored = { best: record.best, total: record.total };
			at = questions.length;
		}
	});
	const score = $derived(restored ? restored.best : right);
	function record() {
		const id = articleId?.();
		if (id) progress.quiz(`${id}:${title}`, right, questions.length);
	}

	async function next() {
		at += 1;
		if (at === questions.length) record();
		await tick();
		prompt?.focus();
	}

	async function restart() {
		restored = null;
		picks = questions.map(() => null);
		at = 0;
		await tick();
		prompt?.focus();
	}
</script>

<section class="quiz" aria-labelledby="{uid}-title">
	<div class="head">
		<h2 id="{uid}-title">{title}</h2>
		{#if many}
			<span class="progress" aria-hidden="true">
				{#each questions as question, i (i)}
					<i class:now={i === at} class:right={picks[i] !== null && picks[i] === question.answer} class:wrong={picks[i] !== null && picks[i] !== question.answer}></i>
				{/each}
			</span>
		{/if}
	</div>

	{#key at}
		<div class="stage" in:fly={enter}>
			{#if !finished}
				{#if many}<p class="count">Question {at + 1} of {questions.length}</p>{/if}
				<p class="prompt" id="{uid}-q" tabindex="-1" bind:this={prompt}>{q.prompt}</p>
				<div class="answers" role="group" aria-labelledby="{uid}-q">
					{#each q.options as option, oi (oi)}
						<button
							type="button"
							class:right={pick !== null && oi === q.answer}
							class:wrong={pick === oi && oi !== q.answer}
							aria-pressed={pick === oi}
							disabled={pick !== null && pick !== oi && oi !== q.answer}
							onclick={() => {
								if (pick !== null) return;
								picks[at] = oi;
								if (!many) record();
							}}
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
					{#if many}
						<button type="button" class="go" onclick={next}>
							{at === questions.length - 1 ? 'See your score' : 'Next question'}
							<Icon name="arrow-right" stroke={2} />
						</button>
					{/if}
				{/if}
			{:else}
				<p class="prompt" tabindex="-1" bind:this={prompt}>
					{restored ? 'Best so far: ' : ''}{score === questions.length ? (restored ? `${score} of ${questions.length}, all correct.` : 'All correct.') : `${score} of ${questions.length} correct.`}
				</p>
				<p class="summary" role="status">
					{score === questions.length
						? 'You have this one down.'
						: score / questions.length >= 0.6
							? 'Enough to pass. Run through it again to lock in the rest.'
							: `Each question showed why its answer is right. ${Math.ceil(questions.length * 0.6)} of ${questions.length} passes; try it again.`}
				</p>
				<button type="button" class="go ghost" onclick={restart}><Icon name="refresh" stroke={2} /> Try again</button>
			{/if}
		</div>
	{/key}
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

	.progress {
		display: flex;
		gap: 5px;
	}

	.progress i {
		width: 1.4rem;
		height: 6px;
		border-radius: 3px;
		background: var(--panel-2);
	}

	.progress i.now {
		background: var(--ink-3);
	}

	.progress i.right {
		background: var(--structures);
	}

	.progress i.wrong {
		background: var(--miss);
	}

	.stage {
		max-width: 46rem;
	}

	.count {
		margin-top: 1rem;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.prompt {
		margin: 0.35rem 0 0.9rem;
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.015em;
	}

	.prompt:focus {
		outline: none;
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

	button:hover:not(:disabled) {
		border-color: var(--ink-3);
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
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

	/* Feedback reads as plain text under the answers, no box around it. */
	.feedback {
		margin-top: 1rem;
		color: var(--ink-2);
		line-height: 1.6;
	}

	.feedback strong {
		color: var(--miss);
	}

	.feedback.ok strong {
		color: var(--structures);
	}

	.summary {
		color: var(--ink-2);
	}

	.go {
		display: inline-flex;
		justify-content: center;
		gap: 0.55rem;
		min-height: 3.25rem;
		margin-top: 1.25rem;
		padding: 0 1.4rem;
		border-radius: 999px;
		border: 0;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--display);
		font-size: 1.05rem;
		font-weight: 800;
	}

	.go:hover:not(:disabled) {
		border-color: transparent;
	}

	.go.ghost {
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
	}
</style>
