import * as THREE from 'three';

export function createKeycapTexture(
  symbol: string,
  subtext: string,
  accentColor: string,
  bgColor = '#14111F'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Keycap dish background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle inner keycap bevel border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, 224, 224);

  // Top-left corner LED dot
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(42, 42, 8, 0, Math.PI * 2);
  ctx.fill();

  // Main Code Symbol
  ctx.fillStyle = '#F3E7D3';
  ctx.font = '900 84px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 128, 118);

  // Sub-legend
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 28px monospace';
  ctx.fillText(subtext, 128, 198);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createCodeScreenTexture(
  filename: string,
  codeLines: { text: string; color: string }[],
  accentColor = '#F2C94C'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // IDE Dark Background
  ctx.fillStyle = '#0B0914';
  ctx.fillRect(0, 0, 512, 320);

  // Outer Frame Border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 314);

  // Top Title Bar
  ctx.fillStyle = '#19142A';
  ctx.fillRect(6, 6, 500, 42);

  // Window Traffic Light Dots
  const dots = ['#E62E25', '#F2C94C', '#10B981'];
  dots.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(28 + i * 22, 27, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Filename Tab
  ctx.fillStyle = '#F3E7D3';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(filename, 105, 27);

  // Code Lines with Line Numbers
  ctx.font = 'bold 21px monospace';
  codeLines.forEach((line, idx) => {
    const y = 78 + idx * 34;
    // Line number
    ctx.fillStyle = '#6E5D8E';
    ctx.fillText(String(idx + 1).padStart(2, '0'), 20, y);
    // Code content
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 64, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createMugBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E62E25';
  ctx.fillRect(0, 0, 512, 256);

  // Comic border stripes
  ctx.fillStyle = '#09080D';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 238, 512, 18);

  // Center badge
  ctx.fillStyle = '#F2C94C';
  ctx.fillRect(80, 44, 352, 168);
  ctx.strokeStyle = '#09080D';
  ctx.lineWidth = 10;
  ctx.strokeRect(80, 44, 352, 168);

  ctx.fillStyle = '#09080D';
  ctx.font = '900 58px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('<CODE/>', 256, 106);

  ctx.fillStyle = '#8C1410';
  ctx.font = 'bold 30px monospace';
  ctx.fillText('100% DEV FUEL', 256, 168);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
