import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraTelemetry } from '../../hooks/useCameraTelemetry';
import { useCommandStore } from '../../store/useCommandStore';
import { avatarPhysicsImpulse } from './avatarPhysicsImpulse';

export { avatarPhysicsImpulse } from './avatarPhysicsImpulse';

export interface CinematicKeyframe {
  progress: number;
  avatarPos: [number, number, number];
  avatarRotY: number;
  camOffset: [number, number, number];
  lookOffset: [number, number, number];
}

export const FLIP_KEYFRAMES: CinematicKeyframe[] = [
  {
    // 00 VOLUME DESK (Spread 0) - Left Page (x: -2.35), framed perfectly in clear air
    progress: 0.0,
    avatarPos: [-2.35, 0.0, 0.3],
    avatarRotY: 0.36,
    camOffset: [-0.35, 0.82, 4.0],
    lookOffset: [-0.25, 0.72, 0.0],
  },
  {
    // 01 SWE (Spread 1) - Left Page (x: -2.35), head clear below speech bubble, gesturing toward Laptop
    progress: 0.14,
    avatarPos: [-2.35, -3.8, 0.3],
    avatarRotY: 0.36,
    camOffset: [-0.35, 0.82, 4.0],
    lookOffset: [-0.25, 0.72, 0.0],
  },
  {
    // 02 FULLSTACK (Spread 2) - Right Page (x: 2.35), gesturing left toward MERN Duplex Cannon
    progress: 0.28,
    avatarPos: [2.35, -8.2, 0.3],
    avatarRotY: -0.36,
    camOffset: [0.35, 0.82, 4.0],
    lookOffset: [0.25, 0.72, 0.0],
  },
  {
    // 03 AKASHA (Spread 3) - Left Page (x: -2.35), framed below title and beside Battlestation
    progress: 0.42,
    avatarPos: [-2.35, -12.6, 0.35],
    avatarRotY: 0.36,
    camOffset: [-0.35, 0.82, 4.0],
    lookOffset: [-0.25, 0.72, 0.0],
  },
  {
    // 04 ICU MANAGEMENT (Spread 4) - Right Page (x: 2.35), facing left toward Vitals telemetry
    progress: 0.57,
    avatarPos: [2.35, -17.0, 0.35],
    avatarRotY: -0.36,
    camOffset: [0.35, 0.82, 4.0],
    lookOffset: [0.25, 0.72, 0.0],
  },
  {
    // 05 QUIZ & LIBRARY (Spread 5) - Left Page (x: -2.35), framed below speech bubble beside Arena
    progress: 0.71,
    avatarPos: [-2.35, -21.4, 0.3],
    avatarRotY: 0.36,
    camOffset: [-0.35, 0.82, 4.0],
    lookOffset: [-0.25, 0.72, 0.0],
  },
  {
    // 06 INSTRUCTOR DOJO (Spread 6) - Right Page (x: 2.35), beside Rubber Duck debugger
    progress: 0.85,
    avatarPos: [2.35, -25.8, 0.35],
    avatarRotY: -0.36,
    camOffset: [0.35, 0.82, 4.0],
    lookOffset: [0.25, 0.72, 0.0],
  },
  {
    // 07 AGILE & TERMINAL (Spread 7) - Right Page (x: 2.35), framed below Operator dossier between dual CRT screens
    progress: 1.0,
    avatarPos: [2.35, -30.2, 0.4],
    avatarRotY: -0.35,
    camOffset: [0.35, 0.82, 4.0],
    lookOffset: [0.25, 0.72, 0.0],
  },
];

