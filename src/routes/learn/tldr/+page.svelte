<script lang="ts">
	import { resolve } from '$app/paths';
	import { briefs, briefKinds, briefKind, briefDate, type BriefKind, type BriefMeta } from '#lib/content/briefs.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import Icon from '#lib/components/Icon.svelte';
	import LearnSwitch from '#lib/components/app/LearnSwitch.svelte';

	/**
	 * TL;DR: five-minute reads, newest first and deliberately ungrouped. The newest leads
	 * with its three-bullet summary; the rest are a plain list a reader can skim.
	 */
	let kind = $state<BriefKind | 'all'>('all');
	const shown = $derived(kind === 'all' ? briefs : briefs.filter((b) => b.kind === kind));
	const lead = $derived(shown[0]);
	const rest = $derived(shown.slice(1));

	const icons: Record<BriefKind, string> = { new: 'spark', concept: 'info', story: 'flame', how: 'search', debate: 'flip' };
	const href = (b: BriefMeta) => resolve('/learn/tldr/[slug]', { slug: b.id });
</script>

<svelte:head>
	<title>TL;DR · DevCodex</title>
	<meta name="description" content="Five-minute reads on new tech, small concepts, real incidents and how things work." />
	<link rel="alternate" type="application/rss+xml" title="DevCodex TL;DR" href={resolve('/learn/tldr/feed.xml')} />
</svelte:head>

{#snippet kindLine(b: BriefMeta)}
	<span class="kind"><Icon name={icons[b.kind]} size={15} stroke={2} />{briefKind(b.kind).label}</span>
	<span>{briefDate(b.published)}</span>
	<span>{b.minutes} min</span>
	{#if progress.briefRead(b.id)}<span class="read"><Icon name="check" size={14} stroke={3} /> Read</span>{/if}
{/snippet}

<div class="tldr">
	<header class="head">
		<h1>Learn</h1>
		<p class="tagline">Your path to expertise.</p>
		<div class="switch"><LearnSwitch current="tldr" /></div>
		<p class="intro">Five-minute reads on new tech, small concepts and real incidents. Newest first; read in any order.</p>
		<a class="feed" href={resolve('/learn/tldr/feed.xml')} data-sveltekit-reload><Icon name="rss" size={16} stroke={2.5} /> Follow by RSS</a>
		<div class="kinds" role="radiogroup" aria-label="Kind of read">
			<button type="button" role="radio" aria-checked={kind === 'all'} class:on={kind === 'all'} onclick={() => (kind = 'all')}>Everything</button>
			{#each briefKinds as k (k.id)}
				<button type="button" role="radio" aria-checked={kind === k.id} class:on={kind === k.id} title={k.blurb} onclick={() => (kind = k.id)}>{k.label}</button>
			{/each}
		</div>
	</header>

	{#if lead}
		<article class="lead" aria-labelledby="lead-title">
			<p class="meta-row">{@render kindLine(lead)}</p>
			<h2 id="lead-title"><a href={href(lead)}>{lead.title}</a></h2>
			<p class="hook">{lead.hook}</p>
			<div class="sum">
				<p class="sum-label">TL;DR</p>
				<ul>
					{#each lead.tldr as line, i (i)}<li>{line}</li>{/each}
				</ul>
			</div>
			<a class="go" href={href(lead)}>Read it in {lead.minutes} minutes <Icon name="arrow-right" size={18} stroke={2.5} /></a>
		</article>
	{/if}

	{#if rest.length}
		<section aria-labelledby="more-title">
			<h2 id="more-title" class="visually-hidden">More reads</h2>
			<ol class="list">
				{#each rest as b (b.id)}
					<li class:done={progress.briefRead(b.id)}>
						<p class="meta-row">{@render kindLine(b)}</p>
						<a class="title" href={href(b)}>{b.title}</a>
						<p class="hook">{b.hook}</p>
					</li>
				{/each}
			</ol>
		</section>
	{/if}
</div>

<style>
	.tldr {
		display: grid;
		gap: 2rem;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.tagline {
		margin-top: 0.3rem;
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--ink-2);
	}

	.switch {
		margin-top: 1rem;
	}

	.intro {
		margin-top: 1rem;
		max-width: 40rem;
		color: var(--ink-2);
	}

	.feed {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		color: var(--gold);
		font-weight: 800;
		text-decoration: none;
		white-space: nowrap;
	}

	.feed:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	/* Kind filter: text tabs, the chosen one underlined in gold. */
	.kinds {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.4rem;
		margin-top: 0.6rem;
	}

	.kinds button {
		min-height: 2.75rem;
		padding: 0;
		border: 0;
		border-bottom: 3px solid transparent;
		background: none;
		color: var(--ink-3);
		font-size: 0.95rem;
		font-weight: 800;
		cursor: pointer;
	}

	.kinds button:hover {
		color: var(--ink);
	}

	.kinds button.on {
		color: var(--gold);
		border-bottom-color: var(--gold);
	}

	.meta-row {
		font-size: 0.88rem;
	}

	.kind {
		color: var(--gold);
		font-weight: 800;
	}

	.read {
		color: var(--structures);
	}

	/* The newest read leads, with its three bullets: the page's one loud moment. */
	.lead {
		display: grid;
		gap: 0.6rem;
		padding: 1.4rem 0 1.6rem;
		border-block: 2px solid var(--gold);
	}

	.lead h2 {
		max-width: 28ch;
		text-wrap: balance;
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.lead h2 a {
		color: var(--ink);
		text-decoration: none;
	}

	.lead h2 a:hover {
		color: var(--gold);
	}

	.hook {
		max-width: 46rem;
		font-size: 1.12rem;
		line-height: 1.5;
		color: var(--ink-2);
	}

	.sum {
		display: grid;
		gap: 0.4rem;
		max-width: 56rem;
		margin-top: 0.4rem;
	}

	.sum-label {
		font-family: var(--mono);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--gold);
	}

	.sum ul {
		display: grid;
		gap: 0.5rem;
	}

	.sum li {
		position: relative;
		padding-left: 1.3rem;
		font-size: 1.05rem;
		line-height: 1.5;
	}

	.sum li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.62em;
		width: 0.55rem;
		height: 3px;
		border-radius: 3px;
		background: var(--gold);
	}

	.go {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		justify-self: start;
		min-height: 3rem;
		margin-top: 0.4rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		background: var(--gold);
		color: #1d1400;
		font-family: var(--display);
		font-weight: 800;
		text-decoration: none;
	}

	/* The rest: a plain, skimmable list. Two columns where there is room. */
	.list {
		display: grid;
		column-gap: 2.75rem;
	}

	.list li {
		display: grid;
		gap: 0.3rem;
		align-content: start;
		padding: 1.1rem 0 1.2rem;
		border-bottom: 1px solid var(--rule);
	}

	.title {
		font-family: var(--display);
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--ink);
		text-decoration: none;
	}

	.title:hover {
		color: var(--gold);
	}

	.list .done .title {
		color: var(--ink-2);
	}

	.list .hook {
		font-size: 1.05rem;
	}

	@media (min-width: 900px) {
		.list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
