import { ComicChapter } from '../ComicChapter';
import { PORTFOLIO_DATA } from '../../../data/portfolioData';

export function Vol4IcuSpread() {
  const project = PORTFOLIO_DATA.projects[1];
  return <ComicChapter volume={4} title="ICU Management System" role="Backend & Integration Developer"
    picture={{ art: 'icu-monitoring', alt: 'An illustrated intensive care monitoring station' }} artRight
    heading="One update, two screens" bullets={project.keyFeatures}>
    <div className="journal-links"><a className="journal-link" href={project.githubUrl} target="_blank" rel="noopener noreferrer">Repository ↗</a></div>
  </ComicChapter>;
}
