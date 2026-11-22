import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import '../../styles/page-flip.css';
import '../../styles/chronicles.css';
import { ComicBookCover } from '../comic/ComicBookCover';
import { Vol0ArchiveDeskSpread } from '../comic/spreads/Vol0ArchiveDeskSpread';
import { Vol1SoftwareSpread } from '../comic/spreads/Vol1SoftwareSpread';
import { Vol2FullStackSpread } from '../comic/spreads/Vol2FullStackSpread';
import { Vol3AkashaSpread } from '../comic/spreads/Vol3AkashaSpread';
import { Vol4IcuSpread } from '../comic/spreads/Vol4IcuSpread';
import { Vol5QuizLibrarySpread } from '../comic/spreads/Vol5QuizLibrarySpread';
import { Vol6InstructorSpread } from '../comic/spreads/Vol6InstructorSpread';
import { Vol7WarRoomSpread } from '../comic/spreads/Vol7WarRoomSpread';
import { Vol8ContactSpread } from '../comic/spreads/Vol8ContactSpread';

const ISSUE_SPREADS = [
  { index: 0, code: '00', title: 'Cover & Contents', Component: Vol0ArchiveDeskSpread },
  { index: 1, code: '01', title: '01 · Engineering Foundations', Component: Vol1SoftwareSpread },
  { index: 2, code: '02', title: '02 · Cloud & Delivery', Component: Vol2FullStackSpread },
  { index: 3, code: '03', title: '03 · Akasha Platform', Component: Vol3AkashaSpread },
  { index: 4, code: '04', title: '04 · ICU Management System', Component: Vol4IcuSpread },
  { index: 5, code: '05', title: '05 · Quiz & Library Systems', Component: Vol5QuizLibrarySpread },
  { index: 6, code: '06', title: '06 · Teaching & Mentoring', Component: Vol6InstructorSpread },
  { index: 7, code: '07', title: '07 · Project Coordination', Component: Vol7WarRoomSpread },
  { index: 8, code: '08', title: '08 · Terminal & Contact', Component: Vol8ContactSpread },
];

type FlipDirection = 'next' | 'prev';

interface FlipSession {
  id: number;
  fromIndex: number;
  toIndex: number;
  direction: FlipDirection;
}

/** Realistic paper-weight easing: brisk corner lift, buoyant mid-arc, air-cushioned settle. */
function easePaperTurn(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  // Smooth quintic S-curve with gentle paper-weight follow-through
  return clamped < 0.5
    ? 8 * Math.pow(clamped, 4)
    : 1 - Math.pow(-2 * clamped + 2, 4) / 2;
}

/** Smooth deceleration curve used after releasing an interactive drag. */
function easeOutQuint(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 4);
}

interface FlipPhysicsRefs {
  leaf: HTMLElement | null;
  leftShadow: HTMLElement | null;
  rightShadow: HTMLElement | null;
  frontLight: HTMLElement | null;
  backLight: HTMLElement | null;
}

/**
 * GPU-composited 3D paper & book physics engine (120fps, zero CSS-variable style recalc cascade,
 * zero dynamic gradient re-rasterization). Applies multi-axis paper camber, corner pitch, dihedral
 * twist, and cast shadows directly to composited element refs.
 */
