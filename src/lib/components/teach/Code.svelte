<script lang="ts">
	import { highlight, type CodeLang } from './highlight';
	import Icon from '../Icon.svelte';

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
	const source = $derived(code.replace(/^\n+|\s+$/g, ''));
	const html = $derived(highlight(source, lang));

	let pre = $state<HTMLPreElement>();
	/** True when lines run past the edge: shows a fade there and offers wrapping. */
	let overflowing = $state(false);
	let wrap = $state(false);
	/** Scrolled all the way right: no fade needed. */
	let atEnd = $state(false);
	const edge = () => pre && (atEnd = pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 1);
	let copied = $state(false);

	$effect(() => {
		if (!pre) return;
		const el = pre;
		const check = () => {
			overflowing = el.scrollWidth > el.clientWidth + 1;
			edge();
		};
		check();
		const watch = new ResizeObserver(check);
		watch.observe(el);
		return () => watch.disconnect();
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(source);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			copied = false;
		}
	}
</script>

<figure class="code">
	<div class="bar">
		<span class="title">{title ?? names[lang]}</span>
		{#if title}<span class="lang">{names[lang]}</span>{/if}
		<span class="tools">
			{#if overflowing || wrap}
				<button type="button" onclick={() => (wrap = !wrap)} aria-pressed={wrap}><Icon name="wrap" size={16} stroke={2} /> {wrap ? 'No wrap' : 'Wrap'}</button>
			{/if}
			<button type="button" onclick={copy}><Icon name={copied ? 'check' : 'copy'} size={16} stroke={2} /> {copied ? 'Copied' : 'Copy'}</button>
			<span class="visually-hidden" role="status">{copied ? 'Code copied' : ''}</span>
		</span>
	</div>
	<!-- A wide sample scrolls sideways, so keyboard users must be able to focus it. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre tabindex="0" bind:this={pre} class:wrap class:fade={overflowing && !wrap && !atEnd} onscroll={edge}><code>{@html html}</code></pre>
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
		gap: 0.75rem;
		padding: 0.5rem 0.95rem;
		border-bottom: 1px solid var(--rule);
		background: var(--panel);
		font-size: 0.88rem;
		font-weight: 700;
	}

	.title {
		color: var(--ink);
	}

	.bar {
		align-items: center;
	}

	.tools {
		display: inline-flex;
		gap: 0.2rem;
		margin-left: auto;
	}

	.tools button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.25rem;
		padding: 0 0.55rem;
		border: 0;
		border-radius: 8px;
		background: none;
		color: var(--ink-2);
		font-size: 0.88rem;
		font-weight: 700;
		cursor: pointer;
	}

	.tools button:hover,
	.tools button[aria-pressed='true'] {
		background: var(--panel-2);
		color: var(--ink);
	}

	/* Phones: the language label gives way to the title and tools. */
	@media (max-width: 559px) {
		.lang {
			display: none;
		}
	}

	/* A fade on the right edge says the line keeps going. */
	pre.fade {
		mask-image: linear-gradient(to right, #000 calc(100% - 2.5rem), transparent);
	}

	pre.wrap {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
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
