"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import styles from "@/components/robot-guide/GlobalRobotGuide.module.css";
import type {
  RobotBubbleSide,
} from "@/components/robot-guide/robot-guide.types";

const CLICK_DISTANCE_THRESHOLD = 10;
const CLICK_DURATION_THRESHOLD = 700;
const TOUCH_ACTIVATION_DELAY = 90;

type PointerStart = {
  x: number;
  y: number;
  time: number;
  pointerId: number;
  pointerType: string;
};

type RobotInteractionAreaProps = {
  onActivate: () => void;
  onHoverChange: (hovered: boolean) => void;
  onPressChange: (pressed: boolean) => void;
  hintSide: RobotBubbleSide;
  disabled?: boolean;
};

export default function RobotInteractionArea({
  onActivate,
  onHoverChange,
  onPressChange,
  hintSide,
  disabled = false,
}: RobotInteractionAreaProps) {
  const pointerStartRef =
    useRef<PointerStart | null>(null);
  const activationTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(
          activationTimerRef.current
        );
      }
    };
  }, []);

  function clearPendingActivation() {
    if (activationTimerRef.current !== null) {
      window.clearTimeout(
        activationTimerRef.current
      );
      activationTimerRef.current = null;
    }
  }

  function handlePointerEnter(
    event: PointerEvent<HTMLButtonElement>
  ) {
    if (event.pointerType === "touch") {
      return;
    }

    onHoverChange(true);
  }

  function handlePointerLeave(
    event: PointerEvent<HTMLButtonElement>
  ) {
    if (event.pointerType !== "touch") {
      onHoverChange(false);
    }

    if (
      pointerStartRef.current?.pointerId ===
      event.pointerId
    ) {
      pointerStartRef.current = null;
      onPressChange(false);
    }
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>
  ) {
    clearPendingActivation();

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };

    onPressChange(true);
  }

  function handlePointerMove(
    event: PointerEvent<HTMLButtonElement>
  ) {
    const start = pointerStartRef.current;

    if (
      !start ||
      start.pointerId !== event.pointerId
    ) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y
    );

    if (distance > CLICK_DISTANCE_THRESHOLD) {
      pointerStartRef.current = null;
      onPressChange(false);
    }
  }

  function handlePointerUp(
    event: PointerEvent<HTMLButtonElement>
  ) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (
      !start ||
      start.pointerId !== event.pointerId
    ) {
      onPressChange(false);
      return;
    }

    const distance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y
    );
    const duration =
      performance.now() - start.time;

    if (
      distance > CLICK_DISTANCE_THRESHOLD ||
      duration > CLICK_DURATION_THRESHOLD
    ) {
      onPressChange(false);
      return;
    }

    if (start.pointerType === "touch") {
      activationTimerRef.current =
        window.setTimeout(() => {
          onPressChange(false);
          onActivate();
          activationTimerRef.current = null;
        }, TOUCH_ACTIVATION_DELAY);
      return;
    }

    onPressChange(false);
    onActivate();
  }

  function handlePointerCancel() {
    pointerStartRef.current = null;
    clearPendingActivation();
    onPressChange(false);
  }

  function handleFocus() {
    onHoverChange(true);
  }

  function handleBlur() {
    onHoverChange(false);
    onPressChange(false);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>
  ) {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    if (event.repeat) {
      return;
    }

    event.preventDefault();
    onPressChange(true);
    onActivate();
  }

  function handleKeyUp(
    event: KeyboardEvent<HTMLButtonElement>
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      onPressChange(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={styles.hitArea}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-label="Open AUREXIS AI chat"
      title="Open AUREXIS AI chat"
      tabIndex={disabled ? -1 : 0}
      data-robot-hit-area="true"
      data-hint-side={hintSide}
    >
      <span
        className={styles.chatHint}
        aria-hidden="true"
      >
        Chat with AUREXIS AI
      </span>
    </button>
  );
}
