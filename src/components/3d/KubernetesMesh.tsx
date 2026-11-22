import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const INSTANCE_COUNT = 16;

export function KubernetesMesh() {
  const rootRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const railContainerRef = useRef<THREE.Mesh>(null!);

  const gridData = useMemo(() => {
    const data = [];
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = (col - 1.5) * 0.95;
      const z = (row - 1.5) * 0.95;
      data.push({ x, z, initialY: -0.5, phase: col * 0.4 + row * 0.3 });
    }
    return data;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    let obj: THREE.Object3D | null = meshRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    gridData.forEach((node, i) => {
      const yOffset = Math.sin(t * 2.2 + node.phase) * 0.14;
      dummy.position.set(node.x, node.initialY + yOffset, node.z);
      dummy.rotation.y = Math.sin(t * 0.5 + node.phase) * 0.06 + pointer.x * 0.15;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (railContainerRef.current) {
      const railProgress = (t * 0.35) % 1;
      railContainerRef.current.position.x = -1.8 + railProgress * 3.6;
      railContainerRef.current.position.y = Math.sin(railProgress * Math.PI) * 0.15;
      railContainerRef.current.rotation.y = t * 1.5;
    }
  });

  return (
    <group ref={rootRef} position={[-2.1, -15.4, -1.6]} scale={[0.72, 0.72, 0.72]}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, INSTANCE_COUNT]}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[0.65, 0.32, 0.65]} />
        <meshStandardMaterial
          color="#10B981"
          metalness={0.85}
          roughness={0.2}
          emissive="#064E3B"
          emissiveIntensity={0.35}
        />
      </instancedMesh>

      <group position={[0, 1.15, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 3.8, 16]} />
          <meshStandardMaterial color="#CBC0E3" metalness={0.9} roughness={0.1} />
        </mesh>

        <mesh ref={railContainerRef} position={[-1.8, 0, 0]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial
            color="#F2C94C"
            emissive="#F2C94C"
            emissiveIntensity={0.8}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      <gridHelper args={[4.2, 8, '#10b981', '#2A194D']} position={[0, -0.8, 0]} />
    </group>
  );
}
