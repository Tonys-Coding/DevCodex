import { frameFor, type Item, type Mark, type P2, type P3, type Scene, type Tone } from './iso/geometry';

/**
 * Isometric scenes for topic and lesson banners (drawn by IsoArt, checked by
 * `npm run content:check`, reviewed with `npm run art:sheet`). Each one is a small model
 * of the idea: the subject is the accent, context is base or dim.
 *
 * Each topic has its own visual vocabulary, so topics never look alike:
 * - How the Web Works: infrastructure. Browser windows, globes, servers, cables,
 *   envelopes, houses with roofs, cookies and clocks.
 * - Programming Concepts: abstract and flat. Code documents, gears, name tags, a thick
 *   looping track, curly braces drawn on the floor.
 * - Data Structures: geometric. Flat tiles, sphere nodes, open buckets, flag pins, rails.
 *
 * Positions run along the screen: `s` left to right and `d` towards the viewer, snapped
 * to a quarter unit; `z` is height. Objects are placed by their centre, and arrows are
 * links between named objects, so they always start and end at a surface.
 */

const snap = (n: number) => Math.round(n * 4) / 4;
/** Screen-sideways position s and depth d to scene x and y. */
const H = (s: number, d = 0): P2 => [(snap(s) + snap(d)) / 2, (snap(d) - snap(s)) / 2];
/** Unsnapped, for smooth curves. */
const Hx = (s: number, d = 0): P2 => [(s + d) / 2, (d - s) / 2];

type Opts = { d?: number; z?: number; tone?: Tone };

/** Points on an object's visible faces, in 0–1 coordinates across each face. */
type Faces = { top: (u: number, v: number) => P3; right: (v: number, t: number) => P3; left: (u: number, t: number) => P3 };
function facesOf([x, y, z]: P3, [w, d, h]: P3): Faces {
	const e = 0.003;
	return {
		top: (u, v) => [x + u * w, y + v * d, z + h + e],
		right: (v, t) => [x + w + e, y + v * d, z + t * h],
		left: (u, t) => [x + u * w, y + d + e, z + t * h]
	};
}
const seg = (a: P3, b: P3, ink?: Mark['ink']): Mark => ({ points: [a, b], ink });
/** A small closed ring on a face, in that face's 0–1 coordinates. */
const ring = (at: (a: number, b: number) => P3, a: number, b: number, ra: number, rb: number, fill = false, ink?: Mark['ink']): Mark => ({
	points: Array.from({ length: 12 }, (_, k) => at(a + ra * Math.cos((k / 12) * Math.PI * 2), b + rb * Math.sin((k / 12) * Math.PI * 2))),
	closed: true,
	fill,
	ink
});

/** A box placed by the centre of its footprint, with optional surface marks. */
function block(id: string | undefined, s: number, size: P3, o: Opts = {}, marks?: (f: Faces) => Mark[]): Item {
	const [cx, cy] = H(s, o.d ?? 0);
	const at: P3 = [cx - size[0] / 2, cy - size[1] / 2, o.z ?? 0];
	return { kind: 'box', id, at, size, tone: o.tone ?? 'base', marks: marks?.(facesOf(at, size)) };
}
function disc(id: string | undefined, s: number, r: number, h: number, o: Opts = {}, marks?: (top: (dx: number, dy: number) => P3) => Mark[]): Item {
	const [cx, cy] = H(s, o.d ?? 0);
	const z = o.z ?? 0;
	return { kind: 'cyl', id, at: [cx, cy, z], r, h, tone: o.tone ?? 'base', marks: marks?.((dx, dy) => [cx + dx, cy + dy, z + h + 0.003]) };
}
function ball(id: string | undefined, s: number, r: number, o: Opts = {}, marks?: (c: P3) => Mark[]): Item {
	const [cx, cy] = H(s, o.d ?? 0);
	const c: P3 = [cx, cy, (o.z ?? 0) + r];
	return { kind: 'sphere', id, at: c, r, tone: o.tone ?? 'base', marks: marks?.(c) };
}
/** A prism from a footprint given in (s, d) offsets around a centre. */
function prism(id: string | undefined, s: number, shape: P2[], h: number, o: Opts = {}, marks?: Mark[]): Item {
	const d0 = o.d ?? 0;
	return { kind: 'prism', id, base: shape.map(([ds, dd]) => Hx(snap(s) + ds, snap(d0) + dd)), z: o.z ?? 0, h, tone: o.tone ?? 'base', marks };
}
const link = (from: string, to: string, o: { arrow?: boolean; dashed?: boolean; pipe?: boolean; tone?: Tone; level?: number } = {}): Item => ({
	kind: 'link',
	from,
	to,
	arrow: o.arrow ?? !o.pipe,
	...o
});
/** A free line through (s, d, z) points. */
const path = (points: P3[], o: { arrow?: boolean; pipe?: boolean; dashed?: boolean; tone?: Tone } = {}): Item => ({
	kind: 'line',
	points: points.map(([s, d, z]): P3 => [...Hx(s, d), z]),
	arrow: o.arrow ?? false,
	...o
});
/** Points round a flat ellipse on the floor (screen-sideways radius rs, depth radius rd). */
const oval = (cs: number, rs: number, rd: number, from: number, to: number, z = 0.06, n = 32): P3[] =>
	Array.from({ length: n + 1 }, (_, k): P3 => {
		const a = from + ((to - from) * k) / n;
		return [cs + rs * Math.cos(a), rd * Math.sin(a), z];
	});

