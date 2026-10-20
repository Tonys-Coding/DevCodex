<script lang="ts">
	import { liveArticles } from '#lib/content/catalog.js';
	import { cards } from '#lib/content/cards.js';
	import { problems } from '#lib/content/problems.js';
	import { progress } from '#lib/progress/progress.svelte.js';
	import { depths } from '#lib/content/levels.js';
	import { downloadBackup } from '#lib/progress/dashboard.js';
	import Icon from '#lib/components/Icon.svelte';
	import Medals from '#lib/components/home/Medals.svelte';

	const finished = $derived(liveArticles.filter((a) => progress.isDone(a.id)).length);
	const solved = $derived(Object.keys(progress.data.solved).length);
	const reviewed = $derived(Object.values(progress.data.cards).reduce((n, c) => n + c.knew + c.again, 0));

	let message = $state('');
	let confirmReset = $state(false);
	let fileInput = $state<HTMLInputElement>();

	function download() {
		downloadBackup(progress.export());
		message = 'Progress file saved. Open it on another device with “Import progress”.';
	}

	const lastBackup = $derived(
		progress.data.backup?.exported
			? new Date(progress.data.backup.exported).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
			: null
	);

	let nameDraft = $state('');
	let nameSaved = $state(false);
	$effect(() => {
		// Fill the field once progress has loaded.
		if (progress.loaded) nameDraft = progress.data.profile?.name ?? '';
	});
	function saveName(event: SubmitEvent) {
		event.preventDefault();
		progress.setName(nameDraft);
		nameSaved = true;
	}
	const goal = $derived(progress.data.profile?.weeklyGoal ?? 2);

	async function load(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const ok = progress.import(await file.text());
		message = ok ? 'Progress imported.' : 'That file is not a DevCodex progress export, so nothing changed.';
		(event.currentTarget as HTMLInputElement).value = '';
	}

	async function reset() {
		await progress.reset();
		confirmReset = false;
		message = 'Progress cleared on this device.';
	}
</script>

<svelte:head>
	<title>You · DevCodex</title>
</svelte:head>

