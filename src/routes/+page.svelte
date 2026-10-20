<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { liveArticles, articleById } from '#lib/content/catalog.js';
	import { cards } from '#lib/content/cards.js';
	import { problems } from '#lib/content/problems.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { achievements, earned } from '#lib/progress/achievements.js';
	import { hero as pickHero, hasProgress, needsBackup, isInstalled } from '#lib/progress/dashboard.js';
	import type { ArticleMeta } from '#lib/content/types.js';
	import type { Achievement } from '#lib/progress/achievements.js';
	import Greeting from '#lib/components/home/Greeting.svelte';
	import StatStrip from '#lib/components/home/StatStrip.svelte';
	import Onboarding from '#lib/components/home/Onboarding.svelte';
	import Notices from '#lib/components/home/Notices.svelte';
	import Hero from '#lib/components/home/Hero.svelte';
	import ThisWeek from '#lib/components/home/ThisWeek.svelte';
	import ContinueList from '#lib/components/home/ContinueList.svelte';
	import Review from '#lib/components/home/Review.svelte';
	import LessonBinder from '#lib/components/home/LessonBinder.svelte';
	import Medals from '#lib/components/home/Medals.svelte';
	import LessonMap from '#lib/components/home/LessonMap.svelte';
	import FreshRead from '#lib/components/home/FreshRead.svelte';

	/** The dashboard depends on the device's clock and stored progress, so it renders once both are known. */
	let now = $state<Date | null>(null);
	let installed = $state(false);
	onMount(() => {
		now = new Date();
		installed = isInstalled();
	});
	const ready = $derived(progress.loaded && now !== null);

	const newcomer = $derived(!hasProgress(progress.data) && progress.inProgress.length === 0);
	const hero = $derived(now ? pickHero(progress.data, progress.inProgress, now) : null);
	const others = $derived(
		progress.inProgress
			.filter(({ id }) => !(hero?.mode === 'resume' && hero.article.id === id))
			.map(({ id, reading }) => ({ article: articleById(id)!, reading }))
			.filter((x) => x.article?.status === 'live')
			.slice(0, 3)
	);

	const finished = $derived(liveArticles.filter((a) => progress.isDone(a.id)));
	const minutes = $derived(finished.reduce((n, a) => n + a.minutes, 0));
	const solved = $derived(Object.keys(progress.data.solved).length);
	const backup = $derived(now ? needsBackup(progress.data, installed, now) : false);

	/**
	 * Wins since the last visit, worked out once per visit: lessons and medals that
	 * weren't there when the dashboard was last shown. Then the snapshot is updated.
	 */
	let freshLessons = $state<ArticleMeta[]>([]);
	let freshMedals = $state<Achievement[]>([]);
	let celebrated = false;
	$effect(() => {
		if (!ready || celebrated) return;
		celebrated = true;
		untrack(() => {
			const lessons = Object.keys(progress.data.completed);
			const medals = achievements({
				data: progress.data,
				unlockedCards: progress.unlockedCards.length,
				bestStreak: progress.bestStreak
			}).filter(earned);
			const seen = progress.data.seen;
			if (seen) {
				freshLessons = lessons.filter((id) => !seen.lessons.includes(id)).map((id) => articleById(id)!).filter(Boolean);
				freshMedals = medals.filter((m) => !seen.medals.includes(m.id));
			}
			progress.rememberDashboard(lessons, medals.map((m) => m.id));
		});
	});
</script>

<svelte:head>
	<title>DevCodex: learn software engineering, one card at a time</title>
</svelte:head>

<div class="dash">
	<div class="greet">
		<Greeting />
		{#if ready && hero}
			<div class="map" in:fade={{ duration: 300 }}>
				<LessonMap next={hero.mode === 'done' ? undefined : hero.article.id} />
			</div>
		{/if}
	</div>

	{#if ready && now && hero}
		{#if freshLessons.length || freshMedals.length || backup}
			<div class="notes" in:fade={{ duration: 200 }}>
				<Notices newLessons={freshLessons} newMedals={freshMedals} {backup} />
			</div>
		{/if}

		<div class="top" in:fade={{ duration: 200 }}>
			{#if newcomer}
				<Onboarding />
			{:else}
				<StatStrip
					lessons={[finished.length, liveArticles.length]}
					cards={[progress.unlockedCards.length, cards.length]}
					problems={[solved, problems.length]}
					streak={progress.streak}
					{minutes}
				/>
			{/if}
		</div>

		<div class="hero" in:fade={{ duration: 200 }}><Hero {hero} {now} /></div>

		<div class="side" in:fade={{ duration: 200 }}>
			<ThisWeek {now} />
			<FreshRead />
			{#if others.length}<ContinueList items={others} {now} />{/if}
		</div>

		<div class="binder" in:fade={{ duration: 200 }}><LessonBinder fresh={freshLessons.map((a) => a.id)} /></div>

		<div class="side2" in:fade={{ duration: 200 }}>
			<Review {now} />
			<Medals fresh={freshMedals.map((m) => m.id)} />
		</div>
	{/if}
</div>

<style>
	.dash {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.25rem;
	}

	.notes {
		margin-top: -1rem;
	}

	/* The lesson map fills the space beside the greeting on wider screens; phones keep the next step near the top. */
	.map {
		display: none;
	}

	.top {
		margin-top: -0.75rem;
	}

	.side,
	.side2 {
		display: grid;
		gap: 2.25rem;
		align-content: start;
	}

	@media (min-width: 900px) {
		.dash {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
			grid-template-areas:
				'greet greet'
				'notes notes'
				'top top'
				'hero side'
				'binder side2';
			column-gap: 2.75rem;
			row-gap: 2.5rem;
			align-items: start;
		}

		.greet {
			grid-area: greet;
			display: grid;
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
			column-gap: 2.75rem;
			align-items: center;
		}

		.map {
			display: block;
		}

		.notes {
			grid-area: notes;
		}

		.top {
			grid-area: top;
			padding-top: 1.25rem;
			border-top: 1px solid var(--rule);
		}

		.hero {
			grid-area: hero;
			align-self: stretch;
		}

		.side {
			grid-area: side;
		}

		.binder {
			grid-area: binder;
		}

		.side2 {
			grid-area: side2;
		}
	}
</style>
