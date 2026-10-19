<script lang="ts">
	import Choice from '../../components/teach/Choice.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Diagram from '../../components/teach/Diagram.svelte';
</script>

<p>
	HTTP is <strong>stateless</strong>: each request stands alone, and nothing in the protocol says two requests came from the same person. Yet you
	sign in once and stay signed in for weeks. The bridge is the <strong>cookie</strong>, a small name–value pair the server asks the browser to
	store and send back on later requests. A <strong>session</strong> is what you build on top: the cookie carries an identifier, and the server uses
	it to look up who you are.
</p>
<p>
	Almost every web app gets this working on the first day and gets one detail wrong for years. This article covers how cookies are scoped and
	sent, what each attribute actually protects against, how to build a session store, when signed tokens are a better fit, and the attacks each
	design has to survive.
</p>

<h2>How a cookie travels</h2>
<p>The server sets a cookie with a <code>Set-Cookie</code> response header, one header per cookie:</p>

<Code
	lang="http"
	title="Sign-in response"
	code={`HTTP/2 303
location: /
set-cookie: __Host-sid=k3v9Qp…; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=28800
set-cookie: theme=dark; Path=/; Max-Age=31536000`}
/>

<p>
	The browser stores each one in its cookie jar with its attributes. On every later request whose URL matches, it sends them back, all in a
	single <code>Cookie</code> header with only names and values:
</p>

<Code
	lang="http"
	title="Every later request"
	code={`GET /dashboard HTTP/2
host: app.example.com
cookie: __Host-sid=k3v9Qp…; theme=dark`}
	caption="The attributes never come back. The server cannot tell from the request how a cookie was scoped, or when it expires."
/>

<p>That asymmetry explains a lot: the server only ever learns a cookie’s value, so expiry, scope and flags are instructions to the browser, enforced by the browser.</p>

<h2>The attributes</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Attribute</th><th scope="col">Effect</th><th scope="col">If you leave it out</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Max-Age=N</code> / <code>Expires=date</code></th><td>Persist for N seconds, or until the date. <code>Max-Age</code> wins if both are present. <code>Max-Age=0</code> deletes</td><td>A <strong>session cookie</strong>: cleared when the browser session ends, which may be never if the browser restores sessions</td></tr>
			<tr><th scope="row"><code>Domain=example.com</code></th><td>Send to that domain <em>and every subdomain</em></td><td><strong>Host-only</strong>: sent only to the exact host that set it. This is the safer default</td></tr>
			<tr><th scope="row"><code>Path=/app</code></th><td>Send only for URLs under that path</td><td>Defaults to the directory of the request URL, which surprises people</td></tr>
			<tr><th scope="row"><code>Secure</code></th><td>Send only over HTTPS, and only HTTPS pages may set or overwrite it</td><td>Sent over plain HTTP too, readable by anyone on the network path</td></tr>
			<tr><th scope="row"><code>HttpOnly</code></th><td>Hidden from <code>document.cookie</code> and other script APIs</td><td>Any script on the page, including an injected one, can read and exfiltrate it</td></tr>
			<tr><th scope="row"><code>SameSite=Strict|Lax|None</code></th><td>Controls whether it is sent on requests that start from another site</td><td>Chrome and Edge treat it as <code>Lax</code>. Firefox and Safari still send it cross-site by default</td></tr>
			<tr><th scope="row"><code>Partitioned</code></th><td>An embedded third-party cookie gets a separate jar per top-level site (CHIPS)</td><td>One jar shared across every site that embeds you, where third-party cookies are allowed at all</td></tr>
		</tbody>
	</table>
</div>

