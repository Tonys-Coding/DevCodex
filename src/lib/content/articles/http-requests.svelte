<script lang="ts">
	import Term from '../../components/teach/Term.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import HttpRequestLab from '../../components/teach/HttpRequestLab.svelte';
</script>

<p>When you open a website, your browser often needs something from somewhere else: a page, a profile picture or a list of messages. A web app also sends things, such as a new comment. Most of these exchanges use HTTP, a shared set of rules for how a client and a server talk.</p>

<p>Your browser or app is the client. It sends a request saying what it wants, and the server sends back a response describing the result. Even a failed response tells you something about why, so reading these messages lets you build and debug web apps without guessing.</p>

<p>In this lesson you will learn:</p>

<ul>
	<li>the parts of a URL, and which of them reach the server,</li>
	<li>the parts of an HTTP request and response,</li>
	<li>which method to use for reading and for changing data,</li>
	<li>what the common headers and status codes mean, and</li>
	<li>how to make a request in code and watch real ones in your browser.</li>
</ul>

<h2>Words you will meet</h2>

<dl>
	<div>
		<dt>URL</dt>
		<dd>A web address: it names a resource and says how to reach it.</dd>
	</div>
	<div>
		<dt>HTTP request</dt>
		<dd>A message from a client asking a server to perform an action.</dd>
	</div>
	<div>
		<dt>HTTP response</dt>
		<dd>A message from a server reporting the result of a request.</dd>
	</div>
	<div>
		<dt>Method</dt>
		<dd>The part of a request that states the intended action.</dd>
	</div>
	<div>
		<dt>Header</dt>
		<dd>A named field carrying extra information about a message.</dd>
	</div>
	<div>
		<dt>Body</dt>
		<dd>The content carried by a request or response, when there is any.</dd>
	</div>
	<div>
		<dt>Status code</dt>
		<dd>A three-digit number reporting the result of an HTTP request.</dd>
	</div>
	<div>
		<dt>JSON</dt>
		<dd>A text format commonly used to exchange structured data.</dd>
	</div>
</dl>

<h2>The parts of a URL</h2>

<p>A <strong><Term def="A web address: it names a resource and says how to reach it.">URL</Term></strong> packs several pieces of information into one line. Take this address for a reading-list app:</p>

<Code lang="text" code={`https://books.example.test:8443/books?sort=title&page=2#reviews`} />

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Part</th><th scope="col">Here</th><th scope="col">What it does</th></tr></thead>
		<tbody>
			<tr><th scope="row">Scheme</th><td><code>https</code></td><td>Which protocol to use: HTTP over an encrypted connection</td></tr>
			<tr><th scope="row">Host</th><td><code>books.example.test</code></td><td>Which server to contact</td></tr>
			<tr><th scope="row">Port</th><td><code>8443</code></td><td>Which door on that server; left out, <code>https</code> uses 443 and <code>http</code> uses 80</td></tr>
			<tr><th scope="row">Path</th><td><code>/books</code></td><td>Which resource on the server</td></tr>
			<tr><th scope="row">Query</th><td><code>sort=title&amp;page=2</code></td><td>Extra details after the <code>?</code>, usually <code>name=value</code> pairs joined by <code>&amp;</code></td></tr>
			<tr><th scope="row">Fragment</th><td><code>reviews</code></td><td>A spot inside the page, after the <code>#</code></td></tr>
		</tbody>
	</table>
</div>

<p>The browser uses the scheme, host and port to open a connection. Only the path and query travel in the request itself. The fragment is never sent: the browser keeps it, for example to scroll to the reviews. An API’s URLs are often called endpoints.</p>

<h2>A request and its reply</h2>

<p>An <strong><Term def="A message from a client asking a server to perform an action.">HTTP request</Term></strong> travels from the client to the server, and the server sends an <strong><Term def="A message from a server reporting the result of a request.">HTTP response</Term></strong> back. Here is a request for the reading list, written the way HTTP/1.1 sends it as text:</p>

