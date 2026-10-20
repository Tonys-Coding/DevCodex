<script lang="ts">
	import type { Level } from '../../content/types';
	import { levelById } from '../../content/levels';

	/** `solid` sits on a track-coloured surface, such as the home quest panel: it takes that surface's ink. */
	let { level, solid = false }: { level: Level; solid?: boolean } = $props();
	const info = $derived(levelById(level));
</script>

<span class="level lv-{level}" class:solid>
	<span class="pips" aria-hidden="true">
		{#each [1, 2, 3] as n (n)}<span class:on={n <= info.pips}></span>{/each}
	</span>
	{info.label}
</span>

<style>
	/* Boxless: level-coloured pips and label, no outline. */
	.level {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--lv);
		font-size: 0.88rem;
		font-weight: 800;
		line-height: 1.2;
		white-space: nowrap;
	}

	.level.solid {
		color: var(--t-ink);
	}

	.pips {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
	}

	.pips span {
		width: 4px;
		border-radius: 3px;
		background: currentColor;
		opacity: 0.3;
	}

	.pips span:nth-child(1) {
		height: 7px;
	}
	.pips span:nth-child(2) {
		height: 10px;
	}
	.pips span:nth-child(3) {
		height: 13px;
	}

	.pips span.on {
		opacity: 1;
	}
</style>
