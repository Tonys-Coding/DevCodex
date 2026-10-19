<script lang="ts">
	import { onMount } from 'svelte';
	import type { EditorView } from '@codemirror/view';
	import type { Compartment } from '@codemirror/state';
	import type { Language } from '../../content/types';

	let {
		value = $bindable(''),
		language,
		label,
		onrun
	}: { value: string; language: Language; label: string; onrun?: () => void } = $props();

	let host = $state<HTMLDivElement>();
	let view: EditorView | undefined;
	let langSlot: Compartment | undefined;
	let langFor: ((l: Language) => import('@codemirror/state').Extension) | undefined;
	let ready = $state(false);

	onMount(() => {
		let destroyed = false;
		(async () => {
			// CodeMirror is only downloaded on practice pages.
			const [{ basicSetup }, { EditorView, keymap }, { EditorState, Compartment }, { indentWithTab }, { python }, { javascript }, { HighlightStyle, syntaxHighlighting, indentUnit }, { tags: t }] =
				await Promise.all([
					import('codemirror'),
					import('@codemirror/view'),
					import('@codemirror/state'),
					import('@codemirror/commands'),
					import('@codemirror/lang-python'),
					import('@codemirror/lang-javascript'),
					import('@codemirror/language'),
					import('@lezer/highlight')
				]);
			if (destroyed || !host) return;

			langFor = (l) => (l === 'python' ? [python(), indentUnit.of('    ')] : [javascript(), indentUnit.of('  ')]);
			langSlot = new Compartment();

			const binder = EditorView.theme(
				{
					'&': { backgroundColor: '#0b0a0e', color: 'var(--ink)', fontSize: '0.92rem', height: '100%' },
					'.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.65' },
					'.cm-content': { caretColor: 'var(--gold)', padding: '0.9rem 0' },
					'.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--gold)', borderLeftWidth: '2px' },
					'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'rgb(255 201 74 / 0.28) !important' },
					'.cm-gutters': { backgroundColor: '#0b0a0e', color: 'var(--ink-3)', border: 'none', paddingLeft: '0.4rem' },
					'.cm-activeLine': { backgroundColor: 'rgb(255 255 255 / 0.04)' },
					'.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
					'.cm-matchingBracket': { backgroundColor: 'rgb(31 207 169 / 0.22)', outline: 'none' },
					'.cm-tooltip': { backgroundColor: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: '10px' },
					'.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'var(--panel-2)', color: 'var(--ink)' },
					'&.cm-focused': { outline: 'none' }
				},
				{ dark: true }
			);

			const highlight = HighlightStyle.define([
				{ tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#b9a3ff' },
				{ tag: [t.string, t.special(t.string)], color: '#4fdcbc' },
				{ tag: [t.number, t.bool, t.null], color: '#ff935f' },
				{ tag: [t.comment, t.lineComment, t.blockComment], color: '#8f86a1', fontStyle: 'italic' },
				{ tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.function(t.variableName))], color: '#ffd36e' },
				{ tag: [t.propertyName], color: '#e7def5' },
				{ tag: [t.operator, t.punctuation, t.bracket], color: '#c0b8cf' },
				{ tag: [t.className, t.typeName], color: '#ff935f' }
			]);

			view = new EditorView({
				parent: host,
				state: EditorState.create({
					doc: value,
					extensions: [
						basicSetup,
						keymap.of([
							indentWithTab,
							{
								key: 'Mod-Enter',
								run: () => {
									onrun?.();
									return true;
								}
							}
						]),
						langSlot.of(langFor(language)),
						binder,
						syntaxHighlighting(highlight),
						EditorView.contentAttributes.of({ 'aria-label': label }),
						EditorView.updateListener.of((update) => {
							if (update.docChanged) value = update.state.doc.toString();
						})
					]
				})
			});
			ready = true;
		})();

		return () => {
			destroyed = true;
			view?.destroy();
		};
	});

	// Outside changes (reset, show solution, language switch) replace the document.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
		}
	});

	$effect(() => {
		const l = language;
		if (view && langSlot && langFor) view.dispatch({ effects: langSlot.reconfigure(langFor(l)) });
	});
</script>

<div class="editor" bind:this={host}>
	{#if !ready}
		<pre class="fallback" aria-label="{label} (loading editor)">{value}</pre>
	{/if}
</div>

<style>
	.editor {
		min-height: 18rem;
		border-radius: 22px;
		border: 1px solid var(--rule);
		background: #0b0a0e;
		overflow: hidden;
	}

	.editor:focus-within {
		border-color: var(--gold);
	}

	.editor :global(.cm-editor) {
		min-height: 18rem;
	}

	.fallback {
		margin: 0;
		padding: 0.9rem 1rem 0.9rem 3rem;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-2);
		white-space: pre;
		overflow-x: auto;
	}
</style>
