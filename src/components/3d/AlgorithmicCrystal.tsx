import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createCodeScreenTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function AlgorithmicCrystal() {
  const rootRef = useRef<THREE.Group>(null!);
  const laptopRef = useRef<THREE.Group>(null!);
  const astGroupRef = useRef<THREE.Group>(null!);
  const leftBraceRef = useRef<THREE.Group>(null!);
  const rightBraceRef = useRef<THREE.Group>(null!);

  const ideTexture = useMemo(() => {
    return createCodeScreenTexture(
      'AVL_TREE.TS // O(log n)',
      [
        { text: 'class AVLTree<T> {', color: '#F2C94C' },
        { text: '  insert(node, key): Node {', color: '#38BDF8' },
        { text: '    const bal = getBalance(node);', color: '#F3E7D3' },
        { text: '    if (bal > 1) return rotR(node);', color: '#10B981' },
        { text: '    return O_log_n_verified();', color: '#E62E25' },
        { text: '  }', color: '#38BDF8' },
        { text: '}', color: '#F2C94C' },
      ],
      '#F2C94C'
    );
  }, []);

  const treeNodes = useMemo(
    () => [
      [0, 1.35, 0.1],
      [-0.65, 0.85, 0.15],
      [0.65, 0.85, 0.15],
      [-1.0, 0.38, 0.2],
      [-0.3, 0.38, 0.2],
      [0.3, 0.38, 0.2],
      [1.0, 0.38, 0.2],
    ],
    []
  );

  const treeLines = useMemo(() => {
    const pairs = [
      [treeNodes[0], treeNodes[1]],
      [treeNodes[0], treeNodes[2]],
      [treeNodes[1], treeNodes[3]],
      [treeNodes[1], treeNodes[4]],
      [treeNodes[2], treeNodes[5]],
      [treeNodes[2], treeNodes[6]],
    ];
    return pairs.map(([a, b]) =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a[0], a[1], a[2]),
        new THREE.Vector3(b[0], b[1], b[2]),
      ])
    );
  }, [treeNodes]);

  useFrame(({ clock, pointer }, delta) => {
    if (!laptopRef.current) return;
    let obj: THREE.Object3D | null = laptopRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    const impulse = avatarPhysicsImpulse.energy;

    laptopRef.current.position.y = Math.sin(t * 1.6) * 0.08 + impulse * 0.12;
    laptopRef.current.rotation.y = THREE.MathUtils.damp(
      laptopRef.current.rotation.y,
      0.32 + Math.sin(t * 0.6) * 0.12 + pointer.x * 0.28,
      5,
      delta
    );
    laptopRef.current.rotation.x = THREE.MathUtils.damp(
      laptopRef.current.rotation.x,
      0.18 - pointer.y * 0.18,
      5,
      delta
    );

    if (astGroupRef.current) {
      astGroupRef.current.position.y = Math.sin(t * 2.2) * 0.06;
      astGroupRef.current.rotation.y = Math.sin(t * 0.8) * 0.2;
    }

    if (leftBraceRef.current && rightBraceRef.current) {
      const expand = 1.45 + Math.sin(t * 2.4) * 0.1 + impulse * 0.22;
      leftBraceRef.current.position.x = -expand;
      rightBraceRef.current.position.x = expand;
      leftBraceRef.current.rotation.z = Math.sin(t * 1.5) * 0.1;
      rightBraceRef.current.rotation.z = -Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group ref={rootRef} position={[-1.25, -3.8, -1.3]}>
      <group ref={laptopRef}>
        {/* Laptop Keyboard Base Deck */}
        <group position={[0, -0.55, 0.35]} rotation={[0.15, 0, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.09, 1.45]} />
            <meshStandardMaterial color="#1E192B" metalness={0.85} roughness={0.22} />
          </mesh>
          {/* Glowing RGB Keyboard Matrix */}
          <mesh position={[0, 0.05, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.85, 0.78, 10, 4]} />
            <meshBasicMaterial color="#F2C94C" wireframe transparent opacity={0.65} />
          </mesh>
          {/* Trackpad */}
          <mesh position={[0, 0.05, 0.46]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.62, 0.36]} />
            <meshStandardMaterial color="#2A194D" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

        {/* Laptop Hinged Display Screen */}
        <group position={[0, 0.18, -0.32]} rotation={[-0.18, 0, 0]}>
          {/* Outer Lid Casing */}
          <mesh>
            <boxGeometry args={[2.2, 1.42, 0.07]} />
            <meshStandardMaterial color="#120F1A" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Glowing VS Code / IDE Screen */}
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[2.06, 1.28]} />
            <meshBasicMaterial map={ideTexture} />
          </mesh>
        </group>

        {/* Floating Holographic Binary Search Tree Above Laptop */}
        <group ref={astGroupRef} position={[0, 0.45, 0.25]}>
          {treeNodes.map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshStandardMaterial
                color={i === 0 ? '#E62E25' : '#10B981'}
                emissive={i === 0 ? '#E62E25' : '#10B981'}
                emissiveIntensity={0.9}
              />
            </mesh>
          ))}
          {treeLines.map((geo, i) => (
            /* @ts-expect-error line takes geometry */
            <line key={i} geometry={geo}>
              <lineBasicMaterial color="#F2C94C" transparent opacity={0.85} />
            </line>
          ))}
        </group>

        {/* 3D Sculpted Curly Braces { } Flanking the Laptop */}
        <group ref={leftBraceRef} position={[-1.45, 0.1, 0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.12, 1.1, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.14, 0.5, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.14, -0.5, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial color="#E62E25" emissive="#E62E25" emissiveIntensity={0.8} />
          </mesh>
        </group>

        <group ref={rightBraceRef} position={[1.45, 0.1, 0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.12, 1.1, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.14, 0.5, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.14, -0.5, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.12]} />
            <meshStandardMaterial color="#F2C94C" emissive="#D99B1E" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial color="#E62E25" emissive="#E62E25" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>

      <pointLight color="#F2C94C" intensity={2.4} distance={8} decay={2} />
    </group>
  );
}
