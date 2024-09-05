import { next } from "./util";

export type M2x2 = {
  a: number,
  b: number,
  c: number,
  d: number,
}
export type V2 = {
  x: number,
  y: number,
}
export type LineSegment = {
  start: V2,
  end: V2,
}

export const magnitude = ({ x, y }: V2) => Math.hypot(x, y);
export const scale = ({ x, y }: V2, m: number): V2 => ({
  x: x * m,
  y: y * m,
});
export const append = (a: V2, b: V2): V2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});
export const facing = (angle: number): V2 => ({
  x: Math.cos(angle),
  y: Math.sin(angle),
});
export function mulMV({ a, b, c, d }: M2x2, { x, y }: V2): V2 {
  return {
    x: a * x + b * y,
    y: c * x + d * y,
  };
}

export function invert(m: M2x2): M2x2 | undefined {
  const { a, b, c, d } = m;
  const det = determinant(m);
  if(det === 0) return undefined;
  return {
    a: d / det,
    b: -b,
    c: -c,
    d: a / det,
  };
}
export function determinant({ a, b, c, d }: M2x2) {
  return a * d - b * c;
}
export function intersectLineSegment({ start, end }: LineSegment, angle: number): V2 | undefined {
  const slopes: M2x2 = {
    a: end.x - start.x,
    c: end.y - start.y,
    b: -Math.cos(angle),
    d: -Math.sin(angle), 
  };
  const starts: V2 = {
    x: -start.x,
    y: -start.y,
  };
  return next(invert(slopes), inverted => {
    const { y: t } = mulMV(inverted, starts);
    return {
      x: -slopes.b * t,
      y: -slopes.d * t,
    }
  });
}
