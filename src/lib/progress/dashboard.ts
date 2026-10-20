import { liveArticles } from '../content/catalog';
import type { ArticleMeta, ConceptCard } from '../content/types';
import type { ProgressData, Reading } from './progress.svelte';

/** Small, pure helpers behind the Binder dashboard. Dates are the learner's local dates. */

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The reading path: easiest concepts first, keeping each track's prerequisite order. */
export const path = (): ArticleMeta[] => liveArticles;

export type Hero =
	| { mode: 'resume'; article: ArticleMeta; reading: Reading }
	| { mode: 'next'; article: ArticleMeta }
	| { mode: 'done' };

const RESUME_WITHIN_DAYS = 3;

/** One next step: resume what was read in the last few days, otherwise the next unstarted lesson on the path. */
export function hero(data: ProgressData, inProgress: { id: string; reading: Reading }[], now: Date): Hero {
	const recent = inProgress.find(({ reading }) => now.getTime() - Date.parse(reading.last) < RESUME_WITHIN_DAYS * 86_400_000);
	const article = recent && liveArticles.find((a) => a.id === recent.id);
	if (recent && article) return { mode: 'resume', article, reading: recent.reading };
	const order = path();
	const next =
		order.find((a) => !(a.id in data.completed) && !data.reading?.[a.id]) ?? order.find((a) => !(a.id in data.completed));
	return next ? { mode: 'next', article: next } : { mode: 'done' };
}

/** Monday to Sunday of the current week. */
export function week(now: Date) {
	const monday = new Date(now);
	monday.setHours(0, 0, 0, 0);
	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
	const today = dayKey(now);
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		const key = dayKey(d);
		return { key, short: d.toLocaleDateString(undefined, { weekday: 'narrow' }), long: d.toLocaleDateString(undefined, { weekday: 'long' }), today: key === today, future: key > today };
	});
}

/** Lessons finished since Monday. */
export function finishedThisWeek(data: ProgressData, now: Date): number {
	const start = week(now)[0].key;
	return Object.values(data.completed).filter((iso) => dayKey(new Date(iso)) >= start).length;
}

export function timeAgo(iso: string, now: Date): string {
	const days = Math.round((Date.parse(dayKey(now)) - Date.parse(dayKey(new Date(iso)))) / 86_400_000);
	if (days <= 0) return 'today';
	if (days === 1) return 'yesterday';
	if (days < 7) return `${days} days ago`;
	return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Cards worth a review now: never seen, or missed more often than known. */
export function dueCards(unlocked: ConceptCard[], data: ProgressData): ConceptCard[] {
	return unlocked.filter((card) => {
		const r = data.cards[card.id];
		return !r || r.again >= r.knew;
	});
}

/** About 20 seconds a card, rounded up to whole minutes. */
export const reviewMinutes = (count: number) => Math.max(1, Math.ceil((count * 20) / 60));

/** The same card all day, a different one tomorrow. */
export function cardOfDay(unlocked: ConceptCard[], now: Date): ConceptCard | undefined {
	if (!unlocked.length) return undefined;
	let h = 0;
	for (const ch of dayKey(now)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return unlocked[h % unlocked.length];
}

/** Anything worth losing: a finished lesson, a solved problem or a reviewed card. */
export const hasProgress = (data: ProgressData) =>
	Object.keys(data.completed).length > 0 || Object.keys(data.solved).length > 0 || Object.keys(data.cards).length > 0;

/** True when progress lives only in an uninstalled browser tab with no recent backup. */
export function needsBackup(data: ProgressData, installed: boolean, now: Date): boolean {
	if (installed || !hasProgress(data)) return false;
	const ago = (iso?: string) => (iso ? (now.getTime() - Date.parse(iso)) / 86_400_000 : Infinity);
	return ago(data.backup?.exported) > 14 && ago(data.backup?.dismissed) > 7;
}

/** Whether DevCodex is running as an installed app (Home Screen, Dock or desktop install). */
export function isInstalled(): boolean {
	if (typeof window === 'undefined') return false;
	return matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Saves the progress export as a file. */
export function downloadBackup(json: string) {
	const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = `devcodex-progress-${new Date().toISOString().slice(0, 10)}.json`;
	link.click();
	URL.revokeObjectURL(url);
}
