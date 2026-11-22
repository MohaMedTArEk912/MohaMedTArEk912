import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createCodeScreenTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function ServerRack() {
  const rootRef = useRef<THREE.Group>(null!);
  const leftCrtRef = useRef<THREE.Group>(null!);
  const rightCrtRef = useRef<THREE.Group>(null!);
  const keyboardRef = useRef<THREE.Group>(null!);

  const zshScreenTex = useMemo(() => {
    return createCodeScreenTexture(
      'ZSH // TERMINAL v4.0',
      [
        { text: '$ whoami', color: '#F2C94C' },
        { text: '> Mohamed Tarek (Full-Stack)', color: '#10B981' },
        { text: '$ npm run build', color: '#F2C94C' },
        { text: '✓ 0 errors • 60FPS ready!', color: '#38BDF8' },
        { text: '$ sudo hire --immediate █', color: '#E62E25' },
      ],
      '#F2C94C'
    );
  }, []);

  const gitScreenTex = useMemo(() => {
    return createCodeScreenTexture(
      'GIT // DEPLOY DISPATCH',
      [
        { text: '$ git status', color: '#F2C94C' },
        { text: 'On branch main (clean)', color: '#F3E7D3' },
        { text: '$ git push origin prod', color: '#10B981' },
        { text: 'Enumerating objects: 100%', color: '#38BDF8' },
        { text: '★ READY FOR HIRE! ★', color: '#E62E25' },
      ],
      '#E62E25'
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

    if (leftCrtRef.current) {
      leftCrtRef.current.position.y = 0.55 + Math.sin(t * 1.7) * 0.09 + impulse * 0.14;
      leftCrtRef.current.rotation.y = THREE.MathUtils.damp(
        leftCrtRef.current.rotation.y,
        0.35 + pointer.x * 0.25,
        5,
        delta
      );
    }

    if (rightCrtRef.current) {
      rightCrtRef.current.position.y = 0.55 + Math.cos(t * 1.7) * 0.09 + impulse * 0.14;
      rightCrtRef.current.rotation.y = THREE.MathUtils.damp(
        rightCrtRef.current.rotation.y,
        -0.35 + pointer.x * 0.25,
        5,
        delta
      );
    }

    if (keyboardRef.current) {
      keyboardRef.current.position.y = -0.85 + Math.sin(t * 2.1) * 0.05 - impulse * 0.1;
      keyboardRef.current.rotation.x = 0.45 - pointer.y * 0.15;
      keyboardRef.current.rotation.y = pointer.x * 0.2;
    }
  });

  return (
    <group ref={rootRef} position={[2.15, -30.2, -1.7]}>
      {/* Left Floating Retro CRT Hacker Monitor */}
      <group ref={leftCrtRef} position={[-1.65, 0.55, 0]}>
        {/* Chunky Retro CRT Monitor Housing */}
        <mesh position={[0, 0, -0.18]}>
          <boxGeometry args={[1.55, 1.15, 0.55]} />
          <meshStandardMaterial color="#1E192B" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Front Bezel */}
        <mesh>
          <boxGeometry args={[1.65, 1.22, 0.12]} />
          <meshStandardMaterial color="#120F1A" roughness={0.25} metalness={0.7} />
        </mesh>
        {/* Glowing ZSH Terminal Screen */}
        <mesh position={[0, 0.03, 0.068]}>
          <planeGeometry args={[1.46, 0.96]} />
          <meshBasicMaterial map={zshScreenTex} />
        </mesh>
        {/* Green Power LED */}
        <mesh position={[0.65, -0.52, 0.07]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      </group>

      {/* Right Floating Retro CRT Git Monitor */}
      <group ref={rightCrtRef} position={[1.65, 0.55, 0]}>
        <mesh position={[0, 0, -0.18]}>
          <boxGeometry args={[1.55, 1.15, 0.55]} />
          <meshStandardMaterial color="#1E192B" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.65, 1.22, 0.12]} />
          <meshStandardMaterial color="#120F1A" roughness={0.25} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.03, 0.068]}>
          <planeGeometry args={[1.46, 0.96]} />
          <meshBasicMaterial map={gitScreenTex} />
        </mesh>
        <mesh position={[0.65, -0.52, 0.07]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#F2C94C" />
        </mesh>
      </group>

      {/* Floating 3D RGB Mechanical Keyboard Deck */}
      <group ref={keyboardRef} position={[0, -0.85, 0.25]} rotation={[0.45, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 0.12, 0.85]} />
          <meshStandardMaterial color="#120F1A" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Glowing RGB Underglow Strip */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[2.56, 0.04, 0.9]} />
          <meshStandardMaterial color="#F2C94C" emissive="#F2C94C" emissiveIntensity={0.85} />
        </mesh>
        {/* Row of Colorful Mechanical Keycaps */}
        {[-0.95, -0.55, -0.15, 0.25, 0.65, 1.0].map((kx, idx) => (
          <mesh key={idx} position={[kx, 0.1, -0.15]}>
            <boxGeometry args={[0.28, 0.1, 0.26]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#E62E25' : '#F2C94C'}
              roughness={0.25}
            />
          </mesh>
        ))}
        {/* Spacebar */}
        <mesh position={[0, 0.1, 0.2]}>
          <boxGeometry args={[1.25, 0.1, 0.24]} />
          <meshStandardMaterial color="#10B981" roughness={0.25} />
        </mesh>
      </group>

      <pointLight color="#F2C94C" intensity={1.8} distance={5} position={[0, 0, 0.5]} />
    </group>
  );
}
