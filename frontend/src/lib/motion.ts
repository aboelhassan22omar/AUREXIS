// Aurexis motion language — mirrors the CSS tokens in styles/tokens.css.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  micro: 0.16,
  hover: 0.28,
  component: 0.52,
  section: 0.9,
  hero: 1.4,
} as const;

export const STAGGER = 0.07;
