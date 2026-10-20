<script lang="ts">
	import { resolve } from '$app/paths';
	import { briefs, briefKind, briefDate, type BriefKind } from '#lib/content/briefs.js';
	import { articleById, trackById } from '#lib/content/catalog.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import LevelTag from '#lib/components/app/LevelTag.svelte';
	import type { PageProps } from './$types';

	/**
	 * One TL;DR: the three-bullet summary first (many readers stop there), then the
	 * five-minute body. Reaching the end after a little real reading marks it read.
	 */
	let { data }: PageProps = $props();
	const meta = $derived(data.meta);
	const Body = $derived(data.Body);

	const icons: Record<BriefKind, string> = { new: 'spark', concept: 'info', story: 'flame', how: 'search', debate: 'flip' };
	const deeper = $derived(meta.deeper ? articleById(meta.deeper) : undefined);
	/** More to read: unread ones first, newest first, never this one. */
	const more = $derived(
		briefs
			.filter((b) => b.id !== meta.id)
			.sort((a, b) => Number(progress.briefRead(a.id)) - Number(progress.briefRead(b.id)))
			.slice(0, 3)
	);
	const read = $derived(progress.briefRead(meta.id));

	/** Read = the end came into view at least 40 seconds after opening. Jumping straight there doesn't count. */
	const MIN_SECONDS = 40;
	let end = $state<HTMLElement>();
	$effect(() => {
		const id = meta.id;
		if (!end || !progress.loaded || progress.briefRead(id)) return;
		const opened = Date.now();
		let timer: ReturnType<typeof setTimeout> | undefined;
		const io = new IntersectionObserver(([entry]) => {
			clearTimeout(timer);
			if (!entry.isIntersecting) return;
			const wait = Math.max(0, MIN_SECONDS * 1000 - (Date.now() - opened));
			timer = setTimeout(() => progress.readBrief(id), wait);
		});
		io.observe(end);
		return () => {
			io.disconnect();
			clearTimeout(timer);
		};
	});
</script>

<svelte:head>
	<title>{meta.title} · TL;DR · DevCodex</title>
	<meta name="description" content={meta.hook} />
</svelte:head>

{#key meta.id}
	<div class="brief">
		<article class="main" aria-labelledby="brief-title">
			<a class="back" href={resolve('/learn/tldr')}><Icon name="arrow-left" size={18} stroke={2.5} /> TL;DR</a>
			<p class="meta-row">
				<span class="kind"><Icon name={icons[meta.kind]} size={16} stroke={2} />{briefKind(meta.kind).label}</span>
				<span>{briefDate(meta.published)}</span>
				<span><Icon name="clock" size={15} stroke={2} /> {meta.minutes} min read</span>
				{#if meta.checked}<span>Facts checked {briefDate(meta.checked)}</span>{/if}
			</p>
			<h1 id="brief-title">{meta.title}</h1>
			<p class="hook">{meta.hook}</p>

			<section class="sum" aria-labelledby="sum-title">
				<h2 id="sum-title" class="sum-label">TL;DR</h2>
				<ul>
					{#each meta.tldr as line, i (i)}<li>{line}</li>{/each}
				</ul>
				<p class="sum-foot">That’s the short version. The rest takes about {meta.minutes} minutes.</p>
			</section>

			<div class="prose body">
				<Body />
			</div>

			<footer class="end" bind:this={end}>
				{#if read}
					<p class="done"><Icon name="check" size={18} stroke={3} /> Read. It counts toward your streak.</p>
				{/if}
				{#if deeper}
					<a class="deeper t-{deeper.track} lv-{deeper.level}" href={resolve('/learn/[slug]', { slug: deeper.id })}>
						<span class="deeper-label">Go deeper: a full lesson</span>
						<span class="deeper-title">{deeper.title}</span>
						<span class="meta-row"><LevelTag level={deeper.level} /><span>{trackById(deeper.track).title}</span><span>{deeper.minutes} min</span></span>
					</a>
				{/if}
			</footer>
		</article>

		<aside class="more" aria-labelledby="more-title">
			<h2 id="more-title">More TL;DR</h2>
			<ul>
				{#each more as b (b.id)}
					<li>
						<span class="meta-row"><span class="kind"><Icon name={icons[b.kind]} size={14} stroke={2} />{briefKind(b.kind).label}</span><span>{b.minutes} min</span>{#if progress.briefRead(b.id)}<span class="done"><Icon name="check" size={13} stroke={3} /> Read</span>{/if}</span>
						<a href={resolve('/learn/tldr/[slug]', { slug: b.id })}>{b.title}</a>
					</li>
				{/each}
			</ul>
			<a class="all" href={resolve('/learn/tldr')}>Every TL;DR <Icon name="arrow-right" size={16} stroke={2.5} /></a>
		</aside>
	</div>
{/key}

<style>
	.brief {
		display: grid;
		gap: 3rem;
	}

	.main {
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		justify-self: start;
		min-height: 2.75rem;
		color: var(--ink-2);
		font-weight: 800;
		text-decoration: none;
	}

	.back:hover {
		color: var(--gold);
	}

	.kind {
		color: var(--gold);
		font-weight: 800;
	}

	h1 {
		max-width: 24ch;
		text-wrap: balance;
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.02;
	}

	.hook {
		max-width: 44rem;
		font-size: 1.2rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	/* The summary sits between gold rules, never in a box. */
	.sum {
		display: grid;
		gap: 0.55rem;
		max-width: 46rem;
		margin-top: 0.75rem;
		padding: 1.1rem 0 1.2rem;
		border-block: 2px solid var(--gold);
	}

	.sum-label {
		font-family: var(--mono);
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--gold);
	}

	.sum ul {
		display: grid;
		gap: 0.55rem;
	}

	.sum li {
		position: relative;
		padding-left: 1.3rem;
		font-size: 1.12rem;
		line-height: 1.5;
	}

	.sum li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.66em;
		width: 0.55rem;
		height: 3px;
		border-radius: 3px;
		background: var(--gold);
	}

	.sum-foot {
		font-size: 0.95rem;
		color: var(--ink-3);
	}

	.body {
		max-width: 46rem;
		margin-top: 1rem;
	}

	.end {
		display: grid;
		gap: 1rem;
		max-width: 46rem;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--rule);
	}

	.done {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--structures);
		font-weight: 800;
	}

	/* A full lesson, framed in its level colour like every lesson card. */
	.deeper {
		display: grid;
		gap: 0.3rem;
		padding: 1rem 1.1rem;
		border-radius: 16px;
		border: 2px solid var(--lv);
		background: var(--panel);
		color: var(--ink);
		text-decoration: none;
	}

	.deeper-label {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--t);
	}

	.deeper-title {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.15;
	}

	.deeper:hover .deeper-title {
		color: var(--t);
	}

	.more h2 {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.more ul {
		display: grid;
		margin-top: 0.4rem;
	}

	.more li {
		display: grid;
		gap: 0.25rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.more .meta-row {
		font-size: 0.88rem;
	}

	.more li a {
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--ink);
		text-decoration: none;
	}

	.more li a:hover {
		color: var(--gold);
	}

	.all {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		margin-top: 0.4rem;
		color: var(--gold);
		font-weight: 800;
		text-decoration: none;
	}

	@media (min-width: 1100px) {
		.brief {
			grid-template-columns: minmax(0, 1fr) 20rem;
			column-gap: 3.5rem;
			align-items: start;
		}

		.more {
			position: sticky;
			top: 6rem;
		}
	}
</style>
