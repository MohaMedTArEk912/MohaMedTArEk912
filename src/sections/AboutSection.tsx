import { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Terminal,
  Award,
  Sparkles,
  FileText,
  Cpu,
  BookOpen,
  Search,
  ScrollText,
} from 'lucide-react';
import { audioManager } from '../utils/audio';
import { MetaPersonCreatorModal } from '../components/dom/MetaPersonCreatorModal';
import { AudioSynthesizer } from '../components/dom/AudioSynthesizer';
import { smoothScrollTo } from '../hooks/useLenisGSAP';
import { StageGridHeader } from '../components/dom/StageGridHeader';
import { useCommandStore } from '../store/useCommandStore';

const COMIC_AGENDA_CHAPTERS = [
  {
    index: 0,
    id: 'sec-about',
    page: 'PG. 01',
    title: 'Throne of origin',
    tag: 'Cover & dossier',
    span: 'col-span-6 sm:col-span-5 -rotate-1',
    tone: 'bg-[#E62E25] text-white',
  },
  {
    index: 1,
    id: 'sec-swe',
    page: 'PG. 02',
    title: 'Algorithmic forge',
    tag: 'SWE & HLD/LLD',
    span: 'col-span-6 sm:col-span-7 rotate-1',
    tone: 'bg-[#120F1A] text-[#F3E7D3]',
  },
  {
    index: 2,
    id: 'sec-fullstack',
    page: 'PG. 03',
    title: 'Full-stack arsenal',
    tag: 'MERN & Socket.IO',
    span: 'col-span-6 sm:col-span-7 -rotate-0.5',
    tone: 'bg-[#2A194D] text-[#F3E7D3]',
  },
  {
    index: 3,
    id: 'sec-projects',
    page: 'PG. 04',
    title: 'Codex Akasha',
    tag: '4 case studies',
    span: 'col-span-6 sm:col-span-5 rotate-1',
    tone: 'bg-[#F2C94C] text-[#09080D]',
  },
  {
    index: 4,
    id: 'sec-instructor',
    page: 'PG. 05',
    title: "Mentor's dojo",
    tag: '3C School • 100+ devs',
    span: 'col-span-6 sm:col-span-5 -rotate-1',
    tone: 'bg-[#2A194D] text-[#F3E7D3]',
  },
  {
    index: 5,
    id: 'sec-pm',
    page: 'PG. 06',
    title: 'Agile war room',
    tag: 'Eyouth & squad lead',
    span: 'col-span-6 sm:col-span-7 rotate-0.5',
    tone: 'bg-[#120F1A] text-[#F3E7D3]',
  },
  {
    index: 6,
    id: 'sec-contact',
    page: 'PG. 07',
    title: 'Dispatch sanctum',
    tag: 'Zsh CLI & comms',
    span: 'col-span-12 rotate-0.5',
    tone: 'bg-[#E62E25] text-white',
  },
];

