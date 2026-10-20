import type { ProgressData } from './progress.svelte';

/**
 * What it takes to open a lesson's pack. Finishing has to mean reading it:
 *  - most of its sections read past (jumping to the end doesn't count),
 *  - real time spent on it (only while the tab is visible and the reader is active),
 *  - every quick check finished, with at least 60% on the multi-question ones.
 * The time step is waived for a reader who reads every section and gets every check fully right.
 */

import type { Depth } from '../content/types';

export type QuizInfo = { key: string; title: string; total: number; depth?: Depth };

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

type SectionInfo = { id: string; depth?: Depth };
const inCore = (x: { depth?: Depth }) => !x.depth || x.depth === 'core';

/** The pack's requirements, which cover the Core layer only. Going deeper and Under the hood are optional. */
export function requirements(
	data: ProgressData,
	article: { id: string; minutes: number },
	allSections: SectionInfo[],
	allQuizzes: QuizInfo[]
): Requirement[] {
	const sectionIds = allSections.filter(inCore).map((s) => s.id);
	const quizzes = allQuizzes.filter(inCore);
	const reading = data.reading?.[article.id];
	const seen = new Set(reading?.sections ?? []);
	const read = sectionIds.filter((id) => seen.has(id)).length;
	const needSections = Math.max(1, Math.ceil(sectionIds.length * SECTION_SHARE));

	const spent = Math.floor(reading?.seconds ?? 0);
	const needTime = requiredSeconds(article.minutes);

	const passed = quizzes.filter((q) => quizPassed(data, q)).length;
	const pending = quizzes.find((q) => !quizPassed(data, q));
	const pendingRecord = pending && data.quizzes?.[pending.key];

	// Reading every section and acing every check is proof enough: the time step is waived.
	const aced = sectionIds.length > 0 && read >= sectionIds.length && quizzes.length > 0 && quizzes.every((q) => data.quizzes?.[q.key]?.best === q.total);
	const timeMet = spent >= needTime || aced;

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
			detail: spent >= needTime ? `${mins(spent)} spent` : aced ? 'Waived: you read every section and aced the checks' : `About ${mins(needTime - spent)} to go`,
			met: timeMet,
			ratio: timeMet ? 1 : Math.min(1, spent / needTime)
		},
		{
			id: 'checks',
			label: quizzes.length === 1 ? 'Pass the quick check' : 'Answer the checkpoints and pass the quick check',
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

/**
 * A deeper layer is finished when most of its sections are read past and its checks
 * are answered (60% or better on multi-question ones). Finishing it unlocks its bonus card.
 */
export function layerRequirements(
	data: ProgressData,
	articleId: string,
	depth: Exclude<Depth, 'core'>,
	allSections: SectionInfo[],
	allQuizzes: QuizInfo[]
): Requirement[] {
	const sectionIds = allSections.filter((s) => s.depth === depth).map((s) => s.id);
	const quizzes = allQuizzes.filter((q) => q.depth === depth);
	const seen = new Set(data.reading?.[articleId]?.sections ?? []);
	const read = sectionIds.filter((id) => seen.has(id)).length;
	const need = Math.max(1, Math.ceil(sectionIds.length * SECTION_SHARE));
	const passed = quizzes.filter((q) => quizPassed(data, q)).length;
	const pending = quizzes.find((q) => !quizPassed(data, q));
	const record = pending && data.quizzes?.[pending.key];
	const out: Requirement[] = [
		{
			id: 'sections',
			label: 'Read through this layer',
			detail: `${Math.min(read, need)} of ${need} sections read`,
			met: read >= need,
			ratio: Math.min(1, read / need)
		}
	];
	if (quizzes.length)
		out.push({
			id: 'checks',
			label: quizzes.length === 1 ? 'Answer its check' : 'Answer its checks',
			detail: !pending
				? `${passed} of ${quizzes.length} done`
				: record
					? `“${pending.title}”: best ${record.best} of ${pending.total}. ${Math.ceil(pending.total * PASS)} needed`
					: `“${pending.title}” not answered yet`,
			met: !pending,
			ratio: passed / quizzes.length
		});
	return out;
}
