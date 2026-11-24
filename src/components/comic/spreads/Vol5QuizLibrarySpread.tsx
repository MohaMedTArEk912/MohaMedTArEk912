import { useState } from 'react';
import { ComicChapter } from '../ComicChapter';
import { PORTFOLIO_DATA } from '../../../data/portfolioData';

export function Vol5QuizLibrarySpread() {
  const [library, setLibrary] = useState(false);
  const project = PORTFOLIO_DATA.projects[library ? 3 : 2];
  return <ComicChapter volume={5} title={library ? 'Library Management System' : 'Competitive Quiz Platform'} role={project.role}
    picture={{ art: library ? 'library' : 'quiz', alt: library ? 'A comic-book library with rows of shelves' : 'Players in a multiplayer quiz arena' }}
    heading={library ? 'Leading a team of five' : 'Building a multiplayer round'} bullets={project.keyFeatures}>
    <div role="group" aria-label="Choose project">
      <div className="forge-options"><button aria-pressed={!library} onClick={() => setLibrary(false)}>Quiz Platform</button>
      <button aria-pressed={library} onClick={() => setLibrary(true)}>Library System</button></div></div>
    <div className="journal-links">
      {project.liveUrl && <a className="journal-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live app ↗</a>}
      <a className="journal-link" href={project.githubUrl} target="_blank" rel="noopener noreferrer">Repository ↗</a>
    </div>
  </ComicChapter>;
}
