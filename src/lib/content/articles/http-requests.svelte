<script lang="ts">
	import Term from '../../components/teach/Term.svelte';
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
	import Quiz from '../../components/teach/Quiz.svelte';
	import CorePack from '../../components/teach/CorePack.svelte';
	import Layer from '../../components/teach/Layer.svelte';
	import HttpRequestLab from '../../components/teach/HttpRequestLab.svelte';
</script>

<p>When you open a website, your browser often needs information from somewhere else. It might ask for a page, request a profile picture, or load a list of messages. A web app can also send information, such as a new comment. These exchanges often use HTTP, a shared set of rules for communication between a client and a server.</p>

<p>Think of your browser or app as the client. It sends a request that says what it wants. The server sends a response describing the result. Even when the request fails, the response can tell you something useful about why. Understanding these messages helps you build web apps and diagnose problems without guessing.</p>

<p>In this lesson you will learn:</p>

<ul>
	<li>the parts of an HTTP request and response,</li>
	<li>which method to use for reading and for changing data,</li>
	<li>how to read request and response headers,</li>
	<li>what the most common status codes mean, and</li>
	<li>how to make a request and inspect the result in JavaScript and Python.</li>
</ul>

<h2>Words you will meet</h2>

<dl>
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
		<dt>Endpoint</dt>
		<dd>A URL that an app uses to access a particular service or resource.</dd>
	</div>
	<div>
		<dt>JSON</dt>
		<dd>A text format commonly used to exchange structured data.</dd>
	</div>
</dl>

<h2>A request and its reply</h2>

<p>An <strong><Term def="A message from a client asking a server to perform an action.">HTTP request</Term></strong> travels from the client to the server. The server processes it and sends an <strong><Term def="A message from a server reporting the result of a request.">HTTP response</Term></strong> back. HTTP defines the meaning of the messages, not how the server stores its data.</p>

<p>Imagine a reading-list app. Its client needs the books you saved. It asks the server for <code>/books</code>. A useful mental picture is:</p>

<Code
	lang="http"
	code={`GET /books HTTP/1.1
Host: example.test
Accept: application/json`}
/>

<p>The first line includes a <strong><Term def="The part of a request that states the intended action.">method</Term></strong>, here <code>GET</code>, and a target path. <code>Host</code> and <code>Accept</code> are <strong><Term def="A named field carrying extra information about a message.">header</Term></strong> fields. This example uses HTTP/1.1 text notation. Other HTTP versions represent messages differently, but preserve the important request meaning.</p>

<p>The server might reply:</p>

<Code
	lang="http"
	code={`HTTP/1.1 200 OK
Content-Type: application/json

{"books":["Dune","Frankenstein"]}`}
/>

<p>The <code>200</code> is a <strong><Term def="A three-digit number reporting the result of an HTTP request.">status code</Term></strong>. It means the request succeeded. The blank line separates the headers from the <strong><Term def="The content carried by a request or response, when there is any.">body</Term></strong>. Here the body uses <strong><Term def="A text format commonly used to exchange structured data.">JSON</Term></strong>: keys such as <code>books</code> hold values such as a list of titles.</p>

<p>The URL the app contacts is often called an <strong><Term def="A URL that an app uses to access a particular service or resource.">endpoint</Term></strong>. In this example, <code>/books</code> is the path part of an endpoint hosted at <code>example.test</code>. The address is illustrative, not a live API.</p>

<Note title="An everyday picture" tone="plain">
	Think of a library desk. You hand the librarian a note asking to see a book. Your note identifies the action and the book, much like a method and URL. Extra details, such as your preferred language, resemble headers. The librarian's reply says whether the request worked, much like a status code, and may include the item you requested, like a response body. Unlike a real library, HTTP does not automatically remember previous conversations.
</Note>

<Quiz
	variant="checkpoint"
	title="Checkpoint 1"
	questions={[
		{
			prompt: 'In GET /books, what does GET tell the server?',
			options: ['The format of the response body', 'The action the client wants to perform', 'The status of the last request'],
			answer: 1,
			explain: 'GET is the method and asks for a representation of a resource. A header such as Accept can express a preferred response format.'
		}
	]}
/>

<h2>Methods: what action are you asking for?</h2>

