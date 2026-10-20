<script lang="ts">
	import StepFlow, { glyphs, type FlowStep, type FlowTile } from '../../components/teach/StepFlow.svelte';
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Diagram from '../../components/teach/Diagram.svelte';

	const tiles: FlowTile[] = [
		{ id: 'browser', label: 'Browser', x: 4, y: 12, icon: glyphs.browser },
		{ id: 'cache', label: 'Its cache', x: 236, y: 12, icon: glyphs.cache },
		{ id: 'cdn', label: 'CDN edge', x: 236, y: 182, icon: glyphs.globe },
		{ id: 'origin', label: 'Origin', x: 4, y: 182, icon: glyphs.server }
	];

	const steps: FlowStep[] = [
		{
			label: 'Ask',
			title: 'First visit: nothing stored yet',
			body: 'The browser has no copy of app.css, so it requests it. DNS for the site points at a CDN, so the request lands on the nearest edge server rather than the origin.',
			active: ['browser', 'cdn'],
			hop: { from: 'browser', to: 'cdn', message: 'GET /app.css' }
		},
		{
			label: 'Miss',
			title: 'Cache miss at the edge',
			body: 'This edge has no stored response for the URL, so it forwards the request to the origin, possibly on another continent. Every visitor near this edge pays the round trip once.',
			active: ['cdn', 'origin'],
			hop: { from: 'cdn', to: 'origin', message: 'GET /app.css' }
		},
		{
			label: 'Rules',
			title: 'The origin attaches caching rules',
			body: 'The response carries Cache-Control, which sets the freshness lifetime and who may store it, and an ETag, an opaque validator identifying this exact version of the body.',
			active: ['origin', 'cdn'],
			hop: { from: 'origin', to: 'cdn', message: '200 + max-age' },
			wire: 'HTTP/2 200\ncache-control: public, max-age=3600\netag: "v7-3f9a"'
		},
		{
			label: 'Store',
			title: 'Shared and private caches both store it',
			body: 'The edge (a shared cache) keeps it for everyone nearby and adds an Age header on later hits. The browser (a private cache) keeps its own copy, fresh for 3,600 seconds minus any age it arrived with.',
			active: ['browser', 'cache'],
			hop: { from: 'browser', to: 'cache', message: 'store 1 h' }
		},
		{
			label: 'Reuse',
			title: 'While fresh: zero network',
			body: 'Another page needs app.css. The stored response is still fresh, so the browser serves it from disk or memory without contacting anyone. In DevTools the Size column says “(disk cache)” or “(memory cache)”.',
			active: ['cache', 'browser'],
			hop: { from: 'cache', to: 'browser', message: 'fresh hit' }
		},
		{
			label: 'Revalidate',
			title: 'Once stale: a conditional request',
			body: 'Stale does not mean wrong. The browser sends a conditional GET carrying the validator it has. If the server’s current ETag matches, there is nothing to download.',
			active: ['browser', 'cdn'],
			hop: { from: 'browser', to: 'cdn', message: 'If-None-Match' },
			wire: 'GET /app.css\nif-none-match: "v7-3f9a"'
		},
		{
			label: '304',
			title: '304 Not Modified: headers, no body',
			body: 'The server answers 304 with fresh caching headers and no body. The browser updates the stored headers and reuses its copy for another hour. A few hundred bytes replaced a full download.',
			active: ['cdn', 'browser'],
			hop: { from: 'cdn', to: 'browser', message: '304' },
			wire: 'HTTP/2 304\ncache-control: public, max-age=3600\netag: "v7-3f9a"'
		}
	];
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	The second time you open a website, it usually loads faster. That’s because your browser kept copies of the files it downloaded the first
	time: the styles, the scripts, the pictures. Keeping copies to reuse later is called <strong>caching</strong>. The interesting part is how the
	browser knows a copy is still good, and who decides how long it can keep it.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>where copies of a file are kept on their way to you,</li>
	<li>what “fresh” and “stale” mean, and how a stale copy is checked cheaply,</li>
	<li>the four caching instructions you will see most, and</li>
	<li>how websites ship updates when browsers hold on to old copies.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Cache</dt>
		<dd>A store of copies kept so they can be reused instead of downloaded again.</dd>
	</div>
	<div>
		<dt>Header</dt>
		<dd>A short note sent with a response, in the form <code>name: value</code>. Caching instructions travel as headers.</dd>
	</div>
	<div>
		<dt>Fresh and stale</dt>
		<dd>A <strong>fresh</strong> copy can be reused without asking anyone. A <strong>stale</strong> copy has passed its time limit and should be checked first.</dd>
	</div>
	<div>
		<dt>CDN</dt>
		<dd>A content delivery network: servers in many cities that keep copies of a site’s files close to its visitors.</dd>
	</div>
	<div>
		<dt>Origin</dt>
		<dd>The website’s own server, where the original files live.</dd>
	</div>