<Code
	lang="http"
	code={`GET /books HTTP/1.1
Host: example.test
Accept: application/json`}
/>

<p>The first line holds the <strong><Term def="The part of a request that states the intended action.">method</Term></strong>, <code>GET</code>, then the path and the HTTP version. <code>Host</code> and <code>Accept</code> are <strong><Term def="A named field carrying extra information about a message.">header</Term></strong> fields: name-value lines that add information.</p>

<p>The server might reply:</p>

<Code
	lang="http"
	code={`HTTP/1.1 200 OK
Content-Type: application/json

[{"id":1,"title":"Dune"},{"id":2,"title":"Frankenstein"}]`}
/>

<p><code>200</code> is the <strong><Term def="A three-digit number reporting the result of an HTTP request.">status code</Term></strong>: the request succeeded. A blank line separates the headers from the <strong><Term def="The content carried by a request or response, when there is any.">body</Term></strong>, which here is <strong><Term def="A text format commonly used to exchange structured data.">JSON</Term></strong>: a list of books, each with an <code>id</code> and a <code>title</code>.</p>

<Note title="An everyday picture" tone="plain">
	Think of a library desk. Your note to the librarian names an action and a book, like a method and URL; extra details such as your preferred language are like headers. The reply says whether it worked, like a status code, and may come with the book, like a body. Unlike a librarian, HTTP doesn’t remember your earlier visits.
</Note>

<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'In GET /books, what does GET tell the server?',
			options: ['The format of the response body', 'The action the client wants to perform', 'The status of the last request'],
			answer: 1,
			explain: 'GET is the method and asks for a representation of a resource. A header such as Accept states the preferred response format.'
		}
	]}
/>

<h2>Methods: what action are you asking for?</h2>

<p>The method says what you want done. The server still decides which methods each URL supports, and whether you’re allowed to use them.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Method</th><th scope="col">Typical purpose</th><th scope="col">Reading-list example</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>GET</code></th><td>Retrieve a resource</td><td>Read saved books</td></tr>
			<tr><th scope="row"><code>POST</code></th><td>Submit data for processing</td><td>Add a new book</td></tr>
			<tr><th scope="row"><code>PUT</code></th><td>Create or replace the target’s whole state</td><td>Replace a book entry</td></tr>
			<tr><th scope="row"><code>PATCH</code></th><td>Change part of the target</td><td>Change a book’s rating</td></tr>
			<tr><th scope="row"><code>DELETE</code></th><td>Remove the target</td><td>Delete a saved entry</td></tr>
			<tr><th scope="row"><code>HEAD</code></th><td>Get the headers of a <code>GET</code> without its body</td><td>Check a book’s headers</td></tr>
		</tbody>
	</table>
</div>

<p>Use <code>GET</code> to read without changing anything, and <code>POST</code> to send data for processing, often to create something. Here is a request to add a book:</p>

<Code
	lang="http"
	code={`POST /books HTTP/1.1
Host: example.test
Content-Type: application/json

{"title":"The Hobbit"}`}
/>

<p>The method says what to do, the path says where and the body supplies the data. If the server creates the book it can reply <code>201 Created</code>, but each API documents what it actually returns.</p>

<h2>Headers and bodies: extra information</h2>

<p>Headers carry details about a message:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Header</th><th scope="col">What it communicates</th><th scope="col">Example</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Accept</code></th><td>Response formats the client prefers</td><td><code>application/json</code></td></tr>
			<tr><th scope="row"><code>Content-Type</code></th><td>Format of the body in this message</td><td><code>application/json</code></td></tr>
			<tr><th scope="row"><code>Authorization</code></th><td>Credentials for a protected resource</td><td><code>Bearer &lt;token></code></td></tr>
			<tr><th scope="row"><code>Cache-Control</code></th><td>Rules about caching</td><td><code>no-store</code></td></tr>
		</tbody>
	</table>
