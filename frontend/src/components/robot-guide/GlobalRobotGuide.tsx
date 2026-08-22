"use client";

import dynamic from "next/dynamic";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import styles from "@/components/robot-guide/GlobalRobotGuide.module.css";
import type {
  RobotCanvasProps,
} from "@/components/robot-guide/RobotCanvas";
import RobotInteractionArea from "@/components/robot-guide/RobotInteractionArea";
import RobotSpeechBubble from "@/components/robot-guide/RobotSpeechBubble";
import {
  GLOBAL_FOOTER_STOP,
  HOME_HERO_STOP,
  getRobotPlacement,
} from "@/components/robot-guide/robot-stops";
import type {
  CursorDirection,
  RobotBreakpoint,
  RobotBubbleSide,
  RobotPointTarget,
  RobotStop,
} from "@/components/robot-guide/robot-guide.types";
import useActiveRobotStop from "@/components/robot-guide/useActiveRobotStop";
import {
  getStoredUser,
} from "@/lib/auth";

const RobotCanvas = dynamic<RobotCanvasProps>(
  () =>
    import(
      "@/components/robot-guide/RobotCanvas"
    ),
  {
    ssr: false,
  }
);

const LOGIN_GREETING_PENDING_KEY =
  "aurexis-robot-login-greeting-pending";
const LOGIN_GREETING_SHOWN_KEY =
  "aurexis-robot-login-greeting-shown";
const STOP_MESSAGE_COOLDOWN = 12000;
const ARRIVAL_MESSAGE_DELAY = 760;
const MESSAGE_VISIBLE_DURATION = 2000;
const POINT_LEAD_IN_DURATION = 180;

type ViewportState = {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  breakpoint: RobotBreakpoint;
};

function getBreakpoint(
  width: number
): RobotBreakpoint {
  if (width < 700) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

type RobotTarget = {
  x: number;
  y: number;
  scale: number;
};

function getCssPixelVariable(
  name: string
): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = Number.parseFloat(
    window
      .getComputedStyle(
        document.documentElement
      )
      .getPropertyValue(name)
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

const DASHBOARD_COLLISION_SELECTOR = [
  ".dashboard-content h1",
  ".dashboard-content h2",
  ".dashboard-content p",
  ".dashboard-content button",
  ".dashboard-content a",
  ".dashboard-content input",
  ".dashboard-content select",
  ".dashboard-content textarea",
  ".dashboard-content table",
  ".dashboard-content [data-card]",
  ".dashboard-content [data-chart]",
  ".dashboard-content .glass-card",
  "[role=\"dialog\"]",
].join(",");

const COMPACT_COLLISION_SELECTOR = [
  ".site-header",
  ".mobile-menu",
  ".hero-copy",
  ".floating-card",
  ".page-hero h1",
  ".page-hero p",
  ".page-hero .primary-button",
  ".page-hero .secondary-button",
  ".home-service-card",
  ".home-project-card",
  ".solution-item",
  ".about-card",
  ".cta-card",
  ".services-page-card",
  ".projects-page-card",
  ".detail-info-card",
  ".detail-usecase",
  ".detail-cta",
  ".form-card",
  ".info-card",
  ".auth-card",
  ".dashboard-card",
  ".footer-brand",
  ".footer-group",
  ".footer-bottom",
  "[role=\"dialog\"]",
].join(",");

const ADMIN_COLLISION_SELECTOR = [
  ".admin-sidebar",
  ".admin-main h1",
  ".admin-main h2",
  ".admin-main p",
  ".admin-main button",
  ".admin-main a",
  ".admin-main input",
  ".admin-main select",
  ".admin-main textarea",
  ".admin-main table",
  ".admin-main [data-card]",
  ".admin-main [data-chart]",
  ".admin-main .glass-card",
  "[role=\"dialog\"]",
].join(",");

function isDashboardPath(
  pathname: string
): boolean {
  return pathname === "/dashboard";
}

function isAdminPath(
  pathname: string
): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/"
    )
  );
}

function getVisibleCollisionRects(
  pathname: string,
  viewport: ViewportState
): DOMRect[] {
  const selector =
    isAdminPath(pathname)
      ? ADMIN_COLLISION_SELECTOR
      : DASHBOARD_COLLISION_SELECTOR;

  return Array.from(
    document.querySelectorAll(
      selector
    )
  )
    .map((element) =>
      element.getBoundingClientRect()
    )
    .filter(
      (rect) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > viewport.offsetLeft &&
        rect.left < viewport.offsetLeft + viewport.width &&
        rect.bottom > viewport.offsetTop &&
        rect.top < viewport.offsetTop + viewport.height
    );
}

function getRobotVisualSize(
  scale: number,
  breakpoint: RobotBreakpoint
) {
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

  return {
    width:
      baseWidth * scale,
    height:
      baseHeight * scale,
  };
}

