<script lang="ts">
	import { highlight } from './highlight';

	/**
	 * A pretend reading-list API at example.test, run entirely in the page. It answers
	 * with the status codes the lesson teaches, following RFC 9110: 405 lists what the
	 * resource allows, HEAD gets GET's headers without the body, and 204 has no content.
	 * Where HTTP leaves the server a choice (406, 415, PUT creating), this service picks
	 * the strict answer and the message says so.
	 */
	type Book = { id: number; title: string };
	type Reply = { status: number; headers: [string, string][]; body?: string; note: string };

	const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'] as const;
	const accepts = ['application/json', '*/*', 'text/html'] as const;
	const types = ['application/json', 'text/plain', 'none'] as const;
	const paths = ['/books', '/books/1', '/missing'];
	const reasons: Record<number, string> = {
		200: 'OK',
		201: 'Created',
		204: 'No Content',
		400: 'Bad Request',
		404: 'Not Found',
		405: 'Method Not Allowed',
		406: 'Not Acceptable',
		415: 'Unsupported Media Type'
	};
	const start = (): Book[] => [
		{ id: 1, title: 'Dune' },
		{ id: 2, title: 'Frankenstein' }
	];

	let books = $state(start());
	let nextId = $state(3);
	let method = $state<(typeof methods)[number]>('GET');
	let path = $state('/books');
	let accept = $state<(typeof accepts)[number]>('application/json');
	let type = $state<(typeof types)[number]>('application/json');
	let body = $state('{"title":"The Hobbit"}');
	let reply = $state<Reply | null>(null);
	let sent = $state('');

	const hasBody = $derived(method === 'POST' || method === 'PUT');
	const bytes = (s: string) => new TextEncoder().encode(s).length;
	const target = $derived('/' + path.trim().replace(/^\/+/, '').replace(/[?#].*$/, ''));

	const request = $derived(
		[
			`${method} ${target} HTTP/1.1`,
			'Host: example.test',
			`Accept: ${accept}`,
			...(hasBody ? [...(type === 'none' ? [] : [`Content-Type: ${type}`]), `Content-Length: ${bytes(body)}`] : [])
		].join('\n') + (hasBody ? `\n\n${body}` : '')
	);

	const call = $derived.by(() => {
		const headers = [`Accept: '${accept}'`, hasBody && type !== 'none' && `'Content-Type': '${type}'`].filter(Boolean);
		const opts = [method !== 'GET' && `method: '${method}'`, `headers: { ${headers.join(', ')} }`, hasBody && `body: ${JSON.stringify(body)}`].filter(Boolean);
		return `fetch('https://example.test${target}', {\n  ${opts.join(',\n  ')}\n})`;
	});

	/** A JSON response with its length, as a real server would send it. */
	function json(status: number, value: unknown, note: string, extra: [string, string][] = []): Reply {
		const text = JSON.stringify(value);
		return {
			status,
			headers: [...extra, ['Content-Type', 'application/json'], ['Content-Length', String(bytes(text))]],
			body: text,
			note
		};
	}

	/** Reads `{"title": "…"}` from the body, or explains why it can't. */
	function readTitle(): { title: string } | { error: string; note: string } {
		if (type !== 'application/json') return { error: 'unsupported', note: '' };
		let value: unknown;
		try {
			value = JSON.parse(body);
		} catch {
			return {
				error: 'Body is not valid JSON',
				note: 'The body is not valid JSON, so the server can’t read it. Check the quotes: JSON needs double quotes round every key and string.'
			};
		}
		const title = (value as { title?: unknown } | null)?.title;
		if (typeof title !== 'string' || !title.trim())
			return { error: 'A book needs a "title" string', note: 'The JSON is valid, but this service needs a non-empty "title" text value, like {"title":"The Hobbit"}.' };
		return { title: title.trim() };
	}

	function respond(): Reply {
		const isList = target === '/books';
		const one = target.match(/^\/books\/(\d+)$/);
		if (!isList && !one)
			return json(404, { error: 'Not found' }, `Nothing lives at ${target} on this server. A 404 is still an ordinary response from a working server: the request arrived, the address didn’t match.`);

		const allow = isList ? ['GET', 'HEAD', 'POST'] : ['GET', 'HEAD', 'PUT', 'DELETE'];
		if (!allow.includes(method))
			return json(
				405,
				{ error: `${method} is not allowed here` },
				`The server knows ${method}, but ${target} doesn’t support it. The method states your intent; the route decides what’s allowed. A 405 must list the allowed methods in Allow.`,
				[['Allow', allow.join(', ')]]
			);

		const book = one ? books.find((b) => b.id === Number(one[1])) : undefined;
		if (one && !book)
			return json(404, { error: 'Not found' }, `There is no book ${one[1]} right now. If you deleted it, that’s why: the URL is fine, the resource is gone.`);

		if (hasBody && type !== 'application/json')
			return json(
				415,
				{ error: 'Send JSON with Content-Type: application/json' },
				type === 'none'
					? 'The body has no Content-Type, so the server can’t tell what format it is. This service refuses with 415 rather than guess.'
					: 'Content-Type says the body is plain text, and this service only reads JSON, so it refuses with 415. The header has to describe the body.'
			);

		let title = '';
		if (hasBody) {
			const read = readTitle();
			if ('error' in read) return json(400, { error: read.error }, read.note);
			title = read.title;
		}

		if (accept === 'text/html' && method !== 'DELETE')
			return json(
				406,
				{ error: 'Only application/json is available' },
				'You asked for HTML only, and this service has only JSON. This simulator answers 406 and changes nothing; many real servers ignore Accept and send JSON anyway.'
			);

		if (method === 'GET' || method === 'HEAD') {
			return json(
				200,
				book ?? books,
				method === 'HEAD'
					? 'Same status and headers as GET, including Content-Length, but no body: HEAD asks only about the response.'
					: book
						? `The server found book ${book.id} and sent it as JSON.`
						: `The server sent the whole list as JSON: ${books.length} ${books.length === 1 ? 'book' : 'books'}.`
			);
		}
		if (method === 'POST') {
			const created = { id: nextId, title };
			books.push(created);
			nextId += 1;
			return json(
				201,
				created,
				`Created book ${created.id}. Location gives its new URL. Send the same POST again and you get another copy: POST is not idempotent.`,
				[['Location', `/books/${created.id}`]]
			);
		}
		if (method === 'PUT') {
			const same = book!.title === title;
			book!.title = title;
			return json(
				200,
				book,
				same
					? 'Nothing changed: the book already had this title. Repeating a PUT leaves the same result, which is what idempotent means.'
					: `Replaced book ${book!.id}’s title. Send it again and nothing more changes: PUT is idempotent.`
			);
		}
		books = books.filter((b) => b !== book);
		return {
			status: 204,
			headers: [],
			note: `Deleted book ${book!.id}. 204 means success with no content to send back. Delete it again and you get 404, yet the server ends up the same: the book is gone. Idempotency is about the effect, not the status code.`
		};
	}

	function send(event: SubmitEvent) {
		event.preventDefault();
		sent = request;
		const r = respond();
		// A response to HEAD never has content, whatever its status.
		reply = method === 'HEAD' ? { ...r, body: undefined } : r;
	}

	function reset() {
		books = start();
		nextId = 3;
		method = 'GET';
		path = '/books';
		accept = 'application/json';
		type = 'application/json';
		body = '{"title":"The Hobbit"}';
		reply = null;
		sent = '';
	}

	const response = $derived(
		reply
			? [`HTTP/1.1 ${reply.status} ${reasons[reply.status]}`, ...reply.headers.map(([k, v]) => `${k}: ${v}`)].join('\n') +
					(reply.body !== undefined ? `\n\n${reply.body}` : '')
			: ''
	);
</script>

<section class="lab" aria-label="HTTP request lab">
	<h3>Send a request</h3>
	<p class="lede">A pretend reading-list service at <code>example.test</code>. It runs in this page: nothing leaves your device.</p>

	<form onsubmit={send}>
		<div class="controls">
			<fieldset>
				<legend>Method</legend>
				<div class="opts">
					{#each methods as m (m)}
						<label class="chip" class:on={method === m}><input type="radio" bind:group={method} value={m} />{m}</label>
					{/each}
				</div>
			</fieldset>

			<div class="field">
				<label class="name" for="http-lab-path">Path</label>
				<input id="http-lab-path" class="text" bind:value={path} autocomplete="off" autocapitalize="off" spellcheck="false" />
				<div class="opts picks">
					{#each paths as p (p)}
						<button type="button" class="pick" class:on={target === p} onclick={() => (path = p)}>{p}</button>
					{/each}
				</div>
			</div>

			<fieldset>
				<legend>Accept</legend>
				<div class="opts">
					{#each accepts as a (a)}
						<label class="chip" class:on={accept === a}><input type="radio" bind:group={accept} value={a} />{a}</label>
					{/each}
				</div>
			</fieldset>

			<fieldset disabled={!hasBody}>
				<legend>Content-Type</legend>
				<div class="opts">
					{#each types as t (t)}
						<label class="chip" class:on={hasBody && type === t}><input type="radio" bind:group={type} value={t} />{t}</label>
					{/each}
				</div>
			</fieldset>
		</div>

		<div class="field body">
			<label class="name" for="http-lab-body">Body</label>
			<textarea id="http-lab-body" bind:value={body} disabled={!hasBody} rows="2" autocapitalize="off" spellcheck="false"></textarea>
			{#if !hasBody}<p class="hint">GET, HEAD and DELETE send no body here; <code>fetch()</code> refuses a body on GET and HEAD.</p>{/if}
		</div>

		<pre class="call"><code>{@html highlight(call, 'js')}</code></pre>

		<div class="actions">
			<button type="submit" class="go">Send</button>
			<button type="button" class="ghost" onclick={reset}>Reset</button>
		</div>
	</form>

	<div class="out" aria-live="polite">
		{#if reply}
			<p class="verdict" class:fail={reply.status >= 400}>
				<span class="code">{reply.status}</span>
				<span>{reasons[reply.status]}</span>
			</p>
			<p class="note">{reply.note}</p>
			<div class="wires">
				<figure>
					<figcaption>Request</figcaption>
					<pre><code>{@html highlight(sent, 'http')}</code></pre>
				</figure>
				<figure>
					<figcaption>Response</figcaption>
					<pre><code>{@html highlight(response, 'http')}</code></pre>
				</figure>
			</div>
		{:else}
			<p class="note">Pick a method and path, then press Send.</p>
		{/if}
	</div>

	<p class="state">
		<span class="name">On the server now</span>
		{#if books.length}
			{#each books as b (b.id)}<span class="book"><b>{b.id}</b> {b.title}</span>{/each}
		{:else}
			<span class="empty">No books</span>
		{/if}
	</p>
</section>

<style>
	.lab {
		margin: 2rem 0;
		padding: 1.1rem;
		border-radius: 24px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	h3 {
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.lede {
		margin-top: 0.4rem;
		color: var(--ink-2);
	}

	.controls {
		display: grid;
		gap: 0.8rem;
		margin-top: 1rem;
	}

	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}

	fieldset:disabled {
		opacity: 0.45;
	}

	legend,
	.name {
		display: block;
		font-family: var(--display);
		font-weight: 800;
		font-size: 0.95rem;
		margin-bottom: 0.4rem;
	}

	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip,
	.pick {
		display: inline-flex;
		align-items: center;
		min-height: 2.6rem;
		padding: 0 0.85rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		overflow-wrap: anywhere;
	}

	fieldset:disabled .chip {
		cursor: not-allowed;
	}

	.chip.on,
	.pick.on {
		background: var(--t);
		border-color: var(--t);
		color: var(--t-ink);
	}

	.chip:has(:focus-visible),
	.pick:focus-visible,
	.go:focus-visible,
	.ghost:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}

	.chip input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	.picks {
		margin-top: 0.45rem;
	}

	.text,
	textarea {
		width: 100%;
		border: 2px solid var(--rule);
		background: var(--ground);
		color: var(--ink);
		font-family: var(--mono);
		font-size: 0.9rem;
		caret-color: var(--gold);
	}

	.text {
		min-height: 2.8rem;
		padding: 0 1rem;
		border-radius: 999px;
	}

	textarea {
		display: block;
		padding: 0.7rem 0.9rem;
		border-radius: 14px;
		resize: vertical;
		line-height: 1.5;
	}

	textarea:disabled {
		opacity: 0.45;
	}

	.text:focus-visible,
	textarea:focus-visible {
		border-color: var(--t);
		outline: none;
	}

	.body {
		margin-top: 0.8rem;
	}

	.hint {
		margin-top: 0.35rem;
		font-size: 0.86rem;
		color: var(--ink-3);
	}

	pre {
		margin: 0;
		padding: 0.75rem 0.9rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.65;
		overflow-x: auto;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.call {
		margin-top: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.9rem;
	}

	.go,
	.ghost {
		min-height: 3rem;
		padding: 0 1.3rem;
		border-radius: 999px;
		font-family: var(--display);
		font-weight: 800;
		cursor: pointer;
	}

	.go {
		border: 0;
		background: var(--t);
		color: var(--t-ink);
	}

	.ghost {
		border: 2px solid var(--rule);
		background: none;
		color: var(--ink);
	}

	.out {
		margin-top: 1rem;
		display: grid;
		gap: 0.6rem;
	}

	.verdict {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.12rem;
	}

	.code {
		padding: 0.1rem 0.6rem;
		border-radius: 999px;
		background: var(--t);
		color: var(--t-ink);
		font-family: var(--mono);
	}

	.verdict.fail .code {
		background: var(--gold);
		color: #1d1400;
	}

	.note {
		color: var(--ink-2);
		line-height: 1.55;
	}

	.wires {
		display: grid;
		gap: 0.8rem;
	}

	figure {
		margin: 0;
		min-width: 0;
	}

	figcaption {
		font-weight: 700;
		font-size: 0.86rem;
		color: var(--ink-3);
		margin-bottom: 0.35rem;
	}

	.state {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin-top: 1rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--rule);
	}

	.state .name {
		margin: 0 0.3rem 0 0;
	}

	.book {
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		background: var(--ground);
		font-size: 0.86rem;
	}

	.book b {
		font-family: var(--mono);
		color: var(--ink-3);
	}

	.empty {
		color: var(--ink-3);
	}

	@media (min-width: 720px) {
		.lab {
			padding: 1.5rem;
		}

		.controls,
		.wires {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
