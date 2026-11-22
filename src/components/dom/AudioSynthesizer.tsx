import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../../utils/audio';

export function AudioSynthesizer() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsub = audioManager.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleToggle = () => {
    audioManager.toggle();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative p-1.5 transition rounded-full flex items-center justify-center cursor-pointer ${
        isPlaying
          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
      }`}
      title={isPlaying ? 'Mute Fun Ambient Synth' : 'Play Fun Ambient Synth & SFX'}
      aria-label="Toggle Audio Synth"
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </>
      ) : (
        <VolumeX className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
