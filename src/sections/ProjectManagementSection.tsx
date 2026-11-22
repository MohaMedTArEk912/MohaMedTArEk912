import { useState } from 'react';
import { Target, CheckSquare, FastForward, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audio';
import { StageGridHeader } from '../components/dom/StageGridHeader';

export function ProjectManagementSection() {
  const [velocity, setVelocity] = useState(85);

  const roles = [
    {
      panelNo: 'PANEL #01 // NATIONAL COHORT COMMAND',
      sfx: 'ACTIVE COMMAND!!',
      title: 'Project Coordinator — Eyouth · Digilians',
      timeline: 'MAY 2026 – PRESENT',
      spanClass: 'col-span-12 panel-slash-left comic-speedlines',
      desc: 'Orchestrating cross-functional workflows, sprint schedules, and stakeholder alignment across national engineering cohorts!',
      tag: 'Active leadership',
      badgeBg: 'bg-[#F2C94C] text-[#09080D]',
    },
    {
      panelNo: 'PANEL #02 // 5-DEV SQUAD',
      sfx: '100% PR GATE!!',
      title: 'Team lead — library management system',
      timeline: '5-MEMBER SQUAD',
      spanClass: 'col-span-12 sm:col-span-5 panel-tilt-left',
      desc: 'Directed a 5-member engineering team through task distribution, code reviews, milestone tracking & React + Tailwind architecture!',
      tag: 'Team lead',
      badgeBg: 'bg-[#10b981] text-[#09080D]',
    },
    {
      panelNo: 'PANEL #03 // 6-DEV GRADUATION SQUAD',
      sfx: 'SHIPPED!!',
      title: 'Project team lead — Akasha AI platform (6 devs)',
      timeline: 'OCT 2025 – MAY 2026',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-right',
      desc: 'Led the 6-engineer Akasha graduation project squad from system architecture & schema design to full-stack integration & Git workflows!',
      tag: 'Graduation lead',
      badgeBg: 'bg-[#E62E25] text-white',
    },
  ];

  const kanbanItems = [
    {
      id: 1,
      title: 'Architectural spec & schema review',
      status: velocity > 40 ? 'DONE // MERGED' : 'IN REVIEW',
      lane: velocity > 40 ? 'SHIPPED!!' : 'WIP',
    },
    {
      id: 2,
      title: 'Full-stack API & DB integration',
      status: velocity > 70 ? 'DONE // LIVE' : 'TESTING',
      lane: velocity > 70 ? 'SHIPPED!!' : 'QA',
    },
    {
      id: 3,
      title: 'Real-time WebSocket duplex sync',
      status: velocity > 90 ? 'DONE // <15MS' : 'ACTIVE',
      lane: velocity > 90 ? 'SHIPPED!!' : 'IN DEV',
    },
  ];

  const handleSliderChange = (val: number) => {
    setVelocity(val);
    if (val % 20 === 0) {
      audioManager.playSfx('key');
    }
  };

  return (
    <section
      id="sec-pm"
      data-layout="stage-left"
      className="stage-section relative overflow-hidden"
    >
      {/* Spread 05 Header */}
      <StageGridHeader
        sector="SPREAD 05 // THE WAR ROOM: AGILE COMMAND (05 PM)"
        corridor="Stage left (cols 1-5 avatar)"
        badge="Eyouth • library • Akasha"
      />

      {/* Content Column on Right (Cols 6-12) */}
      <div className="stage-content flex flex-col items-start z-10 w-full gap-4">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <Target className="w-4 h-4" />
              <span>Chapter V // agile command &amp; squad leadership</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="runic-spread-title text-3xl sm:text-5xl block">
            The war room: agile command
          </h2>

          {/* Speech Bubble Pointing Left Toward the 3D Avatar in Cols 1-5 */}
          <div className="comic-speech-bubble comic-speech-bubble-left w-full relative">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#8C1410] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
              <span>💬 Squad commander Mohamed rallies the team:</span>
              <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5">Spread #05</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text">
              &ldquo;Bridging deep architecture and <span className="bg-[#F2C94C] px-1 border border-[#09080D]">agile execution</span>! Coordinating national cohorts at <span className="text-[#E62E25] underline">Eyouth (Digilians)</span>, leading 5–6 dev squads, and shipping production code on schedule!&rdquo;
            </p>
          </div>
        </div>

        {/* UNORDINARY 12-COLUMN ASYMMETRIC WAR ROOM MOSAIC GRID */}
        <div className="unordinary-comic-grid pt-2">
          {roles.map((r) => (
            <div
              key={r.title}
              className={`${r.spanClass} comic-panel-frame pt-6 pb-4 px-4 relative flex flex-col justify-between`}
            >
              <span className="comic-panel-number">{r.panelNo}</span>
              <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
                {r.sfx}
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <span className="text-xs font-display tracking-wider text-[#F2C94C]">{r.timeline}</span>
                  <span
                    className={`text-[10.5px] font-display tracking-wider px-2.5 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] ${r.badgeBg}`}
                  >
                    {r.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-display tracking-wider text-[#F3E7D3] mb-1.5">
                  {r.title}
                </h3>
                <p className="text-xs text-[#CBC0E3] comic-dialogue-text">{r.desc}</p>
              </div>
            </div>
          ))}

          {/* PANEL #04 (Spans 12 Cols): Interactive Sprint Velocity Throttle & Tilted Kanban Frames */}
          <div className="col-span-12 comic-panel-frame panel-slash-right pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">Panel #04 // interactive sprint velocity throttle</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 mt-1">
              <span className="text-xs font-display tracking-wider text-[#F2C94C] flex items-center gap-2">
                <FastForward className="w-4 h-4" />
                <span>Drag the throttle to accelerate sprint milestone dispatch:</span>
              </span>
              <div className="font-display text-sm tracking-wider bg-[#09080D] px-3 py-0.5 border-2 border-[#F2C94C] text-[#F3E7D3]">
                Velocity: <span className="text-[#F2C94C]">{velocity}% Throughput</span>
              </div>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              value={velocity}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-[#09080D] border-2 border-[#F2C94C] appearance-none cursor-pointer accent-[#E62E25] mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {kanbanItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 bg-[#09080D] border-3 border-[#F3E7D3] shadow-[5px_5px_0px_#E62E25] flex flex-col justify-between ${
                    idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-display tracking-wider text-[#CBC0E3] mb-1 border-b border-[#5B3E96] pb-1">
                    <span>Ticket #0{item.id}</span>
                    <span
                      className={
                        item.lane === 'SHIPPED!!'
                          ? 'bg-[#10b981] text-[#09080D] px-2 py-0.5'
                          : 'bg-[#F2C94C] text-[#09080D] px-2 py-0.5'
                      }
                    >
                      {item.lane}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-display tracking-wider text-[#F3E7D3] mb-2">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-display tracking-wider text-[#F2C94C]">
                    <CheckSquare
                      className={`w-4 h-4 ${item.lane === 'SHIPPED!!' ? 'text-[#10b981]' : 'text-[#F2C94C]'}`}
                    />
                    <span>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
