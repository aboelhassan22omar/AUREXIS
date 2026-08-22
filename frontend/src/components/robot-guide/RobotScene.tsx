"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import type {
  CursorDirection,
  RobotAnimationState,
  RobotPointTarget,
  RobotPose,
} from "@/components/robot-guide/robot-guide.types";

type RobotSceneProps = {
  cursor: RefObject<CursorDirection>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  reducedMotion: boolean;
  paused: boolean;
  pose: RobotPose;
  waveSignal: number;
  interactionActive: boolean;
  pointTarget: RobotPointTarget | null;
};

type RobotMaterials = {
  shell: THREE.MeshPhysicalMaterial;
  shellSecondary: THREE.MeshPhysicalMaterial;
  face: THREE.MeshPhysicalMaterial;
  darkMetal: THREE.MeshPhysicalMaterial;
  navyDetail: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial;
  eyeGlow: THREE.MeshStandardMaterial;
  seam: THREE.MeshStandardMaterial;
  reflection: THREE.MeshBasicMaterial;
  antenna: THREE.MeshPhysicalMaterial;
};

const BASE_ROBOT_SCALE = 0.5;
const REFERENCE_FULL_HEIGHT = 5.7;
const HEAD_YAW_LIMIT = THREE.MathUtils.degToRad(34);
const HEAD_PITCH_LIMIT = THREE.MathUtils.degToRad(19);
const HEAD_TRACKING_DAMPING = 6.5;
const IDLE_ACTION_MIN_DELAY = 8;
const IDLE_ACTION_MAX_DELAY = 15;
const RETURN_TO_IDLE_DURATION = 0.55;

type IdleAction =
  | "none"
  | "glance-left"
  | "glance-right"
  | "head-tilt"
  | "soft-wave";

/*
 * The robot palette is intentionally self-contained and neutral.
 * It does not read AUREXIS theme variables, page colors, or Light/Dark mode.
 * This guarantees the same silver / white / navy identity everywhere.
 */
const ROBOT_SILVER = new THREE.Color("#B8C0CA");
const ROBOT_SILVER_HIGHLIGHT = new THREE.Color("#D8DEE5");
const ROBOT_FACE = new THREE.Color("#02060B");
const ROBOT_NAVY = new THREE.Color("#07152E");
const ROBOT_WHITE = new THREE.Color("#FFFFFF");

function damp(
  current: number,
  target: number,
  speed: number,
  delta: number
) {
  return THREE.MathUtils.lerp(
    current,
    target,
    1 - Math.exp(-speed * delta)
  );
}