function getOverlapArea(
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

function getResponsiveRobotScale(
  baseScale: number,
  viewport: ViewportState
): number {
  if (viewport.breakpoint === "desktop") {
    return baseScale;
  }

  const heightReference =
    viewport.breakpoint === "mobile"
      ? 760
      : 720;
  const minimumHeightFactor =
    viewport.breakpoint === "mobile"
      ? 0.78
      : 0.76;
  const heightFactor =
    THREE.MathUtils.clamp(
      viewport.height / heightReference,
      minimumHeightFactor,
      1
    );
  const widthFactor =
    viewport.breakpoint === "mobile"
      ? THREE.MathUtils.clamp(
          viewport.width / 390,
          0.86,
          1
        )
      : 1;

  return (
    baseScale *
    Math.min(heightFactor, widthFactor)
  );
}

function getCompactCollisionRects(
  viewport: ViewportState
): DOMRect[] {
  return Array.from(
    document.querySelectorAll(
      COMPACT_COLLISION_SELECTOR
    )
  )
    .map((element) =>
      element.getBoundingClientRect()
    )
    .filter(
      (rect) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > viewport.offsetLeft &&
        rect.left < viewport.offsetLeft + viewport.width &&
        rect.bottom > viewport.offsetTop &&
        rect.top < viewport.offsetTop + viewport.height
    );
}

function resolveCompactTarget(
  desired: RobotTarget,
  viewport: ViewportState
): RobotTarget {
  if (viewport.breakpoint === "desktop") {
    return desired;
  }

  const edgeMargin =
    viewport.breakpoint === "mobile"
      ? 12
      : 18;
  const safeLeft =
    getCssPixelVariable("--safe-left");
  const safeRight =
    getCssPixelVariable("--safe-right");
  const safeBottom =
    getCssPixelVariable("--safe-bottom");
  const headerRect =
    document
      .querySelector<HTMLElement>(
        ".site-header"
      )
      ?.getBoundingClientRect();
  const topClearance = Math.max(
    viewport.breakpoint === "mobile"
      ? 68
      : 82,
    headerRect
      ? headerRect.bottom -
          viewport.offsetTop +
          edgeMargin
      : 0
  );
  const bottomClearance =
    edgeMargin + safeBottom +
    (viewport.breakpoint === "mobile"
      ? 4
      : 8);

  const collisionRects =
    getCompactCollisionRects(viewport);
  const preferredRight =
    desired.x >=
    viewport.offsetLeft +
      viewport.width / 2;
  const viewportDiagonal = Math.max(
    1,
    Math.hypot(
      viewport.width,
      viewport.height
    )
  );
  const desiredRatio =
    THREE.MathUtils.clamp(
      (desired.y - viewport.offsetTop) /
        Math.max(1, viewport.height),
      0.2,
      0.88
    );
  const verticalRatios = Array.from(
    new Set(
      [
        desiredRatio,
        0.84,
        0.72,
        0.56,
        0.36,
        0.24,
      ].map((value) =>
        Number(value.toFixed(3))
      )
    )
  );
  const scaleFactors =
    viewport.breakpoint === "mobile"
      ? [1, 0.88, 0.76]
      : [1, 0.9, 0.82];

  let bestTarget = desired;
  let bestScore =
    Number.POSITIVE_INFINITY;

  for (const scaleFactor of scaleFactors) {
    const candidateScale = Math.max(
      viewport.breakpoint === "mobile"
        ? 0.34
        : 0.42,
      desired.scale * scaleFactor
    );
    const visual = getRobotVisualSize(
      candidateScale,
      viewport.breakpoint
    );
    const halfWidth = visual.width / 2;
    const halfHeight = visual.height / 2;
    const minX =
      viewport.offsetLeft +
      safeLeft +
      edgeMargin +
      halfWidth;
    const maxX =
      viewport.offsetLeft +
      viewport.width -
      safeRight -
      edgeMargin -
      halfWidth;
    const minY =
      viewport.offsetTop +
      topClearance +
      halfHeight;
    const maxY =
      viewport.offsetTop +
      viewport.height -
      bottomClearance -
      halfHeight;

    const clampY = (ratio: number) =>
      THREE.MathUtils.clamp(
        viewport.offsetTop +
          viewport.height * ratio,
        minY,
        Math.max(minY, maxY)
      );
    const rightX = Math.max(minX, maxX);
    const leftX = minX;
    const preferredX =
      preferredRight ? rightX : leftX;
    const alternateX =
      preferredRight ? leftX : rightX;

    const candidates = [
      ...verticalRatios.map((ratio) => ({
        x: preferredX,
        y: clampY(ratio),
        switchedSide: false,
      })),
      ...verticalRatios.map((ratio) => ({
        x: alternateX,
        y: clampY(ratio),
        switchedSide: true,
      })),
    ];

    for (const candidate of candidates) {
      const robotRect = new DOMRect(
        candidate.x - halfWidth - 8,
        candidate.y - halfHeight - 8,
        visual.width + 16,
        visual.height + 16
      );
      const robotArea = Math.max(
        1,
        robotRect.width * robotRect.height
      );
      const overlapArea =
        collisionRects.reduce(
          (total, rect) =>
            total +
            getOverlapArea(robotRect, rect),
          0
        );
      const overlapRatio =
        overlapArea / robotArea;
      const travelDistance =
        Math.hypot(
          candidate.x - desired.x,
          candidate.y - desired.y
        ) / viewportDiagonal;
      const sidePenalty =
        candidate.switchedSide ? 220 : 0;
      const scalePenalty =
        (1 - scaleFactor) * 90;
      const score =
        overlapRatio * 1000 +
        travelDistance * 90 +
        sidePenalty +
        scalePenalty;

      if (score < bestScore) {
        bestScore = score;
        bestTarget = {
          x: candidate.x,
          y: candidate.y,
          scale: candidateScale,
        };
      }

      if (
        !candidate.switchedSide &&
        overlapRatio <= 0.025
      ) {
        return {
          x: candidate.x,
          y: candidate.y,
          scale: candidateScale,
        };
      }
    }
  }

  return bestTarget;
}

function resolveDashboardTarget(
  pathname: string,
  desired: RobotTarget,
  viewport: ViewportState
): RobotTarget {
  if (
    !isDashboardPath(pathname) &&
    !isAdminPath(pathname)
  ) {
    return desired;
  }

  const visual =
    getRobotVisualSize(
      desired.scale,
      viewport.breakpoint
    );
  const halfWidth =
    visual.width / 2;
  const halfHeight =
    visual.height / 2;

  const edgeMargin =
    viewport.breakpoint === "mobile"
      ? 18
      : viewport.breakpoint === "tablet"
        ? 20
        : 24;
  const safeLeft =
    getCssPixelVariable("--safe-left");
  const safeRight =
    getCssPixelVariable("--safe-right");
  const safeBottom =
    getCssPixelVariable("--safe-bottom");
  const navbarClearance =
    isDashboardPath(pathname)
      ? viewport.breakpoint === "mobile"
        ? 104
        : 118
      : edgeMargin;

  const minX =
    viewport.offsetLeft +
    safeLeft +
    edgeMargin +
    halfWidth;
  const maxX =
    viewport.offsetLeft +
    viewport.width -
    safeRight -
    edgeMargin -
    halfWidth;
  const minY =
    viewport.offsetTop +
    navbarClearance + halfHeight;
  const maxY =
    viewport.offsetTop +
    viewport.height -
    edgeMargin -
    safeBottom -
    halfHeight -
    (
      viewport.breakpoint === "mobile"
        ? 10
        : 0
    );

  const clampCandidate = (
    x: number,
    y: number
  ) => ({
    x: THREE.MathUtils.clamp(
      x,
      minX,
      Math.max(minX, maxX)
    ),
    y: THREE.MathUtils.clamp(
      y,
      minY,
      Math.max(minY, maxY)
    ),
  });

  const candidates: Array<{
    x: number;
    y: number;
  }> = [];

  candidates.push(
    clampCandidate(
      desired.x,
      desired.y
    )
  );

  if (isDashboardPath(pathname)) {
    const content =
      document.querySelector(
        ".dashboard-content"
      );

    if (content) {
      const rect =
        content.getBoundingClientRect();
      const rightGutter =
        viewport.offsetLeft +
        viewport.width -
        rect.right;
      const leftGutter =
        rect.left -
        viewport.offsetLeft;

      if (
        rightGutter >=
        visual.width +
          edgeMargin * 2
      ) {
        candidates.unshift(
          clampCandidate(
            rect.right +
              rightGutter / 2,
            desired.y
          )
        );
      }

      if (
        leftGutter >=
        visual.width +
          edgeMargin * 2
      ) {
        candidates.push(
          clampCandidate(
            viewport.offsetLeft +
              leftGutter / 2,
            desired.y
          )
        );
      }
    }
  }

  const rightX =
    viewport.offsetLeft +
    viewport.width -
    edgeMargin -
    halfWidth;
  const leftX =
    isAdminPath(pathname) &&
    viewport.breakpoint === "desktop"
      ? Math.max(
          viewport.offsetLeft +
            255 +
            edgeMargin +
            halfWidth,
          minX
        )
      : minX;

  candidates.push(
    clampCandidate(
      rightX,
      viewport.offsetTop +
        viewport.height * 0.78
    ),
    clampCandidate(
      rightX,
      viewport.offsetTop +
        viewport.height * 0.32
    ),
    clampCandidate(
      rightX,
      viewport.offsetTop +
        viewport.height * 0.56
    ),
    clampCandidate(
      leftX,
      viewport.offsetTop +
        viewport.height * 0.8
    ),
    clampCandidate(
      leftX,
      viewport.offsetTop +
        viewport.height * 0.34
    )
  );

  const collisionRects =
    getVisibleCollisionRects(
      pathname,
      viewport
    );

  let best = candidates[0];
  let bestScore =
    Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const robotRect =
      new DOMRect(
        candidate.x -
          halfWidth - 10,
        candidate.y -
          halfHeight - 10,
        visual.width + 20,
        visual.height + 20
      );

    const overlap =
      collisionRects.reduce(
        (total, rect) =>
          total +
          getOverlapArea(
            robotRect,
            rect
          ),
        0
      );

    const distancePenalty =
      Math.hypot(
        candidate.x -
          desired.x,
        candidate.y -
          desired.y
      ) * 0.08;

    const score =
      overlap + distancePenalty;

    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }

    if (overlap === 0) {
      break;
    }
  }

  return {
    x: best.x,
    y: best.y,
    scale: desired.scale,
  };
}

