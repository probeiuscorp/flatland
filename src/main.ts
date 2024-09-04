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
resizeCanvas();
document.addEventListener('resize', resizeCanvas);

function paint(ctx: CanvasRenderingContext2D) {
  
}
