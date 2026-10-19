<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import type { Short } from '../../content/types';
	import { articleById } from '../../content/catalog';
	import { ScenePlayer, inView } from '../../player.svelte';
	import Icon from '../Icon.svelte';

	let { short, index, total }: { short: Short; index: number; total: number } = $props();

	const source = $derived(articleById(short.articleId)!);
	// A short never changes after mount, so its length is read once.
	const player = new ScenePlayer(untrack(() => (short.kind === 'explainer' ? short.scenes.length : 1)), 3400);
	let pick = $state<number | null>(null);
</script>

<section class="short t-{source.track}" aria-labelledby="sh-{short.id}" aria-roledescription="short">
	<header class="head">
		<h2 id="sh-{short.id}">{short.title}</h2>
		<span class="n">{index + 1}/{total}</span>
	</header>

	{#if short.kind === 'explainer'}
		{@const scene = short.scenes[player.index]}
		{@const pos = Object.fromEntries(short.nodes.map((n) => [n.id, n]))}
		<div class="bars" aria-hidden="true">
			{#each short.scenes as _, i (i)}
				<span><i style="transform: scaleX({i < player.index ? 1 : i === player.index ? player.elapsed : 0})"></i></span>
			{/each}
		</div>
		<div class="stage" use:inView={(visible) => (visible ? player.play() : player.pause())}>
			<svg viewBox="0 0 360 290" role="img" aria-label={scene.caption}>
				{#each short.links as [a, b] (a + b)}
					<line x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} class="link" />
				{/each}
				{#each short.nodes as node (node.id)}
					<g class="node" class:lit={scene.lit.includes(node.id)} transform="translate({node.x} {node.y})">
						<rect x="-56" y="-22" width="112" height="44" rx="14" />
						<text dy="6">{node.label}</text>
					</g>
				{/each}
				{#if scene.hop}
					{@const a = pos[scene.hop.from]}
					{@const b = pos[scene.hop.to]}
					{#key player.index}
						{#if prefersReducedMotion.current}
							<circle r="10" cx={b.x} cy={b.y} class="ball" />
						{:else}
							<circle r="10" class="ball">
								<animateMotion dur="1s" fill="freeze" path="M{a.x} {a.y} L{b.x} {b.y}" calcMode="spline" keyTimes="0;1" keyPoints="0;1" keySplines="0.16 1 0.3 1" />
							</circle>
						{/if}
					{/key}
				{/if}
			</svg>
		</div>
		<p class="cap" aria-live="polite">{scene.caption}</p>
		<div class="ctl">
			<button type="button" onclick={player.prev} disabled={player.index === 0} aria-label="Previous beat"><Icon name="chevron-left" stroke={2.5} /></button>
			<button type="button" class="main" onclick={() => player.toggle()} aria-label={player.playing ? 'Pause' : 'Play'}>
				<Icon name={player.playing ? 'pause' : 'play'} stroke={2.5} />
			</button>
			<button type="button" onclick={player.next} disabled={player.atEnd} aria-label="Next beat"><Icon name="chevron-right" stroke={2.5} /></button>
		</div>
	{:else if short.kind === 'bug'}
		<pre class="code"><code>{short.code}</code></pre>
		<p class="ask">{short.question}</p>
		<div class="opts">
			{#each short.options as option, i (i)}
				<button
					type="button"
					class:right={pick !== null && i === short.answer}
					class:wrong={pick === i && i !== short.answer}
					aria-pressed={pick === i}
					onclick={() => (pick = i)}><code>{option}</code></button
				>
			{/each}
		</div>
		{#if pick !== null}<p class="why" role="status">{short.explain}</p>{/if}
	{:else if short.kind === 'pick'}
		<p class="ask">{short.scenario}</p>
		<div class="opts two">
			{#each short.options as option, i (i)}
				<button
					type="button"
					class:right={pick !== null && i === short.answer}
					class:wrong={pick === i && i !== short.answer}
					aria-pressed={pick === i}
					onclick={() => (pick = i)}
				>
					<strong>{option.label}</strong>
					{#if pick !== null}<small>{option.cost}</small>{/if}
				</button>
			{/each}
		</div>
		{#if pick !== null}<p class="why" role="status">{short.explain}</p>{/if}
	{:else}
		<blockquote class="claim">“{short.claim}”</blockquote>
		<div class="opts two">
			{#each ['Myth', 'Fact'] as label, i (label)}
				{@const correct = (i === 1) === short.isFact}
				<button type="button" class:right={pick !== null && correct} class:wrong={pick === i && !correct} aria-pressed={pick === i} onclick={() => (pick = i)}>
					<strong>{label}</strong>
				</button>
			{/each}
		</div>
		{#if pick !== null}<p class="why" role="status"><strong>{short.isFact ? 'Fact.' : 'Myth.'}</strong> {short.explain}</p>{/if}
	{/if}

	<footer class="from">
		<a href={resolve('/learn/[slug]', { slug: source.id })}>From “{source.title}” <Icon name="arrow-right" size={16} stroke={2.5} /></a>
	</footer>
</section>

<style>
	.short {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		height: 100%;
		padding: 1.1rem 1.1rem 1rem;
		border-radius: 28px;
		background: var(--t);
		color: var(--t-ink);
		overflow: hidden;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	h2 {
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.n {
		font-family: var(--display);
		font-weight: 800;
		opacity: 0.75;
		font-variant-numeric: tabular-nums;
	}

	.bars {
		display: grid;
		grid-auto-flow: column;
		gap: 5px;
	}

	.bars span {
		height: 6px;
		border-radius: 3px;
		background: rgb(0 0 0 / 0.16);
		overflow: hidden;
	}

	.bars i {
		display: block;
		height: 100%;
		background: var(--t-ink);
		transform-origin: left;
	}

	.stage {
		flex: 1;
		min-height: 0;
		display: grid;
		place-items: center;
	}

	svg {
		width: 100%;
		max-height: 100%;
	}

	.link {
		stroke: var(--t-ink);
		stroke-width: 4;
		stroke-linecap: round;
		opacity: 0.25;
	}

	.node rect {
		fill: rgb(255 255 255 / 0.24);
		transition: fill 250ms ease-out;
	}

	.node text {
		text-anchor: middle;
		font-family: var(--display);
		font-weight: 800;
		font-size: 16px;
		fill: var(--t-ink);
		transition: fill 250ms ease-out;
	}

	.node.lit rect {
		fill: var(--t-ink);
	}

	.node.lit text {
		fill: var(--t);
	}

	.ball {
		fill: #fff;
		stroke: var(--t-ink);
		stroke-width: 4;
	}

	.cap {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.015em;
		min-height: 3.6em;
	}

	.ctl {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
	}

	.ctl button {
		display: grid;
		place-items: center;
		width: 3.2rem;
		height: 3.2rem;
		border-radius: 50%;
		border: 0;
		background: rgb(0 0 0 / 0.16);
		color: var(--t-ink);
		cursor: pointer;
	}

	.ctl button.main {
		width: 3.8rem;
		height: 3.8rem;
		background: var(--t-ink);
		color: var(--t);
	}

	.ctl button:disabled {
		opacity: 0.35;
	}

	.code {
		margin: 0;
		padding: 1rem;
		border-radius: 18px;
		background: var(--t-ink);
		color: #f2eefc;
		font-size: 0.88rem;
		line-height: 1.6;
		overflow-x: auto;
	}

	.ask,
	.claim {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.015em;
	}

	.claim {
		margin: auto 0 0;
		font-size: 1.6rem;
	}

	.opts {
		display: grid;
		gap: 0.55rem;
	}

	.opts.two {
		grid-template-columns: 1fr 1fr;
	}

	.opts button {
		display: grid;
		gap: 0.2rem;
		min-height: 3.4rem;
		padding: 0.7rem 0.9rem;
		border-radius: 18px;
		border: 3px solid transparent;
		background: rgb(255 255 255 / 0.24);
		color: var(--t-ink);
		font-size: 1.05rem;
		text-align: left;
		cursor: pointer;
		transition: transform 160ms ease-out;
	}

	.opts button:active {
		transform: scale(0.97);
	}

	.opts button.right {
		background: var(--t-ink);
		color: var(--ink);
	}

	.opts button.wrong {
		border-color: var(--t-ink);
		opacity: 0.7;
	}

	.opts small {
		font-family: var(--mono);
		font-size: 0.8rem;
	}

	.why {
		font-weight: 600;
		line-height: 1.45;
	}

	.from {
		margin-top: auto;
		padding-top: 0.6rem;
		font-weight: 800;
	}

	.from a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--t-ink);
	}
</style>
