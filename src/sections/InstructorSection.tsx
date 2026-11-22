import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audio';
import { StageGridHeader } from '../components/dom/StageGridHeader';

export function InstructorSection() {
  const [activeConcept, setActiveConcept] = useState<{
    token: string;
    sfx: string;
    title: string;
    howItWorks: string;
    studentTakeaway: string;
  }>({
    token: 'async',
    sfx: 'NON-BLOCKING!!',
    title: 'Asynchronous event loop mechanics',
    howItWorks:
      'Offloads I/O tasks to background worker threads, pushing completed callbacks into the microtask queue without blocking the main render loop!',
    studentTakeaway:
      'Teaches students how Node.js achieves massive concurrency with non-blocking single-threaded event architectures!',
  });

  const tokens = [
    {
      token: 'async',
      sfx: 'NON-BLOCKING!!',
      title: 'Asynchronous event loop mechanics',
      howItWorks: 'Offloads I/O tasks to worker pools, queuing resolved callbacks into microtask queues!',
      studentTakeaway: 'Demystifies non-blocking I/O, promises, and race-condition prevention!',
    },
    {
      token: 'yield',
      sfx: 'PAUSED & RESUMED!!',
      title: 'Generator functions & coroutines',
      howItWorks: 'Preserves execution frame state between iterations, pausing and resuming on-demand!',
      studentTakeaway: 'Teaches memory-efficient infinite stream processing and custom iterators!',
    },
    {
      token: 'struct',
      sfx: 'L1 CACHE HIT!!',
      title: 'Data layout & memory locality',
      howItWorks: 'Contiguous memory layout optimizing l1/l2 cache line hits and avoiding heap fragmentation!',
      studentTakeaway: 'Builds intuition for hardware-level cache performance and memory safety!',
    },
    {
      token: 'class',
      sfx: 'POLYMORPHIC!!',
      title: 'OOP encapsulation & polymorphism',
      howItWorks: 'Encapsulates data members with virtual method tables enabling dynamic dispatch!',
      studentTakeaway: 'Inculcates SOLID principles and clean extensible design hierarchies!',
    },
    {
      token: 'fn',
      sfx: 'LEXICAL CLOSURE!!',
      title: 'First-class functions & closures',
      howItWorks: 'Lexical scoping captures variables in heap-allocated execution environments!',
      studentTakeaway: 'Empowers functional paradigms, currying, and composable middleware design!',
    },
  ];

  const handleTokenClick = (tok: typeof activeConcept) => {
    audioManager.playSfx('key');
    setActiveConcept(tok);
  };

  return (
    <section
      id="sec-instructor"
      data-layout="stage-right"
      className="stage-section relative overflow-hidden"
    >
      {/* Spread 04 Header */}
      <StageGridHeader
        sector="SPREAD 04 // THE GRAND MENTOR'S DOJO (04 INSTRUCTOR)"
        corridor="Stage right (cols 8-12 avatar)"
        badge="100+ students mentored"
      />

      {/* Content Column on the LEFT (Cols 1-7) */}
      <div className="stage-content flex flex-col items-start z-10 w-full gap-4">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Chapter IV // pedagogy &amp; community mentorship</span>
            </div>
          </div>

          <h2 className="runic-spread-title text-3xl sm:text-5xl block">
            The grand mentor&apos;s dojo
          </h2>

          {/* Speech Bubble Pointing Right Toward the 3D Avatar in Cols 8-12 */}
          <div className="comic-speech-bubble comic-speech-bubble-right w-full relative">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#E62E25] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
              <span>💬 Sensei Mohamed instructs the cohort:</span>
              <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5">Spread #04</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text">
              &ldquo;I taught more than <span className="text-[#E62E25] underline">100 aspiring engineers</span> to apply clean coding practices, object-oriented programming, and algorithms through hands-on exercises.&rdquo;
            </p>
          </div>
        </div>

        {/* UNORDINARY 12-COLUMN ASYMMETRIC DOJO MOSAIC GRID */}
        <div className="unordinary-comic-grid pt-2">
          {/* PANEL #01 (Spans 7 Cols): 3C School Teaching Role Comic Panel */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-tilt-left comic-speedlines pt-6 pb-4 px-4 relative flex flex-col justify-between">
            <span className="comic-panel-number">Panel #01 // 3C School dojo</span>
            <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
              LEVEL UP!!
            </span>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                <h3 className="text-lg sm:text-xl font-display tracking-wider text-[#F3E7D3]">
                  Programming instructor — 3C School
                </h3>
                <span className="text-xs font-display tracking-wider px-2.5 py-0.5 border-2 border-[#09080D] bg-[#F2C94C] text-[#09080D] shadow-[2px_2px_0px_#09080D]">
                  Jun 2025 – May 2026
                </span>
              </div>
              <p className="text-xs text-[#CBC0E3] comic-dialogue-text">
                Instructed cohorts of aspiring developers in programming fundamentals, clean code practices, object-oriented principles, and algorithmic problem-solving! Authored interactive curriculum modules &amp; conducted live code reviews!
              </p>
            </div>
          </div>

          {/* PANEL #02 (Spans 5 Cols): 3 Stacked Starburst Impact Panels */}
          <div className="col-span-12 sm:col-span-5 grid grid-cols-3 sm:grid-cols-1 gap-2.5">
            <div className="comic-starburst p-3 flex items-center justify-between">
              <span className="text-xs font-display tracking-wider text-[#CBC0E3]">Students mentored</span>
              <span className="text-xl sm:text-2xl font-display text-[#F2C94C]">100+</span>
            </div>
            <div className="comic-starburst p-3 flex items-center justify-between">
              <span className="text-xs font-display tracking-wider text-[#CBC0E3]">Projects guided</span>
              <span className="text-xl sm:text-2xl font-display text-[#10b981]">20+</span>
            </div>
            <div className="comic-starburst p-3 flex items-center justify-between">
              <span className="text-xs font-display tracking-wider text-[#CBC0E3]">Dojo tenure</span>
              <span className="text-xl sm:text-2xl font-display text-[#E62E25]">12 mos</span>
            </div>
          </div>

          {/* PANEL #03 (Spans 12 Cols): Interactive Syntax Token Explorer with Split Sub-Panels */}
          <div className="col-span-12 comic-panel-frame panel-slash-left pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">Panel #02 // interactive syntax token spellbook</span>
            <span className="comic-sfx-alt absolute -top-3.5 right-3 text-xs">
              {activeConcept.sfx}
            </span>

            <div className="flex items-center justify-between mb-3 mt-1">
              <span className="text-xs font-display tracking-wider text-[#F2C94C] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Click a compiler token to deconstruct its secret technique:</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-4">
              {tokens.map((tok, i) => (
                <button
                  key={tok.token}
                  onClick={() => handleTokenClick(tok)}
                  className={`px-4 py-1.5 border-3 font-display text-sm tracking-wider transition cursor-pointer ${
                    i % 2 === 0 ? '-rotate-2' : 'rotate-2'
                  } ${
                    activeConcept.token === tok.token
                      ? 'bg-[#F2C94C] border-[#09080D] text-[#09080D] shadow-[5px_5px_0px_#E62E25] -translate-y-1'
                      : 'bg-[#09080D] border-[#F3E7D3] text-[#F3E7D3] shadow-[3px_3px_0px_#09080D] hover:border-[#F2C94C]'
                  }`}
                >
                  <code>{tok.token}</code>
                </button>
              ))}
            </div>

            {/* Asymmetric 7:5 Split Explanation Comic Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 comic-narrator-box p-3.5">
                <div className="text-xs font-display tracking-wider text-[#8C1410] mb-1">
                  ★ {activeConcept.title} — under the hood:
                </div>
                <p className="text-xs text-[#09080D] comic-dialogue-text">
                  {activeConcept.howItWorks}
                </p>
              </div>
              <div className="sm:col-span-5 bg-[#09080D] border-3 border-[#F2C94C] shadow-[5px_5px_0px_#E62E25] p-3.5 rotate-1">
                <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-1">
                  ⚡ Student mental model power-up:
                </div>
                <p className="text-xs text-[#F3E7D3] comic-dialogue-text">
                  {activeConcept.studentTakeaway}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
