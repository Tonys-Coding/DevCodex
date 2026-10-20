/**
 * Isometric "clay" illustrations: scene model, projection, connectors, depth order,
 * contact shadows, framing, SVG output and a geometry check. Plain TypeScript, so the
 * app (IsoArt.svelte), `npm run content:check` and `npm run art:sheet` share it.
 *
 * Scene units: x runs down-right, y runs down-left, z runs up. The viewer looks from
 * +x, +y, +z, so bigger coordinates are closer.
 */

export type P3 = [number, number, number];
export type P2 = [number, number];
/** The subject is the accent; supporting pieces are base; context is dim. */
export type Tone = 'accent' | 'base' | 'dim';

/**
 * Detail drawn on an object's surface (code lines, tabs, chips, clock hands), in scene
 * coordinates. It is drawn with its object, so it is always in the right depth order.
 * `ink` is darker than the surface, `light` lighter; `fill` fills a closed shape.
 */
export type Mark = { points: P3[]; closed?: boolean; fill?: boolean; ink?: 'ink' | 'light' };

type Named = { id?: string; tone?: Tone; marks?: Mark[] };
export type Box = Named & { kind: 'box'; at: P3; size: P3 };
/** `at` is the centre of the cylinder's base. */
export type Cyl = Named & { kind: 'cyl'; at: P3; r: number; h: number };
/** `at` is the centre. */
export type Sphere = Named & { kind: 'sphere'; at: P3; r: number };
/** A convex footprint in x, y, raised from z by h. Covers hexagons, tags, walls at any angle. */
export type Prism = Named & { kind: 'prism'; base: P2[]; z: number; h: number };
/** A convex base at height z, joined to an apex above it (a roof) or below it (a funnel). */
export type Pyramid = Named & { kind: 'pyramid'; base: P2[]; z: number; apex: P3 };
export type Solid = Box | Cyl | Sphere | Prism | Pyramid;
/**
 * A connector between two named solids. It starts and ends at their surfaces, with a
 * small gap. `pipe` draws a thick cable instead of a line.
 */
export type Link = { kind: 'link'; from: string; to: string; level?: number; arrow?: boolean; dashed?: boolean; pipe?: boolean; tone?: Tone };
/** A free line through given points (for loops, tracks and pointers). */
export type Line = { kind: 'line'; points: P3[]; arrow?: boolean; dashed?: boolean; pipe?: boolean; tone?: Tone };
export type Item = Solid | Link | Line;
export type Scene = Item[];

export type Frame = { w: number; h: number };
export type Finding = { level: 'error' | 'warn'; message: string };

// Projection and small vector helpers ----------------------------------------

const U = 10;
const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);
/** How much bigger a sphere or circle looks in this isometric drawing. */
const ROUND = Math.SQRT2 * C;
export const proj = ([x, y, z]: P3): P2 => [(x - y) * C * U, (x + y) * S * U - z * U];

const add = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: P3, k: number): P3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: P3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: P3): P3 => mul(a, 1 / (len(a) || 1));
const VIEW: P3 = [1, 1, 1];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const pts2 = (list: P2[]) => list.map(([a, b]) => `${f1(a)},${f1(b)}`).join(' ');

/**
 * Rounds to 1/10000 of a unit. Math.sin and Math.cos can differ in the last bit between
 * engines (Node at build time, the browser when hydrating); rounding first means both
 * sort and draw exactly the same picture.
 */
const q = (n: number) => Math.round(n * 1e4) / 1e4;
const q3 = (p: P3): P3 => [q(p[0]), q(p[1]), q(p[2])];
const q2 = (p: P2): P2 => [q(p[0]), q(p[1])];

function quantize(item: Item): Item {
	const marks = 'marks' in item && item.marks ? { marks: item.marks.map((m) => ({ ...m, points: m.points.map(q3) })) } : {};
	switch (item.kind) {
		case 'box':
			return { ...item, ...marks, at: q3(item.at), size: q3(item.size) };
		case 'cyl':
			return { ...item, ...marks, at: q3(item.at), r: q(item.r), h: q(item.h) };
		case 'sphere':
			return { ...item, ...marks, at: q3(item.at), r: q(item.r) };
		case 'prism':
			return { ...item, ...marks, base: ccw(item.base.map(q2)), z: q(item.z), h: q(item.h) };
		case 'pyramid':
			return { ...item, ...marks, base: ccw(item.base.map(q2)), z: q(item.z), apex: q3(item.apex) };
		case 'line':
			return { ...item, points: item.points.map(q3) };
		default:
			return item;
	}
}

