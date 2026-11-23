import { lazy, Suspense, useEffect } from 'react';
import './index.css';
import { useCommandStore } from './store/useCommandStore';
import { ComicBookFlipReader } from './components/dom/ComicBookFlipReader';
import { ComicEntryGate } from './components/dom/ComicEntryGate';
import { ProfessionalBlackWhiteResume } from './components/resume/ProfessionalBlackWhiteResume';

const ArchiveExtras = lazy(() => import('./ArchiveExtras'));

function App() {
  const readerMode = useCommandStore(state => state.readerMode);
  const show3DScene = readerMode === 'scroll';
  // Guarantee that the portfolio always loads at the very top (Section 00 Origin)
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (<>
    <div
      className={`relative ${
        readerMode !== 'scroll' ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } bg-[#09080D] text-[#F3E7D3] selection:bg-[#F2C94C]/30 selection:text-[#F2C94C] print:hidden`}
    >
      {/* Subtle Halftone & Cross-Hatch Graphic Novel Overlay */}
      {readerMode !== 'vertical' && <div className="fixed inset-0 bg-grid-mesh pointer-events-none z-1 opacity-75" />}

      {!show3DScene && <ComicBookFlipReader />}
      {!show3DScene && <ComicEntryGate />}
      <Suspense fallback={show3DScene ? <p role="status">Loading tour… <a href={import.meta.env.BASE_URL}>Return to landing</a></p> : null}>
        <ArchiveExtras show3DScene={show3DScene} />
      </Suspense>
    </div>
    <div className="hidden print:block"><ProfessionalBlackWhiteResume /></div>
  </>);
}

export default App;
