import type { Depth, Level } from './types';

export type LevelInfo = {
	id: Level;
	/** The difficulty of the concept itself. */
	label: 'Easy' | 'Medium' | 'Hard';
	pips: 1 | 2 | 3;
	blurb: string;
};

/** Difficulty describes the concept (see the rubric in PRODUCT.md), never the reader. */
export const levels: LevelInfo[] = [
	{ id: 'easy', label: 'Easy', pips: 1, blurb: 'A fundamental idea: few prerequisites and one concept to hold.' },
	{ id: 'medium', label: 'Medium', pips: 2, blurb: 'Builds on fundamentals: an idea plus rules or invariants to keep in mind.' },
	{ id: 'hard', label: 'Hard', pips: 3, blurb: 'Several interacting ideas and invariants, after Medium topics.' }
];

export const levelById = (id: Level) => levels.find((l) => l.id === id)!;

export type DepthInfo = { id: Depth; label: string; pips: 1 | 2 | 3; blurb: string };

/** The three layers inside every lesson, from plain words to internals. */
export const depths: DepthInfo[] = [
	{ id: 'core', label: 'Core', pips: 1, blurb: 'Plain words: everything you need to use the idea.' },
	{ id: 'deeper', label: 'Going deeper', pips: 2, blurb: 'Real terminology, trade-offs, pitfalls and code.' },
	{ id: 'hood', label: 'Under the hood', pips: 3, blurb: 'Internals, specs, edge cases and the numbers behind them.' }
];

export const depthById = (id: Depth) => depths.find((d) => d.id === id)!;
