const artDimensions = {
  'architect-cover': [1280, 720],
  'akasha-blueprint': [1050, 458],
  'icu-monitoring': [1050, 457],
  forge: [1152, 768],
  devops: [960, 640],
  quiz: [960, 640],
  library: [960, 640],
  dojo: [1152, 768],
  dawn: [1440, 720],
} as const;

type ComicArt = keyof typeof artDimensions;

interface ComicArtPanelProps {
  art: ComicArt;
  alt: string;
  caption?: string;
  priority?: boolean;
}

export function ComicArtPanel({ art, alt, caption, priority = false }: ComicArtPanelProps) {
  const [width, height] = artDimensions[art];
  return (
    <figure className={`comic-art-panel comic-art-${art}`}>
      <img src={`${import.meta.env.BASE_URL}comic/${art}.webp`} alt={alt} width={width} height={height}
        decoding="async" fetchPriority={priority ? 'high' : 'auto'} draggable={false} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