function applyFlipPhysics(
  refs: FlipPhysicsRefs,
  rawProgress: number,
  direction: FlipDirection,
  grabBias = 0,
): { bookTiltY: number; bookTiltX: number; bookTiltZ: number; bookLiftZ: number } {
  const p = Math.max(0, Math.min(1, rawProgress));
  const rad = p * Math.PI;
  const sinP = Math.sin(rad);
  const sin2P = Math.sin(rad * 2);
  const sign = direction === 'next' ? -1 : 1;

  // 1. Primary 3D hinge angle (0 -> +-180deg)
  const angle = sign * p * 180;

  // 2. Organic paper camber (S-curve whip: trails during lift, cushions during landing)
  const camber = sign * (sinP * (1.85 + grabBias * 1.15) + sin2P * 0.65);

  // 3. 3D Corner-peel pitch (rotateX) & dihedral twist (rotateZ) that peak mid-arc and settle to 0
  const pitchX = -sinP * (1.4 - grabBias * 1.6);
  const twistZ = sign * sinP * (0.85 + grabBias * 0.95);

  // 4. Perspective width compensation so the turning sheet never protrudes past the book border
  const scaleComp = 1 - sinP * 0.032;

  if (refs.leaf) {
    refs.leaf.style.transform = `rotateY(${angle.toFixed(2)}deg) rotateX(${pitchX.toFixed(2)}deg) rotateZ(${twistZ.toFixed(2)}deg) skewY(${camber.toFixed(2)}deg) scale(${scaleComp.toFixed(4)})`;
  }

  // 5. GPU-only diffuse & specular paper shading (opacity only)
  const frontP = Math.min(1, p * 2);
  const backP = Math.max(0, (p - 0.5) * 2);
  const frontShade = Math.pow(frontP, 1.25) * 0.68;
  const backShade = Math.pow(1 - backP, 1.25) * 0.66;

  if (refs.frontLight) {
    refs.frontLight.style.opacity = frontShade.toFixed(3);
  }
  if (refs.backLight) {
    refs.backLight.style.opacity = backShade.toFixed(3);
  }

  // 6. GPU-only cast shadows on static under-pages (opacity + scaleX only)
  const underOpacity = p < 0.78 ? Math.pow(1 - p / 0.78, 1.1) * 0.62 : 0;
  const underScale = Math.max(0.15, 1 - p * 0.85);

  const landT = Math.max(0, (p - 0.25) / 0.75);
  const landOpacity = Math.sin(landT * Math.PI) * 0.58;
  const landScale = 0.2 + landT * 0.85;

  const underShadow = direction === 'next' ? refs.rightShadow : refs.leftShadow;
  const landShadow = direction === 'next' ? refs.leftShadow : refs.rightShadow;

  if (underShadow) {
    underShadow.style.opacity = underOpacity.toFixed(3);
    underShadow.style.transform = `scaleX(${underScale.toFixed(3)})`;
  }
  if (landShadow) {
    landShadow.style.opacity = landOpacity.toFixed(3);
    landShadow.style.transform = `scaleX(${landScale.toFixed(3)})`;
  }

  // 7. Return physical weight-transfer impulse on the whole open book shell
  // As the heavy sheet swings across the spine, the book rocks gently toward the receiving side
  const weightWave = Math.sin((p - 0.35) * Math.PI) * sinP;
  const bookTiltY = sign * weightWave * 2.4;
  const bookTiltX = sinP * 1.15;
  const bookTiltZ = sign * sin2P * 0.38;
  const bookLiftZ = sinP * 6;

  return { bookTiltY, bookTiltX, bookTiltZ, bookLiftZ };
}

interface BookFolioNavProps {
  spread: typeof ISSUE_SPREADS[number];
  onClose: () => void;
  onSelectIssue: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  decorative?: boolean;
}

function BookFolioNav({
  spread,
  onClose,
  onSelectIssue,
  onPrev,
  onNext,
  decorative = false,
}: BookFolioNavProps) {
  const Tag = decorative ? 'div' : 'nav';

  return (
    <Tag
      {...(!decorative ? { 'aria-label': 'Comic reader' } : {})}
      className="issue-toolbar comic-folio-nav"
    >
      {/* Left Page Embedded Folio Header */}
      <div className="issue-toolbar-left-page">
        <div className="issue-toolbar-sheet-box">
          <div className="issue-toolbar-home">
            <button
              data-close-book={decorative ? undefined : true}
              tabIndex={decorative ? -1 : undefined}
              type="button"
              onClick={decorative ? undefined : onClose}
              className="ink-button"
            >
              <BookOpen aria-hidden="true" /> Close book
            </button>
            <a
              href={import.meta.env.BASE_URL}
              aria-label="Return to landing"
              tabIndex={decorative ? -1 : undefined}
              className="issue-landing"
            >
              <span>Return to </span>Landing
            </a>
          </div>
          <span
            className="issue-toolbar-title"
            aria-live={decorative ? undefined : 'polite'}
          >
            {spread.title}
          </span>
        </div>
      </div>

      {/* Right Page Embedded Folio Header */}
      <div className="issue-toolbar-right-page">
        <div className="issue-toolbar-sheet-box">
          <div className="issue-toolbar-pager">
            <button
              type="button"
              tabIndex={decorative ? -1 : undefined}
              onClick={decorative ? undefined : onPrev}
              disabled={spread.index === 0}
              aria-label="Previous volume"
              title="Previous volume (Left Arrow)"
              className="ink-button"
            >
              <ChevronLeft aria-hidden="true" />
              <span>Prev</span>
            </button>
            <div className="issue-tabs" aria-label="Volumes" role="group">
              {ISSUE_SPREADS.map((issue) => (
                <button
                  type="button"
                  key={issue.code}
                  tabIndex={decorative ? -1 : undefined}
                  title={issue.title}
                  aria-label={issue.title}
                  aria-current={!decorative && issue.index === spread.index ? 'page' : undefined}
                  onClick={decorative ? undefined : () => onSelectIssue(issue.index)}
                >
                  {issue.code}
                </button>
              ))}
            </div>
            <button
              type="button"
              tabIndex={decorative ? -1 : undefined}
              onClick={decorative ? undefined : onNext}
              disabled={spread.index === ISSUE_SPREADS.length - 1}
              aria-label="Next volume"
              title="Next volume (Right Arrow)"
              className="ink-button issue-next"
            >
              <span>Next</span>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Tag>
  );
}