function createRobotMaterials(): RobotMaterials {
  const makeNavyDetail = () =>
    new THREE.MeshStandardMaterial({
      color: ROBOT_NAVY.clone(),
      emissive: ROBOT_NAVY.clone(),
      emissiveIntensity: 0.015,
      metalness: 0.58,
      roughness: 0.32,
    });

  return {
    shell: new THREE.MeshPhysicalMaterial({
      color: ROBOT_SILVER.clone(),
      metalness: 0.78,
      roughness: 0.27,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      reflectivity: 0.72,
    }),
    shellSecondary: new THREE.MeshPhysicalMaterial({
      color: ROBOT_SILVER_HIGHLIGHT.clone(),
      metalness: 0.82,
      roughness: 0.22,
      clearcoat: 0.28,
      clearcoatRoughness: 0.17,
      reflectivity: 0.76,
    }),
    face: new THREE.MeshPhysicalMaterial({
      color: ROBOT_FACE.clone(),
      metalness: 0.22,
      roughness: 0.13,
      clearcoat: 0.78,
      clearcoatRoughness: 0.055,
    }),
    darkMetal: new THREE.MeshPhysicalMaterial({
      color: ROBOT_NAVY.clone(),
      metalness: 0.6,
      roughness: 0.3,
      clearcoat: 0.32,
      clearcoatRoughness: 0.19,
    }),
    navyDetail: makeNavyDetail(),
    eye: new THREE.MeshStandardMaterial({
      color: ROBOT_WHITE.clone(),
      emissive: ROBOT_WHITE.clone(),
      emissiveIntensity: 1.25,
      metalness: 0.02,
      roughness: 0.2,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
    eyeGlow: new THREE.MeshStandardMaterial({
      color: ROBOT_WHITE.clone(),
      emissive: ROBOT_WHITE.clone(),
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
    seam: new THREE.MeshStandardMaterial({
      color: ROBOT_NAVY.clone(),
      metalness: 0.5,
      roughness: 0.34,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
    reflection: new THREE.MeshBasicMaterial({
      color: ROBOT_WHITE.clone(),
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
    antenna: new THREE.MeshPhysicalMaterial({
      color: ROBOT_SILVER_HIGHLIGHT.clone(),
      metalness: 0.78,
      roughness: 0.24,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.26,
      clearcoatRoughness: 0.18,
    }),
  };
}

function createFaceShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.04, 0.38);
  shape.lineTo(1.04, 0.38);
  shape.lineTo(0.86, -0.44);
  shape.lineTo(0, -0.68);
  shape.lineTo(-0.86, -0.44);
  shape.closePath();
  return shape;
}

function createEyeShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.34, 0.11);
  shape.quadraticCurveTo(
    -0.05,
    0.2,
    0.31,
    0.08
  );
  shape.lineTo(0.2, -0.17);
  shape.quadraticCurveTo(
    -0.06,
    -0.22,
    -0.31,
    -0.11
  );
  shape.closePath();
  return shape;
}

function Eye({
  side,
  materials,
}: {
  side: -1 | 1;
  materials: RobotMaterials;
}) {
  const shape = useMemo(
    () => createEyeShape(),
    []
  );

  return (
    <group
      position={[
        side * 0.43,
        -0.08,
        1.075,
      ]}
      scale={[
        side === 1 ? -1 : 1,
        1,
        1,
      ]}
    >
      <mesh
        scale={[1.12, 1.18, 1]}
        material={materials.eyeGlow}
      >
        <shapeGeometry args={[shape, 30]} />
      </mesh>

      <mesh
        position={[0, 0, 0.012]}
        scale={[0.9, 0.88, 1]}
        material={materials.eye}
      >
        <shapeGeometry args={[shape, 30]} />
      </mesh>
    </group>
  );
}

function FacePanel({
  materials,
  eyesRef,
}: {
  materials: RobotMaterials;
  eyesRef: RefObject<THREE.Group | null>;
}) {
  const faceShape = useMemo(
    () => createFaceShape(),
    []
  );

  const grooves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const y = 0.26 - index * 0.105;
        const width = 1.72 - index * 0.035;
        return { y, width };
      }),
    []
  );

  return (
    <group>
      <mesh
        position={[0, -0.04, 0.995]}
        scale={[1.055, 1.055, 1]}
        material={materials.shellSecondary}
      >
        <shapeGeometry args={[faceShape, 30]} />
      </mesh>

      <mesh
        position={[0, -0.04, 1.018]}
        material={materials.face}
      >
        <shapeGeometry args={[faceShape, 30]} />
      </mesh>

      {grooves.map(({ y, width }, index) => (
        <RoundedBox
          key={index}
          args={[width, 0.018, 0.014]}
          radius={0.008}
          smoothness={4}
          position={[
            0,
            y - 0.04,
            1.032,
          ]}
          material={materials.seam}
        />
      ))}

      <group ref={eyesRef}>
        <Eye
          side={-1}
          materials={materials}
        />
        <Eye
          side={1}
          materials={materials}
        />
      </group>
    </group>
  );
}

function PanelSeams({
  materials,
}: {
  materials: RobotMaterials;
}) {
  const curves = useMemo(
    () => [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.12, 0.5),
        new THREE.Vector3(0, 0.83, 0.82),
        new THREE.Vector3(0, 0.55, 0.94),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.78, 0.96, 0.73),
        new THREE.Vector3(-0.66, 0.48, 0.95),
        new THREE.Vector3(-0.77, -0.68, 0.81),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.78, 0.96, 0.73),
        new THREE.Vector3(0.66, 0.48, 0.95),
        new THREE.Vector3(0.77, -0.68, 0.81),
      ]),
    ],
    []
  );

  return (
    <>
      {curves.map((curve, index) => (
        <mesh
          key={index}
          material={materials.seam}
        >
          <tubeGeometry
            args={[
              curve,
              32,
              0.014,
              8,
              false,
            ]}
          />
        </mesh>
      ))}

      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          position={[
            side * 0.96,
            0.2,
            0.91,
          ]}
          scale={[0.045, 0.045, 0.026]}
          material={materials.darkMetal}
        >
          <sphereGeometry args={[1, 18, 14]} />
        </mesh>
      ))}
    </>
  );
}

