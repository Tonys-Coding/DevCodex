<script lang="ts">
	import { depths } from '../../content/levels';
	import { progress } from '../../progress/progress.svelte';

	/** Shown until the first real progress: how DevCodex works, and where the path should start. */
	const steps = [
		{ title: 'Read a lesson', body: 'Short, hands-on articles with labs you can poke at, written for your level.' },
		{ title: 'Collect its cards', body: 'Finishing a lesson opens a pack of concept cards for your binder.' },
		{ title: 'Keep them sharp', body: 'Swipe through the trivia deck. Cards you miss come back first.' },
		{ title: 'Practice in code', body: 'Solve interview-style problems in Python or JavaScript, right here.' }
	];
	const chosen = $derived(progress.data.profile?.depth);
</script>

<section class="onboard" aria-labelledby="onboard-title">
	<h2 id="onboard-title">How DevCodex works</h2>
	<ol>
		{#each steps as step, i (step.title)}
			<li>
				<span class="num" aria-hidden="true">{i + 1}</span>
				<span class="title">{step.title}</span>
				<span class="body">{step.body}</span>
			</li>
		{/each}
	</ol>

	<fieldset class="level">
		<legend>How deep do you want to go?</legend>
		<div class="options">
			{#each depths as l (l.id)}
				<label class="depth" class:on={chosen === l.id}>
					<input
						type="radio"
						name="start-depth"
						class="visually-hidden"
						checked={chosen === l.id}
						onchange={() => progress.setDepth(l.id)}
					/>
					<span class="pips" aria-hidden="true">
						{#each [1, 2, 3] as n (n)}<i class:on={n <= l.pips}></i>{/each}
					</span>
					<span class="name">{l.label}</span>
					<span class="blurb">{l.blurb}</span>
				</label>
			{/each}
		</div>
		<p class="hint">{chosen ? 'Lessons now open to this depth. Every layer stays one tap away, and you can change this on the You page.' : 'Every lesson has these three layers. Pick how many open by default; the rest stay one tap away.'}</p>
	</fieldset>
</section>

<style>
	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	/* Four steps, boxless: a big numeral, a title and one line. */
	ol {
		display: grid;
		gap: 1.25rem;
		margin-top: 1rem;
	}

	li {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 0.9rem;
	}

	.num {
		grid-row: span 2;
		font-family: var(--display);
		font-size: 2.1rem;
		font-weight: 800;
		line-height: 1;
		color: var(--gold);
	}

	.title {
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 800;
	}

	.body {
		color: var(--ink-2);
		line-height: 1.5;
	}

	.level {
		margin: 2rem 0 0;
		padding: 0;
		border: 0;
	}

	legend {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
	}

	.options {
		display: grid;
		gap: 0.25rem;
		margin-top: 0.6rem;
	}

	/* Each choice is a row underlined in its level colour when picked. */
	label {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 0.7rem;
		align-items: center;
		padding: 0.7rem 0;
		border-bottom: 2px solid var(--rule);
		cursor: pointer;
	}

	label.on {
		border-bottom-color: var(--gold);
	}

	label:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	.pips {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		color: var(--gold);
	}

	.pips i {
		width: 4px;
		border-radius: 3px;
		background: currentColor;
		opacity: 0.3;
	}

	.pips i:nth-child(1) {
		height: 7px;
	}
	.pips i:nth-child(2) {
		height: 10px;
	}
	.pips i:nth-child(3) {
		height: 13px;
	}

	.pips i.on {
		opacity: 1;
	}

	.name {
		font-weight: 800;
		color: var(--ink);
	}

	.blurb {
		grid-column: 2;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.hint {
		margin-top: 0.7rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	@media (min-width: 900px) {
		ol {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.options {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1.5rem;
		}
	}
</style>
