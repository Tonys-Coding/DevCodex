<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	/**
	 * Marks where a lesson's Core ends: the article shell renders the pack checklist and
	 * the pack here, before the optional Going deeper and Under the hood layers.
	 */
	const pack = getContext<Snippet | undefined>('devcodex:core-pack');
</script>

{#if pack}{@render pack()}{/if}