function Antenna({
  side,
  materials,
  antennaRef,
}: {
  side: -1 | 1;
  materials: RobotMaterials;
  antennaRef: RefObject<THREE.Group | null>;
}) {
  return (
    <group
      ref={antennaRef}
      position={[side * 1.39, 0.02, -0.02]}
    >
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={materials.shellSecondary}
      >
        <cylinderGeometry
          args={[0.16, 0.16, 0.2, 28]}
        />
      </mesh>

      <mesh
        position={[side * 0.045, 1.25, 0]}
        material={materials.antenna}
      >
        <cylinderGeometry
          args={[0.035, 0.045, 2.5, 20]}
        />
      </mesh>

      {[2.1, 2.25, 2.4].map((height, index) => (
        <group
          key={height}
          position={[side * 0.045, height, 0]}
        >
          <mesh
            material={materials.navyDetail}
          >
            <sphereGeometry
              args={[
                0.055 - index * 0.004,
                20,
                16,
              ]}
            />
          </mesh>
          <mesh
            position={[0, 0, -0.002]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.shellSecondary}
          >
            <torusGeometry
              args={[0.065, 0.008, 8, 24]}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Head({
  materials,
  headRef,
  headCoreRef,
  eyesRef,
  leftAntennaRef,
  rightAntennaRef,
}: {
  materials: RobotMaterials;
  headRef: RefObject<THREE.Group | null>;
  headCoreRef: RefObject<THREE.Group | null>;
  eyesRef: RefObject<THREE.Group | null>;
  leftAntennaRef: RefObject<THREE.Group | null>;
  rightAntennaRef: RefObject<THREE.Group | null>;
}) {
  return (
    <group ref={headRef} position={[0, 0.84, 0]}>
      <group ref={headCoreRef}>
        <mesh
          scale={[1.36, 1.23, 1]}
          material={materials.shell}
        >
          <sphereGeometry args={[1, 64, 48]} />
        </mesh>

        <mesh
          position={[0, -0.58, 0.03]}
          scale={[1.03, 0.65, 0.87]}
          material={materials.shellSecondary}
        >
          <sphereGeometry args={[1, 56, 40]} />
        </mesh>

        <PanelSeams materials={materials} />
        <FacePanel
          materials={materials}
          eyesRef={eyesRef}
        />

        <RoundedBox
          args={[0.66, 0.05, 0.2]}
          radius={0.025}
          smoothness={6}
          position={[0, 1.215, 0.08]}
          material={materials.navyDetail}
        />

        <mesh
          position={[-0.72, 0.82, 0.82]}
          scale={[0.24, 0.08, 0.025]}
          rotation={[0, 0, -0.35]}
          material={materials.reflection}
        >
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
      </group>

      <Antenna
        side={-1}
        materials={materials}
        antennaRef={leftAntennaRef}
      />
      <Antenna
        side={1}
        materials={materials}
        antennaRef={rightAntennaRef}
      />
    </group>
  );
}

function Body({
  materials,
  bodyRef,
}: {
  materials: RobotMaterials;
  bodyRef: RefObject<THREE.Group | null>;
}) {
  const profile = useMemo(
    () => [
      new THREE.Vector2(0.42, 1.08),
      new THREE.Vector2(0.72, 1.04),
      new THREE.Vector2(0.94, 0.88),
      new THREE.Vector2(1.02, 0.5),
      new THREE.Vector2(0.97, 0.08),
      new THREE.Vector2(0.82, -0.42),
      new THREE.Vector2(0.58, -0.82),
      new THREE.Vector2(0.32, -1.05),
      new THREE.Vector2(0.12, -1.13),
    ],
    []
  );

  const lowerSeam = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        Array.from({ length: 41 }, (_, index) => {
          const angle =
            (index / 40) * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(angle) * 0.66,
            -0.62,
            Math.sin(angle) * 0.5
          );
        }),
        true
      ),
    []
  );

  return (
    <group
      ref={bodyRef}
      position={[0, -1.72, 0]}
    >
      <mesh
        scale={[1, 1, 0.78]}
        material={materials.shell}
      >
        <latheGeometry args={[profile, 64]} />
      </mesh>

      <mesh
        material={materials.seam}
      >
        <tubeGeometry
          args={[
            lowerSeam,
            64,
            0.015,
            8,
            true,
          ]}
        />
      </mesh>

      <mesh
        position={[-0.35, 0.58, 0.72]}
        scale={[0.28, 0.09, 0.035]}
        rotation={[0, 0, -0.28]}
        material={materials.reflection}
      >
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  materials,
  shoulderRef,
  forearmRef,
}: {
  side: -1 | 1;
  materials: RobotMaterials;
  shoulderRef?: RefObject<THREE.Group | null>;
  forearmRef?: RefObject<THREE.Group | null>;
}) {
  return (
    <group
      ref={shoulderRef}
      position={[side * 0.98, -1.32, 0.02]}
      rotation={[0, 0, side * -0.18]}
    >
      {/* Navy shoulder pivot sits slightly inside the torso so the arm never looks detached. */}
      <mesh
        position={[side * -0.015, 0, 0]}
        scale={[0.27, 0.27, 0.25]}
        material={materials.darkMetal}
      >
        <sphereGeometry args={[1, 36, 28]} />
      </mesh>

      {/* Smooth abstract upper-arm shell: compact, rounded and fully metallic silver. */}
      <RoundedBox
        args={[0.44, 0.6, 0.4]}
        radius={0.19}
        smoothness={8}
        position={[side * 0.055, -0.29, 0]}
        rotation={[0, 0, side * 0.035]}
        material={materials.shell}
      />

      <mesh
        position={[side * -0.055, -0.16, 0.19]}
        scale={[0.1, 0.19, 0.025]}
        rotation={[0, 0, side * -0.08]}
        material={materials.reflection}
      >
        <sphereGeometry args={[1, 18, 14]} />
      </mesh>

      <group
        ref={forearmRef}
        position={[side * 0.07, -0.54, 0]}
      >
        {/* Thin navy wrist seam is the only colored break between the silver shells. */}
        <mesh
          position={[0, -0.02, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.darkMetal}
        >
          <torusGeometry
            args={[0.175, 0.022, 10, 36]}
          />
        </mesh>

        <RoundedBox
          args={[0.34, 0.43, 0.32]}
          radius={0.15}
          smoothness={8}
          position={[0, -0.22, 0]}
          material={materials.shellSecondary}
        />

        {/* Rounded abstract glove/end-cap — deliberately no fingers or human hand shape. */}
        <mesh
          position={[0, -0.47, 0]}
          scale={[0.22, 0.21, 0.22]}
          material={materials.shell}
        >
          <sphereGeometry args={[1, 36, 28]} />
        </mesh>

        <mesh
          position={[0, -0.425, 0.195]}
          scale={[0.12, 0.035, 0.018]}
          material={materials.darkMetal}
        >
          <sphereGeometry args={[1, 18, 14]} />
        </mesh>
      </group>
    </group>
  );
}

function NeutralGroundGlow() {
  return (
    <mesh
      position={[0, -2.92, -0.8]}
      scale={[1.55, 0.34, 1]}
    >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float d = length(vec2(p.x, p.y * 2.15));
            float a = (1.0 - smoothstep(0.05, 1.0, d)) * 0.075;
            vec3 silver = vec3(0.78, 0.82, 0.87);
            gl_FragColor = vec4(silver, a);
          }
        `}
      />
    </mesh>
  );
}

function ChatBackGlow({
  materialRef,
}: {
  materialRef: RefObject<THREE.ShaderMaterial | null>;
}) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
    }),
    []
  );

  return (
    <mesh
      position={[0, -0.38, -1.55]}
      scale={[2.35, 2.95, 1]}
      renderOrder={-20}
      frustumCulled={false}
    >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthTest={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          varying vec2 vUv;

          void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float d = length(vec2(p.x * 0.9, p.y * 0.72));
            float halo = 1.0 - smoothstep(0.12, 1.0, d);
            halo *= halo;
            vec3 blue = vec3(0.145, 0.514, 1.0);
            gl_FragColor = vec4(blue, halo * uOpacity * 0.42);
          }
        `}
      />
    </mesh>
  );
}

function RobotLighting() {
  return (
    <>
      <ambientLight
        color="#D7DEE7"
        intensity={0.58}
      />
      <directionalLight
        color="#FFFFFF"
        position={[-3.6, 5.4, 5.8]}
        intensity={2.2}
      />
      <directionalLight
        color="#C7CFD9"
        position={[4.2, 1.5, 4.4]}
        intensity={0.72}
      />
      <pointLight
        color="#EDF2F7"
        position={[3.4, 1.8, -2.4]}
        intensity={1.85}
        distance={8}
      />
      <pointLight
        color="#FFFFFF"
        position={[-2.8, -1.2, 3.8]}
        intensity={0.45}
        distance={7}
      />
    </>
  );
}

function RobotModel({
  cursor,
  x,
  y,
  scale,
  reducedMotion,
  paused,
  pose,
  waveSignal,
  interactionActive,
  pointTarget,
}: RobotSceneProps) {
  const { size, viewport } = useThree();

  const rootRef =
    useRef<THREE.Group | null>(null);
  const centeringRef =
    useRef<THREE.Group | null>(null);
  const normalizedModelRef =
    useRef<THREE.Group | null>(null);
  const fullMeasureRef =
    useRef<THREE.Group | null>(null);
  const headRef =
    useRef<THREE.Group | null>(null);
  const headCoreRef =
    useRef<THREE.Group | null>(null);
  const bodyRef =
    useRef<THREE.Group | null>(null);
  const eyesRef =
    useRef<THREE.Group | null>(null);
  const leftAntennaRef =
    useRef<THREE.Group | null>(null);
  const rightAntennaRef =
    useRef<THREE.Group | null>(null);
  const waveShoulderRef =
    useRef<THREE.Group | null>(null);
  const waveForearmRef =
    useRef<THREE.Group | null>(null);
  const rightShoulderRef =
    useRef<THREE.Group | null>(null);
  const rightForearmRef =
    useRef<THREE.Group | null>(null);
  const chatHaloMaterialRef =
    useRef<THREE.ShaderMaterial | null>(null);

  const nextBlinkRef = useRef(2.7);
  const blinkEndRef = useRef(0);
  const manualWaveUntilRef = useRef(0);
  const manualWaveSideRef = useRef<-1 | 1>(-1);
  const animationStateRef =
    useRef<RobotAnimationState>("idle");
  const returnToIdleUntilRef = useRef(0);
  const idleActionRef =
    useRef<IdleAction>("none");
  const idleActionEndRef = useRef(0);
  const nextIdleActionRef = useRef(
    IDLE_ACTION_MIN_DELAY +
      Math.random() *
        (IDLE_ACTION_MAX_DELAY - IDLE_ACTION_MIN_DELAY)
  );
  const idleWaveSideRef = useRef<-1 | 1>(1);

  const materials = useMemo(
    () => createRobotMaterials(),
    []
  );

  useEffect(
    () => () => {
      Object.values(materials).forEach(
        (material) => material.dispose()
      );
    },
    [materials]
  );

  useLayoutEffect(() => {
    const centeringGroup =
      centeringRef.current;
    const normalizedModel =
      normalizedModelRef.current;
    const fullGroup =
      fullMeasureRef.current;
    const headCore =
      headCoreRef.current;
    const body = bodyRef.current;

    if (
      !centeringGroup ||
      !normalizedModel ||
      !fullGroup ||
      !headCore ||
      !body
    ) {
      return;
    }

    centeringGroup.position.set(0, 0, 0);
    normalizedModel.scale.setScalar(1);
    centeringGroup.updateWorldMatrix(true, true);
    fullGroup.updateWorldMatrix(true, true);

    const fullBox =
      new THREE.Box3().setFromObject(
        fullGroup
      );

    if (fullBox.isEmpty()) {
      return;
    }

    const fullSize = fullBox.getSize(
      new THREE.Vector3()
    );
    const normalizedScale =
      fullSize.y > 0
        ? REFERENCE_FULL_HEIGHT /
          fullSize.y
        : 1;

    normalizedModel.scale.setScalar(
      THREE.MathUtils.clamp(
        normalizedScale,
        0.82,
        1.06
      )
    );
    normalizedModel.updateWorldMatrix(
      true,
      true
    );
    headCore.updateWorldMatrix(true, true);
    body.updateWorldMatrix(true, true);

    // Antennas are intentionally excluded from the visual anchor so their
    // long height never pushes the head/body down inside existing stops.
    const primaryBox = new THREE.Box3();
    primaryBox.union(
      new THREE.Box3().setFromObject(
        headCore
      )
    );
    primaryBox.union(
      new THREE.Box3().setFromObject(body)
    );

    if (primaryBox.isEmpty()) {
      return;
    }

    const primaryCenterWorld =
      primaryBox.getCenter(
        new THREE.Vector3()
      );
    const primaryCenterLocal =
      centeringGroup.worldToLocal(
        primaryCenterWorld.clone()
      );

    centeringGroup.position.set(
      -primaryCenterLocal.x,
      -primaryCenterLocal.y,
      0
    );
    centeringGroup.updateMatrixWorld(true);
  }, []);

  useEffect(() => {
    if (waveSignal <= 0) {
      return;
    }

    manualWaveSideRef.current =
      manualWaveSideRef.current === -1 ? 1 : -1;
    manualWaveUntilRef.current =
      performance.now() + 1800;
  }, [waveSignal]);

  useFrame((state, delta) => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const t = state.clock.elapsedTime;
    const targetScreenX = x.get();
    const targetScreenY = y.get();
    const normalizedX =
      size.width > 0
        ? targetScreenX / size.width - 0.5
        : 0;
    const normalizedY =
      size.height > 0
        ? 0.5 - targetScreenY / size.height
        : 0;
    const worldX = normalizedX * viewport.width;
    const worldY = normalizedY * viewport.height;
    const floatOffset =
      reducedMotion || paused
        ? 0
        : Math.sin(t * 1.05) * 0.035;

    root.position.x = worldX;
    root.position.y = worldY + floatOffset;

    const targetScale =
      BASE_ROBOT_SCALE * scale.get();
    const currentScale =
      root.scale.x || targetScale;
    const nextScale = damp(
      currentScale,
      targetScale,
      7,
      delta
    );
    root.scale.setScalar(nextScale);

    const horizontalVelocity = x.getVelocity();
    const travelTilt =
      reducedMotion || paused
        ? 0
        : THREE.MathUtils.clamp(
            -horizontalVelocity / 12500,
            -0.045,
            0.045
          );

    root.rotation.z = damp(
      root.rotation.z,
      travelTilt +
        (reducedMotion || paused
          ? 0
          : Math.sin(t * 0.48) * 0.01),
      5,
      delta
    );
    root.rotation.y = damp(
      root.rotation.y,
      reducedMotion || paused
        ? 0
        : Math.sin(t * 0.34) * 0.006,
      4,
      delta
    );

    if (chatHaloMaterialRef.current) {
      const currentOpacity =
        chatHaloMaterialRef.current.uniforms.uOpacity
          .value as number;
      const targetOpacity =
        interactionActive && !paused ? 1 : 0;

      chatHaloMaterialRef.current.uniforms.uOpacity.value =
        reducedMotion
          ? targetOpacity
          : damp(
              currentOpacity,
              targetOpacity,
              9,
              delta
            );
    }

    const manualWave =
      performance.now() < manualWaveUntilRef.current;
    const automaticWave =
      pose === "wave" && t % 10 < 2.35;
    const stopPointing = pose === "point";
    const explainMotion = pose === "explain";
    const pointerTracking =
      cursor.current.active &&
      !reducedMotion &&
      !paused;
    const messagePointing = pointTarget !== null;

    const higherPriorityAction =
      messagePointing ||
      manualWave ||
      automaticWave ||
      interactionActive ||
      pointerTracking ||
      stopPointing ||
      explainMotion;

    if (
      !reducedMotion &&
      !paused &&
      !higherPriorityAction
    ) {
      if (
        idleActionRef.current !== "none" &&
        t >= idleActionEndRef.current
      ) {
        idleActionRef.current = "none";
        nextIdleActionRef.current =
          t +
          IDLE_ACTION_MIN_DELAY +
          Math.random() *
            (IDLE_ACTION_MAX_DELAY -
              IDLE_ACTION_MIN_DELAY);
      }

      if (
        idleActionRef.current === "none" &&
        t >= nextIdleActionRef.current
      ) {
        const choice = Math.floor(Math.random() * 5);

        idleActionRef.current =
          choice === 0
            ? "glance-left"
            : choice === 1
              ? "glance-right"
              : choice === 2 || choice === 3
                ? "head-tilt"
                : "soft-wave";
        idleActionEndRef.current =
          t +
          (idleActionRef.current === "soft-wave"
            ? 1.8
            : 1.45 + Math.random() * 0.65);

        if (idleActionRef.current === "soft-wave") {
          idleWaveSideRef.current =
            Math.random() > 0.5 ? 1 : -1;
        }
      }
    } else if (higherPriorityAction) {
      idleActionRef.current = "none";
      nextIdleActionRef.current =
        Math.max(
          nextIdleActionRef.current,
          t + IDLE_ACTION_MIN_DELAY
        );
    }

    const idleAction = idleActionRef.current;
    const idleSoftWave =
      idleAction === "soft-wave" &&
      !higherPriorityAction &&
      !reducedMotion &&
      !paused;
    const waving =
      !reducedMotion &&
      !paused &&
      (manualWave || automaticWave || idleSoftWave);

    let desiredAnimationState: RobotAnimationState = "idle";

    if (messagePointing) {
      desiredAnimationState = "showingMessage";
    } else if (stopPointing) {
      desiredAnimationState = "pointing";
    } else if (waving) {
      desiredAnimationState = "waving";
    } else if (interactionActive) {
      desiredAnimationState = "hovered";
    } else if (pointerTracking) {
      desiredAnimationState = "trackingPointer";
    }

    const previousAnimationState =
      animationStateRef.current;

    if (
      desiredAnimationState === "idle" &&
      previousAnimationState !== "idle" &&
      previousAnimationState !== "returningToIdle"
    ) {
      animationStateRef.current = "returningToIdle";
      returnToIdleUntilRef.current =
        t + RETURN_TO_IDLE_DURATION;
    } else if (
      previousAnimationState === "returningToIdle" &&
      t >= returnToIdleUntilRef.current
    ) {
      animationStateRef.current = "idle";
    } else if (desiredAnimationState !== "idle") {
      animationStateRef.current = desiredAnimationState;
    }

    let idleHeadYaw = 0;
    let idleHeadPitch = 0;
    let idleHeadRoll = 0;

    if (
      !higherPriorityAction &&
      !reducedMotion &&
      !paused
    ) {
      if (idleAction === "glance-left") {
        idleHeadYaw = -0.2;
      } else if (idleAction === "glance-right") {
        idleHeadYaw = 0.2;
      } else if (idleAction === "head-tilt") {
        idleHeadPitch = -0.055;
        idleHeadRoll = Math.sin(t * 1.4) * 0.045;
      }
    }

    if (headRef.current) {
      let targetYaw = idleHeadYaw;
      let targetPitch = idleHeadPitch;
      let targetRoll = idleHeadRoll;

      if (messagePointing && pointTarget) {
        targetYaw =
          pointTarget.side === "right" ? 0.24 : -0.24;
        targetPitch = THREE.MathUtils.clamp(
          -pointTarget.vertical * 0.13,
          -0.13,
          0.13
        );
      } else if (pointerTracking || interactionActive) {
        targetYaw = THREE.MathUtils.clamp(
          cursor.current.x * HEAD_YAW_LIMIT,
          -HEAD_YAW_LIMIT,
          HEAD_YAW_LIMIT
        );
        targetPitch = THREE.MathUtils.clamp(
          -cursor.current.y * HEAD_PITCH_LIMIT,
          -HEAD_PITCH_LIMIT,
          HEAD_PITCH_LIMIT
        );
      }

      if (reducedMotion || paused) {
        targetYaw = 0;
        targetPitch = 0;
        targetRoll = 0;
      }

      headRef.current.rotation.y = damp(
        headRef.current.rotation.y,
        targetYaw,
        HEAD_TRACKING_DAMPING,
        delta
      );
      headRef.current.rotation.x = damp(
        headRef.current.rotation.x,
        targetPitch,
        HEAD_TRACKING_DAMPING,
        delta
      );
      headRef.current.rotation.z = damp(
        headRef.current.rotation.z,
        targetRoll,
        5.2,
        delta
      );
    }

    if (bodyRef.current) {
      const breath =
        reducedMotion || paused
          ? 1
          : 1 + Math.sin(t * 1.45) * 0.004;

      bodyRef.current.scale.set(
        damp(
          bodyRef.current.scale.x,
          breath,
          4,
          delta
        ),
        damp(
          bodyRef.current.scale.y,
          breath,
          4,
          delta
        ),
        damp(
          bodyRef.current.scale.z,
          breath,
          4,
          delta
        )
      );
    }

    if (eyesRef.current) {
      if (
        !reducedMotion &&
        !paused &&
        t >= nextBlinkRef.current
      ) {
        blinkEndRef.current = t + 0.11;
        nextBlinkRef.current =
          t + 2.8 + Math.random() * 3.6;
      }

      const blink =
        !reducedMotion &&
        !paused &&
        t < blinkEndRef.current
          ? 0.08
          : 1;
      const eyeTrackX =
        pointerTracking || interactionActive
          ? THREE.MathUtils.clamp(
              cursor.current.x * 0.046,
              -0.046,
              0.046
            )
          : 0;
      const eyeTrackY =
        pointerTracking || interactionActive
          ? THREE.MathUtils.clamp(
              cursor.current.y * 0.028,
              -0.028,
              0.028
            )
          : 0;

      eyesRef.current.scale.y = damp(
        eyesRef.current.scale.y,
        blink,
        35,
        delta
      );
      eyesRef.current.position.x = damp(
        eyesRef.current.position.x,
        reducedMotion || paused ? 0 : eyeTrackX,
        8,
        delta
      );
      eyesRef.current.position.y = damp(
        eyesRef.current.position.y,
        reducedMotion || paused ? 0 : eyeTrackY,
        8,
        delta
      );
    }

    if (
      leftAntennaRef.current &&
      rightAntennaRef.current
    ) {
      const sway =
        reducedMotion || paused
          ? 0
          : Math.sin(t * 0.72) * 0.008;
      leftAntennaRef.current.rotation.z = damp(
        leftAntennaRef.current.rotation.z,
        sway,
        4,
        delta
      );
      rightAntennaRef.current.rotation.z = damp(
        rightAntennaRef.current.rotation.z,
        -sway,
        4,
        delta
      );
    }

    const armIdleSway =
      reducedMotion || paused
        ? 0
        : Math.sin(t * 0.92) * 0.012;

    let leftShoulderTarget = 0.18 + armIdleSway;
    let leftForearmTarget = armIdleSway * 0.45;
    let rightShoulderTarget = -0.18 - armIdleSway;
    let rightForearmTarget = -armIdleSway * 0.45;

    if (
      messagePointing &&
      pointTarget &&
      !reducedMotion &&
      !paused
    ) {
      const pointAngle =
        0.88 +
        THREE.MathUtils.clamp(
          pointTarget.vertical,
          -1,
          1
        ) * 0.33;

      if (pointTarget.side === "left") {
        leftShoulderTarget = -pointAngle;
        leftForearmTarget = -0.1;
      } else {
        rightShoulderTarget = pointAngle;
        rightForearmTarget = 0.1;
      }
    } else if (waving) {
      const waveSide = manualWave
        ? manualWaveSideRef.current
        : idleSoftWave
          ? idleWaveSideRef.current
          : -1;
      const shoulderWave =
        1.43 + Math.sin(t * 2.8) * 0.07;
      const forearmWave =
        0.12 + Math.sin(t * 5.2) * 0.14;

      if (waveSide === -1) {
        leftShoulderTarget = -shoulderWave;
        leftForearmTarget = -forearmWave;
      } else {
        rightShoulderTarget = shoulderWave;
        rightForearmTarget = forearmWave;
      }
    } else if (
      stopPointing &&
      !reducedMotion &&
      !paused
    ) {
      leftShoulderTarget = -0.9;
      leftForearmTarget = -0.08;
    } else if (
      explainMotion &&
      !reducedMotion &&
      !paused
    ) {
      leftShoulderTarget =
        -0.65 + Math.sin(t * 1.7) * 0.04;
      leftForearmTarget = -0.06;
    }

    if (
      waveShoulderRef.current &&
      waveForearmRef.current
    ) {
      waveShoulderRef.current.rotation.z = damp(
        waveShoulderRef.current.rotation.z,
        leftShoulderTarget,
        6.2,
        delta
      );
      waveForearmRef.current.rotation.z = damp(
        waveForearmRef.current.rotation.z,
        leftForearmTarget,
        6.8,
        delta
      );
    }

    if (
      rightShoulderRef.current &&
      rightForearmRef.current
    ) {
      rightShoulderRef.current.rotation.z = damp(
        rightShoulderRef.current.rotation.z,
        rightShoulderTarget,
        6.2,
        delta
      );
      rightForearmRef.current.rotation.z = damp(
        rightForearmRef.current.rotation.z,
        rightForearmTarget,
        6.8,
        delta
      );
    }
  });

  return (
    <group
      ref={rootRef}
      position={[0, 0, 0]}
      scale={BASE_ROBOT_SCALE}
    >
      <group ref={centeringRef}>
        <group ref={normalizedModelRef}>
          <NeutralGroundGlow />
          <ChatBackGlow
            materialRef={chatHaloMaterialRef}
          />

          <group ref={fullMeasureRef}>
            <Head
              materials={materials}
              headRef={headRef}
              headCoreRef={headCoreRef}
              eyesRef={eyesRef}
              leftAntennaRef={leftAntennaRef}
              rightAntennaRef={rightAntennaRef}
            />

            <Body
              materials={materials}
              bodyRef={bodyRef}
            />

            <Arm
              side={-1}
              materials={materials}
              shoulderRef={waveShoulderRef}
              forearmRef={waveForearmRef}
            />

            <Arm
              side={1}
              materials={materials}
              shoulderRef={rightShoulderRef}
              forearmRef={rightForearmRef}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

export default function RobotScene(
  props: RobotSceneProps
) {
  return (
    <>
      <RobotLighting />
      <RobotModel {...props} />
    </>
  );
}
