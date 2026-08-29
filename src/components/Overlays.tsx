import type { ReactNode } from "react";
import { DIFFICULTIES } from "../game/engine";
import type { DeathCause, DifficultyId } from "../game/engine";
import {
  IconBolt,
  IconCrown,
  IconHome,
  IconPlay,
  IconRestart,
  IconSnake,
  IconStar,
  IconTrophy,
} from "./Icons";

function Shell({ children, tint = "rgba(4,13,9,0.82)" }: { children: ReactNode; tint?: string }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-5 text-center backdrop-blur-[3px] animate-rise"
      style={{ background: `linear-gradient(180deg, ${tint}, rgba(4,13,9,0.9))` }}
    >
      {children}
    </div>
  );
}

function ArcadeButton({
  onClick,
  children,
  primary = false,
  ghost = false,
}: {
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
  ghost?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "btn-arcade inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5",
        "font-display text-xs font-bold uppercase tracking-[0.14em]",
        primary
          ? "bg-mint text-abyss shadow-[0_0_28px_rgba(61,245,166,0.35),0_4px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(61,245,166,0.55),0_4px_0_rgba(0,0,0,0.4)]"
          : ghost
            ? "border border-line bg-transparent text-fog hover:text-ink hover:border-line2"
            : "border border-line bg-moss text-ink shadow-[0_4px_0_rgba(0,0,0,0.4)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function DifficultyPicker({
  value,
  onChange,
  compact = false,
}: {
  value: DifficultyId;
  onChange: (id: DifficultyId) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex w-full gap-1.5"
          : "grid w-full max-w-xs grid-cols-3 gap-2"
      }
      role="radiogroup"
      aria-label="Сложность"
    >
      {DIFFICULTIES.map((d) => {
        const active = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(d.id)}
            className={[
              "btn-arcade rounded-lg border px-2 py-2 font-display text-[11px] font-bold uppercase tracking-wider",
              active
                ? "border-mint/70 bg-moss2 text-mint shadow-[0_0_18px_rgba(61,245,166,0.25)]"
                : "border-line bg-moss/70 text-fog hover:text-ink hover:border-line2",
            ].join(" ")}
          >
            <span className="flex items-center justify-center gap-1.5">
              {d.id === "turbo" && <IconBolt className="size-3.5" />}
              {d.name}
            </span>
            {!compact && (
              <span className="mt-1 block text-[10px] font-medium normal-case tracking-normal text-fog/80">
                очки ×{d.mult}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Меню ──────────────────────────────────────────── */

export function MenuOverlay({
  difficulty,
  onDifficulty,
  onStart,
  best,
}: {
  difficulty: DifficultyId;
  onDifficulty: (id: DifficultyId) => void;
  onStart: () => void;
  best: number;
}) {
  return (
    <Shell>
      <div className="flex items-center gap-2 rounded-full border border-line bg-moss/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-fog">
        <span className="size-1.5 rounded-full bg-mint animate-pulse-dot" />
        Неоновая аркада
      </div>
      <h2 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-ink sm:text-5xl">
        Змей<span className="text-mint text-glow-mint">ка</span>
      </h2>
      <p className="max-w-[26ch] text-sm text-fog">
        Собирай яблоки, лови бонус-звёзды и не врезайся в собственный хвост.
      </p>

      <DifficultyPicker value={difficulty} onChange={onDifficulty} />

      <ArcadeButton primary onClick={onStart}>
        <IconPlay className="size-4" />
        Играть
      </ArcadeButton>

      {best > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gold">
          <IconTrophy className="size-4" />
          Рекорд на этой сложности: {best}
        </div>
      )}

      <div className="mt-1 hidden items-center gap-2 text-[11px] text-fog/80 md:flex">
        <span className="kbd">←↑↓→</span>
        <span className="kbd">WASD</span> движение
        <span className="mx-1 text-line2">·</span>
        <span className="kbd">Space</span> пауза
        <span className="mx-1 text-line2">·</span>
        <span className="kbd">R</span> заново
      </div>
      <div className="text-[11px] text-fog/80 md:hidden">
        Свайпы по полю или кнопки-стрелки под ним
      </div>
    </Shell>
  );
}

/* ── Отсчёт ────────────────────────────────────────── */

export function ReadyOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center">
        <span className="absolute size-28 rounded-full border-2 border-mint/30 animate-pulse-dot" />
        <span className="font-display text-4xl font-black uppercase tracking-tight text-mint text-glow-mint animate-pop sm:text-5xl">
          Старт!
        </span>
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-fog">Приготовьтесь…</p>
    </div>
  );
}

/* ── Пауза ─────────────────────────────────────────── */

export function PauseOverlay({
  score,
  onResume,
  onRestart,
  onMenu,
}: {
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}) {
  return (
    <Shell tint="rgba(4,13,9,0.7)">
      <div className="flex items-center gap-2 text-amber">
        <span className="size-2.5 rounded-sm bg-amber animate-blink" />
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
          Пауза
        </h2>
      </div>
      <p className="text-sm text-fog">
        Текущий счёт: <span className="font-display font-bold text-mint">{score}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <ArcadeButton primary onClick={onResume}>
          <IconPlay className="size-4" />
          Дальше
        </ArcadeButton>
        <ArcadeButton onClick={onRestart}>
          <IconRestart className="size-4" />
          Заново
        </ArcadeButton>
        <ArcadeButton ghost onClick={onMenu}>
          <IconHome className="size-4" />В меню
        </ArcadeButton>
      </div>
      <p className="text-[11px] text-fog/70">
        <span className="kbd">Space</span> — продолжить
      </p>
    </Shell>
  );
}

/* ── Финал ─────────────────────────────────────────── */

const CAUSE_TEXT: Record<Exclude<DeathCause, null>, string> = {
  wall: "Змейка врезалась в стену",
  self: "Змейка укусила себя за хвост",
  win: "Поле заполнено целиком. Абсолютная победа!",
};

export function GameOverOverlay({
  score,
  best,
  newRecord,
  eaten,
  cause,
  onRestart,
  onMenu,
}: {
  score: number;
  best: number;
  newRecord: boolean;
  eaten: number;
  cause: DeathCause;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const won = cause === "win";
  return (
    <Shell>
      {newRecord ? (
        <div className="flex items-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-gold animate-pop">
          <IconCrown className="size-4" />
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-glow-gold">
            Новый рекорд
          </span>
        </div>
      ) : (
        <div className="h-7" />
      )}
      <h2
        className={[
          "font-display text-3xl font-black uppercase tracking-tight sm:text-4xl",
          won ? "text-gold text-glow-gold" : "text-coral text-glow-coral",
        ].join(" ")}
      >
        {won ? "Победа!" : "Игра окончена"}
      </h2>
      <p className="text-sm text-fog">{cause ? CAUSE_TEXT[cause] : ""}</p>

      <div className="flex items-end gap-6">
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fog">Счёт</div>
          <div className="font-display text-4xl font-black text-mint text-glow-mint sm:text-5xl">
            {score}
          </div>
        </div>
        <div className="mb-1 h-10 w-px bg-line" />
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fog">Яблок</div>
          <div className="font-display text-2xl font-bold text-amber">{eaten}</div>
        </div>
        <div className="mb-1 h-10 w-px bg-line" />
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fog">Рекорд</div>
          <div className="flex items-center gap-1.5 font-display text-2xl font-bold text-gold">
            <IconTrophy className="size-5" />
            {Math.max(best, score)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <ArcadeButton primary onClick={onRestart}>
          <IconRestart className="size-4" />
          Ещё раз
        </ArcadeButton>
        <ArcadeButton ghost onClick={onMenu}>
          <IconHome className="size-4" />В меню
        </ArcadeButton>
      </div>
      <p className="text-[11px] text-fog/70">
        <span className="kbd">Space</span> или <span className="kbd">R</span> — реванш
      </p>
      <span className="pointer-events-none absolute right-4 top-4 text-mint/25 animate-wobble">
        <IconSnake className="size-10" strokeWidth={1.6} />
      </span>
      <span className="pointer-events-none absolute left-4 bottom-4 text-gold/20 animate-floaty">
        <IconStar className="size-8" />
      </span>
    </Shell>
  );
}

