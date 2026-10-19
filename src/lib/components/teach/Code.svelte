<script lang="ts">
	import { highlight, type CodeLang } from './highlight';

	let {
		code,
		lang = 'js',
		title,
		caption
	}: {
		code: string;
		lang?: CodeLang;
		/** A file name or short label shown above the code. */
		title?: string;
		/** One sentence under the code saying what to notice. */
		caption?: string;
	} = $props();

	const names: Record<CodeLang, string> = { js: 'JavaScript', py: 'Python', http: 'HTTP', text: 'Text' };
	const html = $derived(highlight(code.replace(/^\n+|\s+$/g, ''), lang));
</script>

<figure class="code">
	<div class="bar">
		<span class="title">{title ?? names[lang]}</span>
		{#if title}<span class="lang">{names[lang]}</span>{/if}
	</div>
	<!-- A wide sample scrolls sideways, so keyboard users must be able to focus it. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre tabindex="0"><code>{@html html}</code></pre>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.code {
		margin: 1.5rem 0;
		border-radius: 18px;
		border: 1px solid var(--rule);
		background: #0b0a0e;
		overflow: hidden;
	}

	.bar {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0.95rem;
		border-bottom: 1px solid var(--rule);
		background: var(--panel);
		font-size: 0.88rem;
		font-weight: 700;
	}

	.title {
		color: var(--ink);
	}

	.lang {
		color: var(--ink-3);
	}

	pre {
		margin: 0;
		padding: 0.9rem 0.95rem 1rem;
		overflow-x: auto;
		font-size: 0.86rem;
		line-height: 1.65;
		color: var(--ink);
		tab-size: 4;
	}

	pre:focus-visible {
		outline-offset: -3px;
	}

	/* The page-wide .prose code chip must not apply inside a block. */
	pre code {
		padding: 0;
		background: none;
		font-size: inherit;
		border-radius: 0;
	}

	figcaption {
		padding: 0.6rem 0.95rem 0.75rem;
		border-top: 1px solid var(--rule);
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

</style>
