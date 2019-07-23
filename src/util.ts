import { Color, Dir, Point, Rect } from './types';

export function int(x: number): number {
  return Math.floor(x);
}

export function mod(x: number, y: number): number {
  var z = x % y;
  if (z < 0) z += y;
  return z;
}

export function div(x: number, y: number): number {
  return int(x / y);
}

export function vm(a: Point, f: (a: number) => number): Point {
  return { x: f(a.x), y: f(a.y) };
}

export function vm2(a: Point, b: Point, f: (a: number, b: number) => number): Point {
  return { x: f(a.x, b.x), y: f(a.y, b.y) };
}

export function vm3(a: Point, b: Point, c: Point, f: (a: number, b: number, c: number) => number): Point {
  return { x: f(a.x, b.x, c.x), y: f(a.y, b.y, c.y) };
}

export function vmn(ps: Point[], f: (ns: number[]) => number): Point {
  return { x: f(ps.map(p => p.x)), y: f(ps.map(p => p.y)) };
}

export function vequal(a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}

export function vplus(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vminus(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vscale(b: Point, s: number): Point {
  return { x: s * b.x, y: s * b.y };
}

export function vdiv(b: Point, s: number): Point {
  return { x: b.x / s, y: b.y / s };
}

export function vint(v: Point): Point {
  return { x: int(v.x), y: int(v.y) };
}

export function vfpart(v: Point): Point {
  return { x: v.x - int(v.x), y: v.y - int(v.y) };
}

export function interval_intersect(a: [number, number], b: [number, number]): boolean {
  return b[0] < a[1] && a[0] < b[1];
}

// RtlUniform from Native API[13] from
// https://en.wikipedia.org/wiki/Linear_congruential_generator
export function srand(n: number): () => number {
  var x = n;
  var z = function() {
    x = (2147483629 * x + 2147483587) % 2147483647;
    return (x & 0xffff) / (1 << 16);
  }
  return z;
}

export let _r: () => number;

export function r(): number {
  return _r();
}

export function srand_default(): void {
  _r = srand(123456789);
}

srand_default();

export function hash(p: Point): number {
  const z: () => number = srand(1000 * p.x + 3758 * p.y);
  for (let i = 0; i < 10; i++)
    z();
  return z();
}

export function js(x: any): string {
  return JSON.stringify(x);
}

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// meant to be used in a default case
// to enforce exhaustive pattern matching
export function nope<T>(x: never): T {
  throw "nope";
}

export function max(x: number[]): number {
  return Math.max.apply(Math, x);
}

export function min(x: number[]): number {
  return Math.min.apply(Math, x);
}

export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

export function lerp(a: number, b: number, l: number): number {
  return a * (1 - l) + b * l;
}

export function inrect(p: Point, r: Rect): boolean {
  return p.x >= r.p.x && p.y >= r.p.y && p.x < r.p.x + r.sz.x && p.y < r.p.y + r.sz.y;
}

export function rect_intersect(r1: Rect, r2: Rect): boolean {
  return (
    interval_intersect([r1.p.x, r1.p.x + r1.sz.x],
      [r2.p.x, r2.p.x + r2.sz.x]) &&
    interval_intersect([r1.p.y, r1.p.y + r1.sz.y],
      [r2.p.y, r2.p.y + r2.sz.y])
  );
}

// Try to adjust the p of r1 to fit in r2
export function adjustRect(r1: Rect, r2: Rect): Point {
  return {
    x: Math.max(0, r2.p.x - r1.p.x) + Math.min(0, r2.p.x + r2.sz.x - r1.p.x - r1.sz.x) + r1.p.x,
    y: Math.max(0, r2.p.y - r1.p.y) + Math.min(0, r2.p.y + r2.sz.y - r1.p.y - r1.sz.y) + r1.p.y
  };
}

export function rgbOfColor(color: string): Color {
  if (color == 'clear') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  color = color.replace(/^#/, '');
  return {
    r: parseInt(color.slice(0, 2), 16),
    g: parseInt(color.slice(2, 4), 16),
    b: parseInt(color.slice(4, 6), 16),
    a: 255,
  };
}

export function stringOfColor(c: Color): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

export function mapval<T, U>(f: (y: T) => U, x: { [k: string]: T }): { [k: string]: U } {
  const rv: { [k: string]: U } = {};
  for (const k of (Object.keys(x))) {
    rv[k] = f(x[k]);
  }
  return rv;
}

export function keyOfPoint(p: Point): string {
  return `${p.x},${p.y}`;
}

export function pointOfDir(dir: Dir): Point {
  switch (dir) {
    case 'n': return { x: 0, y: -1 };
    case 'e': return { x: 1, y: 0 };
    case 's': return { x: 0, y: 1 };
    case 'w': return { x: -1, y: 0 };
  }
}

export const allDirs: Dir[] = ['n', 'e', 's', 'w'];

export function vswap(p: Point): Point {
  return { x: p.y, y: p.x };
}

export function last<T>(a: T[]) {
  return a[a.length - 1];
}
