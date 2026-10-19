/** Messages between the page and a runner worker. Both workers speak this. */

export type RunRequest = {
	id: number;
	code: string;
	fn: string;
	/** Argument lists, one per test. */
	args: unknown[][];
};

export type CaseOutcome =
	| { ok: true; value: unknown; ms: number }
	| { ok: false; error: string; ms: number };

export type WorkerMessage =
	| { type: 'status'; text: string }
	| { type: 'ready' }
	| { type: 'done'; id: number; cases: CaseOutcome[]; stdout: string }
	| { type: 'failed'; id: number; error: string; stdout: string };
