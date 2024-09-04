import './style.css'

const canvas = document.createElement('canvas');
canvas.className = 'layer layer/base';
document.body.prepend(canvas);

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.floor(width * devicePixelRatio);
  canvas.height = Math.floor(height * devicePixelRatio);
  paint(canvas.getContext('2d')!);
}

const world: Shape[] = [
  polygon([
    { x: -1, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +3 },
    { x: -3, y: +1 },
  ]),
];
const fov = 3 / 2 * Math.PI;
function paint(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const angleStart = -1 / 2 * fov;
  const angleStep = fov / width;
  for(let i=0;i<width;i++) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    const angle = angleStart + angleStep * i;
    const distance = rayCast(world, angle);
    const color = distance === undefined ? 'red' : (
      ((c) => `rgb(${c},${c},${c})`)(Math.exp(-distance / Math.SQRT2) * 256)
    );
    ctx.strokeStyle = color;
    ctx.stroke();
  }
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

resizeCanvas();
document.addEventListener('resize', resizeCanvas);
