<script lang="ts" module>
	import type { CodeLang } from './highlight';
	export type ChoiceOption = { label: string; code?: string; lang?: CodeLang; body: string; verdict?: string };
</script>

<script lang="ts">
	import { highlight } from './highlight';

	/** `codeLabels`: the tab labels are code (like `b = a`), so set them in the code face. */
	let { title, options, codeLabels = false }: { title: string; options: ChoiceOption[]; codeLabels?: boolean } = $props();
	const uid = $props.id();
	let at = $state(0);
	const current = $derived(options[at]);

	function keys(event: KeyboardEvent) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		at = (at + step + options.length) % options.length;
		(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[at]?.focus();
	}
</script>

<section class="choice" aria-label={title}>
	<h3>{title}</h3>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div class="tabs" class:code={codeLabels} role="tablist" tabindex="-1" onkeydown={keys}>
		{#each options as o, i (o.label)}
			<button
				role="tab"
				type="button"
				id="{uid}-tab-{i}"
				aria-selected={i === at}
				aria-controls="{uid}-panel"
				tabindex={i === at ? 0 : -1}
				onclick={() => (at = i)}>{o.label}</button
			>
		{/each}
	</div>
	<div class="panel" role="tabpanel" id="{uid}-panel" aria-labelledby="{uid}-tab-{at}">
		{#if current.code}<pre><code>{@html highlight(current.code, current.lang ?? 'text')}</code></pre>{/if}
		<p>{current.body}</p>
		{#if current.verdict}<p class="verdict">{current.verdict}</p>{/if}
	</div>
</section>

<style>
	.choice {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.9rem 0;
	}

	.tabs button {
		min-height: 2.75rem;
		padding: 0 1rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink-2);
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
	}

	.tabs.code button {
		font-family: var(--mono);
		font-size: 0.88rem;
	}

	.tabs button[aria-selected='true'] {
		background: var(--t);
		border-color: var(--t);
		color: var(--t-ink);
	}

	pre {
		margin: 0 0 0.8rem;
		padding: 0.8rem 0.95rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.6;
		overflow-x: auto;
	}

	pre code {
		padding: 0;
		background: none;
		font-size: inherit;
	}

	.panel p {
		line-height: 1.6;
	}

	.verdict {
		margin-top: 0.6rem;
		font-weight: 700;
		color: var(--t);
	}

	@media (min-width: 640px) {
		.choice {
			padding: 1.5rem;
		}
	}
</style>
