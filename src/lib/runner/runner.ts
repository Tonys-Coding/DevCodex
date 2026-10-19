import type { Language, Problem } from '../content/types';
import { sameAnswer } from './compare';
import type { CaseOutcome, WorkerMessage } from './protocol';

export type CaseResult = {
	args: unknown[];
	expected: unknown;
	outcome: CaseOutcome;
	pass: boolean;
};

export type RunResult =
	| { kind: 'done'; cases: CaseResult[]; passed: number; stdout: string }
	| { kind: 'error'; message: string; stdout: string }
	| { kind: 'timeout'; seconds: number };

/** Time allowed for the solution itself, after the language has loaded. */
const LIMIT_MS: Record<Language, number> = { javascript: 4000, python: 8000 };

const spawn: Record<Language, () => Worker> = {
	javascript: () => new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' }),
	python: () => new Worker(new URL('./py.worker.ts', import.meta.url), { type: 'module' })
};

type Slot = { worker: Worker; ready: Promise<void> };

/**
 * Runs solutions in a Web Worker per language. A run that exceeds its time
 * limit terminates the worker (the only way to stop an infinite loop without
 * cross-origin isolation), and a fresh one is started next time.
 */
export class Runner {
	#slots: Partial<Record<Language, Slot>> = {};
	#nextId = 1;
	onStatus: (text: string) => void = () => {};

	#slot(language: Language): Slot {
		const existing = this.#slots[language];
		if (existing) return existing;
		const worker = spawn[language]();
		const ready = new Promise<void>((resolve, reject) => {
			const listen = (event: MessageEvent<WorkerMessage>) => {
				const message = event.data;
				if (message.type === 'status') this.onStatus(message.text);
				if (message.type === 'ready') {
					worker.removeEventListener('message', listen);
					resolve();
				}
			};
			worker.addEventListener('message', listen);
			worker.addEventListener('error', (event) => reject(new Error(event.message || 'The runner failed to start.')), { once: true });
		});
		const slot = { worker, ready };
		this.#slots[language] = slot;
		return slot;
	}

	/** Start loading a language early (e.g. when the practice page opens). */
	warm(language: Language) {
		this.#slot(language);
	}

	#kill(language: Language) {
		this.#slots[language]?.worker.terminate();
		delete this.#slots[language];
	}

	async run(problem: Problem, language: Language, code: string): Promise<RunResult> {
		const slot = this.#slot(language);
		try {
			await slot.ready;
		} catch (error) {
			this.#kill(language);
			return { kind: 'error', message: String(error instanceof Error ? error.message : error), stdout: '' };
		}
		this.onStatus('Running tests…');

		const id = this.#nextId++;
		const args = problem.tests.map((t) => t.args);
		return new Promise<RunResult>((resolve) => {
			const timer = setTimeout(() => {
				slot.worker.removeEventListener('message', listen);
				this.#kill(language);
				resolve({ kind: 'timeout', seconds: LIMIT_MS[language] / 1000 });
			}, LIMIT_MS[language]);

			const listen = (event: MessageEvent<WorkerMessage>) => {
				const message = event.data;
				if (message.type !== 'done' && message.type !== 'failed') return;
				if (message.id !== id) return;
				clearTimeout(timer);
				slot.worker.removeEventListener('message', listen);
				if (message.type === 'failed') {
					resolve({ kind: 'error', message: message.error, stdout: message.stdout });
					return;
				}
				const cases = message.cases.map((outcome, i): CaseResult => {
					const test = problem.tests[i];
					return { args: test.args, expected: test.expected, outcome, pass: outcome.ok && sameAnswer(outcome.value, test.expected, problem.compare) };
				});
				resolve({ kind: 'done', cases, passed: cases.filter((c) => c.pass).length, stdout: message.stdout });
			};
			slot.worker.addEventListener('message', listen);
			slot.worker.postMessage({ id, code, fn: problem.fn[language], args });
		});
	}

	dispose() {
		this.#kill('javascript');
		this.#kill('python');
	}
}
