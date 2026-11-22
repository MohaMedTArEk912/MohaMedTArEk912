import type { ComponentProps, ReactNode } from 'react';
import { ComicArtPanel } from './ComicArtPanel';
import { ComicActionWord, type ActionWordMotion, type ActionWordTone } from './ComicActionWord';

interface ChapterMeta {
  numeral: string;
  word: string;
  secondaryWord: string;
  motion: ActionWordMotion;
  tone: ActionWordTone;
  layout: 'diagonal-hero' | 'omega-split' | 'cross-action' | 'command-mosaic';
  narratorLead: string;
  speechQuote: string;
  achievementTitle: string;
  achievementValue: string;
  techTags: string[];
  secondaryCaption: string;
}

const CHAPTER_META: Record<number, ChapterMeta> = {
  1: {
    numeral: 'I',
    word: 'POW!',
    secondaryWord: 'ZAP!',
    motion: 'pow',
    tone: 'red-gold',
    layout: 'diagonal-hero',
    narratorLead: 'ORIGIN FILE // HELWAN UNIVERSITY · CAIRO',
    speechQuote: '“EVERY GREAT ARCHITECTURE STARTS WITH ALGORITHMS & DATA STRUCTURES!”',
    achievementTitle: 'ACADEMIC CORE',
    achievementValue: 'B.Sc. Software Engineering · Class of 2026',
    techTags: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'MongoDB', 'MySQL', 'Neo4j'],
    secondaryCaption: 'FIG 1.2 // Balancing trees & polyglot data models',
  },
  2: {
    numeral: 'II',
    word: 'BOOM!',
    secondaryWord: 'WHOOSH!',
    motion: 'boom',
    tone: 'blue-gold',
    layout: 'omega-split',
    narratorLead: 'MISSION LOG // DIGITAL EGYPT PIONEERS INITIATIVE',
    speechQuote: '“ZERO-DOWNTIME PIPELINES DEPLOYED — KUBERNETES PODS AT FULL THRUST!”',
    achievementTitle: 'DEPI NATIONAL HONOR',
    achievementValue: '3rd Place · Best Project in DevOps Track',
    techTags: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana'],
    secondaryCaption: 'FIG 2.4 // Automated CI/CD & cloud telemetry deck',
  },
  3: {
    numeral: 'III',
    word: 'ZAP!',
    secondaryWord: 'BAM!',
    motion: 'zap',
    tone: 'gold-red',
    layout: 'cross-action',
    narratorLead: 'GRADUATION BLUEPRINT // AKASHA PLATFORM',
    speechQuote: '“TRANSFORMING RAW IDEAS INTO SYSTEM ARCHITECTURE & API SCHEMAS!”',
    achievementTitle: 'GRADUATION LEADERSHIP',
    achievementValue: 'Team Lead & Full-Stack Architect · Helwan',
    techTags: ['System Architecture', 'Database Design', 'REST APIs', 'Applied AI', 'Git Workflows', 'Real-Time Collab'],
    secondaryCaption: 'FIG 3.1 // Collaborative blueprint & schema synthesis',
  },
  4: {
    numeral: 'IV',
    word: 'WHOOSH!',
    secondaryWord: 'POW!',
    motion: 'whoosh',
    tone: 'emerald-gold',
    layout: 'command-mosaic',
    narratorLead: 'CRITICAL TELEMETRY // ICU MANAGEMENT SYSTEM',
    speechQuote: '“MILLISECOND SOCKET.IO BROADCASTS KEEP EVERY CLINICAL MONITOR IN SYNC!”',
    achievementTitle: 'REAL-TIME ENGINE',
    achievementValue: 'Live Clinical Event Stream & REST API Core',
    techTags: ['Node.js', 'Express.js', 'MongoDB', 'Socket.IO', 'REST APIs', 'Clinical Telemetry'],
    secondaryCaption: 'FIG 4.3 // Multi-screen patient record synchronization',
  },
  5: {
    numeral: 'V',
    word: 'BAM!',
    secondaryWord: 'KABOOM!',
    motion: 'bam',
    tone: 'red-gold',
    layout: 'diagonal-hero',
    narratorLead: 'DUAL ARENA // MULTIPLAYER QUIZ & LIBRARY SYSTEMS',
    speechQuote: '“SOLO FULL-STACK VELOCITY MEETS 5-ENGINEER AGILE TEAM DELIVERY!”',
    achievementTitle: 'PRODUCTION SHIPPING',
    achievementValue: 'Solo MERN Live App + 5-Member Team Lead',
    techTags: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Socket.IO', 'Tailwind CSS', 'JWT Auth', 'Git PR Reviews'],
    secondaryCaption: 'FIG 5.2 // Live competitive rooms & responsive catalog UI',
  },
  6: {
    numeral: 'VI',
    word: 'KABOOM!',
    secondaryWord: 'DAA!',
    motion: 'pow',
    tone: 'blue-gold',
    layout: 'omega-split',
    narratorLead: 'TRAINING DOJO // 3C SCHOOL · JUN 2025 – MAY 2026',
    speechQuote: '“DEBUGGING LIVE WITH STUDENTS TURNS COMPLEX LOGIC INTO SECOND NATURE!”',
    achievementTitle: 'MENTORSHIP IMPACT',
    achievementValue: 'Programming Instructor · Algorithms & Projects',
    techTags: ['Algorithms', 'Problem Solving', 'Live Debugging', 'Code Reviews', 'Student Projects', 'Mentorship'],
    secondaryCaption: 'FIG 6.1 // Hands-on coding lab & step-by-step decomposition',
  },
  7: {
    numeral: 'VII',
    word: 'DAA!',
    secondaryWord: 'BOOM!',
    motion: 'boom',
    tone: 'gold-red',
    layout: 'cross-action',
    narratorLead: 'DISPATCH COMMAND // EYOUTH · DIGILIANS & VODAFONE',
    speechQuote: '“COORDINATING COHORTS, MENTORS, AND ENTERPRISE SLA INCIDENTS UNDER PRESSURE!”',
    achievementTitle: 'OPERATIONS & SLA',
    achievementValue: 'Project Coordinator (2026–Present) & Vodafone Support',
    techTags: ['Program Coordination', 'Milestone Tracking', 'Mentor Ops', 'Enterprise SLA', 'DSL & Broadband', 'Incident Escalation'],
    secondaryCaption: 'FIG 7.2 // Cairo operations desk & milestone radar',
  },
};

