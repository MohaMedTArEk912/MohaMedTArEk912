import { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

interface InstructorGameOverlayProps {
  onClose: () => void;
}

export function InstructorGameOverlay({ onClose }: InstructorGameOverlayProps) {
  const { addScore } = useArcadeStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [fixedBugs, setFixedBugs] = useState(0);
  const [comprehension, setComprehension] = useState(50);
  const gameOver = timeLeft <= 0;

  const bugChallenges = [
    {
      code: 'async function fetch() { return getData(); } // missing await',
      fix: 'Add await to resolve Promise before execution frame exits',
      pts: 140,
    },
    {
      code: 'for(let i=0; i<=arr.length; i++) // off-by-one index',
      fix: 'Change <= to < to avoid undefined array out-of-bounds access',
      pts: 120,
    },
    {
      code: 'const stream = open(); // unclosed I/O handle leak',
      fix: 'Wrap in try/finally and invoke stream.close() deterministic disposal',
      pts: 160,
    },
    {
      code: 'let state = { count: 0 }; state.count++; // direct mutation',
      fix: 'Use pure functional immutable updates (...state, count + 1)',
      pts: 130,
    },
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleFix = (pts: number) => {
    sounds.playLaser();
    setFixedBugs((b) => b + 1);
    setComprehension((c) => Math.min(100, c + 15));
    addScore('instructor', pts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/50 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              PEDAGOGICAL BUG HUNTER // 3C CLINIC
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-amber-400 font-bold">TIMER: {timeLeft}s</span>
            <span className="text-emerald-400 font-bold">COHORT RATING: {comprehension}%</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Help novice engineering students identify subtle anti-patterns and apply clean code refactoring in real time!
            </p>

            <div className="space-y-2.5">
              {bugChallenges.map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-rose-400 text-[11px] mb-0.5">{b.code}</div>
                    <div className="text-slate-400 text-[10px]">{b.fix}</div>
                  </div>
                  <button
                    onClick={() => handleFix(b.pts)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shrink-0 cursor-pointer"
                  >
                    REFACTOR (+{b.pts})
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400">Students Graduated: <strong className="text-amber-300">{fixedBugs}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pedagogy: S-Rank
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <Award className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h4 className="font-mono text-xl font-bold text-slate-100">CLINIC CONCLUDED</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You deconstructed <strong className="text-amber-400">{fixedBugs} architectural bugs</strong> and elevated student comprehension to {comprehension}%!
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-amber-500 px-6 py-2.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-amber-400 cursor-pointer"
            >
              RETURN TO ARCHITECTURE CRUISE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