// How the Web Works: infrastructure -------------------------------------------

/**
 * A browser window standing on its edge: address bar, buttons and lines of text. It faces
 * right (towards things on its right) or left, so arrows always meet its screen.
 */
function browser(id: string, s: number, o: Opts & { facing?: 'right' | 'left' } = {}): Item {
	if (o.facing === 'left')
		return block(id, s, [2.5, 0.18, 1.75], o, (f) => [
			seg(f.left(0.04, 0.78), f.left(0.96, 0.78), 'ink'),
			ring(f.left, 0.1, 0.89, 0.025, 0.04, true, 'light'),
			ring(f.left, 0.16, 0.89, 0.025, 0.04, true),
			seg(f.left(0.28, 0.89), f.left(0.88, 0.89)),
			seg(f.left(0.14, 0.6), f.left(0.8, 0.6)),
			seg(f.left(0.14, 0.46), f.left(0.65, 0.46)),
			seg(f.left(0.14, 0.32), f.left(0.72, 0.32)),
			seg(f.left(0.14, 0.18), f.left(0.55, 0.18))
		]);
	return block(id, s, [0.18, 2.5, 1.75], o, (f) => [
		seg(f.right(0.04, 0.78), f.right(0.96, 0.78), 'ink'),
		ring(f.right, 0.9, 0.89, 0.025, 0.04, true, 'light'),
		ring(f.right, 0.84, 0.89, 0.025, 0.04, true),
		seg(f.right(0.72, 0.89), f.right(0.12, 0.89)),
		seg(f.right(0.86, 0.6), f.right(0.2, 0.6)),
		seg(f.right(0.86, 0.46), f.right(0.35, 0.46)),
		seg(f.right(0.86, 0.32), f.right(0.28, 0.32)),
		seg(f.right(0.86, 0.18), f.right(0.45, 0.18))
	]);
}

/** A server: a tall box with drive slots and two status lights on its right-hand face. */
const server = (id: string, s: number, h = 2.4, o: Opts = {}) =>
	block(id, s, [1.2, 1.2, h], o, (f) => [
		...[0.86, 0.7, 0.54, 0.38].map((t) => seg(f.right(0.18, t), f.right(0.72, t), 'ink')),
		ring(f.right, 0.84, 0.86, 0.05, 0.03, true, 'light'),
		ring(f.right, 0.84, 0.7, 0.05, 0.03, true, 'light')
	]);

