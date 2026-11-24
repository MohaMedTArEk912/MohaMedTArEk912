import { useState } from 'react';
import {
  Printer,
  Compass,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  MapPin,
  Code2,
  Globe,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Database,
  BookOpen,
  GitBranch,
  FileCheck2,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import { ProfessionalBlackWhiteResume } from '../resume/ProfessionalBlackWhiteResume';
import { getPlainTextResume, resumeUrl } from '../resume/resumeData';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export function Executive2DResumeView() {
  const { viewMode, toggleViewMode } = useCommandStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resumeCopyStatus, setResumeCopyStatus] = useState('');
  const [resumeFormat, setResumeFormat] = useState<'bw' | 'comic'>('bw');

  if (viewMode !== '2d-executive') return null;

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const handleReturn3D = () => {
    sounds.playWarp();
    toggleViewMode();
  };

  const copyText = (text: string, key: string) => {
    sounds.playSuccess();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyPlainTextResume = async () => {
    try {
      await navigator.clipboard.writeText(getPlainTextResume());
      sounds.playSuccess();
      setResumeCopyStatus('Copied');
    } catch {
      setResumeCopyStatus('Copy failed');
    }
    setTimeout(() => setResumeCopyStatus(''), 2000);
  };

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#09080D] text-[#F3E7D3] selection:bg-[#F2C94C]/30 selection:text-[#F2C94C] print:hidden custom-scrollbar overscroll-contain"
    >
      {/* Subtle Halftone & Cross-Hatch Graphic Novel Overlay */}
      <div className="fixed inset-0 bg-grid-mesh pointer-events-none z-0 opacity-75 print:hidden" />

      {/* =====================================================================
          TOP PULP COMIC MASTHEAD CONTROL BAR (HIDDEN IN PRINT)
          ===================================================================== */}
      <nav className="sticky top-0 z-50 bg-[#120F1A]/95 backdrop-blur-md border-b-4 border-[#09080D] outline-2 outline-[#F2C94C] px-3 sm:px-6 py-2.5 print:hidden shadow-[0_6px_0_#09080D]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider -rotate-2 shrink-0 font-bold">
              Dossier
            </span>
            <span className="font-display text-xs sm:text-base tracking-wider text-[#F3E7D3] truncate font-bold">
              Mohamed Tarek <span className="text-[#F2C94C] hidden md:inline">· Résumé</span>
            </span>
          </div>

          {/* Center Format Switcher */}
          <div className="flex items-center bg-[#09080D] p-1 border-2 border-[#F2C94C] shadow-[2px_2px_0px_#09080D] shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                setResumeFormat('bw');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-display tracking-wider flex items-center gap-1.5 transition cursor-pointer font-bold ${
                resumeFormat === 'bw'
                  ? 'bg-white text-black shadow-[2px_2px_0px_#000]'
                  : 'text-[#CBC0E3] hover:text-white'
              }`}
              title="View black-and-white résumé"
              aria-pressed={resumeFormat === 'bw'}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Black &amp; white</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setResumeFormat('comic');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-display tracking-wider flex items-center gap-1.5 transition cursor-pointer font-bold ${
                resumeFormat === 'comic'
                  ? 'bg-[#F2C94C] text-[#09080D] shadow-[2px_2px_0px_#09080D]'
                  : 'text-[#CBC0E3] hover:text-white'
              }`}
              title="View stylized graphic novel comic dossier"
              aria-pressed={resumeFormat === 'comic'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D comic</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="comic-gold-btn flex items-center gap-1.5 px-3 py-1 text-xs cursor-pointer font-bold"
              title="Print directly or save as clean monochrome PDF"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print</span>
            </button>

            <button
              onClick={handleReturn3D}
              className="comic-action-btn flex items-center gap-1.5 px-3 py-1 text-xs cursor-pointer font-bold"
              title="Return to the 3D Comic Book Workspace"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">3D</span>
              <span>Stage</span>
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================================
          RENDER SELECTED VIEW MODE (EXECUTIVE B&W VS COMIC DOSSIER)
          ===================================================================== */}
      {resumeFormat === 'bw' ? (
        <div className="relative z-10 max-w-4xl mx-auto py-5 px-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onClick={copyPlainTextResume}
              className="comic-action-btn flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer font-bold"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy plain text</span>
            </button>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-gold-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer font-bold"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Open résumé page</span>
            </a>
            <span className="text-xs" role="status">{resumeCopyStatus}</span>
          </div>
          <ProfessionalBlackWhiteResume />
        </div>
      ) : (
        /* =====================================================================
            MAIN UNORDINARY COMIC DOSSIER SPREADS (ORIGINAL 2D COMIC EDITION)
            ===================================================================== */
        <main className="relative z-10 max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-7">
        {/* ===================================================================
            SPREAD #01: PROTAGONIST COVER & DIRECT COMMS (7:5 ASYMMETRIC GRID)
            =================================================================== */}
        <div className="unordinary-comic-grid">
          {/* PANEL #01 (Spans 7 Cols): Hero Masthead & Speech Bubble */}
          <div className="col-span-12 lg:col-span-7 comic-panel-frame panel-tilt-left comic-speedlines pt-6 pb-4 px-5 relative flex flex-col justify-between gap-3">
            <span className="comic-panel-number">Panel #01 // protagonist dossier</span>
            <span className="comic-sfx absolute -top-3.5 right-3 text-xs sm:text-sm">
              POW!! FULL-STACK!
            </span>

            <div>
              <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-0.5 bg-[#09080D] border-2 border-[#F2C94C] text-[#F2C94C] font-display text-xs tracking-wider mb-2 mt-1">
                <span className="w-2 h-2 bg-[#10b981] rotate-45 inline-block" />
                <span>Cairo, Egypt · Class of 2026</span>
              </div>

              <h1 className="runic-hero-title text-4xl sm:text-6xl leading-[0.94] mb-2 block">
                Mohamed Tarek Hussien
              </h1>

              <div className="comic-caption-tag text-xs sm:text-sm mb-2">
                <Code2 className="w-4 h-4" />
                <span>{PORTFOLIO_DATA.profile.title}</span>
              </div>

              <p className="text-xs font-display tracking-wider text-[#CBC0E3] flex flex-wrap items-center gap-2 mt-2">
                <MapPin className="w-3.5 h-3.5 text-[#F2C94C]" />
                <span>Cairo, Egypt</span>
                <span>•</span>
                <span className="text-[#10b981]">Exempt from military service</span>
                <span>•</span>
                <span className="text-[#F2C94C]">Helwan University (CS &amp; AI)</span>
              </p>
            </div>

            <div className="comic-speech-bubble p-3 mt-1">
              <p className="text-xs text-[#09080D] comic-dialogue-text">
                &ldquo;Explore the panels to see my <span className="bg-[#F2C94C] px-1 border border-[#09080D]">full-stack MERN applications</span>, real-time features built with Socket.IO, and software architecture work.&rdquo;
              </p>
            </div>
          </div>

          {/* PANEL #02 (Spans 5 Cols): Operator Trading Card & Direct Contact Stickers */}
          <div className="col-span-12 lg:col-span-5 comic-panel-frame panel-tilt-right pt-6 pb-4 px-5 relative flex flex-col justify-between gap-3">
            <span className="comic-panel-number-crimson">Panel #02 // direct uplink</span>
            <span className="comic-sfx-alt absolute -top-3.5 right-3 text-xs">
              ZAP!! VERIFIED!
            </span>

            <div className="flex items-center gap-3 bg-[#09080D]/90 p-2.5 border-3 border-[#09080D] shadow-[4px_4px_0px_#F2C94C] mt-1">
              <div className="relative w-14 h-14 border-3 border-[#F2C94C] overflow-hidden shrink-0 -rotate-2">
                <img
                  src={`${import.meta.env.BASE_URL}profile.jpg`}
                  alt="Mohamed Tarek Hussien"
                  className="w-full h-full object-cover object-top contrast-125"
                />
              </div>
              <div>
                <div className="text-sm font-display tracking-wider text-[#F3E7D3]">
                  Operator // Mohamed Tarek
                </div>
                <div className="text-xs font-display tracking-wider text-[#10b981]">
                  ● Available for immediate hire
                </div>
                <div className="text-[10.5px] comic-dialogue-text text-[#CBC0E3]">
                  Full-stack MERN • &lt;15 ms Socket.IO
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => copyText('mohaamedtariq12@gmail.com', 'email')}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-[#F3E7D3] text-[#09080D] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] hover:bg-[#F2C94C] transition cursor-pointer -rotate-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-[#E62E25] shrink-0" />
                  <span className="font-display text-xs tracking-wider truncate">
                    mohaamedtariq12@gmail.com
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#09080D] text-[#F2C94C] font-display text-[10px] tracking-wider shrink-0">
                  {copiedKey === 'email' ? 'Copied!' : 'Copy!'}
                </span>
              </button>

              <button
                onClick={() => copyText(PORTFOLIO_DATA.profile.phones[0], 'phone')}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-[#2A194D] text-[#F3E7D3] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] hover:bg-[#5B3E96] transition cursor-pointer rotate-0.5"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span className="font-display text-xs tracking-wider">
                    {PORTFOLIO_DATA.profile.phones[0]}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#09080D] text-[#10b981] font-display text-[10px] tracking-wider">
                  {copiedKey === 'phone' ? 'Copied!' : 'Copy!'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/MohaMedTArEk912"
                  target="_blank"
                  rel="noreferrer"
                  className="comic-action-btn flex items-center justify-between px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Code2 className="w-3.5 h-3.5 text-[#F2C94C] shrink-0" />
                    <span>GitHub</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <a
                  href="https://www.linkedin.com/in/mohamed-tarek-184510337/"
                  target="_blank"
                  rel="noreferrer"
                  className="comic-gold-btn flex items-center justify-between px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-[#E62E25] shrink-0" />
                    <span>LinkedIn</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SPREAD #02: ORIGIN STORY & ACADEMIC CITADEL (7:5 ASYMMETRIC SPLIT)
            =================================================================== */}
        <div className="unordinary-comic-grid">
          {/* PANEL #03 (Spans 7 Cols): About Me Narrator Box */}
          <section className="col-span-12 lg:col-span-7 comic-narrator-box p-5 relative">
            <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
              ORIGIN STORY!!
            </span>
            <div className="flex items-center gap-2 text-[#8C1410] font-display text-sm tracking-wider mb-2">
              <Zap className="w-4 h-4 text-[#E62E25]" />
              <span>Panel #03 // about the software architect</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text leading-relaxed">
              I build{' '}
              <span className="bg-[#F2C94C] px-1.5 border border-[#09080D]">
                full-stack applications
              </span>
              {' '}and design the systems behind them. I lead engineering teams and build real-time applications using the{' '}
              <span className="text-[#E62E25] underline">
                MERN stack (MongoDB, Express, React, and Node.js)
              </span>
              , TypeScript, and Socket.IO.
            </p>
          </section>

          {/* PANEL #04 (Spans 5 Cols): Education Citadel Panel */}
          <section className="col-span-12 lg:col-span-5 comic-panel-frame panel-slash-right pt-6 pb-4 px-5 relative flex flex-col justify-between">
            <span className="comic-panel-number">Panel #04 // citadel of learning</span>
            <div>
              <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mb-2 mt-1">
                <GraduationCap className="w-4 h-4 text-[#F2C94C]" />
                <span>Academic credentials</span>
              </div>
              <h3 className="text-base sm:text-lg font-display tracking-wider text-[#F3E7D3]">
                {PORTFOLIO_DATA.profile.education.degree}
              </h3>
              <p className="text-xs font-display tracking-wider text-[#F2C94C] mt-1">
                Helwan University · Faculty of Computers and Artificial Intelligence
              </p>
              <p className="text-xs comic-dialogue-text text-[#CBC0E3] mt-1">
                {PORTFOLIO_DATA.profile.education.department}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex items-center justify-between">
              <span className="text-xs font-display tracking-wider text-[#CBC0E3]">Class tenure:</span>
              <span className="px-2.5 py-0.5 bg-[#10b981] text-[#09080D] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider">
                2022 – 2026
              </span>
            </div>
          </section>
        </div>

        {/* ===================================================================
            SPREAD #03: KEY PROJECTS & SOFTWARE STATIONS (UNORDINARY 7:5 + 5:7)
            =================================================================== */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <Layers className="w-4 h-4" />
              <span>Chapter III // 4 verified production case studies</span>
            </div>
            <span className="text-xs font-display tracking-widest text-[#F2C94C] bg-[#09080D] px-3 py-1 border-2 border-[#F2C94C] -rotate-1">
              ★ All repositories public on GitHub ★
            </span>
          </div>

          <div className="unordinary-comic-grid pt-1">
            {/* 1. Akasha-Platform (Spans 7 Cols) */}
            <article className="col-span-12 lg:col-span-7 comic-panel-frame panel-tilt-left comic-speedlines pt-6 pb-4 px-5 relative flex flex-col justify-between">
              <span className="comic-panel-number">Panel #05 // graduation flagship</span>
              <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
                6-DEV LEAD!!
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <a
                    href={PORTFOLIO_DATA.projects[0].githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg sm:text-xl font-display tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition flex items-center gap-1.5"
                  >
                    <span>Akasha-platform (graduation project)</span>
                    <ExternalLink className="w-4 h-4 text-[#F2C94C]" />
                  </a>
                  <span className="px-2.5 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider">
                    Team lead (6 devs)
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[#CBC0E3] comic-dialogue-text list-disc list-inside">
                  <li>Led a 6-engineer squad to develop an AI-powered software engineering platform transforming ideas into complete project architectures!</li>
                  <li>Automated database schema design (SQL &amp; Neo4j), REST API planning, Git repo sync &amp; &lt;20 ms real-time collaboration!</li>
                </ul>
              </div>

              <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                  React 19 • Node.js • Neo4j • Socket.IO • Git API
                </span>
                <span className="px-2 py-0.5 bg-[#09080D] text-[#10b981] font-display text-xs tracking-wider">
                  -85% planning time
                </span>
              </div>
            </article>

            {/* 2. ICU-Management-System (Spans 5 Cols) */}
            <article className="col-span-12 lg:col-span-5 comic-panel-frame panel-tilt-right pt-6 pb-4 px-5 relative flex flex-col justify-between">
              <span className="comic-panel-number-crimson">Panel #06 // real-time ICU</span>
              <span className="comic-sfx-alt absolute -top-3.5 right-3 text-xs">
                &lt;15MS SYNC!!
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <a
                    href="https://github.com/Devopsians12/Devopsians"
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-display tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition flex items-center gap-1.5"
                  >
                    <span>ICU-management-system</span>
                    <ExternalLink className="w-4 h-4 text-[#F2C94C]" />
                  </a>
                  <span className="px-2.5 py-0.5 bg-[#10b981] text-[#09080D] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider">
                    Backend architect
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[#CBC0E3] comic-dialogue-text list-disc list-inside">
                  <li>Developed high-throughput Node.js &amp; MongoDB backend services and optimized RESTful APIs!</li>
                  <li>Integrated Socket.IO for sub-15 ms real-time patient vitals streaming &amp; bed triage!</li>
                </ul>
              </div>

              <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex items-center justify-between">
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                  Node.js • MongoDB • Socket.IO
                </span>
                <span className="px-2 py-0.5 bg-[#09080D] text-[#10b981] font-display text-xs tracking-wider">
                  &lt;15 ms telemetry
                </span>
              </div>
            </article>

            {/* 3. Quiz-Platform (Spans 5 Cols) */}
            <article className="col-span-12 lg:col-span-5 comic-panel-frame panel-slash-left pt-6 pb-4 px-5 relative flex flex-col justify-between">
              <span className="comic-panel-number">Panel #07 // solo arena</span>
              <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
                100% SOLO!!
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <a
                    href="https://github.com/MohaMedTArEk912/FutureRobins"
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-display tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition flex items-center gap-1.5"
                  >
                    <span>Quiz-platform (MERN)</span>
                    <ExternalLink className="w-4 h-4 text-[#F2C94C]" />
                  </a>
                  <span className="px-2.5 py-0.5 bg-[#F2C94C] text-[#09080D] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider">
                    Sole developer
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[#CBC0E3] comic-dialogue-text list-disc list-inside">
                  <li>Sole developer of an end-to-end MERN real-time competitive quiz platform using Socket.IO!</li>
                  <li>Engineered authentication, gamification streaks &amp; live leaderboards!</li>
                </ul>
              </div>

              <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                  MERN • Socket.IO • JWT
                </span>
                <a
                  href="https://futurerobins.vercel.app/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 bg-[#E62E25] hover:bg-[#F2C94C] hover:text-[#09080D] text-white border-2 border-[#09080D] font-display text-xs tracking-wider transition flex items-center gap-1"
                >
                  <span>Live demo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>

            {/* 4. Library-Management-System (Spans 7 Cols) */}
            <article className="col-span-12 lg:col-span-7 comic-panel-frame panel-slash-right comic-speedlines pt-6 pb-4 px-5 relative flex flex-col justify-between">
              <span className="comic-panel-number">Panel #08 // 5-dev squad lead</span>
              <span className="comic-sfx-alt absolute -top-3.5 right-3 text-xs">
                50K+ BOOKS!!
              </span>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 mt-1">
                  <a
                    href={PORTFOLIO_DATA.projects[3].githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg sm:text-xl font-display tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition flex items-center gap-1.5"
                  >
                    <span>Library-management-system</span>
                    <ExternalLink className="w-4 h-4 text-[#F2C94C]" />
                  </a>
                  <span className="px-2.5 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-display text-xs tracking-wider">
                    Team lead (5 devs)
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[#CBC0E3] comic-dialogue-text list-disc list-inside">
                  <li>Led a 5-member team: managed task distribution, Git code reviews, and milestone tracking!</li>
                  <li>Architected the React + Tailwind CSS frontend with sub-second catalog search &amp; clean UI/UX!</li>
                </ul>
              </div>

              <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex items-center justify-between">
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                  React • Tailwind CSS • Node.js • Git pr gate
                </span>
                <span className="px-2 py-0.5 bg-[#09080D] text-[#10b981] font-display text-xs tracking-wider">
                  100% on-time release
                </span>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            SPREAD #04: TECHNICAL SKILLS ARSENAL (4-PANEL COMIC STRIP)
            =================================================================== */}
        <section className="comic-panel-frame panel-tilt-left pt-6 pb-5 px-5 relative">
          <span className="comic-panel-number">Panel #09 // polyglot technical arsenal</span>
          <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
            FULL ARSENAL!!
          </span>

          <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mb-3 mt-1">
            <Cpu className="w-4 h-4" />
            <span>Verified engineering languages, frameworks &amp; architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Programming Languages */}
            <div className="p-3.5 bg-[#09080D] border-3 border-[#F2C94C] shadow-[4px_4px_0px_#E62E25] -rotate-1">
              <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-2 flex items-center gap-1.5 border-b border-[#5B3E96] pb-1">
                <Code2 className="w-4 h-4 text-[#E62E25]" />
                <span>Languages</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['TYPESCRIPT', 'JAVASCRIPT (ES6+)', 'PYTHON', 'JAVA OOP', 'C KERNEL'].map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 bg-[#F3E7D3] text-[#09080D] border-2 border-[#09080D] font-display text-[11px] tracking-wider"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Full-Stack Web */}
            <div className="p-3.5 bg-[#09080D] border-3 border-[#10b981] shadow-[4px_4px_0px_#F2C94C] rotate-1">
              <div className="text-xs font-display tracking-wider text-[#10b981] mb-2 flex items-center gap-1.5 border-b border-[#5B3E96] pb-1">
                <Globe className="w-4 h-4 text-[#F2C94C]" />
                <span>Full-stack MERN</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['REACT 19', 'NODE.JS', 'EXPRESS.JS', 'SOCKET.IO', 'TAILWIND CSS', 'REST APIS'].map((fw) => (
                  <span
                    key={fw}
                    className="px-2 py-0.5 bg-[#F2C94C] text-[#09080D] border-2 border-[#09080D] font-display text-[11px] tracking-wider"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Databases */}
            <div className="p-3.5 bg-[#09080D] border-3 border-[#E62E25] shadow-[4px_4px_0px_#5B3E96] -rotate-1">
              <div className="text-xs font-display tracking-wider text-[#E62E25] mb-2 flex items-center gap-1.5 border-b border-[#5B3E96] pb-1">
                <Database className="w-4 h-4 text-[#F2C94C]" />
                <span>Polyglot DBs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['MONGODB', 'MYSQL (ACID/3NF)', 'NEO4J (CYPHER)', 'REDIS PUB/SUB'].map((db) => (
                  <span
                    key={db}
                    className="px-2 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] font-display text-[11px] tracking-wider"
                  >
                    {db}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Architecture & Engineering */}
            <div className="p-3.5 bg-[#09080D] border-3 border-[#CBC0E3] shadow-[4px_4px_0px_#10b981] rotate-1">
              <div className="text-xs font-display tracking-wider text-[#CBC0E3] mb-2 flex items-center gap-1.5 border-b border-[#5B3E96] pb-1">
                <GitBranch className="w-4 h-4 text-[#10b981]" />
                <span>System design</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['HLD & LLD', 'UML & ERD', 'DATA STRUCTURES', 'SOLID / OOP', 'GIT & GITHUB'].map((arch) => (
                  <span
                    key={arch}
                    className="px-2 py-0.5 bg-[#2A194D] text-[#F3E7D3] border-2 border-[#F2C94C] font-display text-[11px] tracking-wider"
                  >
                    {arch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SPREAD #05: CERTIFICATIONS, LEADERSHIP & STATUS (ASYMMETRIC MOSAIC)
            =================================================================== */}
        <div className="unordinary-comic-grid">
          {/* PANEL #10 (Spans 5 Cols): Verified Certifications */}
          <section className="col-span-12 lg:col-span-5 comic-panel-frame panel-slash-left pt-6 pb-4 px-5 relative flex flex-col justify-between gap-3">
            <span className="comic-panel-number">Panel #10 // guild seals</span>
            <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mt-1">
              <Award className="w-4 h-4 text-[#E62E25]" />
              <span>Courses &amp; certifications</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#F3E7D3] text-[#09080D] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] -rotate-1">
                <div className="flex items-center justify-between font-display text-xs tracking-wider text-[#8C1410] mb-0.5">
                  <span>Mahara-Tech (ITI)</span>
                  <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.2">Aug 2024 – Jan 2025</span>
                </div>
                <div className="font-display text-sm tracking-wider text-[#09080D]">
                  ★ MERN-stack development
                </div>
                <p className="text-[11px] comic-dialogue-text text-[#09080D] mt-0.5">
                  Full-stack mastery across MongoDB, Express, React &amp; Node.js!
                </p>
              </div>

              <div className="p-3 bg-[#2A194D] text-[#F3E7D3] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] rotate-1">
                <div className="flex items-center justify-between font-display text-xs tracking-wider text-[#F2C94C] mb-0.5">
                  <span>Mahara-Tech (ITI)</span>
                  <span className="bg-[#E62E25] text-white px-2 py-0.2">Aug 2023 – Nov 2023</span>
                </div>
                <div className="font-display text-sm tracking-wider text-[#F3E7D3]">
                  ★ Cyber security &amp; ethical hacking
                </div>
                <p className="text-[11px] comic-dialogue-text text-[#CBC0E3] mt-0.5">
                  Network security protocols, penetration testing &amp; API hardening!
                </p>
              </div>
            </div>
          </section>

          {/* PANEL #11 (Spans 7 Cols): Professional Experience & Leadership */}
          <section className="col-span-12 lg:col-span-7 comic-panel-frame panel-tilt-right pt-6 pb-4 px-5 relative flex flex-col justify-between gap-3">
            <span className="comic-panel-number-crimson">Panel #11 // field experience</span>
            <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mt-1">
              <Briefcase className="w-4 h-4 text-[#10b981]" />
              <span>Professional tenure &amp; mentorship</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#09080D] border-3 border-[#F2C94C] shadow-[4px_4px_0px_#E62E25]">
                <div className="flex items-center justify-between text-[10px] font-display tracking-wider text-[#F2C94C] mb-1">
                  <span>Eyouth · Digilians</span>
                  <span className="bg-[#10b981] text-[#09080D] px-1.5 py-0.2">May 2026 – present</span>
                </div>
                <div className="text-sm font-display tracking-wider text-[#F3E7D3]">
                  Project Coordinator
                </div>
                <p className="text-[11px] comic-dialogue-text text-[#CBC0E3] mt-1">
                  Orchestrating national engineering cohorts, agile sprints &amp; milestone delivery!
                </p>
              </div>

              <div className="p-3 bg-[#09080D] border-3 border-[#10b981] shadow-[4px_4px_0px_#F2C94C]">
                <div className="flex items-center justify-between text-[10px] font-display tracking-wider text-[#10b981] mb-1">
                  <span>3C School</span>
                  <span className="bg-[#F2C94C] text-[#09080D] px-1.5 py-0.2">Jun 2025 – May 2026</span>
                </div>
                <div className="text-sm font-display tracking-wider text-[#F3E7D3]">
                  Programming instructor
                </div>
                <p className="text-[11px] comic-dialogue-text text-[#CBC0E3] mt-1">
                  Mentored 100+ aspiring developers in algorithms, OOP, data structures &amp; clean code!
                </p>
              </div>
            </div>

            {/* Bottom Starburst Strip: Languages & Military Exemption */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="comic-starburst p-2.5 flex items-center justify-between">
                <span className="text-[10px] font-display tracking-wider text-[#CBC0E3] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#F2C94C]" />
                  Arabic
                </span>
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">Native</span>
              </div>

              <div className="comic-starburst p-2.5 flex items-center justify-between">
                <span className="text-[10px] font-display tracking-wider text-[#CBC0E3] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#F2C94C]" />
                  English
                </span>
                <span className="text-xs text-[#10b981] text-right">{PORTFOLIO_DATA.profile.languages[1].proficiency}</span>
              </div>

              <div className="comic-starburst p-2.5 flex items-center justify-between">
                <span className="text-[10px] font-display tracking-wider text-[#CBC0E3] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  Military
                </span>
                <span className="text-xs font-display tracking-wider text-[#E62E25] bg-[#F2C94C] px-1.5">
                  Exempt!
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
      )}
    </div>
  );
}
