<script lang="ts">
	import StepFlow, { glyphs, type FlowStep, type FlowTile } from '../../components/teach/StepFlow.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Term from '../../components/teach/Term.svelte';
	import Diagram from '../../components/teach/Diagram.svelte';

	const tiles: FlowTile[] = [
		{ id: 'browser', label: 'Browser', x: 4, y: 12, icon: glyphs.browser },
		{ id: 'resolver', label: 'Resolver', x: 236, y: 12, icon: glyphs.resolver },
		{ id: 'server', label: 'Server', x: 236, y: 182, icon: glyphs.server },
		{ id: 'screen', label: 'Screen', x: 4, y: 182, icon: glyphs.screen }
	];

	const steps: FlowStep[] = [
		{
			label: 'Look up',
			title: 'Find the address',
			body: 'Your browser asks a DNS resolver, a kind of phone book usually run by your internet provider, “where does example.com live?”. It answers with a number called an IP address. Your computer remembers the answer for a while, so the next visit skips this step.',
			active: ['browser', 'resolver'],
			hop: { from: 'browser', to: 'resolver', message: 'example.com?' },
			wire: 'example.com  →  203.0.113.7'
		},
		{
			label: 'Connect',
			title: 'Open a private line',
			body: 'The browser calls that address and the two sides say hello. Then they agree on a secret code so nobody in between can read what they send, and the server shows an ID card, called a certificate, to prove it really is example.com. This exchange is called the TLS handshake.',
			active: ['browser', 'server'],
			hop: { from: 'browser', to: 'server', message: 'hello' },
			wire: 'hello → hello back → ready\nthen: agree on a secret code, check the ID card'
		},
		{
			label: 'Ask',
			title: 'Ask for the page',
			body: 'Now the browser sends a short message called a request. It says what it wants (GET means “please give me”), which page (/ means the home page) and a few notes about what it can handle.',
			active: ['browser', 'server'],
			hop: { from: 'browser', to: 'server', message: 'GET /' },
			wire: 'GET / HTTP/2\nhost: example.com\naccept: text/html'
		},
		{
			label: 'Answer',
			title: 'The server replies',
			body: 'The server sends back a response. It starts with a three-digit status code, where 200 means “here you go”, and then the page itself, written in HTML. The HTML mentions other files the page needs, like pictures and styles.',
			active: ['server', 'browser'],
			hop: { from: 'server', to: 'browser', message: '200 OK' },
			wire: 'HTTP/2 200\ncontent-type: text/html\n\n<!doctype html>…'
		},
		{
			label: 'Draw',
			title: 'Turn the reply into a page',
			body: 'The browser reads the HTML, fetches the extra files it mentions, works out where every heading, picture and button goes, and finally colours in the pixels on your screen.',
			active: ['browser', 'screen'],
			hop: { from: 'browser', to: 'screen', message: 'pixels' },
			wire: 'read → style → place → paint'
		}
	];
	import Layer from '../../components/teach/Layer.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
</script>

<p>
	A website address like <code>example.com</code> is made for people to remember. Computers on the internet don’t use names, though. They find
	each other by number, a bit like phone numbers. So before your browser can show you anything, it has to translate the name, call the right
	computer, ask for the page, and then draw what comes back.
</p>
<p>In this article you will learn:</p>
<ul>
	<li>the five steps between pressing Enter and seeing a page,</li>
	<li>what the messages between your browser and a website actually say,</li>
	<li>what codes like <strong>404</strong> mean, and</li>
	<li>how to tell which step went wrong when a page won’t load.</li>
</ul>

