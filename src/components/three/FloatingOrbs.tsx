"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Orb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.6}
        />
      </Sphere>
    </Float>
  );
}

export default function FloatingOrbs() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      className="!absolute inset-0"
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#a855f7" />
      <Suspense fallback={null}>
        <Orb position={[-2.4, 0.6, 0]} color="#3b82f6" scale={1.2} />
        <Orb position={[2.5, -0.6, -1]} color="#9333ea" scale={1.4} />
        <Orb position={[0, 1.2, -2]} color="#10b981" scale={0.8} />
      </Suspense>
    </Canvas>
  );
}
