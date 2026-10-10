"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SKILL_LOGOS, SKILL_MONOGRAMS } from "@/lib/skill-icons";
import StudioEnv from "./studio-env";

// The skills keyboard in real 3D: soft, domed MOA-style keycaps in matte ABS,
// sitting down inside a pastel tray case so only their tops stand proud of the
// rim. Colours drift lighter across the board like a gradient keycap set. Keys
// travel down when pressed, rise under the cursor, and a hovered category lifts
// out of the board.

export type BoardKey = {
  code: string;
  w: number;
  row: number;
  x: number; // centre, in key units from the board's centre
  skill?: string;
  label?: string; // the key's ordinary legend, when it holds no skill
  space?: boolean;
  category?: string;
  body: string;
  legend: string;
  lum: number; // brightness of the cap, to keep brand colours legible on it
};

const PITCH = 1; // one key unit
const GAP = 0.08;
const HEIGHT = 0.72; // tall, puffy MOA profile
const TAPER = 0.1;
const DOME = 0.02; // how much the top bulges
const RIM = 0.38; // the case rim's height above the plate: caps stand ~half out

const half = (w: number) => [((w * PITCH - GAP) * (1 - TAPER / w)) / 2, ((PITCH - GAP) * (1 - TAPER)) / 2] as const;
// Height of the domed top at (x, y) on the face, 0 at the edges.
const dome = (x: number, y: number, hx: number, hy: number) =>
  DOME * Math.max(0, 1 - (x / hx) ** 2) * Math.max(0, 1 - (y / hy) ** 2);

function capGeometry(w: number) {
  const g = new RoundedBoxGeometry(w * PITCH - GAP, PITCH - GAP, HEIGHT, 4, 0.07);
  const pos = g.attributes.position;
  const [hx, hy] = half(w);
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getZ(i) + HEIGHT / 2) / HEIGHT; // 0 at the base, 1 at the face
    const x = pos.getX(i) * (1 - (TAPER * t) / w);
    const y = pos.getY(i) * (1 - TAPER * t);
    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, pos.getZ(i) + dome(x, y, hx, hy) * t ** 4);
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2); // face up
  return g;
}

const faceSize = (w: number) => {
  const [hx, hy] = half(w);
  return [hx * 2 - 0.16, hy * 2 - 0.16] as const;
};

// The legend follows the dome, so it reads as printed on, not floating above.
function legendGeometry(w: number) {
  const [fw, fh] = faceSize(w);
  const [hx, hy] = half(w);
  const g = new THREE.PlaneGeometry(fw, fh, 12, 6);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, dome(pos.getX(i), pos.getY(i), hx, hy) + 0.006);
  g.rotateX(-Math.PI / 2);
  return g;
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

