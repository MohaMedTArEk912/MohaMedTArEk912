export type ActionWordMotion = 'pow' | 'boom' | 'whoosh' | 'zap' | 'bam';
export type ActionWordTone = 'red-gold' | 'blue-gold' | 'gold-red' | 'emerald-gold';

interface ComicActionWordProps {
  word: string;
  motion?: ActionWordMotion;
  tone?: ActionWordTone;
  className?: string;
}

const TONE_MAP: Record<ActionWordTone, { burst: string; inner: string; text: string }> = {
  'red-gold': { burst: '#E62E25', inner: '#FFCF39', text: '#FFF4D5' },
  'blue-gold': { burst: '#1859AD', inner: '#FFCF39', text: '#FFF4D5' },
  'gold-red': { burst: '#FFCF39', inner: '#E62E25', text: '#171319' },
  'emerald-gold': { burst: '#0E9F6E', inner: '#FFCF39', text: '#FFF4D5' },
};

export function ComicActionWord({
  word,
  motion = 'pow',
  tone = 'gold-red',
  className = '',
}: ComicActionWordProps) {
  const palette = TONE_MAP[tone];
  return (
    <span
      className={`comic-sfx comic-sfx-${motion} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 120"
        className="comic-sfx-svg"
        focusable="false"
        aria-hidden="true"
      >
        {/* Outer jagged explosion burst */}
        <polygon
          points="8,24 42,28 34,4 78,22 108,2 134,24 184,6 172,36 214,42 190,68 212,102 164,96 168,118 122,100 84,118 66,94 12,108 28,70"
          fill={palette.burst}
          stroke="#151217"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Inner offset burst */}
        <polygon
          points="24,34 52,36 48,16 84,30 108,14 130,32 168,18 160,42 194,48 174,68 192,92 154,88 156,106 120,90 88,106 74,86 28,96 40,68"
          fill={palette.inner}
          stroke="#151217"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="comic-sfx-text" style={{ color: palette.text }}>
        {word}
      </span>
    </span>
  );
}
