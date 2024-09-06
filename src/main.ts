import './style.css'
import { createStore, atom, Atom } from 'jotai/vanilla'
import { LineSegment, magnitude, V2 } from './vectors';
import * as V from './vectors';

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
  ...polygon([
    { x: -1, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +3 },
    { x: -3, y: +1 },
  ]),
];
const facingAtom = atom(0);
const positionAtom = atom<V2>({ x: 0, y: 0 });
const moveWhereFacing = (scale: number) => (pos: V2) => V.append(pos, V.scale(V.facing(store.get(facingAtom)), scale));
document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') store.set(facingAtom, (facing) => facing - Math.PI / 32);
  if(e.key === 'ArrowRight') store.set(facingAtom, (facing) => facing + Math.PI / 32);
  if(e.key === 'ArrowUp') store.set(positionAtom, moveWhereFacing(0.05));
  if(e.key === 'ArrowDown') store.set(positionAtom, moveWhereFacing(-0.05));
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
        const distance = rayCast(world.map(({ type, start, end }) => ({
          type,
          start: { x: start.x + position.x, y: start.y + position.y },
          end: { x: end.x + position.x, y: end.y + position.y },
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

type Shape =
  | ({ type: 'line-segment' } & LineSegment)

function polygon(points: V2[]) {
  const len = points.length;
  if(len < 2) throw new Error('Polygon must have at least 2 points');
  let last = points[len - 1];
  const sides: (Shape & { type: 'line-segment' })[] = [];
  for(const point of points) {
    sides.push({
      type: 'line-segment',
      start: last,
      end: point,
    });
    last = point;
  }
  return sides;
}

function rayCast(shapes: Shape[], angle: number) {
  let closest = Infinity;
  for(const shape of shapes) {
    if(shape.type === 'line-segment') {
      const p = V.intersectLineSegment(shape, angle);
      if(p === undefined) continue;
      closest = Math.min(closest, magnitude(p));
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