<h3>Prefixes: rules the browser enforces for you</h3>
<p>
	Because the server never sees attributes, it cannot tell whether <code>sid</code> was set by your login handler or by a sibling subdomain with
	<code>Domain=example.com</code>. Cookie name prefixes close that gap: the browser rejects the cookie unless its attributes match.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Prefix</th><th scope="col">Browser only accepts it if</th><th scope="col">What it guarantees</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>__Secure-</code></th><td>It has <code>Secure</code> and was set from an HTTPS page</td><td>No plain-HTTP page or network attacker could have written it</td></tr>
			<tr><th scope="row"><code>__Host-</code></th><td>Also <code>Path=/</code> and <strong>no</strong> <code>Domain</code></td><td>It is host-only, so no other subdomain can set or shadow it</td></tr>
		</tbody>
	</table>
</div>

<p>Use <code>__Host-</code> for session cookies unless you genuinely need to share them across subdomains. All current browsers support both prefixes.</p>


<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'Which cookie attribute stops page JavaScript from reading the cookie through document.cookie?',
			options: ['Secure', 'HttpOnly', 'SameSite=Strict'],
			answer: 1,
			explain: 'HttpOnly hides the cookie from scripts. Secure only limits it to HTTPS, and SameSite controls cross-site sending.'
		}
	]}
/>

<h2>Same-site is not same-origin</h2>
<p>
	<code>SameSite</code> is about <strong>sites</strong>, which are coarser than origins. An <strong>origin</strong> is scheme + host + port. A
	<strong>site</strong> is the scheme plus the <em>registrable domain</em>: one label below a public suffix such as <code>.com</code> or
	<code>.co.uk</code>. The list of public suffixes is the community-maintained Public Suffix List, and it includes hosting platforms whose users
	must not share cookies.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Page</th><th scope="col">Request to</th><th scope="col">Same origin?</th><th scope="col">Same site?</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>https://app.example.com</code></th><td><code>https://api.example.com</code></td><td>No: different host</td><td>Yes: both under <code>example.com</code></td></tr>
			<tr><th scope="row"><code>https://example.com</code></th><td><code>https://example.com:8443</code></td><td>No: different port</td><td>Yes: ports are ignored</td></tr>
			<tr><th scope="row"><code>http://example.com</code></th><td><code>https://example.com</code></td><td>No: different scheme</td><td>No under the current “schemeful” definition, which Chrome applies to SameSite. Older definitions ignored the scheme</td></tr>
			<tr><th scope="row"><code>https://alice.github.io</code></th><td><code>https://bob.github.io</code></td><td>No</td><td>No: <code>github.io</code> is a public suffix</td></tr>
			<tr><th scope="row"><code>https://shop.com</code></th><td><code>https://pay-provider.com</code></td><td>No</td><td>No</td></tr>
		</tbody>
	</table>
</div>

<Note title="Same-site does not mean trusted" tone="warn">
	Every subdomain is same-site with every other. A forgotten marketing subdomain, or one taken over through a dangling DNS record, can send
	same-site requests carrying your <code>SameSite=Strict</code> cookies, and without the <code>__Host-</code> prefix it can also plant cookies of
	its own on the parent domain.
</Note>

<h2>SameSite: when cookies cross sites</h2>
<p>
	A <strong>cross-site request</strong> is one initiated by a page on another site: a link, a form submission, an <code>&lt;img&gt;</code>, an
	iframe or a <code>fetch</code>. <code>SameSite</code> decides which of those carry the cookie. Pick a value to see what it does:
</p>

