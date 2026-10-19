<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import type { Achievement } from '../../progress/achievements';
	import { downloadBackup } from '../../progress/dashboard';
	import { progress } from '../../progress/progress.svelte';
	import Icon from '../Icon.svelte';

	/**
	 * Two quiet, dismissible lines: what changed since the last visit, and a backup
	 * reminder while progress exists only in an uninstalled browser.
	 */
	let {
		newLessons,
		newMedals,
		backup
	}: { newLessons: ArticleMeta[]; newMedals: Achievement[]; backup: boolean } = $props();

	let hideWins = $state(false);
	let saved = $state(false);

	const list = (items: string[]) =>
		items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
	const wins = $derived.by(() => {
		const parts: string[] = [];
		if (newLessons.length) parts.push(`collected ${list(newLessons.map((a) => `“${a.title}”`))}`);
		if (newMedals.length) parts.push(`earned ${list(newMedals.map((m) => m.title))}`);
		return parts.join(' and ');
	});

	function exportNow() {
		downloadBackup(progress.export());
		saved = true;
	}
</script>

{#if wins && !hideWins}
	<p class="notice win" role="status">
		<Icon name="trophy" size={20} stroke={2} />
		<span>Since your last visit you {wins}.</span>
		<button type="button" class="x" onclick={() => (hideWins = true)} aria-label="Dismiss"><Icon name="close" size={18} stroke={2} /></button>
	</p>
{/if}

{#if backup}
	<p class="notice backup">
		<Icon name="info" size={20} stroke={2} />
		{#if saved}
			<span>Backup saved. Keep the file somewhere safe; import it on any device from the You page.</span>
		{:else}
			<span>
				Your progress is saved on this device only, and some browsers clear site data after a few weeks away.
				<a href="{resolve('/you')}#install">Install the app</a> or
				<button type="button" class="inline" onclick={exportNow}>export a backup</button>.
			</span>
			<button type="button" class="x" onclick={() => progress.dismissBackup()} aria-label="Remind me later"><Icon name="close" size={18} stroke={2} /></button>
		{/if}
	</p>
{/if}

<style>
	/* A line of text between hairlines, not a box. */
	.notice {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: 0.7rem;
		padding: 0.8rem 0;
		border-block: 1px solid var(--rule);
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.notice + .notice {
		border-top: 0;
	}

	.notice > :global(svg) {
		margin-top: 0.1rem;
	}

	.win {
		color: var(--ink);
	}

	.win > :global(svg) {
		color: var(--gold);
	}

	.backup > :global(svg) {
		color: var(--ink-3);
	}

	a,
	.inline {
		color: var(--gold);
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.inline {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.x {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		margin: -0.6rem -0.6rem -0.6rem 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--ink-3);
		cursor: pointer;
	}

	.x:hover {
		color: var(--ink);
	}
</style>
