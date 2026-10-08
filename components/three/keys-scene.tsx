"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
  type CollisionEnterPayload,
} from "@react-three/rapier";
import { COLORS, keysAssembledStore } from "@/lib/store";
import { keyClack } from "@/lib/sound";
import StudioEnv from "./studio-env";

type Tone = "white" | "black" | "signal" | "graphite";

const TONES: Record<Tone, { body: string; legend: string; roughness: number }> =
  {
    white: { body: "#f7f7f4", legend: COLORS.ink, roughness: 0.5 },
    black: { body: "#151515", legend: COLORS.paper, roughness: 0.45 },
    signal: { body: COLORS.signal, legend: COLORS.ink, roughness: 0.3 },
    graphite: { body: COLORS.graphite, legend: "#ffffff", roughness: 0.4 },
  };

type KeySpec = {
  legend: string;
  tone: Tone;
  width?: number;
  slot?: [number, number];
};

const NAME: KeySpec[] = [
  ..."ERIK"
    .split("")
    .map((c, i) => ({
      legend: c,
      tone: "white" as Tone,
      slot: [i, 0] as [number, number],
    })),
  ..."HEIN"
    .split("")
    .map((c, i) => ({
      legend: c,
      tone: "black" as Tone,
      slot: [i, 1] as [number, number],
    })),
];

// Only a few supporting keys: enough to set the scene, not to crowd the name.
const EXTRAS: KeySpec[] = [
  { legend: "⌘", tone: "signal" },
  { legend: "{", tone: "white" },
  { legend: "}", tone: "black" },
  { legend: "esc", tone: "graphite" },
];

const UNIT = 0.92;
const DEPTH = 0.6;
const GAP = 1.08;

// Rounded box tapered toward the face, like a sculpted keycap.
function keycapGeometry(width: number) {
  const g = new RoundedBoxGeometry(UNIT * width, UNIT, DEPTH, 5, 0.14);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getZ(i) + DEPTH / 2) / DEPTH;
    const s = 1 - 0.14 * t;
    const sx = 1 - (0.14 * t) / width;
    pos.setX(i, pos.getX(i) * sx);
    pos.setY(i, pos.getY(i) * s);
  }
  g.computeVertexNormals();
  return g;
}

