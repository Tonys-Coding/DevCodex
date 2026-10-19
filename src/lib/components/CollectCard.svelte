<script lang="ts">
	import { collectorNumber, collectorTotal } from '../content/cards';
	import { trackById } from '../content/catalog';
	import type { ConceptCard } from '../content/types';
	import Icon from './Icon.svelte';
	import { cardArt } from './cardArt';

	let {
		card,
		face = 'front',
		fresh = false,
		tilt = true,
		lockedHint
	}: {
		card: ConceptCard;
		face?: 'front' | 'back' | 'locked';
		fresh?: boolean;
		tilt?: boolean;
		lockedHint?: string;
	} = $props();

	const number = $derived(collectorNumber(card));
	const total = collectorTotal;
	const track = $derived(trackById(card.track));

	let el = $state<HTMLElement>();
	let rx = $state(0);
	let ry = $state(0);
	let mx = $state(50);
	let my = $state(50);
	let hover = $state(false);

	function move(event: PointerEvent) {
		if (!tilt || !el || event.pointerType !== 'mouse') return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const r = el.getBoundingClientRect();
		const px = (event.clientX - r.left) / r.width;
		const py = (event.clientY - r.top) / r.height;
		ry = (px - 0.5) * 16;
		rx = (0.5 - py) * 16;
		mx = px * 100;
		my = py * 100;
		hover = true;
	}

	function leave() {
		rx = ry = 0;
		hover = false;
	}
</script>

<div
	bind:this={el}
	class="card t-{card.track} {face}"
	class:can-tilt={tilt}
	class:rare={card.level === 3 && face === 'front'}
	class:fresh
	class:hover
	style="--rx: {rx}deg; --ry: {ry}deg; --mx: {mx}%; --my: {my}%"
	onpointermove={move}
	onpointerleave={leave}
	role="img"
	aria-label={face === 'front'
		? `${card.term}. ${card.question}`
		: face === 'locked'
			? `Locked card: ${card.term}. ${lockedHint ?? ''}`
			: 'Face-down card'}
