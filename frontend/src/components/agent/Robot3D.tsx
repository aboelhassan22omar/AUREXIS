"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import * as THREE from "three";

type CursorPosition = {
  x: number;
  y: number;
};

type Robot3DProps = {
  cursor: MutableRefObject<CursorPosition>;
};

const COLORS = {
  shell: "#cfd2d8",
  shellSoft: "#babfc7",
  shellDeep: "#9ea5b0",
  black: "#050608",
  blackSoft: "#0c0f14",
  gold: "#caa25f",
  goldSoft: "#f0d58f",
  glow: "#fff8e6",
};

function Eye({
  x,
  y = 0.04,
}: {
  x: number;
  y?: number;
}) {
  return (
    <mesh
      position={[x, y, 1.015]}
      scale={[0.13, 0.24, 0.035]}
    >
      <sphereGeometry args={[1, 36, 36]} />
      <meshStandardMaterial
        color={COLORS.glow}
        emissive={COLORS.glow}
        emissiveIntensity={3}
        roughness={0.12}
        toneMapped={false}
      />
    </mesh>
  );
}

function Smile() {
  return (
    <mesh
      position={[0, -0.235, 1.014]}
      rotation={[0, 0, Math.PI]}
    >
      <torusGeometry
        args={[0.13, 0.01, 14, 44, Math.PI]}
      />
      <meshStandardMaterial
        color={COLORS.glow}
        emissive={COLORS.glow}
        emissiveIntensity={1.8}
        toneMapped={false}
      />
    </mesh>
  );
}

function ChestBadge() {
  return (
    <group position={[0, -0.16, 0.53]}>
      <mesh>
        <circleGeometry args={[0.17, 48]} />
        <meshPhysicalMaterial
          color={COLORS.black}
          roughness={0.12}
          metalness={0.18}
          clearcoat={1}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <ringGeometry args={[0.125, 0.155, 48]} />
        <meshStandardMaterial
          color={COLORS.goldSoft}
          emissive={COLORS.gold}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[-0.04, 0.008, 0.02]}
        rotation={[0, 0, -0.36]}
      >
        <boxGeometry args={[0.026, 0.13, 0.018]} />
        <meshStandardMaterial
          color={COLORS.glow}
          emissive={COLORS.goldSoft}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[0.04, 0.008, 0.02]}
        rotation={[0, 0, 0.36]}
      >
        <boxGeometry args={[0.026, 0.13, 0.018]} />
        <meshStandardMaterial
          color={COLORS.glow}
          emissive={COLORS.goldSoft}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, -0.015, 0.02]}>
        <boxGeometry args={[0.078, 0.022, 0.018]} />
        <meshStandardMaterial
          color={COLORS.glow}
          emissive={COLORS.goldSoft}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  armRef,
}: {
  side: "left" | "right";
  armRef?: React.RefObject<THREE.Group | null>;
}) {
  const sign = side === "left" ? -1 : 1;

  return (
    <group
      ref={armRef}
      position={[0.76 * sign, -0.93, 0.02]}
      rotation={[0, 0, sign === -1 ? 0.52 : -0.52]}
    >
      {/* shoulder */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.12, 28, 28]} />
        <meshPhysicalMaterial
          color={COLORS.shell}
          metalness={0.1}
          roughness={0.24}
          clearcoat={0.72}
        />
      </mesh>

      {/* arm piece - single smoother piece */}
      <mesh position={[0, -0.12, 0]}>
        <capsuleGeometry args={[0.115, 0.42, 16, 28]} />
        <meshPhysicalMaterial
          color={COLORS.shell}
          metalness={0.12}
          roughness={0.24}
          clearcoat={0.8}
        />
      </mesh>

      {/* hand */}
      <mesh position={[0, -0.43, 0.03]} scale={[1.08, 1, 0.9]}>
        <sphereGeometry args={[0.125, 28, 28]} />
        <meshPhysicalMaterial
          color={COLORS.shellSoft}
          metalness={0.1}
          roughness={0.24}
          clearcoat={0.72}
        />
      </mesh>
    </group>
  );
}

