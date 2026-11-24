import { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Radio,
  CheckCircle2,
  Terminal,
  Code2,
  ArrowUpRight,
} from 'lucide-react';
import { sounds } from '../audio/soundSynthesizer';
import { useCommandStore } from '../store/useCommandStore';
import { smoothScrollTo } from '../hooks/useLenisGSAP';
import { StageGridHeader } from '../components/dom/StageGridHeader';

interface ProjectCaseStudy {
  id: string;
  shortTitle: string;
  badge: string;
  sfx: string;
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  githubUrl: string;
  liveUrl?: string;
  metrics: {
    label: string;
    value: string;
    trend: string;
    highlight: string;
  }[];
  architectureNodes: {
    id: string;
    label: string;
    role: string;
    tech: string;
  }[];
  keyHighlights: string[];
  technologies: string[];
  liveStatus: 'OPERATIONAL' | 'DEPLOYED' | 'PRODUCTION';
}

const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: 'akasha',
    shortTitle: 'Akasha AI platform',
    badge: 'Graduation project // team lead (6 engineers)',
    sfx: 'AWAKEN!! -85% TIME!',
    title: 'Akasha Platform: AI software engineering engine',
    subtitle: 'Automated architecture synthesis, schema graph & Git scaffolding',
    category: 'AI & distributed systems',
    summary:
      'Led a 6-engineer squad to build an AI-powered software engineering platform transforming raw product ideas into enterprise architecture blueprints, normalized DB schemas, RESTful API contracts, and synchronized Git repos with <20 ms real-time collaboration!',
    githubUrl: 'https://github.com/MohaMedTArEk912/Akasha-Platform',
    metrics: [
      { label: 'Squad command', value: '6 devs', trend: 'Agile team lead', highlight: 'text-[#F2C94C]' },
      { label: 'Planning cut', value: '-85%', trend: 'Time-to-blueprint', highlight: 'text-[#10b981]' },
      { label: 'Duplex sync', value: '< 20 ms', trend: 'Socket.IO mesh', highlight: 'text-[#CBC0E3]' },
      { label: 'Determinism', value: '100.0%', trend: 'Neo4j + SQL DDL', highlight: 'text-[#E62E25]' },
    ],
    architectureNodes: [
      { id: 'canvas', label: 'Collab canvas', role: 'Live multiplayer UI', tech: 'React / WebGL' },
      { id: 'ai', label: 'AI synthesis', role: 'Architecture engine', tech: 'Node.js / LLM' },
      { id: 'socket', label: 'Duplex bus', role: '<20 ms state sync', tech: 'Socket.IO / Redis' },
      { id: 'graph', label: 'Knowledge graph', role: 'Schema topology', tech: 'Neo4j / MongoDB' },
      { id: 'git', label: 'Git scaffolder', role: 'Auto repo & CI/CD', tech: 'GitHub API' },
    ],
    keyHighlights: [
      'Directed a 6-member engineering squad through sprint planning, PR reviews & integration!',
      'Automated SQL & NoSQL database schema generation with instant DDL & API synthesis!',
      'Engineered sub-20 ms multi-user collaborative canvas handling concurrent edits!',
      'Built bi-directional Git integration scaffolding ready-to-deploy repositories!',
    ],
    technologies: ['React 19', 'Node.js', 'Express', 'Socket.IO', 'MongoDB', 'Neo4j', 'Docker', 'OpenAI API'],
    liveStatus: 'OPERATIONAL',
  },
  {
    id: 'icu',
    shortTitle: 'ICU management',
    badge: 'Mission-critical // healthcare telemetry',
    sfx: 'PULSE!! <15MS SYNC!',
    title: 'ICU patient vital monitoring & bed triage system',
    subtitle: 'Sub-15 ms bi-directional vital telemetry & hospital emergency dispatch',
    category: 'Real-time backend & sockets',
    summary:
      'Engineered a high-throughput Node.js + MongoDB backend and optimized RESTful APIs powering hospital intensive care units! Integrated Socket.IO for sub-15 ms live vital streaming, emergency staff alarms, and automated bed triage!',
    githubUrl: 'https://github.com/Devopsians12/Devopsians',
    metrics: [
      { label: 'Stream latency', value: '< 15 ms', trend: 'Socket.IO stream', highlight: 'text-[#10b981]' },
      { label: 'Concurrency', value: '5,000+', trend: 'Live vital feeds', highlight: 'text-[#F2C94C]' },
      { label: 'Availability', value: '99.99%', trend: 'Hospital uptime', highlight: 'text-[#CBC0E3]' },
      { label: 'Alert drop', value: '0.00%', trend: 'Critical alarms', highlight: 'text-[#E62E25]' },
    ],
    architectureNodes: [
      { id: 'sensor', label: 'Vital ingest', role: 'REST & telemetry gate', tech: 'Node.js / Express' },
      { id: 'ws', label: 'Socket cluster', role: '<15 ms broadcast mesh', tech: 'Socket.IO / Redis' },
      { id: 'triage', label: 'Emergency triage', role: 'Staff alert dispatch', tech: 'Event driven' },
      { id: 'db', label: 'Medical vault', role: 'Time-series indexing', tech: 'MongoDB' },
      { id: 'auth', label: 'RBAC shield', role: 'Doctor / nurse auth', tech: 'JWT / bcrypt' },
    ],
    keyHighlights: [
      'Built resilient Socket.IO telemetry serving continuous patient vital monitors at <15 ms!',
      'Optimized RESTful APIs & MongoDB compound indexes for instant patient record retrieval!',
      'Designed automated emergency bed allocation logic optimizing ICU surge capacity!',
      'Implemented strict role-based access control (doctors, charge nurses, admins)!',
    ],
    technologies: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Redis', 'Docker', 'JWT', 'RESTful API'],
    liveStatus: 'PRODUCTION',
  },
  {
    id: 'quiz',
    shortTitle: 'Quiz arena (MERN)',
    badge: 'Sole architect // multiplayer arena',
    sfx: 'BOOM!! 1,000+ ROOMS!',
    title: 'Competitive Quiz Platform: real-time competitive arena',
    subtitle: 'End-to-end MERN stack with authoritative clocks & live leaderboards',
    category: 'Full-stack MERN & WebSockets',
    summary:
      'Sole developer of an end-to-end MERN real-time competitive quiz platform using Socket.IO! Engineered authentication, gamification streaks, server-synchronized countdown timers, and atomic live leaderboards under high concurrency!',
    githubUrl: 'https://github.com/MohaMedTArEk912/FutureRobins',
    liveUrl: 'https://futurerobins.vercel.app/',
    metrics: [
      { label: 'Active rooms', value: '1,000+', trend: 'Isolated sockets', highlight: 'text-[#F2C94C]' },
      { label: 'Score sync', value: '< 10 ms', trend: 'Atomic broadcast', highlight: 'text-[#10b981]' },
      { label: 'Ownership', value: '100%', trend: 'Sole architect', highlight: 'text-[#E62E25]' },
      { label: 'Clock drift', value: '0.00%', trend: 'Server authoritative', highlight: 'text-[#CBC0E3]' },
    ],
    architectureNodes: [
      { id: 'ui', label: 'Arena HUD', role: 'Reactive contest UI', tech: 'React / Tailwind' },
      { id: 'auth', label: 'Gatekeeper', role: 'JWT authentication', tech: 'Express / node' },
      { id: 'hub', label: 'Matchmaker', role: 'Namespace multiplex', tech: 'Socket.IO' },
      { id: 'clock', label: 'Server clock', role: 'Anti-cheat timer sync', tech: 'Node.js core' },
      { id: 'db', label: 'Leaderboard', role: 'Aggregated XP store', tech: 'MongoDB' },
    ],
    keyHighlights: [
      'Engineered server-authoritative timers eliminating client-side clock drift & cheating!',
      'Built real-time room matchmaking pairing players into isolated Socket.IO namespaces!',
      'Designed dynamic streak multipliers, XP progression, and instant leaderboard broadcasts!',
      'Delivered complete full-stack architecture solo from DB schema to Docker deployment!',
    ],
    technologies: ['React', 'Node.js', 'Express', 'Socket.IO', 'MongoDB', 'Tailwind CSS', 'JWT', 'Docker'],
    liveStatus: 'DEPLOYED',
  },
  {
    id: 'library',
    shortTitle: 'Library system',
    badge: 'Team lead (5 devs) // enterprise UI/UX',
    sfx: 'INDEXED!! 50K+ BOOKS!',
    title: 'Library management system: academic control platform',
    subtitle: 'High-performance catalog indexing & automated circulation workflows',
    category: 'Enterprise web & team leadership',
    summary:
      'Led a 5-member engineering team (task distribution, code reviews, milestone tracking) and architected the React + Tailwind CSS frontend with a strict focus on clean UI/UX, modular maintainability, and sub-second catalog search!',
    githubUrl: 'https://github.com/MohaMedTArEk912/Library-Management-System',
    metrics: [
      { label: 'Squad led', value: '5 devs', trend: 'PR reviews & sprints', highlight: 'text-[#F2C94C]' },
      { label: 'Catalog index', value: '50,000+', trend: 'Sub-second search', highlight: 'text-[#CBC0E3]' },
      { label: 'On-time release', value: '100%', trend: 'Milestone delivery', highlight: 'text-[#10b981]' },
      { label: 'Pr coverage', value: '100%', trend: 'Peer audited code', highlight: 'text-[#E62E25]' },
    ],
    architectureNodes: [
      { id: 'ui', label: 'Catalog client', role: 'Atomic design UI/UX', tech: 'React / Tailwind' },
      { id: 'search', label: 'Search engine', role: 'Multi-field indexing', tech: 'React state' },
      { id: 'api', label: 'Circulation API', role: 'Loan & return triage', tech: 'Node.js / Express' },
      { id: 'db', label: 'Inventory DB', role: 'Book & member store', tech: 'MongoDB' },
      { id: 'git', label: 'Pr quality gate', role: '5-engineer workflow', tech: 'Git / GitHub' },
    ],
    keyHighlights: [
      'Led 5 developers through task breakdown, sprint tracking, and Git pull-request reviews!',
      'Architected a clean, maintainable React + Tailwind CSS frontend with reusable primitives!',
      'Built instant multi-parameter search filtering across ISBN, title, author & status!',
      'Implemented automated circulation tracking for reservations, due dates & audit logs!',
    ],
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'RESTful API', 'Git / GitHub'],
    liveStatus: 'OPERATIONAL',
  },
];

