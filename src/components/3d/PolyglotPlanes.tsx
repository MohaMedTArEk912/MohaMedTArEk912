import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMugBadgeTexture, createKeycapTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function PolyglotPlanes() {
  const groupRef = useRef<THREE.Group>(null!);
  const mugRef = useRef<THREE.Group>(null!);
  const stackRef = useRef<THREE.Group>(null!);
  const steamRefs = useRef<(THREE.Mesh | null)[]>([]);
  const packetRef = useRef<THREE.Mesh>(null!);

  const mugTexture = useMemo(() => createMugBadgeTexture(), []);
  const reactTex = useMemo(() => createKeycapTexture('REACT', 'FRONTEND', '#38BDF8', '#101827'), []);
  const nodeTex = useMemo(() => createKeycapTexture('NODE', 'SOCKET.IO', '#10B981', '#0D1F17'), []);
  const mongoTex = useMemo(() => createKeycapTexture('MONGO', 'DATABASE', '#F2C94C', '#1F190D'), []);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return;
    let obj: THREE.Object3D | null = groupRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    const impulse = avatarPhysicsImpulse.energy;

    if (mugRef.current) {
      mugRef.current.position.y = 0.25 + Math.sin(t * 1.8) * 0.1 + impulse * 0.16;
      mugRef.current.rotation.y = THREE.MathUtils.damp(
        mugRef.current.rotation.y,
        -0.4 + Math.sin(t * 0.9) * 0.35 + pointer.x * 0.3,
        5,
        delta
      );
      mugRef.current.rotation.z = Math.sin(t * 1.4) * 0.08 + pointer.y * 0.12;
    }

    // Animate rising espresso steam rings
    steamRefs.current.forEach((steam, i) => {
      if (!steam) return;
      const cycle = ((t * 0.75 + i * 0.33) % 1);
      steam.position.y = 0.72 + cycle * 0.85;
      steam.position.x = Math.sin(t * 2.5 + i * 2) * 0.1;
      const scale = 0.55 + cycle * 0.75;
      steam.scale.setScalar(scale);
      const mat = steam.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - cycle) * 0.55;
    });

    if (stackRef.current) {
      stackRef.current.rotation.y = THREE.MathUtils.damp(
        stackRef.current.rotation.y,
        -0.25 + pointer.x * 0.25,
        4,
        delta
      );
      stackRef.current.children.forEach((child, idx) => {
        child.position.y = (1 - idx) * 0.72 + Math.sin(t * 2.2 - idx * 0.9) * 0.06;
        child.rotation.z = Math.sin(t * 1.5 + idx) * 0.05;
      });
    }

    if (packetRef.current) {
      packetRef.current.position.y = Math.sin(t * 4.5) * 0.75;
    }
  });

  return (
    <group ref={groupRef} position={[1.25, -8.2, -1.3]}>
      {/* =====================================================================
          1. 3D STEAMING "<CODE/> FUEL" DEVELOPER COFFEE MUG
          ===================================================================== */}
      <group ref={mugRef} position={[-0.85, 0.25, 0.2]}>
        {/* Ceramic Mug Outer Cylinder with Printed <CODE/> Badge */}
        <mesh>
          <cylinderGeometry args={[0.56, 0.50, 1.18, 32]} />
          <meshStandardMaterial map={mugTexture} roughness={0.22} metalness={0.15} />
        </mesh>

        {/* Mug Rim */}
        <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54, 0.04, 16, 32]} />
          <meshStandardMaterial color="#F3E7D3" roughness={0.2} />
        </mesh>

        {/* Hot Dark Espresso Surface Inside Mug */}
        <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.50, 28]} />
          <meshStandardMaterial color="#241208" roughness={0.15} metalness={0.3} />
        </mesh>

        {/* Sculpted C-Shaped Mug Handle */}
        <mesh position={[0.56, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.34, 0.075, 16, 28, Math.PI]} />
          <meshStandardMaterial color="#09080D" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Rising Animated 3D Steam Rings */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              steamRefs.current[i] = el;
            }}
            position={[0, 0.8 + i * 0.25, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.24, 0.025, 12, 24]} />
            <meshBasicMaterial color="#F3E7D3" transparent opacity={0.45} />
          </mesh>
        ))}
      </group>

      {/* =====================================================================
          2. 3-TIER FULL-STACK CARTRIDGE STACK (REACT + NODE + MONGO)
          ===================================================================== */}
      <group ref={stackRef} position={[0.95, 0.0, -0.1]}>
        {[
          { tex: reactTex, border: '#38BDF8', y: 0.72 },
          { tex: nodeTex, border: '#10B981', y: 0.0 },
          { tex: mongoTex, border: '#F2C94C', y: -0.72 },
        ].map((tier, idx) => (
          <group key={idx} position={[0, tier.y, 0]}>
            <mesh>
              <boxGeometry args={[1.35, 0.42, 0.32]} />
              <meshStandardMaterial
                color="#120F1A"
                emissive={tier.border}
                emissiveIntensity={0.28}
                metalness={0.75}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[0, 0, 0.165]}>
              <planeGeometry args={[1.26, 0.36]} />
              <meshBasicMaterial map={tier.tex} />
            </mesh>
          </group>
        ))}

        {/* High-Speed WebSocket Data Orb Syncing Between Stack Layers */}
        <mesh ref={packetRef} position={[-0.78, 0, 0.2]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#F2C94C" emissive="#F2C94C" emissiveIntensity={1.4} />
        </mesh>
      </group>

      <pointLight color="#F2C94C" intensity={2.2} distance={6} decay={2} />
    </group>
  );
}
