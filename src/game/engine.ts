/* Чистая игровая логика «Змейки» — без React и DOM. */

export interface Vec {
  x: number;
  y: number;
}

export type Status = "menu" | "ready" | "playing" | "paused" | "dying" | "gameover";
export type DifficultyId = "calm" | "classic" | "turbo";
export type DeathCause = "wall" | "self" | "win" | null;

export interface Difficulty {
  id: DifficultyId;
  name: string;
  desc: string;
  /** миллисекунд на один шаг змейки */
  interval: number;
  /** множитель очков */
  mult: number;
  accent: string;
  speedLabel: string;
}

export const COLS = 21;
export const ROWS = 21;
export const BONUS_TTL = 7000;
export const BONUS_EVERY = 5;
export const BASE_POINTS = 10;
export const BONUS_POINTS = 50;

export const DIFFICULTIES: Difficulty[] = [
  {
    id: "calm",
    name: "Спокойный",
    desc: "Размеренный темп для разминки",
    interval: 155,
    mult: 1,
    accent: "#3df5a6",
    speedLabel: "6,5 кл/с",
  },
  {
    id: "classic",
    name: "Классика",
    desc: "Тот самый темп из 90-х",
    interval: 112,
    mult: 2,
    accent: "#ffb43a",
    speedLabel: "9 кл/с",
  },
  {
    id: "turbo",
    name: "Турбо",
    desc: "Рефлексы на пределе",
    interval: 76,
    mult: 3,
    accent: "#ff5d73",
    speedLabel: "13 кл/с",
  },
];

export const difficultyById = (id: DifficultyId): Difficulty =>
  DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];

export interface Particle {
  x: number; // в клетках (дробные)
  y: number;
  vx: number; // клеток/сек
  vy: number;
  life: number; // мс
  max: number;
  size: number; // доля клетки
  color: string;
}

export interface Bonus {
  cell: Vec;
  expiresAt: number; // по игровым часам (clock)
}

export interface Game {
  status: Status;
  snake: Vec[];
  prev: Vec[];
  dir: Vec;
  queue: Vec[];
  food: Vec | null;
  bonus: Bonus | null;
  score: number;
  eaten: number;
  acc: number; // аккумулятор шага, мс
  clock: number; // игровое время (идёт только в playing), мс
  time: number; // реальное время анимаций, мс
  shake: number; // 0..1
  flash: number; // 0..1
  particles: Particle[];
  ambientAcc: number;
  readyStart: number;
  dieStart: number;
  newRecord: boolean;
  cause: DeathCause;
}

const center = (): Vec => ({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });

export function createGame(): Game {
  const g: Game = {
    status: "menu",
    snake: [],
    prev: [],
    dir: { x: 1, y: 0 },
    queue: [],
    food: null,
    bonus: null,
    score: 0,
    eaten: 0,
    acc: 0,
    clock: 0,
    time: 0,
    shake: 0,
    flash: 0,
    particles: [],
    ambientAcc: 0,
    readyStart: 0,
    dieStart: 0,
    newRecord: false,
    cause: null,
  };
  resetRun(g);
  g.status = "menu";
  return g;
}

/** Сброс перед новым забегом (переводит в статус ready). */
export function resetRun(g: Game): void {
  const c = center();
  g.snake = [c, { x: c.x - 1, y: c.y }, { x: c.x - 2, y: c.y }];
  g.prev = g.snake.map((v) => ({ ...v }));
  g.dir = { x: 1, y: 0 };
  g.queue = [];
  g.food = randomFreeCell(g);
  g.bonus = null;
  g.score = 0;
  g.eaten = 0;
  g.acc = 0;
  g.clock = 0;
  g.shake = 0;
  g.flash = 0;
  g.particles = [];
  g.newRecord = false;
  g.cause = null;
  g.status = "ready";
}

export function randomFreeCell(g: Game): Vec | null {
  const occupied = new Set<number>();
  for (const s of g.snake) occupied.add(s.y * COLS + s.x);
  if (g.food) occupied.add(g.food.y * COLS + g.food.x);
  if (g.bonus) occupied.add(g.bonus.cell.y * COLS + g.bonus.cell.x);
  const free: number[] = [];
  for (let i = 0; i < COLS * ROWS; i++) if (!occupied.has(i)) free.push(i);
  if (free.length === 0) return null;
  const pick = free[Math.floor(Math.random() * free.length)];
  return { x: pick % COLS, y: Math.floor(pick / COLS) };
}

export interface StepEvents {
  ate: boolean;
  bonus: boolean;
  died: boolean;
  won: boolean;
}

