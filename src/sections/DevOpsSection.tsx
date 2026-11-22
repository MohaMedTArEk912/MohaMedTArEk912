import { Layers, Award, Terminal, Volume2 } from 'lucide-react';
import { audioManager } from '../utils/audio';
import { speechNarrator } from '../utils/speechNarrator';
import { StageGridHeader } from '../components/dom/StageGridHeader';

export function DevOpsSection() {
  const stages = [
    {
      num: '01',
      panelNo: 'PANEL #02 // STAGE 01',
      sfx: 'VERIFIED!!',
      title: 'LINT & TEST AUTOMATION',
      tool: 'GITHUB ACTIONS / JENKINS',
      spanClass: 'col-span-12 sm:col-span-5 panel-slash-left',
      desc: 'STATIC CODE ANALYSIS, UNIT TESTING GATES, AND AUTOMATED SECURITY SCANS TRIGGERED ON EVERY PULL REQUEST!',
      badgeColor: 'bg-[#F2C94C] text-[#09080D]',
    },
    {
      num: '02',
      panelNo: 'PANEL #03 // STAGE 02',
      sfx: 'SEALED!!',
      title: 'MULTI-STAGE CONTAINERIZATION',
      tool: 'DOCKER / ALPINE SANDBOX',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-right comic-speedlines',
      desc: 'ULTRA-LEAN PRODUCTION IMAGES COMPILED VIA MULTI-STAGE ALPINE BUILDS WITH NON-ROOT RUNTIME SANDBOXES!',
      badgeColor: 'bg-[#10b981] text-[#09080D]',
    },
    {
      num: '03',
      panelNo: 'PANEL #04 // STAGE 03',
      sfx: 'PROVISIONED!!',
      title: 'IMMUTABLE IAC PROVISIONING',
      tool: 'TERRAFORM & ANSIBLE',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-left comic-speedlines',
      desc: 'IDEMPOTENT CLOUD INFRASTRUCTURE ORCHESTRATION PROVISIONING VPCS, IAM POLICIES & CLUSTER COMPUTE NODES!',
      badgeColor: 'bg-[#E62E25] text-white',
    },
    {
      num: '04',
      panelNo: 'PANEL #05 // STAGE 04',
      sfx: '99.98% SLA!!',
      title: 'ZERO-DOWNTIME K8S ORCHESTRATION',
      tool: 'KUBERNETES & HELM',
      spanClass: 'col-span-12 sm:col-span-5 panel-slash-right',
      desc: 'DECLARATIVE POD REPLICA MANAGEMENT, ROLLING ZERO-DOWNTIME UPDATES, READINESS PROBES & INGRESS ROUTING!',
      badgeColor: 'bg-[#5B3E96] text-[#F3E7D3]',
    },
  ];

  const tools = [
    { name: 'KUBERNETES', category: 'ORCHESTRATION', color: 'bg-[#F2C94C] text-[#09080D]' },
    { name: 'DOCKER', category: 'CONTAINERS', color: 'bg-[#10b981] text-[#09080D]' },
    { name: 'TERRAFORM', category: 'IAC ENGINE', color: 'bg-[#E62E25] text-white' },
    { name: 'ANSIBLE', category: 'CONFIG AUTOMATION', color: 'bg-[#F3E7D3] text-[#09080D]' },
    { name: 'AWS CLOUD', category: 'COMPUTE / IAM', color: 'bg-[#F2C94C] text-[#09080D]' },
    { name: 'GITHUB ACTIONS', category: 'CI/CD PIPELINES', color: 'bg-[#5B3E96] text-white' },
    { name: 'PROMETHEUS & GRAFANA', category: 'OBSERVABILITY', color: 'bg-[#E62E25] text-white' },
    { name: 'BASH / LINUX', category: 'KERNEL SCRIPTING', color: 'bg-[#F3E7D3] text-[#09080D]' },
  ];

  return (
    <section
      id="sec-devops"
      data-layout="stage-left"
      className="stage-section relative overflow-hidden"
    >
      {/* Spread 04 Header */}
      <StageGridHeader
        sector="SPREAD 04 // FORTRESS OF IMMUTABLE CLOUD (04 DEVOPS)"
        corridor="STAGE LEFT (Z <= -1.6 PROPS)"
        badge="DEPI 3RD PLACE WINNER"
      />

      {/* Content Column on Right (Cols 6-12) */}
      <div className="stage-content flex flex-col items-start z-10 w-full gap-4">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <Layers className="w-4 h-4" />
              <span>CHAPTER IV // CLOUD-NATIVE DEVOPS &amp; INFRASTRUCTURE</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => speechNarrator.speakSection('sec-devops')}
                className="comic-gold-btn flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>VOICE NARRATION</span>
              </button>
            </div>
          </div>

          <h2 className="runic-spread-title text-3xl sm:text-5xl block">
            FORTRESS OF IMMUTABLE CLOUD
          </h2>

          {/* Speech Bubble Pointing Left Toward the 3D Avatar in Cols 1-5 */}
          <div className="comic-speech-bubble comic-speech-bubble-left w-full relative">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#8C1410] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
              <span>💬 SRE COMMANDER MOHAMED ANNOUNCES:</span>
              <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5">SPREAD #04</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text">
              &ldquo;MANUAL OPERATIONS ARE EXTINCT! WE ORCHESTRATE <span className="bg-[#F2C94C] px-1 border border-[#09080D]">SELF-HEALING KUBERNETES CLUSTERS</span>, DECLARATIVE <span className="text-[#E62E25] underline">TERRAFORM IAC</span>, AND PROMETHEUS/GRAFANA TELEMETRY!&rdquo;
            </p>
          </div>
        </div>

        {/* UNORDINARY 12-COLUMN ASYMMETRIC DEVOPS MOSAIC GRID */}
        <div className="unordinary-comic-grid pt-2">
          {/* PANEL #01 (Spans 12 Cols): DEPI 3rd Place Nationwide Victory Splash Panel */}
          <div className="col-span-12 comic-narrator-box p-4 relative flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            <span className="comic-sfx absolute -top-4 right-3 text-xs">
              POW!! 3RD PLACE NATIONWIDE!
            </span>
            <div className="p-3 bg-[#09080D] text-[#F2C94C] border-3 border-[#09080D] shadow-[4px_4px_0px_#E62E25] shrink-0 -rotate-3">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm sm:text-base font-display tracking-wider text-[#8C1410]">
                  ★ PANEL #01 // 3RD PLACE AWARD WINNER — DEPI DEVOPS INITIATIVE ★
                </span>
                <span className="text-xs font-display tracking-wider px-2 py-0.5 bg-[#09080D] text-[#F2C94C]">
                  JUN 2025 – DEC 2025
                </span>
              </div>
              <p className="text-xs text-[#09080D] comic-dialogue-text">
                AWARDED 3RD PLACE ACROSS COMPETITIVE NATIONAL COHORTS IN THE DIGITAL EGYPT PIONEERS INITIATIVE (DEPI) FOR END-TO-END KUBERNETES ORCHESTRATION, ZERO-DOWNTIME DEPLOYMENT AUTOMATION, AND TERRAFORM IAC!
              </p>
            </div>
          </div>

          {/* PANELS #02 - #05 (Asymmetric 5:7 + 7:5 Mosaic Spans): 4-Stage CI/CD Deployment Rail */}
          {stages.map((st) => (
            <div
              key={st.num}
              onClick={() => audioManager.playSfx('key')}
              className={`${st.spanClass} comic-panel-frame pt-6 pb-4 px-4 cursor-pointer relative`}
            >
              <span className="comic-panel-number">{st.panelNo}</span>
              <span className="comic-sfx-alt absolute -top-3 right-2 text-[11px]">
                {st.sfx}
              </span>
              <div className="flex items-center justify-between mb-2 mt-1">
                <h3 className="text-base font-display tracking-wider text-[#F3E7D3]">{st.title}</h3>
                <span
                  className={`text-[10px] font-display tracking-wider px-2 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] ${st.badgeColor}`}
                >
                  {st.tool}
                </span>
              </div>
              <p className="text-xs text-[#CBC0E3] comic-dialogue-text">{st.desc}</p>
            </div>
          ))}

          {/* PANEL #06 (Spans 12 Cols): Staggered Cloud-Native Sticker Wall */}
          <div className="col-span-12 comic-panel-frame panel-tilt-left pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">PANEL #06 // CLOUD-NATIVE &amp; SRE STICKER WALL</span>
            <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-2.5 mt-1 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              <span>PRODUCTION CLOUD &amp; OBSERVABILITY ARSENAL:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tools.map((t, idx) => (
                <div
                  key={t.name}
                  className={`p-2.5 border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] flex flex-col ${
                    idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  } ${t.color}`}
                >
                  <span className="text-sm font-display tracking-wider">{t.name}</span>
                  <span className="text-[10px] font-display tracking-widest opacity-85">
                    {t.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
