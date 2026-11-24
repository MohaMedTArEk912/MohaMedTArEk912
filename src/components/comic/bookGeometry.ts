/**
 * Single source of truth for the physical size of the comic.
 *
 * A real book has ONE page size: the closed hardcover is exactly as big as one
 * page of the open spread. These helpers mirror the CSS that sizes the open
 * spread (`.comic-open-book` / `.comic-book-physical-shell`) so the closed 3D
 * book can be sized to match it, which makes closing a single continuous
 * object instead of two different scenes.
 */

export interface BookGeometry {
  /** On-screen width of one open page (px). */
  leafW: number;
  /** On-screen height of one open page (px). */
  leafH: number;
  /** Width / height of one open page, clamped to what the cover layout supports. */
  aspect: number;
  /** On-screen width of the closed hardcover resting on the desk (px). */
  footprintW: number;
}

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));

export function computeBookGeometry(stageW: number, stageH: number): BookGeometry {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let leafW: number;
  let leafH: number;

  if (stageW < 1180 || stageH < 660) {
    // Compact screens render the fixed 1320x740 desktop spread scaled down.
    const sc = Math.max(0.26, Math.min(1, (stageW - 20) / 1320, (stageH - 20) / 740));
    leafW = ((1320 - 8) / 2) * sc;
    leafH = (740 - 8) * sc;
  } else {
    const padX = clamp(2 * rem, 0.044 * vw, 4.8 * rem);
    const padTop = clamp(2.1 * rem, 0.054 * vh, 4 * rem);
    const padBottom = clamp(2.3 * rem, 0.058 * vh, 4.2 * rem);
    const shellW = Math.min(stageW - 2 * padX, 1.62 * vh, 1560);
    const shellH = Math.min(stageH - padTop - padBottom, 0.55 * vw, 0.87 * vh);
    leafW = (shellW - 8) / 2;
    leafH = shellH - 8;
  }

  // Never narrower than the original cover layout was designed for.
  const aspect = clamp(0.77, leafW / Math.max(1, leafH), 1);
  const heightFactor = stageH <= 560 ? 0.701 : 0.831;
  const footprintW = Math.min(0.82 * stageW, heightFactor * stageH * aspect, 34.5 * rem);

  return { leafW, leafH, aspect, footprintW };
}
