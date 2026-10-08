"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { projectsData } from "@/lib/data";
import { cursorStore } from "@/lib/store";

const vertexShader = /* glsl */ `
  uniform float uVelocity;
  uniform float uHeight;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Scroll velocity pushes the middle of each screen away, like fabric under tension.
    float bulge = sin(uv.y * 3.14159) * sin(uv.x * 3.14159);
    p.z -= bulge * abs(uVelocity) * uHeight * 0.35;
    p.y += sin(uv.x * 3.14159) * uVelocity * uHeight * 0.06;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  uniform float uActive;
  uniform float uHover;
  uniform float uVelocity;
  uniform float uRadius;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float planeRatio = uPlane.x / uPlane.y;
    float imageRatio = uImage.x / uImage.y;
    vec2 scale = planeRatio > imageRatio
      ? vec2(1.0, imageRatio / planeRatio)
      : vec2(planeRatio / imageRatio, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  float roundedBox(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    uv = (uv - 0.5) * (1.0 - 0.06 * uHover - 0.04 * uActive) + 0.5;

    float shift = uVelocity * 0.012;
    vec3 color = vec3(
      texture2D(uTexture, uv + vec2(shift, 0.0)).r,
      texture2D(uTexture, uv).g,
      texture2D(uTexture, uv - vec2(shift, 0.0)).b
    );

    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    // Idle screens sink into dim greyscale so the active one owns the colour.
    vec3 muted = vec3(luma) * 0.4;
    color = mix(muted, color, uActive);

    float d = roundedBox((vUv - 0.5) * uPlane, uPlane * 0.5, uRadius);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, d);

    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

type Layout = { radius: number; width: number; height: number; step: number; cameraZ: number };

function useLayout(): Layout {
  const { size } = useThree();
  return useMemo(() => {
    const radius = 10;
    const cameraZ = radius * 0.35;
    const distance = radius + cameraZ;
    const fov = THREE.MathUtils.degToRad(40);
    const visibleH = 2 * Math.tan(fov / 2) * distance;
    const visibleW = visibleH * (size.width / size.height);
    const portrait = size.width < size.height;
    let width = visibleW * (portrait ? 0.84 : 0.52);
    let height = width / 1.6;
    if (height > visibleH * 0.56) {
      height = visibleH * 0.56;
      width = height * 1.6;
    }
    const step = (width * 1.1) / radius;
    return { radius, width, height, step, cameraZ };
  }, [size.width, size.height]);
}

// Builds a plane already wrapped onto the cylinder so raycasting matches what you see.
function useCurvedPlane(width: number, height: number, radius: number) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 64, 16);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const a = pos.getX(i) / radius;
      pos.setX(i, Math.sin(a) * radius);
      pos.setZ(i, radius - Math.cos(a) * radius);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function Screen({
  index,
  texture,
  layout,
  current,
  velocity,
  hovered,
  onSelect,
}: {
  index: number;
  texture: THREE.Texture;
  layout: Layout;
  current: React.MutableRefObject<number>;
  velocity: React.MutableRefObject<number>;
  hovered: React.MutableRefObject<number | null>;
  onSelect: (i: number) => void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const geometry = useCurvedPlane(layout.width, layout.height, layout.radius);
  const image = texture.image as HTMLImageElement;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uTexture: { value: texture },
          uPlane: { value: new THREE.Vector2(layout.width, layout.height) },
          uImage: { value: new THREE.Vector2(image.width, image.height) },
          uActive: { value: 0 },
          uHover: { value: 0 },
          uVelocity: { value: 0 },
          uHeight: { value: layout.height },
          uRadius: { value: layout.height * 0.018 },
        },
      }),
    [texture, image, layout.width, layout.height]
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const offset = index - current.current;
    const angle = offset * layout.step;
    if (pivot.current) {
      pivot.current.rotation.y = -angle;
      pivot.current.visible = Math.abs(angle) < Math.PI * 0.62;
    }
    const u = material.uniforms;
    const k = 1 - Math.exp(-delta * 8);
    u.uActive.value += (Math.max(0, 1 - Math.abs(offset)) - u.uActive.value) * k;
    u.uHover.value += ((hovered.current === index ? 1 : 0) - u.uHover.value) * k;
    u.uVelocity.value = velocity.current;
  });

  return (
    <group ref={pivot}>
      <mesh
        geometry={geometry}
        material={material}
        position-z={-layout.radius}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = index;
          cursorStore.set("View ↗");
        }}
        onPointerOut={() => {
          if (hovered.current === index) hovered.current = null;
          cursorStore.set(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(index);
        }}
      />
    </group>
  );
}

function Gallery({
  progress,
  onSelect,
}: {
  progress: MotionValue<number>;
  onSelect: (i: number) => void;
}) {
  const textures = useTexture(projectsData.map((p) => p.image));
  const layout = useLayout();
  const { gl } = useThree();
  const current = useRef(0);
  const velocity = useRef(0);
  const hovered = useRef<number | null>(null);
  const rig = useRef<THREE.Group>(null);

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      t.needsUpdate = true;
    });
  }, [textures, gl]);

  useEffect(() => () => cursorStore.set(null), []);

  useFrame(({ camera, pointer }, delta) => {
    const target = progress.get() * (projectsData.length - 1);
    const prev = current.current;
    current.current = THREE.MathUtils.damp(prev, target, 5, delta);
    const v = THREE.MathUtils.clamp((current.current - prev) / Math.max(delta, 1e-3) / 6, -1, 1);
    velocity.current = THREE.MathUtils.damp(velocity.current, v, 6, delta);

    camera.position.z = layout.cameraZ;
    const k = 1 - Math.exp(-delta * 3);
    camera.rotation.y += (-pointer.x * 0.06 - camera.rotation.y) * k;
    camera.rotation.x += (pointer.y * 0.04 - camera.rotation.x) * k;
    if (rig.current) rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, velocity.current * 0.03, 4, delta);
  });

  return (
    <group ref={rig} position-y={layout.height * 0.08}>
      {textures.map((texture, i) => (
        <Screen
          key={i}
          index={i}
          texture={texture}
          layout={layout}
          current={current}
          velocity={velocity}
          hovered={hovered}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

export default function GalleryScene({
  progress,
  active,
  onSelect,
}: {
  progress: MotionValue<number>;
  active: boolean;
  onSelect: (i: number) => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 3.5], fov: 40, near: 0.1, far: 100 }}
    >
      <Suspense fallback={null}>
        <Gallery progress={progress} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