export const SCROLL_KEYFRAMES: CinematicKeyframe[] = [
  {
    // 00 ORIGIN (Sec 00) - Stage Right Corridor (Cols 7-9: x: 0.82)
    progress: 0.0,
    avatarPos: [0.82, 0.05, 0.25],
    avatarRotY: -0.25,
    camOffset: [0.1, 0.45, 3.9],
    lookOffset: [0.1, 0.35, 0.0],
  },
  {
    // 01 SWE (Sec 01) - Stage Left Corridor (Cols 1-5: x: -1.95)
    progress: 0.166,
    avatarPos: [-1.95, -3.75, 0.3],
    avatarRotY: 0.38,
    camOffset: [-0.25, 0.45, 3.9],
    lookOffset: [-0.15, 0.35, 0.0],
  },
  {
    // 02 FULLSTACK (Sec 02) - Stage Right Corridor (Cols 8-12: x: 1.95)
    progress: 0.333,
    avatarPos: [1.95, -8.15, 0.3],
    avatarRotY: -0.38,
    camOffset: [0.25, 0.45, 3.9],
    lookOffset: [0.15, 0.35, 0.0],
  },
  {
    // 03 PROJECTS (Sec 03) - Stage Right Corridor (Cols 9-12: x: 2.05)
    progress: 0.5,
    avatarPos: [2.05, -12.55, 0.35],
    avatarRotY: -0.36,
    camOffset: [0.25, 0.45, 3.9],
    lookOffset: [0.15, 0.35, 0.0],
  },
  {
    // 04 INSTRUCTOR (Sec 04) - Stage Right Corridor (Cols 8-12: x: 1.95)
    progress: 0.666,
    avatarPos: [1.95, -16.95, 0.35],
    avatarRotY: -0.36,
    camOffset: [0.25, 0.45, 3.9],
    lookOffset: [0.15, 0.35, 0.0],
  },
  {
    // 05 AGILE PM (Sec 05) - Stage Left Corridor (Cols 1-5: x: -1.95)
    progress: 0.833,
    avatarPos: [-1.95, -21.35, 0.3],
    avatarRotY: 0.38,
    camOffset: [-0.25, 0.45, 3.9],
    lookOffset: [-0.15, 0.35, 0.0],
  },
  {
    // 06 CONTACT (Sec 06) - Stage Center Corridor (Cols 6-8: x: 0.0)
    progress: 1.0,
    avatarPos: [0.0, -26.0, 0.38],
    avatarRotY: 0.0,
    camOffset: [0.0, 0.45, 3.9],
    lookOffset: [0.0, 0.35, 0.0],
  },
];

// Backward-compatible alias
export const CINEMATIC_KEYFRAMES = FLIP_KEYFRAMES;

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Pre-allocated reusable output struct to eliminate GC pauses during 60-120FPS scroll
const reusableSampleResult = {
  avatarPos: [0, 0, 0] as [number, number, number],
  avatarRotY: 0,
  camOffset: [0, 0, 0] as [number, number, number],
  lookOffset: [0, 0, 0] as [number, number, number],
  sectionIndex: 0,
};

export function sampleKeyframes(
  scrollProgress: number,
  mode?: 'flip' | 'scroll'
): typeof reusableSampleResult {
  const currentMode = mode || useCommandStore.getState().readerMode;
  const keyframes = currentMode === 'scroll' ? SCROLL_KEYFRAMES : FLIP_KEYFRAMES;
  const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);

  for (let i = 0; i < keyframes.length - 1; i++) {
    const curr = keyframes[i];
    const next = keyframes[i + 1];

    if (p >= curr.progress && p <= next.progress) {
      const alpha = smootherstep(curr.progress, next.progress, p);

      reusableSampleResult.avatarPos[0] = THREE.MathUtils.lerp(curr.avatarPos[0], next.avatarPos[0], alpha);
      reusableSampleResult.avatarPos[1] = THREE.MathUtils.lerp(curr.avatarPos[1], next.avatarPos[1], alpha);
      reusableSampleResult.avatarPos[2] = THREE.MathUtils.lerp(curr.avatarPos[2], next.avatarPos[2], alpha);

      reusableSampleResult.avatarRotY = THREE.MathUtils.lerp(curr.avatarRotY, next.avatarRotY, alpha);

      reusableSampleResult.camOffset[0] = THREE.MathUtils.lerp(curr.camOffset[0], next.camOffset[0], alpha);
      reusableSampleResult.camOffset[1] = THREE.MathUtils.lerp(curr.camOffset[1], next.camOffset[1], alpha);
      reusableSampleResult.camOffset[2] = THREE.MathUtils.lerp(curr.camOffset[2], next.camOffset[2], alpha);

      reusableSampleResult.lookOffset[0] = THREE.MathUtils.lerp(curr.lookOffset[0], next.lookOffset[0], alpha);
      reusableSampleResult.lookOffset[1] = THREE.MathUtils.lerp(curr.lookOffset[1], next.lookOffset[1], alpha);
      reusableSampleResult.lookOffset[2] = THREE.MathUtils.lerp(curr.lookOffset[2], next.lookOffset[2], alpha);

      reusableSampleResult.sectionIndex = alpha < 0.5 ? i : i + 1;
      return reusableSampleResult;
    }
  }

  const last = keyframes[keyframes.length - 1];
  reusableSampleResult.avatarPos[0] = last.avatarPos[0];
  reusableSampleResult.avatarPos[1] = last.avatarPos[1];
  reusableSampleResult.avatarPos[2] = last.avatarPos[2];
  reusableSampleResult.avatarRotY = last.avatarRotY;
  reusableSampleResult.camOffset[0] = last.camOffset[0];
  reusableSampleResult.camOffset[1] = last.camOffset[1];
  reusableSampleResult.camOffset[2] = last.camOffset[2];
  reusableSampleResult.lookOffset[0] = last.lookOffset[0];
  reusableSampleResult.lookOffset[1] = last.lookOffset[1];
  reusableSampleResult.lookOffset[2] = last.lookOffset[2];
  reusableSampleResult.sectionIndex = keyframes.length - 1;
  return reusableSampleResult;
}