<Choice
	codeLabels
	title="Pick a SameSite value"
	options={[
		{
			label: 'Strict',
			code: 'set-cookie: __Host-sid=…; Path=/; Secure; HttpOnly; SameSite=Strict',
			lang: 'http',
			body: 'Never sent on a request that starts from another site, not even when the user clicks a link to you. Someone following a link from email or chat lands on your site looking signed out until the next same-site request.',
			verdict: 'Use for: cookies that authorise state-changing actions, often paired with a Lax cookie for reading.'
		},
		{
			label: 'Lax',
			code: 'set-cookie: __Host-sid=…; Path=/; Secure; HttpOnly; SameSite=Lax',
			lang: 'http',
			body: 'Sent on top-level navigations with a safe method, like clicking a link (GET). Withheld from cross-site POST forms, iframes, images and fetch. This blocks the classic CSRF form post while keeping inbound links signed in.',
			verdict: 'Use for: most session cookies.'
		},
		{
			label: 'None',
			code: 'set-cookie: widget_sid=…; Secure; SameSite=None; Partitioned',
			lang: 'http',
			body: 'Sent on every request, including from pages on other sites, where the browser allows third-party cookies at all. Requires Secure. Your server now relies entirely on other CSRF defences.',
			verdict: 'Use for: embedded widgets and cross-site flows that genuinely need it, ideally Partitioned.'
		},
		{
			label: '(omitted)',
			code: 'set-cookie: sid=…; Path=/; Secure; HttpOnly',
			lang: 'http',
			body: 'Chrome and Edge treat it as Lax, with a two-minute exception that still sends brand-new cookies on top-level cross-site POSTs. Firefox and Safari do not default to Lax, so the cookie goes cross-site like None.',
			verdict: 'Use for: nothing. Always state the value you mean.'
		}
	]}
/>

<div class="table-wrap">
	<table>
		<caption>Is a cookie set by your site sent when a page on another site triggers the request?</caption>
		<thead><tr><th scope="col">Request from the other site</th><th scope="col">Strict</th><th scope="col">Lax</th><th scope="col">None</th></tr></thead>
		<tbody>
			<tr><th scope="row">User clicks a link to you (top-level GET)</th><td>No</td><td>Yes</td><td>Yes</td></tr>
			<tr><th scope="row">Form POST to you (top-level)</th><td>No</td><td>No</td><td>Yes</td></tr>
			<tr><th scope="row">Your page inside their iframe</th><td>No</td><td>No</td><td>Yes*</td></tr>
			<tr><th scope="row"><code>&lt;img&gt;</code>, <code>fetch()</code>, script to your URL</th><td>No</td><td>No</td><td>Yes*</td></tr>
		</tbody>
	</table>
</div>
<p>* Only where the browser allows third-party cookies, which Safari and Firefox block or partition by default.</p>

<h2>Sessions: what “signed in” means</h2>
<p>A server-side session splits the job: the browser holds a random, meaningless identifier, and the server holds everything else.</p>
<ol>
	<li>The user submits credentials over HTTPS.</li>
	<li>The server verifies them, generates a new random session ID, and stores <code>id → {'{'} userId, expiry, … {'}'}</code> in a session store: memory, Redis, or a database table.</li>
	<li>It responds with <code>Set-Cookie: __Host-sid=&lt;id&gt;; …</code> and usually a redirect.</li>
	<li>Every later request carries the cookie. Middleware looks up the ID, rejects it if missing or expired, and attaches the user to the request.</li>
	<li>Signing out deletes the record on the server and expires the cookie in the browser.</li>
</ol>

<Diagram
	name="cookies-sessions-sign-in"
	alt="Sequence diagram. The browser posts credentials to the app server, which checks the password, saves a new session ID with the user and expiry in the session store, and replies 303 with a __Host-sid cookie. Later requests carry the cookie; the server looks the ID up in the store and serves the user's page. Logging out deletes the ID from the store and expires the cookie."
	caption="The cookie only ever carries the ID. Who you are, and whether the session is still valid, lives in the store."
/>
<p>The ID itself must be unguessable. OWASP asks for at least 64 bits of entropy from a cryptographically secure generator; 256 bits costs nothing extra. Never derive it from a user ID, a timestamp or <code>Math.random()</code>.</p>

<h3>A session store in plain Node</h3>
<p>Frameworks wrap this, but the whole mechanism fits on one screen. This runs on Node 24 with no dependencies:</p>

