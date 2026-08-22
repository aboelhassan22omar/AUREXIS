"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  RobotStop,
} from "@/components/robot-guide/robot-guide.types";
import {
  GLOBAL_FOOTER_STOP,
  HOME_HERO_STOP,
  getRobotStopsForPath,
} from "@/components/robot-guide/robot-stops";

const HOME_TOP_ENTER_THRESHOLD = 80;
const HOME_TOP_EXIT_THRESHOLD = 140;
const FOOTER_END_THRESHOLD = 60;
const FOOTER_RELEASE_THRESHOLD = 150;

type ViewportMetrics = {
  top: number;
  height: number;
  bottom: number;
};

function getViewportMetrics(): ViewportMetrics {
  const visualViewport =
    window.visualViewport;
  const top =
    visualViewport?.offsetTop ?? 0;
  const height =
    visualViewport?.height ??
    window.innerHeight;

  return {
    top,
    height,
    bottom: top + height,
  };
}

function chooseClosestStop(
  stops: RobotStop[],
  elements: Map<string, Element>,
  activeStopId: string
): RobotStop {
  if (typeof window === "undefined") {
    return stops[0];
  }

  const viewport =
    getViewportMetrics();
  const viewportHeight =
    viewport.height;
  const viewportCenter =
    viewport.top +
    viewportHeight / 2;

  let bestStop = stops[0];
  let bestScore =
    Number.POSITIVE_INFINITY;

  for (const stop of stops) {
    const element =
      elements.get(stop.id);

    if (!element) {
      continue;
    }

    const rect =
      element.getBoundingClientRect();

    const visibleTop =
      Math.max(
        rect.top,
        viewport.top
      );
    const visibleBottom =
      Math.min(
        rect.bottom,
        viewport.bottom
      );
    const visibleHeight =
      Math.max(
        0,
        visibleBottom - visibleTop
      );

    const denominator =
      Math.max(
        1,
        Math.min(
          rect.height,
          viewportHeight
        )
      );

    const visibleRatio =
      visibleHeight / denominator;

    const elementCenter =
      rect.top + rect.height / 2;
    const centerDistance =
      Math.abs(
        elementCenter - viewportCenter
      );

    const isMeaningfullyVisible =
      visibleHeight > 0 &&
      (
        visibleRatio >= 0.24 ||
        centerDistance <=
          viewportHeight * 0.46
      );

    if (!isMeaningfullyVisible) {
      continue;
    }

    const activeBias =
      stop.id === activeStopId
        ? window.innerWidth < 700
          ? 0.22
          : 0.12
        : 0;

    const score =
      centerDistance /
        viewportHeight -
      visibleRatio * 0.36 -
      activeBias;

    if (score < bestScore) {
      bestScore = score;
      bestStop = stop;
    }
  }

  if (
    bestScore !==
    Number.POSITIVE_INFINITY
  ) {
    return bestStop;
  }

  for (const stop of stops) {
    const element =
      elements.get(stop.id);

    if (!element) {
      continue;
    }

    const rect =
      element.getBoundingClientRect();
    const centerDistance =
      Math.abs(
        rect.top +
          rect.height / 2 -
          viewportCenter
      );

    if (centerDistance < bestScore) {
      bestScore = centerDistance;
      bestStop = stop;
    }
  }

  return bestStop;
}

function isNearPageEnd(): boolean {
  const documentElement =
    document.documentElement;
  const viewport =
    getViewportMetrics();

  return (
    window.scrollY +
      viewport.top +
      viewport.height >=
    documentElement.scrollHeight -
      FOOTER_END_THRESHOLD
  );
}

function isFooterVisible(
  footer: Element | null
): boolean {
  if (!footer) {
    return false;
  }

  const rect =
    footer.getBoundingClientRect();
  const viewport =
    getViewportMetrics();

  if (
    rect.height <= 0 ||
    rect.bottom <= viewport.top ||
    rect.top >= viewport.bottom
  ) {
    return false;
  }

  const visibleTop =
    Math.max(
      viewport.top,
      rect.top
    );
  const visibleBottom =
    Math.min(
      viewport.bottom,
      rect.bottom
    );

  return (
    visibleBottom - visibleTop >=
    Math.min(42, rect.height * 0.18)
  );
}

function shouldReleaseFooterPriority(
  footer: Element | null
): boolean {
  if (!footer) {
    return true;
  }

  const viewport =
    getViewportMetrics();
  const distanceFromEnd =
    document.documentElement.scrollHeight -
    (
      window.scrollY +
      viewport.top +
      viewport.height
    );

  const rect =
    footer.getBoundingClientRect();

  return (
    !isFooterVisible(footer) &&
    distanceFromEnd >
      FOOTER_RELEASE_THRESHOLD &&
    rect.top >
      viewport.bottom + 28
  );
}

