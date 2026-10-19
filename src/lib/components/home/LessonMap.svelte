<script lang="ts">
	import { resolve } from '$app/paths';
	import { tracks, articlesInTrack } from '../../content/catalog';
	import { levels, levelById } from '../../content/levels';
	import type { ArticleMeta, Level } from '../../content/types';
	import { progress } from '../../progress/progress.svelte';

	/**
	 * Every lesson as a star: tracks run across, levels run left to right from Entry to
	 * Senior. Finished stars glow in their track colour, started ones show how far they
	 * were read, and the next lesson pulses. Each star links to its lesson.
	 */
	let { next }: { next?: string } = $props();

	const W = 560;
	const H = 270;
	const col: Record<Level, number> = { entry: 150, experienced: 310, senior: 470 };
	const laneY = [52, 132, 212];

	type Star = { a: ArticleMeta; x: number; y: number; track: string };
	const stars: Star[] = tracks.flatMap((track, t) => {
		const lessons = articlesInTrack(track.id).filter((a) => a.status === 'live');
		return lessons.map((a) => {
			// Lessons at the same level in one track sit side by side.
			const same = lessons.filter((b) => b.level === a.level);
			const k = same.indexOf(a);
			const spread = (k - (same.length - 1) / 2) * 52;
			return { a, x: col[a.level] + spread, y: laneY[t] + (k % 2 ? 14 : -6) * (same.length > 1 ? 1 : 0), track: track.id };
		});
	});
	const links = tracks.flatMap((track) => {
		const list = stars.filter((s) => s.track === track.id);
		return list.slice(1).map((s, i) => ({ from: list[i], to: s, track: track.id }));
	});

	const statusOf = (id: string) => {
		const at = progress.data.completed[id];
		if (at) return { kind: 'done' as const, at };
		const r = progress.data.reading?.[id];
		if (r) return { kind: 'started' as const, percent: r.percent };
		return { kind: 'new' as const };
	};

	const describe = (s: Star) => {
		const st = statusOf(s.a.id);
		const level = levelById(s.a.level).label;
		const status =
			st.kind === 'done'
				? `finished ${new Date(st.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
				: st.kind === 'started'
					? `${Math.round(st.percent * 100)}% read`
					: s.a.id === next
						? 'next on your path'
						: 'not started';
		return { level, status };
	};

	let hover = $state<Star | null>(null);
	const finished = $derived(stars.filter((s) => progress.isDone(s.a.id)).length);

	// Circumference of a radius-15 ring, for the read-progress arc.
	const C = 2 * Math.PI * 15;
</script>

<figure class="map">
	<div class="sky">
		<svg viewBox="0 0 {W} {H}" aria-labelledby="map-title" role="group">
			<title id="map-title">Your path: every lesson, by track and level</title>

			<!-- Level columns -->
			{#each levels as l (l.id)}
				<line class="col lv-{l.id}" x1={col[l.id]} x2={col[l.id]} y1="18" y2={H - 34} />
				<text class="col-label lv-{l.id}" x={col[l.id]} y={H - 12} text-anchor="middle">{l.label}</text>
			{/each}

			<!-- Track names -->
			{#each tracks as track, t (track.id)}
				<text class="track-label t-{track.id}" x="10" y={laneY[t] + 5}>{track.short}</text>
			{/each}

			<!-- Paths between lessons in a track -->
			{#each links as l (l.from.a.id + l.to.a.id)}
				<line
					class="link t-{l.track}"
					class:lit={progress.isDone(l.from.a.id) && progress.isDone(l.to.a.id)}
					x1={l.from.x}
					y1={l.from.y}
					x2={l.to.x}
					y2={l.to.y}
				/>
			{/each}

			<!-- Stars -->
			{#each stars as s (s.a.id)}
				{@const st = statusOf(s.a.id)}
				{@const d = describe(s)}
				<a
					href={resolve('/learn/[slug]', { slug: s.a.id })}
					class="star t-{s.track} {st.kind}"
					class:next={s.a.id === next}
					aria-label="{s.a.title}. {d.level}, {d.status}."
					onpointerenter={() => (hover = s)}
					onpointerleave={() => (hover = null)}
					onfocus={() => (hover = s)}
					onblur={() => (hover = null)}
				>
					<circle class="hit" cx={s.x} cy={s.y} r="24" />
					{#if s.a.id === next}<circle class="pulse" cx={s.x} cy={s.y} r="20" />{/if}
					<circle class="ring" cx={s.x} cy={s.y} r="15" />
					{#if st.kind === 'started'}
						<circle class="arc" cx={s.x} cy={s.y} r="15" stroke-dasharray="{st.percent * C} {C}" transform="rotate(-90 {s.x} {s.y})" />
					{/if}
					<circle class="core" cx={s.x} cy={s.y} r={st.kind === 'done' ? 9 : 4.5} />
				</a>
			{/each}
		</svg>

		{#if hover}
			{@const d = describe(hover)}
			<div class="tip t-{hover.track}" class:below={hover.y < H * 0.35} style="left: {(hover.x / W) * 100}%; top: {(hover.y / H) * 100}%" aria-hidden="true">
				<strong>{hover.a.title}</strong>
				<span class="lv-{hover.a.level} lvl">{d.level}</span> · {d.status}
			</div>
		{/if}
	</div>
	<figcaption><strong>{finished}</strong> of {stars.length} lessons lit. Point at a star for details, or open it.</figcaption>
</figure>

<style>
	.map {
		margin: 0;
	}

	.sky {
		position: relative;
		border-radius: 22px;
		background:
			radial-gradient(1px 1px at 12% 22%, rgb(255 255 255 / 0.35), transparent 60%),
			radial-gradient(1px 1px at 38% 78%, rgb(255 255 255 / 0.25), transparent 60%),
			radial-gradient(1px 1px at 64% 14%, rgb(255 255 255 / 0.3), transparent 60%),
			radial-gradient(1px 1px at 83% 62%, rgb(255 255 255 / 0.25), transparent 60%),
			radial-gradient(1.5px 1.5px at 92% 30%, rgb(255 255 255 / 0.3), transparent 60%),
			radial-gradient(120% 90% at 50% 0%, #1b1724 0%, #0d0b10 70%);
		box-shadow: inset 0 0 0 1px var(--rule);
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.col {
		stroke: var(--lv);
		stroke-opacity: 0.16;
		stroke-width: 1.5;
		stroke-dasharray: 2 6;
	}

	.col-label {
		fill: var(--lv);
		font-family: var(--body);
		font-size: 16px;
		font-weight: 700;
	}

	.track-label {
		fill: var(--t);
		font-family: var(--display);
		font-size: 17px;
		font-weight: 800;
	}

	.link {
		stroke: var(--rule);
		stroke-width: 2;
	}

	.link.lit {
		stroke: var(--t);
		stroke-opacity: 0.7;
	}

	.star {
		cursor: pointer;
		outline: none;
	}

	.hit {
		fill: transparent;
	}

	.ring {
		fill: var(--ground);
		stroke: var(--ink-3);
		stroke-width: 2;
		stroke-dasharray: 3 4;
		transition: stroke 200ms ease-out;
	}

	.core {
		fill: var(--ink-3);
	}

	.started .ring {
		stroke: var(--panel-2);
		stroke-dasharray: none;
	}

	.arc {
		fill: none;
		stroke: var(--t);
		stroke-width: 3;
		stroke-linecap: round;
	}

	.started .core {
		fill: var(--t);
	}

	.done .ring {
		stroke: var(--t);
		stroke-dasharray: none;
		fill: color-mix(in srgb, var(--t) 22%, var(--ground));
		filter: drop-shadow(0 0 6px var(--t));
	}

	.done .core {
		fill: var(--t);
		animation: twinkle 3.2s ease-in-out infinite;
	}

	@keyframes twinkle {
		50% {
			opacity: 0.65;
		}
	}

	.next .ring {
		stroke: var(--gold);
		stroke-dasharray: none;
	}

	.next .core {
		fill: var(--gold);
	}

	.pulse {
		fill: none;
		stroke: var(--gold);
		stroke-width: 2;
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	@keyframes pulse {
		from {
			opacity: 0.8;
			transform: scale(0.7);
		}
		to {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	.star:hover .ring,
	.star:focus-visible .ring {
		stroke: var(--gold);
		stroke-width: 3;
	}

	.star:focus-visible .hit {
		stroke: var(--gold);
		stroke-width: 2;
	}

	.tip {
		position: absolute;
		z-index: 2;
		width: max-content;
		max-width: 15rem;
		padding: 0.5rem 0.75rem;
		border-radius: 10px;
		background: var(--panel-2);
		box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.8), inset 0 0 0 1px var(--rule);
		transform: translate(-50%, calc(-100% - 22px));
		font-size: 0.88rem;
		line-height: 1.35;
		color: var(--ink-2);
		pointer-events: none;
	}

	/* Stars in the top row show their details underneath, so the tip stays inside the page. */
	.tip.below {
		transform: translate(-50%, 24px);
	}

	.tip strong {
		display: block;
		font-family: var(--display);
		font-size: 0.95rem;
		color: var(--ink);
	}

	.lvl {
		color: var(--lv);
		font-weight: 700;
	}

	figcaption {
		margin-top: 0.6rem;
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	figcaption strong {
		color: var(--gold);
		font-family: var(--display);
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse,
		.done .core {
			animation: none;
		}

		.ring {
			transition: none;
		}
	}
</style>
