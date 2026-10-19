export type TrackId = 'web' | 'programming' | 'structures';

export type Track = {
	id: TrackId;
	title: string;
	short: string;
	blurb: string;
};

/** Article difficulty. Each level has its own writing register (see PRODUCT.md, "Article levels"). */
export type Level = 'entry' | 'experienced' | 'senior';

export type ArticleMeta = {
	id: string;
	title: string;
	summary: string;
	dek: string;
	minutes: number;
	track: TrackId;
	level: Level;
	/** What the reader should already know, in one short sentence. */
	assumes: string;
	/** Lessons this one builds on, by id. Shown as "Builds on" links and a gentle nudge if unfinished. */
	builds?: string[];
	/** `soon` articles are listed in the curriculum but not written yet. */
	status: 'live' | 'soon';
};

export type ConceptCard = {
	id: string;
	term: string;
	track: TrackId;
	question: string;
	answer: string;
	detail: string;
	/** Article that unlocks the card. Missing = in the deck from the start. */
	unlockedBy?: string;
	level: 1 | 2 | 3;
};

export type ShortNode = { id: string; label: string; x: number; y: number };

export type Short =
	| {
			kind: 'explainer';
			id: string;
			title: string;
			articleId: string;
			nodes: ShortNode[];
			links: [string, string][];
			scenes: { caption: string; lit: string[]; hop?: { from: string; to: string; label: string } }[];
	  }
	| {
			kind: 'bug';
			id: string;
			title: string;
			articleId: string;
			code: string;
			question: string;
			options: string[];
			answer: number;
			explain: string;
	  }
	| {
			kind: 'pick';
			id: string;
			title: string;
			articleId: string;
			scenario: string;
			options: { label: string; cost: string }[];
			answer: number;
			explain: string;
	  }
	| {
			kind: 'myth';
			id: string;
			title: string;
			articleId: string;
			claim: string;
			isFact: boolean;
			explain: string;
	  };

export type Language = 'python' | 'javascript';

export type TestCase = { args: unknown[]; expected: unknown };

export type Problem = {
	id: string;
	title: string;
	pattern: 'Arrays & Hashing' | 'Two Pointers' | 'Sliding Window' | 'Stack';
	difficulty: 'Easy' | 'Medium';
	statement: string;
	examples: { input: string; output: string; note?: string }[];
	hint: string;
	/** How results are compared: exact JSON, or ignoring order at the top level / both levels. */
	compare: 'exact' | 'unordered' | 'unordered-deep';
	fn: Record<Language, string>;
	starter: Record<Language, string>;
	solution: Record<Language, string>;
	tests: TestCase[];
	external: { label: string; url: string };
};