/** The polygon wound counter-clockwise in x, y, so edge normals point outwards. */
function ccw(poly: P2[]): P2[] {
	let area = 0;
	for (let i = 0; i < poly.length; i++) {
		const [x1, y1] = poly[i];
		const [x2, y2] = poly[(i + 1) % poly.length];
		area += x1 * y2 - x2 * y1;
	}
	return area < 0 ? [...poly].reverse() : poly;
}

// Shapes of each solid --------------------------------------------------------

type AABB = { min: P3; max: P3 };
const circle = (c: P3, r: number, n = 20): P2[] => Array.from({ length: n }, (_, k): P2 => [c[0] + r * Math.cos((k / n) * Math.PI * 2), c[1] + r * Math.sin((k / n) * Math.PI * 2)]);

/** The solid's footprint on the floor, as a convex polygon in x, y. */
function footprint(s: Solid): P2[] {
	switch (s.kind) {
		case 'box': {
			const [x, y] = s.at;
			const [w, d] = s.size;
			return [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
		}
		case 'cyl':
		case 'sphere':
			return circle(s.at, s.r);
		case 'prism':
			return hull2(s.base);
		case 'pyramid':
			return hull2([...s.base, [s.apex[0], s.apex[1]]]);
	}
}

export function aabb(s: Solid): AABB {
	const fp = footprint(s);
	const xs = fp.map((p) => p[0]);
	const ys = fp.map((p) => p[1]);
	let z0: number;
	let z1: number;
	switch (s.kind) {
		case 'box':
			[z0, z1] = [s.at[2], s.at[2] + s.size[2]];
			break;
		case 'cyl':
			[z0, z1] = [s.at[2], s.at[2] + s.h];
			break;
		case 'sphere':
			[z0, z1] = [s.at[2] - s.r, s.at[2] + s.r];
			break;
		case 'prism':
			[z0, z1] = [s.z, s.z + s.h];
			break;
		case 'pyramid':
			[z0, z1] = [Math.min(s.z, s.apex[2]), Math.max(s.z, s.apex[2])];
	}
	return { min: [Math.min(...xs), Math.min(...ys), z0], max: [Math.max(...xs), Math.max(...ys), z1] };
}

const centre = (b: AABB): P3 => mul(add(b.min, b.max), 0.5);
const label = (s: Solid, i: number) => s.id ?? `${s.kind} #${i + 1}`;

/** Faces of a flat-sided solid, each wound so its normal points outwards. */
function faces(s: Box | Prism | Pyramid): P3[][] {
	if (s.kind === 'box') {
		const [x, y] = s.at;
		const [w, d] = s.size;
		return faces({ kind: 'prism', base: ccw([[x, y], [x + w, y], [x + w, y + d], [x, y + d]]), z: s.at[2], h: s.size[2] });
	}
	if (s.kind === 'prism') {
		const b = s.base;
		const lo = b.map(([x, y]): P3 => [x, y, s.z]);
		const hi = b.map(([x, y]): P3 => [x, y, s.z + s.h]);
		const sides = b.map((_, i) => {
			const j = (i + 1) % b.length;
			return [lo[i], lo[j], hi[j], hi[i]];
		});
		return [...sides, hi, [...lo].reverse()];
	}
	const b = s.base.map(([x, y]): P3 => [x, y, s.z]);
	const mid = mul(b.reduce(add, [0, 0, 0] as P3), 1 / b.length);
	const inner = mul(add(mid, s.apex), 0.5);
	const out: P3[][] = b.map((_, i) => [b[i], b[(i + 1) % b.length], s.apex]);
	out.push([...b].reverse());
	// Wind each face so its normal points away from the inside of the solid.
	return out.map((f) => (dot(normal(f), sub(f[0], inner)) < 0 ? [...f].reverse() : f));
}

const normal = (f: P3[]): P3 => unit(cross(sub(f[1], f[0]), sub(f[2], f[0])));

/** Which light a face gets from its direction: lit from above. */
function shade(n: P3): 'top' | 'left' | 'right' {
	if (n[2] > 0.55) return 'top';
	return n[0] >= n[1] ? 'right' : 'left';
}

// Connectors -----------------------------------------------------------------

/** The t-range in which the ray p + t·d is inside a solid, or null if it misses. */
function inside(s: Solid, p: P3, d: P3): [number, number] | null {
	let t0 = -Infinity;
	let t1 = Infinity;
	const clip = (lo: number, hi: number, o: number, v: number) => {
		if (Math.abs(v) < 1e-9) return o >= lo && o <= hi;
		let a = (lo - o) / v;
		let b = (hi - o) / v;
		if (a > b) [a, b] = [b, a];
		t0 = Math.max(t0, a);
		t1 = Math.min(t1, b);
		return t0 <= t1;
	};
	const box = aabb(s);
	if (s.kind === 'sphere') {
		const o = sub(p, s.at);
		const a = dot(d, d);
		const b = 2 * dot(o, d);
		const c = dot(o, o) - s.r * s.r;
		const disc = b * b - 4 * a * c;
		if (disc < 0) return null;
		return [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)];
	}
	if (s.kind === 'cyl') {
		const ox = p[0] - s.at[0];
		const oy = p[1] - s.at[1];
		const a = d[0] * d[0] + d[1] * d[1];
		if (a < 1e-9) {
			if (ox * ox + oy * oy > s.r * s.r) return null;
		} else {
			const b = 2 * (ox * d[0] + oy * d[1]);
			const c = ox * ox + oy * oy - s.r * s.r;
			const disc = b * b - 4 * a * c;
			if (disc < 0) return null;
			t0 = (-b - Math.sqrt(disc)) / (2 * a);
			t1 = (-b + Math.sqrt(disc)) / (2 * a);
		}
		return clip(box.min[2], box.max[2], p[2], d[2]) ? [t0, t1] : null;
	}
	// Flat-sided solids: clip against every face plane (Cyrus–Beck), using the convex
	// hull of a prism's footprint so toothed shapes (gears) clip like their outline.
	const convex = s.kind === 'prism' ? { ...s, base: ccw(hull2(s.base)) } : s;
	for (const f of faces(convex)) {
		const n = normal(f);
		const num = dot(n, sub(f[0], p));
		const den = dot(n, d);
		if (Math.abs(den) < 1e-9) {
			if (num < 0) return null;
			continue;
		}
		const t = num / den;
		if (den < 0) t0 = Math.max(t0, t);
		else t1 = Math.min(t1, t);
		if (t0 > t1) return null;
	}
	return [t0, t1];
}

