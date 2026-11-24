import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, RotateCw } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import '../../styles/entry-gate.css';

type GatePhase = 'ready' | 'opening' | 'done';

/** Matches the .phase-opening exit animation in entry-gate.css. */
const OPENING_MS = 1150;

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
  const openingTimer = useRef<number | null>(null);
  const bookOpenTimer = useRef<number | null>(null);

  useEffect(() => {
    // One loading moment only: the page splash covers the download. Here we just
    // warm the cover art and track the phone layout, with no second loader.
    const portraitQuery = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const syncPortrait = () => setIsPortraitPhone(portraitQuery.matches);
    syncPortrait();
    portraitQuery.addEventListener('change', syncPortrait);
    const cover = new Image();
    cover.src = `${import.meta.env.BASE_URL}comic/architect-cover.webp`;
    return () => portraitQuery.removeEventListener('change', syncPortrait);
  }, []);

  useEffect(() => () => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
    if (bookOpenTimer.current !== null) window.clearTimeout(bookOpenTimer.current);
  }, []);

  const open = useCallback(
    (pageByPage: boolean) => {
      setPhase((current) => {
        if (current !== 'ready') return current;
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
          reduceMotion ? 0 : Math.max(OPENING_MS - 450, 0),
        );
        openingTimer.current = window.setTimeout(
          () => setPhase('done'),
          reduceMotion ? 250 : OPENING_MS,
        );
        return 'opening';
      });
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
      <div className="entry-flash" aria-hidden="true" />
      <div className="entry-grain" aria-hidden="true" />
      <div className="entry-inner">
        <span className="entry-kicker">Mohamed Tarek Hussien presents</span>
        <span className="entry-emblem" aria-hidden="true" />
        <h1 className="entry-title">The Architect Chronicles</h1>
        <span className="entry-rule" aria-hidden="true" />
        <span className="entry-issue">Issue #01 · Eight hand-inked chapters · Cairo, Egypt</span>

          <div className="entry-prologue-block">
            <p className="entry-prologue">
              Eight hand-inked chapters wait inside: engineering foundations, cloud
              delivery that placed nationwide, the Akasha platform, an ICU system
              watching real-time vitals, multiplayer quizzes, and the classroom where
              the builder became a teacher. Take a breath. Read it at your own pace.
              The cover opens when you are ready.
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
