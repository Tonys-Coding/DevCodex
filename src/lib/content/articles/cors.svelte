<script lang="ts">
	import CorsLab from '../../components/teach/CorsLab.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Diagram from '../../components/teach/Diagram.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	You’re signed in to your email in one tab. In another tab, you open some random website. Could that website’s code quietly fetch your inbox,
	using your signed-in cookies, and read it? Browsers say no. That rule is the <strong>same-origin policy</strong>, and <strong>CORS</strong> is the
	way a server says “it’s fine, this other site may read my answers”.
</p>
<p>In this lesson you will learn:</p>
<ul>
	<li>what an <strong>origin</strong> is, and what the browser stops,</li>
	<li>how a server gives permission with one header,</li>
	<li>what the extra “preflight” request is for, and</li>
	<li>how to read a CORS error and fix it in the right place.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Origin</dt>
		<dd>Where a page comes from: its scheme, host and port together, like <code>https://app.example</code>.</dd>
	</div>
	<div>
		<dt>Same-origin policy</dt>
		<dd>The browser rule that a page’s scripts may only read responses from their own origin, unless told otherwise.</dd>
	</div>
	<div>
		<dt>CORS</dt>
		<dd>Cross-Origin Resource Sharing: headers a server sends to let other origins read its responses.</dd>
	</div>
	<div>
		<dt>Preflight</dt>
		<dd>A permission check the browser sends before certain requests, asking the server “may I send this?”.</dd>
	</div>
</dl>

<h2>Same origin or not?</h2>
<p>Two addresses have the same origin only if all three parts match exactly:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Compared with <code>https://app.example</code></th><th scope="col">Same origin?</th><th scope="col">Why</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>https://app.example/settings</code></th><td>Yes</td><td>Only the path differs</td></tr>
			<tr><th scope="row"><code>https://api.example</code></th><td>No</td><td>Different host</td></tr>
			<tr><th scope="row"><code>http://app.example</code></th><td>No</td><td>Different scheme (http, not https)</td></tr>
			<tr><th scope="row"><code>https://app.example:8443</code></th><td>No</td><td>Different port</td></tr>
		</tbody>
	</table>
</div>

<h2>What the browser actually stops</h2>
<p>
	The surprising part: for ordinary requests, the browser still <em>sends</em> them to the other origin. What it stops is your script
	<em>reading</em> the answer. Unless the server says otherwise, the response is kept from the page, and your code gets an error instead.
</p>
<p>
	This protects you, the user. The browser attaches your cookies to requests, so without this rule any site could read anything you can see
	while signed in elsewhere.
</p>

<h2>How a server says yes</h2>
<p>A server that wants another site to read its answers adds one header to the response:</p>

<Code
	lang="http"
	title="A response that allows app.example to read it"
	code={`HTTP/2 200
content-type: application/json
access-control-allow-origin: https://app.example`}
	caption="The browser sees its own page’s origin listed, so it lets the script read the response."
/>

<p>
	The value can be one exact origin, as here, or <code>*</code> for “any site”, which is fine for public data that needs no sign-in.
</p>

<h2>The preflight: asking first</h2>
<p>
	Some requests could change things on the server, like a <code>PUT</code> or <code>DELETE</code>, or a <code>POST</code> sending JSON. For those, the
	browser asks permission <em>before</em> sending them. It sends an <code>OPTIONS</code> request, the <strong>preflight</strong>, saying which method and
	headers it wants to use. Only if the server’s answer allows them does the real request go out.
</p>

<Diagram
	name="cors-preflight"
	alt="Sequence diagram with three lanes: a script on app.example, the browser, and api.example. A GET is sent straight to the API with an Origin header, the API answers 200 with Access-Control-Allow-Origin, the browser's CORS check passes and the script can read the response. A PUT with JSON first makes the browser send OPTIONS to the same URL; the API answers 204 with the allowed methods and headers; the browser caches that for this URL, then sends the PUT, checks the response and hands it to the script."
	caption="Your script never sees the preflight. The browser sends it, checks the answer and remembers it for a while."
/>

<p>Try it: change the method, the Content-Type or the headers, and see whether the browser sends a preflight and what each side says.</p>

<CorsLab />

<h2>Reading a CORS error</h2>
<p>When the server hasn’t given permission, the browser console shows a message like this one from Chrome:</p>