// 2nd-Order Hooke's Law Spring Solver (Critically Damped Velvet Response, Zero-Allocation)
function stepSpring(
  current: number,
  target: number,
  velocity: { v: number },
  stiffness: number,
  damping: number,
  dt: number
): number {
  const safeDt = Math.min(dt, 0.033);
  const force = (target - current) * stiffness;
  velocity.v = (velocity.v + force * safeDt) * Math.exp(-damping * safeDt);
  return current + velocity.v * safeDt;
}

export interface SectionPropItem {
  ref: RefObject<THREE.Group | null>;
  sectionY: number;
  baseZ?: number;
  encirclesAvatar?: boolean;
}

export interface UseCinematicAvatarDirectorProps {
  avatarGroupRef: RefObject<THREE.Group | null>;
  headBoneRef?: RefObject<THREE.Bone | null>;
  spineBoneRef?: RefObject<THREE.Bone | null>;
  sectionPropsRefs?: RefObject<SectionPropItem[]>;
  getScrollProgress: () => number;
}

export function useCinematicAvatarDirector({
  avatarGroupRef,
  headBoneRef,
  spineBoneRef,
  sectionPropsRefs,
  getScrollProgress,
}: UseCinematicAvatarDirectorProps) {
  const smoothProgressRef = useRef(0);
  const prevSmoothProgressRef = useRef(0);
  const smoothVelocityRef = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3(0.1, 0.1, 0));

  // Spring velocity states for realistic physical inertia & silky settle
  const velX = useRef({ v: 0 });
  const velY = useRef({ v: 0 });
  const velZ = useRef({ v: 0 });
  const velRotY = useRef({ v: 0 });
  const velRotX = useRef({ v: 0 });
  const velRotZ = useRef({ v: 0 });

  const camVelX = useRef({ v: 0 });
  const camVelY = useRef({ v: 0 });
  const camVelZ = useRef({ v: 0 });

  useFrame((state, delta) => {
    if (!avatarGroupRef.current) return;
    const safeDelta = Math.min(delta, 0.05);

    // 0. Read exact frame-synchronized Lenis scroll progress (bypassing delayed ScrollTrigger scrub)
    const { readerMode, activeIssueIndex } = useCommandStore.getState();
    if (readerMode === 'vertical') return;
    const lenisInst = (window as any).__lenis;
    const directScrollProgress =
      lenisInst && typeof lenisInst.progress === 'number'
        ? lenisInst.progress
        : getScrollProgress();

    const targetProgress =
      readerMode === 'flip'
        ? (FLIP_KEYFRAMES[activeIssueIndex]?.progress ?? 0)
        : directScrollProgress;

    // Continuous exponential smoothing on scroll progress & pointer coordinates
    smoothProgressRef.current = THREE.MathUtils.damp(
      smoothProgressRef.current,
      targetProgress,
      7.5,
      safeDelta
    );
    avatarPhysicsImpulse.smoothProgress = smoothProgressRef.current;

    avatarPhysicsImpulse.smoothPointerX = THREE.MathUtils.damp(
      avatarPhysicsImpulse.smoothPointerX,
      state.pointer.x,
      7.0,
      safeDelta
    );
    avatarPhysicsImpulse.smoothPointerY = THREE.MathUtils.damp(
      avatarPhysicsImpulse.smoothPointerY,
      state.pointer.y,
      7.0,
      safeDelta
    );

    const px = avatarPhysicsImpulse.smoothPointerX;
    const py = avatarPhysicsImpulse.smoothPointerY;

    const instVelocity =
      (smoothProgressRef.current - prevSmoothProgressRef.current) / Math.max(safeDelta, 0.001);
    prevSmoothProgressRef.current = smoothProgressRef.current;
    smoothVelocityRef.current = THREE.MathUtils.damp(
      smoothVelocityRef.current,
      instVelocity,
      8.0,
      safeDelta
    );
    const scrollVelocity = smoothVelocityRef.current;

    // Decay interactive click impulse energy smoothly
    avatarPhysicsImpulse.energy = THREE.MathUtils.damp(
      avatarPhysicsImpulse.energy,
      0,
      5.0,
      safeDelta
    );
    avatarPhysicsImpulse.spinPulse = THREE.MathUtils.damp(
      avatarPhysicsImpulse.spinPulse,
      0,
      5.5,
      safeDelta
    );

    const target = sampleKeyframes(smoothProgressRef.current, readerMode);
    const t = state.clock.getElapsedTime();

    const aspect = state.viewport.aspect || window.innerWidth / Math.max(window.innerHeight, 1);
    const mobileFactor = THREE.MathUtils.clamp((1.2 - aspect) / 0.55, 0, 1);

    const responsiveAvatarX = THREE.MathUtils.lerp(
      target.avatarPos[0],
      target.avatarPos[0] * 0.18,
      mobileFactor
    );
    const responsiveAvatarRotY = THREE.MathUtils.lerp(
      target.avatarRotY,
      target.avatarRotY * 0.45,
      mobileFactor
    );

    // 1. 2ND-ORDER HOOKE'S LAW VELVET SPRING POSITION
    const bobbingY =
      Math.sin(t * 1.85) * 0.04 +
      Math.cos(t * 0.95) * 0.014 +
      avatarPhysicsImpulse.energy * 0.065;
    const swayX = Math.sin(t * 0.95) * 0.022 + px * 0.055;

    avatarGroupRef.current.position.x = stepSpring(
      avatarGroupRef.current.position.x,
      responsiveAvatarX + swayX,
      velX.current,
      46,
      11.5,
      safeDelta
    );
    avatarGroupRef.current.position.y = stepSpring(
      avatarGroupRef.current.position.y,
      target.avatarPos[1] + bobbingY,
      velY.current,
      52,
      12.2,
      safeDelta
    );
    avatarGroupRef.current.position.z = stepSpring(
      avatarGroupRef.current.position.z,
      target.avatarPos[2] + avatarPhysicsImpulse.energy * 0.1,
      velZ.current,
      46,
      11.5,
      safeDelta
    );

    // 2. SPRING ROTATION + SMOOTHED SCROLL VELOCITY BANKING
    const pointerYaw = px * 0.16;
    const velocityRoll =
      THREE.MathUtils.clamp(scrollVelocity * -0.18, -0.11, 0.11) - px * 0.03;
    const velocityPitch =
      THREE.MathUtils.clamp(scrollVelocity * 0.2, -0.11, 0.11) - py * 0.035;

    avatarGroupRef.current.rotation.y = stepSpring(
      avatarGroupRef.current.rotation.y,
      responsiveAvatarRotY + pointerYaw + avatarPhysicsImpulse.spinPulse,
      velRotY.current,
      44,
      11.0,
      safeDelta
    );
    avatarGroupRef.current.rotation.z = stepSpring(
      avatarGroupRef.current.rotation.z,
      velocityRoll,
      velRotZ.current,
      50,
      11.8,
      safeDelta
    );
    avatarGroupRef.current.rotation.x = stepSpring(
      avatarGroupRef.current.rotation.x,
      velocityPitch,
      velRotX.current,
      50,
      11.8,
      safeDelta
    );

    // 3. EXPRESSIVE HEAD & SPINE MAGNETIC TRACKING (Using pre-smoothed pointer!)
    if (headBoneRef?.current) {
      headBoneRef.current.rotation.y = THREE.MathUtils.damp(
        headBoneRef.current.rotation.y,
        px * 0.3 - responsiveAvatarRotY * 0.32 + Math.sin(t * 0.85) * 0.035,
        6.0,
        safeDelta
      );
      headBoneRef.current.rotation.x = THREE.MathUtils.damp(
        headBoneRef.current.rotation.x,
        -py * 0.18 + Math.sin(t * 1.35) * 0.025 - avatarPhysicsImpulse.energy * 0.08,
        6.0,
        safeDelta
      );
    }

    if (spineBoneRef?.current) {
      spineBoneRef.current.rotation.y = THREE.MathUtils.damp(
        spineBoneRef.current.rotation.y,
        responsiveAvatarRotY * 0.2 + px * 0.09,
        5.0,
        safeDelta
      );
      spineBoneRef.current.rotation.z = THREE.MathUtils.damp(
        spineBoneRef.current.rotation.z,
        Math.sin(t * 0.95) * 0.022 - px * 0.035,
        5.0,
        safeDelta
      );
    }

    // 4. UNIFIED SPRING-DAMPED CINEMATIC CAMERA RIG WITH PARALLAX
    const camTargetX =
      THREE.MathUtils.lerp(target.camOffset[0], 0, mobileFactor) +
      px * 0.2 * (1 - mobileFactor * 0.5);
    const camTargetY =
      target.avatarPos[1] +
      target.camOffset[1] +
      py * 0.12 * (1 - mobileFactor * 0.5);
    const camTargetZ = target.camOffset[2] + mobileFactor * 1.1;

    state.camera.position.x = stepSpring(
      state.camera.position.x,
      camTargetX,
      camVelX.current,
      42,
      11.5,
      safeDelta
    );
    state.camera.position.y = stepSpring(
      state.camera.position.y,
      camTargetY,
      camVelY.current,
      48,
      12.0,
      safeDelta
    );
    state.camera.position.z = stepSpring(
      state.camera.position.z,
      camTargetZ,
      camVelZ.current,
      42,
      11.5,
      safeDelta
    );

    const lookTargetX = THREE.MathUtils.lerp(target.lookOffset[0], 0, mobileFactor);
    const lookTargetY = target.avatarPos[1] + target.lookOffset[1];
    const lookTargetZ = target.lookOffset[2];

    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      lookTargetX,
      6.5,
      safeDelta
    );
    currentLookAt.current.y = THREE.MathUtils.damp(
      currentLookAt.current.y,
      lookTargetY,
      7.0,
      safeDelta
    );
    currentLookAt.current.z = THREE.MathUtils.damp(
      currentLookAt.current.z,
      lookTargetZ,
      6.5,
      safeDelta
    );
    state.camera.lookAt(currentLookAt.current);

    // 5. UPDATE TELEMETRY
    cameraTelemetry.update(
      avatarGroupRef.current.position.x,
      avatarGroupRef.current.position.y,
      avatarGroupRef.current.position.z
    );

    // 6. SECTION PROP SMOOTHERSTEP SCALING & Z-SAFETY
    if (sectionPropsRefs?.current) {
      sectionPropsRefs.current.forEach(({ ref, sectionY, baseZ = -1.6, encirclesAvatar = false }) => {
        if (!ref.current) return;
        const distY = Math.abs(avatarGroupRef.current!.position.y - sectionY);

        const rawVis = THREE.MathUtils.clamp(1.0 - (distY - 1.4) / 3.0, 0.0, 1.0);
        const visibilityScale = Math.max(0.001, smootherstep(0.0, 1.0, rawVis));
        const currentScale = THREE.MathUtils.damp(ref.current.scale.x, visibilityScale, 6.5, safeDelta);
        ref.current.scale.setScalar(currentScale);
        ref.current.visible = currentScale > 0.015;

        if (encirclesAvatar) {
          ref.current.position.z = baseZ;
        } else {
          ref.current.position.z = Math.min(baseZ, avatarGroupRef.current!.position.z - 1.4);
        }
      });
    }
  });
}