</div>

<p><code>Accept</code> and <code>Content-Type</code> are easy to mix up. <code>Accept</code> asks for a response format; <code>Content-Type</code> describes the body that was actually sent. Neither makes anything true on its own: <code>Content-Type: application/json</code> doesn’t turn broken text into JSON, and an <code>Authorization</code> header doesn’t guarantee access.</p>

<h2>Status codes: what happened?</h2>

<p>A status code has three digits, and the first one gives its class:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Class</th><th scope="col">Meaning</th><th scope="col">Typical example</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>1xx</code></th><td>Informational</td><td><code>100 Continue</code></td></tr>
			<tr><th scope="row"><code>2xx</code></th><td>Success</td><td><code>200 OK</code></td></tr>
			<tr><th scope="row"><code>3xx</code></th><td>Redirection</td><td><code>301 Moved Permanently</code></td></tr>
			<tr><th scope="row"><code>4xx</code></th><td>Client-side request problem</td><td><code>404 Not Found</code></td></tr>
			<tr><th scope="row"><code>5xx</code></th><td>Server-side failure</td><td><code>500 Internal Server Error</code></td></tr>
		</tbody>
	</table>
</div>

<p><code>200 OK</code> means success, <code>201 Created</code> means something new was made and <code>204 No Content</code> means success with nothing to send back, so don’t try to read JSON from a <code>204</code>.</p>

<p><code>400 Bad Request</code> means the request looks wrong to the server. <code>401 Unauthorized</code> means valid credentials are missing; despite its name, think “not properly authenticated”. <code>403 Forbidden</code> means the server understood the request but refuses it. <code>404 Not Found</code> means nothing was found at the target, or the server won’t say. <code>500 Internal Server Error</code> is an unexpected server failure, and <code>503 Service Unavailable</code> means the server can’t cope right now.</p>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'A request succeeds but the server intentionally sends no response content. Which code best describes that result?',
			options: ['404 Not Found', '500 Internal Server Error', '204 No Content'],
			answer: 2,
			explain: '204 means success with nothing to send. 404 means the target was not found, not that a success was empty.'
		}
	]}
/>

<h2>Try it</h2>

<p>The lab below talks to a pretend reading-list service that runs in this page. Pick a method and a path, set the headers and maybe a body, then press Send and read what comes back.</p>

<HttpRequestLab />

<p>Things to try on purpose:</p>

<ol>
	<li>Send <code>GET /books</code> with <code>Accept: application/json</code>. Look for <code>200</code> and a list in the response.</li>
	<li>Send <code>POST /books</code> with a valid JSON body and <code>Content-Type: application/json</code>. Look for <code>201</code> and the new item.</li>
	<li>Send <code>GET /missing</code> and compare its <code>404</code> with a valid <code>GET</code>. Then break the JSON in a <code>POST</code> body to see <code>400</code>.</li>
</ol>

<h2>Make a request in code</h2>

<p>Libraries write the HTTP lines for you. These examples first start a tiny server on your own machine, so they run without internet access.</p>

<h3>JavaScript (Node 24)</h3>

<Code
	lang="js"
	title="http_request.mjs"
	code={`import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello", method: req.method }));
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));

const { port } = server.address();
const response = await fetch(\`http://127.0.0.1:\${port}/books\`, {
  headers: { Accept: "application/json" },
});
console.log(response.status);
console.log(response.headers.get("content-type"));
console.log(await response.json());
server.close();`}
	caption="Start a temporary server, fetch JSON and inspect the reply."
/>

<p>It prints <code>200</code>, <code>application/json</code> and the parsed object. The operating system picks the port.</p>

<h3>Python 3.14</h3>

