export type RobotBreakpoint =
  | "desktop"
  | "tablet"
  | "mobile";

export type RobotBubbleSide =
  | "left"
  | "right"
  | "top"
  | "bottom";

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

export type RobotPlacement = {
  x: number;
  y: number;
  scale: number;
};

export type RobotStop = {
  id: string;
  pathname: string;
  match?: "exact" | "prefix";
  sectionId: string;
  selector: string;
  anchorSelector?: string;
  desktop: RobotPlacement;
  tablet: RobotPlacement;
  mobile: RobotPlacement;
  message: string;
  bubbleSide?: RobotBubbleSide;
  pose?: RobotPose;
};

export type CursorDirection = {
  x: number;
  y: number;
  active: boolean;
};
