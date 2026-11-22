import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CornerDownLeft,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
  Activity,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';
import { audioManager } from '../../utils/audio';
import { useCommandStore } from '../../store/useCommandStore';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import confetti from 'canvas-confetti';

interface TerminalLog {
  text: string;
  label?: string;
  isCommand?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  isHeader?: boolean;
  isBanner?: boolean;
  isAccent?: boolean;
}

const COMMAND_LIST = [
  'help',
  'bio',
  'projects',
  'skills',
  'coffee',
  'experience',
  'awards',
  'contact',
  'neofetch',
  'matrix',
  'clear',
  'sudo hire',
];

interface TerminalUIProps {
  className?: string;
  logHeightClass?: string;
}

export function TerminalUI({ className = '', logHeightClass }: TerminalUIProps = {}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [scanlines, setScanlines] = useState(true);
  const [copied, setCopied] = useState(false);

  // Typewriter letter-by-letter streaming animation states
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingLog, setCurrentStreamingLog] = useState<TerminalLog | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const queueRef = useRef<TerminalLog[]>([]);
  const timerRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      text: 'Dispatch terminal',
      isBanner: true,
    },
    {
      label: '★ Architect:',
      text: 'Mohamed Tarek Hussien · Cairo, Egypt',
      isSuccess: true,
    },
    {
      text: "Type 'help' to see the available commands.",
    },
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-scroll terminal container ONLY (without scrolling browser window)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, displayedText]);

  // Press Escape to exit fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Flush remaining streaming queue immediately to finalized logs
  const flushQueue = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const remaining: TerminalLog[] = [];
    if (currentStreamingLog) {
      remaining.push(currentStreamingLog);
    }
    if (queueRef.current.length > 0) {
      remaining.push(...queueRef.current);
      queueRef.current = [];
    }
    setCurrentStreamingLog(null);
    setDisplayedText('');
    setIsStreaming(false);

    if (remaining.length > 0) {
      setLogs((prev) => [...prev, ...remaining]);
    }
  }, [currentStreamingLog]);

  // Typewriter streaming character reveal loop
  useEffect(() => {
    if (!currentStreamingLog) return;

    let charIdx = 0;
    const targetText = currentStreamingLog.text;
    const queueLen = queueRef.current.length;
    const step = queueLen > 8 ? 5 : queueLen > 3 ? 4 : 3;
    const intervalMs = 10;

    const tick = () => {
      charIdx = Math.min(targetText.length, charIdx + step);
      setDisplayedText(targetText.slice(0, charIdx));

      const now = Date.now();
      if (now - lastSoundTimeRef.current > 55) {
        lastSoundTimeRef.current = now;
        audioManager.playSfx('key');
      }

      if (charIdx < targetText.length) {
        timerRef.current = window.setTimeout(tick, intervalMs);
      } else {
        const finished = currentStreamingLog;
        setLogs((prev) => [...prev, finished]);

        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          setCurrentStreamingLog(next);
          setDisplayedText('');
        } else {
          setCurrentStreamingLog(null);
          setDisplayedText('');
          setIsStreaming(false);
        }
      }
    };

    timerRef.current = window.setTimeout(tick, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [currentStreamingLog]);

  const setTerminalFullscreen = useCommandStore((state) => state.setTerminalFullscreen);

  useEffect(() => {
    setTerminalFullscreen(isFullscreen);
    return () => setTerminalFullscreen(false);
  }, [isFullscreen, setTerminalFullscreen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isStreaming) {
          flushQueue();
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isStreaming, isFullscreen, flushQueue]);

  // Pulp Sulfur-Gold & Crimson Matrix Rain Canvas Animation
  useEffect(() => {
    if (!isMatrixActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 500;

    const chars = '01POWZAPBOOMARCHITECTMERN{}[]=<>/\\*&^%$#@!+';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    const draw = () => {
      ctx.fillStyle = 'rgba(9, 8, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#F2C94C';
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMatrixActive]);

  const handleCommand = useCallback(
    (cmdStr: string) => {
      const raw = cmdStr.trim();
      if (!raw) return;

      if (isStreaming) {
        flushQueue();
      }

      audioManager.playSfx('key');
      const cmd = raw.toLowerCase();
      setHistory((prev) => [...prev, raw]);
      setHistoryIdx(-1);

      const outputLines: TerminalLog[] = [];

      switch (cmd) {
        case 'help':
          outputLines.push(
            { text: 'Portfolio terminal commands', isBanner: true },
            { label: 'bio', text: 'Read about Mohamed’s education and engineering background.' },
            { label: 'projects', text: 'Browse the software and infrastructure projects.' },
            { label: 'skills', text: 'See the languages, databases, and tools Mohamed uses.' },
            { label: 'coffee', text: 'Brew a virtual espresso.' },
            { label: 'experience', text: 'View Mohamed’s work history.' },
            { label: 'awards', text: 'View training, certifications, and awards.' },
            { label: 'contact', text: 'Find Mohamed’s email, phone, GitHub, and LinkedIn.' },
            { label: 'neofetch', text: 'Show the Mohamed-OS system information.' },
            { label: 'matrix', text: 'Toggle the digital rain effect.' },
            { label: 'sudo hire', text: 'Show hiring and contact information.' },
            { label: 'clear', text: 'Clear the terminal output.' }
          );
          break;

        case 'bio':
        case 'whoami':
          outputLines.push({ text: PORTFOLIO_DATA.profile.name, isBanner: true },
            { text: PORTFOLIO_DATA.profile.title }, { text: 'Helwan University · Software Engineering · 2022 – 2026' },
            { text: PORTFOLIO_DATA.profile.location });
          break;
        case 'projects':
          outputLines.push(...PORTFOLIO_DATA.projects.map(project => ({ label: project.title, text: project.role })),
            { label: 'DEPI Cloud Infrastructure', text: 'DevOps Engineer · Third place for Best Project' });
          break;
        case 'skills':
        case 'arsenal':
          outputLines.push({ label: 'Applications', text: 'React, Node.js, Express, Socket.IO, REST APIs' },
            { label: 'Data', text: 'MongoDB, MySQL, Neo4j' },
            { label: 'Infrastructure', text: 'Docker, Kubernetes, AWS, Terraform, Ansible, Jenkins' });
          break;

        case 'coffee':
        case 'code':
          outputLines.push(
            { text: '☕ Fresh espresso brewed // compiler turbo on!', isBanner: true },
            { label: '☕ Caffeine:', text: '100% double-shot developer espresso', isSuccess: true },
            { label: '⚡ Bugs fixed:', text: '9,999+ zero-warning production builds' },
            { label: '⌨️ Keyspeed:', text: '120 WPM RGB mechanical keycaps!' }
          );
          break;

        case 'experience':
        case 'history':
          outputLines.push({ label: 'Eyouth · Digilians', text: 'Project Coordinator · May 2026 – Present' },
            { label: '3C School', text: 'Programming Instructor · Jun 2025 – May 2026' },
            { label: 'Vodafone · Data & Fixed', text: 'Technical Support Representative · Jul 2024 – Dec 2024' },
            { label: 'Vodafone · Corporate', text: 'Technical Support Representative · Sep 2023 – Jan 2024' });
          break;
        case 'awards':
        case 'certifications':
          outputLines.push({ label: 'DevOps Engineer Track', text: 'Digital Egypt Pioneers Initiative (DEPI) · Jun 2025 – Dec 2025' },
            ...PORTFOLIO_DATA.certifications.map(cert => ({ label: cert.title, text: cert.issuer + ' · ' + cert.date })));
          break;
        case 'contact':
          outputLines.push({ label: 'Email', text: PORTFOLIO_DATA.profile.emails[0] },
            { label: 'Phone', text: '+20 101 579 1368' }, { label: 'GitHub', text: PORTFOLIO_DATA.profile.github },
            { label: 'LinkedIn', text: PORTFOLIO_DATA.profile.linkedin });
          break;

        case 'neofetch':
          outputLines.push(
            { text: 'Mohamed-os 2026 // system telemetry', isBanner: true },
            { label: 'Os:', text: 'Mohamed-os 2026 (pulp comic edition)', isSuccess: true },
            { label: 'Host:', text: 'Helwan-FCAI-coding-stage' },
            { label: 'Kernel:', text: '6.8.0-fullstack-MERN-Cairo' },
            { label: 'Socket sync:', text: '<15 ms real-time Socket.IO engine' },
            { label: 'Packages:', text: 'React 19, ts, Node.js, MongoDB, Neo4j, Redis' },
            { label: 'Physics:', text: '120hz hooke spring + 3D interactive coding props' },
            { label: 'Status:', text: 'All systems deployed & ready for hire!', isSuccess: true }
          );
          break;

        case 'matrix':
          setIsMatrixActive((prev) => !prev);
          audioManager.playSfx('warp');
          outputLines.push({
            text: isMatrixActive
              ? '⚡ PULP SULFUR-GOLD MATRIX RAIN DEACTIVATED!'
              : '⚡ PULP SULFUR-GOLD MATRIX RAIN ACTIVATED!',
            isSuccess: true,
          });
          break;

        case 'sudo hire':
        case 'hire':
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F2C94C', '#E62E25', '#5B3E96', '#10b981'],
          });
          audioManager.playSfx('warp');
          outputLines.push(
            { text: '★ Pow! Root executive hiring protocol unlocked! ★', isBanner: true },
            {
              label: '★ Status:',
              text: 'Immediately available for full-time SWE & full-stack roles (military exempt!)',
              isSuccess: true,
            },
            {
              label: '★ Dispatch:',
              text: 'Mohaamedtariq12@gmail.com  |  +20 101 579 1368',
            }
          );
          break;

        case 'clear':
          flushQueue();
          setLogs([]);
          return;

        default:
          outputLines.push({
            text: `Unknown command “${raw}”. Type help to see the available commands.`,
            isError: true,
          });
      }

      setLogs((prev) => [...prev, { text: `⚡ $ ${raw}`, isCommand: true }]);

      if (outputLines.length > 0) {
        queueRef.current = [...outputLines];
        const first = queueRef.current.shift()!;
        setIsStreaming(true);
        setCurrentStreamingLog(first);
        setDisplayedText('');
      }
    },
    [flushQueue, isStreaming, isMatrixActive]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isStreaming) flushQueue();
      handleCommand(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;
      const match = COMMAND_LIST.find((c) => c.startsWith(current));
      if (match) {
        setInput(match);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx + 1 < history.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else {
      audioManager.playSfx('key');
    }
  };

  const copyEmail = () => {
    audioManager.playSfx('click');
    navigator.clipboard.writeText('mohaamedtariq12@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickChips = [
    { label: 'Bio!', cmd: 'bio', tone: 'bg-[#F2C94C] text-[#09080D]' },
    { label: 'Projects!', cmd: 'projects', tone: 'bg-[#E62E25] text-white' },
    { label: 'Skills!', cmd: 'skills', tone: 'bg-[#F3E7D3] text-[#09080D]' },
    { label: 'Coffee!', cmd: 'coffee', tone: 'bg-[#F2C94C] text-[#09080D]' },
    { label: 'Experience!', cmd: 'experience', tone: 'bg-[#2A194D] text-[#F3E7D3]' },
    { label: 'Awards!', cmd: 'awards', tone: 'bg-[#E62E25] text-white' },
    { label: 'Neofetch!', cmd: 'neofetch', tone: 'bg-[#F3E7D3] text-[#09080D]' },
    { label: 'Sudo hire!', cmd: 'sudo hire', tone: 'bg-[#10b981] text-[#09080D]' },
    { label: 'Matrix!', cmd: 'matrix', tone: 'bg-[#5B3E96] text-white' },
    { label: 'Clear', cmd: 'clear', tone: 'bg-[#09080D] text-[#F2C94C]' },
  ];

  const renderLogLine = (log: TerminalLog, textOverride?: string, showCursor = false) => {
    const content = textOverride !== undefined ? textOverride : log.text;

    if (log.isBanner) {
      return (
        <div className="w-full my-1 px-2.5 py-1 bg-[#120F1A] border-2 border-[#E62E25] shadow-[3px_3px_0px_#F2C94C] flex items-center justify-between gap-2 overflow-hidden">
          <span className="text-[#E62E25] font-display text-[10px] sm:text-xs shrink-0">╔══</span>
          <span className="text-[#F2C94C] font-display text-[11px] sm:text-xs tracking-wider text-center truncate">
            {content}
            {showCursor && (
              <span className="inline-block w-2 h-3.5 bg-[#F2C94C] ml-1 align-middle animate-pulse" />
            )}
          </span>
          <span className="text-[#E62E25] font-display text-[10px] sm:text-xs shrink-0">══╗</span>
        </div>
      );
    }

    if (log.isCommand) {
      return (
        <div className="text-[#09080D] bg-[#F2C94C] px-2 py-0.5 border-2 border-[#09080D] shadow-[3px_3px_0px_#E62E25] font-display text-[11px] sm:text-xs tracking-wider inline-block my-1 -rotate-0.5 max-w-full break-all">
          {content}
        </div>
      );
    }

    if (log.isError) {
      return (
        <div className="text-white bg-[#E62E25] px-2 py-1 border-2 border-[#09080D] font-display text-[11px] sm:text-xs tracking-wider w-full break-words">
          {content}
        </div>
      );
    }

    return (
      <div
        className={`w-full text-[10.5px] sm:text-xs leading-snug break-words flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-0.5 border-b border-[#2A194D]/45 ${
          log.isSuccess
            ? 'text-[#10b981] font-bold comic-dialogue-text'
            : log.isHeader
            ? 'text-[#F2C94C] font-display tracking-wider'
            : log.isAccent
            ? 'text-[#E62E25] font-bold'
            : 'text-[#F3E7D3] comic-dialogue-text'
        }`}
      >
        {log.label && (
          <span className="text-[#F2C94C] font-display tracking-wider shrink-0 bg-[#120F1A] px-1.5 py-0.2 border border-[#5B3E96]/60 text-[10px] sm:text-[11px]">
            {log.label}
          </span>
        )}
        <span className="min-w-0 flex-1 break-words">
          {content}
          {showCursor && (
            <span className="inline-block w-2 h-3.5 bg-[#F2C94C] border border-[#09080D] ml-1 align-middle animate-pulse" />
          )}
        </span>
      </div>
    );
  };

  const terminalElement = (
    <div
      data-lenis-prevent="true"
      className={
        isFullscreen
          ? 'fixed inset-0 z-[99999] p-2.5 sm:p-6 bg-[#09080D]/98 backdrop-blur-2xl flex flex-col overflow-hidden'
          : `w-full max-w-full flex-1 flex flex-col border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] p-0 overflow-hidden min-h-0 bg-[#09080D] ${className}`
      }
    >
      {/* Matrix digital rain canvas layer when active */}
      {isMatrixActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-30 z-0"
        />
      )}

      {/* Halftone & CRT Scanline Overlay */}
      {scanlines && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-25 halftone-bg" />
      )}

      {/* =====================================================================
          COMIC BOOK SUPERCOMPUTER MASTHEAD BAR
          ===================================================================== */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-2.5 sm:px-3.5 py-2 bg-[#E62E25] border-b-4 border-[#09080D]">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Comic Diamond Control Bolts */}
          <button
            onClick={() => {
              if (isFullscreen) setIsFullscreen(false);
              else setLogs([]);
            }}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-45 bg-[#09080D] border-2 border-[#F2C94C] hover:bg-[#F2C94C] transition cursor-pointer shrink-0"
            title="Close / Flush Buffer"
          />
          <button
            onClick={() => setScanlines((prev) => !prev)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-45 bg-[#F2C94C] border-2 border-[#09080D] hover:bg-white transition cursor-pointer shrink-0"
            title="Toggle Halftone Scanlines"
          />
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-45 bg-[#10b981] border-2 border-[#09080D] hover:bg-white transition cursor-pointer shrink-0"
            title="Toggle Fullscreen Comic Command Center"
          />

          <span className="text-white text-[11px] sm:text-sm font-display tracking-wider ml-1 flex items-center gap-1 drop-shadow-[2px_2px_0px_#09080D] truncate">
            <TerminalIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F2C94C] shrink-0" />
            <span className="truncate">ZSH // PULP SUPERCOMPUTER v4.0</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Streaming Telemetry Pill */}
          {isStreaming && (
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-[#09080D] border-2 border-[#F2C94C] text-[9.5px] sm:text-[10px] font-display tracking-wider text-[#F2C94C] animate-pulse">
              <span className="hidden xs:inline">Streaming</span>
              <button
                onClick={flushQueue}
                className="text-white bg-[#E62E25] px-1 border border-[#09080D] cursor-pointer"
                title="Skip typewriter animation (Esc)"
              >
                Skip
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-[#09080D] border-2 border-[#09080D] text-[#10b981] font-display text-[10px] tracking-wider">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>120hz engine</span>
          </div>

          {/* Fullscreen Comic Stamp Toggle */}
          <button
            onClick={() => {
              audioManager.playSfx('warp');
              setIsFullscreen((prev) => !prev);
            }}
            className="px-2 py-0.5 bg-[#F2C94C] hover:bg-[#F3E7D3] text-[#09080D] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] transition cursor-pointer flex items-center gap-1 text-[10px] font-display tracking-wider -skew-x-6"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen Comic Command Center'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN TERMINAL BODY (UNORDINARY 12-COL SPLIT IN FULLSCREEN)
          ===================================================================== */}
      <div
        className={`relative z-20 flex-1 flex overflow-hidden ${
          isFullscreen ? 'unordinary-comic-grid p-2.5 sm:p-5 items-stretch' : ''
        }`}
      >
        {/* Terminal Output Log Area */}
        <div
          ref={logContainerRef}
          data-lenis-prevent="true"
          className={`p-2 sm:p-3 overflow-y-auto overflow-x-hidden space-y-1.5 custom-scrollbar overscroll-contain bg-[#09080D]/95 w-full ${
            isFullscreen
              ? 'col-span-12 lg:col-span-8 comic-panel-frame panel-tilt-left h-[58vh] lg:h-[72vh]'
              : logHeightClass || 'flex-1 min-h-[90px]'
          }`}
        >
          {logs.map((log, i) => (
            <div key={i} className="w-full">
              {renderLogLine(log)}
            </div>
          ))}

          {/* Active Typewriter Streaming Line */}
          {currentStreamingLog && (
            <div className="w-full">
              {renderLogLine(currentStreamingLog, displayedText, true)}
            </div>
          )}
        </div>

        {/* Fullscreen Unordinary Side Panels (Cols 9-12) */}
        {isFullscreen && (
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-3 sm:gap-4">
            <div className="comic-panel-frame panel-tilt-right comic-speedlines pt-6 pb-4 px-4 relative">
              <span className="comic-panel-number">Panel #02 // diagnostics</span>
              <span className="comic-sfx absolute -top-3.5 right-2 text-xs">
                NOMINAL!!
              </span>
              <div className="flex items-center justify-between border-b-2 border-[#09080D] pb-2 mb-3 mt-1">
                <span className="font-display text-sm tracking-wider text-[#F2C94C] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#E62E25]" />
                  Cluster telemetry
                </span>
                <span className="bg-[#10b981] text-[#09080D] font-display text-xs px-2 py-0.5 border border-[#09080D]">
                  Online
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-display text-xs tracking-wider text-[#F3E7D3] mb-1">
                    <span>Core load</span>
                    <span className="text-[#10b981]">14.2%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#09080D] border-2 border-[#F3E7D3]">
                    <div className="h-full bg-[#10b981] w-[14%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-display text-xs tracking-wider text-[#F3E7D3] mb-1">
                    <span>Memory residency</span>
                    <span className="text-[#F2C94C]">4.2 GB / 32 GB</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#09080D] border-2 border-[#F3E7D3]">
                    <div className="h-full bg-[#F2C94C] w-[26%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-display text-xs tracking-wider text-[#F3E7D3] mb-1">
                    <span>Socket.IO latency</span>
                    <span className="text-[#E62E25]">11.8 ms</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#09080D] border-2 border-[#F3E7D3]">
                    <div className="h-full bg-[#E62E25] w-[94%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="comic-narrator-box p-4 space-y-2.5">
              <div className="text-xs font-display tracking-wider text-[#8C1410]">
                ★ Panel #03 // authorized operator uplink
              </div>
              <div className="p-2.5 bg-[#09080D] border-2 border-[#09080D] text-[#F3E7D3] space-y-1 font-display tracking-wider text-xs">
                <div className="text-[#F2C94C] text-sm">Mohamed Tarek Hussien</div>
                <div className="text-[#10b981] break-all">mohaamedtariq12@gmail.com</div>
                <div className="text-[#CBC0E3]">+20 101 579 1368 • Cairo, Egypt</div>
              </div>
              <button
                onClick={copyEmail}
                className="comic-action-btn w-full flex items-center justify-center gap-2 px-3 py-2 text-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Email copied!' : 'Copy email address!'}</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* =====================================================================
          RESPONSIVE TILTED COMIC STICKER COMMAND CHIPS BAR (Wraps cleanly on all screens!)
          ===================================================================== */}
      <div className="relative z-20 px-2.5 sm:px-3 py-2 bg-[#2A194D] border-t-4 border-[#09080D] flex flex-wrap items-center gap-1.5">
        <span className="text-[#F2C94C] text-[10.5px] font-display tracking-wider shrink-0 mr-0.5">
          ⚡ Cmd:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={chip.label}
            onClick={() => {
              if (isStreaming) flushQueue();
              handleCommand(chip.cmd);
            }}
            className={`px-2 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] hover:shadow-[3px_3px_0px_#F2C94C] hover:-translate-y-0.5 text-[10px] sm:text-[11px] font-display tracking-wider transition cursor-pointer ${
              idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
            } ${chip.tone}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* =====================================================================
          INTERACTIVE COMIC COMMAND INPUT PROMPT BAR
          ===================================================================== */}
      <div className="relative z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 bg-[#F3E7D3] border-t-4 border-[#09080D]">
        <span className="px-1.5 sm:px-2 py-0.5 bg-[#E62E25] text-white border-2 border-[#09080D] font-display text-[10.5px] sm:text-xs tracking-wider select-none -rotate-2 shrink-0">
          Zsh &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type 'help', 'bio', 'projects', 'coffee'..."
          className="min-w-0 flex-1 bg-transparent text-[#09080D] placeholder-[#8C1410]/70 focus:outline-none font-display tracking-wider text-xs sm:text-sm "
        />
        <button
          onClick={() => {
            if (isStreaming) flushQueue();
            handleCommand(input);
            setInput('');
          }}
          className="comic-action-btn px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-xs flex items-center gap-1 cursor-pointer shrink-0"
          title="Execute Command (Enter)"
        >
          <span>Exec!</span>
          <CornerDownLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return (
      <>
        <div className={`w-full max-w-full flex-1 flex flex-col border-3 border-[#09080D] shadow-[4px_4px_0px_#09080D] p-3 overflow-hidden min-h-0 bg-[#09080D] items-center justify-center text-center ${className}`}>
          <div className="font-display text-xs text-[#F2C94C] mb-2 font-bold flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[#E62E25]" />
            <span>Zsh terminal expanded to fullscreen overlay</span>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-3 py-1 bg-[#E62E25] text-white border-2 border-[#09080D] font-display text-xs shadow-[2px_2px_0px_#09080D] cursor-pointer hover:bg-[#F2C94C] hover:text-[#09080D] font-bold"
          >
            Restore embedded view (esc)
          </button>
        </div>
        {createPortal(terminalElement, document.body)}
      </>
    );
  }

  return terminalElement;
}
