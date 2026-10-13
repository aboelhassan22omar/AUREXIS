"use client";

import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Fragment,
  type ReactNode,
} from "react";

import { EASE_OUT } from "@/lib/motion";

type Line = {
  text: string;
  className?: string;
};

type SplitTextProps = {
  lines: Line[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  /** animate on mount instead of when scrolled into view */
  immediate?: boolean;
  suffix?: ReactNode;
};

/**
 * Masked word-by-word headline reveal. Each word rises out of its own
 * clipping line, which reads as "typeset by light" rather than a fade.
 */
export default function SplitText({
  lines,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.055,
  immediate = false,
  suffix,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  let wordIndex = 0;

  const container = {
    hidden: {},
    show: {},
  };

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : {
            whileInView: "show",
            viewport: { once: true, amount: 0.4 },
          })}
      aria-label={lines.map((line) => line.text).join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span
          className="ax-line-mask"
          key={lineIndex}
          aria-hidden="true"
        >
          {line.text.split(" ").map((word, index, words) => {
            const currentIndex = wordIndex++;

            return (
              <Fragment key={`${word}-${index}`}>
                <motion.span
                  className={`ax-word ${line.className ?? ""}`.trim()}
                  variants={{
                    hidden: reduced
                      ? { opacity: 0 }
                      : { y: "105%", opacity: 0, rotate: 2 },
                    show: {
                      y: "0%",
                      opacity: 1,
                      rotate: 0,
                      transition: {
                        duration: 1.1,
                        ease: EASE_OUT,
                        delay: delay + currentIndex * stagger,
                      },
                    },
                  }}
                >
                  {word}
                </motion.span>
                {index < words.length - 1 ? " " : null}
              </Fragment>
            );
          })}
          {lineIndex === lines.length - 1 ? suffix : null}
        </span>
      ))}
    </Tag>
  );
}
