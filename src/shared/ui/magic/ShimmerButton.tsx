"use client";

import { Button, type ButtonProps } from "antd";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type Props = Omit<ButtonProps, "children"> & {
  children: ReactNode;
};

/**
 * Lightweight Magic-style CTA — shimmer sweep via CSS, no shadcn.
 */
export function ShimmerButton({ children, style, className, ...rest }: Props) {
  const merged: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ display: "inline-block", width: rest.block ? "100%" : undefined }}
    >
      <Button
        type="primary"
        {...rest}
        className={`magic-shimmer-btn ${className ?? ""}`}
        style={merged}
      >
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      </Button>
    </motion.div>
  );
}