const GAP = 0.22;

/** Where a link starts and ends: out of one surface and into the other, with a small gap. */
export function resolveLink(l: Link, byId: Map<string, Solid>): { a: P3; b: P3 } | string {
	const A = byId.get(l.from);
	const B = byId.get(l.to);
	if (!A || !B) return `Link ${l.from} → ${l.to} names a solid that doesn’t exist.`;
	const ba = aabb(A);
	const bb = aabb(B);
	const ca = A.kind === 'sphere' ? A.at : centre(ba);
	const cb = B.kind === 'sphere' ? B.at : centre(bb);
	// Between two objects on the floor, run level, at half the shorter one's height.
	const both = ba.min[2] === 0 && bb.min[2] === 0;
	const level = l.level ?? (both ? Math.min(ba.max[2], bb.max[2], 1.2) * 0.5 : undefined);
	const pa: P3 = level === undefined ? ca : [ca[0], ca[1], level];
	const pb: P3 = level === undefined ? cb : [cb[0], cb[1], level];
	const d = sub(pb, pa);
	const ra = inside(A, pa, d);
	const rb = inside(B, pa, d);
	if (!ra || !rb) return `Link ${l.from} → ${l.to} doesn’t pass through both objects; check its level.`;
	const n = unit(d);
	const a = add(add(pa, mul(d, ra[1])), mul(n, GAP));
	const b = sub(add(pa, mul(d, rb[0])), mul(n, GAP));
	if (len(sub(b, a)) < 0.25 || rb[0] <= ra[1]) return `Link ${l.from} → ${l.to} is too short to see: move the objects apart.`;
	return { a, b };
}

