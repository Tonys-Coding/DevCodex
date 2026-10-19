import type { Problem } from '../content/types';

const sortByJson = (list: unknown[]) => [...list].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));

/** A canonical JSON string for a value under the problem's comparison rule. */
export function canonical(value: unknown, mode: Problem['compare']): string {
	if (mode === 'exact' || !Array.isArray(value)) return JSON.stringify(value);
	if (mode === 'unordered') return JSON.stringify(sortByJson(value));
	return JSON.stringify(sortByJson(value.map((inner) => (Array.isArray(inner) ? sortByJson(inner) : inner))));
}

export const sameAnswer = (got: unknown, expected: unknown, mode: Problem['compare']) =>
	canonical(got, mode) === canonical(expected, mode);

/** Short, readable rendering of a value for the results list. */
export function show(value: unknown): string {
	const text = JSON.stringify(value);
	return text === undefined ? 'undefined' : text.replace(/,(?=\S)/g, ', ');
}