function SpreadHalf({
  spread,
  side,
  onClose,
  onSelectIssue,
  onPrev,
  onNext,
}: {
  spread: typeof ISSUE_SPREADS[number];
  side: 'left' | 'right';
  onClose: () => void;
  onSelectIssue: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const Spread = spread.Component;
  return (
    <div className={`flip-half-clip flip-half-${side}`} inert aria-hidden="true">
      <div className="flip-half-content flex flex-col">
        <BookFolioNav
          spread={spread}
          onClose={onClose}
          onSelectIssue={onSelectIssue}
          onPrev={onPrev}
          onNext={onNext}
          decorative
        />
        <div className="flex-1 min-h-0 flex flex-col">
          <Spread />
        </div>
      </div>
    </div>
  );
}

type BookState = 'closed' | 'opening' | 'open' | 'closing';

export function ComicBookFlipReader() {
  const [state, setState] = useState<BookState>(() =>
    new URLSearchParams(location.search).has('volume') ? 'open' : 'closed',
  );
  const binding = useRef<HTMLDivElement>(null);
  const focusAfterTurn = useRef(false);
  const moving = state === 'opening' || state === 'closing';

  useEffect(() => {
    const restore = () => {
      const value = new URLSearchParams(location.search).get('volume');
      const index = Number(value);
      setState(value === null ? 'closed' : 'open');
      useCommandStore.getState().setActiveIssueIndex(ISSUE_SPREADS[index] ? index : 0);
      focusAfterTurn.current = true;
    };
    const unsubscribe = useCommandStore.subscribe((next, previous) => {
      if (next.activeIssueIndex === previous.activeIssueIndex) return;
      const url = new URL(location.href);
      if (!url.searchParams.has('volume') || url.searchParams.get('volume') === String(next.activeIssueIndex)) return;
      url.searchParams.set('volume', String(next.activeIssueIndex));
      history.pushState(null, '', url);
    });
    window.addEventListener('popstate', restore);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', restore);
    };
  }, []);

  function turnBook(open: boolean) {
    if (moving) return;
    const url = new URL(location.href);
    if (open) url.searchParams.set('volume', String(useCommandStore.getState().activeIssueIndex));
    else url.searchParams.delete('volume');
    history.pushState(null, '', url);
    focusAfterTurn.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState(open ? 'open' : 'closed');
    } else {
      setState(open ? 'opening' : 'closing');
    }
  }

  useLayoutEffect(() => {
    if (moving) return;
    if (!focusAfterTurn.current) return;
    focusAfterTurn.current = false;
    binding.current?.querySelector<HTMLButtonElement>(
      state === 'closed' ? '.book-grip' : '[data-close-book]',
    )?.focus({ preventScroll: true });
  }, [moving, state]);

  return (
    <div ref={binding} className="comic-binding" data-book-state={state}>
      {state !== 'closed' && <OpenComicBook onClose={() => turnBook(false)} moving={moving} />}
      {state !== 'open' && (
        <ComicBookCover moving={moving} onOpen={() => turnBook(true)}
          onTurnEnd={() => setState(current => current === 'closing' ? 'closed' : 'open')} />
      )}
    </div>
  );
}

