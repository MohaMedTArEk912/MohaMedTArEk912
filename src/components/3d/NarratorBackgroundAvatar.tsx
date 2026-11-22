import { useRef, useEffect, useState, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { speechNarrator } from '../../utils/speechNarrator';
import {
  useCinematicAvatarDirector,
  sampleKeyframes,
  avatarPhysicsImpulse,
  type SectionPropItem,
} from './AvatarScrollDirector';

gsap.registerPlugin(ScrollTrigger);

interface AvatarPose {
  rArm: [number, number, number];
  rForeArm: [number, number, number];
  rHand: [number, number, number];
  rFingerCurl: number;
  lArm: [number, number, number];
  lForeArm: [number, number, number];
  lHand: [number, number, number];
  lFingerCurl: number;
}

// 7 Section-Tailored Expressive Keynote Poses
const SECTION_POSES: AvatarPose[] = [
  // 00 ORIGIN: Heroic Executive Stance with slightly raised welcoming right hand
  {
    rArm: [1.32, 0.1, -0.06],
    rForeArm: [0.12, -0.08, -0.68],
    rHand: [0.0, 0.18, -0.12],
    rFingerCurl: 0.65,
    lArm: [1.42, -0.06, 0.05],
    lForeArm: [0.08, 0.0, 0.24],
    lHand: [0.0, 0.0, 0.1],
    lFingerCurl: 0.95,
  },
  // 01 SWE (Stage Left): Right arm gestures dynamically toward the 4-Pillar Mosaic on the right
  {
    rArm: [1.18, 0.16, -0.08],
    rForeArm: [0.14, -0.14, -1.22],
    rHand: [0.0, 0.25, -0.18],
    rFingerCurl: 0.42,
    lArm: [1.42, -0.05, 0.04],
    lForeArm: [0.08, 0.0, 0.22],
    lHand: [0.0, 0.0, 0.1],
    lFingerCurl: 0.95,
  },
  // 02 FULLSTACK (Stage Right): Left arm presents the 3-Tier MERN Stack on the left
  {
    rArm: [1.42, 0.05, -0.04],
    rForeArm: [0.08, 0.0, -0.22],
    rHand: [0.0, 0.0, -0.1],
    rFingerCurl: 0.95,
    lArm: [1.18, -0.16, 0.08],
    lForeArm: [0.14, 0.14, 1.22],
    lHand: [0.0, -0.25, 0.18],
    lFingerCurl: 0.42,
  },
  // 03 PROJECTS (Stage Right Closer Shot): Dual-Arm Master Architect Presentation Pose
  {
    rArm: [1.28, 0.12, -0.06],
    rForeArm: [0.12, -0.1, -0.88],
    rHand: [0.0, 0.2, -0.15],
    rFingerCurl: 0.55,
    lArm: [1.15, -0.18, 0.08],
    lForeArm: [0.15, 0.12, 1.28],
    lHand: [0.0, -0.26, 0.18],
    lFingerCurl: 0.38,
  },
  // 04 INSTRUCTOR (Stage Right): Sensei Open-Palm Teaching Gesture
  {
    rArm: [1.38, 0.06, -0.05],
    rForeArm: [0.1, -0.05, -0.45],
    rHand: [0.0, 0.12, -0.1],
    rFingerCurl: 0.75,
    lArm: [1.16, -0.18, 0.08],
    lForeArm: [0.16, 0.15, 1.26],
    lHand: [0.0, -0.28, 0.2],
    lFingerCurl: 0.35,
  },
  // 06 PM (Stage Left): Tactical War Room Direction Pose
  {
    rArm: [1.2, 0.15, -0.06],
    rForeArm: [0.12, -0.12, -1.18],
    rHand: [0.0, 0.22, -0.16],
    rFingerCurl: 0.48,
    lArm: [1.38, -0.06, 0.05],
    lForeArm: [0.08, 0.0, 0.35],
    lHand: [0.0, 0.0, 0.1],
    lFingerCurl: 0.9,
  },
  // 07 CONTACT (Center Stage): Dual Open-Palm Welcoming / Handshake Invite
  {
    rArm: [1.26, 0.12, -0.06],
    rForeArm: [0.12, -0.1, -0.95],
    rHand: [0.0, 0.2, -0.14],
    rFingerCurl: 0.5,
    lArm: [1.26, -0.12, 0.06],
    lForeArm: [0.12, 0.1, 0.95],
    lHand: [0.0, -0.2, 0.14],
    lFingerCurl: 0.5,
  },
];

interface AvatarPoseVectors {
  rArm: THREE.Vector3;
  rForeArm: THREE.Vector3;
  rHand: THREE.Vector3;
  rFingerCurl: number;
  lArm: THREE.Vector3;
  lForeArm: THREE.Vector3;
  lHand: THREE.Vector3;
  lFingerCurl: number;
}

// Pre-converted Vector3 instances for zero-allocation 60-120FPS frame updates
const SECTION_POSE_VECTORS: AvatarPoseVectors[] = SECTION_POSES.map((pose) => ({
  rArm: new THREE.Vector3(...pose.rArm),
  rForeArm: new THREE.Vector3(...pose.rForeArm),
  rHand: new THREE.Vector3(...pose.rHand),
  rFingerCurl: pose.rFingerCurl,
  lArm: new THREE.Vector3(...pose.lArm),
  lForeArm: new THREE.Vector3(...pose.lForeArm),
  lHand: new THREE.Vector3(...pose.lHand),
  lFingerCurl: pose.lFingerCurl,
}));

const SECTION_THEME_COLORS = [
  new THREE.Color('#F2C94C'), // 00: Sulfur Gold
  new THREE.Color('#CBC0E3'), // 01: Lilac Stone
  new THREE.Color('#5B3E96'), // 02: Mystic Violet
  new THREE.Color('#E62E25'), // 03: Crimson Runic
  new THREE.Color('#10b981'), // 04: Emerald Container Ink
  new THREE.Color('#F2C94C'), // 05: Sulfur Gold
  new THREE.Color('#9888B8'), // 06: Muted Lavender
  new THREE.Color('#D99B1E'), // 07: Aura Amber
];

export function NarratorBackgroundAvatar({
  sectionPropsRefs,
}: {
  sectionPropsRefs?: RefObject<SectionPropItem[]>;
}) {
  const masterGroupRef = useRef<THREE.Group>(null!);
  const modelWrapperRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const pedestalRing1Ref = useRef<THREE.Mesh>(null!);
  const pedestalRing2Ref = useRef<THREE.Mesh>(null!);
  const shockwaveRingRef = useRef<THREE.Mesh>(null!);

  const headBoneRef = useRef<THREE.Bone | null>(null);
  const spineBoneRef = useRef<THREE.Bone | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollProgressRef = useRef({ value: 0 });

  // Load Mohamed's custom rigged suited MetaPerson avatar
  const fbx = useFBX(`${import.meta.env.BASE_URL}avatar/model.fbx`);

  const { normalizedScale, offsetY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const height = size.y || 1.8;

    const targetHeight = 2.05;
    const scaleFactor = targetHeight / height;

    return {
      normalizedScale: scaleFactor,
      offsetY: -center.y * scaleFactor + 0.05,
    };
  }, [fbx]);

  const bonesRef = useRef<Record<string, THREE.Bone>>({});
  const restRotationsRef = useRef<Record<string, THREE.Euler>>({});
  const blinkMeshesRef = useRef<{ mesh: THREE.Mesh; indices: number[] }[]>([]);

  useEffect(() => {
    (window as any).__avatarModel = fbx;
    const boneMap: Record<string, THREE.Bone> = {};
    const restMap: Record<string, THREE.Euler> = {};
    const blinkMeshes: { mesh: THREE.Mesh; indices: number[] }[] = [];

    fbx.traverse((child) => {
      child.frustumCulled = false;

      // Extract TRUE bones (handling duplicate leaf/end-effector bones properly)
      if ((child as THREE.Bone).isBone || child.type === 'Bone') {
        const bone = child as THREE.Bone;
        const existing = boneMap[bone.name];
        if (!existing || bone.children.length > existing.children.length) {
          boneMap[bone.name] = bone;
          restMap[bone.name] = bone.rotation.clone();
        }
      }

      // Authentic PBR Material Tuning (preserves all multi-material arrays, skin, eyes, hair, suit)
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;

        if (mesh.morphTargetDictionary) {
          const dict = mesh.morphTargetDictionary;
          const indices: number[] = [];
          for (const key in dict) {
            const lk = key.toLowerCase();
            if (lk.includes('blink') || lk.includes('eyesclosed')) {
              indices.push(dict[key]);
            }
          }
          if (indices.length > 0) {
            blinkMeshes.push({ mesh, indices });
          }
        }

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (
              'roughness' in mat &&
              typeof (mat as THREE.MeshStandardMaterial).roughness === 'number'
            ) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              const name = (mat.name || mesh.name || '').toLowerCase();

              if (stdMat.map) {
                stdMat.map.colorSpace = THREE.SRGBColorSpace;
              }

              if (name.includes('eye') || name.includes('cornea') || name.includes('iris')) {
                stdMat.roughness = 0.08;
                stdMat.metalness = 0.05;
              } else if (
                name.includes('skin') ||
                name.includes('head') ||
                name.includes('face') ||
                name.includes('body') ||
                name.includes('hand')
              ) {
                stdMat.roughness = 0.48;
                stdMat.metalness = 0.02;
              } else if (name.includes('hair') || name.includes('beard') || name.includes('brow')) {
                stdMat.roughness = 0.58;
                stdMat.metalness = 0.08;
              } else if (name.includes('shoe') || name.includes('boot') || name.includes('belt')) {
                stdMat.roughness = 0.3;
                stdMat.metalness = 0.22;
              } else {
                // Tailored executive suit fabric
                stdMat.roughness = 0.65;
                stdMat.metalness = 0.06;
              }
              stdMat.needsUpdate = true;
            }
          });
        }
      }
    });

    bonesRef.current = boneMap;
    restRotationsRef.current = restMap;
    blinkMeshesRef.current = blinkMeshes;
    headBoneRef.current = boneMap.Head || null;
    spineBoneRef.current = boneMap.Spine1 || boneMap.Spine || null;

    (window as any).__avatarBones = boneMap;

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-root',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.2,
      onUpdate: (self) => {
        scrollProgressRef.current.value = self.progress;
      },
    });

    const unsub = speechNarrator.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
    });

    return () => {
      trigger.kill();
      unsub();
    };
  }, [fbx]);

  // Execute spring-physics avatar & camera director
  useCinematicAvatarDirector({
    avatarGroupRef: masterGroupRef,
    headBoneRef,
    spineBoneRef,
    sectionPropsRefs,
    getScrollProgress: () => scrollProgressRef.current.value,
  });

  // Current smooth interpolated arm/hand offsets and finger curls
  const curRArm = useRef(new THREE.Vector3(...SECTION_POSES[0].rArm));
  const curRForeArm = useRef(new THREE.Vector3(...SECTION_POSES[0].rForeArm));
  const curRHand = useRef(new THREE.Vector3(...SECTION_POSES[0].rHand));
  const curRFingerCurl = useRef(SECTION_POSES[0].rFingerCurl);

  const curLArm = useRef(new THREE.Vector3(...SECTION_POSES[0].lArm));
  const curLForeArm = useRef(new THREE.Vector3(...SECTION_POSES[0].lForeArm));
  const curLHand = useRef(new THREE.Vector3(...SECTION_POSES[0].lHand));
  const curLFingerCurl = useRef(SECTION_POSES[0].lFingerCurl);

  const currentColor = useRef(new THREE.Color('#F2C94C'));
  const targetColorRef = useRef(new THREE.Color('#F2C94C'));

  useFrame(({ clock }, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const p = THREE.MathUtils.clamp(avatarPhysicsImpulse.smoothProgress, 0, 1);
    const px = avatarPhysicsImpulse.smoothPointerX;
    const bones = bonesRef.current;
    const rest = restRotationsRef.current;

    const targetKeyframe = sampleKeyframes(p);
    const targetPose =
      SECTION_POSE_VECTORS[targetKeyframe.sectionIndex] || SECTION_POSE_VECTORS[0];

    // Dynamic Section Theme Light Color
    const sectionIndexFloat = p * (SECTION_THEME_COLORS.length - 1);
    const c0 = Math.floor(sectionIndexFloat);
    const c1 = Math.min(c0 + 1, SECTION_THEME_COLORS.length - 1);
    const cAlpha = sectionIndexFloat - c0;
    targetColorRef.current.copy(SECTION_THEME_COLORS[c0]).lerp(SECTION_THEME_COLORS[c1], cAlpha);

    const lightDamping = 1 - Math.exp(-5.0 * safeDelta);
    currentColor.current.lerp(targetColorRef.current, lightDamping);

    if (lightRef.current) {
      lightRef.current.color.copy(currentColor.current);
      lightRef.current.intensity =
        (isSpeaking ? 3.5 + Math.sin(t * 12) * 0.7 : 2.3) + avatarPhysicsImpulse.energy * 1.1;
    }

    // Smooth Damped Interpolation for Arm Offsets (Zero GC Allocations)
    const armDamping = 1 - Math.exp(-5.5 * safeDelta);
    curRArm.current.lerp(targetPose.rArm, armDamping);
    curRForeArm.current.lerp(targetPose.rForeArm, armDamping);
    curRHand.current.lerp(targetPose.rHand, armDamping);
    curRFingerCurl.current = THREE.MathUtils.lerp(
      curRFingerCurl.current,
      targetPose.rFingerCurl,
      armDamping
    );

    curLArm.current.lerp(targetPose.lArm, armDamping);
    curLForeArm.current.lerp(targetPose.lForeArm, armDamping);
    curLHand.current.lerp(targetPose.lHand, armDamping);
    curLFingerCurl.current = THREE.MathUtils.lerp(
      curLFingerCurl.current,
      targetPose.lFingerCurl,
      armDamping
    );

    // Rich Multi-Frequency Procedural Micro-Motion (Breathing + Gestural Cadence + Click Impulse)
    const armBreath = Math.sin(t * 1.85) * 0.022;
    const gestureWaveR =
      Math.sin(t * 2.4) * 0.048 +
      (isSpeaking ? Math.sin(t * 7.5) * 0.08 : 0) +
      avatarPhysicsImpulse.energy * 0.12;
    const gestureWaveL =
      Math.cos(t * 2.1) * 0.048 +
      (isSpeaking ? Math.cos(t * 6.8) * 0.08 : 0) +
      avatarPhysicsImpulse.energy * 0.12;

    // Subtle Neck & Lower Spine contrapposto life
    if (bones.Neck && rest.Neck) {
      bones.Neck.rotation.y = rest.Neck.y + px * 0.11 + Math.sin(t * 1.0) * 0.026;
      bones.Neck.rotation.z = rest.Neck.z + Math.cos(t * 1.25) * 0.018;
    }

    if (bones.Spine && rest.Spine) {
      bones.Spine.rotation.x = rest.Spine.x + Math.sin(t * 2.0) * 0.018;
      bones.Spine.rotation.z = rest.Spine.z + Math.sin(t * 1.05) * 0.02;
    }

    // Apply Right Arm hierarchy with expressive cadence
    const restRArm = rest.RightArm;
    const restRForeArm = rest.RightForeArm;
    const restRHand = rest.RightHand;

    if (bones.RightArm && restRArm) {
      bones.RightArm.rotation.set(
        restRArm.x + curRArm.current.x - avatarPhysicsImpulse.energy * 0.12,
        restRArm.y + curRArm.current.y + Math.sin(t * 1.5) * 0.03,
        restRArm.z + curRArm.current.z + armBreath
      );
    }
    if (bones.RightForeArm && restRForeArm) {
      bones.RightForeArm.rotation.set(
        restRForeArm.x + curRForeArm.current.x,
        restRForeArm.y + curRForeArm.current.y,
        restRForeArm.z + curRForeArm.current.z - gestureWaveR
      );
    }
    if (bones.RightHand && restRHand) {
      bones.RightHand.rotation.set(
        restRHand.x + curRHand.current.x + Math.sin(t * 3.2) * 0.04,
        restRHand.y + curRHand.current.y + Math.cos(t * 2.6) * 0.05,
        restRHand.z + curRHand.current.z
      );
    }

    // Apply Left Arm hierarchy with expressive cadence
    const restLArm = rest.LeftArm;
    const restLForeArm = rest.LeftForeArm;
    const restLHand = rest.LeftHand;

    if (bones.LeftArm && restLArm) {
      bones.LeftArm.rotation.set(
        restLArm.x + curLArm.current.x - avatarPhysicsImpulse.energy * 0.12,
        restLArm.y + curLArm.current.y - Math.sin(t * 1.5) * 0.03,
        restLArm.z + curLArm.current.z - armBreath
      );
    }
    if (bones.LeftForeArm && restLForeArm) {
      bones.LeftForeArm.rotation.set(
        restLForeArm.x + curLForeArm.current.x,
        restLForeArm.y + curLForeArm.current.y,
        restLForeArm.z + curLForeArm.current.z + gestureWaveL
      );
    }
    if (bones.LeftHand && restLHand) {
      bones.LeftHand.rotation.set(
        restLHand.x + curLHand.current.x + Math.cos(t * 3.0) * 0.04,
        restLHand.y + curLHand.current.y - Math.sin(t * 2.6) * 0.05,
        restLHand.z + curLHand.current.z
      );
    }

    // Natural Anatomical Finger Cascades with subtle living wave
    const updateHandFingers = (side: 'Right' | 'Left', curlFactor: number) => {
      const fingerSpecs = [
        { name: 'Index', curl: 0.2, phase: 0.0 },
        { name: 'Middle', curl: 0.25, phase: 0.6 },
        { name: 'Ring', curl: 0.3, phase: 1.2 },
        { name: 'Pinky', curl: 0.35, phase: 1.8 },
      ];

      fingerSpecs.forEach((f) => {
        const wave = Math.sin(t * 2.5 + f.phase) * 0.04;
        [1, 2, 3].forEach((seg) => {
          const bName = `${side}Hand${f.name}${seg}`;
          const b = bones[bName];
          const r = rest[bName];
          if (b && r) {
            const weight = seg === 1 ? 0.9 : 1.1;
            b.rotation.x = r.x + (f.curl * curlFactor + wave) * weight;
          }
        });
      });

      [1, 2, 3].forEach((seg) => {
        const bName = `${side}HandThumb${seg}`;
        const b = bones[bName];
        const r = rest[bName];
        if (b && r) {
          b.rotation.x = r.x + 0.12 * curlFactor;
          b.rotation.z = r.z + (side === 'Right' ? -0.08 : 0.08) * curlFactor;
        }
      });
    };

    updateHandFingers('Right', curRFingerCurl.current);
    updateHandFingers('Left', curLFingerCurl.current);

    // Speaking Head Nods
    if (isSpeaking && bones.Head && rest.Head) {
      bones.Head.rotation.x += Math.sin(t * 8) * 0.03;
      bones.Head.rotation.z = rest.Head.z + Math.sin(t * 6) * 0.02;
    }

    // Procedural Natural Eye Blinking
    if (blinkMeshesRef.current.length > 0) {
      const blinkCycle = t % 4.2;
      const blinkWeight = blinkCycle < 0.18 ? Math.sin((blinkCycle / 0.18) * Math.PI) : 0;
      blinkMeshesRef.current.forEach(({ mesh, indices }) => {
        if (mesh.morphTargetInfluences) {
          indices.forEach((idx) => {
            mesh.morphTargetInfluences![idx] = blinkWeight;
          });
        }
      });
    }

    // Animate Stage Pedestal & Interactive Click Shockwave Ring
    if (pedestalRing1Ref.current) {
      pedestalRing1Ref.current.rotation.z = t * 0.45;
    }
    if (pedestalRing2Ref.current) {
      pedestalRing2Ref.current.rotation.z = -t * 0.3;
    }
    if (shockwaveRingRef.current) {
      const waveScale = 1.0 + avatarPhysicsImpulse.energy * 1.4;
      shockwaveRingRef.current.scale.set(waveScale, waveScale, 1);
      const mat = shockwaveRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(0.85, avatarPhysicsImpulse.energy * 0.65);
    }
  });

  return (
    <group ref={masterGroupRef} position={[0.55, 0.0, 0.2]} rotation={[0, -0.22, 0]}>
      {/* Key Light: High-CRI Soft Warm White directly on Face & Collar */}
      <pointLight
        position={[0.25, 1.2, 1.5]}
        color="#fffaf0"
        intensity={3.4}
        distance={6.0}
        decay={2}
      />

      {/* Dynamic Section Theme Accent Fill Light */}
      <pointLight
        ref={lightRef}
        position={[-0.85, 0.75, 1.3]}
        intensity={2.2}
        distance={5.0}
        decay={2}
      />

      {/* Sulfur-Gold Rim / Silhouette Edge Light from Above & Behind */}
      <pointLight
        position={[0.2, 1.65, -1.2]}
        color="#F2C94C"
        intensity={3.5}
        distance={5.5}
        decay={2}
      />

      {/* Mystic Violet Ground Bounce Fill */}
      <pointLight
        position={[0, -1.0, 1.2]}
        color="#CBC0E3"
        intensity={1.3}
        distance={3.8}
        decay={2}
      />

      {/* Voice-reactive illumination directly on chest lapel */}
      {isSpeaking && (
        <pointLight
          position={[0, 0.55, 0.5]}
          color="#F2C94C"
          intensity={2.8}
          distance={2.8}
        />
      )}

      {/* The 3D Rigged Suited Avatar Geometry (Authentic PBR Multi-Material) */}
      <group
        ref={modelWrapperRef}
        scale={[normalizedScale, normalizedScale, normalizedScale]}
        position={[0, offsetY, 0]}
      >
        <primitive object={fbx} />
      </group>

      {/* Dynamic Stage Pedestal + Click Physics Shockwave Ring under Avatar's Feet */}
      <group position={[0, -1.02, 0]}>
        <mesh ref={pedestalRing1Ref} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.54, 64]} />
          <meshBasicMaterial color="#F2C94C" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={pedestalRing2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.62, 0.66, 64]} />
          <meshBasicMaterial color="#5B3E96" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={shockwaveRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.52, 0.68, 48]} />
          <meshBasicMaterial color="#E62E25" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[0.48, 48]} />
          <meshBasicMaterial color="#09080D" transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
}

useFBX.preload(`${import.meta.env.BASE_URL}avatar/model.fbx`);
