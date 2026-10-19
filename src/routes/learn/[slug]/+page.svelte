<script lang="ts">
	import type { Component } from 'svelte';
	import ArticleShell from '#lib/components/app/ArticleShell.svelte';
	import type { TocEntry } from '#lib/content/article-markup.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Every article body is a Svelte component named after its id. The article-markup
	// preprocessor adds a `toc` export listing its <h2> sections.
	const bodies = import.meta.glob<{ default: Component; toc?: TocEntry[] }>('/src/lib/content/articles/*.svelte', { eager: true });
	const mod = $derived(bodies[`/src/lib/content/articles/${data.meta.id}.svelte`]);
	const Body = $derived(mod.default);
</script>

<svelte:head>
	<title>{data.meta.title} · DevCodex</title>
	<meta name="description" content={data.meta.summary} />
</svelte:head>

{#key data.meta.id}
	<ArticleShell meta={data.meta} toc={mod.toc ?? []}>
		<Body />
	</ArticleShell>
{/key}
