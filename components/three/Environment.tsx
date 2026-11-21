"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Fully procedural environment map built from Lightformers.
 * Gives glass and metal realistic reflections WITHOUT downloading an HDR file,
 * so the scene works offline and never blocks on a CDN.
 */
export function GoldenHourEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* Low warm sun band behind the viewer — reflects across the façades */}
      <Lightformer form="rect" intensity={4} color="#ff9a52" position={[8, 4, 40]} scale={[60, 7, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#ffcf94" position={[-30, 6, 25]} rotation={[0, Math.PI / 3, 0]} scale={[30, 6, 1]} />
      {/* Dusky sky dome */}
      <Lightformer form="rect" intensity={0.9} color="#7486b4" position={[0, 40, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[100, 100, 1]} />
      {/* Cool rim from the far side */}
      <Lightformer form="rect" intensity={1.2} color="#9fb3d9" position={[0, 8, -40]} scale={[60, 12, 1]} />
      <Lightformer form="ring" intensity={3} color="#ffd7a1" position={[25, 12, 20]} scale={6} />
    </Environment>
  );
}

/** Soft interior environment for the apartment (warm ceiling panels + daylight from the north glass). */
export function InteriorEnvironment() {
  return (
    <Environment resolution={128} frames={1} background={false}>
      <Lightformer form="rect" intensity={2.2} color="#fff4e2" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[30, 20, 1]} />
      <Lightformer form="rect" intensity={3} color="#dfeaff" position={[0, 2, -14]} scale={[40, 6, 1]} />
      <Lightformer form="rect" intensity={1} color="#ffd9a8" position={[20, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[20, 4, 1]} />
      <Lightformer form="rect" intensity={1} color="#ffd9a8" position={[-20, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[20, 4, 1]} />
    </Environment>
  );
}

/**
 * Large inverted sphere with a vertical gradient — cheap, beautiful sky.
 * Colours can be animated by mutating `uniforms` from outside (see Apartment day/night).
 */
export function GradientSky({
  top = "#1c2340",
  middle = "#b8735a",
  bottom = "#f0b070",
  radius = 220,
  uniformsRef,
}: {
  top?: string;
  middle?: string;
  bottom?: string;
  radius?: number;
  uniformsRef?: React.MutableRefObject<Record<string, THREE.IUniform> | null>;
}) {
  const material = useMemo(() => {
    const uniforms = {
      uTop: { value: new THREE.Color(top) },
      uMiddle: { value: new THREE.Color(middle) },
      uBottom: { value: new THREE.Color(bottom) },
    };
    if (uniformsRef) uniformsRef.current = uniforms;
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() {
          vPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uMiddle; uniform vec3 uBottom;
        varying vec3 vPos;
        void main() {
          float h = vPos.y;
          // warm horizon glow -> mid sky -> deep zenith
          vec3 col = mix(uBottom, uMiddle, smoothstep(-0.05, 0.14, h));
          col = mix(col, uTop, smoothstep(0.14, 0.65, h));
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    // Colours are intentionally read once; animate via uniformsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  );
}