<Code
	lang="py"
	title="http_request.py"
	code={`import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from urllib.request import Request, urlopen

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"message": "Hello", "method": self.command}).encode())

    def log_message(self, *args):
        pass

server = HTTPServer(("127.0.0.1", 0), Handler)
Thread(target=server.serve_forever, daemon=True).start()

url = f"http://127.0.0.1:{server.server_port}/books"
with urlopen(Request(url, headers={"Accept": "application/json"}), timeout=5) as response:
    print(response.status)
    print(response.headers["Content-Type"])
    print(json.load(response))
server.shutdown()`}
	caption="Use Python’s standard library to request JSON from a local server."
/>

<p>It prints the same three things: <code>200</code>, <code>application/json</code> and <code>{'{'}'message': 'Hello', 'method': 'GET'{'}'}</code>.</p>

<h2>Watch real requests in your browser</h2>

<p>Every major browser has developer tools that list the requests a page makes. In Chrome, Edge or Firefox, right-click the page, choose Inspect, open the Network tab and reload. Each row is one request: select it to see its URL, method, status, headers and response. Requests made over HTTP/2 show header names in lowercase, because HTTP/2 always sends them that way.</p>

<h2>Where it shows up</h2>

<p>A sign-in form usually sends a <code>POST</code>. A shop loads products with <code>GET</code> and might save a preference with <code>PATCH</code>. A dashboard that fails might get <code>401</code> when you’re signed out, <code>404</code> for a missing endpoint or <code>500</code> when the server breaks.</p>

<h2>Common mistakes</h2>

<ul>
	<li>Using <code>GET</code> to change data. <code>GET</code> is for reading.</li>
	<li>Assuming <code>POST</code> always returns <code>201</code>. The API decides.</li>
	<li>Mixing up <code>Accept</code> and <code>Content-Type</code>. One states a preference; the other labels what was sent.</li>
	<li>Treating every code other than <code>200</code> as a failure. <code>201</code>, <code>204</code> and redirects are normal outcomes.</li>
	<li>Putting secrets in URLs or in shared screenshots of requests. URLs end up in history and server logs, and headers can carry tokens.</li>
</ul>

<h2>Recap</h2>

<ul>
	<li>A URL holds a scheme, host, port, path, query and fragment; the fragment never reaches the server.</li>
	<li>The client sends a request, and its method says what you want done; the server sends a response.</li>
	<li>Headers add information such as formats and credentials; the body carries content when there is some.</li>
	<li>Status codes report the outcome in five classes.</li>
	<li>Your browser’s Network tab shows all of this for real requests.</li>
</ul>

<Quiz
	questions={[
		{
			prompt: 'Which method usually retrieves a resource without intentionally changing its state?',
			options: ['GET', 'DELETE', 'PATCH'],
			answer: 0,
			explain: 'GET is a safe retrieval method. PATCH and DELETE request changes.'
		},
		{
			prompt: 'Which header describes the format of the body being sent?',
			options: ['Accept', 'Content-Type', 'Host'],
			answer: 1,
			explain: 'Content-Type labels the content that was sent; Accept states which response formats the client prefers.'
		},
		{
			prompt: 'What does a 404 response most directly mean?',
			options: ['The server has definitely crashed', 'The request succeeded with no body', 'The target was not found or its existence was not disclosed'],
			answer: 2,
			explain: '404 concerns the target resource. Server failures are generally reported with 5xx codes.'
		},
		{
			prompt: 'Which status reports a successful resource creation?',
			options: ['401', '503', '201'],
			answer: 2,
			explain: '201 Created reports a successful creation. 401 means credentials are missing and 503 means the service is unavailable.'
		},
		{
			prompt: 'Which part of https://example.test/books?page=2#top never reaches the server?',
			options: ['?page=2', '#top', '/books'],
			answer: 1,
			explain: 'The fragment after # stays in the browser. The path and query are sent in the request.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Method guarantees, query strings and encoding, status handling in code and redirects.">
<h2>Safe and idempotent methods</h2>

<p>HTTP uses two precise words for methods. A <em>safe</em> method is essentially read-only from the client’s point of view: <code>GET</code> and <code>HEAD</code> are safe. A server may still log or count your <code>GET</code>; those side effects don’t make it a request to change the resource.</p>

<p>An <em>idempotent</em> method has the same intended effect on the server whether you send it once or several times. <code>GET</code>, <code>HEAD</code>, <code>PUT</code> and <code>DELETE</code> are idempotent. <code>POST</code> and <code>PATCH</code> are not inherently idempotent, though an API may make them so. Repeating <code>PUT /books/7</code> with the same full replacement leaves the book as one request would. The responses may differ: a second <code>DELETE</code> can return <code>404</code>, yet the book is gone either way.</p>

<p>This matters for retries. If a connection drops, the client may not know whether a write happened, and blindly retrying a <code>POST</code> can create duplicates. Some APIs accept an idempotency key so a retried <code>POST</code> is recognised; that is a feature of the API, not of HTTP.</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'Which method has idempotent semantics when used as intended?',
			options: ['POST', 'PUT', 'Every PATCH request'],
			answer: 1,
			explain: 'Repeating the same PUT has the same intended effect on the target. POST and PATCH have no universal idempotence guarantee.'
		}
	]}
