import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createCodeScreenTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function AgileRadarNexus() {
  const rootRef = useRef<THREE.Group>(null!);
  const boardRef = useRef<THREE.Group>(null!);
  const rocketRef = useRef<THREE.Group>(null!);
  const flameRef = useRef<THREE.Mesh>(null!);
  const stickyRefs = useRef<(THREE.Mesh | null)[]>([]);

  const kanbanTexture = useMemo(() => {
    return createCodeScreenTexture(
      'SPRINT_KANBAN // TODO -> DEV -> SHIP!',
      [
        { text: '[TODO]     [IN CODE]    [SHIPPED!]', color: '#F2C94C' },
        { text: '────────   ─────────    ──────────', color: '#5B3E96' },
        { text: ' #104 UI    #102 API     #101 DB  ', color: '#F3E7D3' },
        { text: '            #103 WS      #100 AUTH', color: '#10B981' },
        { text: '                         ✓ MERGED!', color: '#E62E25' },
      ],
      '#10B981'
    );
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current) return;
    let obj: THREE.Object3D | null = rootRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    const impulse = avatarPhysicsImpulse.energy;

    if (boardRef.current) {
      boardRef.current.position.y = Math.sin(t * 1.5) * 0.08;
      boardRef.current.rotation.y = THREE.MathUtils.damp(
        boardRef.current.rotation.y,
        0.28 + pointer.x * 0.25,
        5,
        delta
      );
      boardRef.current.rotation.x = THREE.MathUtils.damp(
        boardRef.current.rotation.x,
        -pointer.y * 0.16,
        5,
        delta
      );
    }

    // Animate 3D Sticky Note Cards sliding across Kanban columns
    stickyRefs.current.forEach((card, i) => {
      if (!card) return;
      const slide = Math.sin(t * 1.6 + i * 1.4) * 0.45;
      card.position.x = slide;
      card.rotation.z = Math.sin(t * 2.5 + i) * 0.08;
    });

    // Animate 3D "SHIP IT!" Rocket hovering and boosting on click impulse!
    if (rocketRef.current) {
      rocketRef.current.position.y = 0.1 + Math.sin(t * 2.8) * 0.16 + impulse * 0.55;
      rocketRef.current.rotation.y = t * 0.8 + pointer.x * 0.3;
      rocketRef.current.rotation.z = -0.15 + Math.sin(t * 2.0) * 0.06;
    }

    if (flameRef.current) {
      const flicker = 0.85 + Math.sin(t * 24) * 0.25 + impulse * 0.6;
      flameRef.current.scale.set(1, flicker, 1);
    }
  });

  return (
    <group ref={rootRef} position={[-1.25, -21.4, -1.3]}>
      {/* =====================================================================
          1. 3D FLOATING KANBAN SPRINT BOARD WITH SLIDING STICKY NOTES
          ===================================================================== */}
      <group ref={boardRef} position={[-0.55, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[2.15, 1.38, 0.08]} />
          <meshStandardMaterial color="#120F1A" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[2.02, 1.26]} />
          <meshBasicMaterial map={kanbanTexture} />
        </mesh>

        {/* 3 Animated 3D Sticky-Note Task Cards */}
        {[
          { y: 0.18, color: '#F2C94C' },
          { y: -0.12, color: '#10B981' },
          { y: -0.4, color: '#E62E25' },
        ].map((note, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              stickyRefs.current[idx] = el;
            }}
            position={[0, note.y, 0.08]}
          >
            <boxGeometry args={[0.42, 0.2, 0.03]} />
            <meshStandardMaterial
              color={note.color}
              emissive={note.color}
              emissiveIntensity={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* =====================================================================
          2. 3D "SHIP IT!" PRODUCTION LAUNCH ROCKET 🚀
          ===================================================================== */}
      <group ref={rocketRef} position={[1.15, 0.1, 0.35]}>
        {/* Rocket Main Fuselage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 1.05, 24]} />
          <meshStandardMaterial color="#F3E7D3" roughness={0.25} metalness={0.3} />
        </mesh>

        {/* Crimson Nose Cone */}
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.26, 0.56, 24]} />
          <meshStandardMaterial
            color="#E62E25"
            emissive="#E62E25"
            emissiveIntensity={0.35}
            roughness={0.2}
          />
        </mesh>

        {/* Glowing Cyan Code Porthole Window */}
        <mesh position={[0, 0.15, 0.26]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#38BDF8"
            emissiveIntensity={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* 3 Rocket Stabilizer Fins */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((ang, i) => (
          <mesh
            key={i}
            position={[Math.sin(ang) * 0.32, -0.38, Math.cos(ang) * 0.32]}
            rotation={[0, ang, 0]}
          >
            <boxGeometry args={[0.06, 0.38, 0.24]} />
            <meshStandardMaterial color="#E62E25" roughness={0.25} />
          </mesh>
        ))}

        {/* Flickering Thruster Exhaust Flame */}
        <mesh ref={flameRef} position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.55, 16]} />
          <meshBasicMaterial color="#F2C94C" />
        </mesh>
      </group>

      <pointLight color="#F2C94C" intensity={2.2} distance={6} decay={2} />
    </group>
  );
}
