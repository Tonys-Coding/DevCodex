import type { ProgressData } from './progress.svelte';

/**
 * What it takes to open a lesson's pack. Finishing has to mean reading it:
 *  - most of its sections read past (jumping to the end doesn't count),
 *  - real time spent on it (only while the tab is visible and the reader is active),
 *  - every quick check finished, with at least 60% on the multi-question ones.
 */

export type QuizInfo = { key: string; title: string; total: number };

export type Requirement = {
	id: 'sections' | 'time' | 'checks';
	label: string;
	detail: string;
	met: boolean;
	/** 0–1, for a progress line. */
	ratio: number;
};

const SECTION_SHARE = 0.8;
const TIME_SHARE = 0.3;
const PASS = 0.6;

/** Minimum active time: 30% of the estimated reading time, between 1 and 5 minutes. */
export const requiredSeconds = (minutes: number) => Math.min(300, Math.max(60, Math.round(minutes * 60 * TIME_SHARE)));

export const quizPassed = (data: ProgressData, quiz: QuizInfo) => {
	const r = data.quizzes?.[quiz.key];
	return !!r && (quiz.total === 1 || r.best / quiz.total >= PASS);
};

const mins = (s: number) => {
	const m = Math.ceil(s / 60);
	return `${m} ${m === 1 ? 'minute' : 'minutes'}`;
};

export function requirements(
	data: ProgressData,
	article: { id: string; minutes: number },
	sectionIds: string[],
	quizzes: QuizInfo[]
): Requirement[] {
	const reading = data.reading?.[article.id];
	const seen = new Set(reading?.sections ?? []);
	const read = sectionIds.filter((id) => seen.has(id)).length;
	const needSections = Math.max(1, Math.ceil(sectionIds.length * SECTION_SHARE));

	const spent = Math.floor(reading?.seconds ?? 0);
	const needTime = requiredSeconds(article.minutes);

	const passed = quizzes.filter((q) => quizPassed(data, q)).length;
	const pending = quizzes.find((q) => !quizPassed(data, q));
	const pendingRecord = pending && data.quizzes?.[pending.key];

	return [
		{
			id: 'sections',
			label: 'Read through the lesson',
			detail: `${Math.min(read, needSections)} of ${needSections} sections read`,
			met: read >= needSections,
			ratio: Math.min(1, read / needSections)
		},
		{
			id: 'time',
			label: 'Spend some time with it',
			detail: spent >= needTime ? `${mins(spent)} spent` : `About ${mins(needTime - spent)} to go`,
			met: spent >= needTime,
			ratio: Math.min(1, spent / needTime)
		},
		{
			id: 'checks',
			label: quizzes.length === 1 ? 'Pass the quick check' : 'Pass the quick checks',
			detail: !quizzes.length
				? 'No quick check in this lesson'
				: !pending
					? `${passed} of ${quizzes.length} passed`
					: pendingRecord
						? `“${pending.title}”: best ${pendingRecord.best} of ${pending.total}. ${Math.ceil(pending.total * PASS)} needed, try again`
						: `“${pending.title}” not finished yet`,
			met: passed === quizzes.length,
			ratio: quizzes.length ? passed / quizzes.length : 1
		}
	];
}