/** An arrowhead lying in the floor plane (or facing the viewer, for steep arrows). */
function arrowHead(a: P3, b: P3): P3[] {
	const d = unit(sub(b, a));
	const perp: P3 = Math.abs(d[2]) < 0.7 ? unit([-d[1], d[0], 0]) : [Math.SQRT1_2, -Math.SQRT1_2, 0];
	const back = sub(b, mul(d, 0.42));
	return [add(back, mul(perp, 0.26)), b, sub(back, mul(perp, 0.26))];
}

// Drawables and depth order -------------------------------------------------

export type Shape =
	| { type: 'poly'; points: P2[]; cls: string }
	| { type: 'path'; d: string; cls: string }
	| { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; cls: string; fill?: string };

type Drawable = { box: AABB; shapes: Shape[]; screen: P2[]; what: string };

const markShapes = (marks: Mark[] | undefined, tone: Tone): Shape[] =>
	(marks ?? []).map((m) => {
		const p = m.points.map(proj);
		const d = `M${p.map(([a, b]) => `${f1(a)},${f1(b)}`).join(' L')}${m.closed || m.fill ? ' Z' : ''}`;
		return { type: 'path', d, cls: `mark ${tone}${m.fill ? ' fill' : ''}${m.ink ? ` ${m.ink}` : ''}` };
	});

function solidDrawable(s: Solid, i: number): Drawable {
	const tone = s.tone ?? 'base';
	const box = aabb(s);
	const what = label(s, i);

	if (s.kind === 'sphere') {
		const [cx, cy] = proj(s.at);
		const r = s.r * ROUND * U;
		return {
			box,
			shapes: [{ type: 'ellipse', cx, cy, rx: r, ry: r, cls: `ball ${tone}`, fill: tone === 'accent' ? 'ball-accent' : 'ball' }, ...markShapes(s.marks, tone)],
			screen: Array.from({ length: 16 }, (_, k): P2 => [cx + r * Math.cos((k / 16) * Math.PI * 2), cy + r * Math.sin((k / 16) * Math.PI * 2)]),
			what
		};
	}

	if (s.kind === 'cyl') {
		const [bx, by] = proj(s.at);
		const [tx, ty] = proj([s.at[0], s.at[1], s.at[2] + s.h]);
		const rx = s.r * ROUND * U;
		const ry = s.r * Math.SQRT2 * S * U;
		const ring = (x: number, y: number) => Array.from({ length: 16 }, (_, k): P2 => [x + rx * Math.cos((k / 16) * Math.PI * 2), y + ry * Math.sin((k / 16) * Math.PI * 2)]);
		return {
			box,
			shapes: [
				{ type: 'path', d: `M${f1(bx - rx)},${f1(by)} L${f1(tx - rx)},${f1(ty)} L${f1(tx + rx)},${f1(ty)} L${f1(bx + rx)},${f1(by)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(bx - rx)},${f1(by)} Z`, cls: `face right ${tone}` },
				{ type: 'ellipse', cx: tx, cy: ty, rx, ry, cls: `face top ${tone}` },
				...markShapes(s.marks, tone)
			],
			screen: hull2([...ring(bx, by), ...ring(tx, ty)]),
			what
		};
	}

	// Flat-sided solids: the faces that look towards the viewer, back to front.
	const visible = faces(s)
		.filter((f) => dot(normal(f), VIEW) > 1e-6)
		.sort((a, b) => dot(mul(a.reduce(add, [0, 0, 0] as P3), 1 / a.length), VIEW) - dot(mul(b.reduce(add, [0, 0, 0] as P3), 1 / b.length), VIEW));
	const shapes: Shape[] = visible.map((f) => ({ type: 'poly', points: f.map(proj), cls: `face ${shade(normal(f))} ${tone}` }));
	shapes.push(...markShapes(s.marks, tone));
	return { box, shapes, screen: hull2(faces(s).flat().map(proj)), what };
}