// The printed legend, drawn white so the material can tint it (and light it up
// in the brand colour on press): logo or monogram, with the name underneath.
function legendTexture(k: BoardKey, fonts: { sans: string; mono: string }) {
  const [fw, fh] = faceSize(k.w);
  const scale = 220; // px per world unit
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(fw * scale);
  canvas.height = Math.round(fh * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = canvas.width / 2;

  if (k.space) {
    ctx.font = `400 30px ${fonts.mono}`;
    ctx.fillText("always learning", cx, canvas.height / 2);
  } else if (k.skill) {
    const size = canvas.height * 0.42;
    const top = canvas.height * 0.36;
    const logo = SKILL_LOGOS[k.skill];
    if (logo) {
      ctx.save();
      ctx.translate(cx - size / 2, top - size / 2);
      ctx.scale(size / 24, size / 24);
      ctx.fill(new Path2D(logo.path));
      ctx.restore();
    } else {
      const mono = SKILL_MONOGRAMS[k.skill] ?? k.skill.slice(0, 2);
      ctx.lineWidth = size * 0.07;
      const r = size * 0.22;
      const x = cx - size / 2;
      const y = top - size / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, r);
      ctx.stroke();
      ctx.font = `700 ${size * (mono.length > 2 ? 0.34 : 0.44)}px ${fonts.mono}`;
      ctx.fillText(mono, cx, top + size * 0.03);
    }
    const name = k.skill.replace(/^Adobe /, "");
    let px = 24;
    ctx.font = `600 ${px}px ${fonts.sans}`;
    while (ctx.measureText(name).width > canvas.width * 0.9 && px > 15) {
      px -= 1;
      ctx.font = `600 ${px}px ${fonts.sans}`;
    }
    ctx.globalAlpha = 0.8;
    ctx.fillText(name, cx, canvas.height * 0.8);
  } else if (k.label) {
    // A plain key: its normal legend, quieter than the skills.
    ctx.globalAlpha = 0.55;
    ctx.font = `600 ${k.label.length > 1 ? 30 : 46}px ${fonts.sans}`;
    ctx.fillText(k.label, cx, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Keycap({
  k,
  fonts,
  pressed,
  focus,
  onPress,
  onRelease,
}: {
  k: BoardKey;
  fonts: { sans: string; mono: string };
  pressed: React.MutableRefObject<Set<string>>;
  focus: React.MutableRefObject<string | null>;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const legendMat = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const geometry = useMemo(() => capGeometry(k.w), [k.w]);
  const legendGeo = useMemo(() => legendGeometry(k.w), [k.w]);
  // Only the printed content matters here, so recolouring doesn't redraw it.
  const { skill, label, w, space } = k;
  const texture = useMemo(() => legendTexture({ ...k, skill, label, w, space }, fonts), [skill, label, w, space, fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  // Like a gradient keycap set: each cap drifts a little lighter left to right, front to back.
  const body = useMemo(() => {
    const fade = ((k.x + 7.5) / 15) * 0.3 + (k.row / 4) * 0.08;
    return new THREE.Color(k.body).lerp(new THREE.Color("#fffdf7"), Math.min(0.45, fade));
  }, [k.body, k.x, k.row]);
  const base = useMemo(() => new THREE.Color(k.legend), [k.legend]);
  const brand = useMemo(() => {
    const logo = k.skill ? SKILL_LOGOS[k.skill] : undefined;
    // Only light up in the brand colour if it stays readable on this cap.
    return logo && Math.abs(luminance(logo.hex) - k.lum) > 0.25 ? new THREE.Color(logo.hex) : base;
  }, [k.skill, k.lum, base]);
  useEffect(
    () => () => {
      geometry.dispose();
      legendGeo.dispose();
      texture.dispose();
    },
    [geometry, legendGeo, texture],
  );

  const y = useRef(0);
  useFrame((_, dt) => {
    const down = pressed.current.has(k.code);
    const f = focus.current;
    let target = 0;
    if (f) target = k.category === f ? 0.26 : -0.06;
    if (hovered.current) target += 0.06;
    if (down) target = -0.17;
    // Snappy on the way down, softer on the way back up.
    y.current += (target - y.current) * (1 - Math.exp(-dt * (down ? 45 : 14)));
    if (group.current) group.current.position.y = y.current;
    legendMat.current?.color.lerp(down ? brand : base, 1 - Math.exp(-dt * (down ? 30 : 6)));
  });

  const press = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPress(k.code);
  };
  const release = () => onRelease(k.code);

  return (
    <group position={[k.x, 0, k.row - 2]}>
      <group ref={group}>
        <mesh
          geometry={geometry}
          position-y={HEIGHT / 2}
          castShadow
          receiveShadow
          onPointerDown={press}
          onPointerUp={release}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = true;
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            hovered.current = false;
            document.body.style.cursor = "";
            if (pressed.current.has(k.code)) release();
          }}
        >
          {/* Matte ABS: soft highlight, no lacquer. */}
          <meshPhysicalMaterial color={body} roughness={0.55} sheen={0.35} sheenColor="#ffffff" sheenRoughness={0.6} />
        </mesh>
        <mesh geometry={legendGeo} position-y={HEIGHT}>
          <meshBasicMaterial ref={legendMat} map={texture} color={k.legend} transparent toneMapped={false} />
        </mesh>
        {/* Invisible text pinned over the cap, so the browser's Find (cmd/ctrl+F)
            matches the skill and its highlight lands right on this key. */}
        {k.skill && (
          <Html position={[0, HEIGHT + 0.05, 0.12]} center zIndexRange={[2, 1]} style={{ pointerEvents: "none" }}>
            <span className="block whitespace-nowrap text-[11px] font-semibold leading-none text-transparent">{k.skill}</span>
          </Html>
        )}
      </group>
    </group>
  );
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// A pastel tray: a solid base, a raised rim around a recessed well, and a
// darker plate in the well that shows between the caps.
function Case({ color, plate }: { color: string; plate: string }) {
  const WELL_W = 15.2;
  const WELL_D = 5.2;
  const WALL = 0.3;
  const { base, rim } = useMemo(() => {
    const outer = roundedRect(WELL_W + WALL * 2, WELL_D + WALL * 2, 0.16);
    const bevel = { bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 12 };
    const base = new THREE.ExtrudeGeometry(outer, { depth: 0.45, ...bevel });
    base.rotateX(-Math.PI / 2);
    base.translate(0, -0.55, 0);
    const ring = roundedRect(WELL_W + WALL * 2, WELL_D + WALL * 2, 0.16);
    ring.holes.push(roundedRect(WELL_W, WELL_D, 0.05));
    const rim = new THREE.ExtrudeGeometry(ring, { depth: RIM + 0.1, ...bevel });
    rim.rotateX(-Math.PI / 2);
    rim.translate(0, -0.1, 0);
    return { base, rim };
  }, []);
  useEffect(
    () => () => {
      base.dispose();
      rim.dispose();
    },
    [base, rim],
  );
  const shell = <meshPhysicalMaterial color={color} roughness={0.7} sheen={0.25} sheenColor="#fffbe8" />;
  return (
    <group>
      <mesh geometry={base} castShadow receiveShadow>
        {shell}
      </mesh>
      <mesh geometry={rim} castShadow receiveShadow>
        {shell}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
        <planeGeometry args={[WELL_W, WELL_D]} />
        <meshStandardMaterial color={plate} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Frames the whole board on any aspect ratio: looks almost straight down at it
// (just enough angle to see the caps stand out of the case), and backs off
// until its full width (plus a margin) fits.
function CameraFit() {
  const dir = useMemo(() => new THREE.Vector3(0, 1, 0.32).normalize(), []);
  useFrame(({ camera, size }) => {
    const cam = camera as THREE.PerspectiveCamera;
    // A long lens keeps the board flat and even, without the front row bulging.
    if (cam.fov !== 20) {
      cam.fov = 20;
      cam.updateProjectionMatrix();
    }
    const aspect = size.width / size.height;
    const halfFov = THREE.MathUtils.degToRad(cam.fov / 2);
    const fitWidth = 17.6 / 2 / (Math.tan(halfFov) * aspect);
    const fitDepth = 7.6 / 2 / Math.tan(halfFov);
    const dist = Math.max(fitWidth, fitDepth);
    cam.position.copy(dir).multiplyScalar(dist);
    cam.lookAt(0, 0, 0.05);
  });
  return null;
}

// The board leans gently toward the pointer.
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer }, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 3);
    g.rotation.x += (-pointer.y * 0.03 - g.rotation.x) * k;
    g.rotation.z += (-pointer.x * 0.02 - g.rotation.z) * k;
  });
  return <group ref={ref}>{children}</group>;
}

export default function KeyboardScene({
  keys,
  pressed,
  focus,
  onPress,
  onRelease,
  active,
  caseColor,
  plateColor,
}: {
  keys: BoardKey[];
  pressed: React.MutableRefObject<Set<string>>;
  focus: React.MutableRefObject<string | null>;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
  active: boolean;
  caseColor: string;
  plateColor: string;
}) {
  const fonts = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    return {
      sans: css.getPropertyValue("--font-sans").trim() || "sans-serif",
      mono: css.getPropertyValue("--font-mono").trim() || "monospace",
    };
  }, []);

  return (
    <Canvas
      // "demand" still draws once while off screen, so the Find labels are in place.
      frameloop={active ? "always" : "demand"}
      shadows
      dpr={[1, 1.75]}
      resize={{ offsetSize: true }}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 40, 13], fov: 20, near: 1, far: 120 }}
      onPointerMissed={() => pressed.current.forEach((c) => onRelease(c))}
      style={{ touchAction: "pan-x pan-y" }}
    >
      <ambientLight intensity={0.75} color="#fff8e6" />
      <directionalLight
        position={[-6, 12, 7]}
        intensity={1.35}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-radius={6}
        shadow-bias={-0.0004}
      />
      <Rig>
        <Case color={caseColor} plate={plateColor} />
        {keys.map((k) => (
          <Keycap key={k.code} k={k} fonts={fonts} pressed={pressed} focus={focus} onPress={onPress} onRelease={onRelease} />
        ))}
      </Rig>
      <CameraFit />
      <ContactShadows position={[0, -0.6, 0]} scale={26} blur={2.8} opacity={0.35} far={4} color="#5a4a20" />
      <StudioEnv />
    </Canvas>
  );
}
