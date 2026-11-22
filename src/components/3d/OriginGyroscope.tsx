import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createKeycapTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

const KEYCAP_CONFIGS = [
  { symbol: '</>', sub: 'JSX', color: '#F2C94C', angle: 0.25 },
  { symbol: '{ }', sub: 'CODE', color: '#E62E25', angle: 1.25 },
  { symbol: 'TS', sub: 'TYPE', color: '#38BDF8', angle: 2.25 },
  { symbol: 'JS', sub: 'ES6+', color: '#F2C94C', angle: 3.35 },
  { symbol: 'GIT', sub: 'PUSH', color: '#10B981', angle: 4.35 },
  { symbol: 'RUN', sub: 'EXEC', color: '#A855F7', angle: 5.35 },
];

export function OriginGyroscope() {
  const rootRef = useRef<THREE.Group>(null!);
  const orbitGroupRef = useRef<THREE.Group>(null!);
  const keycapRefs = useRef<(THREE.Group | null)[]>([]);
  const haloRingRef = useRef<THREE.Mesh>(null!);

  const keyTextures = useMemo(() => {
    return KEYCAP_CONFIGS.map((cfg) => createKeycapTexture(cfg.symbol, cfg.sub, cfg.color));
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

    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.z = Math.sin(t * 0.35) * 0.08;
      orbitGroupRef.current.rotation.y = THREE.MathUtils.damp(
        orbitGroupRef.current.rotation.y,
        pointer.x * 0.28,
        5,
        delta
      );
      orbitGroupRef.current.rotation.x = THREE.MathUtils.damp(
        orbitGroupRef.current.rotation.x,
        -pointer.y * 0.22,
        5,
        delta
      );
    }

    if (haloRingRef.current) {
      haloRingRef.current.rotation.z = -t * 0.25;
      const scale = 1 + Math.sin(t * 2.5) * 0.04 + impulse * 0.08;
      haloRingRef.current.scale.setScalar(scale);
    }

    // Animate each 3D Mechanical Keycap with rhythmic keystroke presses & click bounce
    keycapRefs.current.forEach((keyGroup, i) => {
      if (!keyGroup) return;
      const cfg = KEYCAP_CONFIGS[i];
      const floatAngle = cfg.angle + Math.sin(t * 0.5 + i) * 0.08;
      const rx = Math.cos(floatAngle) * 1.95;
      const ry = Math.sin(floatAngle) * 1.38 + 0.15;

      // Keystroke press-down wave + click impulse depression
      const autoPress = Math.pow(Math.max(0, Math.sin(t * 2.8 - i * 1.05)), 4) * 0.16;
      const clickPress = impulse * 0.18;
      const zPress = -(autoPress + clickPress);

      keyGroup.position.set(rx, ry + Math.sin(t * 1.8 + i) * 0.06, zPress);
      keyGroup.rotation.y = -rx * 0.18 + Math.sin(t * 1.4 + i) * 0.12;
      keyGroup.rotation.x = ry * 0.12 + 0.25;
      keyGroup.rotation.z = Math.cos(t * 1.2 + i) * 0.08;
    });
  });

  return (
    <group ref={rootRef} position={[-2.15, 0.15, -1.25]}>
      {/* Warm Golden Coding Halo Ring Behind Avatar */}
      <mesh ref={haloRingRef} position={[0, 0.15, -0.35]}>
        <ringGeometry args={[1.35, 1.44, 64]} />
        <meshBasicMaterial
          color="#F2C94C"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Dashed Code Orbit Track */}
      <mesh position={[0, 0.15, -0.4]}>
        <torusGeometry args={[1.85, 0.015, 12, 80]} />
        <meshStandardMaterial
          color="#5B3E96"
          emissive="#5B3E96"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 6 Orbiting 3D RGB Mechanical Keyboard Keycaps */}
      <group ref={orbitGroupRef}>
        {KEYCAP_CONFIGS.map((cfg, i) => (
          <group
            key={cfg.symbol}
            ref={(el) => {
              keycapRefs.current[i] = el;
            }}
          >
            {/* Dark Mechanical Switch Bottom Housing */}
            <mesh position={[0, 0, -0.14]}>
              <boxGeometry args={[0.62, 0.62, 0.12]} />
              <meshStandardMaterial color="#09080D" roughness={0.4} metalness={0.7} />
            </mesh>

            {/* Glowing RGB Underglow Switch Stem */}
            <mesh position={[0, 0, -0.06]}>
              <boxGeometry args={[0.56, 0.56, 0.06]} />
              <meshStandardMaterial
                color={cfg.color}
                emissive={cfg.color}
                emissiveIntensity={1.1}
                roughness={0.2}
              />
            </mesh>

            {/* Sculpted Keycap Skirt */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.54, 0.54, 0.16]} />
              <meshStandardMaterial color="#1E192B" roughness={0.28} metalness={0.5} />
            </mesh>

            {/* Printed Keycap Top Dish with Code Symbol */}
            <mesh position={[0, 0, 0.125]}>
              <planeGeometry args={[0.48, 0.48]} />
              <meshBasicMaterial map={keyTextures[i]} />
            </mesh>
          </group>
        ))}
      </group>

      <pointLight color="#F2C94C" intensity={2.2} distance={7} decay={1.8} />
      <pointLight color="#5B3E96" intensity={1.8} distance={5} decay={2} />
    </group>
  );
}
