import type { Level } from './types';

export type LevelInfo = {
	id: Level;
	/** Name shown on tags: the career stage the article is written for. */
	label: string;
	/** Plain difficulty word shown next to the label. */
	grade: 'Easy' | 'Medium' | 'Hard';
	pips: 1 | 2 | 3;
	blurb: string;
};

export const levels: LevelInfo[] = [
	{ id: 'entry', label: 'Entry-level', grade: 'Easy', pips: 1, blurb: 'Plain words, every term explained. No background needed.' },
	{ id: 'experienced', label: 'Experienced', grade: 'Medium', pips: 2, blurb: 'Assumes you write code. Real terminology, trade-offs and pitfalls.' },
	{ id: 'senior', label: 'Senior', grade: 'Hard', pips: 3, blurb: 'No guardrails. Internals, specs, edge cases and the numbers behind them.' }
];

export const levelById = (id: Level) => levels.find((l) => l.id === id)!;
