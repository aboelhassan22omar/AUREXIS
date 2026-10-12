"use client";

import {
  motion,
  useReducedMotion,
} from "motion/react";
import type {
  ReactNode,
} from "react";

import {
  DUR,
  EASE_OUT,
} from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article" | "li" | "header";
  amount?: number;
  blur?: boolean;
};

/**
 * The single entrance primitive used across the site: rise + unblur.
 * Stronger moments (hero, headlines) use SplitText instead.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.08,
  blur = true,
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={
        reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              y,
              filter: blur ? "blur(10px)" : "blur(0px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount,
        margin: "0px 0px -8% 0px",
      }}
      transition={{
        duration: DUR.section,
        delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </Component>
  );
}
