import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSnakeGame } from "./game/useSnakeGame";
import { BASE_POINTS, BONUS_POINTS, DIFFICULTIES, difficultyById } from "./game/engine";
import type { Difficulty, DifficultyId, Vec } from "./game/engine";
import TouchControls from "./components/TouchControls";
import {
  GameOverOverlay,
  MenuOverlay,
  PauseOverlay,
  ReadyOverlay,
  DifficultyPicker,
} from "./components/Overlays";
import {
  IconApple,
  IconBolt,
  IconGauge,
  IconHome,
  IconPause,
  IconPlay,
  IconRestart,
  IconSnake,
  IconSoundOff,
  IconSoundOn,
  IconStar,
  IconTrophy,
} from "./components/Icons";

/* ── Мелкие блоки интерфейса ───────────────────────── */

function PanelCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-pine/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h3 className="mb-3 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-fog">
        <span className="h-3 w-1 rounded-full bg-mint" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function HudChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-line bg-moss/70 px-2.5 py-1.5" title={label}>
      <span className="text-mint [&>svg]:size-4">{icon}</span>
      <div className="leading-none">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-fog">{label}</div>
        <div className="mt-0.5 font-display text-xs font-bold text-ink">{value}</div>
      </div>
    </div>
  );
}

function SpeedBars({ level, accent }: { level: number; accent: string }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: `${7 + i * 4}px`,
            background: i <= level ? accent : "#1d4030",
          }}
        />
      ))}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string; dot: string }> = {
    menu: { text: "Меню", cls: "text-fog", dot: "bg-fog" },
    ready: { text: "Старт", cls: "text-mint", dot: "bg-mint animate-pulse-dot" },
    playing: { text: "Игра", cls: "text-mint", dot: "bg-mint animate-pulse-dot" },
    paused: { text: "Пауза", cls: "text-amber", dot: "bg-amber animate-blink" },
    dying: { text: "Ай!", cls: "text-coral", dot: "bg-coral" },
    gameover: { text: "Финал", cls: "text-coral", dot: "bg-coral" },
  };
  const m = map[status] ?? map.menu;
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${m.cls}`}>
      <span className={`size-2 rounded-full ${m.dot}`} />
      {m.text}
    </span>
  );
}

function IconBtn({
  onClick,
  label,
  children,
  disabled = false,
  active = false,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "btn-arcade flex size-10 items-center justify-center rounded-lg border",
        active ? "border-amber/60 bg-amber/15 text-amber" : "border-line bg-moss text-ink/85 hover:text-mint hover:border-line2",
        "shadow-[0_3px_0_rgba(0,0,0,0.35)] disabled:opacity-30 disabled:pointer-events-none",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ── Приложение ────────────────────────────────────── */

export default function App() {
  const game = useSnakeGame();
  const { ui } = game;
  const diff: Difficulty = difficultyById(game.difficulty);

  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const on = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  const inRun = ui.status === "playing" || ui.status === "paused" || ui.status === "ready";
  const padVisible = coarse; // на десктопе с мышью достаточно клавиатуры

  const statusWord = {
    menu: "меню",
    ready: "старт",
    playing: "игра",
    paused: "пауза",
    dying: "ай!",
    gameover: "финал",
  }[ui.status];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-abyss text-ink">
      {/* Живой фон */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-grid-pattern absolute inset-0" />
        <div className="animate-drift-a absolute -top-32 left-[8%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgba(23,192,122,0.14),transparent_62%)] blur-2xl" />
        <div className="animate-drift-b absolute -bottom-40 right-[4%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(255,180,58,0.10),transparent_60%)] blur-2xl" />
        <div className="animate-drift-b absolute top-[30%] right-[22%] size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(61,245,166,0.07),transparent_60%)] blur-2xl" />
        {[
          { l: "12%", t: "22%", d: "0s", c: "#3df5a6" },
          { l: "86%", t: "18%", d: "1.4s", c: "#ffd166" },
          { l: "78%", t: "64%", d: "2.6s", c: "#3df5a6" },
          { l: "8%", t: "70%", d: "0.8s", c: "#ffd166" },
          { l: "46%", t: "10%", d: "3.4s", c: "#3df5a6" },
          { l: "30%", t: "86%", d: "2s", c: "#ffd166" },
        ].map((f, i) => (
          <span
            key={i}
            className="animate-floaty absolute size-1.5 rounded-full blur-[1px]"
            style={{ left: f.l, top: f.t, background: f.c, animationDelay: f.d, opacity: 0.5 }}
          />
        ))}
      </div>

      {/* Шапка */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-line bg-moss text-mint shadow-[0_0_20px_rgba(61,245,166,0.28)]">
            <IconSnake className="size-6" />
          </div>
          <div>
            <div className="font-display text-lg font-black uppercase leading-none tracking-tight">
              Змей<span className="text-mint">ка</span>
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-fog">
              неоновая аркада
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot status={ui.status} />
          <IconBtn onClick={game.toggleMute} label={game.muted ? "Включить звук (M)" : "Выключить звук (M)"} active={!game.muted}>
            {game.muted ? <IconSoundOff className="size-5" /> : <IconSoundOn className="size-5" />}
          </IconBtn>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-start gap-6 px-4 pb-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Игровая колонка */}
        <div className="flex flex-col items-center">
          <div className="board-stack flex flex-col">
            {/* Мобильный выбор сложности */}
            <div className="mb-2.5 lg:hidden">
              <DifficultyPicker compact value={game.difficulty} onChange={game.setDifficulty} />
            </div>

            {/* HUD */}
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-line bg-pine/85 px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-fog">Счёт</div>
                  <div key={ui.score} className="animate-pop font-display text-2xl font-black leading-tight text-mint text-glow-mint sm:text-3xl">
                    {ui.score}
                  </div>
                </div>
                <div className="h-9 w-px bg-line" />
                <div>
                  <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-fog">
                    <IconTrophy className="size-3 text-gold" />
                    Рекорд
                  </div>
                  <div className="font-display text-lg font-bold leading-tight text-gold">{ui.best}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="mr-1 hidden items-center gap-1.5 sm:flex">
                  <HudChip icon={<IconSnake className="size-4" />} label="Длина" value={String(ui.length)} />
                  <HudChip icon={<IconApple className="size-4" />} label="Яблок" value={String(ui.eaten)} />
                  <HudChip icon={<IconBolt className="size-4" />} label="Очки" value={`×${diff.mult}`} />
                </div>
                <IconBtn
                  onClick={game.togglePause}
                  label={ui.status === "paused" ? "Продолжить (Space)" : "Пауза (Space)"}
                  disabled={ui.status !== "playing" && ui.status !== "paused"}
                  active={ui.status === "paused"}
                >
                  {ui.status === "paused" ? <IconPlay className="size-4" /> : <IconPause className="size-4" />}
                </IconBtn>
                <IconBtn onClick={game.restart} label="Начать заново (R)" disabled={!inRun && ui.status !== "gameover" && ui.status !== "dying"}>
                  <IconRestart className="size-4" />
                </IconBtn>
                <IconBtn onClick={game.toMenu} label="В меню" disabled={ui.status === "menu"}>
                  <IconHome className="size-4" />
                </IconBtn>
              </div>
            </div>

            {/* Поле */}
            <div className="relative flex justify-center">
              <div
                ref={game.boardRef}
                className="scanlines board-vignette relative aspect-square w-full touch-none overflow-hidden rounded-xl border border-line2 bg-pine shadow-[0_0_0_1px_rgba(5,15,11,0.9),0_24px_60px_rgba(0,0,0,0.55),0_0_44px_rgba(61,245,166,0.08)]"
                {...game.touchHandlers}
              >
                <canvas ref={game.canvasRef} className="absolute inset-0 h-full w-full" />
                {/* Угловые скобки в стиле аркадных автоматов */}
                <span className="pointer-events-none absolute left-2 top-2 z-10 size-5 border-l-2 border-t-2 border-mint/50" />
                <span className="pointer-events-none absolute right-2 top-2 z-10 size-5 border-r-2 border-t-2 border-mint/50" />
                <span className="pointer-events-none absolute bottom-2 left-2 z-10 size-5 border-b-2 border-l-2 border-mint/50" />
                <span className="pointer-events-none absolute bottom-2 right-2 z-10 size-5 border-b-2 border-r-2 border-mint/50" />

                {ui.status === "menu" && (
                  <MenuOverlay
                    difficulty={game.difficulty}
                    onDifficulty={game.setDifficulty}
                    onStart={game.start}
                    best={game.bests[game.difficulty]}
                  />
                )}
                {ui.status === "ready" && <ReadyOverlay />}
                {ui.status === "paused" && (
                  <PauseOverlay
                    score={ui.score}
                    onResume={game.togglePause}
                    onRestart={game.restart}
                    onMenu={game.toMenu}
                  />
                )}
                {ui.status === "gameover" && (
                  <GameOverOverlay
                    score={ui.score}
                    best={ui.best}
                    newRecord={ui.newRecord}
                    eaten={ui.eaten}
                    cause={ui.cause}
                    onRestart={game.restart}
                    onMenu={game.toMenu}
                  />
                )}
              </div>
            </div>

            {/* Нижняя строка статуса поля */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-fog/80">
              <span className="flex items-center gap-1.5">
                <IconGauge className="size-3.5 text-mint" />
                Темп: <b className="text-ink/90">{diff.speedLabel}</b>
                <span className="text-line2">·</span>
                {statusWord}
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <IconApple className="size-3.5 text-amber" />+{BASE_POINTS * diff.mult}
                <span className="mx-1 text-line2">·</span>
                <IconStar className="size-3.5 text-gold" />+{BONUS_POINTS * diff.mult}
                <span className="ml-1 text-fog/60">(каждые 5 яблок, 7 сек)</span>
              </span>
            </div>
          </div>

          {/* Сенсорные кнопки */}
          {padVisible && (
            <div className="mt-4 animate-fade-up">
              <TouchControls
                onDir={(d: Vec) => game.enqueueDir(d)}
                onCenter={game.togglePause}
                paused={ui.status === "paused"}
                canPause={ui.status === "playing" || ui.status === "paused"}
              />
            </div>
          )}
        </div>

        {/* Боковая панель (десктоп) */}
        <aside className="hidden flex-col gap-4 lg:flex">
          <PanelCard title="Сложность">
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Сложность">
              {DIFFICULTIES.map((d, idx) => {
                const active = d.id === game.difficulty;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => game.setDifficulty(d.id as DifficultyId)}
                    className={[
                      "btn-arcade flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left",
                      active
                        ? "border-mint/70 bg-moss2 shadow-[0_0_18px_rgba(61,245,166,0.18)]"
                        : "border-line bg-moss/60 hover:border-line2",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={[
                          "flex size-3.5 items-center justify-center rounded-full border-2",
                          active ? "border-mint" : "border-line2",
                        ].join(" ")}
                      >
                        {active && <span className="size-1.5 rounded-full bg-mint" />}
                      </span>
                      <span>
                        <span className={`font-display text-xs font-bold uppercase tracking-wide ${active ? "text-mint" : "text-ink"}`}>
                          {d.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-tight text-fog">{d.desc}</span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <SpeedBars level={idx} accent={d.accent} />
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-gold/90">
                        <IconTrophy className="size-3" />
                        {game.bests[d.id]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-fog/75">
              Скорость и множитель очков меняются сразу, рекорд сохраняется отдельно для каждого темпа.
            </p>
          </PanelCard>

          <PanelCard title="Управление">
            <ul className="flex flex-col gap-2 text-[13px] text-ink/90">
              <li className="flex items-center justify-between gap-2">
                <span>Движение</span>
                <span className="flex items-center gap-1">
                  <span className="kbd">↑↓←→</span>
                  <span className="kbd">WASD</span>
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span>Старт / пауза</span>
                <span className="kbd">Space</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span>Рестарт</span>
                <span className="kbd">R</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span>Звук</span>
                <span className="kbd">M</span>
              </li>
            </ul>
          </PanelCard>

          <PanelCard title="Сводка забега">
            <dl className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line bg-moss/50 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-fog">Длина</dt>
                <dd key={ui.length} className="animate-pop font-display text-lg font-bold text-mint">{ui.length}</dd>
              </div>
              <div className="rounded-lg border border-line bg-moss/50 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-fog">Яблок</dt>
                <dd key={ui.eaten} className="animate-pop font-display text-lg font-bold text-amber">{ui.eaten}</dd>
              </div>
              <div className="rounded-lg border border-line bg-moss/50 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-fog">За яблоко</dt>
                <dd className="font-display text-lg font-bold text-ink">{BASE_POINTS * diff.mult}</dd>
              </div>
              <div className="rounded-lg border border-line bg-moss/50 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-fog">Шаг</dt>
                <dd className="font-display text-lg font-bold text-ink">{diff.interval} мс</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[11px] text-gold/90">
              <IconStar className="size-4 shrink-0" />
              Звезда даёт +{BONUS_POINTS * diff.mult} очков и растит змейку — успей за 7 секунд.
            </div>
          </PanelCard>
        </aside>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-5">
        <p className="text-center text-[11px] text-fog/60">
          Стены смертельны во всех режимах · Бонус-звезда появляется каждые 5 яблок · Рекорды хранятся в этом браузере
        </p>
      </footer>
    </div>
  );
}
