import { liveArticles, tracks, articlesInTrack } from '../content/catalog';
import { cards } from '../content/cards';
import { problems } from '../content/problems';
import type { Level } from '../content/types';
import type { ProgressData } from './progress.svelte';

export type Achievement = {
	id: string;
	title: string;
	/** What earns it, in one short sentence. */
	goal: string;
	icon: string;
	/** Progress toward the goal: earned when have >= need. */
	have: number;
	need: number;
};

type Stats = { data: ProgressData; unlockedCards: number; bestStreak: number };

/**
 * Every achievement is computed from progress that already exists, so nothing new
 * is stored and an imported progress file earns the same badges.
 */
export function achievements({ data, unlockedCards, bestStreak }: Stats): Achievement[] {
	const done = (id: string) => id in data.completed;
	const finished = liveArticles.filter((a) => done(a.id));
	const levelsDone = new Set<Level>(finished.map((a) => a.level));
	const solved = Object.values(data.solved);
	const knew = Object.values(data.cards).reduce((n, c) => n + c.knew, 0);
	const perfect = Object.values(data.quizzes ?? {}).filter((q) => q.best === q.total).length;
	const half = Math.ceil(liveArticles.length / 2);

	const trackBadges: Achievement[] = tracks.map((track) => {
		const list = articlesInTrack(track.id).filter((a) => a.status === 'live');
		return {
			id: `track-${track.id}`,
			title: { web: 'Web Wanderer', programming: 'Code Whisperer', structures: 'Structure Builder' }[track.id],
			goal: `Finish every ${track.title} lesson.`,
			icon: { web: 'route', programming: 'code', structures: 'layers' }[track.id],
			have: list.filter((a) => done(a.id)).length,
			need: list.length
		};
	});

	return [
		{ id: 'first-lesson', title: 'First Steps', goal: 'Finish your first lesson.', icon: 'book', have: finished.length, need: 1 },
		{ id: 'halfway', title: 'Halfway There', goal: `Finish ${half} lessons.`, icon: 'map', have: finished.length, need: half },
		{ id: 'every-lesson', title: 'Completionist', goal: 'Finish every lesson.', icon: 'trophy', have: finished.length, need: liveArticles.length },
		...trackBadges,
		{ id: 'senior', title: 'Senior Reader', goal: 'Finish a Senior lesson.', icon: 'bolt', have: levelsDone.has('senior') ? 1 : 0, need: 1 },
		{ id: 'all-levels', title: 'Level Climber', goal: 'Finish a lesson at every level.', icon: 'stack', have: levelsDone.size, need: 3 },
		{ id: 'perfect-check', title: 'Sharpshooter', goal: 'Get every question right in a quick check.', icon: 'target', have: Math.min(perfect, 1), need: 1 },
		{ id: 'collector', title: 'Collector', goal: 'Collect 25 concept cards.', icon: 'cards', have: unlockedCards, need: 25 },
		{ id: 'full-binder', title: 'Full Binder', goal: `Collect all ${cards.length} cards.`, icon: 'grid', have: unlockedCards, need: cards.length },
		{ id: 'memory', title: 'Sharp Memory', goal: 'Mark 10 trivia cards as known.', icon: 'flip', have: knew, need: 10 },
		{ id: 'first-solve', title: 'Problem Solver', goal: 'Solve a practice problem.', icon: 'check', have: solved.length, need: 1 },
		{
			id: 'bilingual',
			title: 'Bilingual',
			goal: 'Solve problems in both Python and JavaScript.',
			icon: 'swap',
			have: new Set(solved.map((s) => s.language)).size,
			need: 2
		},
		{ id: 'all-problems', title: 'Pattern Master', goal: `Solve all ${problems.length} problems.`, icon: 'command', have: solved.length, need: problems.length },
		{ id: 'streak-3', title: 'On a Roll', goal: 'Learn three days in a row.', icon: 'flame', have: bestStreak, need: 3 },
		{ id: 'streak-7', title: 'Week Strong', goal: 'Learn seven days in a row.', icon: 'flame', have: bestStreak, need: 7 }
	];
}

export const earned = (a: Achievement) => a.have >= a.need;
