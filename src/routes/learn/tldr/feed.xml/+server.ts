import { briefs, briefKind } from '#lib/content/briefs.js';
import type { RequestHandler } from './$types';

// Built once at build time, like every page, and served as a static file.
export const prerender = true;

/** Where the built site lives. Feed readers need absolute links. */
const SITE = 'https://tonys-coding.github.io';

const xml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A published date (YYYY-MM-DD) as an RFC 822 date at noon UTC, so it never slips a day. */
const rfc822 = (day: string) => new Date(`${day}T12:00:00Z`).toUTCString();

export const GET: RequestHandler = ({ url }) => {
	// The request path already carries the site's base (/DevCodex in production), unlike
	// resolve(), which gives relative paths while prerendering.
	const home = SITE + url.pathname.replace(/\/feed\.xml$/, '');
	const items = briefs
		.map((b) => {
			const link = `${home}/${b.id}`;
			const summary = `<p>${xml(b.hook)}</p><ul>${b.tldr.map((line) => `<li>${xml(line)}</li>`).join('')}</ul>`;
			return `
		<item>
			<title>${xml(b.title)}</title>
			<link>${link}</link>
			<guid isPermaLink="true">${link}</guid>
			<pubDate>${rfc822(b.published)}</pubDate>
			<category>${xml(briefKind(b.kind).label)}</category>
			<description>${xml(summary)}</description>
		</item>`;
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>DevCodex TL;DR</title>
		<link>${home}</link>
		<atom:link href="${home}/feed.xml" rel="self" type="application/rss+xml" />
		<description>Five-minute reads on new tech, small concepts, real incidents and how things work.</description>
		<language>en</language>
		<lastBuildDate>${rfc822(briefs[0].published)}</lastBuildDate>${items}
	</channel>
</rss>
`;
	return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
};
