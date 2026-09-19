"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Duration of one full loop in seconds */
  duration?: number;
};

/**
 * Lightweight Magic-style border beam wrapper — CSS only, no shadcn.
 */
export function BorderBeam({
  children,
  className,
  style,
  duration = 6,
}: Props) {
  return (
    <div
      className={`magic-border-beam ${className ?? ""}`}
      style={
        {
          ...style,
          ["--beam-duration" as string]: `${duration}s`,
        } as CSSProperties
      }
    >
      <div className="magic-border-beam__inner">{children}</div>
    </div>
  );
}
