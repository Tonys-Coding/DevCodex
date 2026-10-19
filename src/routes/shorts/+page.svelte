<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { shorts } from '#lib/content/shorts.js';
	import ShortCard from '#lib/components/app/ShortCard.svelte';

	let feed = $state<HTMLElement>();

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (!feed || target.closest('input, textarea')) return;
		const step = event.key === 'j' || event.key === 'PageDown' ? 1 : event.key === 'k' || event.key === 'PageUp' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		feed.scrollBy({ top: step * feed.clientHeight, behavior: prefersReducedMotion.current ? 'auto' : 'smooth' });
	}
</script>

<svelte:head>
	<title>Shorts · DevCodex</title>
</svelte:head>
<svelte:window {onkeydown} />

<h1 class="visually-hidden">Shorts</h1>
<div class="feed" bind:this={feed} aria-label="Shorts feed. Scroll, swipe, or press J and K.">
	{#each shorts as short, i (short.id)}
		<div class="slot">
			<ShortCard {short} index={i} total={shorts.length} />
		</div>
	{/each}
</div>

<style>
	.feed {
		height: calc(100dvh - 4rem - 6.5rem - env(safe-area-inset-bottom) - env(safe-area-inset-top));
		margin: -0.5rem 0 0;
		overflow-y: auto;
		scroll-snap-type: y mandatory;
		overscroll-behavior: contain;
		scrollbar-width: none;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		grid-auto-rows: 100%;
	}

	.feed::-webkit-scrollbar {
		display: none;
	}

	.slot {
		scroll-snap-align: start;
		scroll-snap-stop: always;
		max-width: 28rem;
		width: 100%;
		min-width: 0;
		margin-inline: auto;
	}

	@media (min-width: 900px) {
		.feed {
			height: calc(100dvh - 9rem);
			margin: 0;
		}
	}
</style>