</dl>

<h2>Follow one file</h2>
<p>
	A copy can be kept in two places on its way to you: in your browser, and at a CDN server near you. Step through one stylesheet’s first visit,
	its reuse, and the check that happens once its time is up.
</p>

<StepFlow title="One file, two caches, one origin" {tiles} {steps} />

<h2>Fresh, then stale, then checked</h2>
<p>Every copy comes with a time limit set by the website. The browser then follows three simple rules:</p>
<ol>
	<li><strong>Still fresh?</strong> Use the copy straight away. Nothing is sent over the network.</li>
	<li><strong>Stale?</strong> Ask the server a tiny question: “I have version v7. Has it changed?”</li>
	<li><strong>Not changed?</strong> The server answers <code>304 Not Modified</code> with no file attached, and the copy gets a new time limit. If it did change, the server sends the new version.</li>
</ol>
<p>
	That check is the clever part. A 304 answer is a few hundred bytes instead of the whole file, so even a stale copy saves most of the download.
	The version label the browser sends is called an <strong>ETag</strong>.
</p>

<h2>The four instructions you will see most</h2>
<p>
	The website sets these rules with one header, <code>Cache-Control</code>. Four values cover most of what you will meet. The number after
	<code>max-age</code> is in seconds.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Instruction</th><th scope="col">In plain words</th><th scope="col">Good for</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>max-age=3600</code></th><td>Reuse it for an hour without asking</td><td>Files that change rarely</td></tr>
			<tr><th scope="row"><code>no-cache</code></th><td>Keep it, but check with the server every time before using it</td><td>Web pages that must show updates at once</td></tr>
			<tr><th scope="row"><code>no-store</code></th><td>Don’t keep a copy at all</td><td>Bank balances and other private data</td></tr>
			<tr><th scope="row"><code>private</code></th><td>Only this person’s browser may keep it, not a shared CDN</td><td>Pages about one signed-in user</td></tr>
		</tbody>
	</table>
</div>

<Note title="The most misread word in caching" tone="warn">
	<code>no-cache</code> does <em>not</em> mean “don’t cache”. It means “check before reusing”. The instruction that really means “don’t keep it” is
	<code>no-store</code>.
</Note>

<h2>Shipping an update</h2>
<p>
	If a browser may keep a file for a year, how does anyone get a fix? Websites change the file’s <strong>name</strong>. Build tools add a short
	fingerprint of the contents to each name, so <code>app.3f9a1c.js</code> becomes <code>app.b72e04.js</code> when anything inside changes. The page
	itself is checked every time, so it can point to the new name, and no browser has an old copy of a name it has never seen. This is called
	<strong>cache busting</strong>.
</p>

<h2>See it yourself</h2>
<p>
	Open your browser’s developer tools, choose the <strong>Network</strong> tab and reload a site you have visited before. Look at two columns:
</p>
<ul>
	<li><strong>Status</strong> shows <code>200</code> for a full download and <code>304</code> for “not changed, keep yours”.</li>
	<li><strong>Size</strong> shows “(disk cache)” or “(memory cache)” for files that never left your computer.</li>
</ul>