<h2>Words you will meet</h2>
<dl>
	<div>
		<dt>Browser</dt>
		<dd>The app you use to visit websites: Safari, Chrome, Firefox or Edge.</dd>
	</div>
	<div>
		<dt>Server</dt>
		<dd>A computer, often in a big building full of computers, whose job is to hand out a website’s files to anyone who asks.</dd>
	</div>
	<div>
		<dt>IP address</dt>
		<dd>The number that identifies a computer on the internet, such as <code>203.0.113.7</code>. It works like a phone number.</dd>
	</div>
	<div>
		<dt>DNS</dt>
		<dd>The Domain Name System: the internet’s phone book, which turns names like <code>example.com</code> into IP addresses.</dd>
	</div>
	<div>
		<dt>HTTP and HTTPS</dt>
		<dd>The agreed format for “asking for a page” and “sending a page back”. The S stands for secure: the messages are scrambled so only the two ends can read them.</dd>
	</div>
	<div>
		<dt>HTML</dt>
		<dd>The text format web pages are written in. It says what is on the page: headings, paragraphs, pictures and links.</dd>
	</div>
</dl>

<h2>The journey, step by step</h2>
<p>Press the buttons under the diagram to move through it. Each step lights up the machines that are talking and shows what they send.</p>

<StepFlow title="The path a page travels" {tiles} {steps} />

<p>If it helps, picture visiting a friend you have never visited before:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Step</th><th scope="col">What the browser does</th><th scope="col">Like…</th></tr></thead>
		<tbody>
			<tr><th scope="row">1. Look up</th><td>Asks DNS for the site’s IP address</td><td>Finding your friend’s address in your contacts</td></tr>
			<tr><th scope="row">2. Connect</th><td>Opens a private, checked line to the server</td><td>Ringing the doorbell and checking it’s really them who answers</td></tr>
			<tr><th scope="row">3. Ask</th><td>Sends a request for the page</td><td>“Could I borrow your recipe book?”</td></tr>
			<tr><th scope="row">4. Answer</th><td>Gets a status code and the page’s HTML</td><td>“Sure, here it is”, or “Sorry, I don’t have that one”</td></tr>
			<tr><th scope="row">5. Draw</th><td>Builds the page and paints it on screen</td><td>Following the recipe to make the dish</td></tr>
		</tbody>
	</table>
</div>


<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'Which step turns example.com into a number like 203.0.113.7?',
			options: ['Connect', 'Look up, using DNS', 'Draw'],
			answer: 1,
			explain: 'DNS is the internet’s phone book: the browser asks a resolver, and it answers with the IP address.'
		}
	]}
/>

<h2>What the messages actually say</h2>
<p>
	The request and the reply are plain, readable text. Here is roughly what your <Term def="The app you use to visit websites: Safari, Chrome, Firefox or Edge.">browser</Term> sends when it asks for the home page of
	<code>example.com</code>:
</p>

<Code
	lang="http"
	title="The request"
	code={`GET / HTTP/2
host: example.com
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) …
accept: text/html
accept-language: en-US`}
/>

<p>Line by line:</p>
<ul>
	<li><code>GET</code> is the <strong>method</strong>: what the browser wants to do. GET means “give me”. Sending a form usually uses POST, which means “take this”.</li>
	<li><code>/</code> is the <strong>path</strong>: which page. A slash on its own means the home page. <code>/about</code> would be the about page.</li>
	<li><code>HTTP/2</code> is the <strong>version</strong> of the format being used.</li>
	<li>Every line after that is a <strong>header</strong>: a short note in the form <code>name: value</code>. Here the browser says which site it wants, which browser it is, and that it would like <Term def="The text format web pages are written in. It says what is on the page: headings, paragraphs, pictures and links.">HTML</Term> in US English.</li>
</ul>

<p>And here is the kind of reply that comes back:</p>

<Code
	lang="http"
	title="The response"
	code={`HTTP/2 200
content-type: text/html; charset=utf-8
content-length: 312

<!doctype html>
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <h1>Hello!</h1>
    <img src="/cat.jpg" alt="A sleeping cat">
  </body>
</html>`}
	caption="The first line holds the status code. The headers come next, then a blank line, then the page itself."
/>

<Note title="Being precise" tone="plain">
	Developer tools show messages in this tidy text form. With HTTP/2 and the newer HTTP/3, the browser actually packs the same information into a
	compact binary form before sending it, but what it says is exactly the same.
</Note>

