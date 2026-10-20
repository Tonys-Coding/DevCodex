<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '../Icon.svelte';

	/**
	 * Binary search, played by hand: the lab shows the middle of what's left, and the
	 * reader decides which half can still hold the target. A linear-search counter runs
	 * alongside so the difference in steps is visible.
	 */
	let { nums }: { nums: number[] } = $props();

	const first = untrack(() => nums[Math.floor(nums.length * 0.7)]);
	let target = $state(first);
	let lo = $state(0);
	let hi = $state(untrack(() => nums.length - 1));
	let steps = $state(0);
	let message = $state('Compare the middle number with the target, then keep the half that could still hold it.');
	let tone = $state<'info' | 'bad' | 'good'>('info');

	const mid = $derived(Math.floor((lo + hi) / 2));
	const empty = $derived(lo > hi);
	const found = $derived(!empty && nums[mid] === target);
	const done = $derived(found || empty);
	/** What a left-to-right scan would have needed. */
	const linear = $derived(nums.includes(target) ? nums.indexOf(target) + 1 : nums.length);

	function keep(side: 'left' | 'right') {
		if (done) return;
		const right = target < nums[mid] ? 'left' : 'right';
		if (side !== right) {
			tone = 'bad';
			message =
				target < nums[mid]
					? `${target} is smaller than ${nums[mid]}. In a sorted list everything to the right is bigger still, so it can’t be there.`
					: `${target} is bigger than ${nums[mid]}. Everything to the left is smaller still, so it can’t be there.`;
			return;
		}
		const was = nums[mid];
		if (side === 'left') hi = mid - 1;
		else lo = mid + 1;
		steps++;
		tone = 'info';
		if (lo > hi) {
			tone = 'good';
			message = `Nothing left to search, so ${target} isn’t in the list. You proved it in ${steps} step${steps === 1 ? '' : 's'}; a scan checks all ${nums.length}.`;
		} else if (nums[Math.floor((lo + hi) / 2)] === target) {
			tone = 'good';
			message = `Found ${target} in ${steps + 1} looks. Scanning from the left would take ${linear}.`;
		} else {
			message = `${target} is ${side === 'left' ? 'smaller' : 'bigger'} than ${was}, so the ${side === 'left' ? 'right' : 'left'} half is gone. ${hi - lo + 1} left to search.`;
		}
	}

	function start(next: number) {
		target = next;
		lo = 0;
		hi = nums.length - 1;
		steps = 0;
		tone = 'info';
		message = 'Compare the middle number with the target, then keep the half that could still hold it.';
		if (nums[Math.floor((nums.length - 1) / 2)] === next) {
			tone = 'good';
			message = `Lucky: ${next} is right in the middle. Found in 1 look.`;
		}
	}

	/** Usually a number from the list; sometimes one that isn't there, to show how a miss ends. */
	function another() {
		if (Math.random() < 0.25) {
			const gaps = nums.map((n) => n + 1).filter((n) => !nums.includes(n) && n !== target);
			if (gaps.length) return start(gaps[Math.floor(Math.random() * gaps.length)]);
		}
		const pool = nums.filter((n) => n !== target);
		start(pool[Math.floor(Math.random() * pool.length)]);
	}
</script>

<section class="game" aria-label="Binary search lab">
	<div class="head">
		<h3>Find <span class="target">{target}</span></h3>
		<span class="steps">{steps} step{steps === 1 ? '' : 's'}</span>
	</div>

	<ol class="row" aria-label="Sorted numbers">
		{#each nums as n, k (k)}
			<li class:out={!empty && (k < lo || k > hi)} class:all-out={empty} class:mid={!empty && k === mid} class:win={found && k === mid}>
				<span class="num">{n}</span>
				<span class="tag" aria-hidden="true">{!empty && k === mid ? 'mid' : !empty && k === lo ? 'lo' : !empty && k === hi ? 'hi' : ''}</span>
				<span class="visually-hidden">{!empty && k === mid ? 'middle' : !empty && (k < lo || k > hi) ? 'ruled out' : ''}</span>
			</li>
		{/each}
	</ol>

	{#if !empty}
		<p class="cmp">
			<span>Middle is</span>
			<strong class:hit={found}>{nums[mid]}</strong>
			<span class="soft">{found ? 'that’s the target' : target < nums[mid] ? `target ${target} is smaller` : `target ${target} is bigger`}</span>
		</p>
	{/if}

	<p class="msg {tone}" aria-live="polite">{message}</p>

	<div class="controls">
		{#if done}
			<button class="go" type="button" onclick={another}>Try another number <Icon name="refresh" stroke={2} /></button>
		{:else}
			<button class="ghost" type="button" onclick={() => keep('left')}><Icon name="arrow-left" stroke={2} /> Keep the left half</button>
			<button class="ghost" type="button" onclick={() => keep('right')}>Keep the right half <Icon name="arrow-right" stroke={2} /></button>
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

	.target {
		color: var(--gold);
	}

	.steps {
		flex: none;
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.6rem, 1fr));
		gap: 0.3rem;
		margin-top: 1rem;
	}

	.row li {
		display: grid;
		justify-items: center;
		gap: 0.2rem;
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
		font-size: 1.05rem;
		font-variant-numeric: tabular-nums;
		transition: background 200ms ease-out, opacity 200ms ease-out, color 200ms ease-out;
	}

	.out .num,
	.all-out .num {
		opacity: 0.25;
	}

	.mid .num {
		background: var(--t);
		color: var(--t-ink);
	}

	.win .num {
		background: var(--gold);
		color: #1d1400;
	}

	.tag {
		min-height: 1.1rem;
		font-family: var(--mono);
		font-weight: 800;
		font-size: 0.8rem;
		color: var(--t);
	}

	.cmp {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 0.6rem;
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 700;
	}

	.cmp strong {
		font-size: 1.6rem;
	}

	.cmp strong.hit {
		color: var(--gold);
	}

	.soft {
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