/** A globe: a sphere with its equator and two meridians (front halves only). */
const globe = (id: string, s: number, r: number, o: Opts = {}) =>
	ball(id, s, r, o, (c) => {
		const arc = (fn: (a: number) => P3): Mark => ({
			points: Array.from({ length: 33 }, (_, k) => fn((k / 32) * Math.PI * 2)).filter((p) => p[0] - c[0] + p[1] - c[1] + p[2] - c[2] >= -0.02 * r)
		});
		const rr = r * 1.002;
		/** A circle of latitude at height h (as a fraction of the radius). */
		const lat = (h: number) => {
			const k = rr * Math.sqrt(1 - h * h);
			return arc((a) => [c[0] + k * Math.cos(a), c[1] + k * Math.sin(a), c[2] + h * rr]);
		};
		/** A meridian through the poles, turned by `turn` from facing the viewer side-on. */
		const meridian = (turn: number) => {
			const u: P3 = [Math.cos(Math.PI / 4 + turn), Math.sin(Math.PI / 4 + turn), 0];
			return arc((a) => [c[0] + rr * Math.cos(a) * u[0], c[1] + rr * Math.cos(a) * u[1], c[2] + rr * Math.sin(a)]);
		};
		return [lat(0), lat(0.55), lat(-0.55), meridian(0), meridian(0.6), meridian(-0.6)];
	});

/** A small envelope: a flat box with its flap drawn on top. */
const envelope = (id: string, s: number, o: Opts = {}) =>
	block(id, s, [0.75, 0.55, 0.12], o, (f) => [seg(f.top(0, 0), f.top(0.5, 0.55), 'ink'), seg(f.top(0.5, 0.55), f.top(1, 0), 'ink')]);

/** A house: walls with a door and a window, and a pyramid roof. */
function house(id: string, s: number, k = 1.6, h = 1.3, o: Opts = {}): Item[] {
	const walls = block(id, s, [k, k, h], o, (f) => [
		{ points: [f.left(0.35, 0), f.left(0.35, 0.55), f.left(0.62, 0.55), f.left(0.62, 0)], ink: 'ink' },
		ring(f.right, 0.5, 0.6, 0.16, 0.14, true, 'ink')
	]);
	const [cx, cy] = H(s, o.d ?? 0);
	const half = k / 2 + 0.12;
	return [
		walls,
		{
			kind: 'pyramid',
			id: `${id}-roof`,
			base: [[cx - half, cy - half], [cx + half, cy - half], [cx + half, cy + half], [cx - half, cy + half]],
			z: h,
			apex: [cx, cy, h + 0.9],
			tone: o.tone ?? 'base'
		}
	];
}

/**
 * A gate across the path: two posts and a beam along the y axis, which runs diagonally
 * on screen, the way gates look in isometric drawings.
 */
function gate(id: string, s: number, span = 1.4, h = 1.9): Item[] {
	const [cx, cy] = H(s);
	const post = (dy: number, suffix: string): Item => ({ kind: 'box', id: `${id}-${suffix}`, at: [cx - 0.2, cy + dy - 0.2, 0], size: [0.4, 0.4, h], tone: 'base' });
	return [
		post(-span, 'back'),
		post(span, 'front'),
		{ kind: 'box', id, at: [cx - 0.22, cy - span - 0.3, h], size: [0.44, 2 * span + 0.6, 0.32], tone: 'accent' }
	];
}

/** A cookie: a flat cylinder with dark chips on top. */
const cookie = (id: string | undefined, s: number, r = 0.85, o: Opts = {}) =>
	disc(id, s, r, 0.24, o, (top) =>
		[[-0.3, -0.1], [0.25, -0.3], [0.1, 0.32], [-0.35, 0.35], [0.42, 0.18]].map(([dx, dy]) => ({
			points: Array.from({ length: 8 }, (_, k) => top(dx * r + 0.09 * Math.cos((k / 8) * Math.PI * 2), dy * r + 0.09 * Math.sin((k / 8) * Math.PI * 2))),
			fill: true,
			ink: 'ink' as const
		}))
	);

/** A clock: a squat cylinder with twelve ticks and two hands. */
const clock = (id: string, s: number, r = 0.85, o: Opts = {}) =>
	disc(id, s, r, 0.3, o, (top) => [
		...Array.from({ length: 12 }, (_, k): Mark => {
			const a = (k / 12) * Math.PI * 2;
			return seg(top(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78), top(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9), 'ink');
		}),
		seg(top(0, 0), top(-r * 0.55, -r * 0.1), 'ink'),
		seg(top(0, 0), top(r * 0.2, -r * 0.62), 'ink')
	]);

