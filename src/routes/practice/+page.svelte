<script lang="ts">
	import { resolve } from '$app/paths';
	import { problems, patterns } from '#lib/content/problems.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';

	const solved = $derived(problems.filter((p) => progress.data.solved[p.id]).length);
	const colour: Record<string, string> = {
		'Arrays & Hashing': 't-structures',
		'Two Pointers': 't-web',
		'Sliding Window': 't-programming',
		Stack: 't-structures'
	};
</script>

<svelte:head>
	<title>Practice · DevCodex</title>
</svelte:head>

<div class="practice">
	<header class="head">
		<h1>Practice</h1>
		<p>Classic interview patterns, written in plain words. Solve them in Python or JavaScript, right in the browser.</p>
		<p class="solved"><strong>{solved}</strong> of {problems.length} solved</p>
	</header>

	{#each patterns as pattern (pattern)}
		{@const list = problems.filter((p) => p.pattern === pattern)}
		<section class="group {colour[pattern]}" aria-labelledby="pat-{pattern}">
			<h2 id="pat-{pattern}">{pattern}</h2>
			<ul>
				{#each list as p (p.id)}
					{@const done = progress.data.solved[p.id]}
					<li>
						<a href={resolve('/practice/[slug]', { slug: p.id })} class:done>
							<span class="state" aria-hidden="true">
								{#if done}<Icon name="check" size={18} stroke={3} />{/if}
							</span>
							<span class="title">{p.title}</span>
							<span class="meta">
								<span class="diff {p.difficulty.toLowerCase()}">{p.difficulty}</span>
								{#if done}<span class="visually-hidden">, solved</span>{/if}
							</span>
							<Icon name="arrow-right" size={18} stroke={2} />
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.practice {
		display: grid;
		gap: 2rem;
		max-width: 52rem;
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

	.solved {
		font-variant-numeric: tabular-nums;
	}

	.solved strong {
		color: var(--gold);
	}

	h2 {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--t);
		margin-bottom: 0.6rem;
	}

	ul {
		display: grid;
		gap: 0.5rem;
	}

	a {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.85rem;
		min-height: 3.6rem;
		padding: 0.6rem 1rem;
		border-radius: 18px;
		background: var(--panel);
		border: 2px solid var(--rule);
		text-decoration: none;
		transition: border-color 200ms ease-out;
	}

	a:hover {
		border-color: var(--t);
	}

	.state {
		display: grid;
		place-items: center;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
		border: 2px solid var(--rule);
	}

	a.done .state {
		background: var(--t);
		border-color: var(--t);
		color: var(--t-ink);
	}

	.title {
		font-weight: 700;
	}

	.diff {
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 800;
		background: var(--panel-2);
		color: var(--ink-2);
	}

	/* Same colours as article levels: Easy = entry green, Medium = experienced blue. */
	.diff.easy {
		color: var(--entry);
	}

	.diff.medium {
		color: var(--experienced);
	}
</style>
