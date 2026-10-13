"use client";

import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";

import "@/components/stage/quietClock";
import StageScene from "@/components/stage/StageScene";
import type {
  CursorDirection,
  StageSignals,
} from "@/components/stage/stage.types";

type AurexisStageProps = {
  signals: RefObject<StageSignals>;
  /** Element whose visibility decides whether the GPU keeps rendering. */
  observe: RefObject<HTMLElement | null>;
  activateSignal: number;
  onActivate: () => void;
  onHoverChange?: (hovered: boolean) => void;
  onReady?: () => void;
};

/**
 * The Aurexis Unit stage. Owns the WebGL canvas, pointer tracking and
 * render scheduling. It never opens the assistant — clicking the unit
 * cycles its own modes through `onActivate`.
 */
export default function AurexisStage({
  signals,
  observe,
  activateSignal,
  onActivate,
  onHoverChange,
  onReady,
}: AurexisStageProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<CursorDirection>({ x: 0, y: 0, active: false });
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.6]);

  // Render only while the story is on screen and the tab is visible.
  useEffect(() => {
    const target = observe.current;

    if (!target) {
      return;
    }

    let onScreen = true;
    const update = () => {
      const next = onScreen && document.visibilityState === "visible";
      signals.current.visible = next;
      setVisible(next);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { rootMargin: "120px 0px" }
    );

    observer.observe(target);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [observe, signals]);

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setDpr(coarse ? [1, 1.4] : [1, 1.75]);

    if (coarse) {
      return;
    }

    let frame = 0;
    let px = 0;
    let py = 0;

    const update = () => {
      frame = 0;
      const wrapper = wrapperRef.current;

      if (!wrapper) {
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const landscape = rect.width / Math.max(1, rect.height) >= 1.05;
      const wide = rect.width >= 1080 && landscape;
      const medium = rect.width >= 820 && landscape && !wide;
      const cx = rect.left + rect.width * (wide || medium ? 0.72 : 0.5);
      const cy = rect.top + rect.height * (wide || medium ? 0.46 : 0.62);
      const cursor = cursorRef.current;

      cursor.x = THREE.MathUtils.clamp((px - cx) / Math.max(170, rect.width * 0.2), -1, 1);
      cursor.y = THREE.MathUtils.clamp((cy - py) / Math.max(150, rect.height * 0.24), -1, 1);
      cursor.active = true;
    };

    const handleMove = (event: PointerEvent) => {
      px = event.clientX;
      py = event.clientY;

      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const handleLeave = () => {
      cursorRef.current.active = false;
      cursorRef.current.x = 0;
      cursorRef.current.y = 0;
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const handleHover = useCallback(
    (next: boolean) => {
      setHovered(next);
      signals.current.hover = next;
      onHoverChange?.(next);
    },
    [onHoverChange, signals]
  );

  return (
    <div
      ref={wrapperRef}
      className={`ax-stage${hovered ? " is-hovered" : ""}`}
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        camera={{
          fov: 30,
          position: [0, 1.3, 12.6],
          near: 0.1,
          far: 60,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          onReady?.();
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          touchAction: "pan-y",
        }}
      >
        <StageScene
          signals={signals}
          cursor={cursorRef}
          waveSignal={activateSignal}
          reducedMotion={reducedMotion}
          hovered={hovered}
          onHoverChange={handleHover}
          onActivate={onActivate}
        />
      </Canvas>
    </div>
  );
}
