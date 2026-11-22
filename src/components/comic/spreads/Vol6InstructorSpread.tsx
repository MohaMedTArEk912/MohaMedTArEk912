import { ComicChapter } from '../ComicChapter';


export function Vol6InstructorSpread() {
  return <ComicChapter volume={6} title="Teaching & Mentoring" role="Programming Instructor · 3C School · Jun 2025 – May 2026"
    picture={{ art: 'dojo', alt: 'An instructor tracing a programming exercise with students at a workbench' }} artRight
    heading="Teaching through practice"
    bullets={['Taught programming fundamentals and algorithmic problem-solving.', 'Guided students through debugging exercises and coding projects.', 'Broke complex ideas into steps students could try themselves.']}>
  </ComicChapter>;
}
