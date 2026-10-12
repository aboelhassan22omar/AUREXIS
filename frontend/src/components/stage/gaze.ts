"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import type { UnitGaze } from "@/components/stage/stage.types";

/*
 * A tiny shared store so a form anywhere on the page can tell the Aurexis
 * Unit where to look (e.g. away while a password is typed), without
 * threading props through the 3D scene.
 */

let current: UnitGaze = "auto";
const listeners = new Set<() => void>();

export function setUnitGaze(next: UnitGaze) {
  if (next === current) {
    return;
  }

  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUnitGaze(): UnitGaze {
  return useSyncExternalStore(subscribe, () => current, () => "auto");
}

/**
 * Drives the unit from a sign-in / sign-up form:
 * looking at the form while details are typed, turning away while a hidden
 * password is typed, and peeking when the password is revealed.
 */
export function useFormGaze() {
  const [field, setField] = useState<"none" | "text" | "password">("none");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setUnitGaze(
      field === "password"
        ? revealed
          ? "peek"
          : "away"
        : field === "text"
          ? "watch"
          : "auto"
    );
  }, [field, revealed]);

  useEffect(() => () => setUnitGaze("auto"), []);

  return {
    setRevealed,
    textField: {
      onFocus: () => setField("text"),
      onBlur: () => setField("none"),
    },
    passwordField: {
      onFocus: () => setField("password"),
      onBlur: () => setField("none"),
    },
  };
}
