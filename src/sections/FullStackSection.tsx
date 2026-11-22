import { useState } from 'react';
import { Layers, Zap, Award, Server, Globe, Shield, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';
import { StageGridHeader } from '../components/dom/StageGridHeader';

export function FullStackSection() {
  const [eventLog, setEventLog] = useState<string>(
    'DUPLEX CHANNEL ARMED • 0MS DRIFT • CLICK TO FIRE WEBSOCKET FRAME!'
  );
  const [isEmitting, setIsEmitting] = useState(false);

  const emitWebSocketEvent = () => {
    setIsEmitting(true);
    setEventLog('⚡ [ACK 12MS] WS FRAME -> REDIS PUB/SUB -> MONGODB REPLICA COMMITTED!');
    audioManager.playSfx('confetti');
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F2C94C', '#E62E25', '#5B3E96'],
    });
    setTimeout(() => setIsEmitting(false), 1200);
  };

  const comicStripTiers = [
    {
      panelNo: 'PANEL #01 // GRADUATION PROJECT LEAD',
      sfx: 'ZAP!! <20MS SYNC!',
      title: 'Akasha-platform & reactive client architecture',
      icon: Globe,
      badge: '6-dev squad lead',
      spanClass: 'col-span-12 panel-slash-left comic-speedlines',
      desc: 'Led the AI-powered software engineering platform transforming raw ideas into complete architectures, DB schemas, and real-time collaborative React 19 + WebGL workspaces!',
      tech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Socket.IO'],
    },
    {
      panelNo: 'PANEL #02 // MISSION-CRITICAL ICU',
      sfx: 'PULSE!! <15MS!',
      title: 'ICU-management-system & microservices',
      icon: Server,
      badge: '<15 ms real-time stream',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-right',
      desc: 'Engineered high-throughput Node.js + MongoDB RESTful APIs and sub-15 ms Socket.IO duplex telemetry streams for hospital intensive care monitoring & automated bed triage!',
      tech: ['Node.js', 'Express', 'Socket.IO', 'MongoDB', 'RESTful APIs', 'JWT / RBAC'],
    },
    {
      panelNo: 'PANEL #03 // SOLO MULTIPLAYER ARENA',
      sfx: '100% SOLO!!',
      title: 'Competitive quiz-platform (MERN)',
      icon: Shield,
      badge: 'Zero clock drift',
      spanClass: 'col-span-12 sm:col-span-5 panel-tilt-left',
      desc: 'Sole architect of an end-to-end MERN multiplayer quiz arena with authoritative server clocks, streak multipliers & hardened security!',
      tech: ['React 19', 'Socket.IO', 'MongoDB', 'MySQL', 'Neo4j', 'Ethical hacking'],
      liveUrl: 'https://quiz-platform-dun.vercel.app/demo',
    },
  ];

  return (
    <section
      id="sec-fullstack"
      data-layout="stage-right"
      className="stage-section relative overflow-hidden"
    >
      {/* Spread 02 Header */}
      <StageGridHeader
        sector="SPREAD 02 // ARSENAL OF THE FULL-STACK (02 FULLSTACK)"
        corridor="Stage right (cols 8-12 avatar)"
        badge="MERN & real-time WebSockets"
      />

      {/* Content Column on the LEFT (Cols 1-7) */}
      <div className="stage-content flex flex-col items-start z-10 w-full gap-4">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <Layers className="w-4 h-4" />
              <span>Chapter II // full-stack web &amp; real-time streaming</span>
            </div>
          </div>

          <h2 className="runic-spread-title text-3xl sm:text-5xl block">
            Arsenal of the full-stack
          </h2>

          {/* Speech Bubble Pointing Right Toward the 3D Avatar in Cols 8-12 */}
          <div className="comic-speech-bubble comic-speech-bubble-right w-full relative">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#E62E25] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
              <span>💬 Mohamed transmits over full-duplex Socket.IO:</span>
              <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5">Spread #02</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text">
              &ldquo;Three production battlegrounds! <span className="bg-[#F2C94C] px-1 border border-[#09080D]">Sub-15 ms WebSocket streams</span>, authoritative server clocks, and <span className="text-[#E62E25] underline">polyglot persistence</span> across MongoDB, MySQL &amp; Neo4j!&rdquo;
            </p>
          </div>
        </div>

        {/* UNORDINARY 12-COLUMN ASYMMETRIC COMIC STRIP GRID (12 + 7:5 + 5:7 Staggered Spans) */}
        <div className="unordinary-comic-grid pt-2">
          {comicStripTiers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.title}
                className={`${layer.spanClass} comic-panel-frame pt-6 pb-4 px-4 relative`}
              >
                <span className="comic-panel-number">{layer.panelNo}</span>
                <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
                  {layer.sfx}
                </span>

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#09080D] border-2 border-[#F2C94C] text-[#F2C94C]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-display text-[#F3E7D3] tracking-wider">
                      {layer.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#E62E25] border-2 border-[#09080D] text-xs font-display tracking-wider text-white shadow-[3px_3px_0px_#09080D]">
                    {layer.badge}
                  </span>
                </div>

                <p className="text-xs text-[#CBC0E3] comic-dialogue-text mb-3">
                  {layer.desc}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {layer.tech.map((t, idx) => (
                      <span
                        key={t}
                        className={`px-2.5 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] text-[10.5px] font-display tracking-wider ${
                          idx % 2 === 0
                            ? 'bg-[#F2C94C] text-[#09080D]'
                            : 'bg-[#09080D] text-[#F2C94C] border-[#F2C94C]'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {'liveUrl' in layer && layer.liveUrl && (
                    <a
                      href={layer.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E62E25] hover:bg-[#F2C94C] hover:text-[#09080D] text-white border-2 border-[#09080D] shadow-[3px_3px_0px_#09080D] text-[11px] font-display tracking-wider transition"
                    >
                      <span>Live app</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* PANEL #04 (Spans 5 Cols): Interactive Socket.io Duplex Cannon */}
          <div className="col-span-12 sm:col-span-5 comic-starburst p-4 flex flex-col justify-between gap-3 relative">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-display tracking-wider text-[#F2C94C] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#10b981] border border-[#09080D] inline-block animate-ping" />
                  Panel #04 // duplex cannon
                </span>
                <span className="text-xs font-display bg-[#E62E25] text-white px-2 py-0.5 border border-[#09080D]">
                  &lt;15 ms sync
                </span>
              </div>
              <p className="text-xs comic-dialogue-text text-[#F3E7D3] bg-[#09080D]/80 p-2 border-2 border-[#09080D]">
                {eventLog}
              </p>
            </div>
            <button
              onClick={emitWebSocketEvent}
              disabled={isEmitting}
              className="comic-gold-btn w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isEmitting ? 'Zap! Transmitting...' : 'Fire duplex payload!'}</span>
            </button>
          </div>

          {/* PANEL #05 (Spans 7 Cols): Verified Mahara-Tech (ITI) Certifications Panel */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-slash-right pt-6 pb-4 px-4 flex flex-col justify-between relative">
            <span className="comic-panel-number">Panel #05 // guild seals</span>
            <span className="comic-sfx-alt absolute -top-3.5 right-3 text-xs">
              CERTIFIED!!
            </span>
            <div className="flex items-center gap-2.5 mb-2 mt-1">
              <div className="p-2 bg-[#F2C94C] text-[#09080D] border-2 border-[#09080D] shadow-[3px_3px_0px_#09080D] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-display tracking-wider text-[#F3E7D3]">
                  Verified engineering certifications
                </div>
                <div className="text-xs font-display tracking-widest text-[#F2C94C]">
                  Mahara-Tech (ITI) // official credentials
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs comic-dialogue-text text-[#09080D] bg-[#F3E7D3] p-2.5 border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D]">
              <div className="flex items-center justify-between">
                <span>★ MERN-stack development (Aug 2024 – Jan 2025)</span>
                <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5 text-[10px]">Verified</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#09080D]/30 pt-1">
                <span>★ Cyber security &amp; ethical hacking (Aug 2023 – Nov 2023)</span>
                <span className="bg-[#E62E25] text-white px-2 py-0.5 text-[10px]">Hardened</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