/>

<h2>Query strings and encoding</h2>

<p>The query is everything between <code>?</code> and <code>#</code>. The URL standard itself (RFC 3986) gives it no structure. The familiar <code>name=value&amp;name=value</code> layout is the <code>application/x-www-form-urlencoded</code> format from the WHATWG URL Standard, which HTML forms and JavaScript’s <code>URLSearchParams</code> use.</p>

<p>A URL can hold only a limited set of characters, so anything else is <em>percent-encoded</em>: each byte becomes <code>%</code> and two hex digits. Text is first turned into UTF-8 bytes, so <code>é</code>, which is two bytes in UTF-8, becomes <code>%C3%A9</code>. In the form format a space is written as <code>+</code>, so a real plus sign must become <code>%2B</code>; elsewhere in a URL a space is <code>%20</code>.</p>

<p>To read a query, the URL Standard splits it on <code>&amp;</code> and skips empty pieces, splits each piece at its first <code>=</code> (no <code>=</code> means an empty value), turns <code>+</code> into a space, then decodes the percent escapes. Names can repeat: <code>tag=new&amp;tag=sale</code> gives two values for <code>tag</code>.</p>

<Code
	lang="js"
	title="query.mjs"
	code={`const url = new URL("https://example.test/search?q=caf%C3%A9+au+lait&tag=new&tag=sale");
console.log(url.pathname);                   // /search
console.log(url.searchParams.get("q"));      // café au lait
console.log(url.searchParams.getAll("tag")); // [ 'new', 'sale' ]

const params = new URLSearchParams({ q: "fish & chips", page: "2" });
console.log(params.toString());                // q=fish+%26+chips&page=2
console.log(encodeURIComponent("café au lait")); // caf%C3%A9%20au%20lait`}
/>

<Code
	lang="py"
	title="query.py"
	code={`from urllib.parse import parse_qs, quote, urlencode, urlsplit

url = urlsplit("https://example.test/search?q=caf%C3%A9+au+lait&tag=new&tag=sale")
print(url.path)             # /search
print(parse_qs(url.query))  # {'q': ['café au lait'], 'tag': ['new', 'sale']}
print(urlencode({"q": "fish & chips", "page": 2}))  # q=fish+%26+chips&page=2
print(quote("café au lait"))  # caf%C3%A9%20au%20lait`}
	caption="Python’s parse_qs drops names with empty values unless you pass keep_blank_values=True."
/>

<Note title="Don’t glue queries together by hand" tone="warn">
	A <code>&amp;</code> or <code>#</code> inside a value splits or cuts off the query if it isn’t encoded. Build queries with <code>URLSearchParams</code> or <code>urlencode</code>, and keep secrets out of them: URLs end up in browser history and server logs.