<h2>Recap</h2>
<ol>
	<li>Browsers and CDNs keep copies of files so they don’t have to download them again.</li>
	<li>A <strong>fresh</strong> copy is reused without asking. A <strong>stale</strong> one is checked, and a <code>304</code> answer means “keep yours”.</li>
	<li><code>Cache-Control</code> sets the rules: <code>max-age</code>, <code>no-cache</code>, <code>no-store</code> and <code>private</code> cover most cases.</li>
	<li>Sites ship updates by giving changed files new names.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'A file came with max-age=600 (ten minutes). You reload after five minutes. What happens?',
			options: ['It is downloaded again', 'The browser uses its copy without asking', 'The browser checks with the server first'],
			answer: 1,
			explain: 'Five minutes is inside the ten-minute limit, so the copy is still fresh and nothing is sent.'
		},
		{
			prompt: 'The server answers 304 Not Modified. What does that mean?',
			options: ['The file is missing', 'Your copy is still correct, keep using it', 'The file changed and is attached'],
			answer: 1,
			explain: '304 means nothing changed. No file is sent, and your copy gets a new time limit.'
		},
		{
			prompt: 'Which instruction really means “don’t keep a copy”?',
			options: ['no-cache', 'no-store', 'max-age=0'],
			answer: 1,
			explain: 'no-store forbids keeping it. no-cache keeps it but checks before every use.'
		},
		{
			prompt: 'A page shows one user’s account details. Which instruction stops a shared CDN from keeping it?',
			options: ['private', 'max-age=60', 'no-cache'],
			answer: 0,
			explain: 'private means only that person’s browser may keep a copy, never a shared cache.'
		},
		{
			prompt: 'app.js is cached for a year and you fix a bug in it. What gets the fix to everyone?',
			options: ['Ask users to clear their cache', 'Publish it under a new name, like app.b72e04.js', 'Nothing; wait a year'],
			answer: 1,
			explain: 'Browsers never ask about the old name again for a year, but a new name has no old copy anywhere.'
		}
	]}
/>

<CorePack />


<Layer depth="deeper" summary="Private and shared caches, validators, every Cache-Control directive you will use, real server configuration and the mistakes that leak data.">
<p>
	A typical page pulls in dozens of subresources: scripts, stylesheets, fonts, images. Between two visits, almost none of them change. HTTP caching,
	specified in <a href="https://www.rfc-editor.org/rfc/rfc9111" rel="external">RFC 9111</a>, lets the server state up front how long each response
	may be reused and gives clients a cheap way to confirm a stored copy is still current. Getting the headers right is one of the highest-leverage
	performance fixes a web app has.
</p>

<h2>Where copies live</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Cache</th><th scope="col">Type</th><th scope="col">Who it serves</th><th scope="col">Controlled by</th></tr></thead>
		<tbody>
			<tr><th scope="row">Browser HTTP cache</th><td>Private</td><td>One user, one browser profile</td><td>Response headers</td></tr>
			<tr><th scope="row">CDN edge, reverse proxy</th><td>Shared</td><td>Every user routed to that node</td><td>Response headers plus the provider’s own rules</td></tr>
			<tr><th scope="row">Service worker Cache Storage</th><td>Private, programmable</td><td>One origin in one browser</td><td>Your JavaScript. HTTP freshness rules do not apply</td></tr>
		</tbody>
	</table>
</div>

<p>The distinction between <strong>private</strong> and <strong>shared</strong> caches matters more than anything else in this article: a response that is fine to keep in your browser can be a data leak if a CDN keeps it and serves it to someone else.</p>

<p>A request passes through those layers in order, and each one can answer it without going any further:</p>

<Diagram
	name="http-caching-topology"
	alt="On your device, the browser's fetch first reaches the service worker, then the browser's private HTTP cache. A miss or stale copy goes to the shared CDN edge, and from there to the origin. Responses flow back with Cache-Control, Age and possibly 304."
	caption="Steps 3 and 4 only happen on a miss or a stale copy. Most repeat requests are answered on the device, by the service worker or the HTTP cache."
/>


<h2>Validation: checking a stale copy cheaply</h2>
<p>
	A stale copy usually still matches what the server has. Instead of downloading it again, the cache sends a <strong>conditional request</strong>
	with a <strong>validator</strong> from the stored response. There are two kinds:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Validator (response)</th><th scope="col">Condition (request)</th><th scope="col">Notes</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>ETag: "v7-3f9a"</code></th><td><code>If-None-Match: "v7-3f9a"</code></td><td>Opaque version id. Preferred. A <code>W/</code> prefix marks a weak ETag: semantically equivalent, not necessarily byte-identical</td></tr>
			<tr><th scope="row"><code>Last-Modified: &lt;date&gt;</code></th><td><code>If-Modified-Since: &lt;date&gt;</code></td><td>One-second resolution, so edits within the same second are invisible to it</td></tr>
		</tbody>
	</table>
</div>

<p>If the condition shows the copy is current, the server answers <code>304 Not Modified</code> with headers only. Otherwise it sends a normal <code>200</code> with the new body, which replaces the stored one.</p>

<Code
	lang="http"
	title="Revalidation on the wire"
	code={`GET /app.css HTTP/2
host: example.com
if-none-match: "v7-3f9a"

HTTP/2 304
cache-control: public, max-age=3600
etag: "v7-3f9a"`}
	caption="The 304 carries refreshed caching headers, so the stored copy gets a new lifetime without a new body."
/>

