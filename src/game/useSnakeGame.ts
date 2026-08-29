import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { Sfx } from "./audio";
import { draw } from "./render";
import {
  createGame,
  difficultyById,
  resetRun,
  spawnMote,
  stepGame,
  updateFx,
} from "./engine";
import type { DeathCause, DifficultyId, Game, Status, Vec } from "./engine";

export interface UiState {
  status: Status;
  score: number;
  best: number;
  length: number;
  eaten: number;
  newRecord: boolean;
  cause: DeathCause;
}

const BEST_KEY = (id: DifficultyId) => `snake-best-${id}`;
const DIFF_KEY = "snake-difficulty";
const MUTE_KEY = "snake-muted";

function loadBest(id: DifficultyId): number {
  try {
    return parseInt(localStorage.getItem(BEST_KEY(id)) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(id: DifficultyId, v: number): void {
  try {
    localStorage.setItem(BEST_KEY(id), String(v));
  } catch {
    /* приватный режим — не страшно */
  }
}

const vibrate = (ms: number) => {
  try {
    if ("vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* нет — так нет */
  }
};

export function useSnakeGame() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game>(createGame());
  const sfxRef = useRef<Sfx | null>(null);
  const sizeRef = useRef({ w: 300, h: 300, dpr: 1 });
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  if (!sfxRef.current) sfxRef.current = new Sfx();
  const sfx = sfxRef.current;

  const [difficulty, setDifficultyState] = useState<DifficultyId>(() => {
    try {
      const v = localStorage.getItem(DIFF_KEY) as DifficultyId | null;
      return v === "calm" || v === "turbo" || v === "classic" ? v : "classic";
    } catch {
      return "classic";
    }
  });
  const diffRef = useRef(difficultyById(difficulty));

  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  sfx.muted = muted;

  const [ui, setUi] = useState<UiState>(() => ({
    status: "menu",
    score: 0,
    best: loadBest(difficulty),
    length: 3,
    eaten: 0,
    newRecord: false,
    cause: null,
  }));
  const [bests, setBests] = useState<Record<DifficultyId, number>>(() => ({
    calm: loadBest("calm"),
    classic: loadBest("classic"),
    turbo: loadBest("turbo"),
  }));

  const refreshBests = useCallback(() => {
    setBests({ calm: loadBest("calm"), classic: loadBest("classic"), turbo: loadBest("turbo") });
  }, []);

  const syncUi = useCallback(() => {
    const g = gameRef.current;
    setUi({
      status: g.status,
      score: g.score,
      best: loadBest(diffRef.current.id),
      length: g.snake.length,
      eaten: g.eaten,
      newRecord: g.newRecord,
      cause: g.cause,
    });
  }, []);

  /* ── Управление ─────────────────────────────────── */

  const enqueueDir = useCallback((d: Vec) => {
    const g = gameRef.current;
    const last = g.queue.length > 0 ? g.queue[g.queue.length - 1] : g.dir;
    if (d.x === -last.x && d.y === -last.y) return;
    if (d.x === last.x && d.y === last.y) return;
    if (g.queue.length < 3) g.queue.push(d);
  }, []);

  const start = useCallback(() => {
    sfx.ensure();
    sfx.go();
    resetRun(gameRef.current);
    gameRef.current.readyStart = performance.now();
    syncUi();
  }, [sfx, syncUi]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "playing") {
      g.status = "paused";
      sfx.ensure();
      sfx.pause();
      syncUi();
    } else if (g.status === "paused") {
      sfx.ensure();
      sfx.click();
      g.status = "playing";
      syncUi();
    }
  }, [sfx, syncUi]);

  const toMenu = useCallback(() => {
    sfx.ensure();
    sfx.click();
    gameRef.current.status = "menu";
    syncUi();
  }, [sfx, syncUi]);

  /** Единая точка входа для стрелок/свайпов: запускает игру из меню. */
  const handleDirInput = useCallback(
    (d: Vec) => {
      const g = gameRef.current;
      if (g.status === "menu" || g.status === "gameover") {
        start();
        enqueueDir(d);
        return;
      }
      enqueueDir(d);
    },
    [enqueueDir, start]
  );

  const setDifficulty = useCallback(
    (id: DifficultyId) => {
      setDifficultyState(id);
      diffRef.current = difficultyById(id);
      try {
        localStorage.setItem(DIFF_KEY, id);
      } catch {
        /* ignore */
      }
      sfx.ensure();
      sfx.click();
      syncUi();
    },
    [sfx, syncUi]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      sfx.muted = next;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (!next) {
        sfx.ensure();
        sfx.click();
      }
      return next;
    });
  }, [sfx]);

  /* ── Свайпы по полю ─────────────────────────────── */

  const onTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    if (t) touchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchMove = useCallback(
    (e: ReactTouchEvent<HTMLDivElement>) => {
      const a = touchRef.current;
      const t = e.touches[0];
      if (!a || !t) return;
      const dx = t.clientX - a.x;
      const dy = t.clientY - a.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      const d: Vec =
        Math.abs(dx) > Math.abs(dy)
          ? { x: dx > 0 ? 1 : -1, y: 0 }
          : { x: 0, y: dy > 0 ? 1 : -1 };
      handleDirInput(d);
      touchRef.current = { x: t.clientX, y: t.clientY };
    },
    [handleDirInput]
  );

  /* ── Клавиатура ─────────────────────────────────── */

  useEffect(() => {
    const dirByCode: Record<string, Vec> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      KeyW: { x: 0, y: -1 },
      KeyS: { x: 0, y: 1 },
      KeyA: { x: -1, y: 0 },
      KeyD: { x: 1, y: 0 },
    };
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      const dir = dirByCode[e.code];
      if (dir) {
        e.preventDefault();
        handleDirInput(dir);
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (g.status === "menu" || g.status === "gameover") start();
        else togglePause();
      } else if (e.code === "Enter") {
        if (g.status === "menu" || g.status === "gameover") start();
        else if (g.status === "paused") togglePause();
      } else if (e.code === "KeyR") {
        if (g.status !== "menu") start();
      } else if (e.code === "KeyP" || e.code === "Escape") {
        if (g.status === "playing" || g.status === "paused") togglePause();
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDirInput, start, togglePause, toggleMute]);

  /* Автопауза при уходе со вкладки. */
  useEffect(() => {
    const onVis = () => {
      const g = gameRef.current;
      if (document.hidden && g.status === "playing") {
        g.status = "paused";
        syncUi();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [syncUi]);

  /* ── Размер canvas ──────────────────────────────── */

  useEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;
    const ro = new ResizeObserver(() => {
      const r = board.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { w: r.width, h: r.height, dpr };
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    });
    ro.observe(board);
    return () => ro.disconnect();
  }, []);

  /* ── Главный цикл ───────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const g = gameRef.current;
      const diff = diffRef.current;
      let dt = now - last;
      last = now;
      if (dt > 120) dt = 120;
      g.time += dt;

      if (g.status === "playing") {
        g.clock += dt;
        g.acc += dt;
        while (g.acc >= diff.interval && g.status === "playing") {
          g.acc -= diff.interval;
          const ev = stepGame(g, diff, g.clock, now);
          if (ev.ate) {
            sfx.eat();
            vibrate(12);
            syncUi();
          }
          if (ev.bonus) {
            sfx.bonus();
            vibrate(24);
            syncUi();
          }
          if (ev.died) {
            sfx.die();
            vibrate(110);
            syncUi();
          }
          if (ev.won) {
            finishRun();
          }
        }
      } else if (g.status === "ready") {
        if (now - g.readyStart > 720) {
          g.status = "playing";
          g.acc = 0;
          syncUi();
        }
      } else if (g.status === "dying") {
        if (now - g.dieStart > 880) finishRun();
      } else if (g.status === "menu" || g.status === "gameover") {
        g.ambientAcc += dt;
        if (g.ambientAcc > 300) {
          g.ambientAcc = 0;
          spawnMote(g);
        }
      }

      updateFx(g, dt);

      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, g, diff, w, h);

      raf = requestAnimationFrame(frame);
    };

    const finishRun = () => {
      const g = gameRef.current;
      const id = diffRef.current.id;
      g.status = "gameover";
      if (g.score > loadBest(id)) {
        saveBest(id, g.score);
        g.newRecord = true;
        sfx.record();
      }
      refreshBests();
      syncUi();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sfx, syncUi, refreshBests]);

  return {
    boardRef,
    canvasRef,
    ui,
    bests,
    difficulty,
    setDifficulty,
    muted,
    toggleMute,
    start,
    restart: start,
    togglePause,
    toMenu,
    enqueueDir: handleDirInput,
    touchHandlers: { onTouchStart, onTouchMove },
  };
}