<Code
	lang="text"
	code={`Access to fetch at 'https://api.example/items' from origin 'https://app.example'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is
present on the requested resource.`}
/>

<ul>
	<li><strong>The fix belongs on the server</strong> you are calling: it needs to send the right <code>Access-Control-Allow-*</code> headers. Nothing in your page’s code can grant permission on its behalf.</li>
	<li><strong>Only browsers enforce CORS.</strong> The same request from <code>curl</code>, a server or a mobile app works, which is why “it works in Postman” doesn’t mean the browser will allow it.</li>
	<li><strong>Look at the Network tab.</strong> If there is a failed <code>OPTIONS</code> request, the preflight is what the server needs to answer.</li>
</ul>

<Note title="mode: 'no-cors' is not a fix" tone="warn">
	Adding <code>mode: 'no-cors'</code> to <code>fetch</code> makes the error go away, but the response you get is empty and unreadable. It is meant for
	requests whose answer you never need to see.
</Note>

<h2>Recap</h2>
<ol>
	<li>An <strong>origin</strong> is scheme, host and port together.</li>
	<li>The <strong>same-origin policy</strong> stops scripts reading responses from other origins, to protect signed-in users.</li>
	<li>A server allows it with <code>Access-Control-Allow-Origin</code>.</li>
	<li>Requests that might change things get a <strong>preflight</strong> <code>OPTIONS</code> check first.</li>
	<li>CORS errors are fixed on the server you are calling; only browsers enforce them.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'Are https://app.example and https://api.example the same origin?',
			options: ['Yes, same scheme and same site', 'No, the hosts differ'],
			answer: 1,
			explain: 'Origin is scheme, host and port. app.example and api.example are different hosts.'
		},
		{
			prompt: 'For an ordinary GET to another origin, what does the same-origin policy stop?',
			options: ['The request being sent', 'Your script reading the response', 'The server receiving your cookies'],
			answer: 1,
			explain: 'The request goes out; without the server’s permission, the browser keeps the response from your script.'
		},
		{
			prompt: 'Which response header lets https://app.example read the response?',
			options: ['Access-Control-Allow-Origin: https://app.example', 'Origin: https://app.example', 'Content-Type: application/json'],
			answer: 0,
			explain: 'Access-Control-Allow-Origin is the server’s permission. Origin is what the browser sends to say where the page is from.'
		},
		{
			prompt: 'A page sends a PUT with JSON to another origin. What does the browser send first?',
			options: ['Nothing; it sends the PUT straight away', 'An OPTIONS preflight asking permission'],
			answer: 1,
			explain: 'PUT and a JSON body both need permission first, so the browser sends an OPTIONS preflight.'
		},
		{
			prompt: 'Your page gets a CORS error calling someone’s API. Where does the fix go?',
			options: ['In your page’s JavaScript', 'On the API server, in its response headers', 'In the browser settings'],
			answer: 1,
			explain: 'Only the server being called can grant permission, by sending the right Access-Control-Allow-* headers.'
		}
	]}
/>

<CorePack />


<Layer depth="deeper" summary="The exact rules from the Fetch Standard: which requests skip the preflight, how the preflight is checked and cached, credentials, and a correct server.">
<p>
	The <strong>same-origin policy</strong> stops a script from one origin reading responses from another. Without it, any page you visit could
	<code>fetch('https://mail.example/inbox')</code> with your cookies attached and read the result. <strong>CORS</strong> (Cross-Origin Resource
	Sharing) is the opt-out: a set of HTTP headers with which a server tells the browser which other origins may read its responses, and which
	requests they may send first. It is specified in the
	<a href="https://fetch.spec.whatwg.org/#http-cors-protocol" rel="external">Fetch Standard</a>, which replaced the old W3C CORS document.
</p>
<p>
	Two facts remove most of the panic. CORS is enforced <em>only</em> by the browser, on behalf of the user; <code>curl</code>, servers and
	mobile apps ignore it. And CORS mostly governs <em>reading</em>: many cross-origin requests reach your server and run whatever the policy says.
	This article covers the exact rules from the spec, behaviour confirmed in Chrome 155 where implementations matter, and the misconfigurations that
	turn CORS into a vulnerability.
</p>