<Code
	lang="js"
	title="server.js"
	code={`import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const SESSION_TTL = 8 * 60 * 60 * 1000;   // 8 hours, in ms
const sessions = new Map();               // id → { userId, expires }

function startSession(res, userId) {
  const id = randomBytes(32).toString('base64url');   // 256 random bits
  sessions.set(id, { userId, expires: Date.now() + SESSION_TTL });
  res.setHeader('Set-Cookie',
    \`__Host-sid=\${id}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=\${SESSION_TTL / 1000}\`);
}

function currentSession(req) {
  const id = cookies(req)['__Host-sid'];
  const session = id && sessions.get(id);
  if (!session) return null;
  if (session.expires < Date.now()) {      // the server decides, not the cookie
    sessions.delete(id);
    return null;
  }
  return { id, ...session };
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/login') {
    const form = new URLSearchParams(await body(req));
    const user = await checkPassword(form.get('email'), form.get('password'));
    if (!user) return send(res, 401, 'Wrong email or password');
    const old = currentSession(req);
    if (old) sessions.delete(old.id);      // never reuse a pre-login id
    startSession(res, user.id);
    return send(res, 303, '', { Location: '/' });
  }

  if (req.method === 'POST' && req.url === '/logout') {
    const session = currentSession(req);
    if (session) sessions.delete(session.id);   // kill it server-side
    res.setHeader('Set-Cookie', '__Host-sid=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
    return send(res, 303, '', { Location: '/' });
  }

  if (req.url === '/me') {
    const session = currentSession(req);
    if (!session) return send(res, 401, 'Not signed in');
    return send(res, 200, JSON.stringify({ userId: session.userId }), {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store'
    });
  }

  send(res, 404, 'Not found');
});

server.listen(3000);
// cookies(), body(), send() and checkPassword() are small helpers, omitted.`}
	caption="Tested end to end: sign-in returns 303 with the cookie, /me returns 200, a second sign-in invalidates the old ID, and /me returns 401 after logout."
/>

<p>Four details in there are the ones people miss:</p>
<ul>
	<li><strong>A fresh ID at sign-in.</strong> Reusing an ID that existed before authentication enables <strong>session fixation</strong>: an attacker plants a known ID in the victim’s browser, waits for them to sign in, then uses the same ID. Rotate the ID whenever privilege changes. In <code>express-session</code> that is <code>req.session.regenerate()</code>.</li>
	<li><strong>Server-side expiry.</strong> <code>Max-Age</code> is a request to the browser. An attacker who copied the cookie ignores it, so the store must enforce its own idle and absolute timeouts.</li>
	<li><strong>Server-side logout.</strong> Clearing only the cookie leaves the session valid for anyone holding a copy.</li>
	<li><strong><code>Cache-Control: private, no-store</code></strong> on per-user responses, so no shared cache hands one user’s data to the next. The caching article covers why.</li>
</ul>

<Note title="Developing on localhost">
	Chrome and Firefox treat <code>http://localhost</code> as a secure context and accept <code>Secure</code> and <code>__Host-</code> cookies
	there, so you can keep production attributes in development. Test in Safari over HTTPS before assuming the same.
</Note>


<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'With SameSite=Lax, is the cookie sent when someone follows a link from another site to yours (a top-level GET)?',
			options: ['Yes', 'No'],
			answer: 0,
			explain: 'Lax sends cookies on top-level navigations with safe methods like GET, and withholds them on cross-site subrequests.'
		}
	]}
/>

<h2>Server sessions or signed tokens?</h2>
<p>
	The alternative is a <strong>stateless</strong> session: put the claims themselves (user ID, expiry) in the cookie and add a MAC so the client
	cannot alter them. A JWT is one standard format for this. The server keeps no store, only a secret key.
</p>

