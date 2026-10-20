<script lang="ts">
	import { resolve } from '$app/paths';
	import { briefs, briefKind, briefDate } from '../../content/briefs';
	import { progress } from '../../progress/progress.svelte';
	import Icon from '../Icon.svelte';

	/** The newest TL;DR not read yet (or the newest, once all are read), as one quiet slot. */
	const pick = $derived(briefs.find((b) => !progress.briefRead(b.id)) ?? briefs[0]);
	const unread = $derived(briefs.filter((b) => !progress.briefRead(b.id)).length);
</script>

{#if pick}
	<section class="fresh" aria-labelledby="fresh-title">
		<div class="head">
			<h2 id="fresh-title">TL;DR</h2>
			<p class="meta-row">
				<span class="kind">{briefKind(pick.kind).label}</span>
				<span>{briefDate(pick.published)}</span>
				<span><Icon name="clock" size={15} stroke={2} /> {pick.minutes} min</span>
			</p>
		</div>
		<a class="title" href={resolve('/learn/tldr/[slug]', { slug: pick.id })}>{pick.title}</a>
		<p class="hook">{pick.hook}</p>
		<p class="foot">
			<a href={resolve('/learn/tldr/[slug]', { slug: pick.id })}>Read it <Icon name="arrow-right" size={16} stroke={2.5} /></a>
			<a class="all" href={resolve('/learn/tldr')}>{unread ? `${unread} unread` : 'Every TL;DR'}</a>
		</p>
	</section>
{/if}

<style>
	.fresh {
		display: grid;
		gap: 0.35rem;
		padding-top: 0.9rem;
		border-top: 2px solid var(--gold);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.2rem 1rem;
	}

	h2 {
		font-family: var(--mono);
		font-size: 1.12rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--gold);
	}

	.meta-row {
		font-size: 0.88rem;
	}

	.kind {
		color: var(--gold);
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

	.hook {
		color: var(--ink-2);
		line-height: 1.5;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0 1rem;
		font-weight: 800;
	}

	.foot a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		color: var(--gold);
		text-decoration: none;
	}

	.foot .all {
		color: var(--ink-2);
	}

	.foot a:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
