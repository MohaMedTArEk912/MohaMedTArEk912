import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, RotateCw } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import '../../styles/page-flip.css';
import '../../styles/chronicles.css';
import { ComicBookCover, FrontCoverFace, BackCoverFace } from '../comic/ComicBookCover';
import { getBookPointerCoords, type FoldHandoffRect } from '../comic/useBookInspection';
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

/** Blocks the sideways comic with a clear rotate instruction on portrait phones. */
function RotateDevicePrompt() {
  const readerMode = useCommandStore(state => state.readerMode);
  const setReaderMode = useCommandStore(state => state.setReaderMode);

  if (readerMode === 'vertical') return null;

  return (
    <div className="comic-rotate-prompt" role="dialog" aria-modal="true" aria-label="Rotate your phone">
      <div className="comic-rotate-prompt-card">
        <RotateCw className="comic-rotate-prompt-icon" aria-hidden="true" />
        <p className="comic-rotate-prompt-title">Rotate your phone</p>
        <p className="comic-rotate-prompt-copy">
          Turn your device sideways to read the comic as a full two-page spread.
        </p>
        <button
          type="button"
          className="comic-rotate-prompt-action"
          onClick={() => setReaderMode('vertical')}
        >
          Read page by page instead
        </button>
      </div>
    </div>
  );
}

type FlipDirection = 'next' | 'prev';

interface FlipSession {
  id: number;
  fromIndex: number;
  toIndex: number;
  direction: FlipDirection;
  closeSide?: 'front' | 'back';
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

  // 2. Keep the sheet planar: skewing it in Y makes text and artwork distort instead of behaving like paper.
  // 3. 3D Corner-peel pitch (rotateX) & dihedral twist (rotateZ) that peak mid-arc and settle to 0
  const pitchX = -sign * sinP * (0.8 + grabBias * 0.65);
  const twistZ = sign * sinP * (0.35 + grabBias * 0.45);

  // 4. Perspective width compensation so the turning sheet never protrudes past the book border
  const scaleComp = 1 - sinP * 0.032;

