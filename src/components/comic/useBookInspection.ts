import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

interface Drag {
  id: number;
  startX: number;
  startY: number;
  yaw: number;
  pitch: number;
  velocity: number;
  lastTime: number;
  dragged: boolean;
}

export function getBookPointerCoords(event: { clientX: number; clientY: number }) {
  const isPortraitRotated =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 1023px) and (orientation: portrait)').matches;
  if (isPortraitRotated) {
    return {
      x: event.clientY,
      y: window.innerWidth - event.clientX,
      rotated: true,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
    rotated: false,
  };
}

// Keep pointer movement off React's render path. The camera and hinge animations
// run on different elements so returning the book never interrupts the opening shot.
export function useBookInspection(onOpen: () => void) {
  const gimbal = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const returning = useRef<Animation | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => () => returning.current?.cancel(), []);

  function pose(yaw: number, pitch: number, scale: number) {
    return `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${scale})`;
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0 || returning.current) return;
    suppressClick.current = false;
    const coords = getBookPointerCoords(event);
    drag.current = {
      id: event.pointerId,
      startX: coords.x,
      startY: coords.y,
      yaw: 0,
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
    const yaw = (dx * 270) / width;
    gesture.velocity = (yaw - gesture.yaw) / Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.yaw = yaw;
    gesture.pitch = Math.max(-38, Math.min(38, -dy * 0.24));
    gesture.lastTime = event.timeStamp;
    gimbal.current.style.transform = pose(yaw, gesture.pitch, 1.035);
  }

  function settle(event: PointerEvent<HTMLButtonElement>, openAfter: boolean) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!gesture.dragged || !gimbal.current) return;
    suppressClick.current = true;
    const model = gimbal.current;
    const coast =
      event.timeStamp - gesture.lastTime < 90
        ? Math.max(-36, Math.min(36, gesture.velocity * 65))
        : 0;
    const endYaw = Math.round((gesture.yaw + coast) / 360) * 360;
    const finish = () => {
      model.style.transform = '';
      returning.current = null;
      if (openAfter) onOpen();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const animation = model.animate(
      [
        { transform: pose(gesture.yaw, gesture.pitch, 1.035), easing: 'ease-out' },
        {
          transform: pose(gesture.yaw + coast, gesture.pitch * 0.92, 1.04),
          offset: 0.15,
          easing: 'cubic-bezier(.26,.68,.26,1)',
        },
        { transform: pose(endYaw, 0, 1) },
      ],
      { duration: Math.min(780, 390 + Math.abs(endYaw - gesture.yaw) * 1.8) },
    );
    returning.current = animation;
    animation.onfinish = finish;
  }

  function click(event: MouseEvent<HTMLButtonElement>) {
    if (!returning.current && (event.detail === 0 || !suppressClick.current)) onOpen();
  }

  const grip = {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => settle(event, true),
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => settle(event, false),
    onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => settle(event, false),
    onClick: click,
  };
  return { gimbal, grip };
}
