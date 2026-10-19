<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { progress } from '../../progress/progress.svelte';
	import Icon from '../Icon.svelte';

	/** Hour and date are read in the browser only; the prerendered page shows a neutral welcome. */
	let hour = $state<number | null>(null);
	let todayKey = $state('');
	onMount(() => {
		const now = new Date();
		hour = now.getHours();
		todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	});

	const name = $derived(progress.data.profile?.name);
	const days = $derived(progress.data.days);
	const ready = $derived(progress.loaded && hour !== null);

	const hello = $derived.by(() => {
		if (!ready) return 'Welcome to DevCodex';
		if (days.length === 0) return 'Welcome to DevCodex';
		if (days.includes(todayKey)) return 'Welcome back';
		const h = hour!;
		if (h >= 5 && h < 12) return 'Good morning';
		if (h >= 12 && h < 17) return 'Good afternoon';
		if (h >= 17 && h < 22) return 'Good evening';
		return 'Burning the midnight oil';
	});

	const line = $derived.by(() => {
		if (!ready || days.length === 0) return 'Start with the featured lesson. Every lesson you finish opens a pack of concept cards.';
		const open = progress.inProgress.length;
		if (progress.streak >= 2)
			return days.includes(todayKey)
				? `You’re on a ${progress.streak}-day streak, and today already counts.`
				: `You’re on a ${progress.streak}-day streak. One lesson today keeps it going.`;
		if (open) return `You have ${open} ${open === 1 ? 'lesson' : 'lessons'} in progress. Pick up right where you stopped.`;
		return 'Ready for the next lesson on your path?';
	});

	let editing = $state(false);
	let draft = $state('');
	let field = $state<HTMLInputElement>();

	async function edit() {
		draft = name ?? '';
		editing = true;
		await tick();
		field?.focus();
	}

	function save(event: SubmitEvent) {
		event.preventDefault();
		progress.setName(draft);
		editing = false;
	}
</script>

<!-- The text fades in once progress has loaded. Everything below it appears at the same moment, so nothing jumps. -->
<header class="greeting" class:ready>
	<h1>
		{hello}{#if name}, <span class="name">{name}</span>{/if}.
	</h1>
	<p class="line">{line}</p>

	{#if editing}
		<form class="name-form" onsubmit={save}>
			<label for="greet-name">What should DevCodex call you?</label>
			<div class="row">
				<input id="greet-name" bind:this={field} bind:value={draft} maxlength="40" autocomplete="given-name" placeholder="Your first name" />
				<button type="submit" class="save">Save</button>
				<button type="button" class="cancel" onclick={() => (editing = false)}>Cancel</button>
			</div>
			<p class="note">Stored only on this device.</p>
		</form>
	{:else if progress.loaded && !name}
		<button type="button" class="edit" onclick={edit}>
			<Icon name="pencil" size={16} stroke={2} />
			Add your name
		</button>
	{/if}
</header>

<style>
	h1,
	.line {
		opacity: 0;
		transition: opacity 250ms ease-out;
	}

	.ready h1,
	.ready .line {
		opacity: 1;
	}

	h1 {
		font-size: clamp(2.1rem, 7vw, 3.3rem);
		font-weight: 800;
		line-height: 1.02;
		letter-spacing: -0.04em;
	}

	.name {
		color: var(--gold);
	}

	.line {
		margin-top: 0.6rem;
		max-width: 40rem;
		font-size: 1.2rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.edit {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.75rem;
		margin-top: 0.3rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink-3);
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
	}

	.edit:hover {
		color: var(--ink);
	}

	.name-form {
		margin-top: 0.9rem;
		max-width: 30rem;
	}

	label {
		font-weight: 700;
		color: var(--ink-2);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-top: 0.4rem;
	}

	/* Boxless field: an underline, like the Learn search. */
	input {
		flex: 1 1 12rem;
		min-height: 2.9rem;
		border: 0;
		border-bottom: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-size: 1.12rem;
		outline: none;
	}

	input:focus {
		border-bottom-color: var(--gold);
	}

	.save {
		min-height: 2.9rem;
		padding: 0 1.3rem;
		border: 0;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-family: var(--display);
		font-weight: 800;
		cursor: pointer;
	}

	.cancel {
		min-height: 2.9rem;
		border: 0;
		background: none;
		color: var(--ink-3);
		font-weight: 700;
		cursor: pointer;
	}

	@media (prefers-reduced-motion: reduce) {
		h1,
		.line {
			transition: none;
		}
	}

	.note {
		margin-top: 0.3rem;
		font-size: 0.88rem;
		color: var(--ink-3);
	}
</style>
