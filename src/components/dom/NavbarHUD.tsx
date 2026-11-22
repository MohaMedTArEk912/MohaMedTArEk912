import { useEffect, useState } from 'react';
import { BookOpen, ArrowUp, Terminal } from 'lucide-react';
import { sounds } from '../../audio/soundSynthesizer';
import { useCommandStore } from '../../store/useCommandStore';
import { smoothScrollTo } from '../../hooks/useLenisGSAP';

interface NavbarHUDProps {
  onOpenTerminal: () => void;
}

export function NavbarHUD({ onOpenTerminal }: NavbarHUDProps) {
  const [showBackToAgenda, setShowBackToAgenda] = useState(false);
  const { readerMode, setReaderMode, activeIssueIndex, setActiveIssueIndex, isTerminalFullscreen } =
    useCommandStore();

  useEffect(() => {
    const handleScroll = () => {
      if (useCommandStore.getState().readerMode === 'flip') {
        setShowBackToAgenda(useCommandStore.getState().activeIssueIndex > 0);
        return;
      }
      setShowBackToAgenda(window.scrollY > window.innerHeight * 0.65);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [readerMode, activeIssueIndex]);

  if (isTerminalFullscreen || !showBackToAgenda) return null;

  const returnToFirstPageAgenda = () => {
    sounds.playWarp();
    if (readerMode === 'flip') {
      setActiveIssueIndex(0);
    } else {
      smoothScrollTo('#sec-about');
    }
  };

  const jumpToTerminal = () => {
    sounds.playClick();
    if (readerMode === 'flip') {
      setActiveIssueIndex(8);
    } else {
      onOpenTerminal();
    }
  };

  return (
    <div className="fixed top-3 right-4 z-50 pointer-events-auto flex items-center gap-2">
      <button
        onClick={() => {
          sounds.playWarp();
          setReaderMode('flip');
        }}
        className="px-3 py-1.5 bg-[#E62E25] text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] hover:bg-[#F2C94C] hover:text-[#09080D] text-xs font-display tracking-wider flex items-center gap-1.5 cursor-pointer font-bold transition"
        title="Switch to Horizontal Physical Comic Book Flip Mode"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Flip book</span>
      </button>

      <button
        onClick={jumpToTerminal}
        className="comic-action-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        title="Jump to ZSH Supercomputer Terminal (VOL.08)"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>Zsh CLI</span>
      </button>

      <button
        onClick={returnToFirstPageAgenda}
        className="comic-gold-btn px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        title="Return to Volume Archive Desk (VOL.00)"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Vol.00 archive desk</span>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