/** A book: a block with page edges along its side. */
const book = (id: string, s: number, o: Opts = {}) =>
	block(id, s, [1.3, 1.0, 0.55], o, (f) => [0.3, 0.5, 0.7].map((t) => seg(f.left(0.05, t), f.left(0.95, t), 'ink')));

// Programming Concepts: abstract and flat --------------------------------------

/** A code document lying flat: lines of different lengths and indents on top. */
const doc = (id: string | undefined, s: number, o: Opts = {}, k = 1.0) =>
	block(id, s, [1.7 * k, 2.1 * k, 0.12], o, (f) =>
		[
			[0.12, 0.7],
			[0.24, 0.55],
			[0.24, 0.8],
			[0.36, 0.45],
			[0.24, 0.62],
			[0.12, 0.35]
		].map(([u0, u1], i) => seg(f.top(u0, 0.14 + i * 0.14), f.top(u1, 0.14 + i * 0.14), o.tone === 'accent' ? undefined : 'ink'))
	);

/** A gear: a toothed prism with a hole in the middle. */
function gear(id: string, s: number, r = 1.0, o: Opts = {}): Item {
	const teeth = 10;
	const shape: P2[] = [];
	for (let k = 0; k < teeth * 2; k++) {
		const a = (k / (teeth * 2)) * Math.PI * 2;
		const rr = k % 2 ? r * 0.78 : r;
		shape.push([rr * Math.cos(a - 0.08), rr * Math.sin(a - 0.08)], [rr * Math.cos(a + 0.08), rr * Math.sin(a + 0.08)]);
	}
	const h = 0.4;
	const [cx, cy] = H(s, o.d ?? 0);
	const z = (o.z ?? 0) + h + 0.003;
	return prism(id, s, shape, h, o, [
		{ points: Array.from({ length: 14 }, (_, k): P3 => [cx + 0.26 * r * Math.cos((k / 14) * Math.PI * 2), cy + 0.26 * r * Math.sin((k / 14) * Math.PI * 2), z]), fill: true, ink: 'ink' }
	]);
}

/** A name tag: a flat pentagon with a hole at its point and a line for the name. */
function tag(id: string, s: number, o: Opts = {}): Item {
	const shape: P2[] = [[-0.85, -0.5], [0.5, -0.5], [0.95, 0], [0.5, 0.5], [-0.85, 0.5]];
	const [cx, cy] = H(s, o.d ?? 0);
	const z = (o.z ?? 0) + 0.14 + 0.003;
	const at = (ds: number, dd: number): P3 => [cx + (ds + dd) / 2, cy + (dd - ds) / 2, z];
	return prism(id, s, shape, 0.14, o, [
		{ points: Array.from({ length: 10 }, (_, k) => at(0.55 + 0.11 * Math.cos((k / 10) * Math.PI * 2), 0.11 * Math.sin((k / 10) * Math.PI * 2))), fill: true, ink: 'ink' },
		seg(at(-0.6, -0.12), at(0.15, -0.12), o.tone === 'accent' ? undefined : 'ink'),
		seg(at(-0.6, 0.15), at(-0.05, 0.15), o.tone === 'accent' ? undefined : 'ink')
	]);
}

/** A curly brace drawn on the floor, opening right ({) or left (}). */
function brace(s: number, dir: 1 | -1, half = 2.0): Item {
	const w = 0.45 * dir;
	return path(
		[
			[s + w, -half, 0.02],
			[s, -half + 0.35, 0.02],
			[s, -0.35, 0.02],
			[s - w, 0, 0.02],
			[s, 0.35, 0.02],
			[s, half - 0.35, 0.02],
			[s + w, half, 0.02]
		],
		{ tone: 'dim' }
	);
}

// Data Structures: geometric ---------------------------------------------------

