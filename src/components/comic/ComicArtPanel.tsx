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
  panelTag?: string;
}

export function ComicArtPanel({
  art,
  alt,
  caption,
  priority = false,
  panelTag,
}: ComicArtPanelProps) {
  const isCover = art === 'architect-cover';
  const file = isCover ? 'cairo-drafting-table.jpg' : `volumes/${art}.jpg`;

  return (
    <figure className={`comic-art-panel comic-art-${art}`}>
      {panelTag && (
        <span className="comic-panel-tag" aria-hidden="true">
          {panelTag}
        </span>
      )}
      <img
        src={`${import.meta.env.BASE_URL}comic/${file}`}
        alt={alt}
        width={isCover ? 1536 : 1152}
        height={isCover ? 1024 : 768}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