export default function Robot3D({
  cursor,
}: Robot3DProps) {
  const rootRef =
    useRef<THREE.Group>(null);

  const headRef =
    useRef<THREE.Group>(null);

  const eyesRef =
    useRef<THREE.Group>(null);

  const rightArmRef =
    useRef<THREE.Group>(null);

  const nextBlinkRef = useRef(2.8);
  const blinkStartRef = useRef(-1);

  const glowColor = useMemo(
    () => new THREE.Color("#f0d58f"),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (rootRef.current) {
      rootRef.current.position.y =
        Math.sin(t * 1.2) * 0.018;

      rootRef.current.rotation.z =
        Math.sin(t * 0.55) * 0.01;
    }

    if (headRef.current) {
      const targetYaw =
        THREE.MathUtils.clamp(
          cursor.current.x * 0.34,
          -0.28,
          0.28
        );

      const targetPitch =
        THREE.MathUtils.clamp(
          -cursor.current.y * 0.18,
          -0.14,
          0.14
        );

      const idleTilt =
        Math.sin(t * 0.75) * 0.018;

      headRef.current.rotation.y =
        THREE.MathUtils.damp(
          headRef.current.rotation.y,
          targetYaw,
          5,
          delta
        );

      headRef.current.rotation.x =
        THREE.MathUtils.damp(
          headRef.current.rotation.x,
          targetPitch,
          5,
          delta
        );

      headRef.current.rotation.z =
        THREE.MathUtils.damp(
          headRef.current.rotation.z,
          idleTilt,
          4,
          delta
        );
    }

    if (eyesRef.current) {
      if (t >= nextBlinkRef.current) {
        blinkStartRef.current = t;
        nextBlinkRef.current = t + 3.2 + Math.random() * 3.8;
      }

      const elapsed = t - blinkStartRef.current;
      const active = blinkStartRef.current >= 0 && elapsed < 0.18;
      const targetScaleY = active
        ? elapsed < 0.065
          ? THREE.MathUtils.lerp(1, 0.08, elapsed / 0.065)
          : elapsed < 0.09
            ? 0.08
            : THREE.MathUtils.lerp(0.08, 1, (elapsed - 0.09) / 0.09)
        : 1;

      if (!active) blinkStartRef.current = -1;

      eyesRef.current.scale.y =
        THREE.MathUtils.damp(
          eyesRef.current.scale.y,
          targetScaleY,
          active ? 55 : 42,
          delta
        );
    }

    if (rightArmRef.current) {
      const cycle = t % 14;
      const waving = cycle < 2.6;

      const target =
        waving
          ? -0.95 +
            Math.sin(cycle * 8) * 0.11
          : -0.52;

      rightArmRef.current.rotation.z =
        THREE.MathUtils.damp(
          rightArmRef.current.rotation.z,
          target,
          5,
          delta
        );
    }
  });

  return (
    <group
      ref={rootRef}
      scale={0.72}
      position={[0, -0.04, 0]}
    >
      {/* HEAD */}
      <group
        ref={headRef}
        position={[0, 0.58, 0]}
      >
        {/* outer shell */}
        <mesh>
          <sphereGeometry args={[0.92, 64, 64]} />
          <meshPhysicalMaterial
            color={COLORS.shell}
            metalness={0.12}
            roughness={0.22}
            clearcoat={0.9}
            clearcoatRoughness={0.08}
          />
        </mesh>

        {/* black top part */}
        <RoundedBox
          args={[1.18, 0.36, 0.22]}
          radius={0.17}
          smoothness={8}
          position={[0, 0.52, 0.38]}
          rotation={[-0.13, 0, 0]}
        >
          <meshPhysicalMaterial
            color={COLORS.black}
            metalness={0.08}
            roughness={0.03}
            clearcoat={1}
          />
        </RoundedBox>

        {/* full black face screen */}
        <RoundedBox
          args={[1.38, 1.02, 0.2]}
          radius={0.35}
          smoothness={10}
          position={[0, -0.015, 0.79]}
        >
          <meshPhysicalMaterial
            color={COLORS.black}
            metalness={0.08}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.01}
          />
        </RoundedBox>

        {/* extra visor strip to preserve the top black design */}
        <RoundedBox
          args={[1.16, 0.17, 0.1]}
          radius={0.08}
          smoothness={8}
          position={[0, 0.33, 0.875]}
        >
          <meshPhysicalMaterial
            color={COLORS.black}
            metalness={0.08}
            roughness={0.02}
            clearcoat={1}
          />
        </RoundedBox>

        {/* tiny glossy reflection */}
        <RoundedBox
          args={[0.3, 0.03, 0.01]}
          radius={0.015}
          smoothness={6}
          position={[-0.19, 0.28, 0.9]}
          rotation={[0, 0, -0.08]}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.07}
          />
        </RoundedBox>

        {/* eyes and mouth only */}
        <group ref={eyesRef}>
          <Eye x={-0.23} />
          <Eye x={0.23} />
        </group>

        <Smile />
      </group>

      {/* NECK */}
      <mesh position={[0, -0.36, 0.015]}>
        <cylinderGeometry
          args={[0.16, 0.2, 0.18, 32]}
        />
        <meshPhysicalMaterial
          color={COLORS.blackSoft}
          roughness={0.22}
          metalness={0.16}
        />
      </mesh>

      <mesh
        position={[0, -0.45, 0.01]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.21, 0.018, 14, 42]} />
        <meshStandardMaterial
          color={COLORS.goldSoft}
          metalness={0.32}
          roughness={0.18}
          emissive={glowColor}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* BODY */}
      <group position={[0, -0.97, 0.02]}>
        {/* main body */}
        <mesh scale={[0.84, 1.02, 0.72]}>
          <sphereGeometry args={[1, 56, 56]} />
          <meshPhysicalMaterial
            color={COLORS.shellSoft}
            metalness={0.12}
            roughness={0.24}
            clearcoat={0.82}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* lower body smoothing */}
        <mesh
          position={[0, -0.14, 0.01]}
          scale={[0.71, 0.65, 0.58]}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial
            color={COLORS.shell}
            metalness={0.1}
            roughness={0.26}
            clearcoat={0.72}
          />
        </mesh>

        {/* upper black chest piece */}
        <mesh
          position={[0, 0.14, 0.31]}
          scale={[0.56, 0.36, 0.15]}
        >
          <sphereGeometry args={[1, 44, 44]} />
          <meshPhysicalMaterial
            color={COLORS.black}
            metalness={0.08}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>

        <ChestBadge />
      </group>

      {/* ARMS */}
      <Arm side="left" />
      <Arm
        side="right"
        armRef={rightArmRef}
      />
    </group>
  );
}