interface ChapterProps {
  volume: number;
  title: string;
  role: string;
  picture: ComponentProps<typeof ComicArtPanel>;
  heading: string;
  bullets: string[];
  children?: ReactNode;
  artRight?: boolean;
}

export function ComicChapter({
  volume,
  title,
  role,
  picture,
  heading,
  bullets,
  children,
  artRight,
}: ChapterProps) {
  const meta = CHAPTER_META[volume] || CHAPTER_META[1];
  const leftPageNum = String(volume * 2 - 1).padStart(2, '0');
  const rightPageNum = String(volume * 2).padStart(2, '0');

  return (
    <div
      data-layout={meta.layout}
      data-volume={volume}
      className={'comic-spread-solid journal-spread' + (artRight ? ' art-right' : '')}
    >
      {/* =================================================================
          PAGE 1 (SCENE SPLASH & ASYMMETRIC ILLUSTRATED COMIC PANELS)
          ================================================================= */}
      <section
        className={
          'comic-page-half comic-page-half-stage journal-scene ' +
          (artRight ? 'comic-page-half-right' : 'comic-page-half-left')
        }
      >
        <div className="forge-folio">
          <b>VOL. {meta.numeral} // ISSUE #0{volume}</b>
          <span>{meta.narratorLead}</span>
          <b>PG. {artRight ? rightPageNum : leftPageNum}</b>
        </div>

        {/* Dramatic Comic Splash Header Box */}
        <header className="comic-splash-header">
          <div className="comic-splash-title-row">
            <span className="comic-issue-badge" aria-hidden="true">
              CH. 0{volume}
            </span>
            <h2 className="chapter-lettering">{title}</h2>
          </div>
          <p className="journal-role">{role}</p>
        </header>

        {/* Bizarre / Asymmetric Dual-Panel Illustrated Stage */}
        <div className="comic-bizarre-scene-grid">
          <div className="comic-hero-panel-frame">
            <ComicArtPanel
              {...picture}
              variant="primary"
              panelTag={`PANEL 0${volume}.A // MAIN SCENE`}
            />
            <ComicActionWord
              word={meta.word}
              motion={meta.motion}
              tone={meta.tone}
              className="chapter-impact"
            />
          </div>

          {/* Secondary Angled Supporting Art + Speech Bubble Strip */}
          <div className="comic-supporting-strip">
            <div className="comic-secondary-art-frame">
              <ComicArtPanel
                art={picture.art}
                alt={`${picture.alt} — alternate angle`}
                variant="secondary"
                caption={meta.secondaryCaption}
                panelTag={`0${volume}.B`}
              />
            </div>

            <div className="comic-speech-bubble" aria-hidden="true">
              <span className="comic-speech-speaker">ARCHITECT DISPATCH //</span>
              <p>{meta.speechQuote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          PAGE 2 (IRREGULAR MULTI-PANEL STORYTELLING, BURST & TECH TERMINAL)
          ================================================================= */}
      <section
        className={
          'comic-page-half journal-notes ' +
          (artRight ? 'comic-page-half-left' : 'comic-page-half-right')
        }
      >
        <div className="forge-folio">
          <span>FIELD NOTES &amp; TELEMETRY</span>
          <b>PG. {artRight ? leftPageNum : rightPageNum}</b>
        </div>

        <div className="comic-leaf-notes">
          {/* Narrator Caption Banner + Secondary Action Burst */}
          <div className="comic-narrator-banner">
            <span className="comic-narrator-tag" aria-hidden="true">
              CHRONICLE LOG // 0{volume}
            </span>
            <h3 className="journal-heading">{heading}</h3>
            <ComicActionWord
              word={meta.secondaryWord}
              motion="zap"
              tone={meta.tone === 'red-gold' ? 'blue-gold' : 'red-gold'}
              className="comic-narrator-sfx"
            />
          </div>

          {/* Irregular Multi-Panel Story Grid (Factual Portfolio Bullets) */}
          <ul className="journal-bullets">
            {bullets.map((text, idx) => (
              <li key={text} className={`comic-story-panel comic-story-panel-${idx + 1}`}>
                <span className="comic-story-panel-index" aria-hidden="true">
                  PANEL 0{idx + 1}
                </span>
                <span className="comic-story-panel-text">{text}</span>
              </li>
            ))}
          </ul>

          {/* Bottom Asymmetric Split: Explosion Achievement Panel + Terminal Tech Panel */}
          <div className="comic-telemetry-mosaic">
            <div className="comic-explosion-achievement">
              <span className="comic-explosion-kicker">{meta.achievementTitle}</span>
              <strong className="comic-explosion-value">{meta.achievementValue}</strong>
            </div>

            <div className="comic-terminal-tech-panel" aria-label="Chapter technologies">
              <div className="comic-terminal-tech-bar" aria-hidden="true">
                <span className="comic-terminal-dot" />
                <span>SYS_STACK // VOL_{meta.numeral}</span>
              </div>
              <div className="comic-terminal-tags">
                {meta.techTags.map((tag) => (
                  <span key={tag} className="comic-terminal-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {children && <div className="comic-chapter-actions-bar">{children}</div>}
      </section>
    </div>
  );
}