function OpenComicBook({ onClose, moving }: { onClose: () => void; moving: boolean }) {
  const {
    activeIssueIndex,
    flipDirection,
    flipCounter,
    setActiveIssueIndex,
    nextIssue,
    prevIssue,
    readerMode,
  } = useCommandStore();

  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 1023px), (orientation: portrait)').matches);
  const isVertical = narrow || readerMode === 'vertical';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px), (orientation: portrait)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Physical 3D page-turn state
  const [displayedIndex, setDisplayedIndex] = useState(activeIssueIndex);
  const [flipSession, setFlipSession] = useState<FlipSession | null>(null);

  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const leftShadowRef = useRef<HTMLDivElement>(null);
  const rightShadowRef = useRef<HTMLDivElement>(null);
  const frontLightRef = useRef<HTMLDivElement>(null);
  const backLightRef = useRef<HTMLDivElement>(null);

  const flipRafRef = useRef<number | null>(null);
  const tiltRafRef = useRef<number | null>(null);
  const bookTiltRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    flipX: 0,
    flipY: 0,
    flipZ: 0,
    flipLift: 0,
  });
  const flipSessionRef = useRef<FlipSession | null>(null);
  const displayedIndexRef = useRef(activeIssueIndex);
  const flipProgressRef = useRef(0);
  const flipIdRef = useRef(0);
  const internalCommitRef = useRef<number | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const wheelCooldownRef = useRef(0);

  const syncShellTransform = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const t = bookTiltRef.current;
    const rx = t.currentX + t.flipX;
    const ry = t.currentY + t.flipY;
    const rz = t.flipZ;
    const tz = t.flipLift;
    if (Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01 && Math.abs(rz) < 0.01 && Math.abs(tz) < 0.05) {
      shell.style.transform = '';
    } else {
      shell.style.transform = `translate3d(0, 0, ${tz.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
    }
  }, []);

  const stepBookTiltSpring = useCallback(function stepTilt() {
    const t = bookTiltRef.current;
    t.currentX += (t.targetX - t.currentX) * 0.14;
    t.currentY += (t.targetY - t.currentY) * 0.14;
    syncShellTransform();

    if (
      Math.abs(t.targetX - t.currentX) > 0.015 ||
      Math.abs(t.targetY - t.currentY) > 0.015
    ) {
      tiltRafRef.current = requestAnimationFrame(stepTilt);
    } else {
      t.currentX = t.targetX;
      t.currentY = t.targetY;
      syncShellTransform();
      tiltRafRef.current = null;
    }
  }, [syncShellTransform]);

  const setBookPointerTilt = useCallback((rx: number, ry: number) => {
    bookTiltRef.current.targetX = rx;
    bookTiltRef.current.targetY = ry;
    if (tiltRafRef.current === null) {
      tiltRafRef.current = requestAnimationFrame(stepBookTiltSpring);
    }
  }, [stepBookTiltSpring]);

  const dragRef = useRef<{
    active: boolean;
    engaged: boolean;
    fromCornerPeel: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    direction: FlipDirection;
    grabBias: number;
  }>({
    active: false,
    engaged: false,
    fromCornerPeel: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    direction: 'next',
    grabBias: 0,
  });

  const stopFlipRaf = useCallback(() => {
    if (flipRafRef.current !== null) {
      cancelAnimationFrame(flipRafRef.current);
      flipRafRef.current = null;
    }
  }, []);

  const getPhysicsRefs = useCallback((): FlipPhysicsRefs => ({
    leaf: leafRef.current,
    leftShadow: leftShadowRef.current,
    rightShadow: rightShadowRef.current,
    frontLight: frontLightRef.current,
    backLight: backLightRef.current,
  }), []);

  const updateFlipFrame = useCallback((p: number, direction: FlipDirection, grabBias: number) => {
    const impulse = applyFlipPhysics(getPhysicsRefs(), p, direction, grabBias);
    bookTiltRef.current.flipX = impulse.bookTiltX;
    bookTiltRef.current.flipY = impulse.bookTiltY;
    bookTiltRef.current.flipZ = impulse.bookTiltZ;
    bookTiltRef.current.flipLift = impulse.bookLiftZ;
    syncShellTransform();
  }, [getPhysicsRefs, syncShellTransform]);

  const animateFlipTo = useCallback((
    session: FlipSession,
    startProgress: number,
    endProgress: 0 | 1,
    durationMs: number,
    easing: 'paper' | 'settle',
    grabBias = 0,
    onDone?: () => void,
  ) => {
    stopFlipRaf();
    const startTime = performance.now();
    const delta = endProgress - startProgress;
    const easeFn = easing === 'paper' ? easePaperTurn : easeOutQuint;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const p = startProgress + delta * easeFn(t);
      flipProgressRef.current = p;
      updateFlipFrame(p, session.direction, grabBias);

      if (t < 1) {
        flipRafRef.current = requestAnimationFrame(tick);
      } else {
        bookTiltRef.current.flipX = 0;
        bookTiltRef.current.flipY = 0;
        bookTiltRef.current.flipZ = 0;
        bookTiltRef.current.flipLift = 0;
        syncShellTransform();
        flipRafRef.current = null;
        flipSessionRef.current = null;
        setFlipSession(null);
        onDone?.();
      }
    };

    // Apply frame 0 immediately on next layout frame so leafRef is mounted
    flipRafRef.current = requestAnimationFrame((firstNow) => {
      updateFlipFrame(startProgress, session.direction, grabBias);
      tick(firstNow);
    });
  }, [stopFlipRaf, syncShellTransform, updateFlipFrame]);

  // Subscribe to Zustand page changes so every button, arrow key, TOC click, or wheel swipe plays the real 3D physical flip
  useEffect(() => {
    const unsubscribe = useCommandStore.subscribe((state, prev) => {
      if (state.activeIssueIndex === prev.activeIssueIndex) return;
      const nextIdx = state.activeIssueIndex;

      // If this store update was committed by an interactive drag completion, skip duplicate animation
      if (internalCommitRef.current === nextIdx) {
        internalCommitRef.current = null;
        displayedIndexRef.current = nextIdx;
        setDisplayedIndex(nextIdx);
        return;
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isVertical || reducedMotion) {
        stopFlipRaf();
        flipSessionRef.current = null;
        setFlipSession(null);
        displayedIndexRef.current = nextIdx;
        setDisplayedIndex(nextIdx);
        return;
      }

      // If a flip was mid-flight, chain smoothly from its target or current displayed spread
      const fromIdx = flipSessionRef.current ? flipSessionRef.current.toIndex : displayedIndexRef.current;
      if (fromIdx === nextIdx) {
        displayedIndexRef.current = nextIdx;
        setDisplayedIndex(nextIdx);
        return;
      }

      const direction: FlipDirection = nextIdx > fromIdx ? 'next' : 'prev';
      const session: FlipSession = {
        id: ++flipIdRef.current,
        fromIndex: fromIdx,
        toIndex: nextIdx,
        direction,
      };

      flipSessionRef.current = session;
      flipProgressRef.current = 0;
      setFlipSession(session);

      animateFlipTo(session, 0, 1, 640, 'paper', 0, () => {
        displayedIndexRef.current = nextIdx;
        setDisplayedIndex(nextIdx);
      });
    });

    return () => {
      unsubscribe();
      stopFlipRaf();
      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
        tiltRafRef.current = null;
      }
    };
  }, [animateFlipTo, isVertical, stopFlipRaf]);

  // Keyboard ArrowLeft / ArrowRight & Horizontal Trackpad Swipe Page Flip
  useEffect(() => {
    if (moving) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.defaultPrevented || target?.closest('input, textarea, select, [contenteditable]')) return;
      const { viewMode, activeStationDrawer, isCommandPaletteOpen, isTerminalFullscreen } = useCommandStore.getState();
      if (viewMode !== '3d' || activeStationDrawer || isCommandPaletteOpen || isTerminalFullscreen) return;
      if (e.key === 'ArrowRight') {
        nextIssue();
      } else if (e.key === 'ArrowLeft') {
        prevIssue();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isVertical) return;
      if (Math.abs(e.deltaX) > 42 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) {
        const now = Date.now();
        if (now - wheelCooldownRef.current < 750) return;
        wheelCooldownRef.current = now;
        if (e.deltaX > 0) {
          nextIssue();
        } else {
          prevIssue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [nextIssue, prevIssue, isVertical, moving]);

  // Interactive Real-Time 3D Page Grab & Peel Gesture (works on corner peel & anywhere on page)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isVertical || moving || e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    const peelBtn = target?.closest<HTMLElement>('[data-corner-peel]');
    if (!peelBtn && target?.closest('button, a, input, textarea, select, [data-lenis-prevent]')) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (peelBtn) {
        const dir = peelBtn.dataset.cornerPeel as FlipDirection;
        if (dir === 'next') nextIssue();
        else prevIssue();
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = rect.height > 0 ? ((e.clientY - rect.top) / rect.height) * 2 - 1 : 0;
    const grabBias = peelBtn ? 0.85 : Math.max(-1, Math.min(1, relY));
    const peelDir = (peelBtn?.dataset.cornerPeel as FlipDirection | undefined) || 'next';

    dragRef.current = {
      active: true,
      engaged: false,
      fromCornerPeel: Boolean(peelBtn),
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
      direction: peelDir,
      grabBias,
    };

    // If user grabbed the physical dog-ear corner peel, immediately lift the 3D sheet under their pointer!
    if (peelBtn) {
      const curIdx = displayedIndexRef.current;
      const targetIdx = peelDir === 'next' ? curIdx + 1 : curIdx - 1;
      if (targetIdx >= 0 && targetIdx < ISSUE_SPREADS.length) {
        stopFlipRaf();
        dragRef.current.engaged = true;
        const session: FlipSession = {
          id: ++flipIdRef.current,
          fromIndex: curIdx,
          toIndex: targetIdx,
          direction: peelDir,
        };
        flipSessionRef.current = session;
        flipProgressRef.current = 0.045;
        setFlipSession(session);
        e.currentTarget.setPointerCapture?.(e.pointerId);
        requestAnimationFrame(() => {
          if (flipSessionRef.current?.id === session.id) {
            updateFlipFrame(flipProgressRef.current, session.direction, grabBias);
          }
        });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Subtle 3D interactive parallax tilt on the open book as pointer moves across it
    if (!isVertical && !moving && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setBookPointerTilt(-ny * 1.45, nx * 2.1);
      }
    }

    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const now = performance.now();
    const dt = Math.max(8, now - drag.lastTime);

    if (!drag.engaged) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.1) return;

      const curIdx = displayedIndexRef.current;
      const wantDir: FlipDirection = dx < 0 ? 'next' : 'prev';
      const targetIdx = wantDir === 'next' ? curIdx + 1 : curIdx - 1;
      if (targetIdx < 0 || targetIdx >= ISSUE_SPREADS.length) return;

      stopFlipRaf();
      drag.engaged = true;
      drag.direction = wantDir;

      const session: FlipSession = {
        id: ++flipIdRef.current,
        fromIndex: curIdx,
        toIndex: targetIdx,
        direction: wantDir,
      };
      flipSessionRef.current = session;
      setFlipSession(session);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }

    const session = flipSessionRef.current;
    if (!session) return;

    const stageWidth = stageRef.current?.clientWidth || window.innerWidth * 0.85;
    const travelDist = Math.max(260, stageWidth * 0.52);
    const signedDx = drag.direction === 'next' ? -dx : dx;
    const baseOffset = drag.fromCornerPeel ? 0.045 : 0;
    const progress = Math.max(0.01, Math.min(0.995, baseOffset + signedDx / travelDist));

    const signedStep = drag.direction === 'next' ? -(e.clientX - drag.lastX) : (e.clientX - drag.lastX);
    drag.velocity = (signedStep / travelDist) / (dt / 1000);
    drag.lastX = e.clientX;
    drag.lastTime = now;

    flipProgressRef.current = progress;
    updateFlipFrame(progress, session.direction, drag.grabBias);
  };

  const finishDrag = useCallback((cancel = false) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;

    if (!drag.engaged || !flipSessionRef.current) return;
    drag.engaged = false;

    const session = flipSessionRef.current;
    const currentP = flipProgressRef.current;
    const movedDist = Math.abs(drag.lastX - drag.startX);
    // Quick click/tap on the corner peel OR dragging past threshold OR flick velocity completes the turn
    const isCornerTap = drag.fromCornerPeel && movedDist < 14 && drag.velocity >= -0.15;
    const shouldComplete =
      !cancel && (isCornerTap || currentP > 0.2 || (currentP > 0.06 && drag.velocity > 0.35));

    if (shouldComplete) {
      const remaining = 1 - currentP;
      const duration = Math.max(220, Math.min(540, remaining * 580));
      sounds.playPageFlip();
      internalCommitRef.current = session.toIndex;
      setActiveIssueIndex(session.toIndex);
      animateFlipTo(session, currentP, 1, duration, 'settle', drag.grabBias, () => {
        displayedIndexRef.current = session.toIndex;
        setDisplayedIndex(session.toIndex);
      });
    } else {
      const duration = Math.max(180, Math.min(340, currentP * 460));
      animateFlipTo(session, currentP, 0, duration, 'settle', drag.grabBias);
    }
  }, [animateFlipTo, setActiveIssueIndex]);

  const currentSpread = ISSUE_SPREADS[activeIssueIndex] || ISSUE_SPREADS[0];
  const settledSpread = ISSUE_SPREADS[displayedIndex] || ISSUE_SPREADS[0];
  const hasPrev = activeIssueIndex > 0;
  const hasNext = activeIssueIndex < ISSUE_SPREADS.length - 1;

  // Dynamic physical paper stack thickness reflecting how many pages are on left vs right
  const totalVols = ISSUE_SPREADS.length - 1;
  const visualIndex = flipSession ? flipSession.toIndex : displayedIndex;
  const leftStackPx = Math.max(2, Math.round((visualIndex / totalVols) * 11));
  const rightStackPx = Math.max(2, Math.round(((totalVols - visualIndex) / totalVols) * 11));
  const stackStyle = {
    '--left-stack': `${leftStackPx}px`,
    '--right-stack': `${rightStackPx}px`,
  } as CSSProperties;

  const fromSpread = flipSession ? (ISSUE_SPREADS[flipSession.fromIndex] || settledSpread) : null;
  const toSpread = flipSession ? (ISSUE_SPREADS[flipSession.toIndex] || currentSpread) : null;

  return (
    <div
      onTouchStart={event => {
        const touch = event.touches[0];
        touchOrigin.current = isVertical && !moving && event.touches.length === 1 &&
          !(event.target as HTMLElement).closest('button,a,input,textarea,select')
          ? { x: touch.clientX, y: touch.clientY } : null;
      }}
      onTouchCancel={() => { touchOrigin.current = null; }}
      onTouchEnd={event => {
        const start = touchOrigin.current;
        touchOrigin.current = null;
        if (!start) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy) * 2) {
          if (dx < 0) nextIssue();
          else prevIssue();
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setBookPointerTilt(0, 0);
      }}
      onPointerUp={() => finishDrag(false)}
      onPointerCancel={() => {
        setBookPointerTilt(0, 0);
        finishDrag(true);
      }}
      inert={moving}
      className={`comic-open-book w-full h-full overflow-hidden flex flex-col p-1 sm:p-2 bg-[#09080D] ${isVertical ? 'comic-reader-vertical' : 'select-none'}`}
    >
      {/* ===================================================================
          PHYSICAL OPEN COMIC BOOK SPREAD SHELL (With 3D Tilt & Paper Physics!)
          =================================================================== */}
      <div
        ref={shellRef}
        style={stackStyle}
        className="comic-book-physical-shell w-full max-w-[1560px] mx-auto h-full max-h-full flex-1 flex flex-col justify-between border-3 border-[#09080D] shadow-[6px_6px_0px_#09080D] bg-transparent relative"
      >
        {/* TOP PULP COMIC BOOK FOLIO MARGIN HEADER (Pinned in Vertical/Mobile Mode) */}
        {isVertical && (
          <BookFolioNav
            spread={currentSpread}
            onClose={onClose}
            onSelectIssue={setActiveIssueIndex}
            onPrev={prevIssue}
            onNext={nextIssue}
          />
        )}

        {/* CENTER BOOK SPINE FOLD CREASE & SADDLE-STITCH STAPLES (Desktop Open Spread) */}
        <div
          aria-hidden="true"
          data-terminal-page={!flipSession && currentSpread.index === 8}
          className="hidden lg:flex pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 z-20 flex-col items-center justify-between py-24"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(30,19,12,0.16) 24%, rgba(9,8,13,0.48) 46%, rgba(255,244,224,0.22) 50%, rgba(9,8,13,0.56) 54%, rgba(30,19,12,0.16) 76%, transparent 100%)',
          }}
        >
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#F3E7D3] via-[#9888B8] to-[#09080D] border border-[#09080D] rounded-full shadow-[0_0_6px_#09080D]" />
          <div className="w-[2px] flex-1 bg-[#09080D]/65 my-4" />
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#F3E7D3] via-[#9888B8] to-[#09080D] border border-[#09080D] rounded-full shadow-[0_0_6px_#09080D]" />
        </div>

        {/* LEFT PHYSICAL PAPER EDGE FLIP TAB (Turn to Previous Page) */}
        {!isVertical && hasPrev && (
          <button
            onClick={prevIssue}
            title="Flip to Previous Comic Page (Left Arrow)"
            className="pointer-events-auto hidden xl:flex fixed left-1.5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 py-4 px-1.5 bg-[#F3E7D3] hover:bg-[#F2C94C] text-[#09080D] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] transition cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-[#E62E25] group-hover:-translate-x-0.5 transition" />
            <span className="font-display text-[10px] tracking-widest [writing-mode:vertical-rl] rotate-180">
              Prev vol (0{activeIssueIndex - 1})
            </span>
          </button>
        )}

        {/* RIGHT PHYSICAL PAPER EDGE FLIP TAB (Turn to Next Page) */}
        {!isVertical && hasNext && (
          <button
            onClick={nextIssue}
            title="Flip to Next Comic Page (Right Arrow)"
            className="pointer-events-auto hidden xl:flex fixed right-1.5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 py-4 px-1.5 bg-[#E62E25] hover:bg-[#F2C94C] text-white hover:text-[#09080D] border-3 border-[#09080D] shadow-[-4px_4px_0px_#09080D] transition cursor-pointer group"
          >
            <ChevronRight className="w-4 h-4 text-[#F2C94C] group-hover:text-[#09080D] group-hover:translate-x-0.5 transition" />
            <span className="font-display text-[10px] tracking-widest [writing-mode:vertical-rl]">
              Next vol (0{activeIssueIndex + 1})
            </span>
          </button>
        )}

        {/* PHYSICAL BOOK PAGE VIEWPORT */}
        <main
          key={isVertical ? activeIssueIndex : "spread"}
          aria-label={currentSpread.title}
          className={[
            'comic-reader-content comic-paged',
            currentSpread.index === 0 ? 'comic-paged-cover' : '',
            isVertical ? `comic-paged-vertical comic-paged-portrait-${flipDirection}` : 'comic-paged-spread',
          ].join(' ')}
        >
          {/* Left & Right Stacked Paper-Block Thickness Edges (Desktop Spread) */}
          {!isVertical && (
            <>
              <div className="book-stack-edge book-stack-edge-left" aria-hidden="true" />
              <div className="book-stack-edge book-stack-edge-right" aria-hidden="true" />
            </>
          )}

          {/* Active Rest Spread OR Real-Time 3D Physical Turning-Leaf Stage */}
          {!isVertical && flipSession && fromSpread && toSpread ? (
            <div
              ref={stageRef}
              key={flipSession.id}
              className={`comic-flip-stage comic-flip-stage-${flipSession.direction}`}
            >
              {/* Static Left Under-Page */}
              <div className="comic-flip-under comic-flip-under-left">
                <SpreadHalf
                  spread={flipSession.direction === 'next' ? fromSpread : toSpread}
                  side="left"
                  onClose={onClose}
                  onSelectIssue={setActiveIssueIndex}
                  onPrev={prevIssue}
                  onNext={nextIssue}
                />
                <div
                  ref={leftShadowRef}
                  className={
                    flipSession.direction === 'next'
                      ? 'comic-flip-shadow comic-flip-shadow-land-left'
                      : 'comic-flip-shadow comic-flip-shadow-under-left'
                  }
                  aria-hidden="true"
                />
              </div>

              {/* Static Right Under-Page */}
              <div className="comic-flip-under comic-flip-under-right">
                <SpreadHalf
                  spread={flipSession.direction === 'next' ? toSpread : fromSpread}
                  side="right"
                  onClose={onClose}
                  onSelectIssue={setActiveIssueIndex}
                  onPrev={prevIssue}
                  onNext={nextIssue}
                />
                <div
                  ref={rightShadowRef}
                  className={
                    flipSession.direction === 'next'
                      ? 'comic-flip-shadow comic-flip-shadow-under-right'
                      : 'comic-flip-shadow comic-flip-shadow-land-right'
                  }
                  aria-hidden="true"
                />
              </div>

              {/* Physical Double-Sided 3D Turning Paper Leaf */}
              <div
                ref={leafRef}
                className={`comic-flip-leaf comic-flip-leaf-${flipSession.direction}`}
              >
                <div className="comic-flip-face comic-flip-face-front">
                  <SpreadHalf
                    spread={fromSpread}
                    side={flipSession.direction === 'next' ? 'right' : 'left'}
                    onClose={onClose}
                    onSelectIssue={setActiveIssueIndex}
                    onPrev={prevIssue}
                    onNext={nextIssue}
                  />
                  <div
                    ref={frontLightRef}
                    className="comic-flip-paper-light comic-flip-light-front"
                    aria-hidden="true"
                  />
                </div>

                <div className="comic-flip-face comic-flip-face-back">
                  <SpreadHalf
                    spread={toSpread}
                    side={flipSession.direction === 'next' ? 'left' : 'right'}
                    onClose={onClose}
                    onSelectIssue={setActiveIssueIndex}
                    onPrev={prevIssue}
                    onNext={nextIssue}
                  />
                  <div
                    ref={backLightRef}
                    className="comic-flip-paper-light comic-flip-light-back"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              key={isVertical ? `${currentSpread.code}-${flipCounter}-v` : settledSpread.code}
              className="comic-paged-sheet flex flex-col"
            >
              {!isVertical && (
                <BookFolioNav
                  spread={settledSpread}
                  onClose={onClose}
                  onSelectIssue={setActiveIssueIndex}
                  onPrev={prevIssue}
                  onNext={nextIssue}
                />
              )}
              <div className="flex-1 min-h-0 flex flex-col">
                <settledSpread.Component />
              </div>
              {isVertical && (
                <footer className="comic-mobile-episode-footer" aria-label="Chapter transition">
                  <button
                    type="button"
                    onClick={prevIssue}
                    disabled={!hasPrev}
                    className="comic-mobile-episode-btn"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                    <span>Prev Episode</span>
                  </button>
                  <span className="comic-mobile-episode-code">
                    VOL. {currentSpread.code} / 08
                  </span>
                  <button
                    type="button"
                    onClick={nextIssue}
                    disabled={!hasNext}
                    className="comic-mobile-episode-btn comic-mobile-episode-btn-next"
                  >
                    <span>
                      {hasNext
                        ? `Next: ${ISSUE_SPREADS[activeIssueIndex + 1].title.replace(/^\d+\s*·\s*/, '')}`
                        : 'End of Issue'}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </footer>
              )}
            </div>
          )}

          {/* Subtle Tactile Dog-Ear Corner Peel Triggers (Click OR Drag-Swipe to Peel Page!) */}
          {!isVertical && !flipSession && hasPrev && (
            <button
              type="button"
              data-corner-peel="prev"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  prevIssue();
                }
              }}
              aria-label="Turn to previous spread"
              title="Click or drag to peel page back"
              className="comic-corner-peel comic-corner-peel-left"
            />
          )}
          {!isVertical && !flipSession && hasNext && (
            <button
              type="button"
              data-corner-peel="next"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  nextIssue();
                }
              }}
              aria-label="Turn to next spread"
              title="Click or drag to peel page"
              className="comic-corner-peel comic-corner-peel-right"
            />
          )}
        </main>
      </div>
    </div>
  );
}
