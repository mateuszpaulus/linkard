"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}

export function FadeInUp({ children, delay = 0, className, as = "div" }: Props) {
  const Tag = as === "section" ? motion.section : motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Tag>
  );
}
