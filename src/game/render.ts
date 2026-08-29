/* Отрисовка игрового поля на canvas. */

import { BONUS_TTL, COLS, ROWS } from "./engine";
import type { Difficulty, Game, Vec } from "./engine";

type RGB = [number, number, number];

const BODY_HEAD: RGB = [92, 247, 180]; // #5cf7b4
const BODY_TAIL: RGB = [11, 94, 60]; //  #0b5e3c

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mix = (a: RGB, b: RGB, t: number): string =>
  `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(
    lerp(a[2], b[2], t)
  )})`;

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rot: number
): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.46;
    const a = rot + (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function draw(
  ctx: CanvasRenderingContext2D,
  g: Game,
  diff: Difficulty,
  w: number,
  h: number
): void {
  const cell = Math.min(w / COLS, h / ROWS);
  const ox = (w - cell * COLS) / 2;
  const oy = (h - cell * ROWS) / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#071510";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  if (g.shake > 0) {
    const s = g.shake * g.shake * 9;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Шахматное поле — чёткая сетка.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#0a1c14" : "#081710";
      ctx.fillRect(ox + x * cell, oy + y * cell, cell + 0.5, cell + 0.5);
    }
  }

  // Тонкая рамка внутри поля.
  ctx.strokeStyle = "rgba(61,245,166,0.10)";
  ctx.lineWidth = Math.max(1, cell * 0.06);
  ctx.strokeRect(ox + ctx.lineWidth / 2, oy + ctx.lineWidth / 2, cell * COLS - ctx.lineWidth, cell * ROWS - ctx.lineWidth);

  const px = (v: Vec) => ({ x: ox + (v.x + 0.5) * cell, y: oy + (v.y + 0.5) * cell });

  // Фоновые «светлячки» (частицы рисуются под змейкой).
  for (const p of g.particles) {
    const a = Math.max(0, Math.min(1, p.life / p.max));
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(ox + p.x * cell, oy + p.y * cell, Math.max(0.6, p.size * cell * (0.5 + a * 0.5)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Еда — пульсирующее янтарное «яблоко» со свечением.
  if (g.food) {
    const f = px(g.food);
    const pulse = 1 + Math.sin(g.time / 170) * 0.09;
    const r = cell * 0.34 * pulse;
    const glow = ctx.createRadialGradient(f.x, f.y, r * 0.2, f.x, f.y, cell * 1.7);
    glow.addColorStop(0, "rgba(255,180,58,0.40)");
    glow.addColorStop(1, "rgba(255,180,58,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(f.x, f.y, cell * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffb43a";
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(f.x - r * 0.32, f.y - r * 0.34, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // листик
    ctx.save();
    ctx.translate(f.x + r * 0.25, f.y - r * 0.95);
    ctx.rotate(-0.7);
    ctx.fillStyle = "#3ddc8f";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.34, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Бонус — золотая звезда с кольцом-таймером.
  if (g.bonus) {
    const b = px(g.bonus.cell);
    const remain = Math.max(0, g.bonus.expiresAt - g.clock);
    const frac = Math.min(1, remain / BONUS_TTL);
    const blinking = remain < 2000 ? (Math.sin(g.time / 70) > 0 ? 1 : 0.3) : 1;

    ctx.globalAlpha = blinking;
    const glow = ctx.createRadialGradient(b.x, b.y, cell * 0.1, b.x, b.y, cell * 1.5);
    glow.addColorStop(0, "rgba(255,209,102,0.40)");
    glow.addColorStop(1, "rgba(255,209,102,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, cell * 1.5, 0, Math.PI * 2);
    ctx.fill();

    drawStar(ctx, b.x, b.y, cell * 0.36 * (1 + Math.sin(g.time / 130) * 0.08), g.time / 620);
    ctx.fillStyle = "#ffd166";
    ctx.fill();

    ctx.strokeStyle = "rgba(255,209,102,0.85)";
    ctx.lineWidth = Math.max(1.5, cell * 0.07);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(b.x, b.y, cell * 0.58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Змейка — интерполяция между логическими кадрами.
  const t =
    g.status === "playing" || g.status === "paused"
      ? Math.max(0, Math.min(1, g.acc / diff.interval))
      : 1;
  const n = g.snake.length;
  if (n > 0) {
    const pts: { x: number; y: number }[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const cur = g.snake[i];
      const prev = g.prev[i] ?? cur;
      pts[i] = {
        x: ox + (lerp(prev.x, cur.x, t) + 0.5) * cell,
        y: oy + (lerp(prev.y, cur.y, t) + 0.5) * cell,
      };
    }

    const dying = g.status === "dying" || g.status === "gameover";
    ctx.globalAlpha = dying ? 0.85 : 1;

    // Мягкое свечение под телом — одним путём (дёшево).
    ctx.beginPath();
    ctx.moveTo(pts[n - 1].x, pts[n - 1].y);
    for (let i = n - 2; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = dying ? "rgba(255,93,115,0.14)" : "rgba(61,245,166,0.11)";
    ctx.lineWidth = cell * 1.12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Сегменты тела от хвоста к голове, цвет и толщина сходят на нет.
    for (let i = n - 1; i >= 1; i--) {
      const f = n === 1 ? 0 : i / (n - 1);
      const taper = 1 - f * 0.48;
      ctx.strokeStyle = dying && i % 2 === 0 ? "#ff8896" : mix(BODY_HEAD, BODY_TAIL, f);
      ctx.lineWidth = cell * 0.74 * taper;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
      ctx.stroke();
    }

    // Голова с глазами.
    const head = pts[0];
    const neck = pts[1] ?? { x: head.x - g.dir.x * cell, y: head.y - g.dir.y * cell };
    let dx = head.x - neck.x;
    let dy = head.y - neck.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const pxp = -dy;
    const pyp = dx;

    ctx.fillStyle = dying ? "#ff8896" : "#7dffc4";
    ctx.beginPath();
    ctx.arc(head.x, head.y, cell * 0.42, 0, Math.PI * 2);
    ctx.fill();

    const eyeR = cell * 0.115;
    for (const s of [1, -1]) {
      const ex = head.x + dx * cell * 0.13 + pxp * s * cell * 0.17;
      const ey = head.y + dy * cell * 0.13 + pyp * s * cell * 0.17;
      ctx.fillStyle = "#eafff3";
      ctx.beginPath();
      ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#07241a";
      ctx.beginPath();
      ctx.arc(ex + dx * eyeR * 0.45, ey + dy * eyeR * 0.45, eyeR * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Красная вспышка при столкновении.
  if (g.flash > 0) {
    ctx.fillStyle = `rgba(255,80,96,${(g.flash * 0.32).toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
  }
}
