import { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Server,
  Zap,
  CheckCircle2,
  Trophy,
  Clock,
  Layers,
  Database,
  Globe,
  Radio,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';
import confetti from 'canvas-confetti';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export function GameModal() {
  const { activeGame, closeGame, resolveChaos } = useCommandStore();

  if (!activeGame) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={closeGame}
    >
      <div
        data-lenis-prevent="true"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar overscroll-contain bg-slate-900/95 border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/70 p-5 sm:p-7 flex flex-col gap-4 font-mono text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {activeGame === 'chaos' && <ChaosGameView onClose={closeGame} onWin={resolveChaos} />}
        {activeGame === 'quiz' && <TechBlitzGameView onClose={closeGame} />}
        {activeGame === 'architect' && <AkashaArchitectGameView onClose={closeGame} />}
      </div>
    </div>
  );
}

// =============================================================================
// GAME 1: CHAOS ENGINEERING: SAVE THE CLUSTER
// =============================================================================
function ChaosGameView({ onClose, onWin }: { onClose: () => void; onWin: () => void }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    sounds.playGlitch();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStep1 = () => {
    if (step1Done) return;
    sounds.playClick();
    setStep1Done(true);
  };

  const handleStep2 = () => {
    if (!step1Done || step2Done) return;
    sounds.playClick();
    setStep2Done(true);
  };

  const handleStep3 = () => {
    if (!step2Done || step3Done) return;
    sounds.playSuccess();
    setStep3Done(true);
    setIsWon(true);
    onWin();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-500/40 pb-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm tracking-wider">
            Chaos drill: save the cluster
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300">
            <Clock className="w-3.5 h-3.5" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cluster Status Widget */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 ">Cluster health telemetry</div>
          <div className="text-xl font-black text-red-400 flex items-center gap-2 mt-0.5">
            <span>{isWon ? '100% (stable)' : '20% (critical traffic spike)'}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isWon ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`} />
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Failing pods:</div>
          <div className="text-amber-400 font-bold">
            {isWon ? '0 Pods' : 'Auth, ICU-Node, Mongo'}
          </div>
        </div>
      </div>

      {/* 3 Step Actions */}
      <div className="space-y-2.5">
        <div className="text-xs text-slate-300 font-sans">
          Execute the 3 site reliability mitigation steps before timeout to restore SLA:
        </div>

        {/* Step 1 */}
        <button
          onClick={handleStep1}
          disabled={step1Done || isGameOver || isWon}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
            step1Done
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/60 text-slate-200 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <div className="text-xs font-bold">Scale Kubernetes HPA (Replicas: 1 ➔ 5)</div>
              <div className="text-[10px] text-slate-400">kubectl scale deploy/icu-core --replicas=5</div>
            </div>
          </div>
          {step1Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        </button>

        {/* Step 2 */}
        <button
          onClick={handleStep2}
          disabled={!step1Done || step2Done || isGameOver || isWon}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
            step2Done
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : !step1Done
              ? 'opacity-40 bg-slate-950/40 border-slate-900 cursor-not-allowed'
              : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/60 text-slate-200 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <div className="text-xs font-bold">Run Ansible Disaster Recovery Playbook</div>
              <div className="text-[10px] text-slate-400">ansible-playbook -i prod recovery.yml</div>
            </div>
          </div>
          {step2Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        </button>

        {/* Step 3 */}
        <button
          onClick={handleStep3}
          disabled={!step2Done || step3Done || isGameOver || isWon}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
            step3Done
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : !step2Done
              ? 'opacity-40 bg-slate-950/40 border-slate-900 cursor-not-allowed'
              : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/60 text-slate-200 cursor-pointer animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <div className="text-xs font-bold">Re-route via AWS ALB & Prometheus Alertmanager</div>
              <div className="text-[10px] text-slate-400">alb-ingress-apply --weight=100</div>
            </div>
          </div>
          {step3Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        </button>
      </div>

      {/* Result Message */}
      {isWon && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Drill resolved! +1,500 XP awarded & trophy unlocked</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-emerald-400 text-slate-950 font-bold rounded-lg hover:bg-emerald-300"
          >
            Done
          </button>
        </div>
      )}

      {isGameOver && !isWon && (
        <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs flex items-center justify-between">
          <span>TIME EXPIRED: Pods unresponsive. Re-trigger drill to retry.</span>
          <button
            onClick={() => {
              setTimeLeft(30);
              setStep1Done(false);
              setStep2Done(false);
              setStep3Done(false);
              setIsGameOver(false);
            }}
            className="px-3 py-1 bg-red-500 text-slate-950 font-bold rounded-lg hover:bg-red-400"
          >
            Retry Drill
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GAME 2: 60-SECOND TECH BLITZ (QUIZ PLATFORM SHOWCASE)
// =============================================================================
const QUIZ_QUESTIONS = [
  {
    q: 'In Kubernetes, what controller ensures a specified number of pod replicas are running at all times?',
    options: ['Deployment / ReplicaSet', 'DaemonSet', 'Ingress Controller', 'ConfigMap'],
    answer: 0,
    topic: 'K8s',
  },
  {
    q: 'How does Socket.io maintain continuous bidirectional connection across changing network topologies?',
    options: [
      'WebSocket with automatic long-polling HTTP fallback',
      'Continuous short polling only',
      'Direct raw TCP sockets on port 80',
      'Server-Sent Events (SSE) exclusively',
    ],
    answer: 0,
    topic: 'WebSockets',
  },
  {
    q: 'In React, what hook is used to persist mutable values that do not trigger re-render on mutation?',
    options: ['useRef()', 'useState()', 'useMemo()', 'useCallback()'],
    answer: 0,
    topic: 'React',
  },
  {
    q: 'Which database indexing strategy is essential in MongoDB for optimizing range queries on patient vitals?',
    options: ['Compound Index with time-series sorting', 'Text index only', 'Unique sparse index', 'Hashed index'],
    answer: 0,
    topic: 'MongoDB',
  },
  {
    q: 'What is the core purpose of Terraform state locking?',
    options: [
      'Prevent simultaneous pipeline executions from corrupting infrastructure state',
      'Encrypt cloud credentials at rest',
      'Speed up plan generation by caching AWS APIs',
      'Enforce Git branch protections',
    ],
    answer: 0,
    topic: 'DevOps / IaC',
  },
];

function TechBlitzGameView({ onClose }: { onClose: () => void }) {
  const { addScore } = useArcadeStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    sounds.playWarp();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null || isFinished) return;
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === QUIZ_QUESTIONS[currentIdx].answer;
    if (isCorrect) {
      sounds.playSuccess();
      const points = 200 * (streak + 1);
      setScore((s) => s + points);
      setStreak((st) => st + 1);
    } else {
      sounds.playGlitch();
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
        setCurrentIdx((i) => i + 1);
      } else {
        setIsFinished(true);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        addScore('swe', score + (isCorrect ? 200 * (streak + 1) : 0));
      }
    }, 600);
  };

  const question = QUIZ_QUESTIONS[currentIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/40 pb-3">
        <div className="flex items-center gap-2 text-purple-400">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider">
            60-second tech blitz (MERN & DevOps)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300">
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score & Rival Simulation Header */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
        <div>
          <div className="text-[10px] text-slate-400">Your score</div>
          <div className="text-lg font-black text-purple-300">{score} Pts</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Streak multiplier</div>
          <div className="text-lg font-black text-amber-400">{streak > 0 ? `${streak}X` : '1X'}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Rival leader</div>
          <div className="text-xs font-bold text-slate-300 mt-1">Elena [950 pts]</div>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          <div className="text-xs font-mono text-cyan-400 flex items-center justify-between">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">{question.topic}</span>
          </div>

          <div className="text-sm font-semibold text-slate-100 font-sans leading-relaxed">
            {question.q}
          </div>

          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === question.answer;

              let btnClass = 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 text-slate-200';
              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnClass = 'bg-emerald-950 border-emerald-500 text-emerald-300';
                } else if (isSelected) {
                  btnClass = 'bg-red-950 border-red-500 text-red-300';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition cursor-pointer flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-purple-950/60 border border-purple-500/50 rounded-2xl text-center space-y-3">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-slate-100">Challenge completed!</h3>
          <p className="text-xs text-slate-300">
            Final Score: <span className="text-purple-300 font-black">{score} Points</span>. Great demonstration of MERN & DevOps architectural knowledge!
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Back to Command Center
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GAME 3: AKASHA SYSTEM ARCHITECT (GRADUATION PROJECT SHOWCASE)
// =============================================================================
const ARCH_PIPELINE_TIERS = [
  {
    step: 1,
    tier: 'Client Presentation Tier',
    component: 'React + Tailwind UI',
    icon: Globe,
    desc: 'Bento Grid Dashboard with sub-second responsive updates and state machines',
  },
  {
    step: 2,
    tier: 'Microservice API Gateway',
    component: 'Node.js + Express REST API',
    icon: Server,
    desc: 'Stateless middleware auth validation, rate-limiting, and triage endpoints',
  },
  {
    step: 3,
    tier: 'Real-Time Telemetry Stream',
    component: 'Socket.io Event Pub/Sub',
    icon: Radio,
    desc: 'Sub-15ms bi-directional patient vitals distribution cluster',
  },
  {
    step: 4,
    tier: 'Persistence & Container Cloud',
    component: 'MongoDB + Docker on AWS',
    icon: Database,
    desc: 'Time-series indexed medical telemetry & multi-stage container deployment',
  },
];

function AkashaArchitectGameView({ onClose }: { onClose: () => void }) {
  const { addScore } = useArcadeStore();
  const [activeStep, setActiveStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectTier = (stepNumber: number) => {
    if (stepNumber === activeStep) {
      sounds.playSuccess();
      if (activeStep < 4) {
        setActiveStep((s) => s + 1);
      } else {
        setIsCompleted(true);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        addScore('fullstack', 1200);
      }
    } else {
      sounds.playGlitch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Layers className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider">
            Akasha system architect: ICU real-time blueprint
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-slate-300 font-sans">
        Connect the 4 architectural layers in proper sequential order to scaffold Mohamed's production ICU telemetry pipeline:
      </div>

      {/* 4 Pipeline Tier Slots */}
      <div className="space-y-2.5">
        {ARCH_PIPELINE_TIERS.map((tier) => {
          const isPlaced = tier.step < activeStep || isCompleted;
          const isCurrentTarget = tier.step === activeStep && !isCompleted;
          const Icon = tier.icon;

          return (
            <div
              key={tier.step}
              onClick={() => handleSelectTier(tier.step)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                isPlaced
                  ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200'
                  : isCurrentTarget
                  ? 'bg-slate-900 border-cyan-400 animate-pulse text-slate-100 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isPlaced
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : isCurrentTarget
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Step {tier.step}: {tier.tier}
                  </div>
                  <div className="text-xs font-bold text-slate-100">{tier.component}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                </div>
              </div>

              {isPlaced && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
          );
        })}
      </div>

      {isCompleted && (
        <div className="p-4 bg-cyan-950/80 border border-cyan-500/60 rounded-2xl text-center space-y-2">
          <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Blueprint compiled successfully! +1,200 XP awarded</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Pipeline validated: Clean separation between client presentation, stateless Express APIs, high-velocity Socket.io pub/sub, and containerized Docker replicas.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
            >
              View GitHub Blueprint
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
