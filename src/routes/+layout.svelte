<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import '@fontsource-variable/atkinson-hyperlegible-next';
	import '@fontsource-variable/jetbrains-mono';
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { cards } from '#lib/content/cards.js';
	import Icon from '#lib/components/Icon.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		progress.load();
	});

	const nav = [
		{ href: resolve('/'), label: 'Binder', icon: 'grid', match: (id: string) => id === '/' },
		{ href: resolve('/learn'), label: 'Learn', icon: 'book', match: (id: string) => id.startsWith('/learn') },
		{ href: resolve('/shorts'), label: 'Shorts', icon: 'play', match: (id: string) => id.startsWith('/shorts') },
		{ href: resolve('/trivia'), label: 'Trivia', icon: 'cards', match: (id: string) => id.startsWith('/trivia') },
		{ href: resolve('/practice'), label: 'Practice', icon: 'code', match: (id: string) => id.startsWith('/practice') }
	];
	const routeId = $derived(page.route.id ?? '');
	const current = $derived(nav.find((n) => n.match(routeId)));
</script>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
	<a class="brand" href={nav[0].href}>
		<span class="mark" aria-hidden="true"><i></i><i></i><i></i></span>
		DevCodex
	</a>
	<nav class="desk-nav" aria-label="Sections">
		{#each nav as item (item.href)}
			<a href={item.href} class:active={item === current} aria-current={item === current ? 'page' : undefined}>
				<Icon name={item.icon} size={18} stroke={2} />{item.label}
			</a>
		{/each}
	</nav>
	<a class="collected" href={resolve('/you')} class:active={routeId === '/you'} aria-label="Your progress: {progress.unlockedCards.length} of {cards.length} cards collected">
		<Icon name="cards" size={18} stroke={2} />
		<span aria-hidden="true"><strong>{progress.loaded ? progress.unlockedCards.length : '–'}</strong>/{cards.length}</span>
	</a>
</header>

<main id="main">
	{@render children()}
</main>

<nav class="dock" aria-label="Sections">
	{#each nav as item (item.href)}
		<a href={item.href} class:active={item === current} aria-current={item === current ? 'page' : undefined}>
			<span class="pill"><Icon name={item.icon} size={22} stroke={2} /></span>
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.skip {
		position: absolute;
		left: 1rem;
		top: 0.5rem;
		z-index: 30;
		transform: translateY(-200%);
		padding: 0.5rem 0.9rem;
		background: var(--gold);
		color: #1d1400;
		border-radius: 10px;
		font-weight: 700;
	}

	.skip:focus-visible {
		transform: none;
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: max(0.65rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) 0.65rem max(1rem, env(safe-area-inset-left));
		background: rgb(18 16 22 / 0.94);
		border-bottom: 1px solid var(--rule);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.2rem;
		letter-spacing: -0.02em;
		color: var(--ink);
		text-decoration: none;
	}

	/* Three fanned cards in the track colours. */
	.mark {
		position: relative;
		width: 1.6rem;
		height: 1.5rem;
	}

	.mark i {
		position: absolute;
		left: 0.45rem;
		top: 0.05rem;
		width: 0.8rem;
		height: 1.15rem;
		border-radius: 3px;
		border: 2px solid var(--ground);
		transform-origin: 50% 100%;
	}

	.mark i:nth-child(1) {
		background: var(--structures);
		transform: rotate(-22deg);
	}
	.mark i:nth-child(2) {
		background: var(--programming);
	}
	.mark i:nth-child(3) {
		background: var(--web);
		transform: rotate(22deg);
	}

	.desk-nav {
		display: none;
	}

	.collected {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.6rem;
		padding: 0 0.85rem;
		border-radius: 999px;
		background: var(--panel);
		border: 1px solid var(--rule);
		color: var(--ink-2);
		text-decoration: none;
		font-variant-numeric: tabular-nums;
	}

	.collected strong {
		color: var(--gold);
	}

	.collected:hover,
	.collected.active {
		border-color: var(--gold);
	}

	main {
		min-width: 0;
		max-width: 78rem;
		margin-inline: auto;
		padding: 1.25rem max(1rem, env(safe-area-inset-right)) calc(7rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
	}

	.dock {
		position: fixed;
		left: 0.6rem;
		right: 0.6rem;
		bottom: max(0.6rem, env(safe-area-inset-bottom));
		z-index: 10;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		padding: 0.3rem;
		background: var(--panel);
		border: 1px solid var(--rule);
		border-radius: 22px;
		box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.7);
	}

	.dock a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.3rem 0 0.35rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-3);
		text-decoration: none;
	}

	.dock .pill {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 2rem;
		border-radius: 999px;
		transition: background 200ms ease-out;
	}

	.dock a.active {
		color: var(--ink);
	}

	.dock a.active .pill {
		background: var(--gold);
		color: #1d1400;
	}

	@media (min-width: 900px) {
		.dock {
			display: none;
		}

		.top {
			padding: 0.8rem 2rem;
			gap: 2rem;
		}

		.desk-nav {
			display: flex;
			gap: 0.3rem;
		}

		.desk-nav a {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 0.9rem;
			border-radius: 999px;
			color: var(--ink-2);
			font-weight: 700;
			text-decoration: none;
		}

		.desk-nav a:hover {
			color: var(--ink);
			background: var(--panel);
		}

		.desk-nav a.active {
			background: var(--gold);
			color: #1d1400;
		}

		main {
			padding: 2rem 2rem 4rem;
		}
	}
</style>
