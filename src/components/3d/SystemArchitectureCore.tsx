import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createCodeScreenTexture } from './codingTextureUtils';
import { avatarPhysicsImpulse } from './AvatarScrollDirector';

export function SystemArchitectureCore() {
  const groupRef = useRef<THREE.Group>(null!);
  const monitorsRef = useRef<THREE.Group>(null!);
  const gitGraphRef = useRef<THREE.Group>(null!);

  const screens = useMemo(
    () => [
      {
        pos: [-1.25, 0.35, 0.25] as [number, number, number],
        rotY: 0.42,
        accent: '#F2C94C',
        tex: createCodeScreenTexture(
          'AKASHA_AI.TS',
          [
            { text: 'const schema = await synthesize(', color: '#F2C94C' },
            { text: '  prompt, { db: "Neo4j+SQL" }', color: '#38BDF8' },
            { text: ');', color: '#F2C94C' },
            { text: 'socket.emit("sync:canvas", {', color: '#10B981' },
            { text: '  latencyMs: 14, nodes: 48', color: '#F3E7D3' },
            { text: '});', color: '#10B981' },
          ],
          '#F2C94C'
        ),
      },
      {
        pos: [0, 0.55, -0.15] as [number, number, number],
        rotY: 0.0,
        accent: '#10B981',
        tex: createCodeScreenTexture(
          'ICU_VITALS.JS',
          [
            { text: 'io.on("vitals:stream", (pkt) => {', color: '#10B981' },
            { text: '  if (pkt.spo2 < 92) {', color: '#E62E25' },
            { text: '    dispatchTriageAlert(pkt.bed);', color: '#F2C94C' },
            { text: '  }', color: '#E62E25' },
            { text: '  redis.publish("icu", pkt);', color: '#38BDF8' },
            { text: '});', color: '#10B981' },
          ],
          '#10B981'
        ),
      },
      {
        pos: [1.25, 0.35, 0.25] as [number, number, number],
        rotY: -0.42,
        accent: '#E62E25',
        tex: createCodeScreenTexture(
          'QUIZ_ARENA.TS',
          [
            { text: 'export function tickArena() {', color: '#E62E25' },
            { text: '  const drift = syncServerClock();', color: '#F3E7D3' },
            { text: '  rooms.broadcast("leaderboard", {', color: '#F2C94C' },
            { text: '    activeRooms: 1024, drift: 0', color: '#10B981' },
            { text: '  });', color: '#F2C94C' },
            { text: '}', color: '#E62E25' },
          ],
          '#E62E25'
        ),
      },
    ],
    []
  );

  const gitCommits = useMemo(
    () => [
      { pos: [-1.4, -0.85, 0.2], color: '#10B981' },
      { pos: [-0.5, -0.85, 0.2], color: '#10B981' },
      { pos: [0.0, -0.42, 0.45], color: '#F2C94C' },
      { pos: [0.55, -0.42, 0.45], color: '#F2C94C' },
      { pos: [0.5, -0.85, 0.2], color: '#10B981' },
      { pos: [1.35, -0.85, 0.2], color: '#E62E25' },
    ],
    []
  );

  const gitBranchLines = useMemo(() => {
    const pairs = [
      [gitCommits[0].pos, gitCommits[1].pos],
      [gitCommits[1].pos, gitCommits[4].pos],
      [gitCommits[4].pos, gitCommits[5].pos],
      // Feature branch fork & merge
      [gitCommits[1].pos, gitCommits[2].pos],
      [gitCommits[2].pos, gitCommits[3].pos],
      [gitCommits[3].pos, gitCommits[5].pos],
    ];
    return pairs.map(([a, b]) =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a[0], a[1], a[2]),
        new THREE.Vector3(b[0], b[1], b[2]),
      ])
    );
  }, [gitCommits]);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return;
    let obj: THREE.Object3D | null = groupRef.current;
    while (obj) {
      if (!obj.visible) return;
      obj = obj.parent;
    }

    const t = clock.getElapsedTime();
    const impulse = avatarPhysicsImpulse.energy;

    if (monitorsRef.current) {
      monitorsRef.current.position.y = Math.sin(t * 1.4) * 0.09 + impulse * 0.14;
      monitorsRef.current.rotation.y = THREE.MathUtils.damp(
        monitorsRef.current.rotation.y,
        -0.22 + pointer.x * 0.26,
        5,
        delta
      );
      monitorsRef.current.rotation.x = THREE.MathUtils.damp(
        monitorsRef.current.rotation.x,
        -pointer.y * 0.16,
        5,
        delta
      );
    }

    if (gitGraphRef.current) {
      gitGraphRef.current.position.y = Math.sin(t * 2.2) * 0.06;
      gitGraphRef.current.rotation.y = Math.sin(t * 0.6) * 0.14;
    }
  });

  return (
    <group ref={groupRef} position={[-1.25, -12.6, -1.3]}>
      {/* 3 Curved Floating Coding Battlestation Monitors */}
      <group ref={monitorsRef}>
        {screens.map((scr, idx) => (
          <group key={idx} position={scr.pos} rotation={[0, scr.rotY, 0]}>
            <mesh>
              <boxGeometry args={[1.32, 0.88, 0.06]} />
              <meshStandardMaterial
                color="#120F1A"
                emissive={scr.accent}
                emissiveIntensity={0.22}
                metalness={0.8}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[1.24, 0.8]} />
              <meshBasicMaterial map={scr.tex} />
            </mesh>
          </group>
        ))}

        {/* 3D Interactive Git Branch & Merge Commit Tree Below the Monitors */}
        <group ref={gitGraphRef}>
          {gitCommits.map((c, idx) => (
            <group key={idx} position={c.pos as [number, number, number]}>
              <mesh>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                  color={c.color}
                  emissive={c.color}
                  emissiveIntensity={1.0}
                  roughness={0.2}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.16, 0.21, 24]} />
                <meshBasicMaterial color={c.color} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}

          {gitBranchLines.map((geo, i) => (
            /* @ts-expect-error line takes geometry */
            <line key={i} geometry={geo}>
              <lineBasicMaterial color="#F2C94C" transparent opacity={0.9} />
            </line>
          ))}
        </group>
      </group>

      <pointLight color="#F2C94C" intensity={2.4} distance={6} position={[0, 0, 0.8]} />
    </group>
  );
}