<Code
	lang="js"
	title="signed-cookie.js"
	code={`import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.COOKIE_SECRET;   // long, random, kept on the server

function sign(value) {
  const mac = createHmac('sha256', SECRET).update(value).digest('base64url');
  return \`\${value}.\${mac}\`;
}

function verify(cookie) {
  const dot = cookie.lastIndexOf('.');
  if (dot < 0) return null;
  const value = cookie.slice(0, dot);
  const given = Buffer.from(cookie.slice(dot + 1));
  const expected = Buffer.from(createHmac('sha256', SECRET).update(value).digest('base64url'));
  // Compare in constant time, so the check leaks nothing through timing.
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return value;
}

const cookie = sign('u_1|1767225600');      // user id | expiry (Unix seconds)
verify(cookie);                             // "u_1|1767225600"
verify(cookie.replace('u_1', 'u_2'));       // null: tampered`}
	caption="Signing stops tampering, not reading. The value is still plain text in the browser, so never put secrets in it."
/>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col"></th><th scope="col">Server-side session</th><th scope="col">Signed token in a cookie</th></tr></thead>
		<tbody>
			<tr><th scope="row">Lookup per request</th><td>One store read (Redis is sub-millisecond)</td><td>None; one HMAC or signature check</td></tr>
			<tr><th scope="row">Revoke one session now</th><td>Delete the row</td><td>Not possible before expiry without adding a deny-list, which is a store again</td></tr>
			<tr><th scope="row">“Sign out everywhere”, password change</th><td>Delete the user’s rows</td><td>Rotate the key, which signs out everyone, or keep a per-user version</td></tr>
			<tr><th scope="row">Cookie size</th><td>About 43 characters for 256 bits</td><td>Grows with every claim; sent on every request</td></tr>
			<tr><th scope="row">Changing a user’s role</th><td>Takes effect on the next request</td><td>Stale until the token expires or is reissued</td></tr>
			<tr><th scope="row">Scaling out</th><td>Every server needs the shared store</td><td>Every server needs the key</td></tr>
		</tbody>
	</table>
</div>

<p>
	For a browser app talking to its own backend, server-side sessions are the simpler and safer default: revocation is the feature you will need on
	the worst day. Stateless tokens earn their place when many independent services must verify identity without a shared store, and even then
	they are usually short-lived and paired with a revocable refresh session.
</p>

<h2>Attacks and the defences that work</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Attack</th><th scope="col">How it works</th><th scope="col">Defences</th></tr></thead>
		<tbody>
			<tr><th scope="row">Theft by XSS</th><td>Injected script reads <code>document.cookie</code> and sends it away</td><td><code>HttpOnly</code>; output encoding; a Content Security Policy. Note that <code>HttpOnly</code> stops reading, not use: injected script can still make requests as the user</td></tr>
			<tr><th scope="row">Network sniffing</th><td>Cookie sent over plain HTTP on hostile Wi-Fi</td><td>HTTPS everywhere, <code>Secure</code>, and HSTS so the browser never tries HTTP</td></tr>
			<tr><th scope="row">CSRF</th><td>Another site makes the browser send an authenticated request, such as a form POST to <code>/transfer</code></td><td><code>SameSite=Lax</code> or <code>Strict</code>; a CSRF token or checking the <code>Origin</code> / <code>Sec-Fetch-Site</code> header on state-changing requests; never change state on GET</td></tr>
			<tr><th scope="row">Session fixation</th><td>Victim signs in with an ID the attacker already knows</td><td>New ID on every sign-in and privilege change; <code>__Host-</code> so subdomains cannot plant one</td></tr>
			<tr><th scope="row">Cookie tossing</th><td>A compromised subdomain sets <code>Domain=example.com</code> cookies that shadow yours</td><td><code>__Host-</code> prefix; don’t trust cookies you didn’t scope to the host</td></tr>
			<tr><th scope="row">Stolen cookie replay</th><td>Malware or a leaked log copies a valid cookie</td><td>Short idle timeouts, re-authentication for sensitive actions, server-side revocation</td></tr>
		</tbody>
	</table>
</div>

