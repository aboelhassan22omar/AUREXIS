"use client";

import { useEffect } from "react";

/**
 * One delegated listener drives every cursor-following light on the site:
 * any `.ax-spot` surface or primary button receives --mx / --my.
 */
export default function Interactions() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${x - rect.left}px`);
      target.style.setProperty("--my", `${y - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      const element = (event.target as Element | null)?.closest?.(".ax-spot, .ax-btn--primary, .ax-index__row");
      target = element instanceof HTMLElement ? element : null;
      x = event.clientX;
      y = event.clientY;

      if (target && !frame) {
        frame = window.requestAnimationFrame(apply);
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
}