<p>HTTP methods describe the purpose of an operation. The server still decides which actions a URL supports and whether the client has permission.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Method</th><th scope="col">Typical purpose</th><th scope="col">Reading-list example</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>GET</code></th><td>Retrieve a resource</td><td>Read saved books</td></tr>
			<tr><th scope="row"><code>POST</code></th><td>Submit data for processing</td><td>Add a new book</td></tr>
			<tr><th scope="row"><code>PUT</code></th><td>Create or replace the target resource's state</td><td>Replace a book entry</td></tr>
			<tr><th scope="row"><code>PATCH</code></th><td>Apply a partial modification</td><td>Change a book's rating</td></tr>
			<tr><th scope="row"><code>DELETE</code></th><td>Request removal of a resource's association</td><td>Delete a saved entry</td></tr>
			<tr><th scope="row"><code>HEAD</code></th><td>Get response metadata without a response body</td><td>Check a book resource's headers</td></tr>
		</tbody>
	</table>
</div>

<p>The table describes the usual intent, not a guarantee that every server handles the method that way. For example, a server might reject <code>PATCH</code> for a particular endpoint. The method does not grant permission to change data.</p>

<p>Use <code>GET</code> when you want to read, not intentionally change, server state. Use <code>POST</code> when sending information to be processed, often to create an item. <code>PUT</code> normally supplies a complete replacement for the target's state. <code>PATCH</code> describes a partial change. <code>DELETE</code> asks the server to remove the target's current association, but that does not promise every stored byte is erased.</p>

<p>Here is an illustrative request to add a book:</p>

<Code
	lang="http"
	code={`POST /books HTTP/1.1
Host: example.test
Content-Type: application/json

{"title":"Dune"}`}
/>

<p>The method says what to do, the path says where, and the body supplies the data. The server could reply <code>201 Created</code> if it creates a resource successfully. That result is not automatic: the API determines its behaviour.</p>

<Note title="Methods describe intent" tone="tip">
	An API can define a route that ignores the usual conventions. Good clients still follow the documented contract of that API, rather than assuming a method always produces a particular status code.
</Note>

<h2>Headers and bodies: extra information</h2>

<p>Headers are name-value fields. They explain such things as which formats a client understands, how to interpret a message body, or what credentials accompany a request.</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Header</th><th scope="col">What it communicates</th><th scope="col">Example</th></tr></thead>
		<tbody>
			<tr><th scope="row"><code>Accept</code></th><td>Response media types the client prefers</td><td><code>application/json</code></td></tr>
			<tr><th scope="row"><code>Content-Type</code></th><td>Media type of the content in this message</td><td><code>application/json</code></td></tr>
			<tr><th scope="row"><code>Authorization</code></th><td>Credentials for a protected resource</td><td><code>Bearer &lt;token></code></td></tr>
			<tr><th scope="row"><code>Cache-Control</code></th><td>Directives about caching</td><td><code>no-store</code></td></tr>
		</tbody>
	</table>
</div>

<p>A common mix-up is treating <code>Accept</code> and <code>Content-Type</code> as interchangeable. <code>Accept</code> asks for an acceptable response format. <code>Content-Type</code> tells the receiver how to interpret the content that was actually sent. For example, a JSON <code>POST</code> may use both: one describes the outgoing body, and the other describes the desired reply.</p>

<p>Headers do not replace the body. A <code>Content-Type: application/json</code> field does not magically turn arbitrary text into valid JSON. Likewise, adding <code>Authorization</code> does not guarantee access. The server must validate the credentials and enforce its own rules.</p>

<h2>Status codes: what happened?</h2>

<p>A response status code has three digits. Its first digit identifies a broad class:</p>

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

<p>Some individual codes matter especially often. <code>200 OK</code> means the request succeeded. <code>201 Created</code> means it succeeded and created one or more resources. <code>204 No Content</code> means success with no response content to send. Do not expect JSON from a <code>204</code> response.</p>

<p><code>400 Bad Request</code> means the server cannot or will not process a request because of an apparent client-side problem. <code>401 Unauthorized</code> indicates that valid authentication credentials are missing for the target resource; despite its name, think “not properly authenticated”. <code>403 Forbidden</code> means the server understood the request but refuses it. <code>404 Not Found</code> means the server did not find a current representation of the target, or will not disclose that one exists.</p>