  if (refs.leaf) {
    const liftZ = sinP * 10;
    refs.leaf.style.transform = `translateZ(${liftZ.toFixed(2)}px) rotateY(${angle.toFixed(2)}deg) rotateX(${pitchX.toFixed(2)}deg) rotateZ(${twistZ.toFixed(2)}deg) scale(${scaleComp.toFixed(4)})`;
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
  const underOpacity = sinP * (1 - p) * 0.42;
  const underScale = 0.35 + (1 - p) * 0.65;

  const landT = Math.max(0, (p - 0.25) / 0.75);
  const landOpacity = sinP * landT * 0.5;
  const landScale = 0.35 + landT * 0.65;

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
              aria-label={spread.index === 0 ? 'Close book to front cover' : 'Previous volume'}
              title={spread.index === 0 ? 'Close book (Left Arrow)' : 'Previous volume (Left Arrow)'}
              className="ink-button"
            >
              <ChevronLeft aria-hidden="true" />
              <span>{spread.index === 0 ? 'Close' : 'Prev'}</span>
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
              aria-label={spread.index === ISSUE_SPREADS.length - 1 ? 'Close book to back cover' : 'Next volume'}
              title={spread.index === ISSUE_SPREADS.length - 1 ? 'Close book (Right Arrow)' : 'Next volume (Right Arrow)'}
              className="ink-button issue-next"
            >
              <span>{spread.index === ISSUE_SPREADS.length - 1 ? 'Close' : 'Next'}</span>
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
type CloseSide = 'front' | 'back';
type CoverFacing = 'front' | 'back' | 'flipping';

export function ComicBookFlipReader() {
  const [state, setState] = useState<BookState>(() =>
    new URLSearchParams(location.search).has('volume') ? 'open' : 'closed',
  );
  const [closeSide, setCloseSide] = useState<CloseSide>('front');
  const [coverFacing, setCoverFacing] = useState<CoverFacing>('front');
  const [justFolded, setJustFolded] = useState<FoldHandoffRect | null>(null);
  const binding = useRef<HTMLDivElement>(null);
  const focusAfterTurn = useRef(false);
  const consumedOpenRequests = useRef(useCommandStore.getState().bookOpenRequestCount);
  const stateRef = useRef(state);
  stateRef.current = state;
  const moving = state === 'opening' || state === 'closing';
  const bookOpenRequestCount = useCommandStore((s) => s.bookOpenRequestCount);

  // The entry gate asks for the book to open when its reveal finishes, so one
  // tap takes the visitor straight into the comic (no second "open" step).
  useEffect(() => {
    if (bookOpenRequestCount <= consumedOpenRequests.current) return;
    consumedOpenRequests.current = bookOpenRequestCount;
    if (stateRef.current === 'closed') {
      turnBook(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookOpenRequestCount]);

  useEffect(() => {
    const portraitPhone = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const compactLandscape = window.matchMedia('(max-width: 1023px) and (orientation: landscape)');
    const applyPhoneLayout = () => {
      if (portraitPhone.matches && useCommandStore.getState().readerMode !== 'vertical') {
        useCommandStore.getState().setReaderMode('vertical');
      }
      if (compactLandscape.matches && useCommandStore.getState().readerMode === 'vertical') {
        useCommandStore.getState().setReaderMode('flip');
      }
    };
    applyPhoneLayout();
    portraitPhone.addEventListener('change', applyPhoneLayout);
    compactLandscape.addEventListener('change', applyPhoneLayout);
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
      portraitPhone.removeEventListener('change', applyPhoneLayout);
      compactLandscape.removeEventListener('change', applyPhoneLayout);
      unsubscribe();
      window.removeEventListener('popstate', restore);
    };
  }, []);

  function turnBook(open: boolean, side: CloseSide = 'front', handoffRect: FoldHandoffRect | null = null) {
    if (moving) return;
    const url = new URL(location.href);
    if (open) url.searchParams.set('volume', String(useCommandStore.getState().activeIssueIndex));
    else url.searchParams.delete('volume');
    history.pushState(null, '', url);
    focusAfterTurn.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) {
      setJustFolded(null);
      setCloseSide('front');
      setCoverFacing('front');
      setState(reduced ? 'open' : 'opening');
    } else if (handoffRect || side === 'back') {
      setCloseSide(side);
      setCoverFacing(side === 'back' && !reduced ? 'back' : 'front');
      setJustFolded(reduced ? null : handoffRect);
      setState('closed');
    } else {
      setJustFolded(null);
      setCloseSide('front');
      setCoverFacing('front');
      setState(reduced ? 'closed' : 'closing');
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
    <>
      <div
        ref={binding}
        className="comic-binding"
        data-book-state={state}
        data-close-side={closeSide}
        data-cover-facing={coverFacing}
      >
        {state !== 'closed' && (
          <OpenComicBook
            onClose={(side, handoffRect) => turnBook(false, side, handoffRect)}
            moving={moving}
          />
        )}
        {state !== 'open' && (
          <ComicBookCover
            moving={moving}
            coverFacing={coverFacing}
            justFolded={justFolded}
            onOpen={() => turnBook(true)}
            onConsumeFold={() => setJustFolded(null)}
            onFlipStart={() => setCoverFacing('flipping')}
            onFlipComplete={() => {
              useCommandStore.getState().setActiveIssueIndex(0);
              setCoverFacing('front');
              setCloseSide('front');
            }}
            onTurnEnd={() => {
              setState((current) => (current === 'closing' ? 'closed' : 'open'));
            }}
          />
        )}
      </div>
      <RotateDevicePrompt />
    </>
  );
}

function OpenComicBook({
  onClose,
  moving,
}: {
  onClose: (side?: CloseSide, handoffRect?: FoldHandoffRect | null) => void;
  moving: boolean;
}) {
  const {
    activeIssueIndex,
    flipDirection,
    flipCounter,
    setActiveIssueIndex,
    nextIssue,
    prevIssue,
    readerMode,
  } = useCommandStore();

  // Phone portrait layouts use vertical page-by-page reading; larger and landscape layouts use spreads.
  const isVertical = readerMode === 'vertical';

  // Physical 3D page-turn state
  const [displayedIndex, setDisplayedIndex] = useState(activeIssueIndex);
  const [flipSession, setFlipSession] = useState<FlipSession | null>(null);
  const [mobileScale, setMobileScale] = useState<number | null>(null);

  const openBookRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const leftShadowRef = useRef<HTMLDivElement>(null);
  const rightShadowRef = useRef<HTMLDivElement>(null);
  const frontLightRef = useRef<HTMLDivElement>(null);
  const backLightRef = useRef<HTMLDivElement>(null);
  const bookScaleRef = useRef(1);

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
    closeShiftPct: 0,
    closeScale: 1,
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
    const hoverDamp = flipSessionRef.current?.closeSide ? Math.max(0, 1 - flipProgressRef.current) : 1;
    const rx = t.currentX * hoverDamp + t.flipX;
    const ry = t.currentY * hoverDamp + t.flipY;
    const rz = t.flipZ;
    const tz = t.flipLift;
    const shiftPct = t.closeShiftPct;
    const sc = bookScaleRef.current * t.closeScale;
    const hasTilt =
      Math.abs(rx) >= 0.01 ||
      Math.abs(ry) >= 0.01 ||
      Math.abs(rz) >= 0.01 ||
      Math.abs(tz) >= 0.05 ||
      Math.abs(shiftPct) >= 0.02 ||
      Math.abs(t.closeScale - 1) >= 0.004;
    const isScaled = bookScaleRef.current < 0.995;
    if (isScaled) {
      const parent = shell.parentElement;
      const pw = parent ? parent.clientWidth : 841;
      const ph = parent ? parent.clientHeight : 387;
      shell.style.left = `${(pw / 2 - 660).toFixed(1)}px`;
      shell.style.top = `${(ph / 2 - 370).toFixed(1)}px`;
    } else {
      shell.style.left = '';
      shell.style.top = '';
    }
    if (!hasTilt && Math.abs(sc - 1) < 0.005) {
      shell.style.transform = '';
    } else if (!hasTilt) {
      shell.style.transform = `scale(${sc.toFixed(4)})`;
    } else {
      shell.style.transform = `scale(${sc.toFixed(4)}) translate3d(${shiftPct.toFixed(2)}%, 0, ${tz.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
    }
  }, []);

  // Automatically scale the horizontal 1320x740 two-page book to fit compact phone/tablet screens
  useLayoutEffect(() => {
    if (isVertical) {
      bookScaleRef.current = 1;
      setMobileScale(null);
      // Reset any inline positioning/transform from horizontal scaled mode
      const shell = shellRef.current;
      if (shell) {
        shell.style.left = '';
        shell.style.top = '';
        shell.style.transform = '';
      }
      return;
    }
    const container = openBookRef.current;
    if (!container) return;

    const updateScale = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1180 || h < 660) {
        const sc = Math.max(0.26, Math.min(1, (w - 20) / 1320, (h - 20) / 740));
        bookScaleRef.current = sc;
        setMobileScale(sc);
      } else {
        bookScaleRef.current = 1;
        setMobileScale(null);
      }
      syncShellTransform();
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(container);
    return () => ro.disconnect();
  }, [isVertical, syncShellTransform]);

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

  const updateFlipFrame = useCallback(
    (p: number, direction: FlipDirection, grabBias: number, closeSide?: CloseSide) => {
      const impulse = applyFlipPhysics(getPhysicsRefs(), p, direction, grabBias);
      bookTiltRef.current.flipX = impulse.bookTiltX;
      bookTiltRef.current.flipY = impulse.bookTiltY;
      bookTiltRef.current.flipZ = impulse.bookTiltZ;
      bookTiltRef.current.flipLift = impulse.bookLiftZ;
      if (closeSide) {
        const smoothP = p * p * (3 - 2 * p);
        const shellW = (shellRef.current?.offsetWidth || 1200) * bookScaleRef.current;
        const closedBookW = Math.min(window.innerWidth * 0.82, window.innerHeight * 0.64, 552);
        const targetCloseScale = Math.max(0.56, Math.min(0.96, closedBookW / Math.max(200, shellW * 0.5)));
        bookTiltRef.current.closeShiftPct = (closeSide === 'front' ? -25 : 25) * p;
        bookTiltRef.current.closeScale = 1 + (targetCloseScale - 1) * smoothP;
      } else {
        bookTiltRef.current.closeShiftPct = 0;
        bookTiltRef.current.closeScale = 1;
      }
      syncShellTransform();
    },
    [getPhysicsRefs, syncShellTransform],
  );

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
      updateFlipFrame(p, session.direction, grabBias, session.closeSide);

      if (t < 1) {
        flipRafRef.current = requestAnimationFrame(tick);
      } else {
        flipRafRef.current = null;
        if (endProgress === 1 && session.closeSide) {
          onDone?.();
          return;
        }
        bookTiltRef.current.flipX = 0;
        bookTiltRef.current.flipY = 0;
        bookTiltRef.current.flipZ = 0;
        bookTiltRef.current.flipLift = 0;
        bookTiltRef.current.closeShiftPct = 0;
        bookTiltRef.current.closeScale = 1;
        syncShellTransform();
        flipSessionRef.current = null;
        setFlipSession(null);
        onDone?.();
      }
    };

    // Apply frame 0 immediately on next layout frame so leafRef is mounted
    flipRafRef.current = requestAnimationFrame((firstNow) => {
      updateFlipFrame(startProgress, session.direction, grabBias, session.closeSide);
      tick(firstNow);
    });
  }, [stopFlipRaf, syncShellTransform, updateFlipFrame]);

  const captureFoldHandoff = useCallback((side: CloseSide): FoldHandoffRect | null => {
    const el = leafRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return null;
    return {
      side,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const triggerCloseFold = useCallback((side: CloseSide) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isVertical || reduced) {
      onClose(side, null);
      return;
    }
    if (flipSessionRef.current?.closeSide) return;
    try {
      sounds.playPageFlip();
    } catch {
      // Ignore audio errors
    }
    const fromIdx = side === 'front' ? 0 : ISSUE_SPREADS.length - 1;
    const toIdx = side === 'front' ? -1 : ISSUE_SPREADS.length;
    const direction: FlipDirection = side === 'front' ? 'prev' : 'next';
    const session: FlipSession = {
      id: ++flipIdRef.current,
      fromIndex: fromIdx,
      toIndex: toIdx,
      direction,
      closeSide: side,
    };
    flipSessionRef.current = session;
    flipProgressRef.current = 0;
    setFlipSession(session);
    animateFlipTo(session, 0, 1, 680, 'paper', 0, () => {
      onClose(side, captureFoldHandoff(side));
    });
  }, [animateFlipTo, captureFoldHandoff, isVertical, onClose]);

  const goNext = useCallback(() => {
    if (useCommandStore.getState().activeIssueIndex >= ISSUE_SPREADS.length - 1) {
      triggerCloseFold('back');
    } else {
      nextIssue();
    }
  }, [nextIssue, triggerCloseFold]);

  const goPrev = useCallback(() => {
    if (useCommandStore.getState().activeIssueIndex <= 0) {
      triggerCloseFold('front');
    } else {
      prevIssue();
    }
  }, [prevIssue, triggerCloseFold]);

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
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isVertical) return;
      if (Math.abs(e.deltaX) > 42 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) {
        const now = Date.now();
        if (now - wheelCooldownRef.current < 750) return;
        wheelCooldownRef.current = now;
        if (e.deltaX > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [goNext, goPrev, isVertical, moving]);

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
        if (dir === 'next') goNext();
        else goPrev();
      }
      return;
    }

    const coords = getBookPointerCoords(e);
    const stageH = e.currentTarget.clientHeight;
    const relY = stageH > 0 ? (coords.y / stageH) * 2 - 1 : 0;
    const grabBias = peelBtn ? 0.85 : Math.max(-1, Math.min(1, relY));
    const peelDir = (peelBtn?.dataset.cornerPeel as FlipDirection | undefined) || 'next';

    dragRef.current = {
      active: true,
      engaged: false,
      fromCornerPeel: Boolean(peelBtn),
      pointerId: e.pointerId,
      startX: coords.x,
      startY: coords.y,
      lastX: coords.x,
      lastTime: performance.now(),
      velocity: 0,
      direction: peelDir,
      grabBias,
    };

    // If user grabbed the physical dog-ear corner peel, immediately lift the 3D page or cover leaf!
    if (peelBtn) {
      const curIdx = displayedIndexRef.current;
      const targetIdx = peelDir === 'next' ? curIdx + 1 : curIdx - 1;
      const closeSide: CloseSide | undefined =
        targetIdx < 0 ? 'front' : targetIdx >= ISSUE_SPREADS.length ? 'back' : undefined;
      stopFlipRaf();
      dragRef.current.engaged = true;
      const session: FlipSession = {
        id: ++flipIdRef.current,
        fromIndex: curIdx,
        toIndex: targetIdx,
        direction: peelDir,
        closeSide,
      };
      flipSessionRef.current = session;
      flipProgressRef.current = 0.045;
      setFlipSession(session);
      e.currentTarget.setPointerCapture?.(e.pointerId);
      requestAnimationFrame(() => {
        if (flipSessionRef.current?.id === session.id) {
          updateFlipFrame(flipProgressRef.current, session.direction, grabBias, session.closeSide);
        }
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const coords = getBookPointerCoords(e);

    // Subtle 3D interactive parallax tilt on the open book as pointer moves across it
    if (!isVertical && !moving && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const stageW = e.currentTarget.clientWidth;
      const stageH = e.currentTarget.clientHeight;
      if (stageW > 0 && stageH > 0) {
        const nx = (coords.x / stageW) * 2 - 1;
        const ny = (coords.y / stageH) * 2 - 1;
        setBookPointerTilt(-ny * 1.45, nx * 2.1);
      }
    }

    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;

    const dx = coords.x - drag.startX;
    const dy = coords.y - drag.startY;
    const now = performance.now();
    const dt = Math.max(8, now - drag.lastTime);

    if (!drag.engaged) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.1) return;

      const curIdx = displayedIndexRef.current;
      const wantDir: FlipDirection = dx < 0 ? 'next' : 'prev';
      const targetIdx = wantDir === 'next' ? curIdx + 1 : curIdx - 1;
      const closeSide: CloseSide | undefined =
        targetIdx < 0 ? 'front' : targetIdx >= ISSUE_SPREADS.length ? 'back' : undefined;

      stopFlipRaf();
      drag.engaged = true;
      drag.direction = wantDir;

      const session: FlipSession = {
        id: ++flipIdRef.current,
        fromIndex: curIdx,
        toIndex: targetIdx,
        direction: wantDir,
        closeSide,
      };
      flipSessionRef.current = session;
      setFlipSession(session);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }

    const session = flipSessionRef.current;
    if (!session) return;

    const rawStageWidth = stageRef.current?.offsetWidth || 1200;
    const effectiveStageWidth = rawStageWidth;
    const travelDist = Math.max(180, effectiveStageWidth * 0.52);
    const signedDx = drag.direction === 'next' ? -dx : dx;
    const baseOffset = drag.fromCornerPeel ? 0.045 : 0;
    const progress = Math.max(0.01, Math.min(0.995, baseOffset + signedDx / travelDist));

    const signedStep = drag.direction === 'next' ? -(coords.x - drag.lastX) : (coords.x - drag.lastX);
    drag.velocity = (signedStep / travelDist) / (dt / 1000);
    drag.lastX = coords.x;
    drag.lastTime = now;
    flipProgressRef.current = progress;

    updateFlipFrame(progress, session.direction, drag.grabBias, session.closeSide);
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
    const isCornerTap = drag.fromCornerPeel && movedDist < 14 && drag.velocity >= -0.15;
    const shouldComplete =
      !cancel && (isCornerTap || currentP > 0.2 || (currentP > 0.06 && drag.velocity > 0.35));

    if (shouldComplete) {
      const remaining = 1 - currentP;
      const duration = Math.max(220, Math.min(540, remaining * 580));
      try {
        sounds.playPageFlip();
      } catch {
        // Ignore audio errors
      }
      if (session.closeSide) {
        const side = session.closeSide;
        animateFlipTo(session, currentP, 1, duration, 'settle', drag.grabBias, () => {
          onClose(side, captureFoldHandoff(side));
        });
        return;
      }
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
  }, [animateFlipTo, captureFoldHandoff, onClose, setActiveIssueIndex]);

  const currentSpread = ISSUE_SPREADS[activeIssueIndex] || ISSUE_SPREADS[0];
  const settledSpread = ISSUE_SPREADS[displayedIndex] || ISSUE_SPREADS[0];
  const hasPrev = activeIssueIndex > 0;
  const hasNext = activeIssueIndex < ISSUE_SPREADS.length - 1;

  // Dynamic physical paper stack thickness reflecting how many pages are on left vs right
  const totalVols = ISSUE_SPREADS.length - 1;
  const visualIndex = Math.max(0, Math.min(totalVols, flipSession ? flipSession.toIndex : displayedIndex));
  const leftStackPx = Math.max(2, Math.round((visualIndex / totalVols) * 11));
  const rightStackPx = Math.max(2, Math.round(((totalVols - visualIndex) / totalVols) * 11));
  const stackStyle = {
    '--left-stack': `${leftStackPx}px`,
    '--right-stack': `${rightStackPx}px`,
  } as CSSProperties;

  const fromSpread = flipSession ? (ISSUE_SPREADS[flipSession.fromIndex] || settledSpread) : null;
  const toSpread =
    flipSession && !flipSession.closeSide ? (ISSUE_SPREADS[flipSession.toIndex] || currentSpread) : null;

  return (
    <div
      ref={openBookRef}
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
          if (dx < 0) goNext();
          else goPrev();
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
        data-scaled-book={mobileScale !== null ? 'true' : undefined}
        data-closing-fold={flipSession?.closeSide}
        style={stackStyle}
        className="comic-book-physical-shell w-full max-w-[1560px] mx-auto h-full max-h-full flex-1 flex flex-col justify-between border-3 border-[#09080D] shadow-[6px_6px_0px_#09080D] bg-transparent relative"
      >
        {/* TOP PULP COMIC BOOK FOLIO MARGIN HEADER (Pinned in Vertical/Mobile Mode) */}
        {isVertical && (
          <BookFolioNav
            spread={currentSpread}
            onClose={() => onClose('front')}
            onSelectIssue={setActiveIssueIndex}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}

        {/* CENTER BOOK SPINE FOLD CREASE & SADDLE-STITCH STAPLES (Desktop & Mobile Horizontal Spread) */}
        <div
          aria-hidden="true"
          data-terminal-page={!flipSession && currentSpread.index === 8}
          className={`${isVertical ? 'hidden' : 'flex'} comic-center-spine pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 z-20 flex-col items-center justify-between py-24`}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(30,19,12,0.16) 24%, rgba(9,8,13,0.48) 46%, rgba(255,244,224,0.22) 50%, rgba(9,8,13,0.56) 54%, rgba(30,19,12,0.16) 76%, transparent 100%)',
          }}
        >
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#F3E7D3] via-[#9888B8] to-[#09080D] border border-[#09080D] rounded-full shadow-[0_0_6px_#09080D]" />
          <div className="w-[2px] flex-1 bg-[#09080D]/65 my-4" />
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#F3E7D3] via-[#9888B8] to-[#09080D] border border-[#09080D] rounded-full shadow-[0_0_6px_#09080D]" />
        </div>

        {/* LEFT PHYSICAL PAPER EDGE FLIP TAB (Turn to Previous Page or Close at Vol 00) */}
        {!isVertical && (
          <button
            onClick={goPrev}
            title={hasPrev ? 'Flip to Previous Comic Page (Left Arrow)' : 'Close Book (Left Arrow)'}
            className="pointer-events-auto hidden xl:flex fixed left-1.5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 py-4 px-1.5 bg-[#F3E7D3] hover:bg-[#F2C94C] text-[#09080D] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] transition cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-[#E62E25] group-hover:-translate-x-0.5 transition" />
            <span className="font-display text-[10px] tracking-widest [writing-mode:vertical-rl] rotate-180">
              {hasPrev ? `Prev vol (0${activeIssueIndex - 1})` : 'Close book'}
            </span>
          </button>
        )}

        {/* RIGHT PHYSICAL PAPER EDGE FLIP TAB (Turn to Next Page or Close at Vol 08) */}
        {!isVertical && (
          <button
            onClick={goNext}
            title={hasNext ? 'Flip to Next Comic Page (Right Arrow)' : 'Close Book (Right Arrow)'}
            className="pointer-events-auto hidden xl:flex fixed right-1.5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 py-4 px-1.5 bg-[#E62E25] hover:bg-[#F2C94C] text-white hover:text-[#09080D] border-3 border-[#09080D] shadow-[-4px_4px_0px_#09080D] transition cursor-pointer group"
          >
            <ChevronRight className="w-4 h-4 text-[#F2C94C] group-hover:text-[#09080D] group-hover:translate-x-0.5 transition" />
            <span className="font-display text-[10px] tracking-widest [writing-mode:vertical-rl]">
              {hasNext ? `Next vol (0${activeIssueIndex + 1})` : 'Close book'}
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
          {!isVertical && flipSession && fromSpread && (toSpread || flipSession.closeSide) ? (
            <div
              ref={stageRef}
              key={flipSession.id}
              data-closing-fold={flipSession.closeSide}
              className={`comic-flip-stage comic-flip-stage-${flipSession.direction}`}
            >
              {/* Static Left Under-Page (Empty desk when lifting the Front Cover on Vol 00!) */}
              <div
                className={`comic-flip-under comic-flip-under-left ${
                  flipSession.closeSide === 'front' ? 'comic-flip-under-empty' : ''
                }`}
              >
                {flipSession.closeSide !== 'front' && (
                  <>
                    <SpreadHalf
                      spread={flipSession.direction === 'next' ? fromSpread : toSpread!}
                      side="left"
                      onClose={() => onClose('front')}
                      onSelectIssue={setActiveIssueIndex}
                      onPrev={goPrev}
                      onNext={goNext}
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
                  </>
                )}
              </div>

              {/* Static Right Under-Page (Empty desk when lifting the Back Cover on Vol 08!) */}
              <div
                className={`comic-flip-under comic-flip-under-right ${
                  flipSession.closeSide === 'back' ? 'comic-flip-under-empty' : ''
                }`}
              >
                {flipSession.closeSide !== 'back' && (
                  <>
                    <SpreadHalf
                      spread={flipSession.direction === 'next' ? toSpread! : fromSpread}
                      side="right"
                      onClose={() => onClose('front')}
                      onSelectIssue={setActiveIssueIndex}
                      onPrev={goPrev}
                      onNext={goNext}
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
                  </>
                )}
              </div>

              {/* Physical Double-Sided 3D Turning Paper / Hardcover Leaf */}
              <div
                ref={leafRef}
                data-cover-leaf={Boolean(flipSession.closeSide) || undefined}
                className={`comic-flip-leaf comic-flip-leaf-${flipSession.direction}`}
              >
                <div className="comic-flip-face comic-flip-face-front">
                  <SpreadHalf
                    spread={fromSpread}
                    side={flipSession.direction === 'next' ? 'right' : 'left'}
                    onClose={() => onClose('front')}
                    onSelectIssue={setActiveIssueIndex}
                    onPrev={goPrev}
                    onNext={goNext}
                  />
                  <div
                    ref={frontLightRef}
                    className="comic-flip-paper-light comic-flip-light-front"
                    aria-hidden="true"
                  />
                </div>

                <div className="comic-flip-face comic-flip-face-back">
                  {flipSession.closeSide === 'front' ? (
                    <div className="cover-leaf-container">
                      <FrontCoverFace />
                    </div>
                  ) : flipSession.closeSide === 'back' ? (
                    <div className="cover-leaf-container">
                      <BackCoverFace />
                    </div>
                  ) : (
                    <SpreadHalf
                      spread={toSpread!}
                      side={flipSession.direction === 'next' ? 'left' : 'right'}
                      onClose={() => onClose('front')}
                      onSelectIssue={setActiveIssueIndex}
                      onPrev={goPrev}
                      onNext={goNext}
                    />
                  )}
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
                  onClose={() => onClose('front')}
                  onSelectIssue={setActiveIssueIndex}
                  onPrev={goPrev}
                  onNext={goNext}
                />
              )}
              <div className="flex-1 min-h-0 flex flex-col">
                <settledSpread.Component />
              </div>
            </div>
          )}

          {/* Subtle Tactile Dog-Ear Corner Peel Triggers (Click OR Drag-Swipe to Peel Page or Close!) */}
          {!isVertical && !flipSession && (
            <button
              type="button"
              data-corner-peel="prev"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goPrev();
                }
              }}
              aria-label={hasPrev ? 'Turn to previous spread' : 'Close book to front cover'}
              title={hasPrev ? 'Click or drag to peel page back' : 'Click or drag to close book'}
              className="comic-corner-peel comic-corner-peel-left"
            />
          )}
          {!isVertical && !flipSession && (
            <button
              type="button"
              data-corner-peel="next"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goNext();
                }
              }}
              aria-label={hasNext ? 'Turn to next spread' : 'Close book to back cover'}
              title={hasNext ? 'Click or drag to peel page' : 'Click or drag to close book'}
              className="comic-corner-peel comic-corner-peel-right"
            />
          )}
        </main>
      </div>
    </div>
  );
}
