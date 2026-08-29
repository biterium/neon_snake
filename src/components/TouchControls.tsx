import type { ReactNode } from "react";
import type { Vec } from "../game/engine";
import { IconChevron, IconPause, IconPlay } from "./Icons";

interface Props {
  onDir: (d: Vec) => void;
  onCenter: () => void;
  paused: boolean;
  canPause: boolean;
}

function PadBtn({
  label,
  onPress,
  children,
  className = "",
  accent = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  className?: string;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      className={[
        "pad-btn flex items-center justify-center rounded-xl border h-14",
        accent
          ? "border-amber/50 bg-amber/15 text-amber"
          : "border-line bg-moss text-ink/90",
        "active:scale-95 active:bg-moss2 active:border-line2 transition-transform duration-100",
        "disabled:opacity-30 disabled:pointer-events-none",
        "shadow-[0_4px_0_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function TouchControls({ onDir, onCenter, paused, canPause }: Props) {
  const D: Record<"up" | "down" | "left" | "right", Vec> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  return (
    <div className="grid w-52 grid-cols-3 gap-2 select-none" role="group" aria-label="Сенсорное управление">
      <div />
      <PadBtn label="Вверх" onPress={() => onDir(D.up)}>
        <IconChevron dir="up" className="size-6" />
      </PadBtn>
      <div />
      <PadBtn label="Влево" onPress={() => onDir(D.left)}>
        <IconChevron dir="left" className="size-6" />
      </PadBtn>
      <PadBtn label={paused ? "Продолжить" : "Пауза"} accent onPress={onCenter} disabled={!canPause}>
        {paused ? <IconPlay className="size-6" /> : <IconPause className="size-6" />}
      </PadBtn>
      <PadBtn label="Вправо" onPress={() => onDir(D.right)}>
        <IconChevron dir="right" className="size-6" />
      </PadBtn>
      <div />
      <PadBtn label="Вниз" onPress={() => onDir(D.down)}>
        <IconChevron dir="down" className="size-6" />
      </PadBtn>
      <div />
    </div>
  );
}