/** Splits a line into short pieces so each can be depth-sorted against nearby solids. */
function lineDrawables(points: P3[], opts: { arrow?: boolean; dashed?: boolean; pipe?: boolean; tone?: Tone }, what: string): Drawable[] {
	const tone = opts.tone ?? 'base';
	const cls = opts.pipe ? `pipe ${tone}` : `line ${tone}${opts.dashed ? ' dashed' : ''}`;
	const out: Drawable[] = [];
	for (let k = 0; k < points.length - 1; k++) {
		const a = points[k];
		const b = points[k + 1];
		const n = Math.max(1, Math.ceil(len(sub(b, a)) / 0.6));
		for (let j = 0; j < n; j++) {
			const p = add(a, mul(sub(b, a), j / n));
			const r = add(a, mul(sub(b, a), (j + 1) / n));
			const [px, py] = proj(p);
			const [rx, ry] = proj(r);
			const d = `M${f1(px)},${f1(py)} L${f1(rx)},${f1(ry)}`;
			const shapes: Shape[] = [{ type: 'path', d, cls }];
			if (opts.pipe) shapes.push({ type: 'path', d, cls: `pipe-hi ${tone}` });
			out.push({
				box: { min: [Math.min(p[0], r[0]), Math.min(p[1], r[1]), Math.min(p[2], r[2])], max: [Math.max(p[0], r[0]), Math.max(p[1], r[1]), Math.max(p[2], r[2])] },
				shapes,
				screen: [[px, py], [rx, ry]],
				what
			});
		}
	}
	if (opts.arrow && out.length) {
		const head = arrowHead(points[points.length - 2], points[points.length - 1]).map(proj);
		out[out.length - 1].shapes.push({ type: 'path', d: `M${pts2(head).replace(/ /g, ' L')}`, cls: `line ${tone}` });
	}
	return out;
}

const EPS = 1e-6;
const behind = (a: AABB, b: AABB) => a.max[0] <= b.min[0] + EPS || a.max[1] <= b.min[1] + EPS || a.max[2] <= b.min[2] + EPS;
const depthKey = (b: AABB) => {
	const c = centre(b);
	return q(c[0] + c[1] + c[2]);
};

function rectOf(points: P2[]) {
	const xs = points.map((p) => p[0]);
	const ys = points.map((p) => p[1]);
	return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** Back-to-front order: a topological sort on "is behind" for things that overlap on screen. */
function sortDrawables(list: Drawable[]): Drawable[] {
	const n = list.length;
	const rects = list.map((d) => rectOf(d.screen));
	const after: number[][] = Array.from({ length: n }, () => []);
	const indeg = new Array(n).fill(0);
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const r = rects[i];
			const o = rects[j];
			if (r.x1 <= o.x0 || o.x1 <= r.x0 || r.y1 <= o.y0 || o.y1 <= r.y0) continue;
			const ij = behind(list[i].box, list[j].box);
			const ji = behind(list[j].box, list[i].box);
			let first: number;
			if (ij && !ji) first = i;
			else if (ji && !ij) first = j;
			else first = depthKey(list[i].box) < depthKey(list[j].box) || (depthKey(list[i].box) === depthKey(list[j].box) && i < j) ? i : j;
			const second = first === i ? j : i;
			after[first].push(second);
			indeg[second]++;
		}
	const out: Drawable[] = [];
	const ready = list.map((_, i) => i).filter((i) => indeg[i] === 0);
	const done = new Array(n).fill(false);
	while (out.length < n) {
		if (!ready.length) {
			// A cycle: release the furthest-back remaining item.
			const rest = list.map((_, i) => i).filter((i) => !done[i]);
			rest.sort((a, b) => depthKey(list[a].box) - depthKey(list[b].box) || a - b);
			ready.push(rest[0]);
			indeg[rest[0]] = 0;
		}
		ready.sort((a, b) => depthKey(list[a].box) - depthKey(list[b].box) || a - b);
		const i = ready.shift()!;
		if (done[i]) continue;
		done[i] = true;
		out.push(list[i]);
		for (const j of after[i]) if (--indeg[j] === 0 && !done[j]) ready.push(j);
	}
	return out;
}

// Building a scene -----------------------------------------------------------

export type Built = {
	drawables: Drawable[];
	shadows: Shape[];
	bounds: { x0: number; x1: number; y0: number; y1: number };
	findings: Finding[];
};

