import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, RotateCw } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import '../../styles/entry-gate.css';

type GatePhase = 'ready' | 'opening' | 'done';

/** Matches the .phase-opening exit animation in entry-gate.css. */
const OPENING_MS = 900;

/**
 * Dramatic entry gate for the comic edition. Replaces the old fixed-timeout
 * boot splash: the page splash covers loading once, then the gate holds a
 * readable prologue until the visitor chooses to open the archive.
 * Skipped entirely for deep links (?volume / ?view) so shared chapters land
 * directly on their content.
 */
export function ComicEntryGate() {
  const setReaderMode = useCommandStore((state) => state.setReaderMode);
  const [phase, setPhase] = useState<GatePhase>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('volume') || params.has('view') ? 'done' : 'ready';
  });
  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  const phaseRef = useRef<GatePhase>(phase);
  const openingTimer = useRef<number | null>(null);
  const bookOpenTimer = useRef<number | null>(null);

  useEffect(() => {
    // One loading moment only: main.tsx waits for the display font during the
    // single index.html boot splash. Here we just warm the cover art and track
    // portrait phone layout, with zero duplicate loader.
    const portraitQuery = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const syncPortrait = () => setIsPortraitPhone(portraitQuery.matches);
    syncPortrait();
    portraitQuery.addEventListener('change', syncPortrait);
    const cover = new Image();
    cover.src = `${import.meta.env.BASE_URL}comic/architect-cover.webp`;
    return () => {
      portraitQuery.removeEventListener('change', syncPortrait);
    };
  }, []);

  useEffect(() => () => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
    if (bookOpenTimer.current !== null) window.clearTimeout(bookOpenTimer.current);
  }, []);

  const open = useCallback(
    (pageByPage: boolean) => {
      if (phaseRef.current !== 'ready') return;
      phaseRef.current = 'opening';
      setPhase('opening');
      if (pageByPage) setReaderMode('vertical');
      try {
        sounds.playWarp();
      } catch {
        // Audio is a garnish; never block entry on it.
      }
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Open the book a beat before the gate wipes away, so the visitor lands
      // on the comic already opening - one tap, no second "open" step.
      bookOpenTimer.current = window.setTimeout(
        () => useCommandStore.getState().requestBookOpen(),
        reduceMotion ? 0 : Math.max(OPENING_MS - 420, 0),
      );
      openingTimer.current = window.setTimeout(() => {
        phaseRef.current = 'done';
        setPhase('done');
      }, reduceMotion ? 220 : OPENING_MS);
    },
    [setReaderMode],
  );

  if (phase === 'done') return null;

  return (
    <div
      className={`comic-entry-gate phase-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="The Architect Chronicles — opening cover"
    >
      <div className="entry-spotlight" aria-hidden="true" />
      <div className="entry-flash" aria-hidden="true" />
      <div className="entry-grain" aria-hidden="true" />
      <div className="entry-inner">
        <span className="entry-kicker">Mohamed Tarek Hussien presents</span>
        <span className="entry-emblem" aria-hidden="true">
          <span className="entry-emblem-crest">01</span>
        </span>
        <h1 className="entry-title">The Architect Chronicles</h1>
        <span className="entry-rule" aria-hidden="true" />
        <span className="entry-issue">Issue #01 · Eight hand-inked chapters · Cairo, Egypt</span>

        <div className="entry-prologue-block">
          <p className="entry-prologue">
            Every blueprint in these pages began with a curious kid in Cairo who
            couldn&apos;t stop imagining how things could work better—and wanted
            to turn that imagination into something genuinely helpful for the
            people around him. Inside are eight hand-inked chapters of that
            journey: the late nights, the breakthroughs, and the craft of turning
            wonder into things that matter. Take a breath. Turn the pages at your
            own pace.
          </p>
            {isPortraitPhone ? (
              <div className="entry-actions">
                <button type="button" className="entry-open" onClick={() => open(true)} autoFocus>
                  <BookOpen size={18} aria-hidden="true" /> Begin reading
                </button>
                <button
                  type="button"
                  className="entry-open-secondary"
                  onClick={() => open(false)}
                >
                  <RotateCw size={15} aria-hidden="true" /> Rotate me for the two-page spread
                </button>
              </div>
            ) : (
              <div className="entry-actions">
                <button type="button" className="entry-open" onClick={() => open(false)} autoFocus>
                  <BookOpen size={18} aria-hidden="true" /> Open the archive
                </button>
              </div>
            )}
          </div>
      </div>
      <a className="entry-return" href={import.meta.env.BASE_URL}>
        ← Return to landing
      </a>
    </div>
  );
}
