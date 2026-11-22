import { Mail, Phone, MapPin, Copy, Check, Terminal as TerminalIcon } from 'lucide-react';
import { useState } from 'react';
import { TerminalUI } from '../components/dom/TerminalUI';
import { audioManager } from '../utils/audio';
import { StageGridHeader } from '../components/dom/StageGridHeader';
import { useCommandStore } from '../store/useCommandStore';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { handleGmailComposeClick } from '../utils/openGmailCompose';

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const isTerminalFullscreen = useCommandStore((state) => state.isTerminalFullscreen);

  const copyEmail = () => {
    audioManager.playSfx('click');
    navigator.clipboard.writeText('mohaamedtariq12@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="sec-contact"
      data-section="07-contact"
      className={`stage-section relative ${isTerminalFullscreen ? 'z-50' : 'overflow-hidden'}`}
    >
      {/* Back Cover Header */}
      {!isTerminalFullscreen && (
        <StageGridHeader
          sector="BACK COVER // SUMMON THE ARCHITECT (06 CONTACT)"
          corridor="Cols 6-8 center avatar stage"
          badge="Immediate hire • military exempt"
        />
      )}

      {/* =====================================================================
          LEFT COLUMN (Cols 1-5): SUBTERRANEAN ZSH SUPERCOMPUTER COMIC PANEL
          ===================================================================== */}
      <div className={`terminal-column stage-content flex flex-col w-full gap-3.5 ${isTerminalFullscreen ? 'z-50' : 'z-10'}`}>
        {!isTerminalFullscreen && (
          <div className="space-y-2.5">
            <div className="comic-caption-tag text-xs">
              <TerminalIcon className="w-4 h-4" />
              <span>Chapter VI // subterranean control plane</span>
            </div>
            <h2 className="runic-spread-title text-3xl sm:text-5xl block">
              The dispatch sanctum
            </h2>

            {/* Speech Bubble Pointing Right Toward the Center Avatar in Cols 6-8 */}
            <div className="comic-speech-bubble comic-speech-bubble-right w-full relative">
              <p className="text-xs text-[#09080D] comic-dialogue-text">
                &ldquo;Working on a <span className="bg-[#F2C94C] px-1 border border-[#09080D]">full-stack project</span>? Get in touch, or type <code>help</code> in the terminal to explore the portfolio.&rdquo;
              </p>
            </div>
          </div>
        )}

        <div className="w-full relative pt-2">
          {!isTerminalFullscreen && (
            <>
              <span className="comic-panel-number">Panel #01 // Zsh kernel</span>
              <span className="comic-sfx absolute -top-2 right-3 text-xs">
                ROOT SHELL!!
              </span>
            </>
          )}
          <TerminalUI />
        </div>
      </div>

      {/* =====================================================================
          RIGHT COLUMN (Cols 9-12): UNORDINARY TILTED DISPATCH PANELS
          (Leaving Cols 6-8 100% Open for the Center 3D Avatar!)
          ===================================================================== */}
      <div className={`contact-column stage-content flex flex-col gap-4 z-10 w-full ${isTerminalFullscreen ? 'hidden' : ''}`}>
        {/* PANEL #02: Classified Operator Dispatch Stamp */}
        <div className="comic-panel-frame panel-tilt-right comic-speedlines pt-6 pb-3.5 px-4 flex items-center gap-3.5 relative">
          <span className="comic-panel-number">Panel #02 // operator</span>
          <span className="comic-sfx absolute -top-3.5 right-2 text-xs">
            HIRE NOW!!
          </span>
          <div className="relative w-13 h-13 border-3 border-[#F2C94C] shadow-[3px_3px_0px_#09080D] overflow-hidden shrink-0 -rotate-2">
            <img
              src={`${import.meta.env.BASE_URL}profile.jpg`}
              alt="Mohamed Tarek Hussien"
              className="w-full h-full object-cover object-top contrast-125"
            />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#10b981] border border-[#09080D]" />
          </div>
          <div>
            <div className="text-[10px] font-display tracking-widest text-[#F2C94C] ">
              Classified telegram // authorized
            </div>
            <div className="font-display text-[#F3E7D3] text-base tracking-wider">
              Mohamed Tarek Hussien
            </div>
            <div className="text-[11px] comic-dialogue-text text-[#CBC0E3]">
              Full-stack MERN &amp; software architect
            </div>
          </div>
        </div>

        {/* PANEL #03: Primary Email Stamp */}
        <div className="comic-panel-frame panel-slash-left pt-6 pb-3.5 px-4 relative">
          <span className="comic-panel-number">Panel #03 // direct transmission</span>
          <div className="flex items-center justify-between mb-1.5 mt-1">
            <span className="text-xs font-display tracking-wider text-[#F2C94C] flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              Primary email frequency
            </span>
            <button
              onClick={copyEmail}
              className="text-xs font-display tracking-wider px-2.5 py-0.5 bg-[#F2C94C] border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] text-[#09080D] hover:bg-[#E62E25] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy email address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy!</span>
                </>
              )}
            </button>
          </div>
          <a
            href={PORTFOLIO_DATA.profile.gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleGmailComposeClick}
            className="text-sm sm:text-base font-display tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition-colors break-all"
          >
            mohaamedtariq12@gmail.com
          </a>
        </div>

        {/* PANEL #04: Voice / WhatsApp + Location Asymmetric Split */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 comic-panel-frame panel-tilt-left pt-6 pb-3.5 px-3.5 relative">
            <span className="comic-panel-number">Panel #04 // comms</span>
            <div className="text-xs font-display tracking-wider text-[#F2C94C] flex items-center gap-1.5 mb-1 mt-1">
              <Phone className="w-3.5 h-3.5" />
              Voice &amp; WhatsApp
            </div>
            <a
              href="tel:+201015791368"
              className="font-display text-sm tracking-wider text-[#F3E7D3] hover:text-[#F2C94C] transition-colors block"
            >
              +20 101 579 1368
            </a>
          </div>

          <div className="sm:col-span-5 comic-starburst p-3.5 flex flex-col justify-between">
            <div className="text-xs font-display tracking-wider text-[#F2C94C] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Base HQ</span>
            </div>
            <div className="font-display text-base tracking-wider text-[#F3E7D3]">
              Cairo, Egypt
            </div>
            <div className="text-[10px] comic-dialogue-text text-[#10b981]">
              GMT+3 • full-time / remote
            </div>
          </div>
        </div>

        {/* PANEL #05: External Social Channels */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://github.com/MohaMedTArEk912"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioManager.playSfx('click')}
            className="comic-action-btn p-3 flex items-center gap-2.5 group"
          >
            <svg className="w-5 h-5 text-[#F2C94C] fill-current shrink-0" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <div>
              <div className="text-[9.5px] font-display tracking-widest text-[#F2C94C]">Code vault</div>
              <div className="text-sm font-display tracking-wider text-white truncate">
                GitHub repos!
              </div>
            </div>
          </a>

          <a
            href="https://www.linkedin.com/in/mohamed-tarek-184510337/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioManager.playSfx('click')}
            className="comic-gold-btn p-3 flex items-center gap-2.5 group"
          >
            <svg className="w-5 h-5 text-[#09080D] fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <div>
              <div className="text-[9.5px] font-display tracking-widest text-[#8C1410]">Alliance</div>
              <div className="text-sm font-display tracking-wider text-[#09080D] truncate">
                LinkedIn HQ!
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Issue #2026 Colophon Footer */}
      {!isTerminalFullscreen && (
        <footer className="col-span-12 w-full pt-6 mt-6 border-t-4 border-[#09080D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-display tracking-widest text-[#CBC0E3]">
          <div className="bg-[#09080D] px-3 py-1 border-2 border-[#F2C94C] -rotate-1">
            © 2026 Mohamed Tarek Hussien // The Architect Chronicles (issue #2026 • 25¢)
          </div>
          <div className="flex items-center gap-2 bg-[#E62E25] text-white px-3 py-1 border-2 border-[#09080D] shadow-[4px_4px_0px_#09080D] rotate-1">
            <span>★</span>
            <span>Hand-inked pulp GLSL shaders • unordinary comic grids • zero-downtime vibes</span>
          </div>
        </footer>
      )}
    </section>
  );
}
