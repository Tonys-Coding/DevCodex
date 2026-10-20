<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>The problem</h2>
<p>
	A calendar app wants to read your Google Calendar. The bad old way was to give it your Google password. Then it could do anything you can,
	forever, and the only way to stop it was to change your password everywhere. <strong>OAuth</strong> (OAuth 2.0, RFC 6749) fixes this with a
	<strong>token</strong>: a key that works for one app, only for what you approved, and can be revoked on its own.
</p>

<h2>The dance, step by step</h2>
<p>This is the <em>authorization code</em> flow, the one behind most “Sign in with…” and “Connect your account” buttons:</p>
<ol>
	<li><strong>The app sends you to the service.</strong> Not to its own form: your browser goes to Google’s real sign-in page, with a note saying which app is asking and what it wants (its <strong>scopes</strong>, such as “read your calendar”).</li>
	<li><strong>You sign in and approve, at the service.</strong> The app never sees your password. You see exactly what it asked for and can say no.</li>
	<li><strong>The service sends you back with a one-time code.</strong> Your browser returns to the app with a short-lived <em>authorization code</em> in the URL.</li>
	<li><strong>The app swaps the code for a token.</strong> Server to server, it trades the code for an <em>access token</em> (and often a <em>refresh token</em> to get new ones later).</li>
	<li><strong>The app uses the token.</strong> Each request to the calendar API carries it, and the API checks what the token allows.</li>
</ol>

<Code
	lang="http"
	code={`GET /calendar/v3/users/me/calendarList HTTP/1.1
Host: www.googleapis.com
Authorization: Bearer ya29.a0Af...   ← the access token, not a password`}
	caption="An API call with an access token. If it leaks, it expires soon and covers only the approved scopes."
/>

<h2>Why the extra code step?</h2>
<p>
	The code travels through your browser’s address bar, where it could be seen or stolen. So the code alone is worth little: it expires in moments
	and can only be used once. For apps that can’t keep a secret, such as phone and single-page apps, <strong>PKCE</strong> (RFC 7636) adds a
	check. The app invents a random secret, sends only its hash at the start, and reveals the secret when it swaps the code:
</p>

<Code
	lang="py"
	code={`import base64, hashlib, secrets

# 1. The app makes a random secret and keeps it to itself.
verifier = secrets.token_urlsafe(48)

# 2. It sends only a hash of the secret with the sign-in request.
digest = hashlib.sha256(verifier.encode()).digest()
challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()

print(len(verifier), len(challenge))   # 64 43
# 3. When it swaps the code for a token, it reveals the verifier.
#    The server hashes it again; only the app that started the sign-in can match.`}
/>

<Note title="Signing in is a layer on top" tone="plain">
	OAuth itself is about <em>permission</em>: what an app may do. “Sign in with Google” also needs to know <em>who you are</em>. That is
	<strong>OpenID Connect</strong>, which adds an ID token describing the user to the same flow.
</Note>

<h2>Next: AI agents with a key</h2>
<p>
	AI agents that book, buy and manage accounts for people face the same old problem: handing them your password is the wrong answer. On
	6 October 2026, Sierra and Meta proposed the <strong>Personal Agent Protocol</strong>, built on OAuth sessions. An agent starts as a guest for
	simple questions, and once the customer signs in, they choose whether it gets read-only or write access. The business sets what agents may do,
	and payments are planned as a later extension. A first draft specification was promised for later in the month.
</p>

<h2>Why it matters to you</h2>
<ul>
	<li>As a user: check what an app asks for on the approval screen, and remove old connections in your account’s security settings.</li>
	<li>As a developer: never ask for passwords to other services. Use the provider’s OAuth flow with PKCE, request the fewest scopes, and keep tokens out of logs and URLs.</li>
</ul>

<h2>Sources</h2>
<ul>
	<li><a href="https://datatracker.ietf.org/doc/html/rfc6749" rel="external">RFC 6749: The OAuth 2.0 Authorization Framework</a></li>
	<li><a href="https://datatracker.ietf.org/doc/html/rfc7636" rel="external">RFC 7636: Proof Key for Code Exchange (PKCE)</a></li>
	<li><a href="https://thenextweb.com/news/personal-agent-protocol-sierra-meta" rel="external">The Next Web: Sierra announces Personal Agent Protocol</a></li>
</ul>
