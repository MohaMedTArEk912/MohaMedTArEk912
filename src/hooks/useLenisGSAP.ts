import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCommandStore } from '../store/useCommandStore';
import { useArcadeStore } from '../store/useArcadeStore';

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;

/**
 * Universal smooth scroll helper utilizing Lenis virtual physics
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  options?: { offset?: number; duration?: number }
) {
  if (globalLenis) {
    globalLenis.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.35,
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
    });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}

export function useLenisGSAP() {
  const lenisRef = useRef<Lenis | null>(null);
  const readerMode = useCommandStore((s) => s.readerMode);
  const viewMode = useCommandStore((s) => s.viewMode);
  const isCommandPaletteOpen = useCommandStore((s) => s.isCommandPaletteOpen);
  const activeGame = useCommandStore((s) => s.activeGame);
  const activeStationDrawer = useCommandStore((s) => s.activeStationDrawer);
  const isTerminalFullscreen = useCommandStore((s) => s.isTerminalFullscreen);
  const isTrophyModalOpen = useArcadeStore((s) => s.isTrophyModalOpen);
  const arcadeActiveGame = useArcadeStore((s) => s.activeGame);

  useEffect(() => {
    if (readerMode !== 'scroll') return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.5,
      syncTouch: true,
      syncTouchLerp: 0.075,
      prevent: (node) => {
        // Prevent Lenis from stealing wheel events for any element with or inside [data-lenis-prevent]
        return (
          node instanceof HTMLElement &&
          (node.hasAttribute('data-lenis-prevent') || !!node.closest('[data-lenis-prevent]'))
        );
      },
    });
    lenisRef.current = lenis;
    globalLenis = lenis;
    (window as any).__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
      (window as any).__lenis = null;
    };
  }, [readerMode]);

  useEffect(() => {
    const isModalOpen =
      viewMode === '2d-executive' ||
      isCommandPaletteOpen ||
      isTerminalFullscreen ||
      isTrophyModalOpen ||
      arcadeActiveGame !== 'none' ||
      !!activeGame ||
      !!activeStationDrawer;

    if (lenisRef.current) {
      if (isModalOpen) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }

    if (readerMode !== 'scroll') {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
      document.body.style.height = '100vh';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    }
  }, [
    readerMode,
    viewMode,
    isCommandPaletteOpen,
    isTerminalFullscreen,
    isTrophyModalOpen,
    arcadeActiveGame,
    activeGame,
    activeStationDrawer,
  ]);
}
