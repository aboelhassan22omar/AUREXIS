export type RobotPose =
  | "idle"
  | "wave"
  | "explain"
  | "point";

export type RobotAnimationState =
  | "idle"
  | "trackingPointer"
  | "blinking"
  | "hovered"
  | "listening"
  | "welcoming"
  | "waving"
  | "pointing"
  | "showingMessage"
  | "openingChat"
  | "returningToRest"
  | "returningToIdle";

export type RobotPointTarget = {
  side: "left" | "right";
  vertical: number;
};

/** Pointer direction relative to the stage centre, each axis in [-1, 1]. */
export type CursorDirection = {
  x: number;
  y: number;
  active: boolean;
};

/** Shared, mutable state written by the DOM and read inside useFrame. */
export type StageSignals = {
  /** 0 → 1 across the whole story wrapper */
  progress: number;
  /** index of the active stack layer, -1 when none */
  layer: number;
  hover: boolean;
  /** scene-clock time of the last click pulse (stamped by the scene) */
  pulseAt: number;
  /** incremented by the DOM on every activation */
  pulseId: number;
  visible: boolean;
};
