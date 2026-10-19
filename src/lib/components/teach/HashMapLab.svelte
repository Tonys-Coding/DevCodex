<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	const [send, receive] = crossfade({ duration: () => (prefersReducedMotion.current ? 0 : 420), easing: cubicOut });

	/** A deliberately simple hash: add up the character codes. */
	const codes = (key: string) => [...key].map((c) => c.codePointAt(0) ?? 0);
	const hash = (key: string) => codes(key).reduce((sum, c) => sum + c, 0);

	let size = $state(8);
	let keys = $state<string[]>(['ada', 'grace', 'linus', 'alan']);
	let draft = $state('');
	let focus = $state<{ key: string; found: boolean; compared: number; action: 'add' | 'find' } | null>(null);

	const buckets = $derived(Array.from({ length: size }, (_, i) => keys.filter((k) => hash(k) % size === i)));
	const load = $derived(keys.length / size);
	const longest = $derived(Math.max(...buckets.map((b) => b.length)));

	const target = $derived(draft.trim().toLowerCase());
	const math = $derived(target ? `${codes(target).join(' + ')} = ${hash(target)}, and ${hash(target)} mod ${size} = ${hash(target) % size}` : '');

	function add() {
		if (!target || target.length > 12) return;
		const bucket = buckets[hash(target) % size];
		const exists = bucket.includes(target);
		if (!exists) keys = [...keys, target];
		focus = { key: target, found: exists, compared: bucket.length, action: 'add' };
		draft = '';
	}

	function find() {
		if (!target) return;
		const bucket = buckets[hash(target) % size];
		const index = bucket.indexOf(target);
		focus = { key: target, found: index >= 0, compared: index >= 0 ? index + 1 : bucket.length, action: 'find' };
	}

	const focusBucket = $derived(focus ? hash(focus.key) % size : -1);
</script>

<section class="lab" aria-label="Hash map lab">
	<div class="head">
		<h3>Hash map lab</h3>
		<span class="meta">{keys.length} keys · {size} buckets · load {load.toFixed(2)}</span>
	</div>

	<form
		class="entry"
		onsubmit={(e) => {
			e.preventDefault();
			add();
		}}
	>
		<label class="visually-hidden" for="hm-key">Key</label>
		<input id="hm-key" bind:value={draft} placeholder="Type a name, e.g. ada" maxlength="12" autocomplete="off" autocapitalize="off" spellcheck="false" />
		<button type="submit" class="go">Add</button>
		<button type="button" class="ghost" onclick={find}>Find</button>
	</form>
	<p class="math" aria-live="polite">
		{#if math}<code>hash("{target}") = {math}</code>{:else}Type a key to see which bucket it lands in.{/if}
	</p>

	<ol class="buckets">
		{#each buckets as bucket, i (i)}
			<li class:hot={i === focusBucket} class:crowded={bucket.length > 1}>
				<span class="idx">{i}</span>
				<ul>
					{#each bucket as key (key)}
						<li class="key" class:me={focus?.key === key} in:receive={{ key }} out:send={{ key }}>{key}</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>

	{#if focus}
		<p class="result" role="status">
			{#if focus.action === 'find'}
				{focus.found
					? `Found "${focus.key}" in bucket ${focusBucket} after checking ${focus.compared} key${focus.compared === 1 ? '' : 's'}.`
					: `"${focus.key}" is not here. Bucket ${focusBucket} held ${focus.compared} key${focus.compared === 1 ? '' : 's'} to rule out.`}
			{:else if focus.found}
				"{focus.key}" was already in bucket {focusBucket}. Maps keep one entry per key.
			{:else if focus.compared > 0}
				Collision: "{focus.key}" shares bucket {focusBucket} with {focus.compared} other key{focus.compared === 1 ? '' : 's'}. Lookups there now check a short list.
			{:else}
				"{focus.key}" went straight into empty bucket {focusBucket}.
			{/if}
		</p>
	{/if}

	<div class="foot">
		<p>Longest bucket: <strong>{longest}</strong>. Try <code>ada</code> and then <code>daa</code>: this toy hash ignores letter order, so they always collide.</p>
		<div class="actions">
			<button type="button" class="ghost" onclick={() => (size = size === 8 ? 16 : 8)}>
				{size === 8 ? 'Grow to 16 buckets' : 'Shrink to 8 buckets'}
			</button>
			<button
				type="button"
				class="ghost"
				onclick={() => {
					keys = ['ada', 'grace', 'linus', 'alan'];
					size = 8;
					focus = null;
				}}>Reset</button
			>
		</div>
	</div>
</section>

<style>
	.lab {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.3rem 1rem;
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.meta {
		font-weight: 700;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
		font-size: 0.88rem;
	}

	.entry {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.9rem;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 3rem;
		padding: 0 1rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: var(--ground);
		color: var(--ink);
		font-family: var(--mono);
		font-size: 1.05rem;
		caret-color: var(--gold);
	}

	input:focus-visible {
		border-color: var(--t);
		outline: none;
	}

	.go,
	.ghost {
		min-height: 3rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		font-family: var(--display);
		font-weight: 800;
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

	.math {
		margin-top: 0.6rem;
		min-height: 1.5em;
		font-size: 0.95rem;
		color: var(--ink-2);
		overflow-wrap: anywhere;
	}

	.math code {
		font-size: 0.8rem;
	}

	.buckets {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.45rem;
		margin-top: 0.8rem;
	}

	.buckets > li {
		min-height: 5.2rem;
		padding: 0.45rem;
		border-radius: 14px;
		background: var(--ground);
		border: 2px solid transparent;
		transition: border-color 200ms ease-out;
	}

	.buckets > li.crowded {
		border-color: color-mix(in oklab, var(--miss) 55%, transparent);
	}

	.buckets > li.hot {
		border-color: var(--gold);
	}

	.idx {
		display: block;
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		margin-bottom: 0.25rem;
	}

	.buckets ul {
		display: grid;
		gap: 0.25rem;
	}

	.key {
		padding: 0.2rem 0.4rem;
		border-radius: 8px;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.key.me {
		background: var(--gold);
		color: #1d1400;
	}

	.result {
		margin-top: 0.8rem;
		padding: 0.75rem 0.95rem;
		border-radius: 14px;
		background: var(--ground);
		line-height: 1.5;
	}

	.foot {
		margin-top: 0.9rem;
		color: var(--ink-2);
		font-size: 0.95rem;
		line-height: 1.55;
	}

	.foot code {
		font-size: 0.88em;
		color: var(--ink);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.8rem;
	}

	@media (min-width: 640px) {
		.lab {
			padding: 1.5rem;
		}

		.buckets {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}
</style>