<p><code>500 Internal Server Error</code> is a general unexpected server error. <code>503 Service Unavailable</code> means the server is currently unable to handle the request, such as during overload or maintenance. A <code>4xx</code> code does not always prove the human user made a mistake, and a <code>5xx</code> code does not reveal exactly which part of the server broke.</p>

<Quiz
	variant="checkpoint"
	title="Checkpoint 2"
	questions={[
		{
			prompt: 'A request succeeds but the server intentionally sends no response content. Which code best describes that result?',
			options: ['404 Not Found', '500 Internal Server Error', '204 No Content'],
			answer: 2,
			explain: '204 means the request succeeded and there is no response content. 404 means the target was not found or disclosed, not that a successful response has an empty body.'
		}
	]}
/>

<h2>Try it</h2>

<p>Use the HTTP request lab to build a message, choose a method, set headers, and send it to a simulated reading-list service. Look at the status code and response body after each send. The lab does not contact a public website or save real user data, so you can safely explore mistakes and retry.</p>

<HttpRequestLab />

<p>Things to try on purpose:</p>

<ol>
	<li>Send <code>GET /books</code> with <code>Accept: application/json</code>. Look for <code>200</code> and a list in the response.</li>
	<li>Send <code>POST /books</code> with a valid JSON body and <code>Content-Type: application/json</code>. Look for <code>201</code> and the new item.</li>
	<li>Send <code>GET /missing</code>. Compare its <code>404</code> response with a valid <code>GET</code> request; then try a malformed JSON <code>POST</code> to see <code>400</code>.</li>
</ol>

<h2>Make a request in code</h2>

<p>You can make HTTP requests without manually writing every HTTP line. These examples use local, in-process HTTP servers. They run without internet access and show the same underlying ideas: method, status, headers and body.</p>

<h3>JavaScript (Node 24)</h3>

<Code
	lang="js"
	title="http_request.mjs"
	code={`import { createServer } from "node:http";
import { once } from "node:events";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello", method: req.method }));
});

server.listen(0, "127.0.0.1");
await once(server, "listening");

try {
  const address = server.address();
  const response = await fetch(\`http://127.0.0.1:\${address.port}/books\`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  console.log(response.status);
  console.log(response.headers.get("content-type"));
  console.log(await response.json());
} finally {
  server.close();
}`}
	caption="Start a temporary server, fetch JSON, and inspect the reply."
/>

<p>Expected output includes status <code>200</code>, media type <code>application/json</code>, and an object containing <code>message: 'Hello'</code> and <code>method: 'GET'</code>. The port is chosen by the operating system, and its number does not matter.</p>

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
        content = json.dumps({"message": "Hello", "method": "GET"}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, format, *args):
        pass

server = HTTPServer(("127.0.0.1", 0), Handler)
thread = Thread(target=server.serve_forever)
thread.start()

try:
    url = f"http://127.0.0.1:{server.server_port}/books"
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=5) as response:
        print(response.status)
        print(response.headers.get("Content-Type"))
        print(json.load(response))
