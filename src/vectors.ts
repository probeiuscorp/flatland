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
export function mulMM(a: M2x2, b: M2x2): M2x2 {
  return {
    a: a.a * b.a + a.b * b.c,
    b: a.a * b.b + a.b * b.d,
    c: a.c * b.a + a.d * b.c,
    d: a.c * b.b + a.d * b.d,
  };
}

export function invert(m: M2x2): M2x2 | undefined {
  const { a, b, c, d } = m;
  const det = determinant(m);
  if(det === 0) return undefined;
  return {
    a: d / det,
    b: -b / det,
    c: -c / det,
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
    const intersection = {
      x: -slopes.b * t,
      y: -slopes.d * t,
    }

    if(isBetween(start.x, intersection.x, end.x) && isBetween(start.y, intersection.y, end.y))
      return intersection;
  });
}

function isBetween(min: number, a: number, max: number) {
  if(min <= max) {
    return a >= min && a <= max;
  } else {
    return a <= min && a >= max;
  }
}
