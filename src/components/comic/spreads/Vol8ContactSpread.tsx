import { useId, useState, type CSSProperties, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Copy,
  GitFork,
  Terminal,
} from 'lucide-react';
import { PORTFOLIO_DATA } from '../../../data/portfolioData';
import { GmailIcon } from '../../dom/GmailIcon';
import { handleGmailComposeClick } from '../../../utils/openGmailCompose';
import { ComicActionWord } from '../ComicActionWord';

const { emails, gmailComposeUrl, github, linkedin, location, education } = PORTFOLIO_DATA.profile;
const commands: Record<string, string> = {
  help: 'Try bio, projects, skills, experience, awards, contact, or clear.',
  bio: 'Full-stack engineer based in Cairo. Studied software engineering at Helwan University from 2022 to 2026.',
  projects: 'Akasha · DEPI Cloud Infrastructure · ICU Management · Quiz Platform · Library Management',
  skills: 'React · Node.js · Socket.IO · MongoDB · Kubernetes · Terraform · AWS',
  experience: 'Eyouth · Digilians · 3C School · Vodafone',
  awards: 'Third place for Best Project in the DEPI DevOps Engineer track.',
  contact: emails[0],
};
const shortcuts = ['help', 'projects', 'skills', 'contact'];

function AppearingText({
  text,
  interval,
  delay = 0,
}: {
  text: string;
  interval: number;
  delay?: number;
}) {
  return Array.from(text, (letter, index) => (
    <span
      key={index}
      className="contact-letter"
      style={{ animationDelay: `${delay + index * interval}ms` }}
    >
      {letter}
    </span>
  ));
}

