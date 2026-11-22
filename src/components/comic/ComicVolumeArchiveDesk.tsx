import { ArrowUpRight, Award, BookOpen, FileText } from 'lucide-react';
import { COMIC_VOLUMES } from '../../data/comicVolumes';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { useCommandStore } from '../../store/useCommandStore';
import { lazy, Suspense } from 'react';
import { ComicArtPanel } from './ComicArtPanel';
import { resumeUrl } from '../resume/resumeData';
import { GmailIcon } from '../dom/GmailIcon';
import { handleGmailComposeClick } from '../../utils/openGmailCompose';



const AudioSynthesizer = lazy(() => import('../dom/AudioSynthesizer').then(module => ({ default: module.AudioSynthesizer })));

export function ComicVolumeArchiveDesk() {
  const setActiveIssueIndex = useCommandStore((state) => state.setActiveIssueIndex);
  const { name, location, gmailComposeUrl } = PORTFOLIO_DATA.profile;

  return (
    <div className="comic-spread-solid comic-archive">
      <section className="comic-page-half comic-page-half-left comic-archive-cover">
        <header className="comic-cover-masthead">
          <p className="comic-cover-imprint">The Architect Chronicles</p>
          <h1>{name}</h1>
          <p className="comic-cover-role">Full-Stack Software Engineer</p>
          <p className="comic-cover-specialty">MERN &amp; DevOps · {location}</p>
        </header>

        <ComicArtPanel
          art="architect-cover"
          alt="Comic-book portrait of Mohamed at his workstation overlooking Cairo at dusk"
          priority
        />

        <div className="comic-cover-footer">
          <p className="comic-cover-honor">
            <Award size={18} aria-hidden="true" />
            <span>Third place · Best Project in the DEPI DevOps track</span>
          </p>
          <div className="comic-cover-actions">
            <button type="button" onClick={() => setActiveIssueIndex(1)} className="comic-cover-action comic-cover-action-primary"><BookOpen size={17}/> Start reading</button>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="comic-cover-action">
              <FileText size={17} aria-hidden="true" /> View résumé
            </a>
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGmailComposeClick}
              aria-label="Open Gmail to compose an email to Mohamed"
              title="Open Gmail to compose an email to Mohamed"
              className="comic-cover-action comic-cover-action-email"
            >
              <GmailIcon size={17} />
              <span>Email Mohamed</span>
              <ArrowUpRight size={14} className="comic-cover-action-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="comic-page-half comic-page-half-right comic-archive-contents" aria-labelledby="comic-contents">
        <header className="comic-archive-heading">
          <h2 id="comic-contents">Contents</h2>
          <Suspense fallback={null}><AudioSynthesizer /></Suspense>
        </header>
        <ol className="comic-archive-volumes">
          {COMIC_VOLUMES.map(({ number, title, subject, art }, index) => (
            <li key={number}>
              <button type="button" className="comic-volume-link" onClick={() => setActiveIssueIndex(index + 1)}>
                <span className="comic-volume-number" aria-hidden="true">{number}</span>
                <span className="comic-volume-copy">
                  <span className="comic-volume-title">{title}</span>
                  <span className="comic-volume-subject">{subject}</span>
                </span>
                <span className="comic-volume-art" aria-hidden="true">
                  <img src={`${import.meta.env.BASE_URL}comic/${art}.webp`} alt="" loading="lazy" decoding="async" />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