export function ProjectsCaseStudiesSection() {
  const [selectedId, setSelectedId] = useState<string>('akasha');
  const { openStationDrawer } = useCommandStore();

  const activeProject = CASE_STUDIES.find((p) => p.id === selectedId) || CASE_STUDIES[0];

  const handleSelect = (id: string) => {
    sounds.playClick();
    setSelectedId(id);
  };

  return (
    <section
      id="sec-projects"
      data-section="03-projects"
      className="stage-section relative overflow-hidden text-[#F3E7D3]"
    >
      {/* Spread 03 Double-Page Splash Header */}
      <StageGridHeader
        sector="SPREAD 03 // CODEX AKASHA: BATTLELOGS OF THE ARCHITECT (03 PROJECTS)"
        corridor="Cols 9-12 hero closer shot"
        badge="Double-page splash spread"
      />

      {/* Projects Matrix & Unordinary Splash Wrapper (Cols 1-8, leaving Cols 9-12 open for Avatar!) */}
      <div className="projects-wrapper stage-content flex flex-col z-10 w-full gap-4">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="comic-caption-tag text-xs mb-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Chapter III // double-page splash case studies</span>
            </div>
            <h2 className="runic-spread-title text-3xl sm:text-5xl block">
              Codex Akasha &amp; flagship trials
            </h2>
          </div>
        </div>

        {/* 4 Tilted Comic Issue Cover Selector Cartridges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CASE_STUDIES.map((project, index) => {
            const isSelected = project.id === selectedId;
            return (
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`text-left p-3 border-4 transition-all cursor-pointer relative ${
                  index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                } ${
                  isSelected
                    ? 'bg-[#E62E25] border-[#09080D] outline-2 outline-[#F2C94C] -outline-offset-4 text-white shadow-[7px_7px_0px_#09080D] -translate-y-1'
                    : 'bg-[#120F1A] border-[#09080D] text-[#CBC0E3] shadow-[4px_4px_0px_#09080D] hover:border-[#F2C94C]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-display tracking-wider mb-1">
                  <span className={isSelected ? 'text-[#F2C94C]' : 'text-[#9888B8]'}>
                    Issue #0{index + 1} // {project.liveStatus}
                  </span>
                  <span className={`w-2.5 h-2.5 rotate-45 border border-[#09080D] ${isSelected ? 'bg-[#F2C94C]' : 'bg-[#5B3E96]'}`} />
                </div>
                <div className="text-sm sm:text-base font-display tracking-wider text-white truncate">
                  {project.shortTitle}
                </div>
                <div className={`text-[10px] comic-dialogue-text truncate mt-0.5 ${isSelected ? 'text-[#F3E7D3]' : 'text-[#9888B8]'}`}>
                  {project.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* =================================================================
            UNORDINARY 12-COLUMN DOUBLE-PAGE SPLASH COMIC GRID
            ================================================================= */}
        <div className="unordinary-comic-grid pt-2">
          {/* PANEL #01 (Spans 7 Cols): Mission Briefing + Speech Bubble Pointing Toward Avatar */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-tilt-left comic-speedlines pt-6 pb-4 px-4 relative flex flex-col justify-between gap-3">
            <span className="comic-panel-number">Panel #01 // the architectural trial</span>
            <span className="comic-sfx absolute -top-3.5 right-3 text-xs">
              {activeProject.sfx}
            </span>

            <div>
              <div className="inline-block text-[10.5px] font-display tracking-wider text-[#09080D] px-2.5 py-0.5 bg-[#F2C94C] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] mb-2 mt-1">
                {activeProject.badge}
              </div>
              <h3 className="text-xl sm:text-2xl font-display text-[#F3E7D3] tracking-wider leading-tight mb-1">
                {activeProject.title}
              </h3>
              <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-2.5">
                // {activeProject.subtitle}
              </div>
            </div>

            <div className="comic-speech-bubble comic-speech-bubble-right p-3">
              <p className="text-xs text-[#09080D] comic-dialogue-text">
                &ldquo;{activeProject.summary}&rdquo;
              </p>
            </div>
          </div>

          {/* PANEL #02 (Spans 5 Cols): 2x2 Jagged Starburst Telemetry Shout Grid */}
          <div className="col-span-12 sm:col-span-5 grid grid-cols-2 gap-2.5 content-stretch">
            {activeProject.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="comic-starburst p-3 flex flex-col justify-between"
              >
                <div className="text-[10px] font-display tracking-wider text-[#CBC0E3]">
                  {metric.label}
                </div>
                <div className={`text-xl sm:text-2xl font-display tracking-wider ${metric.highlight} my-0.5`}>
                  {metric.value}
                </div>
                <div className="text-[10px] comic-dialogue-text text-[#F3E7D3] bg-[#09080D]/80 px-1.5 py-0.5 border border-[#09080D] w-fit">
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>

          {/* PANEL #03 (Spans 12 Cols): 5-Frame Diagonal Comic Action Strip (Architecture Pipeline) */}
          <div className="col-span-12 comic-panel-frame panel-slash-left pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">Panel #02 // 5-frame architectural pipeline strip</span>
            <div className="flex items-center justify-between mb-2.5 mt-1">
              <span className="flex items-center gap-1.5 font-display text-xs tracking-wider text-[#F2C94C]">
                <Layers className="w-4 h-4" />
                <span>Sequential data-flow action frames (node 01 → node 05)</span>
              </span>
              <span className="text-[10px] font-display tracking-widest text-[#E62E25] bg-[#F3E7D3] px-2 py-0.5 border border-[#09080D] hidden sm:inline">
                Deterministic execution
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {activeProject.architectureNodes.map((node, i) => (
                <div
                  key={node.id}
                  className={`p-2.5 bg-[#09080D] border-3 border-[#F2C94C] shadow-[4px_4px_0px_#E62E25] flex flex-col justify-between ${
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-display tracking-wider text-[#F2C94C] mb-1 flex items-center justify-between border-b border-[#5B3E96] pb-0.5">
                      <span>Frame #0{i + 1}</span>
                      <span className="text-[#E62E25]">⚡</span>
                    </div>
                    <div className="text-sm font-display tracking-wider text-[#F3E7D3] leading-snug mb-1">
                      {node.label}
                    </div>
                    <div className="text-[10.5px] comic-dialogue-text text-[#CBC0E3] mb-2">
                      {node.role}
                    </div>
                  </div>
                  <div className="text-[10px] font-display tracking-wider text-[#09080D] bg-[#F2C94C] px-2 py-0.5 border border-[#09080D] w-fit">
                    {node.tech}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL #04 (Spans 7 Cols): Battle Highlights & Impact Strip */}
          <div className="col-span-12 sm:col-span-7 comic-panel-frame panel-slash-right pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">Panel #03 // victory logs</span>
            <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-2 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Key architectural feats &amp; impact:</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {activeProject.keyHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-[#09080D]/90 border-2 border-[#09080D] shadow-[3px_3px_0px_#5B3E96] text-xs comic-dialogue-text text-[#F3E7D3]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F2C94C] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL #05 (Spans 5 Cols): Tech Arsenal Stickers & Interactive Command Triggers */}
          <div className="col-span-12 sm:col-span-5 comic-panel-frame panel-tilt-right pt-6 pb-4 px-4 flex flex-col justify-between gap-4 relative">
            <span className="comic-panel-number-crimson">Panel #04 // command</span>

            <div>
              <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-2 mt-1 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Tech arsenal stickers:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.technologies.map((tech, idx) => (
                  <span
                    key={tech}
                    className={`px-2 py-0.5 border-2 border-[#09080D] text-[10.5px] font-display tracking-wider shadow-[2px_2px_0px_#09080D] ${
                      idx % 2 === 0
                        ? 'bg-[#F3E7D3] text-[#09080D] -rotate-1'
                        : 'bg-[#F2C94C] text-[#09080D] rotate-1'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${activeProject.liveUrl ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2 pt-2 border-t-2 border-[#09080D]`}>
              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sounds.playClick()}
                  className="comic-gold-btn flex items-center justify-center gap-1.5 px-3 py-2 text-xs cursor-pointer"
                >
                  <span>Live demo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => openStationDrawer(activeProject.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2A194D] hover:bg-[#5B3E96] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] text-xs font-display tracking-wider text-[#F3E7D3] transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#F2C94C]" />
                <span>Bento spec</span>
              </button>

              <a
                href={activeProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="comic-action-btn flex items-center justify-center gap-1.5 px-3 py-2 text-xs cursor-pointer"
              >
                <span>GitHub repo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  sounds.playWarp();
                  smoothScrollTo('#sec-contact');
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#09080D] hover:bg-[#5B3E96] border-3 border-[#F2C94C] text-[#F2C94C] font-display text-xs tracking-wider transition cursor-pointer"
                title="Inspect in Terminal CLI"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI shell</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
