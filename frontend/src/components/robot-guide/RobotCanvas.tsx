"use client";

import {
  Canvas,
} from "@react-three/fiber";
import type {
  MotionValue,
} from "motion/react";
import type {
  RefObject,
} from "react";
import * as THREE from "three";

import RobotScene from "@/components/robot-guide/RobotScene";
import type {
  CursorDirection,
  RobotBreakpoint,
  RobotPointTarget,
  RobotPose,
} from "@/components/robot-guide/robot-guide.types";

export type RobotCanvasProps = {
  cursor: RefObject<CursorDirection>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  reducedMotion: boolean;
  paused: boolean;
  pose: RobotPose;
  waveSignal: number;
  breakpoint: RobotBreakpoint;
  interactionActive: boolean;
  openingChat: boolean;
  pointTarget: RobotPointTarget | null;
};

function getDprRange(
  breakpoint: RobotBreakpoint
): [number, number] {
  if (breakpoint === "mobile") {
    return [1, 1.15];
  }

  if (breakpoint === "tablet") {
    return [1, 1.3];
  }

  return [1, 1.5];
}

export default function RobotCanvas(
  props: RobotCanvasProps
) {
  const {
    breakpoint,
    ...sceneProps
  } = props;
  const dpr = getDprRange(
    breakpoint
  );

  return (
    <Canvas
      orthographic
      frameloop={
        props.paused
          ? "demand"
          : "always"
      }
      camera={{
        position: [0, 0, 8],
        zoom: 100,
        near: 0.1,
        far: 40,
      }}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference:
          "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(
          0x000000,
          0
        );
        gl.outputColorSpace =
          THREE.SRGBColorSpace;
        gl.toneMapping =
          THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure =
          1.02;
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <RobotScene {...sceneProps} />
    </Canvas>
  );
}
