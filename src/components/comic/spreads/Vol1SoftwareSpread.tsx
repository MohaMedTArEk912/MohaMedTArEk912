import { ComicChapter } from '../ComicChapter';

export function Vol1SoftwareSpread() {
  return <ComicChapter volume={1} title="Engineering Foundations" role="Software Engineering Department · Helwan University · 2022 – 2026"
    picture={{ art: 'forge', alt: 'An engineer arranging a branching tree of brass nodes next to a laptop', priority: true }}
    heading="Education and tools" bullets={['Bachelor’s in Computer Science and Information, 2022 – 2026.', 'Write software in JavaScript, TypeScript, Python, Java, and C.', 'Work with MongoDB, MySQL, and Neo4j.']} />;
}
