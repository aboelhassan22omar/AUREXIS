"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { motionValue, useReducedMotion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";

import "@/components/stage/quietClock";
import AurexisUnit from "@/components/stage/AurexisUnit";
import { StudioLighting } from "@/components/stage/StageScene";
import type { CursorDirection } from "@/components/stage/stage.types";

export type UnitShowcaseProps = {
  /** Bump to make the unit wave (e.g. on a route change). */
  waveSignal?: number;
  /** Pose the camera slightly lower for tall placements. */
  framing?: "standard" | "tall";
  onReady?: () => void;
};

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

/* Lit glass pedestal the unit hovers above. */
function Pedestal({
  energy,
}: {
  energy: RefObject<number>;
}) {
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#aec6ff"),
        transparent: true,
        opacity: 0.42,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.6,
        depthWrite: false,
      }),
    []
  );
  const rim = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#7fa6ff"),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  );
  const glow = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uEnergy: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uEnergy;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = pow(1.0 - smoothstep(0.0, 1.0, d), 2.2) * (0.28 + uEnergy * 0.5);
            gl_FragColor = vec4(vec3(0.24, 0.42, 1.0), a);
          }
        `,
      }),
    []
  );

  useEffect(
    () => () => {
      glass.dispose();
      rim.dispose();
      glow.dispose();
    },
    [glass, rim, glow]
  );

  useFrame((_, delta) => {
    const e = energy.current;
    rim.opacity = damp(rim.opacity, 0.45 + e * 0.55, 6, delta);
    glow.uniforms.uEnergy.value = damp(glow.uniforms.uEnergy.value as number, e, 6, delta);
  });

  return (
    <group position={[0, -1.32, 0]}>
      <mesh material={glass}>
        <cylinderGeometry args={[1.25, 1.32, 0.09, 96]} />
      </mesh>
      <mesh material={rim} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.31, 0.012, 8, 128]} />
      </mesh>
      <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.047, 0]}>
        <ringGeometry args={[0.92, 0.935, 96]} />
      </mesh>
      <mesh material={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[5, 5]} />
      </mesh>
    </group>
  );
}

function ShowcaseScene({
  cursor,
  waveSignal,
  reducedMotion,
  hovered,
  pulse,
  framing,
  onHover,
  onActivate,
}: {
  cursor: RefObject<CursorDirection>;
  waveSignal: number;
  reducedMotion: boolean;
  hovered: boolean;
  pulse: number;
  framing: "standard" | "tall";
  onHover: (value: boolean) => void;
  onActivate: () => void;
}) {
  const unitRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const energy = useRef(0);
  const pulseAt = useRef(-10);
  const seenPulse = useRef(pulse);

  const x = useMemo(() => motionValue(0), []);
  const y = useMemo(() => motionValue(0), []);
  const scale = useMemo(() => motionValue(1), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (pulse !== seenPulse.current) {
      seenPulse.current = pulse;
      pulseAt.current = t;
    }

    const since = t - pulseAt.current;
    const burst = since >= 0 && since < 1.3 ? 1 - since / 1.3 : 0;
    energy.current = Math.min(1, (hovered ? 0.55 : 0) + burst);

    const unit = unitRef.current;

    if (unit) {
      const intro = reducedMotion ? 1 : 1 - Math.pow(2, -10 * Math.min(1, t / 1.8));
      const yaw = cursor.current.active && !reducedMotion ? cursor.current.x * 0.35 : 0;
      unit.position.y = damp(unit.position.y, 0.18 + (1 - intro) * 0.9 + (hovered ? 0.07 : 0), 6, delta);
      unit.rotation.y = damp(unit.rotation.y, yaw, 4, delta);
      unit.scale.setScalar(0.9 + intro * 0.1);
    }

    if (lightRef.current) {
      lightRef.current.intensity = damp(lightRef.current.intensity, 5 + energy.current * 22, 6, delta);
    }

    const camY = framing === "tall" ? 0.15 : 0.35;
    state.camera.position.y = damp(state.camera.position.y, camY + (cursor.current.active ? cursor.current.y * 0.25 : 0), 3, delta);
    state.camera.lookAt(0, -0.25, 0);
  });

  return (
    <>
      <StudioLighting />
      <pointLight ref={lightRef} position={[0, -0.9, 0.8]} intensity={5} distance={5} color="#4f82ff" />

      <Pedestal energy={energy} />

      <group ref={unitRef} position={[0, 1.2, 0]}>
        <AurexisUnit
          cursor={cursor}
          x={x}
          y={y}
          scale={scale}
          reducedMotion={reducedMotion}
          paused={false}
          pose="idle"
          waveSignal={waveSignal}
          interactionActive={hovered}
          openingChat={false}
          pointTarget={null}
        />
        <mesh
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHover(true);
          }}
          onPointerOut={() => onHover(false)}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onActivate();
          }}
        >
          <capsuleGeometry args={[0.95, 1.1, 4, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </group>
    </>
  );
}

/**
 * The Aurexis Unit on its own pedestal. Follows the cursor, glows on hover,
 * waves and pulses on click. It never opens the assistant.
 */
export default function UnitShowcase({
  waveSignal = 0,
  framing = "standard",
  onReady,
}: UnitShowcaseProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<CursorDirection>({ x: 0, y: 0, active: false });
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const element = wrapperRef.current;

    if (!element) {
      return;
    }

    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { rootMargin: "100px 0px" }
    );

    observer.observe(element);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      return;
    }

    let frame = 0;
    let px = 0;
    let py = 0;

    const update = () => {
      frame = 0;
      const element = wrapperRef.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.42;
      cursorRef.current.x = THREE.MathUtils.clamp((px - cx) / Math.max(220, rect.width * 0.8), -1, 1);
      cursorRef.current.y = THREE.MathUtils.clamp((cy - py) / Math.max(200, rect.height * 0.8), -1, 1);
      cursorRef.current.active = true;
    };

    const onMove = (event: PointerEvent) => {
      px = event.clientX;
      py = event.clientY;

      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`ax-unit-canvas${hovered ? " is-hovered" : ""}`}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ fov: 30, position: [0, 0.35, 8.6], near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          onReady?.();
        }}
        style={{ width: "100%", height: "100%", background: "transparent", touchAction: "pan-y" }}
      >
        <ShowcaseScene
          cursor={cursorRef}
          waveSignal={waveSignal + clicks}
          reducedMotion={reducedMotion}
          hovered={hovered}
          pulse={clicks}
          framing={framing}
          onHover={setHovered}
          onActivate={() => setClicks((count) => count + 1)}
        />
      </Canvas>
    </div>
  );
}