export default function useActiveRobotStop(
  pathname: string
): RobotStop {
  const stops = useMemo(
    () =>
      getRobotStopsForPath(
        pathname
      ),
    [pathname]
  );

  const [activeStop, setActiveStop] =
    useState<RobotStop>(
      pathname === "/"
        ? HOME_HERO_STOP
        : stops[0]
    );

  const activeIdRef =
    useRef(activeStop.id);
  const footerPriorityRef =
    useRef(false);
  const footerVisibleRef =
    useRef(false);
  const homeHeroPriorityRef =
    useRef(pathname === "/");

  useEffect(() => {
    const isHomePage =
      pathname === "/";

    const startsAtHomeTop =
      isHomePage &&
      window.scrollY <=
        HOME_TOP_ENTER_THRESHOLD;

    const initial = startsAtHomeTop
      ? HOME_HERO_STOP
      : stops[0];

    activeIdRef.current =
      initial.id;
    footerPriorityRef.current =
      false;
    footerVisibleRef.current =
      false;
    homeHeroPriorityRef.current =
      startsAtHomeTop;
    setActiveStop(initial);

    const elements =
      new Map<string, Element>();

    let footerElement:
      Element | null = null;
    let frame = 0;

    const getNextStop = (): RobotStop => {
      /*
       * HOME HERO HAS PRIORITY WHEN THE USER RETURNS
       * TO THE TOP OF THE HOME PAGE.
       *
       * Hysteresis prevents oscillation around the
       * first section boundary:
       * - enter at <= 80px
       * - release only after > 140px
       */
      if (isHomePage) {
        if (
          window.scrollY <=
          HOME_TOP_ENTER_THRESHOLD
        ) {
          homeHeroPriorityRef.current =
            true;
        } else if (
          window.scrollY >
          HOME_TOP_EXIT_THRESHOLD
        ) {
          homeHeroPriorityRef.current =
            false;
        }

        if (
          homeHeroPriorityRef.current
        ) {
          footerPriorityRef.current =
            false;
          footerVisibleRef.current =
            false;

          return HOME_HERO_STOP;
        }
      } else {
        homeHeroPriorityRef.current =
          false;
      }

      const hasFooter =
        footerElement !== null;

      if (hasFooter) {
        const geometricallyVisible =
          isFooterVisible(
            footerElement
          );

        footerVisibleRef.current =
          geometricallyVisible;

        const footerShouldTakePriority =
          geometricallyVisible ||
          isNearPageEnd();

        if (footerShouldTakePriority) {
          footerPriorityRef.current =
            true;
        } else if (
          footerPriorityRef.current &&
          shouldReleaseFooterPriority(
            footerElement
          )
        ) {
          footerPriorityRef.current =
            false;
        }
      } else {
        footerVisibleRef.current =
          false;
        footerPriorityRef.current =
          false;
      }

      if (
        hasFooter &&
        footerPriorityRef.current
      ) {
        return GLOBAL_FOOTER_STOP;
      }

      return chooseClosestStop(
        stops,
        elements,
        activeIdRef.current
      );
    };

    const updateActiveStop = () => {
      frame = 0;

      const nextStop =
        getNextStop();

      if (
        nextStop.id ===
        activeIdRef.current
      ) {
        return;
      }

      activeIdRef.current =
        nextStop.id;
      setActiveStop(nextStop);
    };

    const scheduleUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame =
        window.requestAnimationFrame(
          updateActiveStop
        );
    };

    const sectionObserver =
      new IntersectionObserver(
        () => {
          scheduleUpdate();
        },
        {
          threshold: [
            0,
            0.25,
            0.4,
            0.55,
            0.7,
          ],
          rootMargin:
            "-8% 0px -8% 0px",
        }
      );

    const footerObserver =
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (
              entry.target !==
              footerElement
            ) {
              continue;
            }

            footerVisibleRef.current =
              entry.isIntersecting &&
              entry.intersectionRatio > 0;

            if (
              !entry.isIntersecting &&
              shouldReleaseFooterPriority(
                footerElement
              )
            ) {
              footerPriorityRef.current =
                false;
            }
          }

          scheduleUpdate();
        },
        {
          threshold: [
            0,
            0.08,
            0.18,
            0.35,
          ],
          rootMargin:
            "0px 0px -2% 0px",
        }
      );

    const bindElements = () => {
      for (const stop of stops) {
        const current =
          elements.get(stop.id);
        const next =
          document.querySelector(
            stop.selector
          );

        if (current === next) {
          continue;
        }

        if (current) {
          sectionObserver.unobserve(
            current
          );
          elements.delete(stop.id);
        }

        if (next) {
          elements.set(
            stop.id,
            next
          );
          sectionObserver.observe(
            next
          );
        }
      }

      const nextFooter =
        document.querySelector(
          GLOBAL_FOOTER_STOP.selector
        );

      if (
        footerElement !== nextFooter
      ) {
        if (footerElement) {
          footerObserver.unobserve(
            footerElement
          );
        }

        footerElement = nextFooter;
        footerVisibleRef.current =
          false;
        footerPriorityRef.current =
          false;

        if (footerElement) {
          footerObserver.observe(
            footerElement
          );
        }
      }

      scheduleUpdate();
    };

    const mutationObserver =
      new MutationObserver(() => {
        bindElements();
      });

    bindElements();

    mutationObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      { passive: true }
    );
    window.addEventListener(
      "resize",
      scheduleUpdate,
      { passive: true }
    );
    window.addEventListener(
      "orientationchange",
      scheduleUpdate,
      { passive: true }
    );
    window.visualViewport?.addEventListener(
      "resize",
      scheduleUpdate,
      { passive: true }
    );
    window.visualViewport?.addEventListener(
      "scroll",
      scheduleUpdate,
      { passive: true }
    );

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(
          frame
        );
      }

      sectionObserver.disconnect();
      footerObserver.disconnect();
      mutationObserver.disconnect();

      window.removeEventListener(
        "scroll",
        scheduleUpdate
      );
      window.removeEventListener(
        "resize",
        scheduleUpdate
      );
      window.removeEventListener(
        "orientationchange",
        scheduleUpdate
      );
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleUpdate
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scheduleUpdate
      );

      footerPriorityRef.current =
        false;
      footerVisibleRef.current =
        false;
      homeHeroPriorityRef.current =
        false;
    };
  }, [pathname, stops]);

  return activeStop;
}
