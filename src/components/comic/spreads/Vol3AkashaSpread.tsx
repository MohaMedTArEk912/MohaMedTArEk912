import { ComicChapter } from '../ComicChapter';
import { PORTFOLIO_DATA } from '../../../data/portfolioData';


export function Vol3AkashaSpread() {
  const project = PORTFOLIO_DATA.projects[0];
  return <ComicChapter volume={3} title="Akasha Platform" role="Team Lead & Full-Stack Engineer · Helwan Graduation Project"
    picture={{ art: 'akasha-blueprint', alt: 'Engineering teammates reviewing an architectural blueprint' }}
    heading="An idea becomes a blueprint" bullets={project.keyFeatures}>
    <div className="journal-links"><a className="journal-link" href={project.githubUrl}>Repository ↗</a></div>
  </ComicChapter>;
}
