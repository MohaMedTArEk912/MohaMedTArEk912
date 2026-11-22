import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createKeycapTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function CodeMonolith() {
  const rootRef = useRef<THREE.Group>(null!);
  const duckRef = useRef<THREE.Group>(null!);
  const orbitGroupRef = useRef<THREE.Group>(null!);
  const rippleRef = useRef<THREE.Mesh>(null!);

  const tokens = useMemo(
    () => [
      { label: 'ASYNC', sub: 'EVENT', color: '#F2C94C', r: 1.75, y: 0.65 },
      { label: 'CLASS', sub: 'OOP', color: '#E62E25', r: 1.9, y: 0.15 },
      { label: 'YIELD', sub: 'GEN*', color: '#10B981', r: 1.7, y: -0.45 },
      { label: 'STRUCT', sub: 'CACHE', color: '#38BDF8', r: 1.95, y: -0.75 },
      { label: 'FN()', sub: 'SCOPE', color: '#A855F7', r: 1.8, y: 0.45 },
    ],
    []
  );

  const tokenTextures = useMemo(() => {
    return tokens.map((tok) => createKeycapTexture(tok.label, tok.sub, tok.color));
  }, [tokens]);

  useFrame(({ clock, pointer }, delta) => {
    if (!duckRef.current) return;
    let obj: THREE.Object3D | null = duckRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    const impulse = avatarPhysicsImpulse.energy;

    // Happy Rubber Duck Debugger bobbing, rocking, and click-jumping!
    duckRef.current.position.y = Math.sin(t * 2.4) * 0.12 + impulse * 0.28;
    duckRef.current.rotation.y = THREE.MathUtils.damp(
      duckRef.current.rotation.y,
      -0.45 + Math.sin(t * 0.9) * 0.25 + pointer.x * 0.35 + avatarPhysicsImpulse.spinPulse,
      5,
      delta
    );
    duckRef.current.rotation.z = Math.sin(t * 2.1) * 0.09;
    duckRef.current.rotation.x = Math.cos(t * 1.8) * 0.06 - pointer.y * 0.15;

    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = t * 0.42 - pointer.x * 0.2;
    }

    if (rippleRef.current) {
      const s = 1 + Math.sin(t * 3.0) * 0.08 + impulse * 0.2;
      rippleRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group ref={rootRef} position={[1.25, -25.8, -1.3]}>
      {/* =====================================================================
          1. 3D RUBBER DUCK DEBUGGER WEARING PIXEL CODER GLASSES 🦆
          ===================================================================== */}
      <group ref={duckRef}>
        {/* Plump Yellow Duck Body */}
        <mesh position={[0, -0.22, 0]} scale={[0.78, 0.56, 0.92]}>
          <sphereGeometry args={[0.85, 28, 28]} />
          <meshStandardMaterial
            color="#F2C94C"
            emissive="#D99B1E"
            emissiveIntensity={0.22}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Left & Right Sculpted Duck Wings */}
        <mesh position={[-0.62, -0.18, 0.05]} rotation={[0.1, 0, 0.2]} scale={[0.22, 0.38, 0.58]}>
          <sphereGeometry args={[0.75, 20, 20]} />
          <meshStandardMaterial color="#E5B83B" roughness={0.3} />
        </mesh>
        <mesh position={[0.62, -0.18, 0.05]} rotation={[0.1, 0, -0.2]} scale={[0.22, 0.38, 0.58]}>
          <sphereGeometry args={[0.75, 20, 20]} />
          <meshStandardMaterial color="#E5B83B" roughness={0.3} />
        </mesh>

        {/* Duck Tail Feather */}
        <mesh position={[0, -0.02, -0.78]} rotation={[-0.55, 0, 0]}>
          <coneGeometry args={[0.26, 0.45, 16]} />
          <meshStandardMaterial color="#F2C94C" roughness={0.25} />
        </mesh>

        {/* Round Duck Head */}
        <mesh position={[0, 0.46, 0.32]}>
          <sphereGeometry args={[0.46, 28, 28]} />
          <meshStandardMaterial
            color="#F2C94C"
            emissive="#D99B1E"
            emissiveIntensity={0.22}
            roughness={0.25}
          />
        </mesh>

        {/* Bright Orange Duck Beak / Bill */}
        <mesh position={[0, 0.38, 0.78]} scale={[0.65, 0.28, 0.55]}>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial
            color="#F97316"
            emissive="#EA580C"
            emissiveIntensity={0.35}
            roughness={0.25}
          />
        </mesh>

        {/* Cool "Deal-With-It" Pixel Coder Sunglasses */}
        <group position={[0, 0.54, 0.72]}>
          {/* Top Sunglasses Bridge Bar */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.76, 0.06, 0.08]} />
            <meshStandardMaterial color="#09080D" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Left Pixel Lens */}
          <mesh position={[-0.2, -0.02, 0]}>
            <boxGeometry args={[0.28, 0.16, 0.08]} />
            <meshStandardMaterial color="#09080D" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Right Pixel Lens */}
          <mesh position={[0.2, -0.02, 0]}>
            <boxGeometry args={[0.28, 0.16, 0.08]} />
            <meshStandardMaterial color="#09080D" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Pixel Glint Bars on Lenses */}
          <mesh position={[-0.24, 0.0, 0.045]}>
            <boxGeometry args={[0.06, 0.1, 0.02]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
          <mesh position={[0.16, 0.0, 0.045]}>
            <boxGeometry args={[0.06, 0.1, 0.02]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
        </group>
      </group>

      {/* Glowing Debugging Pond Ripple Ring */}
      <mesh ref={rippleRef} position={[0, -0.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.12, 48]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* =====================================================================
          2. ORBITING 3D SYNTAX SPELL BLOCKS (ASYNC, CLASS, YIELD, STRUCT, FN)
          ===================================================================== */}
      <group ref={orbitGroupRef}>
        {tokens.map((tok, i) => {
          const angle = (i / tokens.length) * Math.PI * 2;
          const x = Math.cos(angle) * tok.r;
          const z = Math.sin(angle) * tok.r;
          return (
            <group key={tok.label} position={[x, tok.y, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh>
                <boxGeometry args={[0.52, 0.52, 0.14]} />
                <meshStandardMaterial
                  color="#120F1A"
                  emissive={tok.color}
                  emissiveIntensity={0.4}
                  metalness={0.75}
                  roughness={0.25}
                />
              </mesh>
              <mesh position={[0, 0, 0.075]}>
                <planeGeometry args={[0.46, 0.46]} />
                <meshBasicMaterial map={tokenTextures[i]} />
              </mesh>
            </group>
          );
        })}
      </group>

      <pointLight color="#F2C94C" intensity={2.2} distance={6} decay={2} />
    </group>
  );
}
