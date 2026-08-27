"use client";

import {
  motion,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import styles from "@/components/robot-guide/GlobalRobotGuide.module.css";
import type {
  RobotBreakpoint,
  RobotBubbleSide,
} from "@/components/robot-guide/robot-guide.types";


type Candidate = {
  side: RobotBubbleSide;
  left: number;
  top: number;
};

type VisualViewportBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const ROBOT_HIT_SELECTOR =
  '[data-robot-hit-area="true"]';
const COLLISION_SELECTOR = [
  ".site-header",
  ".mobile-menu",
  ".auth-card",
  ".form-card",
  ".info-card",
  ".dashboard-card",
  ".primary-button",
  ".secondary-button",
  '[role="dialog"][aria-modal="true"]',
].join(",");

const COMPACT_COLLISION_SELECTOR = [
  ".hero-copy",
  ".floating-card",
  ".page-hero h1",
  ".page-hero p",
  ".page-hero .section-label",
  ".solution-item",
  ".home-service-card",
  ".home-project-card",
].join(",");

function sideClass(
  side: RobotBubbleSide
): string {
  if (side === "right") {
    return styles.bubbleRight;
  }
  if (side === "top") {
    return styles.bubbleTop;
  }
  if (side === "bottom") {
    return styles.bubbleBottom;
  }
  return styles.bubbleLeft;
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(value, max)
  );
}

function getViewportMargin(
  breakpoint: RobotBreakpoint
): number {
  if (breakpoint === "mobile") {
    return 16;
  }
  if (breakpoint === "tablet") {
    return 20;
  }
  return 24;
}

function getVisualViewportBox(): VisualViewportBox {
  const viewport = window.visualViewport;

  if (!viewport) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  return {
    left: viewport.offsetLeft,
    top: viewport.offsetTop,
    width: viewport.width,
    height: viewport.height,
  };
}

function getRobotRect({
  robotX,
  robotY,
  robotScale,
  breakpoint,
}: {
  robotX: number;
  robotY: number;
  robotScale: number;
  breakpoint: RobotBreakpoint;
}): DOMRect {
  const hitArea =
    document.querySelector<HTMLElement>(
      ROBOT_HIT_SELECTOR
    );

  if (hitArea) {
    const rect =
      hitArea.getBoundingClientRect();

    if (
      rect.width > 0 &&
      rect.height > 0
    ) {
      return rect;
    }
  }

  const baseWidth =
    breakpoint === "mobile"
      ? 132
      : breakpoint === "tablet"
        ? 150
        : 172;
  const baseHeight =
    breakpoint === "mobile"
      ? 176
      : breakpoint === "tablet"
        ? 200
        : 226;

  const width =
    baseWidth * robotScale;
  const height =
    baseHeight * robotScale;

  return new DOMRect(
    robotX - width / 2,
    robotY - height / 2,
    width,
    height
  );
}

function getCandidates({
  robotRect,
  bubbleWidth,
  bubbleHeight,
  breakpoint,
}: {
  robotRect: DOMRect;
  bubbleWidth: number;
  bubbleHeight: number;
  breakpoint: RobotBreakpoint;
}): Record<RobotBubbleSide, Candidate> {
  const gap =
    breakpoint === "mobile"
      ? 12
      : breakpoint === "tablet"
        ? 15
        : 18;
  const horizontalGap = gap;
  const verticalGap = gap;
  const robotCenterX =
    robotRect.left + robotRect.width / 2;
  const robotCenterY =
    robotRect.top + robotRect.height / 2;

  return {
    right: {
      side: "right",
      left:
        robotRect.right + horizontalGap,
      top:
        robotCenterY - bubbleHeight / 2,
    },
    left: {
      side: "left",
      left:
        robotRect.left -
        horizontalGap -
        bubbleWidth,
      top:
        robotCenterY - bubbleHeight / 2,
    },
    top: {
      side: "top",
      left:
        robotCenterX - bubbleWidth / 2,
      top:
        robotRect.top -
        verticalGap -
        bubbleHeight,
    },
    bottom: {
      side: "bottom",
      left:
        robotCenterX - bubbleWidth / 2,
      top:
        robotRect.bottom + verticalGap,
    },
  };
}

function getCandidateOrder(
  preferred: RobotBubbleSide
): RobotBubbleSide[] {
  const fallback: RobotBubbleSide[] = [
    "right",
    "left",
    "top",
    "bottom",
  ];

  return [
    preferred,
    ...fallback.filter(
      (side) => side !== preferred
    ),
  ];
}