<h2>The Cache-Control directives you will use</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Directive</th><th scope="col">Applies to</th><th scope="col">Meaning</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>max-age=N</code></th><td>All caches</td><td>Fresh for N seconds</td></tr>
			<tr><th scope="row"><code>s-maxage=N</code></th><td>Shared caches</td><td>Overrides <code>max-age</code> for CDNs and proxies</td></tr>
			<tr><th scope="row"><code>no-cache</code></th><td>All caches</td><td>May store, but must revalidate before every reuse</td></tr>
			<tr><th scope="row"><code>no-store</code></th><td>All caches</td><td>Must not store at all</td></tr>
			<tr><th scope="row"><code>private</code></th><td>Shared caches</td><td>Must not store. Browsers still may</td></tr>
			<tr><th scope="row"><code>public</code></th><td>Shared caches</td><td>May store even when they normally wouldn’t, such as a response to a request with an <code>Authorization</code> header</td></tr>
			<tr><th scope="row"><code>must-revalidate</code></th><td>All caches</td><td>Once stale, never serve without successful revalidation. If the origin is unreachable, return an error rather than the stale copy</td></tr>
			<tr><th scope="row"><code>immutable</code></th><td>Browsers</td><td>The body will never change at this URL, so don’t revalidate it while fresh, even on reload</td></tr>
			<tr><th scope="row"><code>stale-while-revalidate=N</code></th><td>All caches</td><td>After going stale, may serve the stale copy for up to N more seconds while revalidating in the background</td></tr>
			<tr><th scope="row"><code>stale-if-error=N</code></th><td>All caches</td><td>May serve a stale copy for up to N seconds if revalidation fails with an error</td></tr>
		</tbody>
	</table>
</div>

<Note title="no-cache does not mean “don’t cache”" tone="warn">
	The name is the single most misread thing in HTTP. <code>no-cache</code> stores the response and revalidates it every time, which with a
	matching ETag costs a small 304. The directive that actually forbids storing is <code>no-store</code>.
</Note>

<p>Support for the two <code>stale-*</code> extensions (RFC 5861) varies across browsers and CDNs, so treat them as an optimization, not a guarantee. Try the most common combinations:</p>

<Choice
	codeLabels
	title="Pick a Cache-Control header"
	options={[
		{
			label: 'max-age=31536000, immutable',
			code: 'cache-control: public, max-age=31536000, immutable',
			body: 'Keep it for a year and never revalidate. Only safe when the URL changes whenever the content does, like app.3f9a1c.js.',
			verdict: 'Use for: fingerprinted scripts, styles, fonts and images.'
		},
		{
			label: 'no-cache',
			code: 'cache-control: no-cache\netag: "page-41"',
			body: 'Stored, but checked with the server before each reuse. Deploys show up on the next navigation, and an unchanged page costs only a 304.',
			verdict: 'Use for: HTML documents that reference fingerprinted files.'
		},
		{
			label: 'private, max-age=60',
			code: 'cache-control: private, max-age=60',
			body: 'The browser may reuse it for a minute; CDNs must not store it, because it describes one particular user.',
			verdict: 'Use for: signed-in, per-user API responses that tolerate a minute of staleness.'
		},
		{
			label: 's-maxage + swr',
			code: 'cache-control: public, max-age=0, s-maxage=60,\n  stale-while-revalidate=300',
			body: 'Browsers always revalidate, while the CDN serves its copy for a minute and then for five more while it refreshes in the background.',
			verdict: 'Use for: public data that changes often but can lag briefly, like a leaderboard.'
		},
		{
			label: 'no-store',
			code: 'cache-control: no-store',
			body: 'Nothing keeps a copy anywhere. Every view is a full download.',
			verdict: 'Use for: account statements, one-time tokens and other sensitive responses.'
		}
	]}
/>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint"
	questions={[
		{
			prompt: 'Which directive keeps a response out of CDNs but still lets the browser cache it?',
			options: ['no-store', 'private', 'public'],
			answer: 1,
			explain: 'private forbids shared caches from storing it; the browser’s own cache may still keep it.'
		}
	]}
/>

<h2>Cache busting: how “forever” stays safe</h2>
<p>
	Once a browser holds a response with <code>max-age=31536000</code>, you have no way to reach into that browser and evict it. CDNs offer a
	purge API, but browser caches do not. The robust answer is to never change what a URL means: build tools put a content hash in each file name,
	so <code>app.3f9a1c.js</code> becomes <code>app.b72e04.js</code> when its content changes. The HTML, which is revalidated every time, points at
	the new name, which no cache has seen.
