<script lang="ts">
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What happened</h2>
<p>
	On 19 October 2026, Reuters and other outlets reported findings from Snorre Fagerland, a researcher at the security company NorForge. From
	25 September, one operator had used AI agents to attack roughly 1,200 company websites in the US, Canada, Australia and Japan, and had got
	into more than 100 of them. Named victims included Deere, SharkNinja and Cummins. The companies said the damage was limited or still under
	investigation: Deere found no sign that sensitive data was accessed, and SharkNinja said a standalone support site was hit and contained.
</p>
<p>
	The agents ran on Cairn, an open-source platform for coordinating several AI agents on one task. Fagerland found the campaign by scanning the
	internet for Cairn control panels left open to anyone, and could read what the agents were doing.
</p>

<h2>What the agents actually did</h2>
<p>
	According to the research, the operator’s instructions were under 100 Chinese characters. The agents did the rest: mapping each site, trying
	known weaknesses, reading error messages, adjusting and trying again. A successful break-in took about 23 hours on average, and the researcher
	estimates around $50 of AI usage per success, about $5,000 in all.
</p>
<p>
	That is the real change. None of these attacks needed a new technique. What used to need a skilled person’s patience for days per target now
	runs on its own, in parallel, for the price of a meal per site.
</p>

<Note title="Treat the numbers with care" tone="warn">
	The figures come from one researcher’s analysis and the companies’ brief statements. Which AI models were used, and what if anything was taken,
	had not been confirmed when this was written.
</Note>

<h2>Why old holes are suddenly urgent</h2>
<p>
	Many sites carry small problems for years because nobody bothers to exploit them: an outdated plugin, a forgotten test page, an admin panel
	reachable from the internet, an error message that reveals too much. Each one alone looks minor. An agent that can try thousands of combinations
	without getting bored turns a pile of minor problems into a way in.
</p>

<h2>The defences are the boring ones</h2>
<div class="table-wrap">
	<table>
		<thead><tr><th scope="col">Habit</th><th scope="col">Why it matters more now</th></tr></thead>
		<tbody>
			<tr><th scope="row">Patch quickly</th><td>Known weaknesses are the first thing an agent tries, on every site at once.</td></tr>
			<tr><th scope="row">Keep admin panels off the public internet</th><td>Login pages for tools, dashboards and databases are easy targets. Put them behind a VPN or single sign-on.</td></tr>
			<tr><th scope="row">Least privilege</th><td>If a support site is breached, its accounts and keys shouldn’t reach anything else.</td></tr>
			<tr><th scope="row">Rate limits and monitoring</th><td>Agents are tireless but noisy: thousands of probing requests stand out if anyone is watching.</td></tr>
			<tr><th scope="row">Plain error pages</th><td>Detailed errors teach an attacker, human or AI, what to try next.</td></tr>
		</tbody>
	</table>
</div>

<p>
	There is an irony in how this campaign was found: the attacker left their own agent dashboards exposed. Running agents securely is hard for
	everyone, on both sides.
</p>

<h2>Why it matters to you</h2>
<p>
	If you run anything on the internet, even a side project, assume it will be probed by automated tools that never give up. Update dependencies,
	don’t expose admin tools, and give every service only the access it needs. And if you build with AI agents yourself, protect their control
	panels like any other admin tool.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://thenextweb.com/news/ai-agents-hacker-cairn-100-sites-deere-norforge" rel="external">The Next Web: AI agents broke into 100+ sites for one hacker, researcher says</a></li>
	<li><a href="https://it.slashdot.org/story/26/10/19/1746204/a-hacker-broke-into-john-deere-sharkninja-with-an-army-of-ai-agents" rel="external">Slashdot: A hacker broke into John Deere and SharkNinja with AI agents (with links to Reuters)</a></li>
	<li><a href="https://owasp.org/www-project-top-ten/" rel="external">OWASP Top 10: the most common web application risks</a></li>
</ul>