<Note title="SameSite is a layer, not the whole defence" tone="warn">
	Firefox and Safari don’t default to Lax, same-site subdomains bypass it entirely, and Lax still permits top-level GETs. Set it explicitly
	<em>and</em> keep a server-side CSRF check on any request that changes state.
</Note>

<h2>Third-party cookies today</h2>
<p>
	A cookie is <strong>third-party</strong> when it belongs to a site other than the one in the address bar, such as an embedded widget or ad.
	Browsers now disagree sharply:
</p>
<ul>
	<li><strong>Safari</strong> blocks them by default (Intelligent Tracking Prevention).</li>
	<li><strong>Firefox</strong> partitions them per top-level site by default (Total Cookie Protection), so an embed gets a separate jar on every site.</li>
	<li><strong>Chrome</strong> still allows them by default. Google abandoned its deprecation plan in 2024, and in April 2025 dropped the planned replacement prompt as well; they remain blocked in Incognito.</li>
</ul>
<p>
	The portable answer for embeds is <code>SameSite=None; Secure; Partitioned</code>, which behaves the same partitioned way everywhere it is
	supported: Chrome 114, Firefox 141 and Safari 26.2 onward. For sign-in across your own domains, prefer a top-level redirect flow such as OAuth or
	OpenID Connect over relying on third-party cookies.
</p>

<h2>Limits worth knowing</h2>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Limit</th><th scope="col">Value</th><th scope="col">Source</th></tr></thead>
		<tbody>
			<tr><th scope="row">Name plus value</th><td>4,096 bytes; larger cookies are ignored</td><td>RFC 6265bis</td></tr>
			<tr><th scope="row">One attribute value</th><td>1,024 bytes</td><td>RFC 6265bis</td></tr>
			<tr><th scope="row">Cookies per domain</th><td>At least 50 must be supported; browsers evict beyond their own cap</td><td>RFC 6265</td></tr>
			<tr><th scope="row">Lifetime</th><td>Capped at 400 days; longer values are clamped, not rejected. Enforced by Chrome since version 104</td><td>RFC 6265bis, Chrome</td></tr>
			<tr><th scope="row">Header size</th><td>All cookies ride on every matching request; many servers reject request headers over 8–16 KB</td><td>Server defaults</td></tr>
		</tbody>
	</table>
</div>

<h2>Common mistakes</h2>
<ul>
	<li><strong>Tokens in <code>localStorage</code>.</strong> Any script can read it, so one XSS bug leaks every session. An <code>HttpOnly</code> cookie is strictly harder to steal.</li>
	<li><strong><code>Domain=example.com</code> by habit.</strong> It widens the cookie to every subdomain, including ones run by other teams or vendors. Omit <code>Domain</code> unless you need it.</li>
	<li><strong>Relying on <code>Path</code> for security.</strong> Pages on the same origin can read each other’s cookies through the DOM, so <code>Path</code> is an organising tool, not an isolation boundary.</li>
	<li><strong>Deleting with the wrong attributes.</strong> A cookie is replaced only by one with the same name, domain and path. A logout that sets <code>sid=; Max-Age=0</code> with a different <code>Path</code> creates a second cookie and leaves the first.</li>
	<li><strong>Trusting cookie values.</strong> Anything in a cookie can be edited by the user. Unsigned <code>role=admin</code> is a privilege escalation waiting to happen.</li>
	<li><strong>Endless sessions.</strong> A session that never times out turns one stolen cookie into permanent access. Set an idle timeout and an absolute lifetime.</li>
</ul>

<h2>Inspecting cookies</h2>
<ol>
	<li>DevTools → <strong>Application</strong> (Chrome, Edge) or <strong>Storage</strong> (Firefox, Safari) → Cookies lists every cookie with its attributes.</li>
	<li>In the <strong>Network</strong> tab, open a request and choose its Cookies view. Chrome shows cookies that were blocked and the reason, such as a SameSite mismatch.</li>
	<li>Type <code>document.cookie</code> in the console. <code>HttpOnly</code> cookies are missing from the result, which is the point.</li>