const isSolid = (i: Item): i is Solid => i.kind !== 'link' && i.kind !== 'line';

/** True when two solids genuinely share space (footprints overlap and heights overlap). */
function intersects(a: Solid, b: Solid): boolean {
	const A = aabb(a);
	const B = aabb(b);
	if (Math.min(A.max[2], B.max[2]) - Math.max(A.min[2], B.min[2]) <= 0.02) return false;
	return polygonsOverlap(footprint(a), footprint(b), 0.02);
}

export function build(input: Scene): Built {
	const scene = input.map(quantize);
	const findings: Finding[] = [];
	const solids = scene.filter(isSolid);
	const byId = new Map<string, Solid>();
	for (const s of solids) {
		if (!s.id) continue;
		if (byId.has(s.id)) findings.push({ level: 'error', message: `Two objects are called “${s.id}”.` });
		byId.set(s.id, s);
	}

	const pieces: Drawable[] = solids.map(solidDrawable);
	const arrows: { last: Drawable; tip: P3; what: string }[] = [];
	for (const item of scene) {
		if (item.kind === 'link') {
			const r = resolveLink(item, byId);
			if (typeof r === 'string') {
				findings.push({ level: 'error', message: r });
				continue;
			}
			const ds = lineDrawables([q3(r.a), q3(r.b)], item, `${item.from} → ${item.to}`);
			pieces.push(...ds);
			if (item.arrow) arrows.push({ last: ds[ds.length - 1], tip: r.b, what: `${item.from} → ${item.to}` });
		} else if (item.kind === 'line') {
			const ds = lineDrawables(item.points, item, 'a line');
			pieces.push(...ds);
			if (item.arrow) arrows.push({ last: ds[ds.length - 1], tip: item.points[item.points.length - 1], what: 'a line' });
		}
	}

	// Solids must not pass through each other.
	solids.forEach((a, i) =>
		solids.slice(i + 1).forEach((b, k) => {
			if (intersects(a, b)) findings.push({ level: 'error', message: `${label(a, i)} and ${label(b, i + k + 1)} pass through each other.` });
		})
	);

	const drawables = sortDrawables(pieces);

	// An arrow's tip must not be covered by something drawn after it.
	for (const t of arrows) {
		const at = proj(t.tip);
		for (let k = drawables.indexOf(t.last) + 1; k < drawables.length; k++) {
			const d = drawables[k];
			if (d.shapes[0]?.cls.startsWith('line') || d.shapes[0]?.cls.startsWith('pipe')) continue;
			if (pointInPolygon(at, d.screen)) {
				findings.push({ level: 'error', message: `The arrow ${t.what} ends behind ${d.what}, so its head is hidden.` });
				break;
			}
		}
	}

	// Soft contact shadows: each solid's footprint on the floor, fainter the higher it floats.
	const shadows: Shape[] = solids.map((s) => {
		const { min } = aabb(s);
		const far = min[2] > 0.9 ? ' far' : '';
		if (s.kind === 'cyl' || s.kind === 'sphere') {
			const [cx, cy] = proj([s.at[0], s.at[1], 0]);
			return { type: 'ellipse', cx, cy, rx: (s.r + 0.12) * ROUND * U, ry: (s.r + 0.12) * Math.SQRT2 * S * U, cls: `shadow${far}` };
		}
		const fp = footprint(s);
		const c: P2 = [fp.reduce((n, p) => n + p[0], 0) / fp.length, fp.reduce((n, p) => n + p[1], 0) / fp.length];
		const grown = fp.map(([x, y]): P3 => {
			const dx = x - c[0];
			const dy = y - c[1];
			const k = 0.14 / (Math.hypot(dx, dy) || 1);
			return [x + dx * k, y + dy * k, 0];
		});
		return { type: 'poly', points: grown.map(proj), cls: `shadow${far}` };
	});

	const all = drawables.flatMap((d) => d.screen);
	const bounds = rectOf(all.length ? all : [[0, 0]]);
	return { drawables, shadows, bounds, findings };
}