</p>

<Code
	lang="js"
	title="server.js (Express)"
	code={`import express from 'express';
const app = express();

// Fingerprinted build output: a new deploy means new file names.
app.use('/assets', express.static('dist/assets', { maxAge: '1y', immutable: true }));

// Per-user data: browser only, briefly.
app.get('/api/me', (req, res) => {
  res.set('Cache-Control', 'private, max-age=60');
  res.json(currentUser(req));
});

// Everything else gets the app's HTML, revalidated on every use.
// express.static and sendFile both add ETag and Last-Modified by default.
app.use((req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile('index.html', { root: 'dist' });
});`}
/>

<Note title="DevCodex does this too">
	This app’s scripts and styles are served from hashed paths under <code>_app/immutable/</code>. Its service worker keeps a copy of each one, which
	is why it works offline and still picks up a new version once you are back online.
</Note>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Personal data in a shared cache.</strong> A per-user page sent with <code>public</code> or <code>s-maxage</code>, or a CDN rule that caches everything, can serve one user’s account page to the next visitor. Mark it <code>private</code> or <code>no-store</code>.</li>
	<li><strong>Long max-age on a URL whose content changes.</strong> Users keep the old <code>/logo.png</code> until it expires, and you cannot recall it. Fingerprint the name or use a short lifetime with an ETag.</li>
	<li><strong>Caching the HTML for a long time.</strong> The HTML is the only thing pointing at new fingerprinted files. If it is cached for a day, the deploy is invisible for a day.</li>
	<li><strong>Forgetting heuristics.</strong> No <code>Cache-Control</code> plus a <code>Last-Modified</code> header means browsers may cache on their own guess. Always state a policy, even if it is <code>no-cache</code>.</li>
	<li><strong>Different headers for browsers and CDNs, by accident.</strong> Use <code>s-maxage</code>, or the <code>CDN-Cache-Control</code> header from RFC 9213, when you want the CDN to cache longer than browsers.</li>
</ul>

<h2>Reading caching in DevTools</h2>
<ol>
	<li>Open the Network tab and reload. Check <strong>Status</strong> (200 or 304) and <strong>Size</strong>, which shows “(disk cache)” or “(memory cache)” for requests that never left the browser.</li>
	<li>Click a request and read the response headers: <code>cache-control</code>, <code>etag</code>, <code>age</code>, plus any provider-specific hit or miss header your CDN adds.</li>
	<li>Tick <strong>Disable cache</strong> to see a cold load. A hard reload (Shift + reload) also bypasses the browser cache for that one load.</li>
</ol>
</Layer>


<Layer depth="hood" summary="The exact freshness rules from RFC 9111: Age, s-maxage, Expires and heuristic lifetimes, then the full decision a cache makes, including Vary.">
<h2>Freshness: how long a copy may be reused</h2>
<p>
	A stored response is <strong>fresh</strong> while its <strong>age</strong> is less than its <strong>freshness lifetime</strong>. A fresh response is
	served without contacting the server at all. Once the age passes the lifetime, the response is <strong>stale</strong> and must normally be
	revalidated before reuse.
</p>
<p>The cache works out the freshness lifetime from the first of these that is present:</p>
<ol>
	<li><code>s-maxage=N</code> in <code>Cache-Control</code>. Shared caches only; browsers ignore it.</li>
	<li><code>max-age=N</code> in <code>Cache-Control</code>, in seconds.</li>
	<li>The <code>Expires</code> header minus the <code>Date</code> header. This is the older mechanism, and <code>max-age</code> overrides it.</li>
	<li>
		A <strong>heuristic</strong>, if none of the above exist. Caches may guess, and the RFC suggests 10% of the time since
		<code>Last-Modified</code> as a typical value. A file last changed 10 days ago could be treated as fresh for a day. That is why “I set no
		caching headers” does not mean “not cached”.
	</li>
</ol>

<h3>Age is not just time in your cache</h3>
<p>
	A shared cache sends an <code>Age</code> header saying how many seconds the response has already spent in caches upstream. That time counts
	against the lifetime:
</p>

<div class="table-wrap">
	<table>
		<caption>A response with max-age=600, received from a CDN with Age: 120</caption>
		<thead><tr><th scope="col">Time in browser</th><th scope="col">Current age</th><th scope="col">State</th><th scope="col">Next use</th></tr></thead>
		<tbody>
			<tr><th scope="row">0 s</th><td>120 s</td><td>Fresh</td><td>Served from cache</td></tr>
			<tr><th scope="row">300 s</th><td>420 s</td><td>Fresh</td><td>Served from cache</td></tr>
			<tr><th scope="row">480 s</th><td>600 s</td><td>Stale</td><td>Revalidate first</td></tr>
		</tbody>
	</table>
