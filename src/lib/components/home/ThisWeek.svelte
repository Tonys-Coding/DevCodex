<script lang="ts">
	import { progress } from '../../progress/progress.svelte';
	import { finishedThisWeek, week } from '../../progress/dashboard';
	import Icon from '../Icon.svelte';

	/** This week at a glance: which days had learning, the streak, and the weekly lesson goal. */
	let { now }: { now: Date } = $props();

	const days = $derived(week(now));
	const active = $derived(new Set(progress.data.days));
	const learnedToday = $derived(days.some((d) => d.today && active.has(d.key)));
	const atRisk = $derived(progress.streak > 0 && !learnedToday && now.getHours() >= 17);

	const goal = $derived(progress.data.profile?.weeklyGoal ?? 2);
	const done = $derived(finishedThisWeek(progress.data, now));
	const ratio = $derived(Math.min(1, done / goal));
	// Ring geometry: r = 26 on a 64 box.
	const C = 2 * Math.PI * 26;
</script>

<section class="week" id="this-week" aria-labelledby="week-title">
	<h2 id="week-title">This week</h2>

	<ol class="days" aria-label="Days with learning this week">
		{#each days as d (d.key)}
			<li class:on={active.has(d.key)} class:today={d.today} class:future={d.future}>
				<span class="dot" aria-hidden="true">{#if active.has(d.key)}<Icon name="check" size={14} stroke={3} />{/if}</span>
				<span class="day" aria-hidden="true">{d.short}</span>
				<span class="visually-hidden">{d.long}{d.today ? ', today' : ''}: {active.has(d.key) ? 'learned' : d.future ? 'still to come' : 'no learning'}</span>
			</li>
		{/each}
	</ol>

	<p class="streak">
		<Icon name="flame" size={20} stroke={2} />
		{#if progress.streak > 0}
			<strong>{progress.streak}-day streak.</strong>
			{atRisk ? `Learn today to keep it.` : learnedToday ? 'Today counts.' : 'Learn today to add a day.'}
		{:else}
			<strong>No streak yet.</strong> Any lesson, review or solved problem starts one.
		{/if}
	</p>

	<div class="goal">
		<svg viewBox="0 0 64 64" aria-hidden="true">
			<circle class="track" cx="32" cy="32" r="26" />
			<circle class="fill" cx="32" cy="32" r="26" stroke-dasharray="{ratio * C} {C}" />
		</svg>
		<div class="goal-text">
			<p><strong>{done} of {goal}</strong> {goal === 1 ? 'lesson' : 'lessons'} this week{done >= goal ? '. Goal met!' : ''}</p>
			<div class="stepper" role="group" aria-label="Weekly lesson goal">
				<button type="button" onclick={() => progress.setWeeklyGoal(goal - 1)} disabled={goal <= 1} aria-label="Lower the goal">−</button>
				<span>Goal: {goal} a week</span>
				<button type="button" onclick={() => progress.setWeeklyGoal(goal + 1)} disabled={goal >= 7} aria-label="Raise the goal">+</button>
			</div>
		</div>
	</div>
</section>

<style>
	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.025em;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.3rem;
		margin-top: 0.9rem;
		max-width: 24rem;
	}

	.days li {
		display: grid;
		justify-items: center;
		gap: 0.3rem;
	}

	.dot {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 2px solid var(--rule);
		color: #2a1003;
	}

	.on .dot {
		border-color: var(--web);
		background: var(--web);
	}

	.today .dot {
		box-shadow: 0 0 0 3px var(--ground), 0 0 0 5px var(--ink-3);
	}

	.future .dot {
		border-style: dashed;
		opacity: 0.6;
	}

	.day {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink-3);
	}

	.today .day {
		color: var(--ink);
	}

	.streak {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.2rem 0.45rem;
		margin-top: 1rem;
		color: var(--ink-2);
	}

	.streak :global(svg) {
		color: var(--web);
	}

	.streak strong {
		color: var(--ink);
	}

	.goal {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.1rem;
	}

	.goal svg {
		flex: none;
		width: 4.25rem;
		height: 4.25rem;
		transform: rotate(-90deg);
	}

	circle {
		fill: none;
		stroke-width: 7;
	}

	.track {
		stroke: var(--panel-2);
	}

	.fill {
		stroke: var(--gold);
		stroke-linecap: round;
		transition: stroke-dasharray 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.goal-text p {
		color: var(--ink-2);
	}

	.goal-text strong {
		color: var(--ink);
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.2rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.stepper button {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 2px solid var(--rule);
		border-radius: 50%;
		background: none;
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 800;
		cursor: pointer;
	}

	.stepper button:hover:not(:disabled) {
		border-color: var(--gold);
	}

	.stepper button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: none;
		}
	}
</style>