/** A flat square tile with a dot in the middle. */
const tile = (id: string | undefined, s: number, o: Opts = {}, k = 0.95, h = 0.22) =>
	block(id, s, [k, k, h], o, (f) => [ring(f.top, 0.5, 0.5, 0.09, 0.09, true, o.tone === 'accent' ? 'light' : 'ink')]);

/** A sphere node. */
const node = (id: string, s: number, r = 0.5, o: Opts = {}) => ball(id, s, r, o);

/** An open bucket: a floor and four thin walls, so things can sit inside it. */
function bucket(id: string, s: number, k = 1.5, h = 0.75, o: Opts = {}): Item[] {
	const [cx, cy] = H(s, o.d ?? 0);
	const x0 = cx - k / 2;
	const y0 = cy - k / 2;
	const x1 = cx + k / 2;
	const y1 = cy + k / 2;
	const t = 0.1;
	const tone = o.tone ?? 'base';
	const b = (suffix: string, at: P3, size: P3): Item => ({ kind: 'box', id: `${id}${suffix}`, at, size, tone });
	return [
		b('', [x0, y0, 0], [k, k, t]),
		b('-back-x', [x0, y0, t], [t, k, h]),
		b('-back-y', [x0 + t, y0, t], [k - t, t, h]),
		b('-front-x', [x1 - t, y0 + t, t], [t, k - t, h]),
		b('-front-y', [x0 + t, y1 - t, t], [k - 2 * t, t, h])
	];
}

/** A funnel: an upside-down pyramid, wide at the top. */
function funnel(id: string, s: number, top: number, k = 1.5, o: Opts = {}): Item {
	const [cx, cy] = H(s, o.d ?? 0);
	const half = k / 2;
	return {
		kind: 'pyramid',
		id,
		base: [[cx - half, cy - half], [cx + half, cy - half], [cx + half, cy + half], [cx - half, cy + half]],
		z: top,
		apex: [cx, cy, top - 1.7],
		tone: o.tone ?? 'base'
	};
}

/** A flag pin: a thin pole with a flag at the top. */
function pin(id: string, s: number, o: Opts & { h?: number } = {}): Item[] {
	const h = o.h ?? 1.9;
	const z = o.z ?? 0;
	return [block(`${id}-pole`, s, [0.14, 0.14, h], { ...o, z, tone: 'base' }), block(id, s, [0.1, 0.95, 0.6], { ...o, d: (o.d ?? 0) + 0.6, z: z + h - 0.6 })];
}

/** A hexagonal tile. */
const hex = (id: string | undefined, s: number, r = 0.8, o: Opts = {}) =>
	prism(id, s, Array.from({ length: 6 }, (_, k): P2 => [r * Math.cos((k / 6) * Math.PI * 2), r * Math.sin((k / 6) * Math.PI * 2) * 0.9]), 0.22, o);

// Scenes -------------------------------------------------------------------------

export const topicScenes: Record<string, Scene> = {
	web: [
		browser('win', 0),
		envelope('pkt', 2.75, { z: 0.5, tone: 'accent', d: 0.5 }),
		globe('net', 6.0, 1.0, { tone: 'accent' }),
		server('srv', 10.25, 2.4),
		server('srv2', 12.75, 1.7, { tone: 'dim' }),
		link('win', 'net', { pipe: true, level: 0.15 }),
		link('net', 'srv', { pipe: true, level: 0.15 })
	],
	programming: [
		brace(-1.5, 1),
		brace(13.5, -1),
		doc('d-0', 1.25, { z: 0 }),
		doc('d-1', 1.25, { z: 0.22 }),
		gear('g', 6.25, 1.15, { tone: 'accent' }),
		doc('out', 11.0, { tone: 'accent' }, 0.85),
		link('d-1', 'g', { level: 0.28 }),
		link('g', 'out', { level: 0.08 })
	],
	structures: [
		hex(undefined, 0, 0.8),
		hex(undefined, 1.5, 0.8, { d: 1.35 }),
		hex(undefined, 1.5, 0.8, { d: -1.35 }),
		...[0, 1, 2, 3].map((k) => tile(`a-${k}`, 3.75 + k * 2.0, { tone: k === 1 ? 'accent' : 'base' }, 0.9)),
		node('root', 13.0, 0.5, { z: 1.9, tone: 'accent' }),
		node('l', 11.5, 0.42, { z: 0.6 }),
		node('r', 14.5, 0.42, { z: 0.6 }),
		link('root', 'l', { arrow: false, tone: 'dim' }),
		link('root', 'r', { arrow: false, tone: 'dim' })
	]
};