<div class="you">
	<h1>Your progress</h1>

	<dl class="ledger">
		<div><dt>Learning streak</dt><dd>{progress.streak} day{progress.streak === 1 ? '' : 's'}</dd></div>
		<div><dt>Articles finished</dt><dd>{finished} of {liveArticles.length}</dd></div>
		<div><dt>Cards collected</dt><dd>{progress.unlockedCards.length} of {cards.length}</dd></div>
		<div><dt>Card reviews</dt><dd>{reviewed}</dd></div>
		<div><dt>Problems solved</dt><dd>{solved} of {problems.length}</dd></div>
	</dl>

	<section class="settings" aria-labelledby="settings-title">
		<h2 id="settings-title">Settings</h2>

		<form class="field" onsubmit={saveName}>
			<label for="you-name">Your name</label>
			<div class="row">
				<input id="you-name" bind:value={nameDraft} oninput={() => (nameSaved = false)} maxlength="40" autocomplete="given-name" placeholder="Shown in the dashboard greeting" />
				<button type="submit" class="btn">Save</button>
			</div>
			{#if nameSaved}<p class="msg" role="status">{nameDraft.trim() ? 'Saved.' : 'Name removed.'}</p>{/if}
		</form>

		<fieldset class="field">
			<legend>How deep lessons open</legend>
			<div class="choices">
				{#each depths as d (d.id)}
					<label class:on={progress.data.profile?.depth === d.id}>
						<input type="radio" name="you-depth" class="visually-hidden" checked={progress.data.profile?.depth === d.id} onchange={() => progress.setDepth(d.id)} />
						{d.label}
					</label>
				{/each}
			</div>
			<p class="hint">Core always opens. Pick Going deeper or Under the hood to open those layers by default too.</p>
		</fieldset>

		<div class="field">
			<p class="label" id="goal-label">Weekly goal</p>
			<div class="stepper" role="group" aria-labelledby="goal-label">
				<button type="button" onclick={() => progress.setWeeklyGoal(goal - 1)} disabled={goal <= 1} aria-label="Lower the goal">−</button>
				<span>{goal} {goal === 1 ? 'lesson' : 'lessons'} a week</span>
				<button type="button" onclick={() => progress.setWeeklyGoal(goal + 1)} disabled={goal >= 7} aria-label="Raise the goal">+</button>
			</div>
		</div>
	</section>

	<Medals mode="full" />

	<section class="panel" aria-labelledby="data-title">
		<h2 id="data-title">Your data</h2>
		<p>
			{#if progress.persistent}
				Everything is saved in this browser on this device. Nothing is sent anywhere. To move to another device, export a file here and import it
				there.
			{:else}
				This browser is not letting DevCodex save (private browsing can do this). Progress lasts until you close the tab, so export a file if you
				want to keep it.
			{/if}
		</p>
		<p class="backup-state">{lastBackup ? `Last backup: ${lastBackup}.` : 'No backup yet.'}</p>
		<div class="actions">
			<button class="btn" type="button" onclick={download}><Icon name="download" size={18} stroke={2} /> Export progress</button>
			<button class="btn" type="button" onclick={() => fileInput?.click()}><Icon name="upload" size={18} stroke={2} /> Import progress</button>
			<input bind:this={fileInput} type="file" accept="application/json,.json" class="visually-hidden" tabindex="-1" onchange={load} aria-label="Progress file to import" />
		</div>
		{#if confirmReset}
			<div class="confirm" role="alertdialog" aria-labelledby="reset-q">
				<p id="reset-q">Clear all progress on this device? Finished articles, cards and solved problems will be lost unless you exported them.</p>
				<div class="actions">
					<button class="btn danger" type="button" onclick={reset}>Yes, clear it</button>
					<button class="btn" type="button" onclick={() => (confirmReset = false)}>Keep my progress</button>
				</div>
			</div>
		{:else}
			<button class="link" type="button" onclick={() => (confirmReset = true)}>Clear progress on this device</button>
		{/if}
		{#if message}<p class="msg" role="status">{message}</p>{/if}
	</section>

	<section class="panel" id="install" aria-labelledby="install-title">
		<h2 id="install-title">Install DevCodex</h2>
		<p>DevCodex works like an app once installed: its own icon, full screen, and it opens offline.</p>
		<ul class="steps">
			<li><strong>iPhone or iPad:</strong> open this site in Safari, tap the Share button, then “Add to Home Screen”.</li>
			<li><strong>Mac:</strong> in Safari, choose File, then “Add to Dock”.</li>
			<li><strong>Android, Windows or Chrome:</strong> use the install icon in the address bar, or “Install app” in the browser menu.</li>
		</ul>
	</section>
</div>

<style>
	.you {
		display: grid;
		gap: 1.5rem;
		max-width: 42rem;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
	}

	.ledger {
		border-radius: 22px;
		background: var(--panel);
		border: 1px solid var(--rule);
		overflow: hidden;
	}

	.ledger div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1.15rem;
		border-bottom: 1px solid var(--rule);
	}

	.ledger div:last-child {
		border-bottom: 0;
	}

	dt {
		color: var(--ink-2);
	}

	dd {
		margin: 0;
		font-family: var(--display);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.panel {
		display: grid;
		gap: 0.8rem;
		padding: 1.2rem;
		border-radius: 22px;
		background: var(--panel);
		border: 1px solid var(--rule);
	}

	h2 {
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.panel p {
		color: var(--ink-2);
		line-height: 1.6;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 3rem;
		padding: 0 1.15rem;
		border-radius: 999px;
		border: 2px solid var(--rule);
		background: var(--panel-2);
		color: var(--ink);
		font-weight: 700;
		cursor: pointer;
	}

	.btn:hover {
		border-color: var(--gold);
	}

	.btn.danger {
		background: var(--miss);
		border-color: var(--miss);
		color: var(--miss-ink);
	}

	.link {
		justify-self: start;
		min-height: 2.75rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink-3);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	.confirm {
		display: grid;
		gap: 0.7rem;
		padding: 1rem;
		border-radius: 16px;
		background: rgb(255 107 129 / 0.1);
		border: 1px solid rgb(255 107 129 / 0.4);
	}

	.confirm p {
		color: var(--ink);
	}

	.msg {
		font-weight: 700;
		color: var(--gold) !important;
	}

	.settings {
		display: grid;
		gap: 1.4rem;
	}

	.field {
		display: grid;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.field label[for],
	.field legend,
	.label {
		font-weight: 800;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
		align-items: center;
	}

	.row input {
		flex: 1 1 14rem;
		min-height: 2.9rem;
		border: 0;
		border-bottom: 2px solid var(--rule);
		background: none;
		color: var(--ink);
		font-size: 1.05rem;
		outline: none;
	}

	.row input:focus {
		border-bottom-color: var(--gold);
	}

	.choices {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.4rem;
	}

	.choices label {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		border-bottom: 3px solid transparent;
		color: var(--ink-2);
		font-weight: 800;
		cursor: pointer;
	}

	.choices label.on {
		color: var(--ink);
		border-bottom-color: var(--gold);
	}

	.choices label:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	.hint,
	.backup-state {
		font-size: 0.95rem;
		color: var(--ink-2);
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--ink-2);
	}

	.stepper button {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 2px solid var(--rule);
		border-radius: 50%;
		background: none;
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 800;
		cursor: pointer;
	}

	.stepper button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.steps {
		display: grid;
		gap: 0.5rem;
		padding-left: 1.1rem;
		list-style: disc;
		color: var(--ink-2);
		line-height: 1.55;
	}

	.steps strong {
		color: var(--ink);
	}
</style>
