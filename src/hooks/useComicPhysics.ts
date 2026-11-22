import { useEffect } from 'react';
import { avatarPhysicsImpulse } from '../components/3d/avatarPhysicsImpulse';

const SFX_WORDS = ['POW!!', 'ZAP!!', 'BAM!!', 'KRAK!!', 'BOOM!!', 'SHING!!', 'ACK 12MS!!'];

export function useComicPhysics(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let activePanel: HTMLElement | null = null;
    let activeRect: DOMRect | null = null;
    let rafId: number | null = null;

    // Target vs. Current interpolated tilt angles (for buttery 120Hz exponential lerp)
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    const resetPanel = (panel: HTMLElement | null) => {
      if (!panel) return;
      panel.removeAttribute('data-tilting');
      panel.style.transform = '';
      panel.style.boxShadow = '';
    };

    const tickTiltLerp = () => {
      if (!activePanel) {
        rafId = null;
        return;
      }

      // Exponential smoothing (lerp factor 0.16 for velvety response)
      curRotX += (targetRotX - curRotX) * 0.16;
      curRotY += (targetRotY - curRotY) * 0.16;

      const shadowX = (8 - (curRotY / 4.2) * 5).toFixed(1);
      const shadowY = (8 + (curRotX / 4.2) * 5).toFixed(1);

      activePanel.style.transform = `perspective(1000px) rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg) translate3d(0, -3.5px, 0) scale(1.01)`;
      activePanel.style.boxShadow = `${shadowX}px ${shadowY}px 0px #09080D, ${(Number(shadowX) + 2.5).toFixed(1)}px ${(Number(shadowY) + 2.5).toFixed(1)}px 0px #E62E25`;

      if (
        Math.abs(targetRotX - curRotX) > 0.02 ||
        Math.abs(targetRotY - curRotY) > 0.02
      ) {
        rafId = requestAnimationFrame(tickTiltLerp);
      } else {
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (window.innerWidth < 768) return; // Keep mobile ultra-light
      const target = (e.target as HTMLElement | null)?.closest(
        '.comic-panel-frame, .comic-starburst, .comic-speech-bubble, .comic-narrator-box'
      ) as HTMLElement | null;

      if (target !== activePanel) {
        resetPanel(activePanel);
        activePanel = target;
        if (activePanel) {
          // Cache bounding rect ONCE per panel entry (zero layout thrashing on move!)
          activeRect = activePanel.getBoundingClientRect();
          activePanel.setAttribute('data-tilting', 'true');
          curRotX = 0;
          curRotY = 0;
        } else {
          activeRect = null;
        }
      }

      if (activePanel && activeRect && activeRect.width > 0 && activeRect.height > 0) {
        const nx = Math.max(-1, Math.min(1, ((e.clientX - activeRect.left) / activeRect.width - 0.5) * 2));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - activeRect.top) / activeRect.height - 0.5) * 2));

        targetRotY = nx * 4.2;
        targetRotX = -ny * 4.2;

        if (rafId === null) {
          rafId = requestAnimationFrame(tickTiltLerp);
        }
      }
    };

    // Invalidate cached bounding rect on scroll so tilt stays accurate without layout thrashing
    const handleScroll = () => {
      if (activePanel) {
        resetPanel(activePanel);
        activePanel = null;
        activeRect = null;
      }
    };

    // 2. Click Physics Impulse (Sends energy wave to 3D Avatar + spawns lightweight SFX burst)
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = target.closest(
        'button, a, .comic-panel-frame, .comic-starburst, .comic-speech-bubble'
      );
      if (!isInteractive) return;

      // Send physical spring impulse to the 3D Avatar & Pedestal Shockwave
      avatarPhysicsImpulse.trigger(0.85);

      // On mobile touch, give the tapped comic panel a snappy 3D comic press-bounce!
      const tappedPanel = target.closest(
        '.comic-panel-frame, .comic-starburst, .comic-speech-bubble, .comic-narrator-box'
      ) as HTMLElement | null;
      if (tappedPanel && window.innerWidth < 768) {
        tappedPanel.style.transform = 'scale(0.975) rotate(-0.6deg)';
        window.setTimeout(() => {
          tappedPanel.style.transform = '';
        }, 220);
      }

      // Spawn lightweight self-cleaning Comic SFX Pop Stamp at cursor
      const stamp = document.createElement('div');
      const word = SFX_WORDS[Math.floor(Math.random() * SFX_WORDS.length)];
      const angle = (Math.random() * 24 - 12).toFixed(1);
      stamp.className = 'comic-click-pop';
      stamp.textContent = word;
      stamp.style.left = `${e.clientX}px`;
      stamp.style.top = `${e.clientY}px`;
      stamp.style.setProperty('--pop-rot', `${angle}deg`);
      document.body.appendChild(stamp);

      window.setTimeout(() => {
        stamp.remove();
      }, 500);
    };

    // 3. Scroll-Triggered Staggered Comic Panel Entrance Physics via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            observer.unobserve(el);
            if (!el.dataset.entered) {
              el.dataset.entered = 'true';
              el.classList.add('comic-panel-in');
              // Clean up animation class after entrance finishes so inline hover transforms never clash
              el.addEventListener(
                'animationend',
                () => {
                  el.classList.remove('comic-panel-in');
                },
                { once: true }
              );
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    const observeAllPanels = () => {
      const panels = document.querySelectorAll(
        '.comic-panel-frame:not([data-entered]), .comic-starburst:not([data-entered]), .comic-speech-bubble:not([data-entered]), .comic-narrator-box:not([data-entered])'
      );
      panels.forEach((el, idx) => {
        (el as HTMLElement).style.setProperty('--stagger-delay', `${(idx % 4) * 35}ms`);
        observer.observe(el);
      });
    };

    observeAllPanels();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resetPanel(activePanel);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [enabled]);
}
