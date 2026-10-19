<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A glossary word in running text: dotted underline, and its definition on hover,
	 * keyboard focus or tap. Used for the first use of each "Words you will meet" entry.
	 */
	let { def, children }: { def: string; children: Snippet } = $props();
	const uid = $props.id();
	let open = $state(false);
</script>

<span class="term">
	<button
		type="button"
		aria-describedby="{uid}-def"
		aria-expanded={open}
		onclick={() => (open = !open)}
		onblur={() => (open = false)}
		onkeydown={(e) => e.key === 'Escape' && (open = false)}>{@render children()}</button
	><span class="def" class:open role="tooltip" id="{uid}-def">{def}</span>
</span>

<style>
	.term {
		position: relative;
	}

	button {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-decoration: underline dotted;
		text-decoration-color: var(--t);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.22em;
		cursor: help;
	}

	.def {
		position: absolute;
		left: 0;
		bottom: calc(100% + 0.4rem);
		z-index: 5;
		width: max-content;
		max-width: min(20rem, 80vw);
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		background: var(--panel-2);
		box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.8), inset 0 0 0 1px var(--rule);
		font-size: 0.95rem;
		font-weight: 400;
		line-height: 1.45;
		color: var(--ink);
		opacity: 0;
		visibility: hidden;
		transition: opacity 150ms ease-out;
		pointer-events: none;
	}

	.term:hover .def,
	button:focus-visible + .def,
	.def.open {
		opacity: 1;
		visibility: visible;
	}

	@media (prefers-reduced-motion: reduce) {
		.def {
			transition: none;
		}
	}
</style>