finally:
    server.shutdown()
    thread.join()
    server.server_close()`}
	caption="Use Python's standard library to request JSON from a local server."
/>

<p>The Python example prints <code>200</code>, <code>application/json</code>, and <code>{'{'}'message': 'Hello', 'method': 'GET'{'}'}</code>. In both examples, the program runs a tiny local server only to make the request predictable. In normal projects, your server may run elsewhere.</p>

<h2>Where it shows up</h2>

<p>In a sign-in page, a client might submit a <code>POST</code> request. The server verifies the supplied information and sends a response. In a shopping app, <code>GET</code> requests might load products, and <code>PATCH</code> might update a saved preference. In a dashboard, a failed request could produce <code>401</code> when authentication is missing, <code>404</code> for an unavailable endpoint, or <code>500</code> when something breaks on the server.</p>

<p>You can inspect these details in your browser's developer tools. Open the Network panel, reload a page, choose a request, and look at its method, headers, status and response. Be careful with credentials and private response content if sharing screenshots or logs.</p>

<h2>Common mistakes</h2>

<ul>
	<li>Choosing <code>GET</code> to make a change because it is the easiest method to type. <code>GET</code> is designed for retrieval.</li>
	<li>Assuming <code>POST</code> always returns <code>201</code>. The server may return another suitable status.</li>
	<li>Confusing <code>Accept</code> with <code>Content-Type</code>. One states preferences; the other identifies sent content.</li>
	<li>Treating all non-<code>200</code> results as failures. <code>201</code>, <code>204</code> and some redirection responses are meaningful outcomes.</li>
	<li>Trying to read JSON from every response, including <code>204 No Content</code> or plain text responses.</li>
	<li>Assuming a <code>404</code> always reveals whether a resource exists. A server can conceal its existence.</li>
	<li>Sending access tokens in public logs. Authentication data must be handled as sensitive information.</li>
</ul>

<h2>Recap</h2>

<ul>
	<li>The client sends an HTTP request; the server sends an HTTP response.</li>
	<li>A method describes the action the client intends.</li>
	<li>A URL identifies the target resource or service.</li>
	<li>Headers add information such as preferred formats and content types.</li>
	<li>Bodies carry content such as JSON when content is present.</li>
	<li>Status codes describe the outcome in five broad classes.</li>
	<li>Read method, URL, status, headers and body together when debugging.</li>
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
			prompt: 'Which header describes the media type of the body being sent?',
			options: ['Accept', 'Content-Type', 'Host'],
			answer: 1,
			explain: 'Content-Type identifies the sent representation\'s media type; Accept expresses preferred response types.'
		},
		{
			prompt: 'What does a 404 response most directly mean?',
			options: ['The server has definitely crashed', 'The request succeeded with no body', 'The target was not found or its existence was not disclosed'],
			answer: 2,
			explain: '404 concerns the target resource. Server failures are generally represented by 5xx codes.'
		},
		{
			prompt: 'Which status reports a successful resource creation?',
			options: ['401', '503', '201'],
			answer: 2,
			explain: '201 Created identifies a successful creation. 401 is an authentication challenge and 503 means service unavailable.'
		},
		{
			prompt: 'What is a useful first step when an API call behaves unexpectedly?',
			options: ['Change every header at once', 'Inspect the request method, URL and response status', 'Assume the network is broken'],
			answer: 1,
			explain: 'Those fields narrow down the problem quickly. Changing everything makes the actual cause harder to find.'
		}
	]}
/>

<CorePack />

<Layer depth="deeper" summary="Understand method guarantees, client behaviour and practical API error handling.">
<h2>Safe and idempotent methods</h2>

<p>HTTP uses two important words to describe method semantics. A <em>safe</em> method is defined as essentially read-only from the client's point of view. <code>GET</code> and <code>HEAD</code> are safe. A server might still keep logs or count visits when you use <code>GET</code>; those incidental changes do not make the request an instruction to edit the resource.</p>

<p>An <em>idempotent</em> method has the same intended effect on server state when sent once or repeatedly with identical inputs. <code>GET</code>, <code>HEAD</code>, <code>PUT</code> and <code>DELETE</code> have idempotent semantics. <code>POST</code> and <code>PATCH</code> are not inherently idempotent, though an individual API may implement them that way. Repeating <code>PUT /books/7</code> with the same full replacement should leave the intended resource state as it would after one request. The responses may differ, and side effects such as logs can still accumulate.</p>

<p>These properties matter for retries. If a network connection drops, the client may not know whether a write succeeded. Retrying a non-idempotent action carelessly can create duplicates. Before automatically retrying, understand the API's guarantees and whether it supports an application-level idempotency key. The key is an API-specific feature, not a universal HTTP request requirement.</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 1"
	questions={[
		{
			prompt: 'Which method has idempotent semantics when used as intended?',
			options: ['POST', 'PUT', 'Every PATCH request'],
			answer: 1,
			explain: 'Repeating the same PUT has the same intended effect on the target resource. POST and PATCH have no universal idempotence guarantee.'
		}
	]}
/>

<h2>Handle status and content separately</h2>

<p>In JavaScript's Fetch API, an HTTP error response such as <code>404</code> normally still fulfils the promise with a <code>Response</code> object. Network-level failure may reject the promise instead. That is why checking <code>response.ok</code> or <code>response.status</code> matters. The <code>ok</code> property is true for status codes in the <code>200</code> through <code>299</code> range.</p>

<p>This fully runnable Node 24 example shows status handling with a small local server:</p>

<Code
	lang="js"
	title="status_handling.mjs"
	code={`import { createServer } from "node:http";
