<script lang="ts">
	import { renderSvg, type Frame, type Scene } from './iso/geometry';
	import './iso/iso.css';

	/**
	 * A faint isometric "clay" illustration. The scene is built and depth-sorted by
	 * iso/geometry.ts and drawn at the frame's shared scale, so a cube is the same size on
	 * every banner of one kind. Rendered at build time; there is no client-side drawing.
	 */
	let { scene, frame }: { scene: Scene; frame: Frame } = $props();

	/**
	 * A stable id for the shadow filter, from the scene itself, so the server and the
	 * browser always agree. Identical scenes share identical filters, which is harmless.
	 */
	function hash(text: string) {
		let h = 5381;
		for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
		return h.toString(36);
	}
	// Numbers are rounded first: sin and cos can differ in the last bit between engines.
	const key = (k: string, v: unknown) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v);
	const svg = $derived(renderSvg(scene, frame, hash(JSON.stringify([scene, frame], key))));
</script>

<span class="iso-art">{@html svg}</span>

<style>
	.iso-art {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
