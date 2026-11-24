import { useLayoutEffect, useRef, type RefObject } from 'react';
import { ArrowRight } from 'lucide-react';
import { COMIC_VOLUMES } from '../../data/comicVolumes';
import { useBookInspection, type FoldHandoffRect } from './useBookInspection';
import '../../styles/book-cover.css';

interface CoverProps {
  moving: boolean;
  coverFacing?: 'front' | 'back' | 'flipping';
  justFolded?: FoldHandoffRect | null;
  onOpen: () => void;
  onTurnEnd: () => void;
  onConsumeFold: () => void;
  onFlipStart: () => void;
  onFlipComplete: () => void;
}

function PrintedPanel({ title, art, caption }: { title: string; art: string; caption: string }) {
  const file = art === 'architect-cover' ? 'cairo-drafting-table.jpg' : `volumes/${art}.jpg`;
  return (
    <>
      <h2>{title}</h2>
      <img
        src={`${import.meta.env.BASE_URL}comic/${file}`}
        alt=""
        decoding="async"
        draggable={false}
      />
      <p>{caption}</p>
    </>
  );
}

/** Shared 3D Back Cover artwork & 8-chapter index (used on both the 3D book & physical closing leaf). */
export function BackCoverFace() {
  return (
    <div className="book-back">
      <div className="book-back-header">
        <span className="book-back-badge">ORIGIN SYNOPSIS &amp; ISSUE INDEX // #01</span>
        <span className="book-back-imprint">The Architect Chronicles</span>
      </div>

      {/* Panel 1: About Me — The Story of a Boy from Cairo (Pure Story Hook, No Tech Jargon) */}
      <div className="book-back-story-card">
        <div className="book-back-story-kicker">
          <span>ORIGIN STORY // THE BOY FROM CAIRO</span>
          <b>CAIRO, EGYPT</b>
        </div>
        <strong>The Boy Who Dreamed of Building Worlds</strong>
        <p>
          Long before the blueprints and the late-night lights of Cairo, there was a restless boy staring out at the city skyline, wondering how invisible ideas come alive. Every obstacle became a puzzle to unlock; every setback, a lesson in grit. What began as quiet curiosity in a small room grew into a quest to build, to lead, and to lift others along the way. Turn the cover—and step inside the chapters that shaped him.
        </p>
      </div>

      {/* Panel 2: Issue Index / Table of Contents */}
      <div className="book-back-index-card">
        <div className="book-back-index-header">
          <span>ISSUE INDEX // TABLE OF CONTENTS</span>
          <b>08 CHAPTERS</b>
        </div>
        <ol className="book-back-index-grid">
          {COMIC_VOLUMES.map((volume, idx) => (
            <li key={volume.number}>
              <span className="book-back-vol-num">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="book-back-vol-copy">
                <div className="book-back-vol-title-row">
                  <b>{volume.title}</b>
                  <em>P.{String(idx * 2 + 1).padStart(2, '0')}</em>
                </div>
                <small>{volume.subject}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <span className="book-back-credit">
        MOHAMED TAREK HUSSIEN · FULL-STACK &amp; CLOUD DEVOPS · 2026
      </span>
    </div>
  );
}

/** Shared 3D Front Cover artwork (used on both the 3D book & physical closing leaf). */
export function FrontCoverFace({ sheenRef }: { sheenRef?: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="comic-closed-book">
      {sheenRef && <div ref={sheenRef} className="book-toss-sheen" aria-hidden="true" />}
      <div className="closed-book-top-bar">
        <span className="closed-book-stamp">
          <b>ISSUE #01</b>
          <small>CAIRO · 2026</small>
        </span>
        <span className="closed-book-edition">
          <b>MARVELS OF ENGINEERING</b> Illustrated Engineering Portfolio
        </span>
      </div>

      <div className="closed-book-masthead-wrap">
        <span className="closed-book-title">
          The Architect<strong>Chronicles</strong>
        </span>
        <span className="closed-book-subtitle-ribbon">
          Illustrated Engineering Portfolio
        </span>
      </div>

      <div className="closed-book-art-stage">
        <span className="closed-book-art">
          <img
            src={`${import.meta.env.BASE_URL}comic/cairo-drafting-table.jpg`}
            alt=""
            width="1536"
            height="1024"
            fetchPriority="high"
            draggable={false}
          />
        </span>
      </div>

      <div className="closed-book-bottom-bar">
        <span className="closed-book-byline">
          <small>WRITTEN &amp; ENGINEERED BY</small>
          <b>Mohamed Tarek Hussien</b>
        </span>
        <span className="closed-book-action">
          OPEN THE BOOK <ArrowRight size={16} />
        </span>
      </div>
    </div>
  );
}

export function ComicBookCover({
  moving,
  coverFacing = 'front',
  justFolded = null,
  onOpen,
  onTurnEnd,
  onConsumeFold,
  onFlipStart,
  onFlipComplete,
}: CoverProps) {
  const { gimbal, camera, shadow, sheen, grip } = useBookInspection({
    coverFacing,
    justFolded,
    onOpen,
    onConsumeFold,
    onFlipStart,
    onFlipComplete,
  });
  const gate = useRef<HTMLDivElement>(null);
  const footprint = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = gate.current!;
    const book = footprint.current!;
    function frameBook() {
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      const portrait = sh > sw;
      // Match .comic-book-physical-shell's exact layout dimensions inside .comic-open-book
      const padX = 2 * Math.min(76.8, Math.max(32, sw * 0.044));
      const padY = Math.min(64, Math.max(33.6, sh * 0.054)) + Math.min(67.2, Math.max(36.8, sh * 0.058));
      const shellW = portrait ? sw : Math.min(sw - padX, sh * 1.62, 1560);
      const shellH = portrait ? sh : Math.min(sh - padY, sw * 0.55, sh * 0.87);
      const panelWidth = portrait ? shellW : shellW / 2;
      stage.style.setProperty('--camera-x', portrait ? '0px' : `${(shellW / 4).toFixed(1)}px`);
      stage.style.setProperty('--camera-sx', String(panelWidth / book.offsetWidth));
      stage.style.setProperty('--camera-sy', String(shellH / book.offsetHeight));
    }
    frameBook();
    const observer = new ResizeObserver(frameBook);
    observer.observe(stage);
    observer.observe(book);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="comic-cover-gate"
      ref={gate}
      onAnimationEnd={(event) => {
        if (
          moving &&
          event.target === event.currentTarget &&
          event.animationName === 'book-exposure'
        ) {
          onTurnEnd();
        }
      }}
    >
      <a className="cover-return" href={import.meta.env.BASE_URL}>
        ← Return to landing
      </a>
      <div className="book-footprint" ref={footprint}>
        <div ref={shadow} className="book-cast-shadow-el" aria-hidden="true" />
        <div className="book-gimbal" ref={gimbal} aria-hidden="true">
          <div className="book-camera" ref={camera}>
            <BackCoverFace />

            <div className="book-spine">
              <span>THE ARCHITECT CHRONICLES · ISSUE #01</span>
            </div>
            <div className="book-top-edge" />
            <div className="book-fore-edge" />
            <div className="book-bottom-edge" />

            <div className="book-page-block">
              <div className="book-printed-contents book-print">
                <h2>Contents</h2>
                <ol>
                  {COMIC_VOLUMES.map((volume) => (
                    <li key={volume.number}>
                      <span>{volume.number}</span>
                      <b>{volume.title}</b>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="book-flyleaf book-flyleaf-last">
              <div className="book-print book-print-front book-print-infrastructure">
                <PrintedPanel
                  title="Cloud & Delivery"
                  art="devops"
                  caption="Infrastructure · Automation · Observability"
                />
              </div>
              <div className="book-print book-print-reverse book-print-blueprint">
                <PrintedPanel
                  title="Project notebook"
                  art="akasha-blueprint"
                  caption="Akasha Platform · Graduation project"
                />
              </div>
            </div>

            <div className="book-flyleaf book-flyleaf-middle">
              <div className="book-print book-print-front book-print-foundations">
                <PrintedPanel
                  title="Engineering Foundations"
                  art="forge"
                  caption="Software engineering · Helwan University"
                />
              </div>
              <div className="book-print book-print-reverse book-print-icu">
                <PrintedPanel
                  title="ICU Management System"
                  art="icu-monitoring"
                  caption="Real-time vitals · Backend integration"
                />
              </div>
            </div>

            <div className="book-flyleaf book-flyleaf-first">
              <div className="book-print book-print-front book-print-title">
                <PrintedPanel
                  title="The Architect Chronicles"
                  art="architect-cover"
                  caption="Mohamed Tarek Hussien · Cairo, Egypt"
                />
              </div>
              <div className="book-print book-print-reverse book-print-quiz">
                <PrintedPanel
                  title="Quiz & Library Systems"
                  art="quiz"
                  caption="A multiplayer quiz platform"
                />
              </div>
            </div>

            <div className="book-board">
              <div className="book-endpaper">
                <div className="book-print book-print-liner">
                  <span>MT</span>
                  <p>Mohamed Tarek Hussien · Cairo, Egypt</p>
                </div>
              </div>

              <FrontCoverFace sheenRef={sheen} />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="book-grip"
          disabled={moving || coverFacing === 'flipping'}
          aria-label={coverFacing === 'back' ? 'Flip to front cover' : 'Open the book'}
          aria-description="The Architect Chronicles. Illustrated engineering portfolio by Mohamed Tarek Hussien."
          aria-describedby="book-inspection-hint"
          {...grip}
        />
      </div>
      <p id="book-inspection-hint" className="book-inspection-hint">
        {coverFacing === 'back'
          ? 'Drag or click to flip to the front cover'
          : 'Drag to rotate · Release or click to open'}
      </p>
    </div>
  );
}
