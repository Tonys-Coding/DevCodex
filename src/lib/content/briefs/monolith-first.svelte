<script lang="ts">
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>The two shapes</h2>
<ul>
	<li>A <strong>monolith</strong> is one application, deployed as one unit. Its parts call each other as ordinary functions and share one database.</li>
	<li><strong>Microservices</strong> split the system into many small applications, each deployed on its own, usually with its own data. They talk over the network.</li>
</ul>
<p>
	Microservices are often presented as the grown-up choice. The honest answer is narrower: they solve problems of <strong>organisation and
	scale</strong>, and charge you for it every day whether or not you have those problems.
</p>

<h2>What you pay</h2>
<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Concern</th><th scope="col">Monolith</th><th scope="col">Microservices</th></tr></thead>
		<tbody>
			<tr><th scope="row">A call between parts</th><td>A function call: nanoseconds, never lost</td><td>A network request: milliseconds, and it can time out or fail</td></tr>
			<tr><th scope="row">Changing data in two places</th><td>One database transaction</td><td>Coordination across services, with retries and partial failure to handle</td></tr>
			<tr><th scope="row">Shipping a change</th><td>One build, one deploy</td><td>Many pipelines, and versions that must keep working together</td></tr>
			<tr><th scope="row">Finding a bug</th><td>One log, one stack trace</td><td>Tracing a request across services</td></tr>
			<tr><th scope="row">Teams working in parallel</th><td>Harder as the team grows: shared code, shared releases</td><td>Easier: each team owns and ships its service</td></tr>
			<tr><th scope="row">Scaling one hot part</th><td>Scale the whole app</td><td>Scale just that service</td></tr>
		</tbody>
	</table>
</div>
<p>Only the last two rows favour microservices, and both are about size: many teams, or very uneven load.</p>

<h2>A famous step back</h2>
<p>
	In 2023, Amazon’s Prime Video team wrote about a monitoring service that checked video streams for quality problems. It was built from separate
	serverless pieces passing data between them, and the passing was the expensive part. They merged it into a single process, deployed as one unit,
	and reported infrastructure costs falling by over 90%. The lesson isn’t “microservices are bad”; it is that the boundaries cost real money, so
	put them only where they earn it.
</p>

<h2>The answer: a modular monolith first</h2>
<p>
	Build one deployable app, but keep clear walls inside it: separate modules for billing, accounts, search and so on, each with a small public
	interface and its own tables. You get cheap calls, simple transactions and one deploy, and the walls are already in place if a module later needs
	to become its own service.
</p>
<p>Split a module out when you can name the reason, for example:</p>
<ul>
	<li>a separate team needs to release it on its own schedule;</li>
	<li>it needs to scale, or fail, independently of the rest;</li>
	<li>it has different requirements, such as a different language, security boundary or compliance rule.</li>
</ul>

<Note title="Watch for the distributed monolith" tone="warn">
	The worst of both worlds: many services that must still be deployed together because they share a database or call each other in long chains.
	If every feature touches five services, the boundaries are in the wrong place.
</Note>

<h2>Why it matters to you</h2>
<p>
	For a side project, a startup or a small team, start with one app and good module boundaries. Treat microservices as a tool for problems you can
	point to, not a sign of a serious system.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://martinfowler.com/bliki/MonolithFirst.html" rel="external">Martin Fowler: MonolithFirst</a></li>
	<li><a href="https://martinfowler.com/articles/microservice-trade-offs.html" rel="external">Martin Fowler: Microservice trade-offs</a></li>
</ul>
