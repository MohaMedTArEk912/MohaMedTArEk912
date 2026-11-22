import { useState } from 'react';
import { Code2, Cpu, Database, Network, GitGraph, FileCode2 } from 'lucide-react';
import { audioManager } from '../utils/audio';
import { StageGridHeader } from '../components/dom/StageGridHeader';

export function SoftwareSection() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'diagrams' | 'databases' | 'algorithms'>('architecture');

  const [selectedNode, setSelectedNode] = useState<{
    name: string;
    type: string;
    complexity: string;
    memory: string;
    desc: string;
  }>({
    name: 'BinarySearchTree',
    type: 'Data structure // self-balancing AVL tree',
    complexity: 'O(log n) SEARCH / INSERT',
    memory: '0x7FFE_4A82',
    desc: 'Maintains strict binary search invariant with logarithmic height guarantees and cache-conscious node pointers!',
  });

  const astNodes = [
    {
      name: 'BinarySearchTree',
      type: 'Data structure // AVL tree',
      complexity: 'O(log n)',
      memory: '0x7FFE_10A0',
      desc: 'Self-balancing binary tree providing deterministic search, insertion, and deletion complexity!',
    },
    {
      name: 'HeapPartition',
      type: 'Priority queue // binary min-heap',
      complexity: 'O(log n) / O(1)',
      memory: '0x7FFE_8F1C',
      desc: 'Maintains priority dispatch for asynchronous tasks and low-latency message streaming queues!',
    },
    {
      name: 'HashMapLookup',
      type: 'Hash bucket // quadratic probing',
      complexity: 'O(1) AVG',
      memory: '0x7FFE_BC94',
      desc: 'Contiguous bucket allocation minimizing cache misses with robin-hood collision handling!',
    },
    {
      name: 'GraphAdjacency',
      type: 'Graph engine // adjacency matrix',
      complexity: 'O(V + E) BFS',
      memory: '0x7FFE_E5D0',
      desc: 'Directed acyclic graph traversal engine modeling dependency resolution & distributed dispatch!',
    },
  ];

  const architecturalPillars = [
    {
      title: 'High-level & low-level design (HLD & LLD)',
      icon: Network,
      color: 'text-[#F2C94C]',
      panelNo: 'PANEL #01 // BLUEPRINT',
      sfx: 'ARCHITECT!!',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-left comic-speedlines',
      desc: 'Designing distributed microservices, event-driven pipelines, cqrs patterns, and clean separation between domain logic & infrastructure!',
    },
    {
      title: 'Complete UML & engineering diagrams',
      icon: GitGraph,
      color: 'text-[#CBC0E3]',
      panelNo: 'PANEL #02 // SCHEMATICS',
      sfx: 'MAPPED!!',
      spanClass: 'col-span-12 sm:col-span-5 panel-tilt-right',
      desc: 'Authoring architectural blueprints: UML class diagrams, sequence diagrams, erds, state machines & system flowcharts!',
    },
    {
      title: 'Database architecture & polyglot persistence',
      icon: Database,
      color: 'text-[#DF9A78]',
      panelNo: 'PANEL #03 // DATA VAULT',
      sfx: 'ACID 3NF!!',
      spanClass: 'col-span-12 sm:col-span-5 panel-slash-left',
      desc: 'Advanced relational schema design (MySQL, acid, 3nf/bcnf, b-tree indexes), document aggregations (MongoDB), and graph models (Neo4j cypher)!',
    },
    {
      title: 'Computational complexity & SOLID principles',
      icon: Cpu,
      color: 'text-[#E62E25]',
      panelNo: 'PANEL #04 // CORE ENGINE',
      sfx: 'O(log n)!!',
      spanClass: 'col-span-12 sm:col-span-7 panel-slash-right comic-speedlines',
      desc: 'Deep mastery of asymptotic algorithm analysis, OOP design patterns (factory, observer, strategy), and mechanical memory optimization!',
    },
  ];

  const diagramsList = [
    {
      name: 'UML class diagrams',
      badge: 'OOP hierarchy',
      spanClass: 'col-span-12 sm:col-span-7 panel-tilt-left',
      desc: 'Object modeling with inheritance, polymorphism, and strict interface contracts!',
    },
    {
      name: 'Sequence diagrams',
      badge: 'Protocol handshakes',
      spanClass: 'col-span-12 sm:col-span-5 panel-tilt-right',
      desc: 'Temporal flowcharts tracing synchronous & async payload lifecycles!',
    },
    {
      name: 'Entity-relationship (ERD)',
      badge: 'Schema blueprints',
      spanClass: 'col-span-12 sm:col-span-5 panel-slash-left',
      desc: 'Relational cardinality, primary/foreign keys, and 3nf normalization structures!',
    },
    {
      name: 'System state machines',
      badge: 'Lifecycle transitions',
      spanClass: 'col-span-12 sm:col-span-7 panel-slash-right',
      desc: 'Deterministic state transition diagrams for fault-tolerant distributed engines!',
    },
  ];

  const dbList = [
    {
      name: 'MySQL & relational engine',
      tech: 'Acid // 3nf normalization',
      sfx: 'LOCKED!!',
      tilt: 'panel-tilt-left',
      desc: 'Indexed queries, composite keys, execution plan explain analysis, and foreign constraints!',
    },
    {
      name: 'MongoDB (NoSQL document cluster)',
      tech: 'MERN certified',
      sfx: 'SHARDED!!',
      tilt: 'panel-tilt-right',
      desc: 'High-throughput document models, aggregation pipelines, and replica sets!',
    },
    {
      name: 'Neo4j graph knowledge DB',
      tech: 'Cypher traversals',
      sfx: 'CONNECTED!!',
      tilt: 'panel-slash-left',
      desc: 'Highly-connected relational topologies, graph traversals, and shortest-path indexing!',
    },
  ];

  const handleNodeClick = (node: typeof selectedNode) => {
    audioManager.playSfx('key');
    setSelectedNode(node);
  };

  return (
    <section
      id="sec-swe"
      data-layout="stage-left"
      className="stage-section relative overflow-hidden"
    >
      {/* Spread 01 Header */}
      <StageGridHeader
        sector="SPREAD 01 // THE ALGORITHMIC FORGE (01 SWE)"
        corridor="Stage left (cols 1-5 avatar)"
        badge="System architecture & core rigor"
      />

      {/* Content Column on Right (Cols 6-12) */}
      <div className="stage-content flex flex-col items-start z-10 w-full gap-4">
        {/* Top Comic Header & Speech Bubble Pointing Left Toward Avatar */}
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="comic-caption-tag text-xs">
              <Code2 className="w-4 h-4" />
              <span>Chapter I // software engineering &amp; architecture</span>
            </div>
          </div>

          <h2 className="runic-spread-title text-3xl sm:text-5xl block">
            The algorithmic forge: core rigor
          </h2>

          {/* Speech Bubble with Pointer Tail Pointing Left Toward the 3D Avatar in Cols 1-5 */}
          <div className="comic-speech-bubble comic-speech-bubble-left w-full relative">
            <div className="flex items-center justify-between text-[10.5px] font-display tracking-widest text-[#8C1410] mb-1 border-b-2 border-[#09080D]/20 pb-0.5">
              <span>💬 Architect Mohamed declares:</span>
              <span className="bg-[#09080D] text-[#F2C94C] px-2 py-0.5">Spread #01</span>
            </div>
            <p className="text-xs sm:text-sm text-[#09080D] comic-dialogue-text">
              &ldquo;Every resilient cloud platform begins with <span className="text-[#E62E25] underline">mathematical rigor</span>: high-level &amp; low-level design blueprints, normalized <span className="bg-[#F2C94C] px-1 border border-[#09080D]">ACID-compliant databases and Neo4j schemas</span>, and deterministic <span className="text-[#5B3E96]">O(log n) complexity</span>!&rdquo;
            </p>
          </div>
        </div>

        {/* Skewed Parallelogram Comic Panel Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-[#09080D] border-4 border-[#09080D] outline-2 outline-[#F2C94C] shadow-[7px_7px_0px_#09080D] w-full -skew-x-3">
          {[
            { id: 'architecture', label: 'Panel I: 4-pillar mosaic' },
            { id: 'diagrams', label: 'Panel II: UML & erd blueprints' },
            { id: 'databases', label: 'Panel III: polyglot persistence' },
            { id: 'algorithms', label: 'Panel IV: AST memory inspector' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                audioManager.playSfx('click');
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 font-display text-xs sm:text-sm tracking-wider transition cursor-pointer border-2 border-[#09080D] ${
                activeTab === tab.id
                  ? 'bg-[#E62E25] text-white shadow-[3px_3px_0px_#F2C94C] -translate-y-0.5'
                  : 'bg-[#2A194D] text-[#F3E7D3] hover:bg-[#5B3E96] hover:text-[#F2C94C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: UNORDINARY 12-COLUMN ASYMMETRIC MOSAIC GRID (7:5 + 5:7 Staggered Spans) */}
        {activeTab === 'architecture' && (
          <div className="unordinary-comic-grid pt-2">
            {architecturalPillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`${p.spanClass} comic-panel-frame pt-6 pb-4 px-4 relative`}>
                  <span className="comic-panel-number">{p.panelNo}</span>
                  <span className="comic-sfx absolute -top-3.5 right-2 text-[11px]">
                    {p.sfx}
                  </span>
                  <div className="flex items-center gap-2.5 mb-2 mt-1">
                    <div className="p-1.5 bg-[#09080D] border-2 border-[#F2C94C]">
                      <Icon className={`w-4 h-4 ${p.color}`} />
                    </div>
                    <h4 className="text-sm sm:text-base font-display text-[#F3E7D3] tracking-wider">
                      {p.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#CBC0E3] comic-dialogue-text">{p.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: UNORDINARY UML & ERD BLUEPRINT MOSAIC */}
        {activeTab === 'diagrams' && (
          <div className="unordinary-comic-grid pt-2">
            {diagramsList.map((d, idx) => (
              <div key={d.name} className={`${d.spanClass} comic-panel-frame pt-6 pb-4 px-4 relative`}>
                <span className="comic-panel-number">Blueprint #0{idx + 1}</span>
                <div className="flex items-center justify-between mb-2 mt-1">
                  <h4 className="text-base font-display text-[#F2C94C] tracking-wider">{d.name}</h4>
                  <span className="text-[10px] font-display tracking-wider px-2 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D]">
                    {d.badge}
                  </span>
                </div>
                <p className="text-xs text-[#F3E7D3] comic-dialogue-text">{d.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: STAGGERED DIAGONAL DATABASE STRIPS */}
        {activeTab === 'databases' && (
          <div className="space-y-4 w-full pt-2">
            {dbList.map((db, idx) => (
              <div
                key={db.name}
                className={`comic-panel-frame ${db.tilt} comic-speedlines pt-6 pb-4 px-4 relative`}
              >
                <span className="comic-panel-number">DB engine #0{idx + 1}</span>
                <span className="comic-sfx absolute -top-3 right-3 text-xs">{db.sfx}</span>
                <div className="flex flex-wrap items-center gap-2 mb-1.5 mt-1">
                  <Database className="w-4 h-4 text-[#F2C94C]" />
                  <span className="text-base font-display text-[#F3E7D3] tracking-wider">{db.name}</span>
                  <span className="text-xs font-display tracking-wider text-[#09080D] bg-[#F2C94C] px-2.5 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D]">
                    {db.tech}
                  </span>
                </div>
                <p className="text-xs text-[#CBC0E3] comic-dialogue-text">{db.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: INTERACTIVE AST & MEMORY INSPECTOR COMIC CONSOLE */}
        {activeTab === 'algorithms' && (
          <div className="comic-panel-frame panel-tilt-left w-full pt-6 pb-4 px-4 relative">
            <span className="comic-panel-number">Panel #04 // AST memory scanner</span>
            <div className="text-xs font-display tracking-wider text-[#F2C94C] mb-3 mt-1 flex items-center gap-2">
              <FileCode2 className="w-4 h-4" />
              <span>Click a memory cartridge to inspect asymptotic complexity:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {astNodes.map((node, i) => (
                <button
                  key={node.name}
                  onClick={() => handleNodeClick(node)}
                  className={`p-3 border-3 text-left transition cursor-pointer ${
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  } ${
                    selectedNode.name === node.name
                      ? 'bg-[#E62E25] border-[#09080D] text-white shadow-[5px_5px_0px_#09080D] -translate-y-1'
                      : 'bg-[#120F1A] border-[#09080D] text-[#CBC0E3] shadow-[3px_3px_0px_#09080D] hover:border-[#F2C94C]'
                  }`}
                >
                  <div className="text-sm font-display tracking-wider truncate">{node.name}</div>
                  <div className="text-[11px] font-display text-[#F2C94C] mt-0.5">{node.complexity}</div>
                </button>
              ))}
            </div>
            <div className="comic-narrator-box p-3.5">
              <div className="flex justify-between items-center text-[#8C1410] font-display text-xs tracking-wider mb-1">
                <span>{selectedNode.type}</span>
                <span className="bg-[#09080D] text-[#10b981] px-2 py-0.5">Addr: {selectedNode.memory}</span>
              </div>
              <div className="text-[#09080D] comic-dialogue-text text-xs">{selectedNode.desc}</div>
            </div>
          </div>
        )}

        {/* Polyglot Engineering Stack Stickers */}
        <div className="w-full pt-2">
          <div className="text-xs font-display tracking-widest text-[#F2C94C] mb-2">
            ★ Ink-stamped polyglot arsenal stickers ★
          </div>
          <div className="flex flex-wrap gap-2">
            {['C KERNEL', 'JAVA OOP', 'PYTHON AI', 'TYPESCRIPT', 'MYSQL (ACID)', 'MONGODB', 'NEO4J CYPHER', 'UML / ERD'].map(
              (t, i) => (
                <span
                  key={t}
                  className={`px-3 py-1 bg-[#F3E7D3] border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] text-[#09080D] font-display text-xs tracking-wider ${
                    i % 2 === 0 ? '-rotate-2' : 'rotate-2 bg-[#F2C94C]'
                  }`}
                >
                  {t}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