<h3>One page, many requests</h3>
<p>Look at the HTML above. It mentions two more files: a stylesheet and a picture. The browser has to fetch those too:</p>
<ol>
	<li>The HTML arrives first. The browser starts reading it from the top.</li>
	<li>It spots <code>/style.css</code> and <code>/cat.jpg</code> and sends a request for each, often at the same time.</li>
	<li>Those requests reuse the address it already looked up and the line it already opened, so they skip steps 1 and 2.</li>
	<li>Once the styles arrive, the browser can work out how everything should look and draw the page.</li>
</ol>
<p>Here is the whole visit as a timeline, from the first question to the finished page. Time runs downwards, and dashed arrows are replies.</p>

<Diagram
	name="load-a-page-sequence"
	alt="A timeline between the browser, a DNS resolver and the example.com server: the browser asks DNS for the address, opens a connection and a TLS handshake with the server, requests the page, receives the HTML, requests the style sheet and image, receives them, then draws the page."
	caption="Steps 8 and 9 reuse the address and the connection from steps 1 to 5."
/>

<p>A typical modern page needs dozens of these extra files: styles, scripts, fonts and images. Each one is its own small request and reply.</p>

<h2>Status codes: the server’s one-number answer</h2>
<p>
	The three-digit number at the start of every reply sums up what happened. The first digit tells you the family, so even codes you have never
	seen are easy to place.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Family</th><th scope="col">Meaning</th><th scope="col">Common examples</th></tr></thead>
		<tbody>
			<tr><th scope="row">2xx</th><td>It worked</td><td><code>200 OK</code>: here is what you asked for</td></tr>
			<tr><th scope="row">3xx</th><td>Look somewhere else</td><td><code>301 Moved Permanently</code>: this page has a new address<br /><code>304 Not Modified</code>: the copy you already have is still good</td></tr>
			<tr><th scope="row">4xx</th><td>The request has a problem</td><td><code>403 Forbidden</code>: you are not allowed to see this<br /><code>404 Not Found</code>: nothing lives at that path</td></tr>
			<tr><th scope="row">5xx</th><td>The server has a problem</td><td><code>500 Internal Server Error</code>: something broke on the server<br /><code>503 Service Unavailable</code>: too busy or down for maintenance</td></tr>
		</tbody>
	</table>
</div>

<p>An easy way to remember it: 4xx means “you asked wrong”, 5xx means “we messed up”.</p>

<h2>How the page gets drawn</h2>
<p>The last step has smaller steps of its own. Browsers always do them in the same order:</p>
<ol>
	<li><strong>Read.</strong> The HTML is turned into a family tree of the page’s parts, called the DOM: the <code>body</code> holds a heading and a picture, and so on. Developers call this step <strong>parsing</strong>.</li>
	<li><strong>Style.</strong> The browser matches the CSS rules to each part: this heading is big and orange, that paragraph is grey.</li>
	<li><strong>Place.</strong> It works out the exact size and position of every box on the page. Developers call this <strong>layout</strong>.</li>
	<li><strong>Paint.</strong> It fills in the actual pixels: text, colours, borders and images.</li>
</ol>
<p>
	If a page changes after it has loaded, for example a menu opens, the browser repeats only the steps it needs to. Moving something around means
	placing and painting again. Just changing a colour can skip the placing.
</p>


<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'Which drawing step works out where every box on the page goes?',
			options: ['Read', 'Place (layout)', 'Paint'],
			answer: 1,
			explain: 'Placing, also called layout, works out the size and position of every box. Painting fills in the pixels afterwards.'
		}
	]}
/>

<h2>Why the second visit is faster</h2>
<p>Almost every step has a way to be skipped next time. Your browser and computer keep notes:</p>
<ul>
	<li><strong>The address is remembered.</strong> The <Term def="The Domain Name System: the internet’s phone book, which turns names like example.com into IP addresses.">DNS</Term> answer is kept for a set time, so the look-up is skipped.</li>
	<li><strong>The line stays open.</strong> The connection can be reused for more requests instead of saying hello all over again.</li>
	<li><strong>Files are kept.</strong> Pictures, styles and scripts are saved on your device, and the browser can check “has this changed?” instead of downloading it again. This is called <strong>caching</strong>, and it has its own article.</li>
