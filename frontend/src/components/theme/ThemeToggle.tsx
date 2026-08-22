"use client";

import {
  Moon,
  Sun,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useRef,
} from "react";

import {
  useTheme,
} from "@/components/theme/ThemeProvider";

export default function ThemeToggle() {
  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const reduceMotion =
    useReducedMotion();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark =
    theme === "dark";

  const nextThemeLabel =
    isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  function handleToggle() {
    const rect =
      buttonRef.current?.getBoundingClientRect();

    toggleTheme(
      rect
        ? {
            x:
              rect.left +
              rect.width / 2,
            y:
              rect.top +
              rect.height / 2,
          }
        : undefined
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      aria-pressed={isDark}
      whileHover={
        reduceMotion
          ? undefined
          : {
              scale: 1.03,
            }
      }
      whileTap={
        reduceMotion
          ? undefined
          : {
              scale: 0.97,
            }
      }
    >
      <span
        className="theme-toggle-track"
        aria-hidden="true"
      >
        <Sun
          className="theme-toggle-sun"
          size={14}
          strokeWidth={1.8}
        />

        <Moon
          className="theme-toggle-moon"
          size={14}
          strokeWidth={1.8}
        />

        <motion.span
          className="theme-toggle-knob"
          animate={{
            x: isDark
              ? 26
              : 0,
            rotate: isDark
              ? 180
              : 0,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.36,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >
          <motion.span
            key={theme}
            className="theme-toggle-knob-icon"
            initial={{
              opacity: 0,
              scale: 0.65,
              rotate: -35,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration:
                reduceMotion
                  ? 0
                  : 0.25,
            }}
          >
            {isDark ? (
              <Moon
                size={13}
                strokeWidth={2}
              />
            ) : (
              <Sun
                size={13}
                strokeWidth={2}
              />
            )}
          </motion.span>
        </motion.span>
      </span>
    </motion.button>
  );
}
