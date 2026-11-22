import { useState, useEffect } from 'react';
import { Target, Zap, Award, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

interface PmGameOverlayProps {
  onClose: () => void;
}

export function PmGameOverlay({ onClose }: PmGameOverlayProps) {
  const { addScore } = useArcadeStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [shippedStories, setShippedStories] = useState(0);
  const [scopeDeflected, setScopeDeflected] = useState(0);
  const gameOver = timeLeft <= 0;

  const epics = [
    { title: 'Auth Token Architecture', type: 'Epic', points: 8, pts: 150 },
    { title: 'Real-Time Telemetry Pipeline', type: 'Spike', points: 13, pts: 220 },
    { title: 'Scope Creep: Unplanned Refactor', type: 'Hazard', points: 0, pts: 100, isHazard: true },
    { title: 'Kubernetes Rolling Zero-Downtime', type: 'Story', points: 5, pts: 130 },
    { title: 'Scope Creep: Random Dependency Update', type: 'Hazard', points: 0, pts: 100, isHazard: true },
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAction = (item: (typeof epics)[0]) => {
    if (item.isHazard) {
      sounds.playLaser();
      setScopeDeflected((d) => d + 1);
      addScore('pm', item.pts);
    } else {
      sounds.playSuccess();
      setShippedStories((s) => s + item.points);
      addScore('pm', item.pts);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-purple-500/50 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              SPRINT VELOCITY COMMANDER // KANBAN RUNWAY
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-amber-400 font-bold">TIMER: {timeLeft}s</span>
            <span className="text-purple-400 font-bold">{shippedStories} PTS SHIPPED</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Dispatch high-value backlog epics to production while deflecting unexpected Scope Creep hazards before sprint deadline!
            </p>

            <div className="space-y-2.5">
              {epics.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    item.isHazard
                      ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.isHazard ? 'Unplanned Scope Hazard' : `Story Points: ${item.points}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(item)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      item.isHazard
                        ? 'bg-rose-500 hover:bg-rose-400 text-white'
                        : 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                    }`}
                  >
                    {item.isHazard ? 'DEFLECT HAZARD' : 'SHIP TO PROD'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400">Scope Deflected: <strong className="text-rose-400">{scopeDeflected}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5" />
                Burndown Accuracy: 99.4%
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <Award className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
            <h4 className="font-mono text-xl font-bold text-slate-100">SPRINT DELIVERED</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You shipped <strong className="text-purple-400">{shippedStories} Story Points</strong> on time and deflected {scopeDeflected} unplanned scope hazards!
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-purple-500 px-6 py-2.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-purple-400 cursor-pointer"
            >
              RETURN TO ARCHITECTURE CRUISE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
