<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What changed</h2>
<p>
	Until this year the TypeScript compiler, <code>tsc</code>, was itself written in TypeScript and ran on Node.js. TypeScript 7, released on
	8 July 2026, is a port of that compiler to Go. The team kept the structure and logic of the original as faithfully as possible, so type checking
	gives the same answers; only the engine underneath changed.
</p>

<h2>How much faster</h2>
<p>Microsoft’s own measurements of full builds, TypeScript 6 against 7:</p>

<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Project</th><th scope="col">TypeScript 6</th><th scope="col">TypeScript 7</th><th scope="col">Speed-up</th></tr></thead>
		<tbody>
			<tr><th scope="row">VS Code</th><td>125.7 s</td><td>10.6 s</td><td>11.9×</td></tr>
			<tr><th scope="row">Sentry</th><td>139.8 s</td><td>15.7 s</td><td>8.9×</td></tr>
			<tr><th scope="row">Playwright</th><td>12.8 s</td><td>1.47 s</td><td>8.7×</td></tr>
		</tbody>
	</table>
</div>

<p>
	In the editor, the first error in the VS Code codebase now appears in under 1.3 seconds instead of about 17.5. Memory use also fell, by 18% on
	VS Code.
</p>

<h2>Why a port is faster</h2>
<ul>
	<li><strong>Native code.</strong> Go compiles to machine code ahead of time. There is no JavaScript engine to start and warm up on every run.</li>
	<li><strong>Real threads with shared memory.</strong> JavaScript runs one thread per worker, and workers can’t easily share large data structures. Go can check several files at once over the same data. By default TypeScript 7 runs four checkers in parallel.</li>
	<li><strong>Tighter data.</strong> Go lets the team lay out the compiler’s data structures more compactly than JavaScript objects allow, which helps memory and the CPU cache.</li>
</ul>

<Code
	lang="text"
	code={`npm install -D typescript     # installs TypeScript 7; the command is still tsc
npx tsc --checkers 8          # more parallel checkers: faster, more memory
npx tsc --singleThreaded      # one thread, for debugging or small machines`}
	caption="--checkers and --builders are marked experimental."
/>

<h2>What hasn’t caught up yet</h2>
<ul>
	<li><strong>No programmatic API in 7.0.</strong> Tools that call into the compiler from JavaScript need to wait; a new API is planned for 7.1.</li>
	<li><strong>Editor plugins for other file types.</strong> Language-server support for Vue, Svelte, Astro, MDX and Angular templates isn’t supported yet. Those projects should keep TypeScript 6 for editor features.</li>
	<li><strong>Old options are now errors.</strong> Settings deprecated in 6.0, such as <code>target: es5</code> and <code>baseUrl</code>, now stop the build, and <code>strict</code> is on by default.</li>
</ul>

<Note title="Running both side by side" tone="tip">
	The <code>@typescript/typescript6</code> package installs the old compiler as <code>tsc6</code>, so a project can build with 7 and keep 6 for
	tools that still need it.
</Note>

<h2>Why it matters to you</h2>
<p>
	On a big codebase, slow type checking was a real tax on every save and every CI run. If your project compiles cleanly on TypeScript 6 with no
	deprecation warnings, upgrading is mostly a version bump. If you use Svelte or Vue, like this app does, keep TypeScript 6 for the editor until
	their tools catch up. And as a general lesson: sometimes the biggest speed-up comes from changing the runtime, not the algorithm.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/" rel="external">Microsoft: Announcing TypeScript 7.0</a></li>
	<li><a href="https://github.com/microsoft/typescript-go" rel="external">GitHub: microsoft/typescript-go</a></li>
</ul>
