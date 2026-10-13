"use client";

import { useEffect, useState } from "react";

/** `null` until mounted, then tracks the query. */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    update();
    list.addEventListener("change", update);

    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Landscape screens wide enough for the side-by-side scroll story. */
export const STORY_QUERY = "(min-width: 820px) and (min-aspect-ratio: 21/20)";
