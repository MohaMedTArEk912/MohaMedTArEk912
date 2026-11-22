import { Trophy, Award, CheckCircle2, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

export function TrophyModal() {
  const { isTrophyModalOpen, setIsTrophyModalOpen, unlockedTrophies, getTotalScore, scores } = useArcadeStore();

  if (!isTrophyModalOpen) return null;

  const trophies = [
    {
      id: 'ALGO_MASTER',
      name: 'Algorithm Master Trophy',
      track: 'SWE Track',
      target: 'Score >= 1,000 Ops in AST Pointer Blitz',
      score: scores.swe,
      color: 'border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'STREAM_MAESTRO',
      name: 'Full-Stack Stream Maestro',
      track: 'Full-Stack Track',
      target: 'Score >= 1,200 XP in Packet Router',
      score: scores.fullstack,
      color: 'border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'SRE_GUARDIAN',
      name: 'Chaos SRE Guardian Trophy',
      track: 'DevOps Track',
      target: 'Score >= 1,200 XP in Chaos Defense',
      score: scores.devops,
      color: 'border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'MASTER_EDUCATOR',
      name: 'Master Educator Medal',
      track: 'Pedagogy Track',
      target: 'Score >= 1,000 XP in Bug Hunter Clinic',
      score: scores.instructor,
      color: 'border-amber-500/40 text-amber-300',
    },
    {
      id: 'DELIVERY_COMMANDER',
      name: 'Delivery Commander Crown',
      track: 'Agile PM Track',
      target: 'Score >= 1,200 XP in Velocity Commander',
      score: scores.pm,
      color: 'border-purple-500/40 text-purple-300',
    },
  ];

  const handleClose = () => {
    sounds.playClick();
    setIsTrophyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        data-lenis-prevent="true"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar overscroll-contain rounded-2xl border border-amber-500/40 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              Global arcade trophy room
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-amber-400 font-bold">
              {getTotalScore()} Total XP
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-sans mb-4">
          Play interactive technical simulations across all five engineering disciplines to unlock achievements and earn XP!
        </p>

        <div
          data-lenis-prevent="true"
          className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar overscroll-contain"
        >
          {trophies.map((t) => {
            const isUnlocked = unlockedTrophies.includes(t.id);
            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isUnlocked
                    ? `${t.color} bg-slate-900/80 shadow-md`
                    : 'border-slate-800 bg-slate-900/30 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-200">{t.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{t.target}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">{t.score} pts</span>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded bg-slate-900">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center font-mono text-[11px] text-slate-400">
          Rank: <span className="text-emerald-400 font-bold">
            {getTotalScore() >= 3000 ? 'Principal system architect' : getTotalScore() >= 1000 ? 'Senior engineer' : 'System operator'}
          </span>
        </div>
      </div>
    </div>
  );
}