export const lessonScenes: Record<string, Scene> = {
	// How the Web Works ------------------------------------------------------
	'load-a-page': [
		browser('win', 0),
		book('dns', 4.75),
		server('srv', 11.5, 2.4, { tone: 'accent' }),
		link('win', 'dns', { level: 0.3 }),
		link('dns', 'srv', { level: 0.3, pipe: true }),
		envelope('pkt', 8.25, { z: 0.6, d: 1.2, tone: 'accent' })
	],
	'cookies-sessions': [
		server('srv', 0, 2.4),
		cookie('ck', 5.25, 0.9, { tone: 'accent' }),
		cookie(undefined, 6.75, 0.6, { d: 1.75 }),
		browser('win', 10.75, { facing: 'left' }),
		link('srv', 'ck', { level: 0.12 }),
		link('ck', 'win', { level: 0.12 })
	],
	'http-caching': [
		server('srv', 0, 2.4, { tone: 'dim' }),
		block('shelf', 5.75, [1.5, 1.5, 1.1], { tone: 'base' }, (f) => [
			seg(f.right(0.1, 0.5), f.right(0.9, 0.5), 'ink'),
			seg(f.left(0.1, 0.5), f.left(0.9, 0.5), 'ink'),
			ring(f.right, 0.5, 0.75, 0.08, 0.05, true, 'ink'),
			ring(f.right, 0.5, 0.25, 0.08, 0.05, true, 'ink')
		]),
		envelope('copy', 5.75, { z: 1.1, tone: 'accent' }),
		clock('clk', 10.5, 0.9),
		link('srv', 'shelf', { dashed: true, tone: 'dim', level: 0.5 })
	],
	cors: [
		...house('a', 0),
		...gate('gate', 6.25),
		envelope('req', 3.25, { tone: 'accent' }),
		...house('b', 12.5, 1.6, 1.3, { tone: 'accent' }),
		link('a', 'req', { arrow: false, level: 0.06 }),
		link('req', 'b', { level: 0.06 })
	],

	// Programming Concepts ---------------------------------------------------
	'values-references': [
		brace(-1.5, 1, 1.75),
		tag('name-a', 1.0, { d: -0.5, z: 1.6 }),
		tag('name-b', 1.0, { d: 1.5, z: 0.35 }),
		block('value', 8.0, [1.7, 1.7, 1.4], { tone: 'accent' }, (f) => [seg(f.top(0, 0.5), f.top(1, 0.5)), seg(f.top(0.5, 0), f.top(0.5, 1))]),
		link('name-a', 'value'),
		link('name-b', 'value')
	],
	recursion: [
		doc('f-0', 0, { z: 1.9 }, 1.0),
		doc('f-1', 3.75, { z: 1.25 }, 0.82),
		doc('f-2', 7.0, { z: 0.6 }, 0.66),
		doc('f-3', 9.75, { tone: 'accent' }, 0.5),
		link('f-0', 'f-1'),
		link('f-1', 'f-2'),
		link('f-2', 'f-3')
	],
	'js-event-loop': [
		path(oval(6, 5.5, 2.1, 0, Math.PI * 2, 0.06, 48), { pipe: true }),
		...[0.6, 2.4, 4.3].map((a, k): Item => disc(`task-${k}`, 6 + 5.5 * Math.cos(a), 0.4, 0.3, { d: 2.1 * Math.sin(a), z: 0.1, tone: k === 0 ? 'accent' : 'base' })),
		doc('call-0', 6, { z: 0 }, 0.8),
		doc('call-1', 6, { z: 0.24 }, 0.8),
		doc('call-2', 6, { z: 0.48, tone: 'accent' }, 0.8)
	],

	// Data Structures --------------------------------------------------------
	'stacks-queues': [
		...[0, 1, 2, 3].map((k) => tile(`st-${k}`, 0, { z: k * 0.34, tone: k === 3 ? 'accent' : 'base' }, 1.4, 0.22)),
		path([[3.25, -0.4, 0.06], [11.25, -0.4, 0.06]], { pipe: true, tone: 'dim' }),
		path([[3.25, 0.4, 0.06], [11.25, 0.4, 0.06]], { pipe: true, tone: 'dim' }),
		...[0, 1, 2, 3].map((k) => node(`q-${k}`, 4.25 + k * 2.0, 0.55, { z: 0.12, tone: k === 3 ? 'accent' : 'base' })),
		path([[11.75, 0.9, 0.5], [13.25, 0.9, 0.5]], { arrow: true })
	],
	'hash-maps': [
		funnel('hash', 6.5, 3.6, 1.2, { tone: 'accent' }),
		...bucket('b-0', 0.5),
		...bucket('b-1', 3.5),
		...bucket('b-2', 6.5, 1.5, 0.75, { tone: 'accent' }),
		...bucket('b-3', 9.5),
		node('k-1', 3.5, 0.4, { z: 0.1 }),
		node('k-2', 6.5, 0.4, { z: 0.1, tone: 'accent' }),
		node('k-3', 9.5, 0.4, { z: 0.1 }),
		link('hash', 'k-2')
	],
	'two-pointer-pattern': [
		...[0, 1, 2, 3, 4, 5, 6].map((k) => tile(`n-${k}`, k * 2.0, {}, 0.95)),
		...pin('lp', 0, { z: 0.22, tone: 'accent' }),
		...pin('rp', 12.0, { z: 0.22, tone: 'accent' }),
		path([[1.5, 0.9, 1.4], [4.25, 0.9, 1.4]], { arrow: true }),
		path([[10.5, 0.9, 1.4], [7.75, 0.9, 1.4]], { arrow: true })
	],
	'binary-search': [
		...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => tile(`n-${k}`, k * 1.75, { tone: k < 4 ? 'dim' : 'base' }, 0.85, k < 4 ? 0.1 : 0.22)),
		...pin('mid', 7.0, { z: 0.22, tone: 'accent', h: 1.7 }),
		path([[7.75, -0.75, 0.05], [14.75, -0.75, 0.05]], { tone: 'accent', dashed: true })
	],
	'linked-lists': [
		...[0, 1, 2].flatMap((k): Item[] => [
			block(`v-${k}`, k * 4.0, [0.95, 0.95, 0.95], { tone: k === 0 ? 'accent' : 'base' }),
			block(`p-${k}`, k * 4.0 + 1.5, [0.45, 0.45, 0.45], { tone: 'dim' })
		]),
		link('p-0', 'v-1'),
		link('p-1', 'v-2'),
		tile('null', 11.75, { tone: 'dim' }, 0.8, 0.08),
		link('p-2', 'null', { level: 0.05 })
	],
	'binary-trees': [
		node('root', 6, 0.55, { z: 2.6, tone: 'accent' }),
		node('l', 2.75, 0.48, { z: 1.3 }),
		node('r', 9.25, 0.48, { z: 1.3 }),
		node('ll', 1.0, 0.42),
		node('lr', 4.5, 0.42),
		node('rl', 7.5, 0.42),
		node('rr', 11.0, 0.42),
		...(
			[
				['root', 'l'],
				['root', 'r'],
				['l', 'll'],
				['l', 'lr'],
				['r', 'rl'],
				['r', 'rr']
			] as const
		).map(([a, b]) => link(a, b, { arrow: false, tone: 'dim' }))
	]
};

/** Every scene by topic id or lesson id. */
export const isoScenes: Record<string, Scene> = { ...topicScenes, ...lessonScenes };

/**
 * One frame (and so one scale) per kind of banner: lesson cards, topic cards, and the
 * topic page header. A cube is the same size on every banner of a kind.
 */
export const frames = {
	lesson: frameFor(Object.values(lessonScenes), 3.0),
	topic: frameFor(Object.values(topicScenes), 2.4),
	header: frameFor(Object.values(topicScenes), 2.0)
};
