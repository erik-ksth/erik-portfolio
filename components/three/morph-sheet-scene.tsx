"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { COLORS } from "@/lib/store";

// A photo that flies from one DOM box (a small thumbnail) to another (the large
// slot) as you scroll. Every vertex runs on its own slightly delayed timeline,
// so mid-flight part of the sheet has landed while the rest is still catching
// up: that stagger is what makes it read as a soft, fluid sheet.
const vertexShader = /* glsl */ `
  uniform vec2 uFromXY;
  uniform vec2 uFromWH;
  uniform vec2 uToXY;
  uniform vec2 uToWH;
  uniform float uProgress;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vProgress;

  void main() {
    // position.xy runs 0..1 across the sheet, with y = 0 at the top edge.
    vec2 p = position.xy;

    // The top-right corner leads and the bottom-left trails.
    float lag = 1.0 - (pow(p.x * p.x, 0.75) + pow(1.0 - p.y, 1.5)) * 0.5;
    float t = smoothstep(lag * 0.3, 0.7 + lag * 0.3, uProgress);

    vec2 xy = mix(uFromXY, uToXY, t);
    vec2 wh = mix(uFromWH, uToWH, t);
    // A sideways swing that peaks mid-flight and settles to zero on landing.
    xy.x += mix(wh.x, 0.0, cos(t * 6.2831853) * 0.5 + 0.5) * 0.1;

    // A slight twist that also vanishes at both ends of the flight.
    float angle = (smoothstep(0.0, 1.0, t) - t) * -1.0;
    vec2 local = p * wh - wh * 0.5;
    local = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * local;
    vec2 screen = xy + wh * 0.5 + local;

    // Orthographic camera in CSS pixels, y pointing down like the DOM.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(screen.x, -screen.y, 0.0, 1.0);
    // The geometry's y was flipped to DOM order, so uv.y already runs top (1) to bottom (0).
    vUv = uv;
    vSize = wh;
    vProgress = t;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uImage;
  uniform vec3 uTint;
  uniform float uRadius;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vProgress;

  float roundedBox(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // Cover-fit the photo inside whatever size this part of the sheet has right now.
    float boxRatio = vSize.x / vSize.y;
    float imageRatio = uImage.x / uImage.y;
    vec2 scale = boxRatio > imageRatio ? vec2(1.0, imageRatio / boxRatio) : vec2(boxRatio / imageRatio, 1.0);
    vec3 color = texture2D(uTexture, (vUv - 0.5) * scale + 0.5).rgb;

    // In flight the photo is a signal-yellow monotone; colour develops as each part lands.
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 tinted = max(uTint * 0.92, vec3(luma));
    color = mix(tinted, color, vProgress);

    float d = roundedBox((vUv - 0.5) * vSize, vSize * 0.5, uRadius);
    float alpha = smoothstep(0.0, -fwidth(d), d);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

function rectOf(el: HTMLElement | null, out: { xy: THREE.Vector2; wh: THREE.Vector2 }) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  out.xy.set(r.left, r.top);
  out.wh.set(r.width, r.height);
}

function Sheet({
  src,
  progress,
  from,
  to,
}: {
  src: string;
  progress: MotionValue<number>;
  from: React.RefObject<HTMLElement>;
  to: React.RefObject<HTMLElement>;
}) {
  const texture = useTexture(src);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    // 0..1 plane so the shader can treat position.xy as the sheet's own coordinates.
    const g = new THREE.PlaneGeometry(1, 1, 32, 32);
    g.translate(0.5, 0.5, 0);
    // Flip so y = 0 is the top edge, matching DOM coordinates.
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, 1 - pos.getY(i));
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const image = texture.image as HTMLImageElement;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: texture },
        uImage: { value: new THREE.Vector2(image.width, image.height) },
        uFromXY: { value: new THREE.Vector2() },
        uFromWH: { value: new THREE.Vector2(1, 1) },
        uToXY: { value: new THREE.Vector2() },
        uToWH: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 0 },
        uTint: { value: new THREE.Color(COLORS.signal) },
        uRadius: { value: 12 },
      },
    });
  }, [texture, gl]);
  useEffect(() => () => material.dispose(), [material]);

  const smoothed = useMemo(() => ({ value: progress.get() }), [progress]);

  useFrame((_, delta) => {
    const u = material.uniforms;
    // Both boxes move with the page, so re-measure them every frame.
    rectOf(from.current, { xy: u.uFromXY.value, wh: u.uFromWH.value });
    rectOf(to.current, { xy: u.uToXY.value, wh: u.uToWH.value });
    smoothed.value = THREE.MathUtils.damp(smoothed.value, progress.get(), 7, delta);
    u.uProgress.value = smoothed.value;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

// Keeps an orthographic camera mapped 1:1 to CSS pixels: x right, y up from the top edge.
function PixelCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = 0;
    cam.right = size.width;
    cam.top = 0;
    cam.bottom = -size.height;
    cam.near = -10;
    cam.far = 10;
    cam.position.set(0, 0, 1);
    cam.zoom = 1;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function MorphSheetScene({
  src,
  progress,
  from,
  to,
  active,
}: {
  src: string;
  progress: MotionValue<number>;
  from: React.RefObject<HTMLElement>;
  to: React.RefObject<HTMLElement>;
  active: boolean;
}) {
  return (
    <Canvas
      orthographic
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="!pointer-events-none"
    >
      <PixelCamera />
      <Suspense fallback={null}>
        <Sheet src={src} progress={progress} from={from} to={to} />
      </Suspense>
    </Canvas>
  );
}
