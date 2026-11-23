import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, RotateCw } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import '../../styles/entry-gate.css';

type GatePhase = 'loading' | 'ready' | 'opening' | 'done';

/** Let the reveal breathe even on fast connections. */
const MIN_LOADING_MS = 2400;
/** Never trap a visitor on the loading screen. */
const MAX_LOADING_MS = 9000;
/** Matches the .phase-opening exit animation in entry-gate.css. */
const OPENING_MS = 1150;

function statusForProgress(progress: number): string {
  if (progress < 35) return 'Gathering ink from the Cairo dusk…';
  if (progress < 70) return 'Binding eight chapters…';
  if (progress < 100) return 'Pressing the cover…';
  return 'The archive is ready.';
}

/**
 * Dramatic entry gate for the comic edition. Replaces the old fixed-timeout
 * boot splash with a real loading sequence (fonts + cover art), then holds a
 * readable prologue until the visitor chooses to open the archive.
 * Skipped entirely for deep links (?volume / ?view) so shared chapters land
 * directly on their content.
 */
export function ComicEntryGate() {
  const setReaderMode = useCommandStore((state) => state.setReaderMode);
  const [phase, setPhase] = useState<GatePhase>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('volume') || params.has('view') ? 'done' : 'loading';
  });
  const [progress, setProgress] = useState(6);
  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  const openingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'loading') return;
    let settled = false;
    const started = performance.now();

    const portraitQuery = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const syncPortrait = () => setIsPortraitPhone(portraitQuery.matches);
    syncPortrait();
    portraitQuery.addEventListener('change', syncPortrait);

    // Real readiness: the cover art and the display fonts behind the first screen.
    const coverReady = new Promise<void>((resolve) => {
      const cover = new Image();
      cover.onload = () => resolve();
      cover.onerror = () => resolve();
      cover.src = `${import.meta.env.BASE_URL}comic/architect-cover.webp`;
    });
    const fontsReady: Promise<unknown> =
      'fonts' in document ? document.fonts.ready : Promise.resolve();

    // Creeping bar that never quite finishes until the assets really do.
    const creep = window.setInterval(() => {
      setProgress((value) => Math.min(value + 2 + Math.random() * 6, 88));
    }, 240);

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(creep);
      window.clearTimeout(cap);
      setProgress(100);
      setPhase('ready');
    };

    const cap = window.setTimeout(finish, MAX_LOADING_MS);
    void Promise.all([coverReady, fontsReady]).then(() => {
      const remaining = MIN_LOADING_MS - (performance.now() - started);
      window.setTimeout(finish, Math.max(remaining, 0));
    });

    return () => {
      settled = true;
      window.clearInterval(creep);
      window.clearTimeout(cap);
      portraitQuery.removeEventListener('change', syncPortrait);
    };
  }, [phase]);

  useEffect(() => () => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
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

        {phase === 'loading' ? (
          <div className="entry-loading" role="status" aria-live="polite">
            <div className="entry-progress">
              <i style={{ width: `${Math.round(progress)}%` }} />
            </div>
            <span className="entry-status">{statusForProgress(progress)}</span>
          </div>
        ) : (
          <div className="entry-prologue-block">
            <p className="entry-prologue">
              Long before the blueprints and the late-night lights of Cairo, there was a
              restless boy staring out at the city skyline, wondering how invisible ideas
              come alive. These eight chapters are his answer, drawn in ink and panel:
              engineering foundations, cloud delivery that placed nationwide, the Akasha
              platform, an ICU system watching real-time vitals, multiplayer quizzes, and
              the classroom where the builder became a teacher. Take a breath. Read it at
              your own pace.
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
        )}
      </div>
      <a className="entry-return" href={import.meta.env.BASE_URL}>
        ← Return to landing
      </a>
    </div>
  );
}
