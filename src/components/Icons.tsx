/* Инлайновые SVG-иконки, нарисованные вручную. Цвет — currentColor. */

import type { ReactNode } from "react";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

const base = (className?: string) => className ?? "size-5";

function Svg({
  className,
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.5v15l13-7.5L7 4.5Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconRestart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 8.5A9 9 0 1 1 3 13" />
    <path d="M3 4v4.5h4.5" />
  </Svg>
);

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </Svg>
);

export const IconSoundOn = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
    <path d="M18 6.5a8 8 0 0 1 0 11" />
  </Svg>
);

export const IconSoundOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="m15.5 9.5 5 5m0-5-5 5" />
  </Svg>
);

export const IconTrophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5.5H4v1.7A3.3 3.3 0 0 0 7.3 10.5" />
    <path d="M17 5.5h3v1.7a3.3 3.3 0 0 1-3.3 3.3" />
    <path d="M12 14v3.5m-3.5 3h7m-5.5-3h4l.7 3H9.8l.7-3Z" />
  </Svg>
);

export const IconCrown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 8 4 3.5L12 5l4 6.5L20 8l-1.5 10h-13L4 8Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconApple = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 7.5c-3.5-2-7 .8-7 5 0 3.5 2.5 7 5 7 1 0 1.4-.5 2-.5s1 .5 2 .5c2.5 0 5-3.5 5-7 0-4.2-3.5-7-7-5Z" />
    <path d="M12 7.5c0-2 1-3.5 3-4-.2 2-1.2 3.4-3 4Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconSnake = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19h9a4 4 0 0 0 0-8H9.5a2.5 2.5 0 0 1 0-5H14" />
    <circle cx="17.5" cy="6" r="2.4" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 3 5 13.5h5L11 21l8-10.5h-5L13 3Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconGauge = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 17.5a8.5 8.5 0 1 1 15 0" />
    <path d="m12 14 4-5.5" />
    <circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconChevron = ({
  className,
  dir,
}: IconProps & { dir: "up" | "down" | "left" | "right" }) => {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      style={{ transform: `rotate(${rot}deg)` }}
      aria-hidden="true"
    >
      <path d="m5 14.5 7-7 7 7" />
    </svg>
  );
};

export const IconStar = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1-4.5-4.3 6.1-.8L12 3Z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);
