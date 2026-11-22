import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OriginGyroscope } from './OriginGyroscope';
import { AlgorithmicCrystal } from './AlgorithmicCrystal';
import { PolyglotPlanes } from './PolyglotPlanes';
import { CodeMonolith } from './CodeMonolith';
import { AgileRadarNexus } from './AgileRadarNexus';
import { ServerRack } from './ServerRack';
import { SystemArchitectureCore } from './SystemArchitectureCore';
import { NarratorBackgroundAvatar } from './NarratorBackgroundAvatar';
import type { SectionPropItem } from './AvatarScrollDirector';

export function SceneContainer() {
  // Cap DPR between 1 and 1.25 for crisp rendering with maximum 60-120 FPS performance
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.25) || 1 : 1;

  // Dedicated refs for each of the 7 section's 3D coding props for distance culling & Z-safety
  const prop0Ref = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Group>(null);
  const prop2Ref = useRef<THREE.Group>(null);
  const prop3Ref = useRef<THREE.Group>(null);
  const prop4Ref = useRef<THREE.Group>(null);
  const prop5Ref = useRef<THREE.Group>(null);
  const prop6Ref = useRef<THREE.Group>(null);

  const sectionPropsRefs = useRef<SectionPropItem[]>([
    { ref: prop0Ref, sectionY: 0.0, baseZ: -1.15, encirclesAvatar: true },
    { ref: prop1Ref, sectionY: -3.8, baseZ: -1.6 },
    { ref: prop2Ref, sectionY: -8.2, baseZ: -1.6 },
    { ref: prop3Ref, sectionY: -12.6, baseZ: -1.6 },
    { ref: prop5Ref, sectionY: -21.4, baseZ: -1.6 },
    { ref: prop4Ref, sectionY: -25.8, baseZ: -1.6 },
    { ref: prop6Ref, sectionY: -30.2, baseZ: -1.7 },
  ]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0.0, 0.15, 4.6], fov: 48, near: 0.1, far: 60 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#09080D']} />
        <fog attach="fog" args={['#09080D', 10, 40]} />

        <ambientLight intensity={0.75} />
        <directionalLight position={[8, 14, 10]} intensity={1.65} color="#fffaf0" />
        <directionalLight position={[-10, -5, -5]} intensity={0.85} color="#5B3E96" />

        {/* Narrator 3D Character Avatar + Spring Physics Scroll Director */}
        <Suspense fallback={null}>
          <NarratorBackgroundAvatar sectionPropsRefs={sectionPropsRefs} />
        </Suspense>

        {/* 7-Sector Fun 3D Coding Props with Dynamic Distance Culling */}
        {/* 00 ORIGIN: 3D RGB Mechanical Keycaps (</>, { }, TS, JS, GIT, RUN) */}
        <group ref={prop0Ref}>
          <OriginGyroscope />
        </group>

        {/* 01 SWE: 3D Open Developer Laptop + Floating { } Braces & Binary Tree */}
        <group ref={prop1Ref}>
          <AlgorithmicCrystal />
        </group>

        {/* 02 FULLSTACK: 3D Steaming <CODE/> Coffee Mug + React/Node/Mongo Cartridges */}
        <group ref={prop2Ref}>
          <PolyglotPlanes />
        </group>

        {/* 03 PROJECTS: 3D Triple-Screen Coding Battlestation + Git Commit Graph */}
        <group ref={prop3Ref}>
          <SystemArchitectureCore />
        </group>

        {/* 04 INSTRUCTOR: 3D Rubber Duck Debugger 🦆 Wearing Pixel Glasses + Syntax Blocks */}
        <group ref={prop4Ref}>
          <CodeMonolith />
        </group>

        {/* 05 AGILE / PM: 3D Kanban Sprint Board + "SHIP IT!" Launch Rocket 🚀 */}
        <group ref={prop5Ref}>
          <AgileRadarNexus />
        </group>

        {/* 06 CONTACT: 3D Retro CRT Hacker Monitors (>_ ZSH) + RGB Mechanical Keyboard */}
        <group ref={prop6Ref}>
          <ServerRack />
        </group>
      </Canvas>
    </div>
  );
}
