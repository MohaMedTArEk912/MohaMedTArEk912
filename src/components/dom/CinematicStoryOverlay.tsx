import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, X, Sparkles, Volume2 } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { storyNarrator, STORY_CHAPTERS } from '../../utils/storyNarrator';
import { speechNarrator } from '../../utils/speechNarrator';
import { sounds } from '../../audio/soundSynthesizer';

export function CinematicStoryOverlay() {
  const { isStoryModeActive, storyChapter, isStoryPaused, toggleStoryPause } = useArcadeStore();
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = speechNarrator.subscribe((state) => {
      setTranscript(state.transcript);
      setIsSpeaking(state.isSpeaking);
    });
    return () => unsub();
  }, []);

  if (!isStoryModeActive) return null;

  const currentChapter = STORY_CHAPTERS[storyChapter] || STORY_CHAPTERS[0];

  const handlePauseToggle = () => {
    sounds.playClick();
    if (isStoryPaused) {
      speechNarrator.speakSection(currentChapter.id, true);
    } else {
      speechNarrator.stop();
    }
    toggleStoryPause();
  };

  const handleNext = () => {
    sounds.playClick();
    storyNarrator.nextChapter();
  };

  const handleExit = () => {
    sounds.playClick();
    storyNarrator.stopStory();
  };

  return (
    <aside
      aria-label="Interactive Story Narrator Mode"
      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-50 pointer-events-auto"
    >
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl backdrop-blur-2xl ring-1 ring-cyan-500/30">
        {/* Top Header: Chapter Progress & Telemetry */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-[11px] font-bold text-cyan-300 tracking-wider">
              Mohamed Tarek // cinematic odyssey narrator
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Chapter {storyChapter + 1} of {STORY_CHAPTERS.length}
            </span>
          </div>

          <button
            onClick={handleExit}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
            title="Exit Story Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter Progress Indicators */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {STORY_CHAPTERS.map((ch, idx) => (
            <div
              key={ch.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx < storyChapter
                  ? 'bg-emerald-400'
                  : idx === storyChapter
                  ? 'bg-cyan-400 animate-pulse ring-2 ring-cyan-500/40'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Live Audio & Subtitles Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3 font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{currentChapter.phaseCode} : {currentChapter.title}</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isSpeaking ? 'Transmitting voice' : 'Paused'}</span>
            </span>
          </div>
          <p className="leading-relaxed text-slate-300 font-sans text-xs sm:text-sm italic">
            "{transcript || 'Initializing vocal telemetry...'}"
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePauseToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {isStoryPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume narration</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Next chapter</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Sit back and watch the 3D camera travel through the architecture.
          </span>
        </div>
      </div>
    </aside>
  );
}
