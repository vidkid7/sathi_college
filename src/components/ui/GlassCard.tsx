"use client";

import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
} & MotionProps;

export function GlassCard({ children, className, hover = true, ...rest }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={cn("glass-card", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
