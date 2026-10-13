"use client";

import {
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import {
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  motionValue,
} from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import AurexisUnit from "@/components/stage/AurexisUnit";
import type {
  CursorDirection,
  StageSignals,
} from "@/components/stage/stage.types";

type StageSceneProps = {
  signals: RefObject<StageSignals>;
  cursor: RefObject<CursorDirection>;
  waveSignal: number;
  reducedMotion: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onActivate: () => void;
};

/* Layer palette — top plate (Experience) is the lightest, Security the deepest. */
const PLATE_COLORS = ["#cfe0ff", "#7fa6ff", "#2f63f5", "#13238a"];

const PLATE_SIZE = 2.9;
const PLATE_THICKNESS = 0.1;

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

function easeOutExpo(x: number) {
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/* -------------------------------------------------------------------------
   Glass layer plate
------------------------------------------------------------------------- */

function GlassPlate({
  index,
  signals,
  reducedMotion,
}: {
  index: number;
  signals: RefObject<StageSignals>;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const color = PLATE_COLORS[index];

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.06,
        transparent: true,
        opacity: index === 0 ? 0.62 : 0.5,
        roughness: 0.16,
        metalness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.4,
        depthWrite: false,
      }),
    [color, index]
  );

  useEffect(
    () => () => {
      glass.dispose();
    },
    [glass]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const s = signals.current;
    const t = state.clock.elapsedTime;
    const active = s.layer === index;
    const inStory = s.layer >= 0;

    // Assemble on load: plates fall into place top-down.
    const intro = reducedMotion
      ? 1
      : easeOutExpo(Math.min(1, Math.max(0, (t - 0.15 - index * 0.12) / 1.6)));

    const gap = inStory ? 0.62 : 0.2 + s.progress * 0.6;
    const targetY = -1.05 - index * (gap + PLATE_THICKNESS) - (1 - intro) * (1.4 + index * 0.5);
    const lift = active ? 0.14 : 0;
    const breathe = reducedMotion ? 0 : Math.sin(t * 0.8 + index * 0.9) * 0.018;

    group.position.y = damp(group.position.y, targetY + lift + breathe, 6, delta);
    group.position.x = damp(group.position.x, active ? 0.22 : 0, 5, delta);

    const sincePulse = t - s.pulseAt;
    const pulse =
      sincePulse >= 0 && sincePulse < 1.4
        ? Math.max(0, Math.sin(((sincePulse - index * 0.09) / 1.1) * Math.PI))
        : 0;

    const glowTarget = (active ? 0.85 : inStory ? 0.04 : 0.1) + pulse * 0.7;
    glass.emissiveIntensity = damp(glass.emissiveIntensity, glowTarget, 5, delta);
    glass.opacity = intro * (inStory && !active ? 0.34 : index === 0 ? 0.62 : 0.5);
  });

  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      <RoundedBox
        args={[PLATE_SIZE, PLATE_THICKNESS, PLATE_SIZE]}
        radius={0.045}
        smoothness={3}
        material={glass}
      />
    </group>
  );
}

/** Shared studio rig: key, cool rim, and a locally generated environment. */
export function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#c9d6f0" />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[5, 2, -4]} intensity={1.6} color="#7fa6ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#afc8ff" position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.8} color="#4f82ff" position={[5, -1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1} color="#d6e4ff" position={[0, 0, 6]} scale={4} />
      </Environment>
    </>
  );
}

/* Stamps activation pulses with the scene clock. Mounted first so every
   consumer sees the new pulse on the same frame. */
function PulseClock({ signals }: { signals: RefObject<StageSignals> }) {
  const seen = useRef(signals.current.pulseId);

  useFrame((state) => {
    const s = signals.current;

    if (s.pulseId !== seen.current) {
      seen.current = s.pulseId;
      s.pulseAt = state.clock.elapsedTime;
    }
  });

  return null;
}

/* -------------------------------------------------------------------------
   Scene
------------------------------------------------------------------------- */

