"use client";

import { Environment, Lightformer } from "@react-three/drei";

// Procedural studio lighting: no HDR download, renders once into a cube map.
export default function StudioEnv() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
        <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
        <Lightformer form="ring" color="#fff1a8" intensity={6} position={[10, 10, 0]} scale={10} />
      </group>
    </Environment>
  );
}
