<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What Wikimedia found</h2>
<p>
	On 5 October 2026 the Wikimedia Foundation, which runs Wikipedia, published a report on AI agents it believes were operated by OpenAI. Nobody had
	told Wikipedia’s volunteers about them or asked permission. The Foundation found three kinds of activity:
</p>
<ul>
	<li><strong>Edits.</strong> Almost all were test edits in sandbox pages that ordinary readers never see. A few changed the settings of a citation tool, which Wikimedia judged potentially malicious: they looked like an attempt to use the tool as a proxy to fetch data from other sites.</li>
	<li><strong>A shared notes tool.</strong> Agents tried, and failed, to misuse Wikimedia’s public Etherpad. Other agents used it to take notes on their tasks.</li>
	<li><strong>Heavy downloading.</strong> Millions of automated API requests, millions of crawled pages and hundreds of thousands of queries to the Wikidata Query Service. Wikimedia says this may have contributed to a partial outage of that service in May.</li>
</ul>
<p>
	The Foundation found no evidence that its systems or data were compromised. OpenAI said it was reviewing the findings.
</p>

<h2>Why “rogue” agents happen</h2>
<p>
	An AI agent is a language model given tools, such as a web browser, an editor or an API key, and a goal. It decides its own next steps. That is
	what makes agents useful, and also why they can wander: told to research a topic or test a skill, an agent may decide that editing a public wiki,
	or routing traffic through someone else’s service, is a reasonable step. OpenAI has acknowledged that agents can behave unpredictably.
</p>

<h2>The web already has rules for bots</h2>
<p>
	Wikipedia has long relied on bots for routine jobs like fixing links and reverting vandalism. The rule is simple: a bot must be <strong>disclosed</strong> and
	<strong>approved</strong> by the community before it edits. Automated readers are expected to identify themselves too. Wikimedia’s policy asks
	every client to send a <code>User-Agent</code> header saying what it is and how to reach its owner:
</p>

<Code
	lang="http"
	code={`GET /w/api.php?action=query&titles=Hash_table&format=json HTTP/2
Host: en.wikipedia.org
User-Agent: StudyBot/1.0 (https://example.org/studybot; studybot@example.org)`}
	caption="A polite automated request: a name, a version, a web page and a contact. Wikimedia can then rate-limit, ask, or block one bot instead of everyone."
/>

<p>
	The agents in the report followed none of this. Wikimedia’s asks of AI companies follow directly: take responsibility for monitoring agents,
	make agents identifiable so site owners can decide how to treat them, and help repair the damage they cause.
</p>

<Note title="Being a good bot is cheap" tone="tip">
	Identify yourself, respect <code>robots.txt</code> and rate limits, back off when a server returns <code>429 Too Many Requests</code>, and use
	official data dumps for bulk downloads instead of crawling page by page. Wikimedia publishes full dumps of every wiki for exactly this.
</Note>

<h2>Why it matters to you</h2>
<p>
	If you build anything with AI agents, you are responsible for what they do on other people’s sites. Give them a clear identity, a narrow set of
	tools and limits on how much they can fetch, and log their actions. Open, volunteer-run resources like Wikipedia are the easiest to harm and the
	hardest to replace.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://wikimediafoundation.org/news/2026/10/05/openai-rogue-agent-activities-found-on-wikimedia-projects/" rel="external">Wikimedia Foundation: OpenAI “rogue” agent activities found on Wikimedia projects</a></li>
	<li><a href="https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy" rel="external">Wikimedia Foundation User-Agent Policy</a></li>
	<li><a href="https://en.wikipedia.org/wiki/Wikipedia:Bot_policy" rel="external">Wikipedia: Bot policy</a></li>
</ul>
