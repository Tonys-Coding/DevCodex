import { get, set, del } from 'idb-keyval';
import { cards } from '../content/cards';
import type { ConceptCard, Language } from '../content/types';

/**
 * Everything DevCodex remembers about a learner. Stored on this device only
 * (IndexedDB). The `version` field lets a future sync service migrate it.
 */
export type ProgressData = {
	version: 1;
	/** articleId → ISO time finished */
	completed: Record<string, string>;
	/** cardId → review history */
	cards: Record<string, { seen: string; knew: number; again: number; last?: string }>;
	/** problemId → first solve */
	solved: Record<string, { at: string; language: Language }>;
	/** `${problemId}:${language}` → unsaved code */
	drafts: Record<string, string>;
	/** Local dates (YYYY-MM-DD) with any learning activity. */
	days: string[];
	/** articleId → where the reader got to. Optional fields were added later; version 1 files without them still load. */
	reading?: Record<string, Reading>;
	/** `${articleId}:${quizTitle}` → best quick-check result */
	quizzes?: Record<string, { best: number; total: number; at: string }>;
	/** What the dashboard greets the learner as. Never leaves the device. */
	profile?: { name?: string };
};

export type Reading = {
	/** First opened, and last read, as ISO times. */
	opened: string;
	last: string;
	/** Furthest point reached, 0–1. */
	percent: number;
	/** The section being read when they left. */
	section?: { id: string; text: string };
};

const KEY = 'devcodex:progress';

const empty = (): ProgressData => ({ version: 1, completed: {}, cards: {}, solved: {}, drafts: {}, days: [], reading: {}, quizzes: {}, profile: {} });

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Accept only data with the expected shape; anything else is rejected, never half-loaded. */
function parse(value: unknown): ProgressData | null {
	if (!isRecord(value) || value.version !== 1) return null;
	const { completed, cards: c, solved, drafts, days, reading, quizzes, profile } = value;
	if (![completed, c, solved, drafts].every(isRecord) || !Array.isArray(days)) return null;
	const name = isRecord(profile) && typeof profile.name === 'string' ? profile.name.slice(0, 40) : undefined;
	return {
		version: 1,
		completed,
		cards: c,
		solved,
		drafts,
		days: days.filter((d) => typeof d === 'string'),
		reading: isRecord(reading) ? reading : {},
		quizzes: isRecord(quizzes) ? quizzes : {},
		profile: name ? { name } : {}
	} as ProgressData;
}