</Note>

<h2>Handle status and content separately</h2>

<p>With JavaScript’s <code>fetch()</code>, an HTTP error such as <code>404</code> still fulfils the promise with a <code>Response</code>; only a network failure rejects it. So check <code>response.ok</code>, which is true for statuses 200 to 299, or <code>response.status</code> itself.</p>

<Code
	lang="js"
	title="status_handling.mjs"
	code={`import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Book not found" }));
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));

const response = await fetch(\`http://127.0.0.1:\${server.address().port}/books/999\`);
const data = await response.json();
console.log(response.ok);     // false
console.log(response.status); // 404
console.log(data.error);      // Book not found
server.close();`}
	caption="A 404 response is still an HTTP response."
/>

<p>Python’s <code>urllib.request</code> works the other way round: the default opener raises <code>HTTPError</code> for error statuses, and <code>URLError</code> for problems such as a refused connection. Libraries expose the same HTTP facts through different control flow, so learn each one’s rules.</p>

<p>In a real client, first ask whether you got a response at all. If you did, check its status and <code>Content-Type</code>, then parse the body according to what it actually contains: error bodies often differ from successful ones, and a <code>204</code> has none. Set timeouts, and treat every response as untrusted data.</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'With JavaScript fetch(), what happens when the server responds with 404?',
			options: ['The promise fulfils with a response whose ok property is false', 'The promise always rejects as if the network were down', 'The response is automatically changed to 200'],
			answer: 0,
			explain: 'Fetch separates HTTP responses from network failures. A 404 is a response you must inspect, not a rejected promise.'
		}
	]}
/>

<h2>Redirects</h2>

<p>A <code>3xx</code> response with a <code>Location</code> header sends the client somewhere else. Browsers and <code>fetch()</code> follow redirects automatically, and <code>fetch()</code> gives up with a network error after 20 in a row. The codes differ in two ways: whether the move is permanent, and whether the next request may change its method.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Code</th><th scope="col">Meaning</th><th scope="col">The next request</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>301 Moved Permanently</code></th><td>Permanent move</td><td>May change <code>POST</code> to <code>GET</code></td></tr>
			<tr><th scope="row"><code>302 Found</code></th><td>Temporary move</td><td>May change <code>POST</code> to <code>GET</code></td></tr>
			<tr><th scope="row"><code>303 See Other</code></th><td>Look at a different resource</td><td>A <code>GET</code> (or <code>HEAD</code>)</td></tr>
			<tr><th scope="row"><code>307 Temporary Redirect</code></th><td>Temporary move</td><td>Must keep the method</td></tr>
			<tr><th scope="row"><code>308 Permanent Redirect</code></th><td>Permanent move</td><td>Must keep the method</td></tr>
		</tbody>
	</table>
</div>

<p>The <code>POST</code>-to-<code>GET</code> change on <code>301</code> and <code>302</code> is a historical habit that HTTP still allows, and the Fetch Standard does it: after a <code>301</code> or <code>302</code> to a <code>POST</code>, or a <code>303</code> to anything but <code>GET</code> or <code>HEAD</code>, the next request is a <code>GET</code> with no body. So if a <code>POST</code> must stay a <code>POST</code> after moving, the server needs <code>307</code> or <code>308</code>. <code>303</code> is meant for the opposite case: after a form <code>POST</code> succeeds, it sends the browser to a result page with a <code>GET</code>, so reloading that page doesn’t submit the form again.</p>

<p>Browsers may cache <code>301</code> and <code>308</code> responses even without caching headers, so a mistaken permanent redirect can stick. Test with <code>302</code> or <code>307</code> first, and when debugging, check the <em>final</em> URL a request ended up at.</p>
</Layer>

<Layer depth="hood" summary="Where a message body ends, how HTTP/2 and HTTP/3 compress headers and the less obvious status codes.">
<h2>Message structure across HTTP versions</h2>