</ul>
<p>Most of what makes the web feel fast is simply not doing work twice.</p>

<h2>When a page won’t load</h2>
<p>Because the steps always happen in the same order, the error you see tells you how far the browser got:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">What you see</th><th scope="col">Where it stopped</th><th scope="col">What it usually means</th></tr></thead>
		<tbody>
			<tr><th scope="row">“This site can’t be reached” (Chrome) or “Safari can’t find the server”</th><td>1. Look up</td><td>The name is misspelled, the site no longer exists, or you are offline</td></tr>
			<tr><th scope="row">“Your connection is not private”</th><td>2. Connect</td><td>The server’s ID card (certificate) is expired or doesn’t match the name. Don’t click past this on a site you don’t control</td></tr>
			<tr><th scope="row">A page saying 404</th><td>4. Answer</td><td>The server is fine, but nothing is at that path. Check the link</td></tr>
			<tr><th scope="row">A page saying 500 or 503</th><td>4. Answer</td><td>The server itself is having trouble. Waiting and retrying is all you can do</td></tr>
			<tr><th scope="row">A page with missing pictures or no styling</th><td>5. Draw</td><td>The HTML arrived but some extra files failed to load</td></tr>
		</tbody>
	</table>
</div>

<Note title="Try it yourself">
	<p>You can watch all of this happen on a computer:</p>
	<ul>
		<li><strong>Chrome or Edge:</strong> press <code>Cmd + Option + I</code> on a Mac or <code>Ctrl + Shift + I</code> on Windows.</li>
		<li><strong>Safari:</strong> first turn on Settings → Advanced → “Show features for web developers”, then press <code>Cmd + Option + I</code>.</li>
	</ul>
	<p>
		Open the <strong>Network</strong> tab and reload the page. Every row is one request. Click one and look at its timing: you will see the
		same phases from this article, named things like DNS lookup, initial connection, waiting for the <Term def="A computer, often in a big building full of computers, whose job is to hand out a website’s files to anyone who asks.">server</Term>, and download.
	</p>
</Note>

<h2>Recap</h2>
<ol>
	<li><strong>Look up:</strong> DNS turns the name into an <Term def="The number that identifies a computer on the internet, such as 203.0.113.7. It works like a phone number.">IP address</Term>.</li>
	<li><strong>Connect:</strong> the browser opens a connection and, for <Term def="The agreed format for “asking for a page” and “sending a page back”. The S stands for secure: the messages are scrambled so only the two ends can read them.">HTTPS</Term>, agrees on secret codes (encryption keys) and checks the server’s certificate. This exchange is called the <strong>TLS handshake</strong>.</li>
	<li><strong>Ask:</strong> it sends a request with a method, a path, a version and headers.</li>
	<li><strong>Answer:</strong> the server replies with a status code, headers and the page.</li>
	<li><strong>Draw:</strong> the browser reads, styles, places and paints, fetching any extra files the page needs.</li>
</ol>

