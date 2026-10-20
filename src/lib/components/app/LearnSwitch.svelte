<script lang="ts">
	import { resolve } from '$app/paths';
	import { briefs } from '../../content/briefs';
	import { progress } from '../../progress/progress.svelte';

	/**
	 * The two ways to read on Learn: Paths (topics, in order) and TL;DR (short ungrouped
	 * reads). Text tabs, the current one underlined in gold, like the level filter.
	 */
	let { current }: { current: 'paths' | 'tldr' } = $props();

	const unread = $derived(progress.loaded ? briefs.filter((b) => !progress.briefRead(b.id)).length : 0);
</script>

<nav class="switch" aria-label="Ways to read">
	<a href={resolve('/learn')} aria-current={current === 'paths' ? 'page' : undefined}>Paths</a>
	<a href={resolve('/learn/tldr')} aria-current={current === 'tldr' ? 'page' : undefined}>
		TL;DR
		{#if unread}<span class="unread">{unread} unread</span>{/if}
	</a>
</nav>

<style>
	.switch {
		display: flex;
		gap: 0 1.75rem;
		border-bottom: 1px solid var(--rule);
	}

	a {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		min-height: 3rem;
		padding-top: 0.6rem;
		margin-bottom: -1px;
		border-bottom: 3px solid transparent;
		color: var(--ink-3);
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
		text-decoration: none;
	}

	a:hover {
		color: var(--ink);
	}

	a[aria-current='page'] {
		color: var(--ink);
		border-bottom-color: var(--gold);
	}

	.unread {
		font-family: var(--body);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--gold);
	}
</style>