function overlapArea(
  a: DOMRect,
  b: DOMRect
): number {
  const width = Math.max(
    0,
    Math.min(a.right, b.right) -
      Math.max(a.left, b.left)
  );
  const height = Math.max(
    0,
    Math.min(a.bottom, b.bottom) -
      Math.max(a.top, b.top)
  );

  return width * height;
}

function overflowPenalty(
  candidate: Candidate,
  width: number,
  height: number,
  bounds: {
    minLeft: number;
    maxRight: number;
    minTop: number;
    maxBottom: number;
  }
): number {
  const right = candidate.left + width;
  const bottom = candidate.top + height;

  return (
    Math.max(0, bounds.minLeft - candidate.left) +
    Math.max(0, right - bounds.maxRight) +
    Math.max(0, bounds.minTop - candidate.top) +
    Math.max(0, bottom - bounds.maxBottom)
  );
}

export default function RobotSpeechBubble({
  message,
  side,
  reducedMotion,
  robotX,
  robotY,
  robotScale,
  breakpoint,
}: {
  message: string;
  side: RobotBubbleSide;
  reducedMotion: boolean;
  robotX: MotionValue<number>;
  robotY: MotionValue<number>;
  robotScale: MotionValue<number>;
  breakpoint: RobotBreakpoint;
}) {
  const bubbleRef =
    useRef<HTMLDivElement>(null);
  const frameRef =
    useRef<number | null>(null);
  const resolvedSideRef =
    useRef<RobotBubbleSide>(side);
  const [resolvedSide, setResolvedSide] =
    useState<RobotBubbleSide>(side);
  const [positionReady, setPositionReady] =
    useState(false);
  const positionReadyRef =
    useRef(false);

  const updatePosition =
    useCallback(() => {
      frameRef.current = null;

      const element =
        bubbleRef.current;

      if (!element) {
        return;
      }

      const bubbleRect =
        element.getBoundingClientRect();
      const bubbleWidth =
        bubbleRect.width;
      const bubbleHeight =
        bubbleRect.height;

      if (
        bubbleWidth <= 0 ||
        bubbleHeight <= 0
      ) {
        return;
      }

      const viewport =
        getVisualViewportBox();
      const margin =
        getViewportMargin(breakpoint);
      const computedStyle =
        window.getComputedStyle(element);
      const safeTop =
        Number.parseFloat(
          computedStyle.getPropertyValue(
            "--robot-safe-top"
          )
        ) || 0;
      const safeRight =
        Number.parseFloat(
          computedStyle.getPropertyValue(
            "--robot-safe-right"
          )
        ) || 0;
      const safeBottom =
        Number.parseFloat(
          computedStyle.getPropertyValue(
            "--robot-safe-bottom"
          )
        ) || 0;
      const safeLeft =
        Number.parseFloat(
          computedStyle.getPropertyValue(
            "--robot-safe-left"
          )
        ) || 0;
      const robotRect = getRobotRect({
        robotX: robotX.get(),
        robotY: robotY.get(),
        robotScale: robotScale.get(),
        breakpoint,
      });

      let minTop =
        viewport.top + margin + safeTop;
      const navbar =
        document.querySelector<HTMLElement>(
          ".site-header"
        );

      if (navbar) {
        const navbarRect =
          navbar.getBoundingClientRect();
        if (
          navbarRect.bottom > viewport.top &&
          navbarRect.top <
            viewport.top + viewport.height
        ) {
          minTop = Math.max(
            minTop,
            navbarRect.bottom + 8
          );
        }
      }

      const bounds = {
        minLeft:
          viewport.left + margin + safeLeft,
        maxRight:
          viewport.left +
          viewport.width -
          margin -
          safeRight,
        minTop,
        maxBottom:
          viewport.top +
          viewport.height -
          margin -
          safeBottom,
      };

      const candidates =
        getCandidates({
          robotRect,
          bubbleWidth,
          bubbleHeight,
          breakpoint,
        });
      const order =
        getCandidateOrder(side);

      const collisionRects =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            breakpoint === "desktop"
              ? COLLISION_SELECTOR
              : `${COLLISION_SELECTOR},${COMPACT_COLLISION_SELECTOR}`
          )
        )
          .filter(
            (node) => node !== element
          )
          .map((node) =>
            node.getBoundingClientRect()
          )
          .filter(
            (rect) =>
              rect.width > 0 &&
              rect.height > 0
          );

      let selected = candidates[order[0]];
      let selectedScore =
        Number.POSITIVE_INFINITY;

      for (const candidateSide of order) {
        const candidate =
          candidates[candidateSide];
        const penalty = overflowPenalty(
          candidate,
          bubbleWidth,
          bubbleHeight,
          bounds
        );
        const candidateRect =
          new DOMRect(
            candidate.left,
            candidate.top,
            bubbleWidth,
            bubbleHeight
          );
        const collision =
          collisionRects.reduce(
            (total, rect) =>
              total +
              overlapArea(
                candidateRect,
                rect
              ),
            0
          );
        const score =
          penalty * 100000 + collision;

        if (score < selectedScore) {
          selected = candidate;
          selectedScore = score;
        }

        if (
          penalty === 0 &&
          collision === 0
        ) {
          selected = candidate;
          break;
        }
      }

      const maxLeft = Math.max(
        bounds.minLeft,
        bounds.maxRight - bubbleWidth
      );
      const maxTop = Math.max(
        bounds.minTop,
        bounds.maxBottom - bubbleHeight
      );
      const left = clamp(
        selected.left,
        bounds.minLeft,
        maxLeft
      );
      const top = clamp(
        selected.top,
        bounds.minTop,
        maxTop
      );
      const robotCenterX =
        robotRect.left + robotRect.width / 2;
      const robotCenterY =
        robotRect.top + robotRect.height / 2;

      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.setProperty(
        "--robot-bubble-pointer-x",
        `${clamp(
          robotCenterX - left,
          14,
          Math.max(14, bubbleWidth - 14)
        )}px`
      );
      element.style.setProperty(
        "--robot-bubble-pointer-y",
        `${clamp(
          robotCenterY - top,
          14,
          Math.max(14, bubbleHeight - 14)
        )}px`
      );

      if (
        resolvedSideRef.current !==
        selected.side
      ) {
        resolvedSideRef.current =
          selected.side;
        setResolvedSide(selected.side);
      }

      if (!positionReadyRef.current) {
        positionReadyRef.current = true;
        setPositionReady(true);
      }
    }, [
      breakpoint,
      robotScale,
      robotX,
      robotY,
      side,
    ]);

  useLayoutEffect(() => {
    const element =
      bubbleRef.current;

    if (!element) {
      return;
    }

    resolvedSideRef.current = side;
    setResolvedSide(side);
    positionReadyRef.current = false;
    setPositionReady(false);

    const schedule = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current =
        window.requestAnimationFrame(
          updatePosition
        );
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    resizeObserver?.observe(element);

    const unsubscribeX =
      robotX.on("change", schedule);
    const unsubscribeY =
      robotY.on("change", schedule);
    const unsubscribeScale =
      robotScale.on("change", schedule);

    const visualViewport =
      window.visualViewport;

    window.addEventListener(
      "resize",
      schedule,
      { passive: true }
    );
    window.addEventListener(
      "scroll",
      schedule,
      { passive: true }
    );
    window.addEventListener(
      "pageshow",
      schedule
    );
    window.addEventListener(
      "orientationchange",
      schedule,
      { passive: true }
    );
    visualViewport?.addEventListener(
      "resize",
      schedule,
      { passive: true }
    );
    visualViewport?.addEventListener(
      "scroll",
      schedule,
      { passive: true }
    );

    schedule();

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(
          frameRef.current
        );
        frameRef.current = null;
      }

      resizeObserver?.disconnect();
      unsubscribeX();
      unsubscribeY();
      unsubscribeScale();

      window.removeEventListener(
        "resize",
        schedule
      );
      window.removeEventListener(
        "scroll",
        schedule
      );
      window.removeEventListener(
        "pageshow",
        schedule
      );
      window.removeEventListener(
        "orientationchange",
        schedule
      );
      visualViewport?.removeEventListener(
        "resize",
        schedule
      );
      visualViewport?.removeEventListener(
        "scroll",
        schedule
      );
    };
  }, [
    message,
    robotScale,
    robotX,
    robotY,
    side,
    updatePosition,
  ]);

  return (
    <motion.div
      ref={bubbleRef}
      className={`${styles.bubblePosition} ${sideClass(resolvedSide)}`}
      style={{
        visibility:
          positionReady
            ? "visible"
            : "hidden",
      }}
      initial={
        reducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.96,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={
        reducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.97,
            }
      }
      transition={{
        duration:
          reducedMotion
            ? 0
            : 0.22,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ] as const,
      }}
      role="status"
      aria-live="polite"
    >
      <div className={styles.bubble}>
        <span
          className={styles.guideDot}
          aria-hidden="true"
        />
        {message}
      </div>
    </motion.div>
  );
}