function getAutomaticBubbleSide(
  stop: RobotStop,
  centerX: number,
  viewportWidth: number
): RobotBubbleSide {
  if (stop.bubbleSide) {
    return stop.bubbleSide;
  }

  if (
    centerX >
    viewportWidth * 0.58
  ) {
    return "left";
  }

  if (
    centerX <
    viewportWidth * 0.42
  ) {
    return "right";
  }

  return "top";
}

function getInteractionHintSide(
  centerX: number,
  centerY: number,
  viewport: ViewportState
): RobotBubbleSide {
  const width = Math.max(viewport.width, 1);
  const height = Math.max(viewport.height, 1);
  const relativeX =
    (centerX - viewport.offsetLeft) / width;
  const relativeY =
    (centerY - viewport.offsetTop) / height;

  if (relativeX >= 0.7) {
    return "left";
  }

  if (relativeX <= 0.3) {
    return "right";
  }

  if (relativeY >= 0.72) {
    return "top";
  }

  return "bottom";
}

function getPointTargetForStop(
  stop: RobotStop,
  robotPosition: { x: number; y: number },
  viewport: ViewportState
): RobotPointTarget | null {
  const selector =
    stop.selector || stop.anchorSelector;

  if (!selector) {
    return null;
  }

  const element =
    document.querySelector<HTMLElement>(selector);

  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const viewportLeft = viewport.offsetLeft;
  const viewportTop = viewport.offsetTop;
  const viewportRight =
    viewport.offsetLeft + viewport.width;
  const viewportBottom =
    viewport.offsetTop + viewport.height;
  const visibleLeft = Math.max(
    rect.left,
    viewportLeft
  );
  const visibleRight = Math.min(
    rect.right,
    viewportRight
  );
  const visibleTop = Math.max(
    rect.top,
    viewportTop
  );
  const visibleBottom = Math.min(
    rect.bottom,
    viewportBottom
  );
  const targetX =
    visibleRight > visibleLeft
      ? (visibleLeft + visibleRight) / 2
      : rect.left + rect.width / 2;
  const targetY =
    visibleBottom > visibleTop
      ? (visibleTop + visibleBottom) / 2
      : rect.top + rect.height / 2;
  const verticalRange = Math.max(
    150,
    viewport.height * 0.34
  );

  return {
    side:
      targetX >= robotPosition.x
        ? "right"
        : "left",
    vertical: THREE.MathUtils.clamp(
      (robotPosition.y - targetY) / verticalRange,
      -1,
      1
    ),
  };
}

