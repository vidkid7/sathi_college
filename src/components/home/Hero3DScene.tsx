"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

const SLIDE_COLORS = [
  ["#3b82f6", "#8b5cf6"], // Slide 0: Blue & Violet (Journey)
  ["#10b981", "#3b82f6"], // Slide 1: Green & Blue (Rank)
  ["#f59e0b", "#ef4444"], // Slide 2: Amber & Red (College)
  ["#ec4899", "#8b5cf6"], // Slide 3: Pink & Violet (Mock)
  ["#06b6d4", "#3b82f6"], // Slide 4: Cyan & Blue (Community)
];

const SLIDE_POSITIONS = [
  // Each array contains target positions for the 4 shapes [Icosahedron, Torus, Sphere, Cone]
  [
    [-3, 1, -2],
    [3, -1.5, -3],
    [2, 2, -5],
    [-2, -2, -4],
  ],
  [
    [-2, -1, -3],
    [2, 1, -2],
    [-3, 2, -4],
    [3, -2, -5],
  ],
  [
    [0, 2, -4],
    [-2.5, -1.5, -2],
    [3, 0, -3],
    [-1, 1.5, -5],
  ],
  [
    [2, 2, -3],
    [-3, 1, -4],
    [1, -2, -2],
    [-1.5, -1.5, -5],
  ],
  [
    [-2.5, 0, -2],
    [2.5, 0, -2],
    [0, -2.5, -4],
    [0, 2.5, -4],
  ],
];

function SceneShapes({ activeSlide }: { activeSlide: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const icosahedronRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const { viewport, mouse } = useThree();
  const { resolvedTheme } = useTheme();

  // Create materials only once
  const materials = useMemo(() => {
    return {
      mat1: new THREE.MeshPhysicalMaterial({
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      }),
      mat2: new THREE.MeshPhysicalMaterial({
        roughness: 0.3,
        metalness: 0.2,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
      }),
    };
  }, []);

  const targetColor1 = useMemo(() => new THREE.Color(), []);
  const targetColor2 = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    // Smoothly transition colors
    const colors = SLIDE_COLORS[activeSlide % SLIDE_COLORS.length];
    targetColor1.set(colors[0]);
    targetColor2.set(colors[1]);

    // Adjust brightness based on theme (dark mode = more vivid, light mode = slightly washed/brighter)
    if (resolvedTheme === "light") {
      targetColor1.lerp(new THREE.Color("#ffffff"), 0.2);
      targetColor2.lerp(new THREE.Color("#ffffff"), 0.2);
    }

    materials.mat1.color.lerp(targetColor1, delta * 2);
    materials.mat2.color.lerp(targetColor2, delta * 2);

    // Smoothly transition positions based on active slide
    const positions = SLIDE_POSITIONS[activeSlide % SLIDE_POSITIONS.length];
    const shapes = [icosahedronRef.current, torusRef.current, sphereRef.current, coneRef.current];

    // Adjust scale based on viewport width to prevent clipping on mobile
    const scaleMultiplier = viewport.width < 10 ? 0.6 : 1;

    shapes.forEach((shape, index) => {
      if (shape) {
        const targetPos = new THREE.Vector3(
          positions[index][0] * scaleMultiplier,
          positions[index][1] * scaleMultiplier,
          positions[index][2]
        );
        shape.position.lerp(targetPos, delta * 2);

        // Gentle constant rotation
        shape.rotation.x += delta * 0.1;
        shape.rotation.y += delta * 0.15;
      }
    });

    // Mouse parallax effect on the whole group
    if (groupRef.current) {
      const targetX = (mouse.x * viewport.width) / 10;
      const targetY = (mouse.y * viewport.height) / 10;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 2);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 2);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={icosahedronRef} material={materials.mat1}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={torusRef} material={materials.mat2}>
          <torusGeometry args={[0.8, 0.3, 16, 32]} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.2}>
        <mesh ref={sphereRef} material={materials.mat1}>
          <sphereGeometry args={[0.9, 32, 32]} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.8}>
        <mesh ref={coneRef} material={materials.mat2}>
          <coneGeometry args={[0.8, 1.5, 32]} />
        </mesh>
      </Float>
    </group>
  );
}

export function Hero3DScene({ activeSlide, className }: { activeSlide: number; className?: string }) {
  const { resolvedTheme } = useTheme();

    return (
      <div className={`absolute inset-0 z-0 overflow-hidden ${className || ""}`}>
      {/*
        Optimization:
        dpr={[1, 1.5]} keeps rendering sharp on mobile but avoids extreme GPU tax on ultra-high DPI.
        powerPreference="high-performance" hints the browser to use the dedicated GPU.
        gl={{ antialias: false }} can be disabled if we use post-processing or accept slight jagged edges for huge perf gains, but keeping it true for now.
      */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={resolvedTheme === "dark" ? 0.5 : 0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <SceneShapes activeSlide={activeSlide} />
      </Canvas>
    </div>
  );
}
