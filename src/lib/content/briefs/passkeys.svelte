<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What’s wrong with passwords</h2>
<p>
	A password is a shared secret: you know it, and the site keeps something derived from it. That causes three problems. People reuse passwords, so
	one leak opens many accounts. A convincing fake login page can simply ask for it. And a database breach hands attackers material they can crack
	offline. Passkeys remove the shared secret altogether.
</p>

<h2>Two keys instead of one secret</h2>
<p>
	A passkey is a <strong>key pair</strong>: two linked keys, made by your device for one site.
</p>
<ul>
	<li>The <strong>private key</strong> never leaves your device or your password manager. It is used to sign things.</li>
	<li>The <strong>public key</strong> goes to the site. It can check a signature, but it can’t make one.</li>
</ul>
<p>So the site stores nothing worth stealing. A breach leaks public keys, which are, as the name says, safe to be public.</p>

<h2>Signing in, step by step</h2>
<ol>
	<li><strong>The site sends a challenge:</strong> a long random value, new every time.</li>
	<li><strong>You unlock your device</strong> with a fingerprint, your face or a PIN. That unlock stays on the device; the site never sees your fingerprint.</li>
	<li><strong>Your device signs the challenge</strong> with the private key for that site, and sends back the signature.</li>
	<li><strong>The site checks the signature</strong> with the public key it saved when you created the passkey. If it matches, you are in.</li>
</ol>
<p>
	Because each challenge is fresh, a recorded signature is useless later. And after this check, the site usually sets a session cookie, exactly as it
	would after a password.
</p>

<h2>Why phishing stops working</h2>
<p>
	Each passkey is tied to the site’s domain when it is created. The browser will only offer it to that exact site, and it includes the real origin in
	what gets signed. A look-alike page at <code>examp1e.com</code> can’t ask for the <code>example.com</code> passkey, and there is no password for you
	to type into it by mistake.
</p>

<h2>What it looks like in code</h2>
<p>Browsers expose passkeys through the Web Authentication API. Signing in is one call; the browser handles the prompt and the device:</p>

<Code
	lang="js"
	run={false}
	code={`const assertion = await navigator.credentials.get({
  publicKey: {
    challenge,              // random bytes from your server
    rpId: "example.com",    // the site the passkey belongs to
    userVerification: "preferred"
  }
});
// Send assertion.response (signature and signed data) to the server to verify.`}
	caption="Verifying the signature happens on the server, usually with a WebAuthn library rather than by hand."
/>

<Note title="Lost your phone?" tone="plain">
	Most passkeys today are <strong>synced</strong>: iCloud Keychain, Google Password Manager and other password managers copy them, end-to-end
	encrypted, to your other devices. You can also sign in on a new computer by scanning a QR code with your phone, which proves it is nearby over
	Bluetooth.
</Note>

<h2>Why it matters to you</h2>
<ul>
	<li>As a user: turn passkeys on wherever they are offered. They are faster than a password and phishing-proof.</li>
	<li>As a developer: offering passkeys means one fewer secret to protect. Keep a recovery path, because not every user has synced devices yet.</li>
</ul>

<h2>Sources</h2>
<ul>
	<li><a href="https://www.w3.org/TR/webauthn-3/" rel="external">W3C: Web Authentication, Level 3</a></li>
	<li><a href="https://passkeys.dev/docs/intro/what-are-passkeys/" rel="external">passkeys.dev: What are passkeys?</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API" rel="external">MDN: Web Authentication API</a></li>
</ul>
