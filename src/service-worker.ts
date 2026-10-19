/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { immutable, assets, prerendered } from '$app/manifest';
import { version, dev } from '$app/env';
import { self as sw } from '$app/service-worker';

/** Manifest paths are relative to the base path; turn them into absolute URLs under this worker's scope. */
const url = (path: string) => new URL(path.replace(/^\//, ''), sw.registration.scope).href;

const APP_CACHE = `devcodex-app-${version}`;
/** Pyodide is large and pinned to one version, so it gets its own long-lived cache. */
const PYODIDE_CACHE = 'devcodex-pyodide-v314.0.7';

// Every built file and every prerendered page, so the whole app works offline.
const PRECACHE = [
	...new Set(
		[...immutable, ...assets, ...prerendered]
			.map((entry) => entry.path)
			// Dotfiles such as .nojekyll are hosting hints, not app files.
			.filter((path) => !path.split('/').some((part) => part.startsWith('.')))
			.map(url)
			.concat(url('404.html'))
	)
];

sw.addEventListener('install', (event) => {
	// The dev server serves source modules that change on every edit and differ only by query string
	// (Foo.svelte vs Foo.svelte?svelte&type=style&lang.css), so caching them breaks the page.
	if (dev) {
		event.waitUntil(sw.skipWaiting());
		return;
	}
	event.waitUntil(
		caches
			.open(APP_CACHE)
			// One missing file must not stop the app from installing, so cache each separately.
			.then((cache) => Promise.allSettled(PRECACHE.map((file) => cache.add(file))))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => dev || (k !== APP_CACHE && k !== PYODIDE_CACHE)).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	if (dev) return;
	const { request } = event;
	if (request.method !== 'GET') return;
	const target = new URL(request.url);

	// Python runtime from the CDN: cache first, so practice works offline after one run.
	if (target.hostname === 'cdn.jsdelivr.net' && target.pathname.startsWith('/pyodide/')) {
		event.respondWith(
			caches.open(PYODIDE_CACHE).then(async (cache) => {
				const hit = await cache.match(request);
				if (hit) return hit;
				const response = await fetch(request);
				if (response.ok) cache.put(request, response.clone());
				return response;
			})
		);
		return;
	}

	if (target.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(APP_CACHE);
			// Hashed build files and static files never change for a given version.
			const cached = await cache.match(request, { ignoreSearch: true });
			if (cached && !request.headers.get('accept')?.includes('text/html')) return cached;

			try {
				const response = await fetch(request);
				if (response.ok && response.type === 'basic') cache.put(request, response.clone());
				return response;
			} catch {
				// Offline: the cached page, or the app shell for any other route.
				return cached ?? (await cache.match(url('404.html'))) ?? Response.error();
			}
		})()
	);
});