function DispatchTerminal() {
  const titleId = useId();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState({ id: 0, command: '', message: commands.help });

  const typingDelay = response.id === 0 ? 180 : 30;
  const typingInterval = 14;

  function run(command: string) {
    const name = command.trim().toLowerCase();
    if (!name) return;
    const message =
      name === 'clear'
        ? 'Ready for a command.'
        : Object.hasOwn(commands, name)
          ? commands[name]
          : 'Unknown command. Type help to see the list.';
    setResponse((previous) => ({
      id: previous.id + 1,
      command: name === 'clear' ? '' : name,
      message,
    }));
    setInput('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(input);
  }

  return (
    <section className="dispatch-terminal" aria-labelledby={titleId}>
      <h2 id={titleId}>
        <Terminal size={18} aria-hidden="true" /> Portfolio terminal
      </h2>
      <div className="dispatch-controls">
        <form onSubmit={submit} className="dispatch-prompt">
          <label className="dispatch-field">
            <span className="sr-only">Terminal command</span>
            <span aria-hidden="true">$</span>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a command"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={32}
              enterKeyHint="go"
            />
          </label>
          <button type="submit">
            Run <ArrowRight size={15} aria-hidden="true" />
          </button>
        </form>
        <div className="dispatch-shortcuts" role="group" aria-label="Quick commands">
          {shortcuts.map((command) => (
            <button key={command} type="button" onClick={() => run(command)}>
              {command}
            </button>
          ))}
        </div>
      </div>
      <div className="dispatch-response">
        <div aria-hidden="true">
          {response.command && <b>$ {response.command}</b>}
          <p
            key={response.id}
            className="dispatch-message"
            style={
              {
                '--dispatch-cursor-delay': `${typingDelay + response.message.length * typingInterval}ms`,
              } as CSSProperties
            }
          >
            <AppearingText text={response.message} interval={typingInterval} delay={typingDelay} />
          </p>
        </div>
        <p className="sr-only" role="status">
          {response.message}
        </p>
      </div>
    </section>
  );
}

export function Vol8ContactSpread() {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(emails[0]);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('unavailable');
    }
  }

  return (
    <article className="comic-spread-solid contact-page contact-spread-grid">
      {/* LEFT PAGE: COMIC FINALE SPLASH & DIRECT SIGNAL CARDS */}
      <section className="comic-page-half comic-page-half-left contact-splash-half">
        <div className="forge-folio">
          <b>VOL. VIII // ISSUE FINALE</b>
          <span>CAIRO DISPATCH HQ</span>
          <b>PG. 15</b>
        </div>

        <header className="comic-splash-header">
          <div className="comic-splash-title-row">
            <span className="comic-issue-badge" aria-hidden="true">
              CH. 08
            </span>
            <h1 className="chapter-lettering contact-page-title" aria-label="Terminal & Contact">
              <span aria-hidden="true">
                <AppearingText text="Terminal & Contact" interval={28} delay={40} />
              </span>
            </h1>
          </div>
          <p className="journal-role">
            Direct Signal · {location} · {education.university} ({education.period})
          </p>
        </header>

        <div className="contact-comic-visual-stage">
          <figure className="contact-hero-art-frame">
            <span className="comic-panel-tag" aria-hidden="true">
              PANEL 08.A // OPEN ARCHIVE
            </span>
            <img
              src={`${import.meta.env.BASE_URL}comic/volumes/contact.jpg`}
              alt="Illustrated Cairo dispatch terminal desk"
              width="1152"
              height="768"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </figure>
          <ComicActionWord
            word="KABOOM!"
            motion="pow"
            tone="red-gold"
            className="contact-sfx-badge"
          />
        </div>

        <div className="contact-speech-panel" aria-hidden="true">
          <strong>TRANSMISSION READY //</strong>
          <span>
            “Whether you need a MERN full-stack engineer, real-time Socket.IO architecture, or automated Kubernetes &amp; AWS delivery — let’s build!”
          </span>
        </div>

        <div className="contact-details">
          <nav className="contact-actions" aria-label="Contact links">
            <a
              className="contact-email"
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGmailComposeClick}
              aria-label="Open Gmail to compose an email to Mohamed"
              title="Open Gmail to compose an email to Mohamed"
            >
              <GmailIcon size={17} /> Gmail <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <button type="button" onClick={copyEmail}>
              {copyStatus === 'copied' ? (
                <Check size={17} aria-hidden="true" />
              ) : (
                <Copy size={17} aria-hidden="true" />
              )}
              {copyStatus === 'copied' ? 'Email copied' : 'Copy email'}
            </button>
            <a href={github} target="_blank" rel="noopener noreferrer">
              <GitFork size={17} aria-hidden="true" /> GitHub
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              <BriefcaseBusiness size={17} aria-hidden="true" /> LinkedIn
            </a>
          </nav>
          <p
            className={copyStatus === 'unavailable' ? 'dispatch-copy-status' : 'sr-only'}
            role="status"
          >
            {copyStatus === 'copied'
              ? 'Email address copied.'
              : copyStatus === 'unavailable'
                ? emails[0]
                : ''}
          </p>
        </div>
      </section>

      {/* RIGHT PAGE: INTERACTIVE COMIC MAINFRAME TERMINAL */}
      <section className="comic-page-half comic-page-half-right contact-terminal-half">
        <div className="forge-folio">
          <span>INTERACTIVE COMMAND CONSOLE</span>
          <b>PG. 16</b>
        </div>

        <div className="contact-page-body">
          <div className="comic-narrator-banner">
            <span className="comic-narrator-tag" aria-hidden="true">
              MAINFRAME CLI // 08
            </span>
            <h3 className="journal-heading">Query the Engineering Archive</h3>
          </div>

          <DispatchTerminal />

          <div className="contact-dossier-grid">
            <div className="contact-dossier-card">
              <span className="contact-dossier-label">PRIMARY EMAIL</span>
              <strong>{emails[0]}</strong>
            </div>
            <div className="contact-dossier-card">
              <span className="contact-dossier-label">SPECIALIZATION</span>
              <strong>Full-Stack MERN &amp; Cloud DevOps</strong>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
