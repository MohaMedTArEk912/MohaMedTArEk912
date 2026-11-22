import { lazy, Suspense } from 'react';
import { useLenisGSAP, smoothScrollTo } from './hooks/useLenisGSAP';
import { useComicPhysics } from './hooks/useComicPhysics';
import { BentoStationDrawer } from './components/dom/BentoStationDrawer';
import { Executive2DResumeView } from './components/dom/Executive2DResumeView';
import { CommandPaletteModal } from './components/dom/CommandPaletteModal';
import { GameModal } from './components/dom/GameModal';
import { TrophyModal } from './components/dom/TrophyModal';
import { CinematicStoryOverlay } from './components/dom/CinematicStoryOverlay';
import { useCommandStore } from './store/useCommandStore';
const CinematicScroll = lazy(() => import('./components/dom/CinematicScroll'));

const SceneContainer = lazy(async () => {
  const { SceneContainer } = await import('./components/3d/SceneContainer');
  return { default: SceneContainer };
});

export default function ArchiveExtras({ show3DScene }: { show3DScene: boolean }) {
  useLenisGSAP();
  useComicPhysics(show3DScene);
  const setActiveIssueIndex = useCommandStore(state => state.setActiveIssueIndex);
  const handleOpenTerminal = () => {
    if (useCommandStore.getState().readerMode !== 'scroll') {
      setActiveIssueIndex(8);
    } else {
      smoothScrollTo('#sec-contact');
    }
  };

  return <>
      {show3DScene && <Suspense fallback={<p role="status">Opening the 3D tour… <a href={import.meta.env.BASE_URL}>Return to landing</a></p>}>
        <SceneContainer />
        <CinematicScroll onOpenTerminal={handleOpenTerminal} />
      </Suspense>}
      {/* 2D Executive Recruiter Resume Mode */}
      <Executive2DResumeView />

      {/* Bento Grid Station Drawer */}
      <BentoStationDrawer />

      {/* Interactive Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal onOpenTerminal={handleOpenTerminal} />

      {/* Retro Arcade Mini-Game Overlay Modals */}
      <GameModal />

      {/* Engineering Trophy & XP Progress Modal */}
      <TrophyModal />

      {/* Cinematic AI Guided Story Mode & Narration Teleprompter */}
      <CinematicStoryOverlay />

    </>
}
