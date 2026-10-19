/// <reference lib="webworker" />
import type { CaseOutcome, RunRequest, WorkerMessage } from './protocol';

const post = (message: WorkerMessage) => postMessage(message);

function format(value: unknown): string {
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}

onmessage = (event: MessageEvent<RunRequest>) => {
	const { id, code, fn, args } = event.data;
	const lines: string[] = [];
	const log = (...parts: unknown[]) => lines.push(parts.map(format).join(' '));
	const sandboxConsole = { log, info: log, warn: log, error: log, debug: log };

	let solution: unknown;
	try {
		// The worker has no DOM and no access to the page; `console` is captured.
		solution = new Function('console', `"use strict";\n${code}\n;return typeof ${fn} === "function" ? ${fn} : undefined;`)(sandboxConsole);
	} catch (error) {
		post({ type: 'failed', id, error: String(error), stdout: lines.join('\n') });
		return;
	}
	if (typeof solution !== 'function') {
		post({ type: 'failed', id, error: `Could not find a function named ${fn}.`, stdout: lines.join('\n') });
		return;
	}

	const cases: CaseOutcome[] = args.map((input) => {
		const start = performance.now();
		try {
			const value = (solution as (...a: unknown[]) => unknown)(...structuredClone(input));
			return { ok: true, value: value === undefined ? null : JSON.parse(JSON.stringify(value) ?? 'null'), ms: performance.now() - start };
		} catch (error) {
			return { ok: false, error: error instanceof Error ? `${error.name}: ${error.message}` : String(error), ms: performance.now() - start };
		}
	});
	post({ type: 'done', id, cases, stdout: lines.join('\n') });
};

post({ type: 'ready' });