function legendTexture(
  text: string,
  color: string,
  width: number,
  font: string,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 256 * width;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  if (text.length <= 2) {
    ctx.textAlign = "center";
    ctx.font = `700 ${text.length === 1 ? 112 : 86}px ${font}`;
    ctx.fillText(text, canvas.width / 2, 132);
  } else {
    // Modifier keys: small label in the lower-left, like real keycaps.
    ctx.textAlign = "left";
    ctx.font = `700 54px ${font}`;
    ctx.fillText(text, 40, 190);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const IDENTITY = new THREE.Quaternion();

function Key({
  spec,
  index,
  spread,
  font,
  layout,
}: {
  spec: KeySpec;
  index: number;
  // 0..1 position of this key around the orbit (supporting keys only)
  spread: number;
  font: string;
  layout: React.MutableRefObject<{
    center: THREE.Vector3;
    ring: THREE.Vector2;
  }>;
}) {
  const width = spec.width ?? 1;
  // Supporting keys are a size down so the name stays the hero.
  const scale = spec.slot ? 1 : 0.78;
  const api = useRef<RapierRigidBody>(null);
  const tone = TONES[spec.tone];
  const geometry = useMemo(() => keycapGeometry(width), [width]);
  const texture = useMemo(
    () => legendTexture(spec.legend, tone.legend, width, font),
    [spec.legend, tone.legend, width, font],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture],
  );

  const v = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const spawn = useMemo(() => {
    const a = (index * 2.399963) % (Math.PI * 2);
    const r = 9 + (index % 5);
    return [Math.cos(a) * r, Math.sin(a) * r * 0.7, -2 + (index % 3) * 2] as [
      number,
      number,
      number,
    ];
  }, [index]);

  // Each scramble gives the keys a little kick so the change reads as a burst.
  useEffect(
    () =>
      keysAssembledStore.subscribe(() => {
        const b = api.current;
        if (!b) return;
        const m = b.mass() * 7;
        b.applyImpulse(
          {
            x: (Math.random() - 0.5) * m,
            y: (Math.random() - 0.5) * m,
            z: (Math.random() - 0.5) * m,
          },
          true,
        );
        b.applyTorqueImpulse(
          {
            x: (Math.random() - 0.5) * 0.4,
            y: (Math.random() - 0.5) * 0.4,
            z: 0,
          },
          true,
        );
      }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const b = api.current;
    if (!b) return;
    const { center, ring } = layout.current;
    const t = pos.copy(b.translation() as THREE.Vector3Like);
    const assembled = keysAssembledStore.get();
    const mass = b.mass();

    if (assembled && spec.slot) {
      const [col, row] = spec.slot;
      v.set(
        center.x + (col - 1.5) * GAP,
        center.y + (row === 0 ? 0.56 : -0.56),
        0,
      );
      v.sub(t).multiplyScalar(mass * 0.35);
      b.applyImpulse(v, true);
      const r = b.rotation();
      q.set(r.x, r.y, r.z, r.w).slerp(IDENTITY, 1 - Math.exp(-delta * 5));
      b.setRotation(q, true);
      b.setAngvel({ x: 0, y: 0, z: 0 }, true);
    } else if (assembled) {
      // Supporting keys hold slots on an arc over and beside the name, sitting
      // slightly behind it so they frame the name without covering it, and
      // never dipping into the headline below.
      const sway = Math.sin(clock.elapsedTime * 0.25 + index) * 0.06;
      const angle = THREE.MathUtils.lerp(-0.35, Math.PI + 0.35, spread) + sway;
      v.set(
        center.x + Math.cos(angle) * ring.x,
        center.y + Math.sin(angle) * ring.y,
        -1.4,
      );
      v.sub(t).multiplyScalar(mass * 0.1);
      b.applyImpulse(v, true);
      // Turn lazily toward the viewer so their legends are readable.
      const r = b.rotation();
      q.set(r.x, r.y, r.z, r.w).slerp(IDENTITY, 1 - Math.exp(-delta * 0.8));
      b.setRotation(q, true);
    } else {
      v.copy(center)
        .sub(t)
        .multiplyScalar(mass * 0.22);
      b.applyImpulse(v, true);
    }
  });

  // Keycap clacks: loudness follows how fast the two bodies met.
  const lastClack = useRef(0);
  const onCollisionEnter = ({ target, other }: CollisionEnterPayload) => {
    const self = target.rigidBody;
    const them = other.rigidBody;
    if (!self) return;
    // Both keys get this event; let only one of them make the sound.
    if (them && them.isDynamic() && them.handle < self.handle) return;
    const now = performance.now();
    if (now - lastClack.current < 70) return;
    const a = self.linvel();
    const b = them ? them.linvel() : { x: 0, y: 0, z: 0 };
    const speed = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (speed < 0.6) return;
    lastClack.current = now;
    keyClack(Math.min(speed / 7, 1) * (spec.slot ? 1 : 0.8), spec.tone, self.translation().x / 4);
  };

  const w = UNIT * width;
  return (
    <RigidBody
      ref={api}
      position={spawn}
      rotation={[index, index * 0.7, 0]}
      colliders={false}
      linearDamping={4}
      angularDamping={1.5}
      friction={0.2}
      onCollisionEnter={onCollisionEnter}
    >
      <CuboidCollider
        args={[(w / 2) * scale, (UNIT / 2) * scale, (DEPTH / 2) * scale]}
      />
      <group scale={scale}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            color={tone.body}
            roughness={tone.roughness}
            clearcoat={
              spec.tone === "signal" || spec.tone === "graphite" ? 0.6 : 0
            }
            clearcoatRoughness={0.3}
            sheen={spec.tone === "white" ? 0.4 : 0}
            sheenColor="#ffffff"
          />
        </mesh>
        <mesh position-z={DEPTH / 2 + 0.003}>
          <planeGeometry args={[w * (1 - 0.14 / width), UNIT * 0.86]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      </group>
    </RigidBody>
  );
}

function Pointer({ active }: { active: React.MutableRefObject<boolean> }) {
  const ref = useRef<RapierRigidBody>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ pointer, viewport }) => {
    if (active.current)
      v.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0.4,
      );
    else v.set(0, 0, 60);
    ref.current?.setNextKinematicTranslation(v);
  });
  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0, 60]}
    >
      <BallCollider args={[0.7]} />
    </RigidBody>
  );
}