<h2>What the same-origin policy blocks</h2>
<p>
	An <strong>origin</strong> is the tuple (scheme, host, port): <code>https://app.example</code> and <code>https://app.example:8443</code>
	differ. The policy is not a single rule but a family of restrictions, and it is deliberately lopsided:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Cross-origin action</th><th scope="col">Allowed by default?</th><th scope="col">Examples</th></tr></thead>
		<tbody>
			<tr><th scope="row">Embedding</th><td>Yes</td><td><code>&lt;img&gt;</code>, <code>&lt;script&gt;</code>, <code>&lt;link rel=stylesheet&gt;</code>, <code>&lt;video&gt;</code>, iframes</td></tr>
			<tr><th scope="row">Sending writes</th><td>Yes</td><td>Form submissions, navigations, <code>fetch</code> with a safelisted method and headers</td></tr>
			<tr><th scope="row">Reading responses</th><td>No</td><td>The body, status and most headers of a <code>fetch</code>; pixels of a cross-origin image drawn to a canvas</td></tr>
			<tr><th scope="row">Reaching into documents</th><td>No</td><td>Another origin’s DOM through <code>iframe.contentWindow</code>, beyond a few properties such as <code>postMessage</code></td></tr>
		</tbody>
	</table>
</div>

<p>
	Embedding and sending were allowed long before the policy existed, so the web cannot take them back. CORS therefore splits requests in two.
	Those an HTML form could already send are sent immediately; anything beyond that needs the server’s permission first, in a
	<strong>preflight</strong>.
</p>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'What does the same-origin policy mainly stop a cross-origin script from doing?',
			options: ['Sending a request', 'Reading the response', 'Opening a TCP connection'],
			answer: 1,
			explain: 'Simple cross-origin requests are still sent. What the browser withholds, unless CORS allows it, is the response.'
		}
	]}
/>

<h2>The headers</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Header</th><th scope="col">Direction</th><th scope="col">Meaning</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Origin</code></th><td>Request</td><td>Serialized requesting origin, or <code>null</code>. Sent on every CORS request and on every non-GET/HEAD request</td></tr>
			<tr><th scope="row"><code>Access-Control-Request-Method</code></th><td>Preflight</td><td>The method the real request will use</td></tr>
			<tr><th scope="row"><code>Access-Control-Request-Headers</code></th><td>Preflight</td><td>The non-safelisted header names it will send: lowercased, sorted, joined with <code>,</code> and no spaces</td></tr>
			<tr><th scope="row"><code>Access-Control-Allow-Origin</code></th><td>Response</td><td>Exactly one serialized origin, <code>null</code>, or <code>*</code></td></tr>
			<tr><th scope="row"><code>Access-Control-Allow-Credentials</code></th><td>Response</td><td>The literal, case-sensitive <code>true</code>. Required to share a response to a credentialed request</td></tr>
			<tr><th scope="row"><code>Access-Control-Allow-Methods</code></th><td>Preflight response</td><td>Methods permitted beyond the safelisted ones</td></tr>
			<tr><th scope="row"><code>Access-Control-Allow-Headers</code></th><td>Preflight response</td><td>Request header names permitted beyond the safelisted ones</td></tr>
			<tr><th scope="row"><code>Access-Control-Max-Age</code></th><td>Preflight response</td><td>Seconds the preflight result may be cached. Default 5</td></tr>
			<tr><th scope="row"><code>Access-Control-Expose-Headers</code></th><td>Response</td><td>Response header names script may read beyond the safelisted ones</td></tr>
		</tbody>
	</table>
</div>

<h2>When a request is sent without a preflight</h2>
<p>
	The spec has no “simple request” any more; it defines what is <strong>safelisted</strong>. A <code>fetch</code> in <code>cors</code> mode skips
	the preflight only if <em>all</em> of these hold:
</p>
<ol>
	<li>The method is <code>GET</code>, <code>HEAD</code> or <code>POST</code>.</li>
	<li>Every author-set header is a <strong>CORS-safelisted request-header</strong>:
		<ul>
			<li><code>Accept</code>, without unsafe bytes such as <code>"():&lt;&gt;?@[\]{'{}'}</code></li>
			<li><code>Accept-Language</code> and <code>Content-Language</code>, using only letters, digits, space and <code>*,-.;=</code></li>
			<li><code>Content-Type</code>, whose parsed essence is <code>application/x-www-form-urlencoded</code>, <code>multipart/form-data</code> or <code>text/plain</code>. Parameters such as <code>;charset=UTF-8</code> are fine</li>
			<li><code>Range</code>, with a single byte range that has a start, like <code>bytes=0-499</code></li>
		</ul>
	</li>
	<li>Each safelisted value is at most 128 bytes, and their total is at most 1,024 bytes. Past either limit the headers count as unsafe.</li>
	<li>The request’s <strong>use-CORS-preflight flag</strong> is unset. It is set when an <code>XMLHttpRequestUpload</code> has event listeners, or when the body is a <code>ReadableStream</code>.</li>
