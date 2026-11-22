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
  speechQuote: string;
  achievementTitle: string;
  achievementValue: string;
  techTags: string[];
}

const CHAPTER_META: Record<number, ChapterMeta> = {
  1: {
    numeral: 'I',
    word: 'POW!',
    secondaryWord: 'ZAP!',
    motion: 'pow',
    tone: 'red-gold',
    layout: 'diagonal-hero',
    speechQuote: '“EVERY GREAT ARCHITECTURE STARTS WITH ALGORITHMS & DATA STRUCTURES!”',
    achievementTitle: 'ACADEMIC CORE',
    achievementValue: 'B.Sc. Software Engineering · Class of 2026',
    techTags: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'MongoDB', 'MySQL', 'Neo4j'],
  },
  2: {
    numeral: 'II',
    word: 'BOOM!',
    secondaryWord: 'WHOOSH!',
    motion: 'boom',
    tone: 'blue-gold',
    layout: 'omega-split',
    speechQuote: '“ZERO-DOWNTIME PIPELINES DEPLOYED — KUBERNETES PODS AT FULL THRUST!”',
    achievementTitle: 'DEPI NATIONAL HONOR',
    achievementValue: '3rd Place · Best Project in DevOps Track',
    techTags: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana'],
  },
  3: {
    numeral: 'III',
    word: 'ZAP!',
    secondaryWord: 'BAM!',
    motion: 'zap',
    tone: 'gold-red',
    layout: 'cross-action',
    speechQuote: '“TRANSFORMING RAW IDEAS INTO SYSTEM ARCHITECTURE & API SCHEMAS!”',
    achievementTitle: 'GRADUATION LEADERSHIP',
    achievementValue: 'Team Lead & Full-Stack Architect · Helwan',
    techTags: ['System Architecture', 'Database Design', 'REST APIs', 'Applied AI', 'Git Workflows', 'Real-Time Collab'],
  },
  4: {
    numeral: 'IV',
    word: 'WHOOSH!',
    secondaryWord: 'POW!',
    motion: 'whoosh',
    tone: 'emerald-gold',
    layout: 'command-mosaic',
    speechQuote: '“MILLISECOND SOCKET.IO BROADCASTS KEEP EVERY CLINICAL MONITOR IN SYNC!”',
    achievementTitle: 'REAL-TIME ENGINE',
    achievementValue: 'Live Clinical Event Stream & REST API Core',
    techTags: ['Node.js', 'Express.js', 'MongoDB', 'Socket.IO', 'REST APIs', 'Clinical Telemetry'],
  },
  5: {
    numeral: 'V',
    word: 'BAM!',
    secondaryWord: 'KABOOM!',
    motion: 'bam',
    tone: 'red-gold',
    layout: 'diagonal-hero',
    speechQuote: '“SOLO FULL-STACK VELOCITY MEETS 5-ENGINEER AGILE TEAM DELIVERY!”',
    achievementTitle: 'PRODUCTION SHIPPING',
    achievementValue: 'Solo MERN Live App + 5-Member Team Lead',
    techTags: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Socket.IO', 'Tailwind CSS', 'JWT Auth', 'Git PR Reviews'],
  },
  6: {
    numeral: 'VI',
    word: 'KABOOM!',
    secondaryWord: 'DAA!',
    motion: 'pow',
    tone: 'blue-gold',
    layout: 'omega-split',
    speechQuote: '“DEBUGGING LIVE WITH STUDENTS TURNS COMPLEX LOGIC INTO SECOND NATURE!”',
    achievementTitle: 'MENTORSHIP IMPACT',
    achievementValue: 'Programming Instructor · Algorithms & Projects',
    techTags: ['Algorithms', 'Problem Solving', 'Live Debugging', 'Code Reviews', 'Student Projects', 'Mentorship'],
  },
  7: {
    numeral: 'VII',
    word: 'DAA!',
    secondaryWord: 'BOOM!',
    motion: 'boom',
    tone: 'gold-red',
    layout: 'cross-action',
    speechQuote: '“COORDINATING COHORTS, MENTORS, AND ENTERPRISE SLA INCIDENTS UNDER PRESSURE!”',
    achievementTitle: 'OPERATIONS & SLA',
    achievementValue: 'Project Coordinator (2026–Present) & Vodafone Support',
    techTags: ['Program Coordination', 'Milestone Tracking', 'Mentor Ops', 'Enterprise SLA', 'DSL & Broadband', 'Incident Escalation'],
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

  return (
    <div
      data-layout={meta.layout}
      data-volume={volume}
      className={'comic-spread-solid journal-spread' + (artRight ? ' art-right' : '')}
    >
      {/* =================================================================
          PAGE 1 (SINGLE LARGE COMIC ILLUSTRATION, SPLASH HEADER & SPEECH)
          ================================================================= */}
      <section
        className={
          'comic-page-half comic-page-half-stage journal-scene ' +
          (artRight ? 'comic-page-half-right' : 'comic-page-half-left')
        }
      >
        <header className="comic-splash-header">
          <div className="comic-splash-title-row">
            <span className="comic-issue-badge" aria-hidden="true">
              VOL. {meta.numeral}
            </span>
            <h2 className="chapter-lettering">{title}</h2>
          </div>
          <p className="journal-role">{role}</p>
        </header>

        {/* Single Large Comic-Book Illustration Panel */}
        <div className="comic-single-hero-stage">
          <ComicArtPanel
            {...picture}
            panelTag={`VOL. ${meta.numeral} // ILLUSTRATED SCENE`}
          />
          <ComicActionWord
            word={meta.word}
            motion={meta.motion}
            tone={meta.tone}
            className="chapter-impact"
          />
        </div>

        {/* Bold Comic Speech Bubble */}
        <div className="comic-speech-bubble" aria-hidden="true">
          <span className="comic-speech-speaker">ARCHITECT DISPATCH //</span>
          <p>{meta.speechQuote}</p>
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
        <div className="comic-leaf-notes">
          {/* Narrator Caption Banner + Secondary Action Burst */}
          <div className="comic-narrator-banner">
            <span className="comic-narrator-tag" aria-hidden="true">
              CHRONICLE LOG // VOLUME {meta.numeral}
            </span>
            <h3 className="journal-heading">{heading}</h3>
            <ComicActionWord
              word={meta.secondaryWord}
              motion="zap"
              tone={meta.tone === 'red-gold' ? 'blue-gold' : 'red-gold'}
              className="comic-narrator-sfx"
            />
          </div>

          {/* 3 Horizontal Comic Story Strips (Factual Portfolio Bullets) */}
          <ul className="journal-bullets">
            {bullets.map((text, idx) => (
              <li key={text} className={`comic-story-panel comic-story-panel-${idx + 1}`}>
                <span className="comic-story-panel-index" aria-hidden="true">
                  0{idx + 1}
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
