"use client";

import {
  type MutableRefObject,
} from "react";

import Robot3D from "./Robot3D";


type CursorPosition = {
  x: number;
  y: number;
};


type RobotSceneProps = {
  cursor: MutableRefObject<CursorPosition>;
};


export default function RobotScene({
  cursor,
}: RobotSceneProps) {
  return (
    <>
      <ambientLight
        intensity={1.5}
      />


      <hemisphereLight
        args={[
          "#fff8e9",
          "#121018",
          1.5,
        ]}
      />


      {/* main soft light */}

      <directionalLight
        position={[
          -3,
          5,
          6,
        ]}
        intensity={3}
        color="#ffffff"
      />


      {/* warm gold side light */}

      <directionalLight
        position={[
          4,
          2,
          5,
        ]}
        intensity={1.7}
        color="#f0c879"
      />


      {/* subtle purple fill */}

      <pointLight
        position={[
          -3,
          -1,
          4,
        ]}
        intensity={7}
        distance={8}
        color="#8464d9"
      />


      {/* front light */}

      <pointLight
        position={[
          0,
          1,
          6,
        ]}
        intensity={8}
        distance={9}
        color="#ffffff"
      />


      <Robot3D
        cursor={cursor}
      />
    </>
  );
}