</ol>

<p>
	Headers the browser adds itself, such as <code>User-Agent</code>, <code>Sec-Fetch-*</code> or <code>Origin</code>, never count. Note what is
	absent: <code>Authorization</code> and <code>Content-Type: application/json</code> both always trigger a preflight, which is why almost every
	API call from a modern frontend is preflighted.
</p>

<Note title="Method names are case-sensitive" tone="warn">
	<code>fetch</code> uppercases only <code>DELETE</code>, <code>GET</code>, <code>HEAD</code>, <code>OPTIONS</code>, <code>POST</code> and
	<code>PUT</code>. <code>method: 'patch'</code> is sent as <code>patch</code>, and a preflight answered with
	<code>Access-Control-Allow-Methods: PATCH</code> fails, because method matching is exact. In our Chrome test, <code>'delete'</code> worked
	and <code>'patch'</code> did not.
</Note>

<h2>The preflight</h2>
<p>If any condition above fails, the browser first sends an <code>OPTIONS</code> request to the same URL. The CORS-preflight fetch then:</p>
<ol>
	<li>Sends <code>Accept: */*</code>, <code>Origin</code>, <code>Access-Control-Request-Method</code> and, if any, <code>Access-Control-Request-Headers</code>. It <strong>never</strong> sends cookies or HTTP authentication, even when the real request will.</li>
	<li>Runs the normal CORS check on the response, using the <em>real</em> request’s credentials mode. A credentialed request therefore needs <code>Access-Control-Allow-Credentials: true</code> on the preflight response too.</li>
	<li>Requires an <strong>ok status</strong>, 200–299. A redirect, 401 or 500 fails the preflight; redirects are not followed.</li>
	<li>Checks the method: allowed if listed, if it is safelisted, or if <code>*</code> is listed and the request is not credentialed. A POST that is preflighted only because of its headers needs no <code>Allow-Methods</code> at all.</li>
	<li>Checks each unsafe header name the same way, except that <code>Authorization</code> is never covered by <code>*</code> in the spec.</li>
	<li>Caches the result for <code>Max-Age</code> seconds, then sends the real request, which goes through the CORS check again.</li>
</ol>


<Note title="Authorization and the wildcard: spec versus browsers" tone="warn">
	The Fetch Standard says <code>Access-Control-Allow-Headers: *</code> does not cover <code>Authorization</code>. In practice no major engine
	enforces that by default yet: our test passed with the wildcard in Chrome 155, and MDN’s compatibility data lists Firefox support only behind a
	preference. List <code>Authorization</code> explicitly so you don’t break when enforcement lands.
</Note>

<h2>The preflight cache</h2>
<p>
	A successful preflight creates one cache entry per allowed method and per allowed header name. Each entry is keyed by the network partition
	key, the requesting origin, the <strong>exact request URL</strong> and whether credentials were included. Three consequences follow:
</p>
<ul>
	<li><strong>The cache is per URL.</strong> <code>PUT /items/1</code> and <code>PUT /items/2</code> each pay their own preflight. We observed exactly that: a second <code>PUT</code> to <code>/items/1</code> reused the cache, and the first to <code>/items/2</code> sent a new <code>OPTIONS</code>. REST APIs with IDs in the path get little benefit from <code>Max-Age</code>.</li>
	<li><strong>Browsers cap the lifetime.</strong> Without the header, entries live 5 seconds. Chromium caps <code>Max-Age</code> at 7,200 seconds (two hours, since Chrome 76) and Firefox at 86,400. Larger values are clamped.</li>
	<li><strong>It is a latency cost, not just a request count.</strong> Each miss adds a full round trip before the real request can start, which on a mobile connection can exceed the request itself.</li>
</ul>
<p>
	The only way to drop preflights entirely is to avoid cross-origin requests: serve the API from the page’s own origin, through a reverse proxy
	path such as <code>/api</code>, or stay within the safelist.
</p>


<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Which of these cross-origin fetches triggers a preflight?',
			options: ['GET with no custom headers', 'POST with Content-Type: application/json', 'POST with Content-Type: text/plain'],
			answer: 1,
			explain: 'application/json is not a CORS-safelisted Content-Type, so the browser asks first with an OPTIONS preflight.'
		}
	]}
/>

<h2>Credentials</h2>
<p>
	In <code>fetch</code>, <code>credentials: 'same-origin'</code> is the default, so cross-origin requests carry no cookies unless you pass
	<code>'include'</code>. Credentialed requests tighten every rule:
</p>

<div class="table-wrap">
	<table>
		<caption>Request from https://app.example; is the response shared?</caption>
		<thead><tr><th scope="col">credentials</th><th scope="col">Allow-Origin</th><th scope="col">Allow-Credentials</th><th scope="col">Shared?</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>same-origin</code></th><td><code>*</code></td><td>absent</td><td>Yes</td></tr>
			<tr><th scope="row"><code>same-origin</code></th><td><code>*</code></td><td><code>true</code></td><td>Yes: ignored without credentials</td></tr>
			<tr><th scope="row"><code>same-origin</code></th><td><code>https://app.example/</code></td><td>absent</td><td>No: a serialized origin has no trailing slash</td></tr>
			<tr><th scope="row"><code>include</code></th><td><code>*</code></td><td><code>true</code></td><td>No: <code>*</code> is never valid with credentials</td></tr>
			<tr><th scope="row"><code>include</code></th><td><code>https://app.example</code></td><td><code>True</code></td><td>No: the value is case-sensitive</td></tr>
			<tr><th scope="row"><code>include</code></th><td><code>https://app.example</code></td><td><code>true</code></td><td>Yes</td></tr>
		</tbody>
	</table>
</div>

<p>With credentials, <code>*</code> also loses its wildcard meaning in <code>Allow-Methods</code>, <code>Allow-Headers</code> and <code>Expose-Headers</code>; every name must be listed. Two further traps:</p>
<ul>
	<li><strong>The cookie went out anyway.</strong> In our test a credentialed GET to a server answering <code>Allow-Origin: *</code> arrived <em>with</em> the cookie, executed, and only then was blocked from the page. Any <code>Set-Cookie</code> on a credentialed CORS response is also stored even when the response is not shared.</li>
	<li><strong>CORS does not override cookie policy.</strong> A cookie is attached only if its own rules allow it. If the API is cross-<em>site</em> from the page, its cookies are third-party: they need <code>SameSite=None; Secure</code>, and Safari blocks them while Firefox partitions them by default. Put a credentialed API on a same-site host, such as <code>api.app.example</code> for <code>app.example</code>.</li>
</ul>

<h2>A correct server</h2>
<p>This runs on Node 24 with no dependencies and is the configuration we tested against Chrome:</p>

<Code
	lang="js"
	title="cors.js"
	code={`const ALLOWED = new Set(['https://app.example.com', 'https://admin.example.com']);

function cors(req, res) {
  res.setHeader('Vary', 'Origin');           // always: the answer depends on Origin
  const origin = req.headers.origin;
  if (!origin || !ALLOWED.has(origin)) return false;   // exact string match
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return true;
}

function isPreflight(req) {
  return req.method === 'OPTIONS' && req.headers['access-control-request-method'] !== undefined;
}

export function handle(req, res, next) {
  const allowed = cors(req, res);
  if (isPreflight(req)) {                    // answer before any auth middleware
    if (!allowed) return res.writeHead(403).end();
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '7200');
    return res.writeHead(204).end();
  }
  if (allowed) res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
  next();                                    // the real handler, with auth
}`}
	caption="The 403 is for clarity in logs; omitting the headers is what actually denies access. Vary: Origin goes on every response so no cache serves one origin’s answer to another."
/>

<p>The decisions behind it:</p>
<ul>
	<li><strong>Exact matching against a set.</strong> Parsing and pattern-matching origins is where vulnerabilities come from; see the next section.</li>
	<li><strong>Preflight before authentication.</strong> A preflight carries no cookies and no <code>Authorization</code>, so auth middleware that answers 401 first breaks every preflighted call.</li>
	<li><strong>One <code>Allow-Origin</code> value.</strong> Sending two, or a comma-separated list, fails the check: the browser compares the combined header value with one origin. Verified in Chrome.</li>
	<li><strong><code>Vary: Origin</code> even on denials.</strong> Otherwise a CDN may cache a response without CORS headers and serve it to an allowed origin, or the reverse.</li>
</ul>

<h2>Debugging a CORS error</h2>
<ol>
	<li><strong>Read the console, not the exception.</strong> The console message names the failing rule: missing <code>Allow-Origin</code>, wildcard with credentials, a header missing from <code>Allow-Headers</code>, or a preflight that “does not have HTTP ok status”.</li>
	<li><strong>Find the preflight</strong> in the Network tab. Chrome lists it as a separate <code>OPTIONS</code> row, type <code>preflight</code>. Check its status before anything else.</li>
	<li><strong>Compare the request with the response</strong> line by line: <code>Origin</code> against <code>Allow-Origin</code>, <code>Access-Control-Request-Headers</code> against <code>Allow-Headers</code>.</li>
	<li><strong>Check that the error response has CORS headers too.</strong> Frameworks often skip middleware on 404, 500 and auth failures, so the real error shows up as a CORS error.</li>
	<li><strong>Replay with curl</strong> to see exactly what the server returns: <code>curl -si -X OPTIONS -H 'Origin: https://app.example.com' -H 'Access-Control-Request-Method: PUT' https://api.example.com/items/1</code>.</li>
</ol>
</Layer>


<Layer depth="hood" summary="Reading headers, redirects, opaque responses and HTML elements, the misconfigurations that become vulnerabilities, and neighbouring rules that are not CORS.">
<h2>Reading the response</h2>
<p>
	A shared response exposes its body, its status, whatever that status is (a 500 with valid CORS headers is readable, with <code>ok</code> false),
	and a limited set of headers. Without <code>Access-Control-Expose-Headers</code>, script sees only the CORS-safelisted response headers:
	<code>Cache-Control</code>, <code>Content-Language</code>, <code>Content-Length</code>, <code>Content-Type</code>, <code>Expires</code>,
	<code>Last-Modified</code> and <code>Pragma</code>. Anything else, such as <code>ETag</code>, <code>Link</code> or a request ID, returns
	<code>null</code> from <code>headers.get()</code>.
</p>
<p>
	A response that fails the check is not partially readable. The <code>fetch</code> promise rejects with a <code>TypeError</code> (Chrome’s
	message is “Failed to fetch”) that is indistinguishable from DNS failure or a dropped connection. The reason appears only in the DevTools
	console. That opacity is deliberate: if script could tell “blocked by CORS” from “no server”, any page could map hosts and ports behind your
	firewall.
</p>

<h2>Redirects</h2>
<ul>
	<li><strong>Every hop is checked.</strong> Each redirect response, and the final response, must pass the CORS check.</li>
	<li><strong>Origin becomes <code>null</code>.</strong> As soon as a server on another origin redirects the request to any different origin, the request is tainted and later hops send <code>Origin: null</code>. A page on <code>app.example</code> fetching <code>api.example</code>, which redirects to <code>cdn.example</code>, reaches the CDN with <code>Origin: null</code>, so the CDN must answer <code>null</code> or <code>*</code>. We confirmed this in Chrome.</li>
	<li><strong><code>Authorization</code> is dropped</strong> on a redirect to a different origin.</li>
	<li><strong>Preflights are never redirected.</strong> An <code>http</code>→<code>https</code> or trailing-slash redirect on the <code>OPTIONS</code> route fails every preflighted call.</li>
	<li><strong>A cross-origin redirect to a URL containing credentials</strong> (<code>https://user:pass@…</code>) is a network error in <code>cors</code> mode.</li>
</ul>

<h2>no-cors and opaque responses</h2>
<p>
	<code>mode: 'no-cors'</code> does not bypass anything. It sends the request the way an <code>&lt;img&gt;</code> would and gives you an
	<strong>opaque response</strong>: <code>type</code> is <code>"opaque"</code>, <code>status</code> is 0, and the headers and body are empty.
	Only safelisted methods are allowed, and non-safelisted headers are silently dropped. Both verified:
</p>

<Code
	lang="js"
	title="no-cors, as Chrome behaves"
	code={`await fetch(api, { mode: 'no-cors', method: 'PUT' });
// TypeError: Failed to execute 'fetch' on 'Window': 'PUT' is unsupported in no-cors mode.

const r = await fetch(api, {
  mode: 'no-cors',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },   // silently dropped
  body: '{}'
});
r.type;     // "opaque"
r.status;   // 0
// The server received Content-Type: text/plain;charset=UTF-8`}
/>

<p>Opaque responses are useful only to things that never expose bytes to script: a service worker can cache and replay them, and elements can render them.</p>

<h2>CORS and HTML elements</h2>
<p>
	Elements fetch in <code>no-cors</code> mode by default. The <code>crossorigin</code> attribute switches them to <code>cors</code> mode:
	<code>anonymous</code> uses <code>same-origin</code> credentials and <code>use-credentials</code> uses <code>include</code>. You need it when:
</p>
<ul>
	<li><strong>Reading image pixels.</strong> Drawing a no-cors cross-origin image taints the canvas, and <code>getImageData()</code> or <code>toDataURL()</code> then throw a <code>SecurityError</code>.</li>
	<li><strong>Getting script errors.</strong> Errors from a classic cross-origin script loaded without CORS are muted to <code>"Script error."</code> in <code>window.onerror</code>.</li>
	<li><strong>Using Subresource Integrity</strong> on a cross-origin resource. The integrity check requires a CORS-readable response.</li>
</ul>
<p>Some loads are always CORS regardless of attributes: module scripts (<code>&lt;script type="module"&gt;</code>), web fonts from <code>@font-face</code>, and <code>fetch</code> / <code>XMLHttpRequest</code> in their default mode.</p>

<h2>Misconfigurations that become vulnerabilities</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Configuration</th><th scope="col">Why it is exploitable</th></tr></thead>
		<tbody>
			<tr><th scope="row">Reflecting any <code>Origin</code> with <code>Allow-Credentials: true</code></th><td>Every site on the internet can read authenticated responses as the user: account data, CSRF tokens, API keys</td></tr>
			<tr><th scope="row"><code>origin.endsWith('example.com')</code></th><td>Matches <code>https://evilexample.com</code>, which anyone can register</td></tr>
			<tr><th scope="row"><code>/^https:\/\/api.example.com$/</code></th><td>The unescaped dot matches any character, so <code>https://api-example.com</code> passes</td></tr>
			<tr><th scope="row"><code>origin.startsWith('https://example.com')</code></th><td>Matches <code>https://example.com.evil.net</code></td></tr>
			<tr><th scope="row">Allowing <code>null</code></th><td>Sandboxed iframes, <code>data:</code> URLs and cross-origin redirects all send <code>null</code>, and an attacker controls all three</td></tr>
			<tr><th scope="row">Trusting every subdomain</th><td>One XSS or takeover on any subdomain becomes credentialed read access to the API</td></tr>
			<tr><th scope="row"><code>*</code> on internal, unauthenticated services</th><td>An employee’s browser becomes a proxy: a public page fetches <code>http://10.0.0.5/admin</code> and reads it. No credentials needed</td></tr>
			<tr><th scope="row">Dynamic <code>Allow-Origin</code> without <code>Vary: Origin</code></th><td>Caches mix responses between origins, leaking data or breaking legitimate clients</td></tr>
		</tbody>
	</table>
</div>

<Note title="CORS is not CSRF protection" tone="warn">
	A safelisted request executes on the server before CORS is consulted. We sent a <code>POST</code> with <code>Content-Type: text/plain</code> and a
	JSON body: no preflight, the handler ran, and a server that parses bodies as JSON regardless of type would have acted on it. Defend
	state-changing endpoints with <code>SameSite</code> cookies plus a CSRF token or a check of <code>Origin</code> or
	<code>Sec-Fetch-Site</code>, and reject unexpected <code>Content-Type</code> values.
</Note>

<h2>Related mechanisms that are not CORS</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Mechanism</th><th scope="col">What it controls</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Cross-Origin-Resource-Policy</code></th><td>Lets a server refuse to be <em>embedded</em> cross-origin at all, even in no-cors mode; CORS only grants reading</td></tr>
			<tr><th scope="row"><code>Cross-Origin-Embedder-Policy: require-corp</code></th><td>Requires every subresource to opt in through CORS or CORP; a prerequisite, with COOP, for cross-origin isolation and <code>SharedArrayBuffer</code></td></tr>
			<tr><th scope="row"><code>Sec-Fetch-Site</code>, <code>Sec-Fetch-Mode</code></th><td>Request metadata browsers send on HTTPS requests, so servers can reject cross-site requests before doing any work</td></tr>
			<tr><th scope="row">Local Network Access (Chrome 142+)</th><td>A user permission prompt before a public site may reach private or loopback addresses. It replaced the preflight-based Private Network Access proposal</td></tr>
		</tbody>
	</table>
</div>

<h2>Recap: the full rules</h2>
<ul>
	<li>The same-origin policy blocks reading, not sending. CORS lets a server grant read access, origin by origin, and is enforced only by browsers.</li>
	<li>No preflight only for GET, HEAD or POST with safelisted headers within the length limits. JSON and <code>Authorization</code> always preflight.</li>
	<li>Preflights carry no credentials, need a 2xx, are never redirected, and are cached per URL for at most 2 h in Chromium and 24 h in Firefox.</li>
	<li>Credentials forbid every <code>*</code> and need <code>Allow-Credentials: true</code> on the preflight and the response. Cookie rules still apply on top.</li>
	<li>Allowlist exact origins, never <code>null</code>, always send <code>Vary: Origin</code>, and keep CSRF defences: CORS is not one.</li>
</ul>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: json }) to another origin. What reaches the server?',
			options: ['An OPTIONS preflight only', 'The POST itself, with no preflight', 'Nothing until the server sends Allow-Origin'],
			answer: 1,
			explain: 'POST with a safelisted Content-Type needs no preflight, so the server receives and executes it. CORS only decides whether the page can read the response.'
		},
		{
			prompt: 'A credentialed preflighted request fails although the actual response has Allow-Origin and Allow-Credentials: true. What is the likely cause?',
			options: ['The preflight response lacks Allow-Credentials: true', 'The preflight carried the wrong cookie', 'Max-Age is too low'],
			answer: 0,
			explain: 'The preflight is CORS-checked with the real request’s credentials mode, so it needs Allow-Origin and Allow-Credentials too. It never carries cookies.'
		},
		{
			prompt: 'Your API sets Access-Control-Max-Age: 86400. Users of a Chromium browser editing /items/1, /items/2 and /items/3 pay how many preflights?',
			options: ['One per day', 'One per URL, each cached for at most two hours', 'None after the first'],
			answer: 1,
			explain: 'The preflight cache is keyed by the exact URL, and Chromium clamps Max-Age to 7,200 seconds.'
		},
		{
			prompt: 'api.example redirects a CORS request from app.example to cdn.example. What Origin does cdn.example see?',
			options: ['https://app.example', 'https://api.example', 'null'],
			answer: 2,
			explain: 'A cross-origin hop away from the request’s own origin taints it, and later requests send Origin: null.'
		},
		{
			prompt: 'Which origin check is safe?',
			options: [
				'Allow any origin that ends with “example.com”',
				'Allow only origins found, character for character, in a fixed set',
				'Allow origins matching the regular expression ^https://api.example.com$'
			],
			answer: 1,
			explain: 'Exact matching against a fixed set has no edge cases. An “ends with” check accepts evilexample.com, and the unescaped dots in the regular expression also accept api-example.com.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://fetch.spec.whatwg.org/#http-cors-protocol" rel="external">Fetch Standard: the CORS protocol</a>, including <a href="https://fetch.spec.whatwg.org/#cors-preflight-fetch" rel="external">CORS-preflight fetch</a>, <a href="https://fetch.spec.whatwg.org/#cors-preflight-cache" rel="external">the preflight cache</a> and <a href="https://fetch.spec.whatwg.org/#cors-safelisted-request-header" rel="external">safelisted request headers</a></li>
	<li><a href="https://html.spec.whatwg.org/multipage/urls-and-fetching.html#cors-settings-attributes" rel="external">HTML Standard: CORS settings attributes (crossorigin)</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" rel="external">MDN: Cross-Origin Resource Sharing</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Max-Age" rel="external">MDN: Access-Control-Max-Age, with browser caps</a></li>
	<li><a href="https://github.com/mdn/browser-compat-data/blob/main/http/headers/Access-Control-Allow-Headers.json" rel="external">MDN browser-compat-data: Authorization not covered by wildcard</a></li>
	<li><a href="https://portswigger.net/web-security/cors" rel="external">PortSwigger Web Security Academy: CORS vulnerabilities</a></li>
	<li><a href="https://developer.chrome.com/blog/local-network-access" rel="external">Chrome: Local Network Access</a></li>
</ul>
</Layer>