<Quiz
	questions={[
		{
			prompt: 'A page shows “404 Not Found”. Which step had the problem?',
			options: ['Look up: the name could not be found', 'Connect: the private line failed', 'Answer: the server replied, but had nothing at that path'],
			answer: 2,
			explain: 'A 404 is a real reply from the server, so the look-up, the connection and the request all worked. The path just didn’t match anything.'
		},
		{
			prompt: 'Which step lets your browser trust it is really talking to example.com?',
			options: ['Look up', 'Connect, when the server shows its certificate', 'Draw'],
			answer: 1,
			explain: 'While connecting securely, the server proves who it is with a certificate signed by an organisation your device already trusts.'
		},
		{
			prompt: 'In “GET /about HTTP/2”, which part is the path?',
			options: ['GET', '/about', 'HTTP/2'],
			answer: 1,
			explain: 'GET is the method (what to do), /about is the path (which page) and HTTP/2 is the version.'
		},
		{
			prompt: 'A site shows a 503 error. Whose side is the problem on?',
			options: ['Yours: you typed the address wrong', 'The server’s: it is overloaded or down'],
			answer: 1,
			explain: 'Codes starting with 5 mean the server had the problem. Codes starting with 4 point at the request.'
		},
		{
			prompt: 'Put the drawing steps in order.',
			options: ['Paint, read, place', 'Read, place, paint', 'Place, paint, read'],
			answer: 1,
			explain: 'The browser has to read the HTML before it knows what exists, and has to place every box before it can paint it.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Round trips, HTTP/1.1 versus HTTP/2 and HTTP/3, what blocks the first paint, and measuring a real page load with Navigation Timing.">
<h2>Connections, round trip by round trip</h2>
<p>
	A <strong>round trip</strong> (RTT) is the time for a message to reach the server and a reply to come back: a few milliseconds nearby, 100 ms or
	more across an ocean. Before a browser can send its first request on a new connection, it spends whole round trips just setting up.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Step</th><th scope="col">Messages</th><th scope="col">Round trips before the request</th></tr></thead>
		<tbody>
			<tr><th scope="row">TCP handshake</th><td><code>SYN</code> → <code>SYN-ACK</code> → <code>ACK</code></td><td>1</td></tr>
			<tr><th scope="row">TLS 1.3 handshake</th><td><code>ClientHello</code> → <code>ServerHello</code> … <code>Finished</code></td><td>1 more (TLS 1.2 needed 2)</td></tr>
			<tr><th scope="row">HTTP request</th><td><code>GET /</code> → response</td><td>The request finally goes out</td></tr>
		</tbody>
	</table>
</div>

<p>
	So a fresh HTTPS connection over TCP and TLS 1.3 costs two round trips before the first byte of the request is sent. At 80 ms per round trip
	that is 160 ms of pure waiting, which is why browsers keep connections open and reuse them for every file from the same host.
</p>

<h2>HTTP/1.1, HTTP/2 and HTTP/3</h2>
<p>The messages mean the same thing in every version. What changed is how they travel.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Version</th><th scope="col">Runs on</th><th scope="col">Requests per connection</th><th scope="col">Main improvement</th></tr></thead>
		<tbody>
			<tr><th scope="row">HTTP/1.1</th><td>TCP</td><td>One at a time</td><td>Keep-alive: reuse a connection. Browsers open about six per host to download in parallel</td></tr>
			<tr><th scope="row">HTTP/2</th><td>TCP</td><td>Many at once, as interleaved streams</td><td>Binary framing, multiplexing and header compression (HPACK) on a single connection</td></tr>
			<tr><th scope="row">HTTP/3</th><td>QUIC, over UDP</td><td>Many at once, independent streams</td><td>A lost packet stalls only its own stream, and connection plus encryption set-up takes one round trip</td></tr>
		</tbody>
	</table>
</div>

<p>
	A browser learns that a server speaks HTTP/3 from an <code>Alt-Svc</code> response header or from an HTTPS record in DNS, then tries it on later
	connections. In DevTools, right-click the Network table’s column headers and turn on <strong>Protocol</strong> to see <code>h2</code> or
	<code>h3</code> for each request.
</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'A brand-new HTTPS connection uses TCP and TLS 1.3. How many round trips pass before the first request byte is sent?',
			options: ['One', 'Two', 'Three'],
			answer: 1,
			explain: 'One for the TCP handshake and one for TLS 1.3. With TLS 1.2 it was three.'
		}
	]}
/>

<h2>The critical rendering path</h2>
<p>The Core said the browser reads, styles, places and paints. In practice those steps overlap, and some files hold everything up:</p>
<ol>
	<li><strong>HTML is parsed</strong> into the DOM as it streams in. A <strong>preload scanner</strong> races ahead to start downloading files the HTML mentions.</li>
	<li><strong>CSS is render-blocking.</strong> Nothing is painted until the stylesheets in the <code>&lt;head&gt;</code> have arrived and been parsed into the CSSOM.</li>
	<li><strong>Classic scripts are parser-blocking.</strong> A plain <code>&lt;script src&gt;</code> stops HTML parsing until it has downloaded and run.</li>
	<li>Style, layout and paint run once the DOM and CSSOM are ready enough, and the first content appears.</li>
