"use client";

import {
  useEffect,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

export type RobotThemeColors = {
  shell: THREE.Color;
  shellSecondary: THREE.Color;
  face: THREE.Color;
  darkMetal: THREE.Color;
  accent: THREE.Color;
  accentCyan: THREE.Color;
  accentIndigo: THREE.Color;
  accentViolet: THREE.Color;
  eye: THREE.Color;
  eyeGlow: THREE.Color;
  shadow: THREE.Color;
};

const ROBOT_COLOR_VARIABLES = {
  shell: "--robot-shell",
  shellSecondary: "--robot-shell-secondary",
  face: "--robot-face",
  darkMetal: "--robot-dark-metal",
  accent: "--robot-accent",
  accentCyan: "--robot-accent-cyan",
  accentIndigo: "--robot-accent-indigo",
  accentViolet: "--robot-accent-violet",
  eye: "--robot-eye",
  eyeGlow: "--robot-eye-glow",
  shadow: "--robot-shadow",
} as const;

function createEmptyColors(): RobotThemeColors {
  return {
    shell: new THREE.Color(),
    shellSecondary: new THREE.Color(),
    face: new THREE.Color(),
    darkMetal: new THREE.Color(),
    accent: new THREE.Color(),
    accentCyan: new THREE.Color(),
    accentIndigo: new THREE.Color(),
    accentViolet: new THREE.Color(),
    eye: new THREE.Color(),
    eyeGlow: new THREE.Color(),
    shadow: new THREE.Color(),
  };
}

function clampChannel(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function parseCssColor(value: string): THREE.Color | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const rgbMatch = normalized.match(
    /^rgba?\(\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?/i,
  );

  if (rgbMatch) {
    const usesPercent = normalized.includes("%");
    const divisor = usesPercent ? 100 : 255;

    return new THREE.Color().setRGB(
      clampChannel(Number(rgbMatch[1]) / divisor),
      clampChannel(Number(rgbMatch[2]) / divisor),
      clampChannel(Number(rgbMatch[3]) / divisor),
      THREE.SRGBColorSpace,
    );
  }

  const srgbMatch = normalized.match(
    /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
  );

  if (srgbMatch) {
    return new THREE.Color().setRGB(
      clampChannel(Number(srgbMatch[1])),
      clampChannel(Number(srgbMatch[2])),
      clampChannel(Number(srgbMatch[3])),
      THREE.SRGBColorSpace,
    );
  }

  try {
    const parsed = new THREE.Color();
    parsed.setStyle(normalized);
    return parsed;
  } catch {
    return null;
  }
}

function resolveVariableColor(
  probe: HTMLElement,
  variableName: string,
): THREE.Color | null {
  probe.style.color = `var(${variableName})`;

  const computedColor =
    window.getComputedStyle(probe).color;

  return parseCssColor(computedColor);
}

function readRobotThemeColors(
  target: RobotThemeColors,
) {
  if (typeof document === "undefined") {
    return;
  }

  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "fixed";
  probe.style.width = "0";
  probe.style.height = "0";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  probe.style.contain = "strict";

  document.documentElement.appendChild(probe);

  try {
    (
      Object.entries(ROBOT_COLOR_VARIABLES) as Array<
        [keyof RobotThemeColors, string]
      >
    ).forEach(([key, variableName]) => {
      const resolved = resolveVariableColor(
        probe,
        variableName,
      );

      if (resolved) {
        target[key].copy(resolved);
      }
    });
  } finally {
    probe.remove();
  }
}

export default function useRobotThemeColors(): RefObject<RobotThemeColors> {
  const colorsRef = useRef<RobotThemeColors>(
    createEmptyColors(),
  );
  const initializedRef = useRef(false);

  if (
    !initializedRef.current &&
    typeof document !== "undefined"
  ) {
    readRobotThemeColors(colorsRef.current);
    initializedRef.current = true;
  }

  useEffect(() => {
    const refreshColors = () => {
      readRobotThemeColors(colorsRef.current);
    };

    refreshColors();

    const observer = new MutationObserver(
      refreshColors,
    );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "data-theme",
          "class",
          "style",
        ],
      },
    );

    window.addEventListener(
      "pageshow",
      refreshColors,
    );

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "pageshow",
        refreshColors,
      );
    };
  }, []);

  return colorsRef;
}