// Frames the name on any aspect ratio and adds a touch of pointer parallax.
function Rig({
  layout,
}: {
  layout: React.MutableRefObject<{
    center: THREE.Vector3;
    ring: THREE.Vector2;
  }>;
}) {
  const framed = useRef(false);
  useFrame(({ camera, pointer, size }, delta) => {
    const aspect = size.width / size.height;
    const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(17.5 / 2));
    const z = Math.max(21, 7.6 / (visibleH * aspect));
    // Snap on the first frame so small screens never start zoomed in.
    if (!framed.current) {
      camera.position.z = z;
      framed.current = true;
    }
    const k = 1 - Math.exp(-delta * 2);
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * k;
    camera.position.y += (pointer.y * 0.35 - camera.position.y) * k;
    camera.position.z += (z - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
    const portrait = aspect < 1;
    layout.current.center.set(0, visibleH * z * (portrait ? 0.22 : 0.08), 0);
    if (portrait) layout.current.ring.set(2.5, 2.1);
    else
      layout.current.ring.set(
        Math.min(3.5, (visibleH * z * aspect) / 2 - 0.6),
        1.75,
      );
  });
  return null;
}

export default function KeysScene({
  active,
  play,
}: {
  active: boolean;
  play: boolean;
}) {
  const pointerInside = useRef(false);
  const layout = useRef({
    center: new THREE.Vector3(),
    ring: new THREE.Vector2(3.4, 1.9),
  });
  const font = useMemo(
    () =>
      typeof window === "undefined"
        ? "sans-serif"
        : getComputedStyle(document.documentElement)
            .getPropertyValue("--font-display")
            .trim() || "sans-serif",
    [],
  );
  const keys = useMemo(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 768;
    return [...NAME, ...EXTRAS.slice(0, mobile ? 2 : EXTRAS.length)];
  }, []);

  // Swarm in first, then line up to spell the name.
  useEffect(() => {
    if (!play) return;
    const id = setTimeout(() => keysAssembledStore.set(true), 1400);
    return () => clearTimeout(id);
  }, [play]);

  return (
    <Canvas
      // While the loader covers the hero, render once (to compile shaders) and idle.
      frameloop={active ? (play ? "always" : "demand") : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 80 }}
      onPointerEnter={() => (pointerInside.current = true)}
      onPointerMove={() => (pointerInside.current = true)}
      onPointerLeave={() => (pointerInside.current = false)}
      onClick={() => keysAssembledStore.set(!keysAssembledStore.get())}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 8]} intensity={1.6} color="#ffffff" />
      <directionalLight
        position={[-6, -3, 4]}
        intensity={0.5}
        color="#fff3b0"
      />
      <Physics gravity={[0, 0, 0]} paused={!play}>
        <Pointer active={pointerInside} />
        {keys.map((spec, i) => (
          <Key
            key={i}
            spec={spec}
            index={i}
            spread={
              (i - NAME.length) / Math.max(1, keys.length - NAME.length - 1)
            }
            font={font}
            layout={layout}
          />
        ))}
      </Physics>
      <StudioEnv />
      <Rig layout={layout} />
    </Canvas>
  );
}