</ol>

<Code
	lang="text"
	title="Three ways to load a script"
	code={`\x3Cscript src="app.js">\x3C/script>        <!-- stops parsing until downloaded and run -->
\x3Cscript src="app.js" defer>\x3C/script>  <!-- downloads alongside, runs after parsing, in order -->
\x3Cscript src="app.js" async>\x3C/script>  <!-- downloads alongside, runs as soon as it arrives -->`}
	caption="defer suits most app code; async suits independent scripts such as analytics."
/>

<h2>Measuring a real page load</h2>
<p>Every phase from the Core is recorded by the browser. The Navigation Timing API exposes them to your own code:</p>

<Code
	lang="js"
	run={false}
	code={`const [nav] = performance.getEntriesByType("navigation");
console.table({
  dns: nav.domainLookupEnd - nav.domainLookupStart,
  connect: nav.connectEnd - nav.connectStart,              // includes TLS
  tls: nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : 0,
  waiting: nav.responseStart - nav.requestStart,           // time to first byte
  download: nav.responseEnd - nav.responseStart,
});`}
	caption="Run it in the console on any page. Times are in milliseconds; a reused connection shows 0 for DNS and connect."
/>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'Which script tag downloads alongside parsing and runs only after the HTML is parsed, in order?',
			options: ['<script src>', '<script src defer>', '<script src async>'],
			answer: 1,
			explain: 'defer keeps document order and waits for parsing to finish. async runs whenever it arrives.'
		}
	]}
/>
</Layer>

<Layer depth="hood" summary="DNS from the stub resolver to authoritative servers, the TLS 1.3 handshake message by message, 0-RTT, and why HTTP/3 moved to QUIC.">
<h2>DNS, all the way down</h2>
<p>The Core’s “phone book” is really a chain of servers, each knowing where to ask next:</p>
<ol>
	<li>Your operating system’s <strong>stub resolver</strong> checks its cache, then asks a <strong>recursive resolver</strong> (your ISP’s, or a public one such as 1.1.1.1 or 8.8.8.8).</li>
	<li>On a cache miss, the recursive resolver asks a <strong>root server</strong>, which points it at the servers for <code>.com</code>.</li>
	<li>The <strong>TLD servers</strong> for <code>.com</code> point it at the domain’s <strong>authoritative servers</strong>.</li>
	<li>The authoritative server answers with the records, each carrying a <strong>TTL</strong>: how many seconds everyone may cache the answer.</li>
</ol>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Record</th><th scope="col">Holds</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>A</code> / <code>AAAA</code></th><td>An IPv4 / IPv6 address</td></tr>
			<tr><th scope="row"><code>CNAME</code></th><td>“This name is an alias for that name”</td></tr>
			<tr><th scope="row"><code>HTTPS</code></th><td>Connection hints, such as which HTTP versions the server supports</td></tr>
		</tbody>
	</table>
</div>

<p>
	There are 13 named root server identities, <code>a</code> to <code>m</code>, but each is anycast from many sites worldwide, so “the root” is
	hundreds of machines. Classic DNS travels unencrypted over UDP port 53; DNS over HTTPS and DNS over TLS encrypt the questions.
</p>

<h2>Inside the TLS 1.3 handshake</h2>
<ol>
	<li><strong>ClientHello</strong>: the cipher suites the browser supports, a key share (for example X25519), and the hostname it wants, in the <strong>SNI</strong> field.</li>
	<li><strong>ServerHello</strong>: the server’s chosen cipher and key share. Both sides can now derive the same secret keys, and everything after this is encrypted.</li>
	<li>The server sends its <strong>certificate</strong> chain, a <strong>CertificateVerify</strong> signature proving it holds the certificate’s private key, and <strong>Finished</strong>.</li>
	<li>The browser checks the chain up to a root it trusts, that the certificate covers the hostname and is in date, then sends its own <strong>Finished</strong>, together with the first request.</li>