import { once } from "node:events";

const server = createServer((req, res) => {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Book not found" }));
});
server.listen(0, "127.0.0.1");
await once(server, "listening");

try {
  const url = \`http://127.0.0.1:\${server.address().port}/books/999\`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(response.ok); // false
  console.log(response.status); // 404
  console.log(data.error); // Book not found
} finally {
  server.close();
}`}
	caption="A 404 response is still an HTTP response."
/>

<p>In Python's <code>urllib.request</code>, the default opener generally raises <code>HTTPError</code> for HTTP error responses, while errors such as connection failure are represented by <code>URLError</code> or other exceptions. Different programming libraries expose the same HTTP facts through different control flows. Do not assume handling one library's error behaviour teaches you every library's behaviour.</p>

<p>For a production client, first examine whether you received a response at all. If you did, inspect its status and <code>Content-Type</code>, then parse the body according to what it actually contains. Error bodies need not use the same format as successful responses. A <code>204</code> response has no content to parse. A request also needs sensible timeouts and appropriate handling for untrusted data.</p>

<Quiz
	variant="checkpoint"
	title="Going deeper checkpoint 2"
	questions={[
		{
			prompt: 'With JavaScript fetch(), what happens when the server responds with 404?',
			options: ['The promise normally fulfils with a response whose ok property is false', 'The promise always rejects as if the network were down', 'The response is automatically changed to 200'],
			answer: 0,
			explain: 'Fetch separates HTTP responses from network failures. A 404 is an HTTP response you must inspect, not necessarily a rejected promise.'
		}
	]}
/>

<h2>Authentication, redirects and caching</h2>

<p>An <code>Authorization</code> header can carry credentials, including bearer tokens. Anyone who obtains a usable bearer token may be able to act as its holder, so avoid pasting tokens into screenshots, source control or public debugging tools. HTTPS protects messages in transit between TLS endpoints, but does not replace authentication checks or sensible storage of credentials.</p>

<p>A redirect response tells a client that a different location may need to be used. <code>Location</code> is the common response header that points to the destination. Not every <code>3xx</code> response means the same thing: some redirect methods or caching rules differ, and clients may follow redirects automatically. Developers should inspect the <em>final</em> URL when debugging an unexpected page or login flow.</p>

<p>Caching is another layer. Responses may be reused under appropriate rules rather than fetched afresh every time. <code>Cache-Control</code> directs cache behaviour. A <code>304 Not Modified</code> response is used with conditional requests to allow reuse of a stored representation rather than transferring it again. That is not a mysterious server failure or a fresh copy of the whole body.</p>
</Layer>

<Layer depth="hood" summary="Read protocol semantics precisely and recognise less obvious edge cases.">
<h2>Message structure across HTTP versions</h2>

<p>HTTP/1.1 has a familiar textual start-line, header fields, a blank line and optional content. The method, target and version appear in the request line. A response begins with its version, status code and a human-readable reason phrase. The reason phrase is not needed to interpret the response: the code carries the standard meaning.</p>

<p>HTTP/2 and HTTP/3 use different framing and encoding rather than placing the exact same HTTP/1.1 text on the wire. They still carry the method, target information, fields and status semantics discussed in this lesson. In HTTP/2 and HTTP/3, pseudo-header fields such as <code>:method</code>, <code>:path</code> and <code>:status</code> represent information that would be on HTTP/1.1 start-lines. Do not assume a text dump of HTTP/1.1 is an exact packet capture for all versions.</p>

<p>Header field names are case-insensitive according to HTTP semantics, so <code>Content-Type</code> and <code>content-type</code> refer to the same field name. Field values may still have their own grammar and case rules. Headers are not free-form comments, and applications should not construct them using untrusted newline characters.</p>

<h2>Bodies, representations and content negotiation</h2>

<p>The presence or absence of response content depends on the method and status, not only on whether the API usually returns JSON. A response to <code>HEAD</code> does not include content, even when the corresponding <code>GET</code> would. A <code>204</code> response cannot contain content. A <code>304</code> response also does not carry the selected representation as a fresh message body.</p>

<p><code>Content-Type</code> declares the media type of included content. JSON APIs commonly use <code>application/json</code>, but text, images and binary data use other media types. <code>Accept</code> helps the client express what representation formats it can handle. A server may respond with <code>406 Not Acceptable</code> when none of the available representations is acceptable under the client's stated preferences, subject to the server's choices defined by HTTP semantics.</p>