const today = () => {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

class Progress {
	data = $state<ProgressData>(empty());
	/** True once stored progress has been read (or found missing). */
	loaded = $state(false);
	/** False when the browser refuses storage (e.g. some private modes). */
	persistent = $state(true);

	isUnlocked = (card: ConceptCard) => !card.unlockedBy || card.unlockedBy in this.data.completed;
	isNew = (card: ConceptCard) => this.isUnlocked(card) && !this.data.cards[card.id];
	isDone = (articleId: string) => articleId in this.data.completed;

	unlockedCards = $derived(cards.filter((card) => this.isUnlocked(card)));
	lockedCards = $derived(cards.filter((card) => !this.isUnlocked(card)));

	/** Review order: unseen first, then the ones missed most, then the longest-unreviewed. */
	deck = $derived(
		[...this.unlockedCards].sort((a, b) => {
			const x = this.data.cards[a.id];
			const y = this.data.cards[b.id];
			if (!x || !y) return x ? 1 : y ? -1 : 0;
			const weight = y.again - y.knew - (x.again - x.knew);
			if (weight !== 0) return weight;
			return (x.last ?? '').localeCompare(y.last ?? '');
		})
	);

	streak = $derived.by(() => {
		const set = new Set(this.data.days);
		const cursor = new Date();
		const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		// A streak survives until the end of the day after the last activity.
		if (!set.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
		let count = 0;
		while (set.has(key(cursor))) {
			count++;
			cursor.setDate(cursor.getDate() - 1);
		}
		return count;
	});

	/** The longest run of consecutive active days ever, so a streak badge is kept once earned. */
	bestStreak = $derived.by(() => {
		const sorted = [...new Set(this.data.days)].sort();
		let best = 0;
		let run = 0;
		let prev: number | undefined;
		for (const day of sorted) {
			const [y, m, d] = day.split('-').map(Number);
			const n = Date.UTC(y, m - 1, d) / 86_400_000;
			run = prev !== undefined && n - prev === 1 ? run + 1 : 1;
			best = Math.max(best, run);
			prev = n;
		}
		return best;
	});

	/** Lessons opened but not finished, most recently read first. */
	inProgress = $derived(
		Object.entries(this.data.reading ?? {})
			.filter(([id]) => !this.isDone(id))
			.sort(([, a], [, b]) => b.last.localeCompare(a.last))
			.map(([id, reading]) => ({ id, reading }))
	);

	async load() {
		try {
			const stored = parse(await get(KEY));
			if (stored) this.data = stored;
		} catch {
			this.persistent = false;
		}
		this.loaded = true;
	}

	#save() {
		set(KEY, $state.snapshot(this.data)).catch(() => (this.persistent = false));
	}

	#touch() {
		const day = today();
		if (!this.data.days.includes(day)) this.data.days = [...this.data.days, day].slice(-400);
	}

	/** Marks an article finished and returns the cards it unlocked. */
	finish(articleId: string) {
		const opened = cards.filter((card) => card.unlockedBy === articleId);
		if (!this.isDone(articleId)) {
			this.data.completed[articleId] = new Date().toISOString();
			this.#touch();
			this.#save();
		}
		return opened;
	}

	grade(cardId: string, knew: boolean) {
		const now = new Date().toISOString();
		const entry = this.data.cards[cardId] ?? { seen: now, knew: 0, again: 0 };
		if (knew) entry.knew++;
		else entry.again++;
		entry.last = now;
		this.data.cards[cardId] = entry;
		this.#touch();
		this.#save();
	}

	markSeen(cardIds: string[]) {
		const now = new Date().toISOString();
		let changed = false;
		for (const id of cardIds) {
			if (this.data.cards[id]) continue;
			this.data.cards[id] = { seen: now, knew: 0, again: 0 };
			changed = true;
		}
		if (changed) this.#save();
	}

	/** Records how far into an article the reader is. Saves are batched while scrolling. */
	#readTimer: ReturnType<typeof setTimeout> | undefined;
	read(articleId: string, percent: number, section?: { id: string; text: string }) {
		const now = new Date().toISOString();
		this.data.reading ??= {};
		const entry = this.data.reading[articleId];
		this.data.reading[articleId] = {
			opened: entry?.opened ?? now,
			last: now,
			percent: Math.max(entry?.percent ?? 0, Math.min(1, Math.max(0, percent))),
			section: section ?? entry?.section
		};
		clearTimeout(this.#readTimer);
		this.#readTimer = setTimeout(() => this.#save(), 800);
	}

	/** Keeps the best score for one quick check. */
	quiz(key: string, right: number, total: number) {
		this.data.quizzes ??= {};
		const entry = this.data.quizzes[key];
		if (!entry || right > entry.best) this.data.quizzes[key] = { best: right, total, at: new Date().toISOString() };
		this.#touch();
		this.#save();
	}

	setName(name: string) {
		const clean = name.trim().slice(0, 40);
		this.data.profile = clean ? { name: clean } : {};
		this.#save();
	}

	solve(problemId: string, language: Language) {
		if (!this.data.solved[problemId]) this.data.solved[problemId] = { at: new Date().toISOString(), language };
		this.#touch();
		this.#save();
	}

	#draftTimer: ReturnType<typeof setTimeout> | undefined;
	draft(problemId: string, language: Language) {
		return this.data.drafts[`${problemId}:${language}`];
	}
	saveDraft(problemId: string, language: Language, code: string | undefined) {
		const key = `${problemId}:${language}`;
		if (code === undefined) delete this.data.drafts[key];
		else this.data.drafts[key] = code;
		clearTimeout(this.#draftTimer);
		this.#draftTimer = setTimeout(() => this.#save(), 600);
	}

	export(): string {
		return JSON.stringify({ app: 'DevCodex', exported: new Date().toISOString(), ...$state.snapshot(this.data) }, null, 2);
	}

	/** Replaces progress with an exported file. Returns false if the file is not DevCodex progress. */
	import(text: string): boolean {
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			return false;
		}
		const data = parse(parsed);
		if (!data) return false;
		this.data = data;
		this.#save();
		return true;
	}

	async reset() {
		this.data = empty();
		await del(KEY).catch(() => {});
	}
}

export const progress = new Progress();
