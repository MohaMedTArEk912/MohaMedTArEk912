import type { ComponentProps, ReactNode } from 'react';
import { ComicArtPanel } from './ComicArtPanel';

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

export function ComicChapter({ volume, title, role, picture, heading, bullets, children, artRight }: ChapterProps) {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return <div className={'comic-spread-solid journal-spread' + (artRight ? ' art-right' : '')}>
    <section className={'comic-page-half comic-page-half-stage journal-scene ' + (artRight ? 'comic-page-half-right' : 'comic-page-half-left')}>
      <div className="forge-folio"><b>Vol. {numerals[volume - 1]}</b><span>The Architect Chronicles</span></div>
      <h2 className="chapter-lettering">{title}</h2>
      <p className="journal-role">{role}</p>
      <ComicArtPanel {...picture}/>
    </section>
    <section className={'comic-page-half journal-notes ' + (artRight ? 'comic-page-half-left' : 'comic-page-half-right')}>
      <div className="forge-folio"><span>Field notes</span><span>{String(volume * 2 + (artRight ? 1 : 2)).padStart(2, '0')}</span></div>
      <div className="comic-leaf-notes">
        <h3 className="journal-heading">{heading}</h3>
        <ul className="journal-bullets">{bullets.map(text => <li key={text}>{text}</li>)}</ul>
      </div>
      {children}
    </section>
  </div>;
}
