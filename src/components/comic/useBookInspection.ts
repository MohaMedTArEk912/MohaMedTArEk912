import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
import { sounds } from '../../audio/soundSynthesizer';

interface Drag {
  id: number;
  startX: number;
  startY: number;
  baseYaw: number;
  yaw: number;
  pitch: number;
  velocity: number;
  lastTime: number;
  dragged: boolean;
}

export function getBookPointerCoords(event: { clientX: number; clientY: number }) {
  return {
    x: event.clientX,
    y: event.clientY,
    rotated: false,
  };
}

export interface BookInspectionOptions {
  coverFacing: 'front' | 'back' | 'flipping';
  justFolded: 'front' | 'back' | null;
  onOpen: () => void;
  onConsumeFold: () => void;
  onFlipStart: () => void;
  onFlipComplete: () => void;
}

/**
 * Physical 3D hardcover inspection & rigid-body toss-flip engine.
 * Drives .book-gimbal, cast shadow, and cover specular sheen directly via RAF
 * off React's render path for locked 120fps physical motion.
 */
export function useBookInspection({
  coverFacing,
  justFolded,
  onOpen,
  onConsumeFold,
  onFlipStart,
  onFlipComplete,
}: BookInspectionOptions) {
  const gimbal = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const rafRef = useRef<number | null>(null);
  const autoFlipTimer = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const suppressClick = useRef(false);

  const cancelAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    animatingRef.current = false;
  }, []);

  const clearAutoTimer = useCallback(() => {
    if (autoFlipTimer.current !== null) {
      window.clearTimeout(autoFlipTimer.current);
      autoFlipTimer.current = null;
    }
  }, []);

  useEffect(() => () => {
    cancelAnim();
    clearAutoTimer();
  }, [cancelAnim, clearAutoTimer]);

  const applyPose = useCallback((
    tx: number,
    ty: number,
    tz: number,
    pitch: number,
    yaw: number,
    roll: number,
    scale = 1,
  ) => {
    if (gimbal.current) {
      gimbal.current.style.transform =
        `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px) ` +
        `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) rotateZ(${roll.toFixed(2)}deg) ` +
        `scale(${scale.toFixed(4)})`;
    }
    if (shadow.current) {
      const heightFactor = Math.max(0, Math.min(1, tz / 165));
      const sx = 1 - heightFactor * 0.16;
      const sy = 1 - heightFactor * 0.22;
      const shX = tx * 0.55 + heightFactor * 18;
      const shY = ty * 0.35 + heightFactor * 28;
      const opacity = 1 - heightFactor * 0.68;
      shadow.current.style.transform = `translate3d(${shX.toFixed(1)}px, ${shY.toFixed(1)}px, 0) rotate(-9deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      shadow.current.style.opacity = opacity.toFixed(3);
    }
  }, []);

  /**
   * 120fps physical hardcover toss-flip from Back Cover (yaw ~ 180deg) -> Front Cover (yaw = 0deg):
   * 1) Finger-edge press anticipation into the desk
   * 2) Ballistic parabolic heave off the table (tz +155px) + 3D barrel-flip past the gold spine
   * 3) Weighted hardcover thud onto the desk + dampened micro-rebound settle
   */
  const playFlipToFront = useCallback((startYaw = 180, startPitch = 0) => {
    clearAutoTimer();
    cancelAnim();
    onFlipStart();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyPose(0, 0, 0, 0, 0, 0, 1);
      onFlipComplete();
      return;
    }

    try {
      sounds.playPageFlip();
    } catch {
      // Ignore audio errors
    }

    animatingRef.current = true;
    const duration = 1220;
    const t0 = performance.now();

    const tick = (now: number) => {
      const raw = Math.min(1, (now - t0) / duration);

      let tx = 0;
      let ty = 0;
      let tz = 0;
      let pitch = 0;
      let yaw = 0;
      let roll = 0;
      let sheenOpacity = 0;

      if (raw < 0.13) {
        // Phase 1: Tactile press on the right edge before lifting off the table
        const u = raw / 0.13;
        const ease = Math.sin(u * Math.PI * 0.5);
        tx = ease * 5;
        ty = ease * 3;
        tz = -ease * 9;
        pitch = startPitch + ease * (-4.5 - startPitch);
        yaw = startYaw + ease * 7;
        roll = -ease * 2.4;
      } else if (raw < 0.78) {
        // Phase 2: Parabolic airborne arc + 180deg rotational toss showing spine & edges
        const u = (raw - 0.13) / 0.65;
        // Smooth S-curve with brisk launch and cushioned approach
        const rotEase = u < 0.5
          ? 4 * u * u * u
          : 1 - Math.pow(-2 * u + 2, 3) / 2;
        const arc = Math.sin(u * Math.PI);
        const launchYaw = startYaw + 7;
        const targetOvershoot = -9.5;

        yaw = launchYaw + (targetOvershoot - launchYaw) * rotEase;
        tz = -9 * (1 - Math.min(1, u * 5)) + arc * 158;
        ty = 3 * (1 - Math.min(1, u * 4)) - arc * 26;
        tx = 5 * (1 - u) - Math.sin(u * Math.PI) * 14;
        pitch = -4.5 * (1 - u) + arc * 16.5;
        roll = -2.4 * (1 - u) + Math.sin(u * Math.PI * 1.15) * 8.5;
        sheenOpacity = Math.pow(Math.sin(u * Math.PI), 1.6) * 0.85;
      } else {
        // Phase 3: Weighted desk impact + crisp dampened hardcover rebound settle
        const u = (raw - 0.78) / 0.22;
        const decay = Math.exp(-5.5 * u);
        const bounce = Math.cos(u * Math.PI * 1.5);
        yaw = -9.5 * decay * bounce;
        tz = Math.max(0, Math.sin(u * Math.PI) * 7 * decay);
        ty = 0;
        tx = 0;
        pitch = -2.2 * Math.sin(u * Math.PI) * decay;
        roll = 1.4 * Math.sin(u * Math.PI) * decay;
        sheenOpacity = (1 - u) * 0.35;
      }

      applyPose(tx, ty, tz, pitch, yaw, roll, 1);
      if (sheen.current) {
        sheen.current.style.opacity = sheenOpacity.toFixed(3);
      }

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
        rafRef.current = null;
        if (gimbal.current) gimbal.current.style.transform = '';
        if (shadow.current) {
          shadow.current.style.transform = '';
          shadow.current.style.opacity = '';
        }
        if (sheen.current) sheen.current.style.opacity = '';
        onFlipComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [applyPose, cancelAnim, clearAutoTimer, onFlipComplete, onFlipStart]);

  // Synchronize resting gimbal orientation & seamless post-fold settle
  useEffect(() => {
    clearAutoTimer();

    if (justFolded) {
      const targetBaseYaw = justFolded === 'back' ? 180 : 0;
      onConsumeFold();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        applyPose(0, 0, 0, 0, targetBaseYaw, 0, 1);
        if (targetBaseYaw === 180) onFlipComplete();
        return;
      }

      // Start from flat screen-aligned pose matching the folded spread leaf,
      // then cushion smoothly into the 3D desk perspective pose.
      cancelAnim();
      animatingRef.current = true;
      const startPitch = justFolded === 'back' ? 9 : -9;
      const startYaw = justFolded === 'back' ? 195 : 15;
      const startRoll = justFolded === 'back' ? -4 : 4;
      const settleMs = 430;
      const t0 = performance.now();

      const settleTick = (now: number) => {
        const t = Math.min(1, (now - t0) / settleMs);
        const ease = 1 - Math.pow(1 - t, 3);
        const curPitch = startPitch * (1 - ease);
        const curYaw = startYaw + (targetBaseYaw - startYaw) * ease;
        const curRoll = startRoll * (1 - ease);
        const curScale = 1.035 + (1 - 1.035) * ease;
        applyPose(0, 0, (1 - ease) * 18, curPitch, curYaw, curRoll, curScale);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(settleTick);
        } else {
          animatingRef.current = false;
          rafRef.current = null;
          if (targetBaseYaw === 0 && gimbal.current) {
            gimbal.current.style.transform = '';
          } else {
            applyPose(0, 0, 0, 0, targetBaseYaw, 0, 1);
          }
          if (targetBaseYaw === 180) {
            autoFlipTimer.current = window.setTimeout(() => {
              if (!drag.current) playFlipToFront(180, 0);
            }, 950);
          }
        }
      };

      rafRef.current = requestAnimationFrame(settleTick);
      return;
    }

    if (coverFacing === 'back' && !animatingRef.current) {
      applyPose(0, 0, 0, 0, 180, 0, 1);
      autoFlipTimer.current = window.setTimeout(() => {
        if (!drag.current) playFlipToFront(180, 0);
      }, 1150);
    } else if (coverFacing === 'front' && !animatingRef.current && !drag.current) {
      if (gimbal.current) gimbal.current.style.transform = '';
    }
  }, [applyPose, cancelAnim, clearAutoTimer, coverFacing, justFolded, onConsumeFold, onFlipComplete, playFlipToFront]);

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || animatingRef.current) return;
    clearAutoTimer();
    suppressClick.current = false;
    const coords = getBookPointerCoords(event);
    const baseYaw = coverFacing === 'back' ? 180 : 0;
    drag.current = {
      id: event.pointerId,
      startX: coords.x,
      startY: coords.y,
      baseYaw,
      yaw: baseYaw,
      pitch: 0,
      velocity: 0,
      lastTime: event.timeStamp,
      dragged: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId || !gimbal.current) return;
    const coords = getBookPointerCoords(event);
    const dx = coords.x - gesture.startX;
    const dy = coords.y - gesture.startY;
    if (!gesture.dragged && Math.hypot(dx, dy) < 5) return;
    gesture.dragged = true;
    const width = Math.max(180, event.currentTarget.offsetWidth);
    const yaw = gesture.baseYaw + (dx * 270) / width;
    gesture.velocity = (yaw - gesture.yaw) / Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.yaw = yaw;
    gesture.pitch = Math.max(-38, Math.min(38, -dy * 0.24));
    gesture.lastTime = event.timeStamp;
    applyPose(0, -6, 36, gesture.pitch, yaw, 0, 1.025);
  }

  function settle(event: PointerEvent<HTMLButtonElement>, allowActionAfter: boolean) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!gesture.dragged || !gimbal.current) return;
    suppressClick.current = true;

    const coast =
      event.timeStamp - gesture.lastTime < 90
        ? Math.max(-48, Math.min(48, gesture.velocity * 75))
        : 0;

    // If user dragged while viewing the Back Cover, snap smoothly to the Front Cover!
    if (gesture.baseYaw === 180) {
      const delta = (gesture.yaw + coast) - 180;
      const targetFrontYaw = delta >= 0 ? 360 : 0;
      cancelAnim();
      animatingRef.current = true;
      onFlipStart();
      const duration = Math.min(680, Math.max(360, Math.abs(targetFrontYaw - gesture.yaw) * 2.2));
      const t0 = performance.now();
      const sYaw = gesture.yaw;
      const sPitch = gesture.pitch;

      const finishDragFlip = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        const arc = Math.sin(t * Math.PI);
        const curYaw = sYaw + (targetFrontYaw - sYaw) * ease;
        const curPitch = sPitch * (1 - ease) + arc * 8;
        const curTz = 36 * (1 - ease) + arc * 52;
        applyPose(0, -6 * (1 - ease), curTz, curPitch, curYaw, 0, 1 + 0.025 * (1 - ease));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(finishDragFlip);
        } else {
          animatingRef.current = false;
          rafRef.current = null;
          if (gimbal.current) gimbal.current.style.transform = '';
          if (shadow.current) {
            shadow.current.style.transform = '';
            shadow.current.style.opacity = '';
          }
          onFlipComplete();
        }
      };
      rafRef.current = requestAnimationFrame(finishDragFlip);
      return;
    }

    const endYaw = Math.round((gesture.yaw + coast) / 360) * 360;
    const finish = () => {
      if (gimbal.current) gimbal.current.style.transform = '';
      if (shadow.current) {
        shadow.current.style.transform = '';
        shadow.current.style.opacity = '';
      }
      animatingRef.current = false;
      rafRef.current = null;
      if (allowActionAfter) onOpen();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    cancelAnim();
    animatingRef.current = true;
    const duration = Math.min(720, 380 + Math.abs(endYaw - gesture.yaw) * 1.7);
    const t0 = performance.now();
    const sYaw = gesture.yaw;
    const sPitch = gesture.pitch;

    const returnTick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const curYaw = sYaw + (endYaw - sYaw) * ease;
      const curPitch = sPitch * (1 - ease);
      const curTz = 36 * (1 - ease);
      applyPose(0, -6 * (1 - ease), curTz, curPitch, curYaw, 0, 1 + 0.025 * (1 - ease));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(returnTick);
      } else {
        finish();
      }
    };
    rafRef.current = requestAnimationFrame(returnTick);
  }

  function click(event: MouseEvent<HTMLButtonElement>) {
    if (animatingRef.current) return;
    if (event.detail !== 0 && suppressClick.current) return;
    if (coverFacing === 'back') {
      playFlipToFront(180, 0);
    } else if (coverFacing === 'front') {
      onOpen();
    }
  }

  const grip = {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => settle(event, true),
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => settle(event, false),
    onClick: click,
  };

  return { gimbal, shadow, sheen, grip, playFlipToFront };
}
