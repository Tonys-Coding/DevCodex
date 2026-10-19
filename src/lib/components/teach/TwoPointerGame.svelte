<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '../Icon.svelte';

	let { nums, target }: { nums: number[]; target: number } = $props();

	let i = $state(0);
	let j = $state(untrack(() => nums.length - 1));
	let moves = $state(0);
	let message = $state('Pick a move. Which pointer should step inward?');
	let tone = $state<'info' | 'bad' | 'good'>('info');

	const sum = $derived(nums[i] + nums[j]);
	const done = $derived(sum === target || i >= j);
	const pairs = $derived((nums.length * (nums.length - 1)) / 2);

	function move(side: 'left' | 'right') {
		if (done) return;
		const right = sum < target ? 'left' : 'right';
		if (side !== right) {
			tone = 'bad';
			message =
				sum < target
					? `${nums[i]} + ${nums[j]} = ${sum} is already too small. Moving the right pointer can only pick a smaller number.`
					: `${nums[i]} + ${nums[j]} = ${sum} is already too big. Moving the left pointer can only pick a bigger number.`;
			return;
		}
		if (side === 'left') i++;
		else j--;
		moves++;
		tone = 'info';
		if (nums[i] + nums[j] === target) {
			tone = 'good';
			message = `${nums[i]} + ${nums[j]} = ${target}. Found in ${moves} move${moves === 1 ? '' : 's'}. Checking every pair could take ${pairs}.`;
		} else {
			message = side === 'left' ? `Too small, so the left pointer stepped right to ${nums[i]}.` : `Too big, so the right pointer stepped left to ${nums[j]}.`;
		}
	}

	function reset() {
		i = 0;
		j = nums.length - 1;
		moves = 0;
		tone = 'info';
		message = 'Pick a move. Which pointer should step inward?';
	}
</script>

<section class="game" aria-label="Two pointer game">
	<div class="head">
		<h3>Find two that sum to {target}</h3>
		<span class="moves">{moves} move{moves === 1 ? '' : 's'}</span>
	</div>

	<ol class="row" aria-label="Sorted numbers">
		{#each nums as n, k (k)}
			<li class:l={k === i} class:r={k === j} class:out={k < i || k > j} class:win={sum === target && (k === i || k === j)}>
				<span class="num">{n}</span>
				<span class="tag" aria-hidden="true">{k === i ? 'L' : k === j ? 'R' : ''}</span>
				<span class="visually-hidden">{k === i ? 'left pointer' : k === j ? 'right pointer' : k < i || k > j ? 'ruled out' : ''}</span>
			</li>
		{/each}
	</ol>

	<p class="sum">
		<span>{nums[i]} + {nums[j]} =</span>
		<strong class:hit={sum === target}>{sum}</strong>
		<span class="cmp">{sum === target ? 'match' : sum < target ? `too small (target ${target})` : `too big (target ${target})`}</span>
	</p>

	<p class="msg {tone}" aria-live="polite">{message}</p>

	<div class="controls">
		{#if done}
			<button class="go" type="button" onclick={reset}>Play again <Icon name="refresh" stroke={2} /></button>
		{:else}
			<button class="ghost" type="button" onclick={() => move('left')}>Move L <Icon name="arrow-right" stroke={2} /></button>
			<button class="ghost" type="button" onclick={() => move('right')}><Icon name="arrow-left" stroke={2} /> Move R</button>
		{/if}
	</div>
</section>

<style>
	.game {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.moves {
		flex: none;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: 0.3rem;
		margin-top: 1rem;
	}

	.row li {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
	}

	.num {
		display: grid;
		place-items: center;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 14px;
		background: var(--panel-2);
		font-family: var(--display);
		font-weight: 800;
		font-size: clamp(0.9rem, 3.4vw, 1.2rem);
		transition: background 200ms ease-out, opacity 200ms ease-out, color 200ms ease-out;
	}

	.out .num {
		opacity: 0.3;
	}

	.l .num,
	.r .num {
		background: var(--t);
		color: var(--t-ink);
	}

	.win .num {
		background: var(--gold);
		color: #1d1400;
	}

	.tag {
		min-height: 1.2rem;
		font-family: var(--mono);
		font-weight: 800;
		font-size: 0.8rem;
		color: var(--t);
	}

	.sum {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 0.6rem;
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 700;
	}

	.sum strong {
		font-size: 1.6rem;
	}

	.sum strong.hit {
		color: var(--gold);
	}

	.cmp {
		color: var(--ink-2);
		font-size: 1.05rem;
	}

	.msg {
		margin-top: 0.6rem;
		padding: 0.75rem 0.95rem;
		border-radius: 14px;
		background: var(--ground);
		line-height: 1.5;
	}

	.msg.bad {
		box-shadow: inset 0 0 0 2px var(--miss);
	}

	.msg.good {
		box-shadow: inset 0 0 0 2px var(--gold);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.go,
	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 3.25rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.05rem;
		cursor: pointer;
	}

	.go {
		border: 0;
		background: var(--t);
		color: var(--t-ink);
	}

	.ghost {
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
	}

	.ghost:hover {
		border-color: var(--t);
	}

	@media (min-width: 640px) {
		.game {
			padding: 1.5rem;
		}
	}
</style>