export default function StageScene({
  signals,
  cursor,
  waveSignal,
  reducedMotion,
  hovered,
  onHoverChange,
  onActivate,
}: StageSceneProps) {
  const { camera, viewport, size } = useThree();

  const stageRef = useRef<THREE.Group | null>(null);
  const unitRef = useRef<THREE.Group | null>(null);
  const underLightRef = useRef<THREE.PointLight | null>(null);
  const hoverRef = useRef(0);

  // The unit reads these as world-unit offsets; the stage owns placement.
  const unitX = useMemo(() => motionValue(0), []);
  const unitY = useMemo(() => motionValue(0), []);
  const unitScale = useMemo(() => motionValue(1), []);

  const lookTarget = useMemo(() => new THREE.Vector3(0, -0.6, 0), []);

  useEffect(() => {
    hoverRef.current = hovered ? 1 : 0;
  }, [hovered]);

  useFrame((state, delta) => {
    const stage = stageRef.current;
    const unit = unitRef.current;

    if (!stage || !unit) {
      return;
    }

    const s = signals.current;
    const t = state.clock.elapsedTime;
    const wide = size.width >= 1080;
    const inStory = s.layer >= 0;

    // Composition: beside the copy (this stage only mounts on landscape screens).
    const baseX = viewport.width * 0.22;
    const baseY = 0;
    const baseScale = wide ? 1 : 0.78;

    stage.position.x = damp(stage.position.x, baseX, 4, delta);
    stage.position.y = damp(stage.position.y, baseY, 3, delta);
    stage.scale.setScalar(damp(stage.scale.x || baseScale, baseScale * (inStory ? 0.86 : 1), 4, delta));

    // Yaw follows scroll, with a little pointer parallax on top.
    const pointerYaw = cursor.current.active && !reducedMotion ? cursor.current.x * 0.12 : 0;
    const pointerPitch = cursor.current.active && !reducedMotion ? -cursor.current.y * 0.04 : 0;
    const scrollYaw = reducedMotion ? 0 : -0.45 + s.progress * 1.25;
    stage.rotation.y = damp(stage.rotation.y, scrollYaw + pointerYaw, 3, delta);
    stage.rotation.x = damp(stage.rotation.x, pointerPitch, 3, delta);

    // Entrance: the unit descends into place, then hovers.
    const intro = reducedMotion ? 1 : easeOutExpo(Math.min(1, Math.max(0, (t - 0.5) / 2)));
    const hoverLift = hoverRef.current * 0.08;
    unit.position.y = damp(unit.position.y, 0.32 + (1 - intro) * 1.2 + hoverLift, 6, delta);
    unit.scale.setScalar((0.86 + intro * 0.14) * 0.8);
    // Faces the visitor head-on; the plates beneath keep their angled view.
    unit.rotation.y = damp(unit.rotation.y, -stage.rotation.y, 4, delta);

    if (underLightRef.current) {
      const sincePulse = t - s.pulseAt;
      const pulse = sincePulse >= 0 && sincePulse < 1.2 ? 1 - sincePulse / 1.2 : 0;
      underLightRef.current.intensity = damp(
        underLightRef.current.intensity,
        6 + hoverRef.current * 8 + pulse * 26,
        6,
        delta
      );
    }

    // Camera rises to look down the stack while the layers are being told.
    const lookDown = inStory;
    const camY = lookDown ? 2.6 : 1.3 + Math.min(s.progress, 0.3) * 2;
    camera.position.y = damp(camera.position.y, camY, 2.4, delta);
    camera.position.z = damp(camera.position.z, inStory ? 13.6 : 12.6, 2.4, delta);
    lookTarget.y = damp(lookTarget.y, lookDown ? -1.05 : -0.45, 2.4, delta);
    camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
  });

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverChange(true);
  };

  const handleOut = () => onHoverChange(false);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onActivate();
  };

  return (
    <>
      <PulseClock signals={signals} />
      <StudioLighting />
      <pointLight
        ref={underLightRef}
        position={[0, -1.1, 0.6]}
        intensity={6}
        distance={6}
        color="#4f82ff"
      />

      <group ref={stageRef}>
        {[0, 1, 2, 3].map((index) => (
          <GlassPlate
            key={index}
            index={index}
            signals={signals}
            reducedMotion={reducedMotion}
          />
        ))}

        <group ref={unitRef} position={[0, 2, 0]}>
          <AurexisUnit
            cursor={cursor}
            x={unitX}
            y={unitY}
            scale={unitScale}
            reducedMotion={reducedMotion}
            paused={false}
            pose="idle"
            waveSignal={waveSignal}
            interactionActive={hovered}
            openingChat={false}
            pointTarget={null}
            intro="home"
          />

          {/* Generous invisible hit volume: stable hover/click on the unit only. */}
          <mesh
            onPointerOver={handleOver}
            onPointerOut={handleOut}
            onClick={handleClick}
            position={[0, 0, 0]}
          >
            <capsuleGeometry args={[0.95, 1.1, 4, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
        </group>
      </group>
    </>
  );
}
