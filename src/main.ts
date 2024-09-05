import './style.css'
import { createStore, atom, Atom } from 'jotai/vanilla'

const canvas = document.createElement('canvas');
canvas.className = 'layer layer/base';
document.body.prepend(canvas);

const store = createStore();
function resizeCanvas() {
  const bb = canvas.getBoundingClientRect();
  const width = canvas.width = Math.floor(bb.width * devicePixelRatio);
  const height = canvas.height = Math.floor(bb.height * devicePixelRatio);
  const ctx = canvas.getContext('2d')!;
  const paintAtom = paint(ctx);
  function applyPaint() {
    ctx.clearRect(0, 0, width, height);
    store.get(paintAtom)();
  }
  applyPaint();
  return store.sub(paintAtom, applyPaint);
}

const world: Shape[] = [
  polygon([
    { x: -1, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +3 },
    { x: -3, y: +1 },
  ]),
];
const facingAtom = atom(0);
const positionAtom = atom<Point>({ x: 0, y: 0 });
document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') store.set(facingAtom, (facing) => facing - Math.PI / 32);
  if(e.key === 'ArrowRight') store.set(facingAtom, (facing) => facing + Math.PI / 32);
  if(e.key === 'ArrowUp') store.set(positionAtom, ({ x, y }) => ({ x: x + 0.05, y }));
  if(e.key === 'ArrowDown') store.set(positionAtom, ({ x, y }) => ({ x: x - 0.05, y }));
});
const fov = 2 * Math.PI;
function paint(ctx: CanvasRenderingContext2D): Atom<() => void> {
  const { width, height } = ctx.canvas;
  return atom((get) => {
    const facing = get(facingAtom);
    const position = get(positionAtom);
    const angleStart = facing + -1 / 2 * fov;
    const angleStep = fov / width;
    return () => {
      for(let i=0;i<width;i++) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        const angle = angleStart + angleStep * i;
        const distance = rayCast(world.map(({ type, sides }) => ({
          type,
          sides: sides.map((side): LineSegment => ({
            start: { x: side.start.x + position.x, y: side.start.y + position.y },
            end: { x: side.end.x + position.x, y: side.end.y + position.y },
          })),
        })), angle);
        const color = distance === undefined ? 'red' : (
          ((c) => `rgb(${c},${c},${c})`)(Math.exp(-distance / Math.SQRT2) * 256)
        );
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    };
  });
}

type Point = {
  x: number,
  y: number,
}
type LineSegment = {
  start: Point,
  end: Point,
}
function aspectsOf({ start, end }: LineSegment) {
  const slope = (end.y - start.y) / (end.x - start.x);
  const b = start.y - slope * start.x;
  return { slope, b };
}
function formulaOf(segment: LineSegment) {
  const { slope, b } = aspectsOf(segment);
  return (x: number) => x * slope + b; 
}
function findXIntersection(side: LineSegment, angle: number): number | undefined {
  const { start, end } = side;
  const { slope, b } = aspectsOf(side);
  const x = b / (Math.tan(angle) - slope);
  // Not in range of line segmenet
  if((start.x < end.x && (x < start.x || x > end.x)) || (start.x > end.x && (x > start.x || x < end.x))) {
    return undefined;
  }
  return x;
}
function next<T, V>(x: T | undefined, fn: (x: T) => V | undefined): V | undefined {
  if(x === undefined) return undefined;
  return fn(x);
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type Shape =
  | { type: 'polygon', sides: LineSegment[] }

function polygon(points: Point[]): Shape & { type: 'polygon' } {
  const len = points.length;
  if(len < 2) throw new Error('Polygon must have at least 2 points');
  let last = points[len - 1];
  const sides: LineSegment[] = [];
  for(const point of points) {
    sides.push({
      start: last,
      end: point,
    });
    last = point;
  }
  return { type: 'polygon', sides };
}

function rayCast(shapes: Shape[], angle: number) {
  let closest = Infinity;
  for(const shape of shapes) {
    if(shape.type === 'polygon') {
      for(const side of shape.sides) {
        const x = findXIntersection(side, angle);
        if(x === undefined) continue;
        const y = formulaOf(side)(x);
        if(isNaN(y)) continue;
        closest = Math.min(closest, Math.hypot(x, y));
      }
    }
  }
  if(isFinite(closest)) return closest;
  return undefined;
}

let cleanup = resizeCanvas();
document.addEventListener('resize', () => {
  cleanup();
  cleanup = resizeCanvas();
});
