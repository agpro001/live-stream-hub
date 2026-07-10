import React, { useRef, useEffect, type CSSProperties } from 'react';

class Grad {
  constructor(public x: number, public y: number, public z: number) {}
  dot2(x: number, y: number) { return this.x * x + this.y * y; }
}

class Noise {
  grad3: Grad[];
  p: number[];
  perm: number[] = new Array(512);
  gradP: Grad[] = new Array(512);
  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1,1,0), new Grad(-1,1,0), new Grad(1,-1,0), new Grad(-1,-1,0),
      new Grad(1,0,1), new Grad(-1,0,1), new Grad(1,0,-1), new Grad(-1,0,-1),
      new Grad(0,1,1), new Grad(0,-1,1), new Grad(0,1,-1), new Grad(0,-1,-1),
    ];
    this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.seed(seed);
  }
  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  fade(t: number) { return t*t*t*(t*(t*6-15)+10); }
  lerp(a: number, b: number, t: number) { return (1-t)*a + t*b; }
  perlin2(x: number, y: number) {
    let X = Math.floor(x), Y = Math.floor(y);
    x -= X; y -= Y; X &= 255; Y &= 255;
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

interface Point { x: number; y: number; wave: { x: number; y: number }; cursor: { x: number; y: number; vx: number; vy: number } }

export interface WavesProps {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number; waveSpeedY?: number;
  waveAmpX?: number; waveAmpY?: number;
  xGap?: number; yGap?: number;
  friction?: number; tension?: number; maxCursorMove?: number;
  style?: CSSProperties; className?: string;
}

export const InteractiveWavesBackground: React.FC<WavesProps> = ({
  lineColor = 'rgba(204,255,0,0.35)',
  backgroundColor = 'transparent',
  waveSpeedX = 0.0125, waveSpeedY = 0.005,
  waveAmpX = 32, waveAmpY = 16,
  xGap = 12, yGap = 36,
  friction = 0.925, tension = 0.005, maxCursorMove = 100,
  style = {}, className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boundingRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseRef = useRef(new Noise(Math.random()));
  const linesRef = useRef<Point[][]>([]);
  const mouseRef = useRef({ x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false });
  const cfgRef = useRef({ lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, xGap, yGap });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    cfgRef.current = { lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, xGap, yGap };
  }, [lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, xGap, yGap]);

  useEffect(() => {
    const canvas = canvasRef.current; const container = containerRef.current;
    if (!canvas || !container) return;
    ctxRef.current = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function setSize() {
      const rect = container!.getBoundingClientRect();
      boundingRef.current = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
      canvas!.width = rect.width * dpr; canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`; canvas!.style.height = `${rect.height}px`;
      ctxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function setLines() {
      const { width, height } = boundingRef.current;
      linesRef.current = [];
      const oW = width + 200, oH = height + 30;
      const { xGap, yGap } = cfgRef.current;
      const tL = Math.ceil(oW / xGap), tP = Math.ceil(oH / yGap);
      const xS = (width - xGap * tL) / 2, yS = (height - yGap * tP) / 2;
      for (let i = 0; i <= tL; i++) {
        const pts: Point[] = [];
        for (let j = 0; j <= tP; j++) pts.push({ x: xS + xGap * i, y: yS + yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } });
        linesRef.current.push(pts);
      }
    }
    function movePoints(t: number) {
      const { waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove } = cfgRef.current;
      const mouse = mouseRef.current; const noise = noiseRef.current;
      linesRef.current.forEach(pts => pts.forEach(p => {
        const m = noise.perlin2((p.x + t * waveSpeedX) * 0.002, (p.y + t * waveSpeedY) * 0.0015) * 12;
        p.wave.x = Math.cos(m) * waveAmpX; p.wave.y = Math.sin(m) * waveAmpY;
        const dx = p.x - mouse.sx, dy = p.y - mouse.sy; const dist = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);
        if (dist < l) {
          const s = 1 - dist / l; const f = Math.cos(dist * 0.001) * s;
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
        }
        p.cursor.vx += (0 - p.cursor.x) * tension; p.cursor.vy += (0 - p.cursor.y) * tension;
        p.cursor.vx *= friction; p.cursor.vy *= friction;
        p.cursor.x += p.cursor.vx * 2; p.cursor.y += p.cursor.vy * 2;
        p.cursor.x = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.x));
        p.cursor.y = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.y));
      }));
    }
    function moved(p: Point, wc = true) {
      return { x: Math.round((p.x + p.wave.x + (wc ? p.cursor.x : 0)) * 10) / 10, y: Math.round((p.y + p.wave.y + (wc ? p.cursor.y : 0)) * 10) / 10 };
    }
    function draw() {
      const { width, height } = boundingRef.current;
      const ctx = ctxRef.current; if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath(); ctx.strokeStyle = cfgRef.current.lineColor; ctx.lineWidth = 1;
      linesRef.current.forEach(points => {
        let p1 = moved(points[0], false); ctx.moveTo(p1.x, p1.y);
        points.forEach((p, idx) => {
          const isLast = idx === points.length - 1;
          p1 = moved(p, !isLast);
          const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast);
          ctx.lineTo(p1.x, p1.y); if (isLast) ctx.moveTo(p2.x, p2.y);
        });
      });
      ctx.stroke();
    }
    function tick(t: number) {
      const mouse = mouseRef.current;
      mouse.sx += (mouse.x - mouse.sx) * 0.1; mouse.sy += (mouse.y - mouse.sy) * 0.1;
      const dx = mouse.x - mouse.lx, dy = mouse.y - mouse.ly; const d = Math.hypot(dx, dy);
      mouse.v = d; mouse.vs += (d - mouse.vs) * 0.1; mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x; mouse.ly = mouse.y; mouse.a = Math.atan2(dy, dx);
      container!.style.setProperty('--x', `${mouse.sx}px`); container!.style.setProperty('--y', `${mouse.sy}px`);
      movePoints(t); draw();
      frameRef.current = requestAnimationFrame(tick);
    }
    function updateMouse(x: number, y: number) {
      const m = mouseRef.current; const b = boundingRef.current;
      m.x = x - b.left; m.y = y - b.top;
      if (!m.set) { m.sx = m.x; m.sy = m.y; m.lx = m.x; m.ly = m.y; m.set = true; }
    }
    const onResize = () => { setSize(); setLines(); };
    const onMouse = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) updateMouse(t.clientX, t.clientY); };

    setSize(); setLines();
    frameRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{ backgroundColor, ...style }}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-3 w-3 rounded-full bg-[color:var(--color-brand)]/70 blur-[6px]"
        style={{ transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)', willChange: 'transform' }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default InteractiveWavesBackground;