<script lang="ts">
	import ArticleShell from '#lib/components/app/ArticleShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const Body = $derived(data.Body);
</script>

<svelte:head>
	<title>{data.meta.title} · DevCodex</title>
	<meta name="description" content={data.meta.summary} />
</svelte:head>

{#key data.meta.id}
	<ArticleShell meta={data.meta} toc={data.toc}>
		<Body />
	</ArticleShell>
{/key}
