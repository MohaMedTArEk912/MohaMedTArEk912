import { useCallback, useEffect, useLayoutEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
import { sounds } from '../../audio/soundSynthesizer';

export interface FoldHandoffRect {
  side: 'front' | 'back';
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

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
  justFolded: FoldHandoffRect | null;
  onOpen: () => void;
  onConsumeFold: () => void;
  onFlipStart: () => void;
  onFlipComplete: () => void;
}

/**
 * Physical 3D hardcover inspection, pixel-exact FLIP cover-close handoff,
 * and 120fps rigid-body toss-flip engine.
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
  const camera = useRef<HTMLDivElement>(null);
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
      shadow.current.style.transform =
        `translate3d(${shX.toFixed(1)}px, ${shY.toFixed(1)}px, 0) rotate(-9deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      shadow.current.style.opacity = opacity.toFixed(3);
    }
  }, []);

  /**
   * 120fps physical hardcover toss-flip from Back Cover (yaw = 180deg) -> Front Cover (yaw = 0deg):
   * 1) Finger-edge press anticipation into the desk
   * 2) Parabolic airborne heave off the table (tz +158px) + 180deg barrel-flip past the gold spine
   * 3) Weighted hardcover thud onto the desk + dampened micro-rebound settle
   */
  const playFlipToFront = useCallback((startYaw = 180, startPitch = 0) => {
    clearAutoTimer();
    cancelAnim();
    onFlipStart();

    if (camera.current) camera.current.style.transform = '';

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
        const u = raw / 0.13;
        const ease = Math.sin(u * Math.PI * 0.5);
        tx = ease * 5;
        ty = ease * 3;
        tz = -ease * 9;
        pitch = startPitch + ease * (-4.5 - startPitch);
        yaw = startYaw + ease * 7;
        roll = -ease * 2.4;
      } else if (raw < 0.78) {
        const u = (raw - 0.13) / 0.65;
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
        if (camera.current) camera.current.style.transform = '';
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

  // Synchronous pre-paint FLIP handoff so there is ZERO cut or size jump between
  // the folded spread leaf (OpenComicBook) and the 3D hardcover book (ComicBookCover).
  useLayoutEffect(() => {
    clearAutoTimer();

    if (justFolded && gimbal.current && camera.current) {
      const handoff = justFolded;
      const targetBaseYaw = handoff.side === 'back' ? 180 : 0;
      onConsumeFold();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        camera.current.style.transform = '';
        applyPose(0, 0, 0, 0, targetBaseYaw, 0, 1);
        if (targetBaseYaw === 180) onFlipComplete();
        return;
      }

      cancelAnim();

      // 1. Put gimbal + camera into flat 0deg face-on pose and measure exact natural cover rect
      gimbal.current.style.transform = targetBaseYaw === 180 ? 'rotateY(180deg)' : 'none';
      camera.current.style.transform = 'none';
      const faceSelector = handoff.side === 'back' ? '.book-back' : '.comic-closed-book';
      const faceEl = camera.current.querySelector<HTMLElement>(faceSelector);
      const natRect = faceEl?.getBoundingClientRect();

      let sx = 1;
      let sy = 1;
      let dx = 0;
      let dy = 0;

      if (natRect && natRect.width > 10 && natRect.height > 10 && handoff.width > 10 && handoff.height > 10) {
        sx = handoff.width / natRect.width;
        sy = handoff.height / natRect.height;
        const screenDx = handoff.centerX - (natRect.left + natRect.width / 2);
        dx = targetBaseYaw === 180 ? -screenDx : screenDx;
        dy = handoff.centerY - (natRect.top + natRect.height / 2);
      }

      // 2. Invert synchronously BEFORE browser paint: Frame 0 matches the landed leaf to 0.01px!
      camera.current.style.transform =
        `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0px) ` +
        `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      if (shadow.current) {
        shadow.current.style.opacity = '0.25';
      }

      // 3. Play: smoothly dolly camera out from the close-up reading plane into the 3D hardcover desk pose
      animatingRef.current = true;
      const settleMs = 560;
      const t0 = performance.now();

      const settleTick = (now: number) => {
        const t = Math.min(1, (now - t0) / settleMs);
        // Smooth quintic out curve carrying the momentum of the closing fold
        const ease = 1 - Math.pow(1 - t, 3.4);

        const curDx = dx * (1 - ease);
        const curDy = dy * (1 - ease);
        const curRx = 9 * ease;
        const curRy = -15 * ease;
        const curRz = -4 * ease;
        const curSx = sx + (1 - sx) * ease;
        const curSy = sy + (1 - sy) * ease;

        if (camera.current) {
          camera.current.style.transform =
            `translate3d(${curDx.toFixed(2)}px, ${curDy.toFixed(2)}px, 0px) ` +
            `rotateX(${curRx.toFixed(2)}deg) rotateY(${curRy.toFixed(2)}deg) rotateZ(${curRz.toFixed(2)}deg) ` +
            `scale(${curSx.toFixed(4)}, ${curSy.toFixed(4)})`;
        }
        if (shadow.current) {
          shadow.current.style.opacity = (0.25 + 0.75 * ease).toFixed(3);
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(settleTick);
        } else {
          animatingRef.current = false;
          rafRef.current = null;
          if (camera.current) camera.current.style.transform = '';
          if (shadow.current) shadow.current.style.opacity = '';
          if (targetBaseYaw === 0) {
            if (gimbal.current) gimbal.current.style.transform = '';
          } else {
            applyPose(0, 0, 0, 0, 180, 0, 1);
            autoFlipTimer.current = window.setTimeout(() => {
              if (!drag.current) playFlipToFront(180, 0);
            }, 720);
          }
        }
      };

      rafRef.current = requestAnimationFrame(settleTick);
      return;
    }

    if (coverFacing === 'back' && !animatingRef.current) {
      if (camera.current) camera.current.style.transform = '';
      applyPose(0, 0, 0, 0, 180, 0, 1);
      autoFlipTimer.current = window.setTimeout(() => {
        if (!drag.current) playFlipToFront(180, 0);
      }, 900);
    } else if (coverFacing === 'front' && !animatingRef.current && !drag.current) {
      if (camera.current) camera.current.style.transform = '';
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

  return { gimbal, camera, shadow, sheen, grip, playFlipToFront };
}