<p>HTTP/1.1 is text: a start-line, header fields, a blank line and optional content. A request line holds the method, target and version; a status line holds the version, status code and a reason phrase such as <code>OK</code>. The reason phrase is only for people: the code carries the meaning.</p>

<p>HTTP/2 and HTTP/3 carry the same semantics in binary frames instead. The start-line becomes pseudo-header fields such as <code>:method</code>, <code>:path</code> and <code>:status</code>. Header names are case-insensitive in every version, but HTTP/2 and HTTP/3 require them to be sent in lowercase. A text dump in HTTP/1.1 style is a picture of the meaning, not of the bytes on the wire.</p>

<h2>Where a body ends</h2>

<p>HTTP/1.1 sends messages one after another on the same connection, so the receiver must know where each body stops. There are three ways:</p>

<ul>
	<li><strong><code>Content-Length</code></strong> gives the body’s size in bytes up front.</li>
	<li><strong><code>Transfer-Encoding: chunked</code></strong> sends the body in pieces when the size isn’t known in advance, for example while a page is still being generated. Each chunk starts with its size in hex, and a chunk of size 0 ends the body, optionally followed by trailer fields.</li>
	<li>A response with neither header ends when the server closes the connection. A request with neither has no body.</li>
</ul>

<Code
	lang="http"
	code={`HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

5
Hello
7
, world
0
`}
	caption="Two chunks, of 5 and 7 bytes, then the zero-size chunk that ends the body. Each line ends in CRLF."
/>

<p>If a message has both headers, <code>Transfer-Encoding</code> wins, and RFC 9112 says to treat it as an error: when a proxy and a server disagree about where a body ends, an attacker can hide a second request inside the first. This is called request smuggling.</p>

<p>Some responses have no body whatever the headers say: any response to <code>HEAD</code>, and every <code>204</code> and <code>304</code>. HTTP/2 and HTTP/3 don’t use chunked encoding at all (RFC 9113 forbids the <code>Transfer-Encoding</code> header): content travels in DATA frames, and the end of the stream marks the end of the message.</p>

<h2>Header compression: HPACK and QPACK</h2>

<p>Requests to the same site repeat the same headers: the same host, the same cookies, the same <code>Accept</code>. HTTP/2 compresses them with HPACK (RFC 7541). It has a static table of 61 common header fields and values, and a dynamic table that both ends build up during the connection, so a repeated header can shrink to a single index number. New text can also be Huffman-coded. HTTP/2 starts the dynamic table at 4,096 bytes.</p>

<p>HPACK replaced the general-purpose DEFLATE compression that SPDY, HTTP/2’s predecessor, used. The CRIME attack had shown that DEFLATE leaks secrets such as cookies: an attacker who can add text to a request can guess a secret one character at a time by watching the compressed size. HPACK makes a guess match a whole header value instead, which helps but does not fully protect low-entropy values.</p>

<p>HTTP/3 runs over QUIC, where streams can arrive out of order. HPACK assumes every header block arrives in order, so using it there would let one delayed header block hold up others. QPACK (RFC 9204) solves this with a static table of 99 entries and separate encoder and decoder streams that keep both sides’ dynamic tables in step. A QPACK dynamic table starts at size 0 until the receiver allows more.</p>

<h2>Less obvious status behaviour</h2>

<p><code>401 Unauthorized</code> and <code>403 Forbidden</code> are easy to confuse. A <code>401</code> is about missing or invalid authentication and comes with a <code>WWW-Authenticate</code> challenge. A <code>403</code> means access is refused, and sending the same credentials again won’t help. Servers can also answer <code>404</code> on purpose, to hide that a forbidden resource exists.</p>

<p><code>405 Method Not Allowed</code> means the method is known but not supported here, and the response must list the allowed methods in <code>Allow</code>. <code>406 Not Acceptable</code> means nothing the server has matches the client’s <code>Accept</code> A server may also ignore <code>Accept</code> and send its default instead. <code>415 Unsupported Media Type</code> means the server won’t accept the request body’s format. <code>429 Too Many Requests</code> (RFC 6585) signals rate limiting and may include <code>Retry-After</code>, which <code>503</code> can also use.</p>