</div>


<Quiz
	variant="checkpoint"
	title="Under the hood checkpoint"
	questions={[
		{
			prompt: 'A response has max-age=60 and arrived from the CDN with Age: 20. How long is it fresh in the browser?',
			options: ['60 seconds', '40 seconds', '80 seconds'],
			answer: 1,
			explain: 'Age counts against the lifetime: 60 − 20 leaves 40 seconds of freshness.'
		}
	]}
/>

<h2>How a cache decides, step by step</h2>
<ol>
	<li><strong>Look up the cache key.</strong> By default that is the method and URL. If the stored response had a <code>Vary</code> header, the listed request headers must match too.</li>
	<li><strong>Fresh?</strong> If the age is under the freshness lifetime and nothing forbids reuse, serve it. No network.</li>
	<li><strong>Stale, with a validator?</strong> Send a conditional request with <code>If-None-Match</code> or <code>If-Modified-Since</code>.</li>
	<li><strong>304?</strong> Update the stored headers and serve the stored body. <strong>200?</strong> Replace the stored response and serve the new one.</li>
	<li><strong>Stale, no validator?</strong> Make an ordinary request and store the result if its headers allow.</li>
</ol>

<h3>Vary: when one URL has several right answers</h3>
<p>
	If a server picks the representation based on a request header, such as language or compression, the cache must key on that header too, or
	it will hand a French page to an English reader. <code>Vary: Accept-Language</code> tells caches exactly that. Keep the list short: each
	header you vary on multiplies the number of copies a CDN stores and lowers the hit rate.
</p>

<h2>Recap: the full rules</h2>
<ul>
	<li>Fresh copies are reused with no request. Stale copies are revalidated with a conditional request that usually returns a small 304.</li>
	<li><code>max-age</code> sets the lifetime, <code>s-maxage</code> overrides it for shared caches, and <code>Age</code> counts time already spent upstream.</li>
	<li><code>no-cache</code> means “revalidate every time”. <code>no-store</code> means “never store”. <code>private</code> keeps it out of shared caches.</li>
	<li>Fingerprint static files and cache them for a year; revalidate HTML every time.</li>
</ul>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'A response has max-age=600 and arrived with Age: 0. You reuse it 5 minutes later. What happens on the network?',
			options: ['A full download', 'Nothing: the copy is still fresh', 'A conditional request and a 304'],
			answer: 1,
			explain: '300 seconds is under the 600-second lifetime, so the browser serves its copy without contacting anyone.'
		},
		{
			prompt: 'Same response, but it arrived from the CDN with Age: 500. How long is it fresh in the browser?',
			options: ['600 seconds', '100 seconds', 'It is already stale'],
			answer: 1,
			explain: 'Age counts against the lifetime: 600 − 500 leaves 100 seconds of freshness.'
		},
		{
			prompt: 'Which header value still lets the browser keep a copy?',
			options: ['no-store', 'no-cache', 'Neither'],
			answer: 1,
			explain: 'no-cache stores the response and revalidates before each use. no-store keeps nothing.'
		},
		{
			prompt: 'A signed-in dashboard response should be cached by the browser for 30 seconds but never by the CDN. Which header?',
			options: ['public, max-age=30', 'private, max-age=30', 's-maxage=30'],
			answer: 1,
			explain: 'private forbids shared caches from storing it while still allowing the browser’s private cache.'
		},
		{
			prompt: 'You shipped /app.js with max-age=31536000 and need to fix a bug in it. What actually works?',
			options: ['Purge it from browser caches', 'Ship the fix under a new file name and point the HTML at it', 'Send no-store on the next response'],
			answer: 1,
			explain: 'Browsers will not ask about /app.js again for a year, so no new header ever reaches them. A new URL sidesteps every stored copy.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://www.rfc-editor.org/rfc/rfc9111" rel="external">RFC 9111: HTTP Caching</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc5861" rel="external">RFC 5861: stale-while-revalidate and stale-if-error</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc8246" rel="external">RFC 8246: the immutable directive</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc9213" rel="external">RFC 9213: Targeted HTTP cache control (CDN-Cache-Control)</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching" rel="external">MDN: HTTP caching</a></li>
</ul>
</Layer>
