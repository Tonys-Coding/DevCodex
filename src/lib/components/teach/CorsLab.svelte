<script lang="ts">
	import { highlight } from './highlight';

	/**
	 * Builds the exact CORS exchange for a fetch() from https://app.example to
	 * https://api.example, following the Fetch Standard's rules for safelisted
	 * methods and request headers (value-length limits are left out).
	 */
	const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
	const types = ['none', 'text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data', 'application/json'] as const;
	const creds = ['same-origin', 'include'] as const;

	let method = $state<(typeof methods)[number]>('GET');
	let type = $state<(typeof types)[number]>('none');
	let auth = $state(false);
	let custom = $state(false);
	let cred = $state<(typeof creds)[number]>('same-origin');

	const ORIGIN = 'https://app.example';
	const safeMethod = $derived(method === 'GET' || method === 'POST');
	const safeType = $derived(type === 'none' || type === 'text/plain' || type === 'application/x-www-form-urlencoded' || type === 'multipart/form-data');
	const unsafeHeaders = $derived(
		[auth && 'authorization', !safeType && 'content-type', custom && 'x-request-id'].filter(Boolean).sort() as string[]
	);
	const preflight = $derived(!safeMethod || unsafeHeaders.length > 0);
	const withCreds = $derived(cred === 'include');

	const reasons = $derived(
		[
			!safeMethod && `${method} is not a safelisted method (only GET, HEAD and POST are)`,
			!safeType && `Content-Type ${type} is not one of the three safelisted types`,
			auth && 'Authorization is never a safelisted header',
			custom && 'X-Request-Id is a custom header'
		].filter(Boolean) as string[]
	);

	const allowOrigin = $derived(withCreds ? ORIGIN : '*');
	const credLine = $derived(withCreds ? '\naccess-control-allow-credentials: true' : '');
	const sentHeaders = $derived(
		[type !== 'none' && `content-type: ${type}`, auth && 'authorization: Bearer eyJhbGciOi…', custom && 'x-request-id: 7f3a'].filter(Boolean).join('\n')
	);

	const preflightWire = $derived(
		`OPTIONS /v1/items HTTP/2
host: api.example
origin: ${ORIGIN}
access-control-request-method: ${method}${unsafeHeaders.length ? `\naccess-control-request-headers: ${unsafeHeaders.join(',')}` : ''}

HTTP/2 204
access-control-allow-origin: ${allowOrigin}${credLine}${safeMethod ? '' : `\naccess-control-allow-methods: ${method}`}${
			unsafeHeaders.length ? `\naccess-control-allow-headers: ${withCreds || auth ? unsafeHeaders.join(', ') : '*'}` : ''
		}
access-control-max-age: 7200${withCreds ? '\nvary: Origin' : ''}`
	);

	const actualWire = $derived(
		`${method} /v1/items HTTP/2
host: api.example
origin: ${ORIGIN}${sentHeaders ? '\n' + sentHeaders : ''}${withCreds ? '\ncookie: sid=…' : ''}

HTTP/2 200
access-control-allow-origin: ${allowOrigin}${credLine}${withCreds ? '\nvary: Origin' : ''}
content-type: application/json`
	);

	const call = $derived.by(() => {
		const opts = [
			method !== 'GET' && `method: '${method}'`,
			(type !== 'none' || auth || custom) &&
				`headers: { ${[type !== 'none' && `'Content-Type': '${type}'`, auth && `Authorization: token`, custom && `'X-Request-Id': id`].filter(Boolean).join(', ')} }`,
			withCreds && `credentials: 'include'`
		].filter(Boolean);
		return `fetch('https://api.example/v1/items'${opts.length ? `, {\n  ${opts.join(',\n  ')}\n}` : ''})`;
	});
</script>

<section class="lab" aria-label="Preflight or not">
	<h3>Preflight or not?</h3>
	<p class="lede">A page on <code>https://app.example</code> calls an API on <code>https://api.example</code>. Change the request and read the exchange the browser will have.</p>

	<div class="controls">
		<fieldset>
			<legend>Method</legend>
			<div class="opts">
				{#each methods as m (m)}
					<label class:on={method === m}><input type="radio" bind:group={method} value={m} />{m}</label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Content-Type</legend>
			<div class="opts">
				{#each types as t (t)}
					<label class:on={type === t}><input type="radio" bind:group={type} value={t} />{t}</label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Extra headers</legend>
			<div class="opts">
				<label class:on={auth}><input type="checkbox" bind:checked={auth} />Authorization</label>
				<label class:on={custom}><input type="checkbox" bind:checked={custom} />X-Request-Id</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>credentials</legend>
			<div class="opts">
				{#each creds as c (c)}
					<label class:on={cred === c}><input type="radio" bind:group={cred} value={c} />'{c}'</label>
				{/each}
			</div>
		</fieldset>
	</div>

	<pre class="call"><code>{@html highlight(call, 'js')}</code></pre>

	<div class="verdict" class:pf={preflight} aria-live="polite">
		{#if preflight}
			<p class="big">Preflight: two round trips</p>
			<ul>
				{#each reasons as r (r)}<li>{r}</li>{/each}
			</ul>
		{:else}
			<p class="big">No preflight: sent directly</p>
			<p>Safelisted method and headers. The server receives and runs this request whatever its CORS policy; CORS only decides whether the page may read the response.</p>
		{/if}
		{#if withCreds}<p>With credentials, <code>*</code> is not allowed in any CORS response header, and both responses need <code>allow-credentials: true</code>.</p>{/if}
	</div>

	<div class="wires">
		{#if preflight}
			<figure>
				<figcaption>1. Preflight (never carries cookies)</figcaption>
				<pre><code>{@html highlight(preflightWire, 'http')}</code></pre>
			</figure>
		{/if}
		<figure>
			<figcaption>{preflight ? '2. ' : ''}The actual request</figcaption>
			<pre><code>{@html highlight(actualWire, 'http')}</code></pre>
		</figure>
	</div>
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

	legend {
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

	label {
		display: inline-flex;
		align-items: center;
		min-height: 2.6rem;
		padding: 0 0.85rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		font-family: var(--mono);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		overflow-wrap: anywhere;
	}

	label.on {
		background: var(--t);
		border-color: var(--t);
		color: var(--t-ink);
	}

	label:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}

	input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	pre {
		margin: 0;
		padding: 0.75rem 0.9rem;
		border-radius: 14px;
		background: var(--ground);
		font-size: 0.86rem;
		line-height: 1.65;
		overflow-x: auto;
	}

	.call {
		margin-top: 1rem;
	}

	.verdict {
		margin-top: 0.9rem;
		padding: 0.85rem 1rem;
		border-radius: 16px;
		border: 2px solid var(--t);
		display: grid;
		gap: 0.4rem;
	}

	.verdict.pf {
		border-color: var(--gold);
	}

	.big {
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.12rem;
	}

	.verdict ul {
		padding-left: 1.2rem;
		list-style: disc;
	}

	.wires {
		display: grid;
		gap: 0.8rem;
		margin-top: 0.9rem;
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

	@media (min-width: 720px) {
		.lab {
			padding: 1.5rem;
		}

		.controls {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
