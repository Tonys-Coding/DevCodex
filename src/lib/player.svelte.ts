import { prefersReducedMotion } from 'svelte/motion';

/**
 * Drives an auto-advancing short: a list of scenes, each held for `hold` ms.
 * Pauses when not visible; under reduced motion it never auto-advances.
 */
export class ScenePlayer {
	index = $state(0);
	/** 0..1 progress through the current scene, for progress bars. */
	elapsed = $state(0);
	playing = $state(false);

	#frame = 0;
	#last = 0;

	constructor(
		public count: number,
		public hold = 3200
	) {}

	get atEnd() {
		return this.index === this.count - 1;
	}

	play() {
		if (this.playing) return;
		if (prefersReducedMotion.current) return;
		this.playing = true;
		this.#last = performance.now();
		this.#frame = requestAnimationFrame(this.#tick);
	}

	pause() {
		this.playing = false;
		cancelAnimationFrame(this.#frame);
	}

	toggle() {
		if (this.playing) this.pause();
		else {
			if (this.atEnd && this.elapsed >= 1) this.go(0);
			this.play();
		}
	}

	go(index: number) {
		this.index = Math.max(0, Math.min(this.count - 1, index));
		this.elapsed = 0;
		this.#last = performance.now();
	}

	next = () => this.go(this.index + 1);
	prev = () => this.go(this.index - 1);

	#tick = (now: number) => {
		if (!this.playing) return;
		this.elapsed = Math.min(1, this.elapsed + (now - this.#last) / this.hold);
		this.#last = now;
		if (this.elapsed >= 1) {
			if (this.atEnd) {
				this.pause();
				return;
			}
			this.go(this.index + 1);
		}
		this.#frame = requestAnimationFrame(this.#tick);
	};
}

/** Svelte action: call `onchange(true|false)` as the node enters/leaves view. */
export function inView(node: Element, onchange: (visible: boolean) => void) {
	const observer = new IntersectionObserver(
		([entry]) => onchange(entry.isIntersecting && entry.intersectionRatio > 0.6),
		{ threshold: [0, 0.6, 1] }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