export function AboutSection() {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const {
    toggleViewMode,
    readerMode,
    toggleReaderMode,
    setActiveIssueIndex,
    toggleCommandPalette,
  } = useCommandStore();

  const jumpToChapter = (id: string, index: number) => {
    audioManager.playSfx('warp');
    if (readerMode === 'flip') {
      setActiveIssueIndex(index);
    } else {
      smoothScrollTo(`#${id}`);
    }
  };

  return (
    <section
      id="sec-about"
      data-section="00-origin"
      className="stage-section relative overflow-hidden"
    >
      {/* Issue #2026 Front Cover Header */}
      <StageGridHeader
        sector="ISSUE #2026 // 00 ORIGIN — FRONT COVER & ISSUE AGENDA"
        corridor="Cols 7-9 coding stage"
        badge="Cairo, Egypt • full-stack software architect"
      />

      {/* Sulfur-Gold Ambient Aura Illumination */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-[#F2C94C]/10 rounded-full blur-[140px] pointer-events-none animate-neon-aura" />

      {/* =====================================================================
          LEFT COLUMN (Cols 1-6): FRONT COVER COLLAGE & FIRST-PAGE ISSUE AGENDA
          ===================================================================== */}
      <div className="origin-hero stage-content flex flex-col items-start z-10 gap-3.5">
        {/* PANEL #01: Cover Masthead Frame with Tilted SFX Sticker */}
        <div className="comic-panel-frame comic-speedlines panel-tilt-left w-full relative pt-5 pb-3.5 px-4 sm:px-5">
          <span className="comic-panel-number">Panel #01 // the protagonist</span>
          <span className="comic-sfx absolute -top-3.5 right-3 text-xs sm:text-sm">
            POW!! CLEAN CODE!
          </span>

          {/* Vintage Comic Authority Stamp */}
          <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-0.5 bg-[#09080D] border-2 border-[#F2C94C] text-[#F2C94C] font-display text-xs tracking-wider mb-1.5">
            <span className="w-2 h-2 bg-[#E62E25] rotate-45 inline-block" />
            <span>Approved by the software engineering guild • military exempt</span>
          </div>

          {/* Massive 3D Extruded Crimson Runic Hero Title */}
          <h1 className="runic-hero-title text-4xl sm:text-6xl lg:text-[4rem] leading-[0.94] mb-2 block">
            Mohamed Tarek Hussien
          </h1>

          <div className="comic-caption-tag text-xs sm:text-sm">
            <span>Full-stack MERN architect &amp; software engineer</span>
          </div>
        </div>

        {/* PANEL #02: Comic Speech Bubble Pointing Right Toward the 3D Avatar */}
        <div className="comic-speech-bubble comic-speech-bubble-right w-full relative py-3 px-4">
          <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#E62E25] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
            <span>💬 Mohamed speaks from the coding stage (Helwan univ. CS &amp; AI):</span>
            <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5 text-[10px]">Panel #02</span>
          </div>
          <p className="text-xs text-[#09080D] comic-dialogue-text">
            &ldquo;Welcome to <span className="text-[#E62E25] underline decoration-2">The Architect Chronicles</span>. Pick a chapter below to explore my full-stack MERN applications, real-time systems, and software architecture work.&rdquo;
          </p>
        </div>

        {/* UNORDINARY 12-COLUMN ASYMMETRIC COMIC MOSAIC GRID (7:5 + 5:7 Staggered Spans) */}
        <div className="unordinary-comic-grid">
          {/* PANEL #03: Spans 7 Columns */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-slash-left comic-speedlines p-3 relative">
            <span className="comic-panel-number">Panel #03 // full-stack mastery</span>
            <span className="comic-sfx-alt absolute -bottom-2.5 right-2 text-[10px]">
              ZAP!! CERTIFIED!
            </span>
            <div className="flex items-center justify-between text-[#F2C94C] mt-1">
              <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                ★ Mahara-Tech (ITI) honors &amp; certifications
              </span>
              <Award className="w-4 h-4 text-[#F2C94C] shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-display text-[#F3E7D3] tracking-wide">
              MERN stack &amp; network security
            </div>
            <p className="text-[10.5px] comic-dialogue-text text-[#CBC0E3]">
              React 19, Node.js, Express, MongoDB, Neo4j &amp; ethical hacking!
            </p>
          </div>

          {/* PANEL #04: Spans 5 Columns */}
          <div className="col-span-12 sm:col-span-5 comic-panel-frame panel-tilt-right p-3 relative bg-[#2A194D]">
            <span className="comic-panel-number-crimson">Panel #04</span>
            <div className="flex items-center justify-between text-[#CBC0E3] mt-1">
              <span className="text-xs font-display text-[#F2C94C]">Citadel of origin</span>
              <Cpu className="w-4 h-4 text-[#F2C94C] shrink-0" />
            </div>
            <div className="text-base font-display text-[#F3E7D3]">
              Helwan University
            </div>
            <div className="text-[10.5px] comic-dialogue-text text-[#DF9A78]">
              B.sc. Software eng. (CS &amp; AI)
            </div>
          </div>

          {/* PANEL #05: Spans 5 Columns */}
          <div className="col-span-12 sm:col-span-5 comic-starburst p-3 relative">
            <div className="flex items-center justify-between text-[#F2C94C]">
              <span className="text-xs font-display text-[#CBC0E3]">Panel #05 // speed</span>
              <Zap className="w-4 h-4 text-[#10b981] shrink-0" />
            </div>
            <div className="text-lg font-display text-[#10b981] tracking-wider">
              &lt;15 ms socket sync
            </div>
            <div className="text-[10px] comic-dialogue-text text-[#F3E7D3]">
              Real-time WebSockets &amp; polyglot DBs
            </div>
          </div>

          {/* PANEL #06: Spans 7 Columns */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-slash-right p-3 relative">
            <span className="comic-panel-number">Panel #06 // guild command</span>
            <div className="flex items-center justify-between text-[#DF9A78] mt-1">
              <span className="text-xs font-display text-[#F2C94C]">
                Eyouth coordinator &amp; 3C mentor
              </span>
              <Terminal className="w-4 h-4 text-[#E62E25] shrink-0" />
            </div>
            <div className="text-base font-display text-[#F3E7D3]">
              100+ engineers trained &amp; 6-dev squad lead
            </div>
            <div className="text-[10.5px] comic-dialogue-text text-[#CBC0E3]">
              Akasha platform, library system &amp; Digilians cohorts!
            </div>
          </div>
        </div>

        {/* =================================================================
            PANEL #07: FIRST-PAGE COMIC ISSUE AGENDA (REPLACES TOP NAVBAR!)
            ================================================================= */}
        <div className="comic-panel-frame panel-tilt-left w-full pt-6 pb-4 px-4 relative">
          <span className="comic-panel-number">Panel #07 // first-page issue agenda (table of contents)</span>
          <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
            7 SPREADS INSIDE!!
          </span>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 mt-1">
            <div className="text-xs font-display tracking-wider text-[#F2C94C]">
              ★ Click any comic panel below to warp directly to that spread:
            </div>
            <span className="text-[10px] font-display tracking-widest bg-[#F3E7D3] text-[#09080D] px-2 py-0.5 border border-[#09080D]">
              Index // issue #2026
            </span>
          </div>

          {/* Unordinary Staggered 12-Col Agenda Grid (5:7 and 7:5 alternating spans) */}
          <div className="grid grid-cols-12 gap-2">
            {COMIC_AGENDA_CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => jumpToChapter(ch.id, ch.index)}
                className={`${ch.span} ${ch.tone} agenda-chapter-card p-2 border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] hover:shadow-[6px_6px_0px_#F2C94C] hover:-translate-y-0.5 transition text-left cursor-pointer flex items-center justify-between gap-2`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-[#09080D] text-[#F2C94C] font-display text-[10px] tracking-wider">
                      {ch.page}
                    </span>
                    <span className="text-xs sm:text-sm font-display tracking-wider truncate">
                      {ch.title}
                    </span>
                  </div>
                  <div className="text-[9.5px] font-display tracking-widest opacity-85 truncate mt-0.5">
                    // {ch.tag}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================================
          RIGHT COLUMN (Cols 10-12): HERO DOSSIER & MASTER CONTROL DECK
          (Leaving Cols 7-9 100% Open for the 3D Avatar & 3D Keycaps!)
          ===================================================================== */}
      <div className="origin-dossier stage-content flex flex-col items-center lg:items-end z-10 mt-6 lg:mt-0 gap-4">
        {/* PANEL #08: Classified Hero Trading Card */}
        <div className="comic-panel-frame panel-tilt-right comic-speedlines p-4 w-full max-w-[335px] relative">
          <span className="comic-panel-number">Panel #08 // hero dossier</span>
          <span className="comic-sfx absolute -top-4 -right-2 text-xs">
            ZAP!! LIVE!
          </span>

          {/* Top Classified Stamp Bar */}
          <div className="flex items-center justify-between border-b-3 border-[#09080D] pb-2 mb-3 mt-2">
            <span className="px-2 py-0.5 bg-[#E62E25] text-white font-display text-xs tracking-wider border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D]">
              Top secret card
            </span>
            <span className="text-xs font-display text-[#F2C94C] tracking-widest">
              Issue #mth-2026
            </span>
          </div>

          {/* Halftone Ink Portrait & Operator Specs */}
          <div className="flex items-center gap-3 mb-3 bg-[#09080D]/85 p-2.5 border-3 border-[#09080D] shadow-[4px_4px_0px_#E62E25] -skew-x-2">
            <div className="relative w-14 h-14 border-3 border-[#F2C94C] shadow-[3px_3px_0px_#09080D] overflow-hidden shrink-0 rotate-2">
              <img
                src={`${import.meta.env.BASE_URL}profile.jpg`}
                alt="Mohamed Tarek Hussien"
                className="w-full h-full object-cover object-top contrast-125 saturate-90"
              />
              <div className="absolute inset-0 halftone-bg opacity-35 pointer-events-none" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-display text-[#F3E7D3] tracking-wider truncate">
                Mohamed Tarek
              </div>
              <div className="text-[10.5px] font-display text-[#F2C94C] flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-[#10b981] border border-[#09080D] inline-block animate-ping" />
                <span>Lvl 99 architect</span>
              </div>
              <div className="text-[10px] comic-dialogue-text text-[#CBC0E3] mt-0.5">
                Specialty: MERN + system design
              </div>
            </div>

            <button
              onClick={() => {
                audioManager.playSfx('warp');
                setIsStudioOpen(true);
              }}
              title="Customize 3D Avatar in Studio"
              className="ml-auto p-1.5 bg-[#F2C94C] hover:bg-[#E62E25] border-2 border-[#09080D] text-[#09080D] hover:text-white shadow-[2px_2px_0px_#09080D] transition cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Staggered Comic Stat Bars */}
          <div className="space-y-1.5 mb-3">
            <div className="bg-[#F3E7D3] text-[#09080D] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] px-2.5 py-1 -rotate-1 flex items-center justify-between">
              <span className="text-[10.5px] font-display tracking-wider text-[#8C1410]">Power class:</span>
              <span className="text-xs font-display tracking-wider bg-[#09080D] text-[#F2C94C] px-2 py-0.5">
                Full-stack &amp; SWE
              </span>
            </div>
            <div className="bg-[#2A194D] text-[#F3E7D3] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] px-2.5 py-1 rotate-1 flex items-center justify-between">
              <span className="text-[10.5px] font-display tracking-wider text-[#F2C94C]">Real-time engine:</span>
              <span className="text-xs font-display tracking-wider text-[#10b981]">
                &lt;15 ms Socket.IO
              </span>
            </div>
          </div>

          {/* ===============================================================
              FIRST-PAGE MASTER CONTROL DECK (REPLACES ALL NAVBAR CONTROLS!)
              =============================================================== */}
          <div className="border-t-3 border-[#09080D] pt-3 space-y-2">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#F2C94C]">
              <span>★ Issue #2026 control deck</span>
              <AudioSynthesizer />
            </div>

            {/* Primary Reader Mode Switcher */}
            <button
              onClick={toggleReaderMode}
              className="comic-gold-btn w-full py-2 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {readerMode === 'scroll' ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Switch to comic page-flip mode</span>
                </>
              ) : (
                <>
                  <ScrollText className="w-4 h-4" />
                  <span>Switch to vertical scroll mode</span>
                </>
              )}
            </button>

            {/* Asymmetric Comic Control Stamps */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  audioManager.playSfx('click');
                  toggleViewMode();
                }}
                className="flex-1 p-2 bg-[#F3E7D3] hover:bg-[#F2C94C] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] font-display text-xs tracking-wider text-[#09080D] flex items-center justify-center gap-1.5 cursor-pointer -rotate-1"
              >
                <FileText className="w-3.5 h-3.5 text-[#E62E25]" />
                <span>2D dossier CV</span>
              </button>
              <button
                onClick={() => jumpToChapter('sec-contact', 6)}
                className="px-2.5 py-2 bg-[#10b981] hover:bg-[#F2C94C] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] text-[#09080D] font-display text-xs tracking-wider flex items-center gap-1 cursor-pointer rotate-1"
                title="Jump to Interactive ZSH Terminal"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Zsh CLI</span>
              </button>
              <button
                onClick={toggleCommandPalette}
                className="px-2.5 py-2 bg-[#09080D] hover:bg-[#5B3E96] border-3 border-[#F3E7D3] text-[#F2C94C] font-display text-xs tracking-wider flex items-center gap-1 cursor-pointer -rotate-1"
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span>⌘K</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MetaPerson Avatar SDK Studio Modal */}
      <MetaPersonCreatorModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </section>
  );
}
