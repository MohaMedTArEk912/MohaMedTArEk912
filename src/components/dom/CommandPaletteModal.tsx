import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Compass,
  Layers,
  FileText,
  Terminal,
  Mail,
  Phone,
  Code2,
  Globe,
  X,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { sounds } from '../../audio/soundSynthesizer';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

interface CommandItem {
  id: string;
  category: 'Sectors' | 'Projects' | 'Actions';
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
}

interface CommandPaletteModalProps {
  onOpenTerminal: () => void;
}

export function CommandPaletteModal({ onOpenTerminal }: CommandPaletteModalProps) {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    toggleViewMode,
    viewMode,
    openStationDrawer,
  } = useCommandStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      const timer = setTimeout(() => {
        setSearch('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isCommandPaletteOpen]);

  const scrollToSector = useCallback((id: string) => {
    sounds.playWarp();
    setCommandPaletteOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [setCommandPaletteOpen]);

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    sounds.playSuccess();
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const commandItems: CommandItem[] = useMemo(() => {
    return [
      // Quick Actions
      {
        id: 'toggle-view',
        category: 'Actions',
        title: viewMode === '3d' ? 'Switch to 2D Executive Resume Mode' : 'Return to 3D Command Center',
        subtitle: 'Read, print, or copy the black-and-white résumé.',
        icon: FileText,
        badge: 'View toggle',
        action: () => {
          toggleViewMode();
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'open-cli',
        category: 'Actions',
        title: 'Open the interactive terminal',
        subtitle: 'Explore portfolio commands in a full-screen terminal.',
        icon: Terminal,
        badge: 'CLI',
        action: () => {
          setCommandPaletteOpen(false);
          onOpenTerminal();
        },
      },
      {
        id: 'copy-email',
        category: 'Actions',
        title: 'Copy email address',
        subtitle: PORTFOLIO_DATA.profile.emails[0],
        icon: Mail,
        badge: copiedKey === 'email' ? 'COPIED!' : 'COPY',
        action: () => copyToClipboard(PORTFOLIO_DATA.profile.emails[0], 'email'),
      },
      {
        id: 'copy-phone',
        category: 'Actions',
        title: 'Copy phone number',
        subtitle: PORTFOLIO_DATA.profile.phones[0],
        icon: Phone,
        badge: copiedKey === 'phone' ? 'COPIED!' : 'COPY',
        action: () => copyToClipboard(PORTFOLIO_DATA.profile.phones[0], 'phone'),
      },
      {
        id: 'open-github',
        category: 'Actions',
        title: 'Visit GitHub Profile (@MohaMedTArEk912)',
        subtitle: 'Production repositories, graduation project, and open source',
        icon: Code2,
        badge: 'External',
        action: () => {
          window.open(PORTFOLIO_DATA.profile.github, '_blank');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'open-linkedin',
        category: 'Actions',
        title: 'Visit LinkedIn Profile (Mohamed Tarek)',
        subtitle: 'Professional recommendations, education credentials, and network',
        icon: Globe,
        badge: 'External',
        action: () => {
          window.open(PORTFOLIO_DATA.profile.linkedin, '_blank');
          setCommandPaletteOpen(false);
        },
      },

      // Station Drawers (Projects)
      {
        id: 'drawer-akasha',
        category: 'Projects',
        title: 'Akasha Platform (graduation project)',
        subtitle: 'AI-assisted software planning with Git integration.',
        icon: Layers,
        badge: 'Project lead',
        action: () => {
          setCommandPaletteOpen(false);
          openStationDrawer('akasha');
        },
      },
      {
        id: 'drawer-icu',
        category: 'Projects',
        title: 'ICU Management System',
        subtitle: 'Live updates on patient vital signs and bed availability using Socket.IO.',
        icon: Layers,
        badge: 'Real-time',
        action: () => {
          setCommandPaletteOpen(false);
          openStationDrawer('icu');
        },
      },
      {
        id: 'drawer-quiz',
        category: 'Projects',
        title: 'Competitive Quiz Platform',
        subtitle: 'Multiplayer quizzes with live scores.',
        icon: Layers,
        badge: 'Full-stack',
        action: () => {
          setCommandPaletteOpen(false);
          openStationDrawer('quiz');
        },
      },
      {
        id: 'drawer-library',
        category: 'Projects',
        title: 'Library Management System',
        subtitle: 'Led a five-member team that built a frontend with React and Tailwind CSS.',
        icon: Layers,
        badge: 'Team lead',
        action: () => {
          setCommandPaletteOpen(false);
          openStationDrawer('library');
        },
      },

      // Sectors (Scrollytelling Waypoints)
      {
        id: 'sector-00',
        category: 'Sectors',
        title: '[00] Origin Nexus & Academic Foundation',
        subtitle: 'Helwan University CS (2022 – 2026), Executive Hero Persona, Bilingual Dossier',
        icon: Compass,
        badge: 'Sector 00',
        action: () => scrollToSector('sec-about'),
      },
      {
        id: 'sector-01',
        category: 'Sectors',
        title: '[01] Software Engineering & Algorithmic Rigor',
        subtitle: 'Algorithmic Crystal, C++, Data Structures, Low-Level Memory Optimization',
        icon: Compass,
        badge: 'Sector 01',
        action: () => scrollToSector('sec-swe'),
      },
      {
        id: 'sector-02',
        category: 'Sectors',
        title: '[02] Scalable Full-Stack Web Architecture',
        subtitle: 'MERN Stack, Express Microservices, Polyglot DBs (MongoDB, MySQL, Neo4j, Redis)',
        icon: Compass,
        badge: 'Sector 02',
        action: () => scrollToSector('sec-fullstack'),
      },
      {
        id: 'sector-03',
        category: 'Sectors',
        title: '[03] Production Case Studies & System Topology',
        subtitle: 'Akasha AI Platform, ICU Management, Quiz Platform, and Library System',
        icon: Compass,
        badge: 'Sector 03',
        action: () => scrollToSector('sec-projects'),
      },
      {
        id: 'sector-04',
        category: 'Sectors',
        title: '[04] Technical Mentorship & Educational Pedagogy',
        subtitle: '3C School Instructor, 100+ students mentored in algorithms and web systems',
        icon: Compass,
        badge: 'Sector 04',
        action: () => scrollToSector('sec-instructor'),
      },
      {
        id: 'sector-05',
        category: 'Sectors',
        title: '[05] Agile Project Delivery & Squad Leadership',
        subtitle: 'Eyouth Project Coordinator, Akasha 6-Dev Lead, and Library 5-Dev Lead',
        icon: Compass,
        badge: 'Sector 05',
        action: () => scrollToSector('sec-pm'),
      },
      {
        id: 'sector-06',
        category: 'Sectors',
        title: '[06] Command Gateway & Contact Protocol',
        subtitle: 'Direct recruiter liaison, interactive ZSH terminal, and instant contact',
        icon: Compass,
        badge: 'Sector 06',
        action: () => scrollToSector('sec-contact'),
      },
    ];
  }, [copiedKey, copyToClipboard, onOpenTerminal, openStationDrawer, scrollToSector, setCommandPaletteOpen, toggleViewMode, viewMode]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return commandItems;
    const q = search.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [commandItems, search]);

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Auto-scroll selected item into view when navigating via arrow keys
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#09080D]/85 backdrop-blur-md animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl comic-panel-frame panel-tilt-left overflow-hidden flex flex-col p-0 relative"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b-4 border-[#09080D] bg-[#E62E25]">
          <Search className="w-5 h-5 text-[#F2C94C] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chapters, projects, or commands"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white placeholder-white/75 font-display tracking-wider text-sm focus:outline-none "
          />
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-[#09080D] text-[#F2C94C] font-display tracking-wider border-2 border-[#09080D]">
              Esc
            </span>
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="bg-[#09080D] text-[#F2C94C] hover:bg-[#F2C94C] hover:text-[#09080D] p-1 border-2 border-[#09080D] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div data-lenis-prevent className="max-h-[52vh] overflow-y-auto p-3 space-y-2 bg-[#120F1A] custom-scrollbar overscroll-contain">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#CBC0E3] font-display tracking-wider text-xs">
              No results for &ldquo;{search}&rdquo;. Try <span className="text-[#F2C94C]">Akasha</span>, <span className="text-[#F2C94C]">résumé</span>, or <span className="text-[#F2C94C]">email</span>.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 border-3 border-[#09080D] cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#2A194D] text-[#F3E7D3] shadow-[5px_5px_0px_#F2C94C] -translate-y-0.5'
                      : 'bg-[#09080D]/90 text-[#CBC0E3] hover:bg-[#2A194D]/60 shadow-[3px_3px_0px_#09080D]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 border-2 border-[#09080D] shrink-0 ${
                        isSelected
                          ? 'bg-[#F2C94C] text-[#09080D]'
                          : 'bg-[#120F1A] text-[#F2C94C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-display tracking-wider truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.2 bg-[#E62E25] text-white border border-[#09080D] font-display tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] comic-dialogue-text text-[#CBC0E3] truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-display tracking-widest text-[#F2C94C] shrink-0 ml-3">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t-4 border-[#09080D] bg-[#09080D] text-[10.5px] font-display tracking-wider text-[#CBC0E3]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#2A194D] text-[#F2C94C] border border-[#F2C94C] mr-1">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#2A194D] text-[#F2C94C] border border-[#F2C94C] mr-1">↓</kbd>
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#E62E25] text-white border border-[#09080D] mr-1">↵</kbd>
              warp to panel
            </span>
          </div>
          <span className="text-[#F2C94C]">Issue #2026 // comic command index</span>
        </div>
      </div>
    </div>
  );
}
