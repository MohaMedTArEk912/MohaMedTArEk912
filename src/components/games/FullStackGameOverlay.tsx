import { useState, useEffect } from 'react';
import { Layers, Zap, Award, X } from 'lucide-react';
import { useArcadeStore } from '../../store/useArcadeStore';
import { sounds } from '../../audio/soundSynthesizer';

interface FullStackGameOverlayProps {
  onClose: () => void;
}

export function FullStackGameOverlay({ onClose }: FullStackGameOverlayProps) {
  const { addScore } = useArcadeStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [throughput, setThroughput] = useState(0);
  const [routedPackets, setRoutedPackets] = useState(0);
  const gameOver = timeLeft <= 0;

  const streams = [
    { type: 'ICU Telemetry', protocol: 'WebSocket Duplex', tier: 'MongoDB Cluster', pts: 150 },
    { type: 'Quiz Live Contest', protocol: 'Socket.IO Room', tier: 'Redis Pub/Sub', pts: 120 },
    { type: 'Akasha AI Schema', protocol: 'GraphQL AST', tier: 'Neo4j Graph DB', pts: 180 },
    { type: 'Auth Token Claims', protocol: 'JWT HMAC-SHA256', tier: 'MySQL ACID', pts: 140 },
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRoute = (st: (typeof streams)[0]) => {
    sounds.playLaser();
    setRoutedPackets((c) => c + 1);
    setThroughput((th) => th + st.pts);
    addScore('fullstack', st.pts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-indigo-500/50 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-mono text-base font-bold text-slate-100">
              DUPLEX PACKET ROUTER // HIGH-CONCURRENCY DISPATCH
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-amber-400 font-bold">TIMER: {timeLeft}s</span>
            <span className="text-indigo-400 font-bold">{throughput} XP</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Route incoming real-time duplex data streams from the presentation plane to matching middleware and database tiers without dropping frames!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {streams.map((st, i) => (
                <button
                  key={i}
                  onClick={() => handleRoute(st)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-400 hover:bg-indigo-950/40 text-left transition transform active:scale-95 cursor-pointer font-mono"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{st.type}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+{st.pts} XP</span>
                  </div>
                  <div className="text-[10px] text-indigo-300 font-mono">{st.protocol}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Target: {st.tier}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400">Packets Routed: <strong className="text-indigo-300">{routedPackets}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5" />
                Latency: 12ms // 0 Dropped
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <Award className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
            <h4 className="font-mono text-xl font-bold text-slate-100">TRANSMISSION COMPLETE</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You routed <strong className="text-indigo-400">{routedPackets} high-concurrency event streams</strong> yielding {throughput} XP with sub-millisecond dispatch!
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-indigo-500 px-6 py-2.5 font-mono text-xs font-bold text-slate-950 transition hover:bg-indigo-400 cursor-pointer"
            >
              RETURN TO ARCHITECTURE CRUISE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
