"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { COLORS } from "@/lib/store";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  uniform vec3 uBase;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.06;

    // Domain-warped fbm gives slow, silky flow.
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.7));
    float f = fbm(p * 1.1 + q * 1.8 + vec2(t * 1.5, -t));

    // Light pools near the top and fades into the base toward the wordmark.
    float band = pow(smoothstep(0.5, 0.9, f), 2.2) * smoothstep(0.15, 1.0, vUv.y);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
    float halo = exp(-dot(p - m, p - m) * 6.0);

    // Values are linear light; small numbers here read much brighter after sRGB encoding.
    vec3 color = uBase;
    color += uAccent * (band * 0.24 + halo * 0.04 * (0.3 + f));
    color += uHighlight * pow(band, 3.5) * 0.08;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function Aurora({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.7) },
          uRes: { value: new THREE.Vector2(1, 1) },
          uAccent: { value: new THREE.Color(COLORS.signal) },
          uHighlight: { value: new THREE.Color(COLORS.paper) },
          uBase: { value: new THREE.Color(COLORS.night) },
        },
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock, size }, delta) => {
    const u = material.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uRes.value.set(size.width, size.height);
    u.uMouse.value.lerp(mouse.current, 1 - Math.exp(-delta * 2.5));
  });

  return (
    <mesh material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function AuroraScene({
  active,
  container,
}: {
  active: boolean;
  container: React.RefObject<HTMLElement>;
}) {
  const mouse = useRef(new THREE.Vector2(0.5, 0.7));

  // DOM content sits above the canvas, so track the pointer on the container instead.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [container]);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      // Soft gradients don't need full resolution; this keeps the fill cost tiny.
      dpr={[0.5, 0.75]}
      gl={{ antialias: false, alpha: false }}
      className="!pointer-events-none"
    >
      <Aurora mouse={mouse} />
    </Canvas>
  );
}