<p>The body is not equivalent to a resource. A successful <code>GET</code> may return one representation of an underlying resource. Another client might request a different representation, such as another language or media type. This separation helps explain why content negotiation and caching need metadata beyond the URL alone.</p>

<h2>Less obvious status behaviour</h2>

<p><code>401 Unauthorized</code> and <code>403 Forbidden</code> are easy to confuse. A <code>401</code> response relates to valid authentication credentials and is associated with a <code>WWW-Authenticate</code> challenge. A <code>403</code> means access is refused and does not inherently mean the caller should retry with the same credentials. Servers can intentionally use <code>404</code> to avoid revealing the presence of a forbidden resource.</p>

<p><code>405 Method Not Allowed</code> indicates that the method is known but not supported for the target resource; the response must include an <code>Allow</code> header listing supported methods. <code>415 Unsupported Media Type</code> signals that a request's content format is unsupported. <code>429 Too Many Requests</code>, defined by RFC 6585, signals rate limiting and may include <code>Retry-After</code>. The <code>Retry-After</code> header can also be used with <code>503</code> to indicate when service might become available again.</p>

<p><code>502 Bad Gateway</code> and <code>504 Gateway Timeout</code> come from server components acting as gateways or proxies. The former indicates an invalid response from an inbound server; the latter indicates that a timely upstream response was not received. These codes help narrow down where a request failed, but cannot identify the precise cause without logs and tracing.</p>

<h2>Recap: Read the protocol, not assumptions</h2>

<ol>
	<li>Methods communicate intended semantics. Safe and idempotent are precise properties, not guarantees about an individual application's implementation.</li>
	<li>HTTP status and transport failure are different. A client library decides how each appears to your code.</li>
	<li>HTTP versions encode messages differently while preserving common semantics.</li>
	<li>Response content rules vary with method and status. Never assume every success supplies JSON.</li>
	<li>Authentication, redirects, caching and gateway behaviour add important context to method, header and status interpretation.</li>
</ol>

<Quiz
	title="Under the hood check"
	questions={[
		{
			prompt: 'Which claim about header names is correct?',
			options: ['Their capitalisation changes their meaning', 'Header field names are case-insensitive', 'Header names may contain arbitrary newline characters'],
			answer: 1,
			explain: 'HTTP treats field names without regard to letter case. Their syntax is constrained, so arbitrary newlines are not permitted.'
		},
		{
			prompt: 'Which response must include an Allow header?',
			options: ['200 OK', '404 Not Found', '405 Method Not Allowed'],
			answer: 2,
			explain: '405 must identify the methods supported by the target resource. A 404 does not provide that list.'
		},
		{
			prompt: 'A client sends HEAD to a resource that exists. What content should it expect?',
			options: ['No response body', 'The entire GET response body', 'A JSON array in every case'],
			answer: 0,
			explain: 'HEAD asks for metadata corresponding to GET without response content. It does not return the resource\'s full body.'
		},
		{
			prompt: 'What does 504 Gateway Timeout indicate?',
			options: ['A malformed JSON document in the browser', 'A gateway or proxy did not receive a timely upstream response', 'A permanently removed resource'],
			answer: 1,
			explain: '504 concerns a timeout while a gateway waited for an upstream server. It does not mean the browser supplied malformed JSON.'
		},
		{
			prompt: 'What is the main role of a 304 Not Modified response?',
			options: ['Tell the client that login is required', 'Report a newly created item', 'Let a cache reuse a stored representation after validation'],
			answer: 2,
			explain: '304 is a conditional-request caching result, not a successful resource creation or authentication challenge.'
		}
	]}
/>

<h2>Sources and further reading</h2>

<ul>
	<li><a href="https://httpwg.org/specs/rfc9110.html" rel="external">RFC 9110: HTTP Semantics</a></li>
	<li><a href="https://httpwg.org/specs/rfc9112.html" rel="external">RFC 9112: HTTP/1.1</a></li>
	<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" rel="external">MDN: Using the Fetch API</a></li>
	<li><a href="https://docs.python.org/3.14/library/urllib.request.html" rel="external">Python 3.14: urllib.request</a></li>
</ul>
</Layer>