function startDying(g: Game, cause: "wall" | "self", now: number): StepEvents {
  g.status = "dying";
  g.cause = cause;
  g.dieStart = now;
  g.shake = 1;
  g.flash = 1;
  for (const s of g.snake) {
    spawnBurst(g, s.x + 0.5, s.y + 0.5, ["#ff5d73", "#ffb43a", "#3df5a6"], 2, 3.2);
  }
  return { ate: false, bonus: false, died: true, won: false };
}

/** Один логический шаг. clock — игровое время, now — реальное (для анимации смерти). */
export function stepGame(g: Game, diff: Difficulty, clock: number, now: number): StepEvents {
  // Применяем направление из очереди (первый допустимый поворот).
  while (g.queue.length > 0) {
    const d = g.queue.shift()!;
    const reverse = d.x === -g.dir.x && d.y === -g.dir.y;
    const same = d.x === g.dir.x && d.y === g.dir.y;
    if (!reverse && !same) {
      g.dir = d;
      break;
    }
  }

  const head = g.snake[0];
  const nx = head.x + g.dir.x;
  const ny = head.y + g.dir.y;

  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return startDying(g, "wall", now);

  const eating = !!g.food && g.food.x === nx && g.food.y === ny;
  const eatingBonus = !!g.bonus && g.bonus.cell.x === nx && g.bonus.cell.y === ny;
  const grows = eating || eatingBonus;

  const body = grows ? g.snake : g.snake.slice(0, -1); // хвост успевает уйти
  if (body.some((s) => s.x === nx && s.y === ny)) return startDying(g, "self", now);

  g.prev = g.snake.map((c) => ({ ...c }));
  g.snake.unshift({ x: nx, y: ny });

  const ev: StepEvents = { ate: eating, bonus: eatingBonus, died: false, won: false };

  if (eating) {
    g.prev.unshift({ ...g.prev[0] });
    g.eaten += 1;
    g.score += BASE_POINTS * diff.mult;
    spawnBurst(g, nx + 0.5, ny + 0.5, ["#ffb43a", "#ffd166", "#3df5a6"], 16, 5.5);
    g.food = randomFreeCell(g);
    if (g.eaten % BONUS_EVERY === 0 && !g.bonus) {
      const cell = randomFreeCell(g);
      if (cell) g.bonus = { cell, expiresAt: clock + BONUS_TTL };
    }
  } else if (eatingBonus) {
    g.prev.unshift({ ...g.prev[0] });
    g.score += BONUS_POINTS * diff.mult;
    spawnBurst(g, nx + 0.5, ny + 0.5, ["#ffd166", "#ffb43a", "#eafff3"], 26, 7);
    g.bonus = null;
  } else {
    g.snake.pop();
  }

  if (g.bonus && clock >= g.bonus.expiresAt) {
    spawnBurst(g, g.bonus.cell.x + 0.5, g.bonus.cell.y + 0.5, ["#86b39c"], 8, 2.5);
    g.bonus = null;
  }

  if (g.snake.length >= COLS * ROWS) {
    g.status = "gameover";
    g.cause = "win";
    ev.won = true;
  }

  return ev;
}

/* ── Частицы ───────────────────────────────────────── */

export function spawnBurst(
  g: Game,
  x: number,
  y: number,
  colors: string[],
  count: number,
  power: number
): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (0.4 + Math.random() * 0.6) * power;
    const life = 380 + Math.random() * 520;
    g.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1.2,
      life,
      max: life,
      size: 0.08 + Math.random() * 0.14,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  if (g.particles.length > 420) g.particles.splice(0, g.particles.length - 420);
}

export function spawnMote(g: Game): void {
  const life = 4200 + Math.random() * 3600;
  g.particles.push({
    x: Math.random() * COLS,
    y: ROWS + 0.6,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.35 + Math.random() * 0.7),
    life,
    max: life,
    size: 0.05 + Math.random() * 0.08,
    color: Math.random() < 0.75 ? "#3df5a6" : "#ffd166",
  });
}

export function updateFx(g: Game, dt: number): void {
  g.shake = Math.max(0, g.shake - dt / 420);
  g.flash = Math.max(0, g.flash - dt / 340);
  const sec = dt / 1000;
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.x += p.vx * sec;
    p.y += p.vy * sec;
    p.vy += 2.6 * sec; // лёгкая гравитация
    p.vx *= 1 - 1.6 * sec;
    p.life -= dt;
    if (p.life <= 0 || p.y > ROWS + 2) g.particles.splice(i, 1);
  }
}
