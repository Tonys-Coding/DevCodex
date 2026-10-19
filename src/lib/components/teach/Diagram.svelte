<script lang="ts">
	import sizes from '../../content/diagrams/sizes.json';
	import Icon from '../Icon.svelte';

	/** A sysketch diagram from src/lib/content/diagrams/ (see the README there). */
	let { name, alt, caption }: { name: string; alt: string; caption?: string } = $props();

	const urls = import.meta.glob<string>('/src/lib/content/diagrams/*.svg', { eager: true, query: '?url', import: 'default' });
	const src = $derived(urls[`/src/lib/content/diagrams/${name}.svg`]);
	const size = $derived((sizes as Record<string, { width: number; height: number }>)[name]);
</script>

<figure class="diagram">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="frame" tabindex="0" role="group" aria-label="{alt} Scrolls sideways on small screens.">
		<img src={src} alt={alt} width={size?.width} height={size?.height} style:max-width="{size?.width}px" loading="lazy" decoding="async" />
	</div>
	<figcaption>
		{#if caption}<span>{caption}</span>{/if}
		<a href={src} target="_blank" rel="noopener">Open full size <Icon name="external" size={15} stroke={2} /></a>
	</figcaption>
</figure>

<style>
	.diagram {
		margin: 2rem 0;
		border-radius: 22px;
		border: 1px solid var(--rule);
		background: #070b16; /* the midnight theme ground, so a narrow diagram has no seam */
		overflow: hidden;
	}

	.frame {
		overflow-x: auto;
	}

	.frame:focus-visible {
		outline-offset: -3px;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		margin-inline: auto;
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.4rem 1rem;
		padding: 0.65rem 1rem 0.8rem;
		border-top: 1px solid var(--rule);
		background: var(--panel);
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	figcaption a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-block: -0.6rem;
		color: var(--gold);
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	/* Phones: keep labels legible by letting a wide diagram scroll sideways. */
	@media (max-width: 559px) {
		img {
			width: max(100%, 40rem);
		}
	}
</style>
