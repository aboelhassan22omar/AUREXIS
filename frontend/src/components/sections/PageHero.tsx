"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";

import SplitText from "@/components/motion/SplitText";
import { EASE_OUT } from "@/lib/motion";

type PageHeroProps = {
  eyebrow: string;
  title: [string, string];
  lead?: ReactNode;
  children?: ReactNode;
  before?: ReactNode;
  /** The page's own symbol (an icon element), shown in a floating liquid-glass emblem. */
  icon?: ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
  before,
  icon,
}: PageHeroProps) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const emblemY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : 120]);
  const emblemOpacity = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section className="ax-page-hero">
      <div className="ax-page-hero__light" aria-hidden="true" />

      {icon && (
        <motion.div
          className="ax-emblem"
          style={{ y: emblemY, opacity: emblemOpacity }}
          aria-hidden="true"
        >
          <div className="ax-emblem__float">
          <motion.div
            className="ax-emblem__glass"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, rotate: -10, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotate: -6, y: 0 }}
            transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
          >
            <span className="ax-emblem__core">
              {icon}
            </span>
          </motion.div>
          </div>
          <span className="ax-emblem__shadow" />
        </motion.div>
      )}

      <div className="container">
        {before && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="mb-6"
          >
            {before}
          </motion.div>
        )}

        <motion.span
          className="ax-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.05 }}
        >
          {eyebrow}
        </motion.span>

        <SplitText
          as="h1"
          immediate
          delay={0.15}
          className="ax-h1 ax-page-hero__title"
          lines={[
            { text: title[0], className: "ax-lit" },
            { text: title[1], className: "ax-muted-words" },
          ]}
        />

        {lead && (
          <motion.p
            className="ax-lead ax-page-hero__lead"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.55 }}
          >
            {lead}
          </motion.p>
        )}

        {children && (
          <motion.div
            className="ax-page-hero__meta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.7 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
