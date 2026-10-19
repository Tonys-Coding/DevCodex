<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ArticleMeta } from '../../content/types';
	import type { Reading } from '../../progress/progress.svelte';
	import { progress } from '../../progress/progress.svelte';
	import { timeAgo } from '../../progress/dashboard';
	import Icon from '../Icon.svelte';
	import LevelTag from '../app/LevelTag.svelte';

	/** Other lessons in progress (the hero already offers the most recent one). Each can be resumed or removed. */
	let { items, now }: { items: { article: ArticleMeta; reading: Reading }[]; now: Date } = $props();
</script>

<section class="continue" aria-labelledby="continue-title">
	<h2 id="continue-title">Also in progress</h2>
	<ul>
		{#each items as { article: a, reading } (a.id)}
			{@const href = `${resolve('/learn/[slug]', { slug: a.id })}${reading.section ? `#${reading.section.id}` : ''}`}
			<li class="t-{a.track} lv-{a.level}">
				<div class="top">
					<LevelTag level={a.level} />
					<button type="button" class="remove" onclick={() => progress.forget(a.id)} aria-label="Remove {a.title} from in progress">
						<Icon name="close" size={18} stroke={2} />
					</button>
				</div>
				<a class="title" {href}>{a.title}</a>
				<p class="where">
					{reading.section ? `Stopped at “${reading.section.text}”` : 'Opened, not started yet'} · {timeAgo(reading.last, now)}
				</p>
				<div class="bar" role="progressbar" aria-label="{a.title} read" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(reading.percent * 100)}>
					<span style="transform: scaleX({reading.percent})"></span>
				</div>
				<div class="foot">
					<span>{Math.round(reading.percent * 100)}% read</span>
					<a class="resume" {href}>Resume <Icon name="arrow-right" size={16} stroke={2.5} /></a>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	h2 {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	ul {
		display: grid;
		margin-top: 0.4rem;
	}

	li {
		display: grid;
		gap: 0.3rem;
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.remove {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		margin: -0.6rem -0.7rem -0.6rem 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--ink-3);
		cursor: pointer;
	}

	.remove:hover {
		color: var(--miss);
	}

	.title {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--ink);
		text-decoration: none;
	}

	.title:hover {
		color: var(--t);
	}

	.where {
		color: var(--ink-2);
	}

	.bar {
		height: 6px;
		margin-top: 0.3rem;
		border-radius: 3px;
		background: var(--panel-2);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--lv);
		transform-origin: left;
	}

	.foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}

	.resume {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-height: 2.75rem;
		color: var(--t);
		text-decoration: none;
	}

	.resume:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
