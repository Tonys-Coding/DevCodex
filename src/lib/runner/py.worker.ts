/// <reference lib="webworker" />
import type { RunRequest, WorkerMessage } from './protocol';

/** Pinned Pyodide release, loaded from jsDelivr the first time Python runs. */
export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';

const post = (message: WorkerMessage) => postMessage(message);

type Pyodide = {
	runPython: (code: string) => unknown;
	globals: { set: (name: string, value: unknown) => void };
	setStdout: (options: { batched: (text: string) => void }) => void;
	setStderr: (options: { batched: (text: string) => void }) => void;
};

const HARNESS = `
import json, time, traceback

def __devcodex_run(code, fn_name, args_json):
    namespace = {"__name__": "__main__"}
    exec(compile(code, "solution.py", "exec"), namespace)
    fn = namespace.get(fn_name)
    if not callable(fn):
        raise NameError(f"Could not find a function named {fn_name}.")
    out = []
    for args in json.loads(args_json):
        start = time.perf_counter()
        try:
            value = fn(*args)
            out.append({"ok": True, "value": json.loads(json.dumps(value)), "ms": (time.perf_counter() - start) * 1000})
        except Exception as error:
            frames = [f for f in traceback.extract_tb(error.__traceback__) if f.filename == "solution.py"]
            where = f" (line {frames[-1].lineno})" if frames else ""
            out.append({"ok": False, "error": f"{type(error).__name__}: {error}{where}", "ms": (time.perf_counter() - start) * 1000})
    return json.dumps(out)
`;

let stdout: string[] = [];
const ready = (async () => {
	post({ type: 'status', text: 'Downloading Python (first run only)…' });
	const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
	const py: Pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
	py.setStdout({ batched: (text) => stdout.push(text) });
	py.setStderr({ batched: (text) => stdout.push(text) });
	py.runPython(HARNESS);
	post({ type: 'ready' });
	return py;
})();

ready.catch((error) => post({ type: 'status', text: `Python could not load: ${error}` }));

onmessage = async (event: MessageEvent<RunRequest>) => {
	const { id, code, fn, args } = event.data;
	stdout = [];
	try {
		const py = await ready;
		py.globals.set('__code', code);
		py.globals.set('__fn', fn);
		py.globals.set('__args', JSON.stringify(args));
		const result = py.runPython('__devcodex_run(__code, __fn, __args)') as string;
		post({ type: 'done', id, cases: JSON.parse(result), stdout: stdout.join('\n') });
	} catch (error) {
		// Keep only the useful last line(s) of a Python traceback.
		const text = String(error).trim();
		const last = text.split('\n').at(-1) ?? text;
		const line = [...text.matchAll(/File "solution\.py", line (\d+)/g)].at(-1)?.[1];
		post({ type: 'failed', id, error: line ? `${last} (line ${line})` : last, stdout: stdout.join('\n') });
	}
};
