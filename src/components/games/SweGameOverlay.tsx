import { useState, useEffect } from 'react';
import { Code2, Award, Zap, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

interface SweGameOverlayProps {
  onClose: () => void;
}

export function SweGameOverlay({ onClose }: SweGameOverlayProps) {
  const { addScore } = useArcadeStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentOps, setCurrentOps] = useState(0);
  const [streak, setStreak] = useState(0);
  const gameOver = timeLeft <= 0;

  const targets = [
    { label: 'O(1) Hash Access', isCorrect: true, pts: 100 },
    { label: 'O(n^2) Bubble Sort', isCorrect: false, pts: -50 },
    { label: 'O(log n) Binary Search', isCorrect: true, pts: 120 },
    { label: 'O(n!) Permutations', isCorrect: false, pts: -80 },
    { label: 'O(n log n) Merge Sort', isCorrect: true, pts: 140 },
    { label: '0x7FFE_4A82 Free Pointer', isCorrect: true, pts: 110 },
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCardClick = (target: (typeof targets)[0]) => {
    if (target.isCorrect) {
      sounds.playLaser();
      const bonus = (streak + 1) * target.pts;
      setCurrentOps((o) => o + bonus);
      setStreak((s) => s + 1);
      addScore('swe', bonus);
    } else {
      sounds.playAlarm();
      setStreak(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/50 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              AST POINTER BLITZ // BIG-O SPEED SORT
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-amber-400 font-bold">TIMER: {timeLeft}s</span>
            <span className="text-cyan-400 font-bold">{currentOps} OPS</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Click optimal asymptotic complexities & valid memory pointers before the stack overflows. Avoid inefficient algorithms!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {targets.map((tgt, i) => (
                <button
                  key={i}
                  onClick={() => handleCardClick(tgt)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition transform active:scale-95 cursor-pointer font-mono"
                >
                  <div className="text-xs font-bold text-slate-200">{tgt.label}</div>
                  <div className="text-[10px] text-cyan-400 mt-1">
                    {tgt.isCorrect ? `+${tgt.pts} Ops` : 'Anti-Pattern'}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400">Combo Streak: <strong className="text-emerald-400">{streak}x</strong></span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Cache Affinity: Optimal
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <Award className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
            <h4 className="font-mono text-xl font-bold text-slate-100">EXECUTION COMPLETE</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You achieved <strong className="text-cyan-400">{currentOps} Compute Ops</strong> with asymptotic algorithmic efficiency!
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-cyan-500 px-6 py-2.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-cyan-400 cursor-pointer"
            >
              RETURN TO ARCHITECTURE CRUISE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