</ol>
<p>
	On a return visit, a pre-shared key from the last session allows <strong>0-RTT</strong>: the request rides along with the very first message.
	The catch is that 0-RTT data can be replayed by an attacker, so servers should only accept it for requests that are safe to repeat. The SNI
	hostname in step 1 is still sent in the clear; <strong>Encrypted Client Hello</strong> (ECH) hides it where both browser and server support it.
</p>

<h2>QUIC: why HTTP/3 left TCP</h2>
<ul>
	<li><strong>Head-of-line blocking.</strong> TCP delivers bytes strictly in order, so one lost packet stalls every HTTP/2 stream sharing the connection. QUIC streams are independent: a loss stalls only its own stream.</li>
	<li><strong>Faster set-up.</strong> QUIC folds the transport and TLS 1.3 handshakes into one, so a new connection costs one round trip, and resumption can be 0-RTT.</li>
	<li><strong>Connection migration.</strong> A QUIC connection is identified by a connection ID, not by IP address and port, so it can survive a switch from Wi-Fi to mobile data.</li>
	<li><strong>Built on UDP</strong>, so it can be deployed without changing operating systems or middleboxes that only understand TCP.</li>
</ul>

<h2>Recap: the whole trip</h2>
<ol>
	<li>DNS resolves through stub, recursive, root, TLD and authoritative servers, cached by TTL at every step.</li>
	<li>TCP plus TLS 1.3 costs two round trips before a request; QUIC costs one.</li>
	<li>HTTP/2 multiplexes on one TCP connection; HTTP/3 moves to QUIC to avoid TCP head-of-line blocking.</li>
	<li>CSS blocks rendering and classic scripts block parsing; <code>defer</code> and <code>async</code> change that.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Which server finally answers with the record for example.com?',
			options: ['A root server', 'The .com TLD server', 'The domain’s authoritative server'],
			answer: 2,
			explain: 'Roots point to TLD servers, TLD servers point to the authoritative servers, and those hold the actual records.'
		},
		{
			prompt: 'In TLS 1.3, from which point is the handshake encrypted?',
			options: ['From the ClientHello', 'After the ServerHello', 'Only after both Finished messages'],
			answer: 1,
			explain: 'Once both key shares are exchanged, the rest, including the certificate, is encrypted.'
		},
		{
			prompt: 'Why is 0-RTT data only safe for some requests?',
			options: ['It is not encrypted', 'An attacker can replay it', 'It skips certificate checks'],
			answer: 1,
			explain: '0-RTT data is encrypted but replayable, so it should only carry requests that are safe to repeat.'
		},
		{
			prompt: 'An HTTP/2 connection loses one packet. What stalls?',
			options: ['Only the stream that packet belonged to', 'Every stream on that TCP connection'],
			answer: 1,
			explain: 'TCP delivers in order, so a gap blocks everything after it. HTTP/3 over QUIC avoids that.'
		},
		{
			prompt: 'What lets a QUIC connection survive moving from Wi-Fi to mobile data?',
			options: ['Its connection ID', 'A longer TTL', 'TCP keep-alive'],
			answer: 0,
			explain: 'QUIC identifies the connection by an ID rather than by IP address and port, so it can migrate.'
		}
	]}
/>

<h2>Sources and further reading</h2>
<ul>
	<li><a href="https://www.rfc-editor.org/rfc/rfc9293" rel="external">RFC 9293: Transmission Control Protocol</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc8446" rel="external">RFC 8446: TLS 1.3</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc9113" rel="external">RFC 9113: HTTP/2</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc9000" rel="external">RFC 9000: QUIC</a> and <a href="https://www.rfc-editor.org/rfc/rfc9114" rel="external">RFC 9114: HTTP/3</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path" rel="external">MDN: Critical rendering path</a></li>
</ul>
</Layer>