<p><code>502 Bad Gateway</code> and <code>504 Gateway Timeout</code> come from gateways and proxies: the first means an invalid response arrived from the server behind them, the second that no response arrived in time. They tell you where a request failed, not why.</p>

<h2>Recap: read the protocol, not assumptions</h2>

<ol>
	<li>HTTP/1.1, HTTP/2 and HTTP/3 encode messages differently but share the same semantics.</li>
	<li>In HTTP/1.1 a body ends by <code>Content-Length</code>, by a zero-size chunk or by the connection closing; having both length headers is a warning sign.</li>
	<li><code>HEAD</code>, <code>204</code> and <code>304</code> responses never carry a body.</li>
	<li>HPACK and QPACK shrink repeated headers with shared tables; QPACK exists because QUIC delivers streams out of order.</li>
	<li>Codes such as <code>405</code>, <code>406</code>, <code>415</code>, <code>429</code>, <code>502</code> and <code>504</code> say precisely what went wrong, and where.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'In a chunked HTTP/1.1 body, what marks the end?',
			options: ['A chunk whose size is 0', 'The Content-Length header', 'A pause of a few seconds'],
			answer: 0,
			explain: 'Each chunk states its size in hex, and a zero-size chunk ends the body. Content-Length is the other way to frame a body, not part of chunked encoding.'
		},
		{
			prompt: 'Which response must include an Allow header?',
			options: ['200 OK', '404 Not Found', '405 Method Not Allowed'],
			answer: 2,
			explain: '405 must list the methods the target supports. A 404 does not provide that list.'
		},
		{
			prompt: 'A client sends HEAD to a resource that exists. What content should it expect?',
			options: ['No response body', 'The entire GET response body', 'A JSON array in every case'],
			answer: 0,
			explain: 'HEAD returns the headers a GET would have, with no body.'
		},
		{
			prompt: 'Why does HTTP/3 use QPACK instead of HPACK?',
			options: ['HPACK assumes header blocks arrive in order, which QUIC streams do not guarantee', 'HPACK cannot compress JSON bodies', 'QPACK encrypts headers and HPACK does not'],
			answer: 0,
			explain: 'With HPACK, one late header block would stall every stream. QPACK keeps the tables in step over separate streams. Neither compresses bodies, and encryption comes from TLS.'
		},
		{
			prompt: 'A message arrives with both Content-Length and Transfer-Encoding: chunked. What does RFC 9112 say?',
			options: ['Content-Length wins', 'Transfer-Encoding wins, and the message ought to be treated as an error', 'The receiver adds the two lengths together'],
			answer: 1,
			explain: 'Transfer-Encoding overrides Content-Length, and the mismatch is a sign of request smuggling, so it should be handled as an error.'
		}
	]}
/>

<h2>Sources and further reading</h2>

<ul>
	<li><a href="https://httpwg.org/specs/rfc9110.html" rel="external">RFC 9110: HTTP Semantics</a></li>
	<li><a href="https://httpwg.org/specs/rfc9112.html" rel="external">RFC 9112: HTTP/1.1</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc3986.html" rel="external">RFC 3986: URI Generic Syntax</a></li>
	<li><a href="https://url.spec.whatwg.org/#urlencoded-parsing" rel="external">WHATWG URL Standard: application/x-www-form-urlencoded</a></li>
	<li><a href="https://www.rfc-editor.org/rfc/rfc7541.html" rel="external">RFC 7541: HPACK</a> and <a href="https://www.rfc-editor.org/rfc/rfc9204.html" rel="external">RFC 9204: QPACK</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" rel="external">MDN: Using the Fetch API</a></li>
</ul>
</Layer>
