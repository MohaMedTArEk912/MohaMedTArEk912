import { useMemo } from 'react';
import {
  X,
  ExternalLink,
  Layers,
  CheckCircle2,
  Code2,
  Cpu,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export function BentoStationDrawer() {
  const { activeStationDrawer, closeStationDrawer } = useCommandStore();

  const project = useMemo(() => {
    if (!activeStationDrawer) return null;
    return PORTFOLIO_DATA.projects.find(
      (p) => p.stationKey === activeStationDrawer || p.id === activeStationDrawer
    );
  }, [activeStationDrawer]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#09080D]/85 backdrop-blur-md animate-fade-in"
      onClick={closeStationDrawer}
    >
      <div
        data-lenis-prevent="true"
        className="w-full max-w-4xl max-h-[90vh] comic-panel-frame panel-tilt-left overflow-y-auto p-5 sm:p-7 flex flex-col gap-5 custom-scrollbar overscroll-contain relative"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="comic-panel-number">Blueprint dossier // {project.id.toUpperCase()}</span>
        <span className="comic-sfx absolute -top-3.5 right-12 text-xs">
          VERIFIED SPEC!!
        </span>

        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b-3 border-[#09080D] pb-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E62E25] text-white border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] flex items-center justify-center shrink-0 -rotate-2">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#F2C94C] text-[#09080D] border-2 border-[#09080D] font-display text-xs tracking-wider">
                  {project.category}
                </span>
                <span className="text-xs font-display tracking-wider text-[#F2C94C]">
                  // {project.role}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-[#F3E7D3] mt-1">
                {project.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closeStationDrawer}
            className="p-2 bg-[#E62E25] hover:bg-[#F2C94C] text-white hover:text-[#09080D] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unordinary 12-Col Comic Blueprint Grid */}
        <div className="unordinary-comic-grid">
          {/* Panel A: Main Architectural Breakdown (Spans 7 cols) */}
          <div className="col-span-12 md:col-span-7 comic-narrator-box p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#8C1410] font-display text-sm tracking-wider mb-2">
                <Cpu className="w-4 h-4 text-[#E62E25]" />
                <span>Panel #01 // system architecture &amp; role</span>
              </div>
              <p className="text-xs text-[#09080D] comic-dialogue-text leading-relaxed">
                {project.architectureSummary}
              </p>

              <div className="mt-3.5 space-y-2">
                <div className="text-xs font-display tracking-wider text-[#8C1410]">
                  Key architectural feats:
                </div>
                {project.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-[#09080D] comic-dialogue-text bg-white/60 p-2 border-2 border-[#09080D]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#E62E25] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t-2 border-[#09080D] flex items-center justify-between text-xs font-display tracking-wider text-[#8C1410]">
              <span>Role: {project.role}</span>
              <span className="bg-[#09080D] text-[#10b981] px-2 py-0.5">Project brief</span>
            </div>
          </div>

          {/* Panel B: Impact & Performance Metrics (Spans 5 cols) */}
          <div className="col-span-12 md:col-span-5 bg-[#09080D] border-3 border-[#F2C94C] shadow-[6px_6px_0px_#E62E25] p-4 flex flex-col justify-between rotate-0.5">
            <div>
              <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mb-3">
                <Activity className="w-4 h-4 text-[#10b981]" />
                <span>Project facts</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {project.impactMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="comic-starburst p-2.5 flex items-center justify-between"
                  >
                    <span className="text-[10.5px] font-display tracking-wider text-[#CBC0E3]">
                      {metric.label}
                    </span>
                    <span className="text-sm sm:text-base font-display tracking-wider text-[#F2C94C]">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-display tracking-wider text-[#10b981]">
              <Award className="w-4 h-4 text-[#F2C94C] shrink-0" />
              <span>Engineering portfolio</span>
            </div>
          </div>

          {/* Panel C: Tech Stack Interactive Stickers (Spans 7 cols) */}
          <div className="col-span-12 md:col-span-7 bg-[#2A194D] border-3 border-[#09080D] shadow-[5px_5px_0px_#09080D] p-4 -rotate-0.5">
            <div className="flex items-center gap-2 text-[#F2C94C] font-display text-sm tracking-wider mb-2.5">
              <Zap className="w-4 h-4" />
              <span>Panel #03 // technology arsenal stickers</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tool, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 border-2 border-[#09080D] shadow-[3px_3px_0px_#09080D] font-display text-xs tracking-wider ${
                    idx % 2 === 0
                      ? 'bg-[#F2C94C] text-[#09080D] -rotate-1'
                      : 'bg-[#F3E7D3] text-[#09080D] rotate-1'
                  }`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Panel D: Source Code Action (Spans 5 cols) */}
          <div className="col-span-12 md:col-span-5 bg-[#120F1A] border-3 border-[#09080D] shadow-[5px_5px_0px_#F2C94C] p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-display tracking-wider text-[#F2C94C] mb-1">
                Panel #04 // source code vault
              </div>
              <p className="text-xs text-[#CBC0E3] comic-dialogue-text">
                Explore the project on GitHub.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="comic-action-btn w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs"
                >
                  <span>Open live app!</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="comic-gold-btn w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs"
              >
                <Code2 className="w-4 h-4 text-[#E62E25]" />
                <span>Open GitHub repository!</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