</ol>

<h2>Recap</h2>
<ul>
	<li>The server sets cookies with <code>Set-Cookie</code>; the browser sends back names and values only, on every matching request.</li>
	<li>Session cookies should be <code>__Host-</code> prefixed, <code>Secure</code>, <code>HttpOnly</code> and <code>SameSite=Lax</code> or <code>Strict</code>.</li>
	<li>Sites are scheme plus registrable domain. All subdomains are same-site with each other, so SameSite doesn’t protect you from them.</li>
	<li>A session ID is a random handle to server-side state. Rotate it at sign-in, expire it on the server, and delete it at sign-out.</li>
	<li>Signed tokens remove the store but make revocation hard. Prefer server sessions for a browser app and its own backend.</li>
	<li>Third-party cookies are blocked in Safari, partitioned in Firefox and allowed in Chrome. <code>Partitioned</code> is the portable choice for embeds.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'A cookie is set with SameSite=Lax. A user on news.com clicks a link to your site. Is the cookie sent with that navigation?',
			options: ['Yes: it is a top-level GET navigation', 'No: the request is cross-site', 'Only if the cookie is Partitioned'],
			answer: 0,
			explain: 'Lax allows top-level navigations with safe methods such as GET. It withholds the cookie from cross-site POSTs and subresource requests.'
		},
		{
			prompt: 'Which attribute set does the __Host- prefix require?',
			options: ['Secure and HttpOnly', 'Secure, Path=/ and no Domain', 'SameSite=Strict and Secure'],
			answer: 1,
			explain: '__Host- requires Secure, Path=/ and no Domain, so the cookie is host-only and no subdomain can set or shadow it. HttpOnly is separate and still worth adding.'
		},
		{
			prompt: 'Are https://app.example.com and https://api.example.com the same site?',
			options: ['Yes, but they are different origins', 'No, and they are different origins', 'Yes, and they are the same origin'],
			answer: 0,
			explain: 'Both share the registrable domain example.com, so they are same-site. The hosts differ, so they are different origins.'
		},
		{
			prompt: 'Why must the server issue a new session ID when the user signs in?',
			options: ['To make the cookie smaller', 'To prevent session fixation with an ID the attacker already knows', 'Because Max-Age resets'],
			answer: 1,
			explain: 'If the pre-login ID survives, an attacker who planted it in the victim’s browser can ride the authenticated session.'
		},
		{
			prompt: 'An admin is demoted. With signed stateless session cookies, when does the old role stop working?',
			options: ['On the next request', 'When the token expires or is reissued, unless you add a deny-list', 'Immediately, because the signature changes'],
			answer: 1,
			explain: 'The token is self-contained and still validly signed, so it is trusted until it expires. Server-side sessions pick up the change on the next lookup.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://www.rfc-editor.org/rfc/rfc6265" rel="external">RFC 6265: HTTP State Management Mechanism</a></li>
	<li><a href="https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/" rel="external">draft-ietf-httpbis-rfc6265bis: the cookie spec’s revision (SameSite, prefixes, limits)</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" rel="external">MDN: Set-Cookie, with browser support tables</a></li>
	<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" rel="external">OWASP: Session Management Cheat Sheet</a></li>
	<li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" rel="external">OWASP: Cross-Site Request Forgery Prevention Cheat Sheet</a></li>
	<li><a href="https://web.dev/articles/samesite-cookies-explained" rel="external">web.dev: SameSite cookies explained</a></li>
	<li><a href="https://developer.chrome.com/blog/cookie-max-age-expires" rel="external">Chrome: the 400-day cookie lifetime cap</a></li>
	<li><a href="https://privacysandbox.com/news/privacy-sandbox-next-steps/" rel="external">Google: Next steps for Privacy Sandbox and tracking protections in Chrome (April 2025)</a></li>
</ul>