function getSafeFirstName(): string | null {
  const user = getStoredUser();

  if (!user) {
    return null;
  }

  const firstName =
    user.full_name
      .trim()
      .split(/\s+/)[0]
      ?.trim();

  return firstName || null;
}

function PersistentRobotGuide({
  pathname,
}: {
  pathname: string;
}) {
  const router = useRouter();

  const activeStop =
    useActiveRobotStop(
      pathname
    );

  const prefersReducedMotion =
    useReducedMotion();
  const reducedMotion =
    Boolean(
      prefersReducedMotion
    );

  const [viewport, setViewport] =
    useState<ViewportState>({
      width: 0,
      height: 0,
      offsetLeft: 0,
      offsetTop: 0,
      breakpoint: "desktop",
    });
  const [ready, setReady] =
    useState(false);
  const [documentPaused, setDocumentPaused] =
    useState(false);
  const [uiSuppressed, setUiSuppressed] =
    useState(false);
  const paused =
    documentPaused || uiSuppressed;
  const [waveSignal, setWaveSignal] =
    useState(0);
  const [bubbleMessage, setBubbleMessage] =
    useState<string | null>(null);
  const [bubbleSide, setBubbleSide] =
    useState<RobotBubbleSide>("left");
  const [pointTarget, setPointTarget] =
    useState<RobotPointTarget | null>(null);
  const [robotHovered, setRobotHovered] =
    useState(false);
  const [robotPressed, setRobotPressed] =
    useState(false);
  const [openingChat, setOpeningChat] =
    useState(false);

  const cursorRef =
    useRef<CursorDirection>({
      x: 0,
      y: 0,
      active: false,
    });
  const pointerRef = useRef({
    x: 0,
    y: 0,
    active: false,
  });
  const stopRef =
    useRef(activeStop);
  const positionRef = useRef({
    x: 0,
    y: 0,
  });
  const lastShownRef =
    useRef(
      new Map<string, number>()
    );
  const messageTimerRef =
    useRef<number | null>(null);
  const hideTimerRef =
    useRef<number | null>(null);
  const arrivalTimerRef =
    useRef<number | null>(null);
  const pointLeadTimerRef =
    useRef<number | null>(null);
  const initialReadyTimerRef =
    useRef<number | null>(null);
  const chatNavigationTimerRef =
    useRef<number | null>(null);
  const welcomePlayedRef = useRef(false);
  const messageGenerationRef = useRef(0);
  const initialPlacementDoneRef =
    useRef(false);

  const targetX =
    useMotionValue(0);
  const targetY =
    useMotionValue(0);
  const targetScale =
    useMotionValue(1);

  const compactMotion =
    viewport.breakpoint === "mobile";
  const tabletMotion =
    viewport.breakpoint === "tablet";

  const x = useSpring(
    targetX,
    compactMotion
      ? {
          stiffness: 150,
          damping: 26,
          mass: 0.7,
        }
      : tabletMotion
        ? {
            stiffness: 122,
            damping: 24,
            mass: 0.78,
          }
        : {
            stiffness: 95,
            damping: 22,
            mass: 0.86,
          }
  );
  const y = useSpring(
    targetY,
    compactMotion
      ? {
          stiffness: 150,
          damping: 26,
          mass: 0.7,
        }
      : tabletMotion
        ? {
            stiffness: 122,
            damping: 24,
            mass: 0.78,
          }
        : {
            stiffness: 95,
            damping: 22,
            mass: 0.86,
          }
  );
  const scale = useSpring(
    targetScale,
    compactMotion
      ? {
          stiffness: 165,
          damping: 28,
          mass: 0.68,
        }
      : {
          stiffness: 105,
          damping: 24,
          mass: 0.78,
        }
  );

  const clearMessageTimers =
    useCallback(() => {
      messageGenerationRef.current += 1;

      if (messageTimerRef.current !== null) {
        window.clearTimeout(
          messageTimerRef.current
        );
        messageTimerRef.current = null;
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(
          hideTimerRef.current
        );
        hideTimerRef.current = null;
      }

      if (arrivalTimerRef.current !== null) {
        window.clearTimeout(
          arrivalTimerRef.current
        );
        arrivalTimerRef.current = null;
      }

      if (pointLeadTimerRef.current !== null) {
        window.clearTimeout(
          pointLeadTimerRef.current
        );
        pointLeadTimerRef.current = null;
      }
    }, []);

  const hideBubble =
    useCallback(() => {
      setBubbleMessage(null);
      setPointTarget(null);

      if (hideTimerRef.current !== null) {
        window.clearTimeout(
          hideTimerRef.current
        );
        hideTimerRef.current = null;
      }

      if (pointLeadTimerRef.current !== null) {
        window.clearTimeout(
          pointLeadTimerRef.current
        );
        pointLeadTimerRef.current = null;
      }
    }, []);

  const showMessage =
    useCallback(
      (
        message: string,
        side: RobotBubbleSide,
        duration = MESSAGE_VISIBLE_DURATION,
        clearPointingOnHide = false
      ) => {
        setBubbleSide(side);
        setBubbleMessage(message);

        if (hideTimerRef.current !== null) {
          window.clearTimeout(
            hideTimerRef.current
          );
        }

        hideTimerRef.current =
          window.setTimeout(() => {
            setBubbleMessage(null);

            if (clearPointingOnHide) {
              setPointTarget(null);
            }

            hideTimerRef.current = null;
          }, duration);
      },
      []
    );

  const showStopMessage =
    useCallback(
      (
        stop: RobotStop,
        force = false
      ) => {
        const generation =
          ++messageGenerationRef.current;
        const now = Date.now();
        const lastShown =
          lastShownRef.current.get(
            stop.id
          ) ?? 0;

        if (
          !force &&
          now - lastShown <
            STOP_MESSAGE_COOLDOWN
        ) {
          return;
        }

        const side =
          getAutomaticBubbleSide(
            stop,
            positionRef.current.x,
            viewport.width ||
              window.innerWidth
          );
        const target =
          getPointTargetForStop(
            stop,
            positionRef.current,
            viewport
          );

        lastShownRef.current.set(
          stop.id,
          now
        );

        if (!reducedMotion && stop.pose === "wave") {
          setWaveSignal((value) => value + 1);
        }

        if (hideTimerRef.current !== null) {
          window.clearTimeout(
            hideTimerRef.current
          );
          hideTimerRef.current = null;
        }

        setBubbleMessage(null);

        if (!target) {
          setPointTarget(null);
          showMessage(
            stop.message,
            side,
            MESSAGE_VISIBLE_DURATION
          );
          return;
        }

        setPointTarget(target);

        if (pointLeadTimerRef.current !== null) {
          window.clearTimeout(
            pointLeadTimerRef.current
          );
        }

        pointLeadTimerRef.current =
          window.setTimeout(() => {
            if (generation !== messageGenerationRef.current) {
              return;
            }

            showMessage(
              stop.message,
              side,
              MESSAGE_VISIBLE_DURATION,
              true
            );
            pointLeadTimerRef.current = null;
          }, reducedMotion ? 0 : POINT_LEAD_IN_DURATION);
      },
      [
        reducedMotion,
        showMessage,
        viewport,
      ]
    );

  useEffect(() => {
    let frame = 0;

    const updateViewport = () => {
      frame = 0;

      const visualViewport =
        window.visualViewport;
      const width =
        visualViewport?.width ??
        document.documentElement.clientWidth ??
        window.innerWidth;
      const height =
        visualViewport?.height ??
        window.innerHeight;
      const offsetLeft =
        visualViewport?.offsetLeft ?? 0;
      const offsetTop =
        visualViewport?.offsetTop ?? 0;

      setViewport({
        width,
        height,
        offsetLeft,
        offsetTop,
        breakpoint:
          getBreakpoint(width),
      });
    };

    const scheduleViewportUpdate =
      () => {
        if (frame !== 0) {
          return;
        }

        frame =
          window.requestAnimationFrame(
            updateViewport
          );
      };

    updateViewport();

    window.addEventListener(
      "resize",
      scheduleViewportUpdate,
      { passive: true }
    );
    window.addEventListener(
      "orientationchange",
      scheduleViewportUpdate,
      { passive: true }
    );
    window.visualViewport?.addEventListener(
      "resize",
      scheduleViewportUpdate,
      { passive: true }
    );
    window.visualViewport?.addEventListener(
      "scroll",
      scheduleViewportUpdate,
      { passive: true }
    );

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(
          frame
        );
      }

      window.removeEventListener(
        "resize",
        scheduleViewportUpdate
      );
      window.removeEventListener(
        "orientationchange",
        scheduleViewportUpdate
      );
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleViewportUpdate
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scheduleViewportUpdate
      );
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      setDocumentPaused(
        document.hidden
      );
    };

    handleVisibility();

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateSuppressedState = () => {
      frame = 0;

      const activeElement =
        document.activeElement as HTMLElement | null;
      const mobileFormFocus =
        viewport.breakpoint === "mobile" &&
        Boolean(
          activeElement?.matches(
            "input, textarea, select, [contenteditable=\"true\"]"
          )
        );
      const blockingUi = Boolean(
        document.querySelector(
          ".mobile-menu, [role=\"dialog\"][aria-modal=\"true\"], .admin-modal-backdrop"
        )
      );

      setUiSuppressed(
        mobileFormFocus || blockingUi
      );
    };

    const schedule = () => {
      if (frame !== 0) {
        return;
      }

      frame =
        window.requestAnimationFrame(
          updateSuppressedState
        );
    };

    const observer =
      new MutationObserver(schedule);

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    document.addEventListener(
      "focusin",
      schedule
    );
    document.addEventListener(
      "focusout",
      schedule
    );

    schedule();

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      observer.disconnect();
      document.removeEventListener(
        "focusin",
        schedule
      );
      document.removeEventListener(
        "focusout",
        schedule
      );
    };
  }, [viewport.breakpoint]);

  useEffect(() => {
    const updateCursor = () => {
      if (
        !pointerRef.current.active ||
        viewport.width === 0 ||
        viewport.height === 0
      ) {
        cursorRef.current.x = 0;
        cursorRef.current.y = 0;
        cursorRef.current.active = false;
        return;
      }

      const robotX = x.get();
      const robotY = y.get();

      const horizontalRange =
        Math.max(
          170,
          viewport.width * 0.16
        );
      const verticalRange =
        Math.max(
          150,
          viewport.height * 0.2
        );

      cursorRef.current.x =
        THREE.MathUtils.clamp(
          (
            pointerRef.current.x -
            robotX
          ) /
            horizontalRange,
          -1,
          1
        );

      cursorRef.current.y =
        THREE.MathUtils.clamp(
          (
            robotY -
            pointerRef.current.y
          ) /
            verticalRange,
          -1,
          1
        );
    };

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      if (
        event.pointerType === "touch"
      ) {
        return;
      }

      pointerRef.current.x =
        event.clientX;
      pointerRef.current.y =
        event.clientY;
      pointerRef.current.active =
        true;
      cursorRef.current.active = true;

      updateCursor();
    };

    const resetPointer = () => {
      pointerRef.current.active =
        false;
      cursorRef.current.x = 0;
      cursorRef.current.y = 0;
      cursorRef.current.active = false;
    };

    const coarsePointer =
      window.matchMedia(
        "(hover: none), (pointer: coarse)"
      ).matches;

    if (coarsePointer) {
      resetPointer();
      return;
    }

    const unsubscribeX =
      x.on(
        "change",
        updateCursor
      );
    const unsubscribeY =
      y.on(
        "change",
        updateCursor
      );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );
    window.addEventListener(
      "blur",
      resetPointer
    );
    document.documentElement.addEventListener(
      "mouseleave",
      resetPointer
    );

    return () => {
      unsubscribeX();
      unsubscribeY();

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
      window.removeEventListener(
        "blur",
        resetPointer
      );
      document.documentElement.removeEventListener(
        "mouseleave",
        resetPointer
      );
    };
  }, [viewport.height, viewport.width, x, y]);

  const applyActiveStopPlacement =
    useCallback(() => {
      if (
        viewport.width === 0 ||
        viewport.height === 0
      ) {
        return;
      }

      stopRef.current = activeStop;

      const placement =
        getRobotPlacement(
          activeStop,
          viewport.breakpoint
        );
      const responsiveScale =
        getResponsiveRobotScale(
          placement.scale,
          viewport
        );

      let nextX =
        viewport.offsetLeft +
        placement.x *
        viewport.width;
      let nextY =
        viewport.offsetTop +
        placement.y *
        viewport.height;

      if (
        activeStop.anchorSelector
      ) {
        const anchor =
          document.querySelector(
            activeStop.anchorSelector
          );

        if (anchor) {
          const rect =
            anchor.getBoundingClientRect();

          nextX =
            rect.left +
            rect.width / 2;
          nextY =
            rect.top +
            rect.height / 2;
        }
      }

      const isDashboard =
        isDashboardPath(pathname) ||
        isAdminPath(pathname);
      const horizontalMargin =
        isDashboard
          ? viewport.breakpoint ===
            "mobile"
            ? 42
            : 56
          : viewport.breakpoint ===
              "mobile"
            ? 62
            : 88;
      const topMargin =
        isDashboard
          ? viewport.breakpoint ===
            "mobile"
            ? 92
            : 104
          : viewport.breakpoint ===
              "mobile"
            ? 96
            : 118;
      const bottomMargin =
        isDashboard
          ? viewport.breakpoint ===
            "mobile"
            ? 60
            : 70
          : viewport.breakpoint ===
              "mobile"
            ? 82
            : 98;

      nextX =
        THREE.MathUtils.clamp(
          nextX,
          viewport.offsetLeft +
            horizontalMargin,
          viewport.offsetLeft +
            viewport.width -
            horizontalMargin
        );
      nextY =
        THREE.MathUtils.clamp(
          nextY,
          viewport.offsetTop +
            topMargin,
          viewport.offsetTop +
            viewport.height -
            bottomMargin
        );

      const desiredTarget: RobotTarget = {
        x: nextX,
        y: nextY,
        scale: responsiveScale,
      };

      let resolvedTarget =
        desiredTarget;

      if (isDashboard) {
        resolvedTarget =
          resolveDashboardTarget(
            pathname,
            desiredTarget,
            viewport
          );
      } else if (
        activeStop.id !==
          HOME_HERO_STOP.id &&
        viewport.breakpoint !==
          "desktop"
      ) {
        resolvedTarget =
          resolveCompactTarget(
            desiredTarget,
            viewport
          );
      }

      positionRef.current = {
        x: resolvedTarget.x,
        y: resolvedTarget.y,
      };

      /*
       * INITIAL PLACEMENT MUST NOT ANIMATE FROM (0, 0).
       *
       * The global guide is mounted with zero-valued motion values. On a
       * cold mobile load the old code made the springs travel from the top
       * of the viewport toward the Hero orbit, while the guide became
       * visible before that travel had fully settled. That made the robot
       * appear above the circles for the first moment of the page.
       *
       * Snap the very first resolved placement directly to its real target
       * (the Hero orbit center on Home). Every placement after this first
       * one still uses the existing springs, so scroll/page transitions keep
       * their smooth movement.
       */
      const isInitialPlacement =
        !initialPlacementDoneRef.current;

      if (isInitialPlacement) {
        targetX.jump(
          resolvedTarget.x
        );
        targetY.jump(
          resolvedTarget.y
        );
        targetScale.jump(
          resolvedTarget.scale
        );

        x.jump(resolvedTarget.x);
        y.jump(resolvedTarget.y);
        scale.jump(
          resolvedTarget.scale
        );

        initialPlacementDoneRef.current =
          true;
      } else {
        targetX.set(
          resolvedTarget.x
        );
        targetY.set(
          resolvedTarget.y
        );
        targetScale.set(
          resolvedTarget.scale
        );
      }

      if (!ready) {
        if (
          initialReadyTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            initialReadyTimerRef.current
          );
        }

        initialReadyTimerRef.current =
          window.setTimeout(
            () => {
              setReady(true);
              initialReadyTimerRef.current =
                null;
            },
            isInitialPlacement ||
            reducedMotion
              ? 0
              : 360
          );
      }
    }, [
      activeStop,
      pathname,
      ready,
      reducedMotion,
      scale,
      targetScale,
      targetX,
      targetY,
      viewport,
      x,
      y,
    ]);

  useEffect(() => {
    applyActiveStopPlacement();
  }, [applyActiveStopPlacement]);

  /*
   * HOME HERO ANCHOR SYNCHRONIZATION
   *
   * HOME_HERO_STOP can become the active stop while the user is still
   * scrolling toward scrollY = 0. If its DOM anchor is measured only at
   * the moment the stop id changes, that viewport-relative Y coordinate
   * becomes stale as the page continues moving. The result is the robot
   * settling hundreds of pixels above the orbit center.
   *
   * While HOME_HERO_STOP is active, keep the spring target synchronized
   * with the real center of the outer orbit element. This updates the
   * target only; the robot still travels using the existing springs.
   */
  useEffect(() => {
    if (
      pathname !== "/" ||
      activeStop.id !== HOME_HERO_STOP.id ||
      !activeStop.anchorSelector
    ) {
      return;
    }

    const anchor =
      document.querySelector(
        activeStop.anchorSelector
      );

    if (!anchor) {
      return;
    }

    const heroVisual =
      document.querySelector(
        ".hero-visual"
      );

    let frame = 0;

    const syncHeroAnchor = () => {
      if (frame !== 0) {
        return;
      }

      frame =
        window.requestAnimationFrame(
          () => {
            frame = 0;
            applyActiveStopPlacement();
          }
        );
    };

    const resizeObserver =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            syncHeroAnchor
          )
        : null;

    resizeObserver?.observe(anchor);

    if (
      heroVisual &&
      heroVisual !== anchor
    ) {
      resizeObserver?.observe(
        heroVisual
      );
    }

    window.addEventListener(
      "scroll",
      syncHeroAnchor,
      { passive: true }
    );
    window.addEventListener(
      "resize",
      syncHeroAnchor,
      { passive: true }
    );
    window.addEventListener(
      "orientationchange",
      syncHeroAnchor,
      { passive: true }
    );
    window.addEventListener(
      "pageshow",
      syncHeroAnchor
    );
    window.addEventListener(
      "load",
      syncHeroAnchor
    );

    syncHeroAnchor();

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(
          frame
        );
      }

      resizeObserver?.disconnect();

      window.removeEventListener(
        "scroll",
        syncHeroAnchor
      );
      window.removeEventListener(
        "resize",
        syncHeroAnchor
      );
      window.removeEventListener(
        "orientationchange",
        syncHeroAnchor
      );
      window.removeEventListener(
        "pageshow",
        syncHeroAnchor
      );
      window.removeEventListener(
        "load",
        syncHeroAnchor
      );
    };
  }, [
    activeStop.anchorSelector,
    activeStop.id,
    applyActiveStopPlacement,
    pathname,
  ]);

  useEffect(() => {
    if (
      !isDashboardPath(pathname) &&
      !isAdminPath(pathname)
    ) {
      return;
    }

    let frame = 0;

    const scheduleSafetyCheck = () => {
      if (frame !== 0) {
        return;
      }

      frame =
        window.requestAnimationFrame(
          () => {
            frame = 0;
            applyActiveStopPlacement();
          }
        );
    };

    window.addEventListener(
      "scroll",
      scheduleSafetyCheck,
      { passive: true }
    );
    window.addEventListener(
      "resize",
      scheduleSafetyCheck,
      { passive: true }
    );

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(
          frame
        );
      }

      window.removeEventListener(
        "scroll",
        scheduleSafetyCheck
      );
      window.removeEventListener(
        "resize",
        scheduleSafetyCheck
      );
    };
  }, [
    applyActiveStopPlacement,
    pathname,
  ]);

  useEffect(() => {
    if (!ready || welcomePlayedRef.current) {
      return;
    }

    welcomePlayedRef.current = true;

    const loginGreetingPending =
      window.sessionStorage.getItem(LOGIN_GREETING_PENDING_KEY) === "1";

    if (!reducedMotion && !loginGreetingPending) {
      setWaveSignal((value) => value + 1);
    }
  }, [ready, reducedMotion]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    clearMessageTimers();
    hideBubble();

    const pendingGreeting =
      window.sessionStorage.getItem(
        LOGIN_GREETING_PENDING_KEY
      ) === "1";
    const greetingAlreadyShown =
      window.sessionStorage.getItem(
        LOGIN_GREETING_SHOWN_KEY
      ) === "1";

    if (
      pendingGreeting &&
      !greetingAlreadyShown
    ) {
      window.sessionStorage.removeItem(
        LOGIN_GREETING_PENDING_KEY
      );
      window.sessionStorage.setItem(
        LOGIN_GREETING_SHOWN_KEY,
        "1"
      );

      const firstName =
        getSafeFirstName();
      const greeting = firstName
        ? `Welcome back, ${firstName}. Ready to explore?`
        : "Welcome back! Ready to explore?";

      const greetingSide =
        getAutomaticBubbleSide(
          activeStop,
          positionRef.current.x,
          viewport.width
        );

      messageTimerRef.current =
        window.setTimeout(
          () => {
            showMessage(
              greeting,
              greetingSide,
              MESSAGE_VISIBLE_DURATION
            );
            setWaveSignal(
              (value) => value + 1
            );
            messageTimerRef.current =
              null;
          },
          220
        );

      arrivalTimerRef.current =
        window.setTimeout(
          () => {
            showStopMessage(
              activeStop,
              true
            );
            arrivalTimerRef.current =
              null;
          },
          MESSAGE_VISIBLE_DURATION + 900
        );

      return;
    }

    messageTimerRef.current =
      window.setTimeout(
        () => {
          showStopMessage(
            activeStop
          );
          messageTimerRef.current =
            null;
        },
        reducedMotion
          ? 120
          : viewport.breakpoint === "mobile"
            ? 980
            : ARRIVAL_MESSAGE_DELAY
      );

    return () => {
      clearMessageTimers();
    };
  }, [
    activeStop,
    clearMessageTimers,
    hideBubble,
    ready,
    reducedMotion,
    showMessage,
    showStopMessage,
    viewport.width,
  ]);

  useEffect(() => {
    return () => {
      clearMessageTimers();

      if (
        initialReadyTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          initialReadyTimerRef.current
        );
      }

      if (chatNavigationTimerRef.current !== null) {
        window.clearTimeout(chatNavigationTimerRef.current);
      }
    };
  }, [clearMessageTimers]);

  const interactionScale =
    useMemo(
      () =>
        viewport.breakpoint === "mobile"
          ? 0.9
          : viewport.breakpoint === "tablet"
            ? 0.95
            : 1,
      [viewport.breakpoint]
    );

  const interactionActive =
    robotHovered || robotPressed;
  const interactionHintSide =
    getInteractionHintSide(
      positionRef.current.x,
      positionRef.current.y,
      viewport
    );

  const handleRobotActivate =
    useCallback(() => {
      if (openingChat) {
        return;
      }

      clearMessageTimers();
      hideBubble();
      setRobotHovered(false);
      setRobotPressed(false);
      setOpeningChat(true);

      if (reducedMotion) {
        router.push("/chat");
        return;
      }

      chatNavigationTimerRef.current =
        window.setTimeout(() => {
          router.push("/chat");
          chatNavigationTimerRef.current = null;
        }, 420);
    }, [clearMessageTimers, hideBubble, openingChat, reducedMotion, router]);

  return (
    <div
      className={styles.root}
      data-ready={
        ready ? "true" : "false"
      }
      aria-hidden={
        ready ? undefined : true
      }
      data-suppressed={
        uiSuppressed ? "true" : "false"
      }
    >
      <div
        className={styles.canvasLayer}
      >
        <RobotCanvas
          cursor={cursorRef}
          x={x}
          y={y}
          scale={scale}
          reducedMotion={
            reducedMotion
          }
          paused={paused}
          pose={
            activeStop.pose ?? "idle"
          }
          waveSignal={waveSignal}
          breakpoint={viewport.breakpoint}
          interactionActive={interactionActive}
          openingChat={openingChat}
          pointTarget={pointTarget}
        />
      </div>

      <div
        className={styles.overlayLayer}
      >
        <motion.div
          className={
            styles.robotOverlayPoint
          }
          style={{
            x,
            y,
          }}
        >
          <motion.div
            style={{
              scale,
            }}
          >
            <motion.div
              style={{
                scale:
                  interactionScale,
              }}
            >
              <RobotInteractionArea
                onActivate={handleRobotActivate}
                onHoverChange={setRobotHovered}
                onPressChange={setRobotPressed}
                hintSide={interactionHintSide}
                disabled={openingChat}
              />
            </motion.div>
          </motion.div>

        </motion.div>

        <AnimatePresence mode="wait">
          {bubbleMessage &&
            !uiSuppressed && (
            <RobotSpeechBubble
              key={`${activeStop.id}-${bubbleMessage}`}
              message={bubbleMessage}
              side={bubbleSide}
              reducedMotion={reducedMotion}
              robotX={x}
              robotY={y}
              robotScale={scale}
              breakpoint={viewport.breakpoint}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GlobalRobotGuide() {
  const pathname =
    usePathname();

  /*
   * Actual Administrator routes in this project live under /admin.
   * Returning null here prevents the persistent guide subtree from
   * mounting at all, so there is no Canvas, WebGL animation loop,
   * speech bubble, hit area, scroll observer, or pointer tracking
   * while an Administrator page is active.
   */
  if (
    isAdminPath(pathname) ||
    pathname === "/chat"
  ) {
    return null;
  }

  return (
    <PersistentRobotGuide
      pathname={pathname}
    />
  );
}
