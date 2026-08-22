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
  openingChat: boolean;
  pointTarget: RobotPointTarget | null;
};

type RobotMaterials = {
  shell: THREE.MeshPhysicalMaterial;
  shellSecondary: THREE.MeshPhysicalMaterial;
  face: THREE.MeshPhysicalMaterial;
  darkMetal: THREE.MeshPhysicalMaterial;
  navyDetail: THREE.MeshStandardMaterial;
  eye: THREE.MeshBasicMaterial;
  eyeGlow: THREE.MeshBasicMaterial;
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
const RETURN_TO_REST_MAX_DURATION = 0.8;
const ARM_REST_EPSILON = 0.002;
const ARM_REST_POSE = Object.freeze({
  shoulderAnchor: Object.freeze({
    x: 1.14,
    y: -1.32,
    z: -0.12,
  }),
  leftShoulder: -0.08,
  leftForearm: 0,
  rightShoulder: 0.08,
  rightForearm: 0,
});

type IdleAction =
  | "none"
  | "glance-left"
  | "glance-right"
  | "head-tilt"
  | "nod"
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
      metalness: 0,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    darkMetal: new THREE.MeshPhysicalMaterial({
      color: ROBOT_NAVY.clone(),
      metalness: 0.6,
      roughness: 0.3,
      clearcoat: 0.32,
      clearcoatRoughness: 0.19,
    }),
    navyDetail: makeNavyDetail(),
    eye: new THREE.MeshBasicMaterial({
      color: ROBOT_WHITE.clone(),
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    }),
    eyeGlow: new THREE.MeshBasicMaterial({
      color: ROBOT_WHITE.clone(),
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
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
        renderOrder={10}
      >
        <shapeGeometry args={[shape, 30]} />
      </mesh>

      <mesh
        position={[0, 0, 0.012]}
        scale={[0.9, 0.88, 1]}
        material={materials.eye}
        renderOrder={11}
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
  return (
    <group>
      <mesh
        position={[0, -0.04, 1.018]}
        material={materials.face}
        renderOrder={2}
      >
        <shapeGeometry args={[faceShape, 30]} />
      </mesh>

      <group ref={eyesRef} renderOrder={3}>
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
  const restPose =
    side === -1
      ? {
          shoulder: ARM_REST_POSE.leftShoulder,
          forearm: ARM_REST_POSE.leftForearm,
        }
      : {
          shoulder: ARM_REST_POSE.rightShoulder,
          forearm: ARM_REST_POSE.rightForearm,
        };

  return (
    <group
      ref={shoulderRef}
      position={[
        side * ARM_REST_POSE.shoulderAnchor.x,
        ARM_REST_POSE.shoulderAnchor.y,
        ARM_REST_POSE.shoulderAnchor.z,
      ]}
      rotation={[0, 0, restPose.shoulder]}
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
        rotation={[0, 0, restPose.forearm]}
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
  openingChat,
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
  const blinkStartRef = useRef(-1);
  const manualWaveUntilRef = useRef(0);
  const manualWaveStartRef = useRef(0);
  const manualWaveSideRef = useRef<-1 | 1>(-1);
  const animationStateRef =
    useRef<RobotAnimationState>("idle");
  const returnToRestStartedRef = useRef(0);
  const idleActionRef =
    useRef<IdleAction>("none");
  const idleActionEndRef = useRef(0);
  const idleActionStartRef = useRef(0);
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
      if (eyesRef.current) eyesRef.current.scale.y = 1;
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
    manualWaveStartRef.current = performance.now();
    manualWaveUntilRef.current =
      performance.now() + 1800;
  }, [waveSignal]);

  useEffect(() => {
    if (!paused && !reducedMotion) {
      return;
    }

    blinkStartRef.current = -1;
    animationStateRef.current = 'idle';

    if (eyesRef.current) eyesRef.current.scale.y = 1;
    if (waveShoulderRef.current) waveShoulderRef.current.rotation.z = ARM_REST_POSE.leftShoulder;
    if (waveForearmRef.current) waveForearmRef.current.rotation.z = ARM_REST_POSE.leftForearm;
    if (rightShoulderRef.current) rightShoulderRef.current.rotation.z = ARM_REST_POSE.rightShoulder;
    if (rightForearmRef.current) rightForearmRef.current.rotation.z = ARM_REST_POSE.rightForearm;
  }, [paused, reducedMotion]);

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
    const pointerTracking =
      cursor.current.active &&
      !reducedMotion &&
      !paused;
    const messagePointing = pointTarget !== null;

    const blockingIdleAction =
      messagePointing ||
      manualWave ||
      openingChat ||
      interactionActive;

    if (
      !reducedMotion &&
      !paused &&
      !blockingIdleAction
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
        const choice = Math.floor(Math.random() * 6);

        idleActionRef.current =
          choice === 0
            ? "glance-left"
            : choice === 1
              ? "glance-right"
              : choice === 2 || choice === 3
                ? "head-tilt"
                : choice === 4
                  ? "nod"
                  : "soft-wave";
        idleActionStartRef.current = t;
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
    } else if (blockingIdleAction) {
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
      !blockingIdleAction &&
      !reducedMotion &&
      !paused;
    const waving =
      !reducedMotion &&
      !paused &&
      (manualWave || idleSoftWave);

    let desiredAnimationState: RobotAnimationState = "idle";

    if (messagePointing) {
      desiredAnimationState = "showingMessage";
    } else if (openingChat) {
      desiredAnimationState = "openingChat";
    } else if (waving) {
      desiredAnimationState = "waving";
    } else if (interactionActive) {
      desiredAnimationState = "listening";
    } else if (pointerTracking) {
      desiredAnimationState = "trackingPointer";
    }

    const previousAnimationState =
      animationStateRef.current;
    const canInterruptReturn =
      messagePointing || openingChat || manualWave;
    const previousUsedArms =
      previousAnimationState === "showingMessage" ||
      previousAnimationState === "pointing" ||
      previousAnimationState === "waving" ||
      previousAnimationState === "welcoming" ||
      previousAnimationState === "openingChat";

    if (
      previousAnimationState === "returningToRest" &&
      !canInterruptReturn
    ) {
      animationStateRef.current = "returningToRest";
    } else if (
      previousUsedArms &&
      desiredAnimationState !== "showingMessage" &&
      desiredAnimationState !== "waving" &&
      desiredAnimationState !== "openingChat"
    ) {
      animationStateRef.current = "returningToRest";
      returnToRestStartedRef.current = t;
    } else {
      animationStateRef.current = desiredAnimationState;
    }

    const returningToRest =
      animationStateRef.current === "returningToRest";

    let idleHeadYaw = 0;
    let idleHeadPitch = 0;
    let idleHeadRoll = 0;

    if (
      !blockingIdleAction &&
      !pointerTracking &&
      !returningToRest &&
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
      } else if (idleAction === "nod") {
        const nodProgress = THREE.MathUtils.clamp(
          (t - idleActionStartRef.current) /
            Math.max(idleActionEndRef.current - idleActionStartRef.current, 0.001),
          0,
          1
        );
        idleHeadPitch = Math.sin(nodProgress * Math.PI * 2) * 0.085;
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
      } else if (openingChat) {
        targetPitch = 0.12;
        targetRoll = Math.sin(t * 9) * 0.018;
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

        if (interactionActive) {
          targetPitch += 0.035;
          targetRoll = THREE.MathUtils.clamp(
            -cursor.current.x * 0.055,
            -0.055,
            0.055
          );
        }
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
        blinkStartRef.current = t;
        nextBlinkRef.current =
          t + 3.1 + Math.random() * 3.9;
      }

      const blinkElapsed = t - blinkStartRef.current;
      const blinkActive =
        !reducedMotion && !paused &&
        blinkStartRef.current >= 0 && blinkElapsed < 0.18;
      const blink = blinkActive
        ? blinkElapsed < 0.065
          ? THREE.MathUtils.lerp(1, 0.08, blinkElapsed / 0.065)
          : blinkElapsed < 0.09
            ? 0.08
            : THREE.MathUtils.lerp(0.08, 1, (blinkElapsed - 0.09) / 0.09)
        : 1;

      if (!blinkActive) {
        blinkStartRef.current = -1;
        eyesRef.current.scale.y = 1;
      }
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

      if (blinkActive) {
        eyesRef.current.scale.y = blink;
      }
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
      reducedMotion || paused || returningToRest
        ? 0
        : Math.sin(t * 0.92) * 0.012;

    let leftShoulderTarget = ARM_REST_POSE.leftShoulder - armIdleSway;
    let leftForearmTarget = ARM_REST_POSE.leftForearm - armIdleSway * 0.45;
    let rightShoulderTarget = ARM_REST_POSE.rightShoulder + armIdleSway;
    let rightForearmTarget = ARM_REST_POSE.rightForearm + armIdleSway * 0.45;

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
        leftShoulderTarget =
          ARM_REST_POSE.leftShoulder - pointAngle;
        leftForearmTarget =
          ARM_REST_POSE.leftForearm - 0.1;
      } else {
        rightShoulderTarget =
          ARM_REST_POSE.rightShoulder + pointAngle;
        rightForearmTarget =
          ARM_REST_POSE.rightForearm + 0.1;
      }
    } else if (waving) {
      const waveSide = manualWave
        ? manualWaveSideRef.current
        : idleSoftWave
          ? idleWaveSideRef.current
          : -1;
      const waveElapsed = manualWave
        ? Math.max(0, (performance.now() - manualWaveStartRef.current) / 1000)
        : Math.max(0, t - idleActionStartRef.current);
      const waveOscillation = Math.sin(waveElapsed * Math.PI * 3.2);
      const shoulderWaveOffset = 1.3 + waveOscillation * 0.08;
      const forearmWaveOffset = 0.12 + waveOscillation * 0.28;

      if (waveSide === -1) {
        leftShoulderTarget =
          ARM_REST_POSE.leftShoulder - shoulderWaveOffset;
        leftForearmTarget =
          ARM_REST_POSE.leftForearm - forearmWaveOffset;
      } else {
        rightShoulderTarget =
          ARM_REST_POSE.rightShoulder + shoulderWaveOffset;
        rightForearmTarget =
          ARM_REST_POSE.rightForearm + forearmWaveOffset;
      }
    } else if (openingChat && !reducedMotion && !paused) {
      leftShoulderTarget = ARM_REST_POSE.leftShoulder + 0.1;
      rightShoulderTarget = ARM_REST_POSE.rightShoulder - 0.1;
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

    if (
      waveShoulderRef.current && waveForearmRef.current &&
      rightShoulderRef.current && rightForearmRef.current &&
      (returningToRest || reducedMotion || paused)
    ) {
      const jointsAtRest =
        Math.abs(waveShoulderRef.current.rotation.z - ARM_REST_POSE.leftShoulder) < ARM_REST_EPSILON &&
        Math.abs(waveForearmRef.current.rotation.z - ARM_REST_POSE.leftForearm) < ARM_REST_EPSILON &&
        Math.abs(rightShoulderRef.current.rotation.z - ARM_REST_POSE.rightShoulder) < ARM_REST_EPSILON &&
        Math.abs(rightForearmRef.current.rotation.z - ARM_REST_POSE.rightForearm) < ARM_REST_EPSILON;
      const returnTimedOut =
        t - returnToRestStartedRef.current >= RETURN_TO_REST_MAX_DURATION;

      if (jointsAtRest || returnTimedOut || reducedMotion || paused) {
        waveShoulderRef.current.rotation.z = ARM_REST_POSE.leftShoulder;
        waveForearmRef.current.rotation.z = ARM_REST_POSE.leftForearm;
        rightShoulderRef.current.rotation.z = ARM_REST_POSE.rightShoulder;
        rightForearmRef.current.rotation.z = ARM_REST_POSE.rightForearm;
        animationStateRef.current = interactionActive
          ? 'listening'
          : pointerTracking
            ? 'trackingPointer'
            : 'idle';
      }
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
