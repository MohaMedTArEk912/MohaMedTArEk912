import { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Award, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

interface DevOpsGameOverlayProps {
  onClose: () => void;
}

export function DevOpsGameOverlay({ onClose }: DevOpsGameOverlayProps) {
  const { addScore } = useArcadeStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeOutages, setActiveOutages] = useState<number[]>([3, 11, 24]);
  const [mitigatedCount, setMitigatedCount] = useState(0);
  const gameOver = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Chaos Monkey outage injector
  useEffect(() => {
    if (gameOver) return;
    const chaosInterval = setInterval(() => {
      if (Math.random() > 0.4 && activeOutages.length < 8) {
        const randomPod = Math.floor(Math.random() * 32);
        if (!activeOutages.includes(randomPod)) {
          setActiveOutages((prev) => [...prev, randomPod]);
          sounds.playAlarm();
        }
      }
    }, 1800);
    return () => clearInterval(chaosInterval);
  }, [activeOutages, gameOver]);

  const healPod = (podId: number) => {
    sounds.playLaser();
    setActiveOutages((prev) => prev.filter((id) => id !== podId));
    setMitigatedCount((c) => c + 1);
    addScore('devops', 120);
  };

  const applyTerraformIaCPatch = () => {
    sounds.playSuccess();
    setMitigatedCount((c) => c + activeOutages.length);
    addScore('devops', activeOutages.length * 150);
    setActiveOutages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              CHAOS MONKEY // SRE CLUSTER DEFENSE
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-amber-400 font-bold">TIMER: {timeLeft}s</span>
            <span className="text-emerald-400 font-bold">MITIGATED: {mitigatedCount}</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Chaos Monkey is crashing Kubernetes pods! Click damaged pods to execute <code className="text-cyan-300">kubectl restart</code> or trigger automated Terraform self-healing.
            </p>

            {/* Pod Grid Radar */}
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              {Array.from({ length: 32 }).map((_, idx) => {
                const isDamaged = activeOutages.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => isDamaged && healPod(idx)}
                    className={`h-9 rounded-md font-mono text-[10px] font-bold transition transform active:scale-90 flex items-center justify-center cursor-pointer ${
                      isDamaged
                        ? 'bg-rose-600/80 text-white animate-bounce ring-2 ring-rose-400'
                        : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:border-emerald-500'
                    }`}
                  >
                    {isDamaged ? 'ERR!' : `p${idx}`}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={applyTerraformIaCPatch}
                disabled={activeOutages.length === 0}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Zap className="h-4 w-4" />
                <span>APPLY TERRAFORM IAC AUTO-HEAL</span>
              </button>
              <span className="font-mono text-[11px] text-slate-500">DEPI DevOps Honors Edition</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <Award className="h-12 w-12 text-amber-400 mx-auto animate-bounce" />
            <h4 className="font-mono text-xl font-bold text-slate-100">SIMULATION COMPLETE</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You mitigated <strong className="text-emerald-400">{mitigatedCount}</strong> critical infrastructure failures!
              Your SRE cluster maintained <strong>99.99%</strong> SLO availability.
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