>
	{#if face === 'front'}
		<div class="frame">
			<div class="head">
				<span class="name">{card.term}</span>
				<span class="pips" aria-hidden="true">
					{#each [1, 2, 3] as n (n)}<i class:on={n <= card.level}></i>{/each}
				</span>
			</div>
			<div class="art" aria-hidden="true">
				<svg viewBox="0 0 120 64">{@html cardArt[card.id] ?? ''}</svg>
			</div>
			<p class="q">{card.question}</p>
			<div class="foot">
				<span>#{number}/{total}</span>
				<span>{track.short}{card.level === 3 ? ' · Rare' : ''}</span>
			</div>
		</div>
		<span class="foil" aria-hidden="true"></span>
		{#if fresh}<span class="new">New</span>{/if}
	{:else if face === 'locked'}
		<div class="frame dim">
			<div class="lock"><Icon name="lock" size={26} stroke={2} /></div>
			<span class="name">{card.term}</span>
			{#if lockedHint}<p class="hint">{lockedHint}</p>{/if}
			<div class="foot"><span>#{number}/{total}</span><span>{track.short}</span></div>
		</div>
	{:else}
		<div class="frame backside">
			<span class="mark" aria-hidden="true"><i></i><i></i><i></i></span>
			<span class="brand">DevCodex</span>
		</div>
	{/if}
</div>

<style>
	.card {
		position: relative;
		aspect-ratio: 5 / 7;
		width: 100%;
		border-radius: 16px;
		padding: 7px;
		background: var(--t);
		color: var(--ink);
		box-shadow: 0 18px 36px -18px rgb(0 0 0 / 0.85);
		container-type: inline-size;
		isolation: isolate;
	}

	.card.can-tilt {
		transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.card.can-tilt.hover {
		transition: transform 80ms linear;
	}

	.frame {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 5cqi;
		padding: 6cqi;
		border-radius: 10px;
		background: var(--panel);
		overflow: hidden;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 4cqi;
	}

	.name {
		font-family: var(--display);
		font-weight: 800;
		font-size: max(0.95rem, 9.5cqi);
		line-height: 1.05;
		letter-spacing: -0.02em;
	}

	.pips {
		display: flex;
		gap: 2.5cqi;
		padding-top: 2cqi;
	}

	.pips i {
		width: 4.5cqi;
		height: 4.5cqi;
		border-radius: 50%;
		border: 1.5px solid var(--t);
	}

	.pips i.on {
		background: var(--t);
	}

	.art {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 8;
		border-radius: 8px;
		background:
			radial-gradient(circle at 30% 20%, rgb(255 255 255 / 0.12), transparent 60%),
			var(--t);
	}

	.art svg {
		width: 76%;
		overflow: visible;
		fill: none;
		stroke: var(--t-ink);
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.art :global(.hot) {
		fill: var(--t-ink);
	}

	.q {
		font-size: max(0.82rem, 7cqi);
		line-height: 1.3;
		color: var(--ink);
		display: -webkit-box;
		-webkit-line-clamp: 5;
		line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.foot {
		margin-top: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.5em;
		justify-content: space-between;
		font-size: max(0.72rem, 5.6cqi);
		font-weight: 700;
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	/* Holographic foil that follows the pointer. */
	.foil {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		mix-blend-mode: color-dodge;
		opacity: 0;
		background:
			radial-gradient(circle at var(--mx) var(--my), rgb(255 255 255 / 0.35), transparent 45%),
			repeating-linear-gradient(115deg, rgb(255 122 61 / 0.2) 0 8%, rgb(163 135 255 / 0.2) 8% 16%, rgb(31 207 169 / 0.2) 16% 24%);
		background-position: var(--mx) var(--my);
		transition: opacity 300ms ease-out;
	}

	.card.hover .foil {
		opacity: 0.85;
	}

	/* New cards glow gold until they are first reviewed. */
	.card.fresh {
		box-shadow: 0 0 0 3px var(--gold), 0 0 26px -4px rgb(255 201 74 / 0.55), 0 18px 36px -18px rgb(0 0 0 / 0.85);
	}

	/* Level-3 cards are the rares: a gold inner frame around the face. */
	.card.rare .frame {
		box-shadow: inset 0 0 0 2px var(--gold);
	}

	.new {
		position: absolute;
		top: -0.5rem;
		right: -0.4rem;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-weight: 800;
		font-size: 0.8rem;
		box-shadow: 0 4px 10px rgb(0 0 0 / 0.4);
	}

	.card.locked {
		background: var(--panel-2);
		box-shadow: none;
	}

	.dim {
		background: var(--ground);
		border: 1.5px dashed var(--rule);
		color: var(--ink-3);
		align-items: flex-start;
	}

	.dim .name {
		color: var(--ink-2);
	}

	.lock {
		display: grid;
		place-items: center;
		width: 100%;
		aspect-ratio: 16 / 8;
		border-radius: 8px;
		background: var(--panel);
		color: var(--ink-3);
	}

	.hint {
		font-size: max(0.78rem, 6.4cqi);
		line-height: 1.3;
	}

	.card.back {
		background: var(--gold);
	}

	.backside {
		align-items: center;
		justify-content: center;
		gap: 6cqi;
		background:
			repeating-linear-gradient(45deg, transparent 0 10px, rgb(255 201 74 / 0.06) 10px 20px),
			var(--panel-2);
	}

	.backside .brand {
		font-family: var(--display);
		font-weight: 800;
		font-size: 10cqi;
		color: var(--gold);
	}

	.mark {
		position: relative;
		width: 30cqi;
		height: 28cqi;
	}

	.mark i {
		position: absolute;
		left: 9cqi;
		top: 0;
		width: 15cqi;
		height: 22cqi;
		border-radius: 3cqi;
		border: 3px solid var(--panel-2);
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

	@media (prefers-reduced-motion: reduce) {
		.card.can-tilt {
			transform: none;
		}
	}
</style>
