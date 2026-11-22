export type ComicArt =
  | 'architect-cover'
  | 'forge'
  | 'devops'
  | 'akasha-blueprint'
  | 'icu-monitoring'
  | 'quiz'
  | 'library'
  | 'dojo'
  | 'dawn';

interface ComicArtPanelProps {
  art: ComicArt;
  alt: string;
  caption?: string;
  priority?: boolean;
  variant?: 'primary' | 'secondary';
  panelTag?: string;
}

export function ComicArtPanel({
  art,
  alt,
  caption,
  priority = false,
  variant = 'primary',
  panelTag,
}: ComicArtPanelProps) {
  const isCover = art === 'architect-cover';
  const file =
    variant === 'secondary'
      ? isCover
        ? 'cairo-drafting-table.jpg'
        : `volumes/${art}.jpg`
      : `${art}.webp`;

  return (
    <figure className={`comic-art-panel comic-art-${art} comic-art-variant-${variant}`}>
      {panelTag && (
        <span className="comic-panel-tag" aria-hidden="true">
          {panelTag}
        </span>
      )}
      <img
        src={`${import.meta.env.BASE_URL}comic/${file}`}
        alt={alt}
        width={1280}
        height={720}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
