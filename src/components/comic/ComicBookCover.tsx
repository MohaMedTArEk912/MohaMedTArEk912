import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { COMIC_VOLUMES } from '../../data/comicVolumes';
import { useBookInspection } from './useBookInspection';
import '../../styles/book-cover.css';

interface CoverProps {
  moving: boolean;
  onOpen: () => void;
  onTurnEnd: () => void;
}

function PrintedPanel({ title, art, caption }: { title: string; art: string; caption: string }) {
  return (
    <>
      <h2>{title}</h2>
      <img src={`${import.meta.env.BASE_URL}comic/${art}.webp`} alt="" decoding="async" draggable={false} />
      <p>{caption}</p>
    </>
  );
}

export function ComicBookCover({ moving, onOpen, onTurnEnd }: CoverProps) {
  const { gimbal, grip } = useBookInspection(onOpen);
  const gate = useRef<HTMLDivElement>(null);
  const footprint = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = gate.current!;
    const book = footprint.current!;
    // Measure the stationary footprint. The animated boards share its spine.
    function frameBook() {
      const portrait = stage.clientHeight > stage.clientWidth;
      const panelWidth = stage.clientWidth / (portrait ? 1 : 2);
      stage.style.setProperty('--camera-x', portrait ? '0px' : stage.clientWidth / 4 + 'px');
      stage.style.setProperty('--camera-sx', String(panelWidth / book.offsetWidth));
      stage.style.setProperty('--camera-sy', String(stage.clientHeight / book.offsetHeight));
    }
    frameBook();
    const observer = new ResizeObserver(frameBook);
    observer.observe(stage);
    observer.observe(book);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="comic-cover-gate" ref={gate}
      onAnimationEnd={event => {
        if (moving && event.target === event.currentTarget && event.animationName === 'book-exposure') onTurnEnd();
      }}>
      <a className="cover-return" href={import.meta.env.BASE_URL}>← Return to landing</a>
      <div className="book-footprint" ref={footprint}>
        <div className="book-gimbal" ref={gimbal} aria-hidden="true">
          <div className="book-camera">
            <div className="book-back">
              <span className="book-back-imprint">The Architect Chronicles</span>
              <img src={`${import.meta.env.BASE_URL}comic/architect-cover.webp`} alt="" draggable={false} width="1280" height="720" />
              <strong>Mohamed Tarek Hussien</strong>
              <p>Software engineering, full-stack development, and cloud infrastructure.</p>
              <span className="book-back-credit">Cairo, Egypt</span>
            </div>
            <div className="book-spine"><span>The Architect Chronicles</span></div>
            <div className="book-top-edge" />
            <div className="book-fore-edge" />
            <div className="book-bottom-edge" />
            <div className="book-page-block">
              <div className="book-printed-contents book-print">
                <h2>Contents</h2>
                <ol>{COMIC_VOLUMES.map(volume => <li key={volume.number}>
                  <span>{volume.number}</span><b>{volume.title}</b>
                </li>)}</ol>
              </div>
            </div>
            <div className="book-flyleaf book-flyleaf-last">
              <div className="book-print book-print-front book-print-infrastructure">
                <PrintedPanel title="Cloud & Delivery" art="devops" caption="Infrastructure · Automation · Observability" />
              </div>
              <div className="book-print book-print-reverse book-print-blueprint">
                <PrintedPanel title="Project notebook" art="akasha-blueprint" caption="Akasha Platform · Graduation project" />
              </div>
            </div>
            <div className="book-flyleaf book-flyleaf-middle">
              <div className="book-print book-print-front book-print-foundations">
                <PrintedPanel title="Engineering Foundations" art="forge" caption="Software engineering · Helwan University" />
              </div>
              <div className="book-print book-print-reverse book-print-icu">
                <PrintedPanel title="ICU Management System" art="icu-monitoring" caption="Real-time vitals · Backend integration" />
              </div>
            </div>
            <div className="book-flyleaf book-flyleaf-first">
              <div className="book-print book-print-front book-print-title">
                <PrintedPanel title="The Architect Chronicles" art="architect-cover" caption="Mohamed Tarek Hussien · Cairo, Egypt" />
              </div>
              <div className="book-print book-print-reverse book-print-quiz">
                <PrintedPanel title="Quiz & Library Systems" art="quiz" caption="A multiplayer quiz platform" />
              </div>
            </div>
            <div className="book-board">
              <div className="book-endpaper">
                <div className="book-print book-print-liner">
                  <span>MT</span>
                  <p>Mohamed Tarek Hussien · Cairo, Egypt</p>
                </div>
              </div>
              <div className="comic-closed-book">
                <span className="closed-book-edition">Illustrated engineering portfolio</span>
                <span className="closed-book-title">The Architect<br />Chronicles</span>
                <span className="closed-book-art"><img src={`${import.meta.env.BASE_URL}comic/architect-cover.webp`} alt=""
                  width="1280" height="720" fetchPriority="high" draggable={false} /></span>
                <span className="closed-book-byline">Mohamed Tarek Hussien</span>
                <span className="closed-book-action">Open the book <ArrowRight size={16} /></span>
              </div>
            </div>
          </div>
        </div>
        <button type="button" className="book-grip" disabled={moving} aria-label="Open the book"
          aria-describedby="book-inspection-hint" {...grip} />
      </div>
      <p id="book-inspection-hint" className="book-inspection-hint">Drag to rotate · Release to open</p>
    </div>
  );
}
