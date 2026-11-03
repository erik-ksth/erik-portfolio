"use client";

import { Component, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import StudioEnv from "./studio-env";

type Props = { onReady: () => void; departure: MutableRefObject<number | null> };
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 4);

// Same sculpted, tapered profile as the interactive keys in the hero.
function sculptKey() {
  const geometry = new RoundedBoxGeometry(2, 2, 0.9, 6, 0.19);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const taper = 1 - ((vertices.getZ(i) + 0.45) / 0.9) * 0.14;
    vertices.setX(i, vertices.getX(i) * taper);
    vertices.setY(i, vertices.getY(i) * taper);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Keycap({ index, departure }: { index: number; departure: Props["departure"] }) {
  const group = useRef<THREE.Group>(null);
  const started = useRef<number | null>(null);
  const geometry = useMemo(sculptKey, []);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
    ctx.font = `600 290px ${font}`;
    ctx.fillStyle = "#0a0a0a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(index === 0 ? "E" : "H", 256, 266);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [index]);

  useEffect(() => () => { geometry.dispose(); texture.dispose(); }, [geometry, texture]);

  useFrame(({ clock, size, pointer }, delta) => {
    const key = group.current;
    if (!key) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const t = clock.elapsedTime - started.current;
    const arrival = ease((t - index * 0.26) / 1.8);
    const portrait = size.width / size.height < 0.8;
    const side = index === 0 ? -1 : 1;
    const x = side * (portrait ? 0.62 : 1.12);
    const y = index === 0 ? (portrait ? 0.75 : 0.3) : (portrait ? -0.63 : -0.24);
    const leave = departure.current === null ? 0 : clamp((performance.now() - departure.current) / 950, 0, 1);
    const flight = leave * leave;

    key.position.set(
      mix(side * 4.5, x, arrival) + side * flight * 5,
      mix(index === 0 ? -1.6 : 2.2, y, arrival) + Math.sin(t * 0.8 + index * 2) * 0.045 * arrival,
      mix(-6, index === 0 ? 0 : 0.35, arrival) + flight * 9,
    );
    key.rotation.set(
      mix(index === 0 ? -1.4 : 1.2, index === 0 ? -0.16 : 0.16, arrival) + flight * side * 0.5,
      mix(side * 2.2, side * 0.26, arrival) + flight * side * 0.65,
      mix(side * 0.9, side * 0.14, arrival),
    );
    // A small, damped response to the viewer, after the authored arrival.
    const k = 1 - Math.exp(-delta * 3);
    key.position.x += pointer.x * 0.1 * arrival * k;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color={index === 0 ? "#f4f4f1" : "#ffd60a"} roughness={0.32} clearcoat={0.35} clearcoatRoughness={0.35} />
      </mesh>
      <mesh position-z={0.453}>
        <planeGeometry args={[1.72, 1.72]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rig({ onReady }: Pick<Props, "onReady">) {
  const ready = useRef(false);
  useFrame(({ camera, size }) => {
    camera.position.z = size.width / size.height < 0.8 ? 11.5 : 8.8;
    camera.lookAt(0, 0.1, 0);
    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });
  return null;
}

class SceneBoundary extends Component<{ children: ReactNode; onReady: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onReady(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function IntroScene({ onReady, departure }: Props) {
  return (
    <SceneBoundary onReady={onReady}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8.8], fov: 35, near: 0.1, far: 50 }}
        style={{ touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[-4, 6, 7]} intensity={2.5} />
        <directionalLight position={[5, -2, 3]} intensity={0.65} color="#fff0c0" />
        <StudioEnv />
        <Rig onReady={onReady} />
        <Keycap index={0} departure={departure} />
        <Keycap index={1} departure={departure} />
      </Canvas>
    </SceneBoundary>
  );
}
