<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';

	/** `tip`: an aside worth knowing. `warn`: a pitfall people actually hit. `plain`: an everyday comparison. */
	let { title, tone = 'tip', children }: { title: string; tone?: 'tip' | 'warn' | 'plain'; children: Snippet } = $props();
	const icon = $derived({ tip: 'spark', warn: 'flag', plain: 'info' }[tone]);
</script>

<aside class="note {tone}">
	<p class="title"><Icon name={icon} size={18} stroke={2} />{title}</p>
	<div class="body">{@render children()}</div>
</aside>

<style>
	.note {
		margin: 1.75rem 0;
		padding: 1rem 1.15rem 1.1rem;
		border-radius: 22px;
		background: rgb(255 201 74 / 0.08);
		border: 1px solid rgb(255 201 74 / 0.28);
	}

	.note.warn {
		background: rgb(255 107 129 / 0.08);
		border-color: rgb(255 107 129 / 0.32);
	}

	.note.plain {
		background: var(--panel);
		border-color: var(--rule);
	}

	.title {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-family: var(--display);
		font-weight: 800;
		color: var(--gold);
	}

	.warn .title {
		color: var(--miss);
	}

	.plain .title {
		color: var(--t);
	}

	.body {
		margin-top: 0.35rem;
		line-height: 1.6;
	}

	.body :global(code) {
		font-size: 0.9em;
	}

	.body :global(p + p),
	.body :global(p + ul),
	.body :global(ul + p) {
		margin-top: 0.6rem;
	}

	.body :global(ul) {
		display: grid;
		gap: 0.35rem;
		padding-left: 1.1rem;
		list-style: disc;
	}
</style>
