"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeOrigin = {
  x: number;
  y: number;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (
    theme: Theme,
    origin?: ThemeOrigin
  ) => void;
  toggleTheme: (
    origin?: ThemeOrigin
  ) => void;
};

type ViewTransitionLike = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => void
  ) => ViewTransitionLike;
};

type AnimationOptionsWithPseudo = KeyframeAnimationOptions & {
  pseudoElement?: string;
};

const STORAGE_KEY = "aurexis-theme";

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function isTheme(
  value: string | null | undefined
): value is Theme {
  return (
    value === "light" ||
    value === "dark"
  );
}

function getDocumentTheme(): Theme {
  const value =
    document.documentElement.dataset.theme;

  return isTheme(value)
    ? value
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;
}

export default function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  useEffect(() => {
    setThemeState(
      getDocumentTheme()
    );

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemChange = () => {
      const savedTheme =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (isTheme(savedTheme)) {
        return;
      }

      const nextTheme: Theme =
        mediaQuery.matches
          ? "dark"
          : "light";

      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemChange
      );
    };
  }, []);

  const setTheme = useCallback(
    (
      nextTheme: Theme,
      origin?: ThemeOrigin
    ) => {
      if (
        nextTheme ===
        getDocumentTheme()
      ) {
        return;
      }

      const root =
        document.documentElement;

      const reduceMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      const doc =
        document as DocumentWithViewTransition;

      const commitTheme = () => {
        applyTheme(nextTheme);
        setThemeState(nextTheme);

        window.localStorage.setItem(
          STORAGE_KEY,
          nextTheme
        );
      };

      root.classList.add(
        "theme-transitioning"
      );

      window.setTimeout(
        () => {
          root.classList.remove(
            "theme-transitioning"
          );
        },
        460
      );

      if (
        !reduceMotion &&
        origin &&
        doc.startViewTransition
      ) {
        const transition =
          doc.startViewTransition(
            commitTheme
          );

        void transition.ready.then(
          () => {
            const radius = Math.hypot(
              Math.max(
                origin.x,
                window.innerWidth -
                  origin.x
              ),
              Math.max(
                origin.y,
                window.innerHeight -
                  origin.y
              )
            );

            root.animate(
              {
                clipPath: [
                  `circle(0px at ${origin.x}px ${origin.y}px)`,
                  `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
                ],
              },
              {
                duration: 420,
                easing:
                  "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement:
                  "::view-transition-new(root)",
              } as AnimationOptionsWithPseudo
            );
          }
        );

        return;
      }

      commitTheme();
    },
    []
  );

  const toggleTheme = useCallback(
    (origin?: ThemeOrigin) => {
      setTheme(
        getDocumentTheme() ===
          "dark"
          ? "light"
          : "dark",
        origin
      );
    },
    [setTheme]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