/** The smallest frame (at one shared scale) that fits every scene, at the given aspect ratio. */
export function frameFor(scenes: Scene[], aspect: number, margin = 1.12): Frame {
	let w = 0;
	let h = 0;
	for (const s of scenes) {
		const b = build(s).bounds;
		w = Math.max(w, b.x1 - b.x0);
		h = Math.max(h, b.y1 - b.y0);
	}
	w = Math.max(w, h * aspect) * margin;
	return { w, h: w / aspect };
}

/** Checks a scene's geometry, and that it fits its frame without looking lost in it. */
export function lintScene(scene: Scene, frame: Frame): Finding[] {
	const b = build(scene);
	const out = [...b.findings];
	const w = b.bounds.x1 - b.bounds.x0;
	const h = b.bounds.y1 - b.bounds.y0;
	if (w > frame.w + 0.5 || h > frame.h + 0.5) out.push({ level: 'error', message: `It doesn’t fit its banner frame.` });
	else if (w < frame.w * 0.5 && h < frame.h * 0.5) out.push({ level: 'warn', message: `It fills under half its banner, so it will look small next to the others.` });
	return out;
}

// SVG output -----------------------------------------------------------------

function shapeSvg(s: Shape, uid: string): string {
	if (s.type === 'poly') return `<polygon class="${s.cls}" points="${pts2(s.points)}"/>`;
	if (s.type === 'path') return `<path class="${s.cls}" d="${s.d}"/>`;
	const fill = s.fill ? ` fill="url(#iso-${s.fill}-${uid})"` : '';
	return `<ellipse class="${s.cls}"${fill} cx="${f1(s.cx)}" cy="${f1(s.cy)}" rx="${f1(s.rx)}" ry="${f1(s.ry)}"/>`;
}

/** The scene as an SVG string, centred in a shared frame so every banner uses one scale. */
export function renderSvg(scene: Scene, frame: Frame, uid: string): string {
	const b = build(scene);
	const cx = (b.bounds.x0 + b.bounds.x1) / 2;
	const cy = (b.bounds.y0 + b.bounds.y1) / 2;
	const vb = `${f1(cx - frame.w / 2)} ${f1(cy - frame.h / 2)} ${f1(frame.w)} ${f1(frame.h)}`;
	const ball = (name: string, tone: string) =>
		`<radialGradient id="iso-${name}-${uid}" cx="36%" cy="30%" r="74%"><stop offset="0" class="ball-hi ${tone}"/><stop offset="1" class="ball-lo ${tone}"/></radialGradient>`;
	return (
		`<svg class="iso" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
		`<defs><filter id="iso-soft-${uid}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>` +
		ball('ball', 'base') +
		ball('ball-accent', 'accent') +
		`</defs>` +
		`<g filter="url(#iso-soft-${uid})">${b.shadows.map((s) => shapeSvg(s, uid)).join('')}</g>` +
		b.drawables.flatMap((d) => d.shapes.map((s) => shapeSvg(s, uid))).join('') +
		`</svg>`
	);
}

// 2D geometry helpers -----------------------------------------------------------

function hull2(points: P2[]): P2[] {
	const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const turn = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lower: P2[] = [];
	for (const r of p) {
		while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], r) <= 0) lower.pop();
		lower.push(r);
	}
	const upper: P2[] = [];
	for (const r of [...p].reverse()) {
		while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], r) <= 0) upper.pop();
		upper.push(r);
	}
	return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Separating-axis test for two convex polygons, ignoring overlaps thinner than `slack`. */
function polygonsOverlap(a: P2[], b: P2[], slack: number): boolean {
	for (const poly of [a, b])
		for (let i = 0; i < poly.length; i++) {
			const [x1, y1] = poly[i];
			const [x2, y2] = poly[(i + 1) % poly.length];
			const nx = y2 - y1;
			const ny = x1 - x2;
			const n = Math.hypot(nx, ny) || 1;
			const proj1 = a.map(([x, y]) => (x * nx + y * ny) / n);
			const proj2 = b.map(([x, y]) => (x * nx + y * ny) / n);
			if (Math.min(Math.max(...proj1), Math.max(...proj2)) - Math.max(Math.min(...proj1), Math.min(...proj2)) <= slack) return false;
		}
	return true;
}

function pointInPolygon([x, y]: P2, poly: P2[]): boolean {
	if (poly.length < 3) return false;
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i];
		const [xj, yj] = poly[j];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}
