#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../assets/hero");
const featuredProjectsPath = resolve(scriptDirectory, "../data/featured-projects.json");
const defaultSourcePath = resolve(scriptDirectory, "../assets/profile.png");

function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) {
    throw new Error("Source image must be a valid PNG.");
  }

  let offset = 8;
  let width, height, colorType;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data.readUInt8(9);
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const decompressed = inflateSync(Buffer.concat(idatChunks));
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const rowStride = 1 + width * bytesPerPixel;
  const pixels = new Uint8Array(width * height * 4);

  const prevRow = new Uint8Array(width * bytesPerPixel);
  const currRow = new Uint8Array(width * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * rowStride];
    const rowOffset = y * rowStride + 1;

    for (let i = 0; i < width * bytesPerPixel; i++) {
      const raw = decompressed[rowOffset + i];
      const a = i >= bytesPerPixel ? currRow[i - bytesPerPixel] : 0;
      const b = prevRow[i];
      const c = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;

      let val = raw;
      if (filterType === 0) {
        val = raw;
      } else if (filterType === 1) {
        val = (raw + a) & 0xff;
      } else if (filterType === 2) {
        val = (raw + b) & 0xff;
      } else if (filterType === 3) {
        val = (raw + Math.floor((a + b) / 2)) & 0xff;
      } else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        val = (raw + pr) & 0xff;
      }
      currRow[i] = val;
    }

    for (let x = 0; x < width; x++) {
      const pixelIdx = (y * width + x) * 4;
      if (colorType === 6) {
        pixels[pixelIdx] = currRow[x * 4];
        pixels[pixelIdx + 1] = currRow[x * 4 + 1];
        pixels[pixelIdx + 2] = currRow[x * 4 + 2];
        pixels[pixelIdx + 3] = currRow[x * 4 + 3];
      } else if (colorType === 2) {
        pixels[pixelIdx] = currRow[x * 3];
        pixels[pixelIdx + 1] = currRow[x * 3 + 1];
        pixels[pixelIdx + 2] = currRow[x * 3 + 2];
        pixels[pixelIdx + 3] = 255;
      }
    }
    prevRow.set(currRow);
  }

  return { width, height, pixels };
}

function buildSegmentationMask(imageData) {
  const { width, height, pixels } = imageData;
  const mask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 65) continue;

      // Cap region (y: 65 - 142)
      if (y < 142) {
        if (Math.hypot((x - 231) / 94, (y - 120) / 54) <= 1.02 && lum > 25) {
          mask[y * width + x] = 1;
        }
        continue;
      }

      // Forehead & Eyes (y: 142 - 215)
      if (y < 215) {
        if (x >= 142 && x <= 320 && lum > 15) {
          mask[y * width + x] = 1;
        }
        continue;
      }

      // Nose & Ears (y: 215 - 270)
      if (y < 270) {
        const inFace = (x >= 148 && x <= 314 && lum > 15);
        const inLeftEar = (x >= 126 && x < 148 && r > 65 && r > b + 15 && lum > 25);
        const inRightEar = (x > 314 && x <= 336 && r > 65 && r > b + 15 && lum > 25);
        if (inFace || inLeftEar || inRightEar) {
          mask[y * width + x] = 1;
        }
        continue;
      }

      // Mouth, Jawline & Beard (y: 270 - 355)
      if (y < 355) {
        const progress = (y - 270) / 85;
        const leftJaw = 146 + progress * 24;
        const rightJaw = 316 - progress * 24;
        if (x >= leftJaw && x <= rightJaw && lum > 15) {
          mask[y * width + x] = 1;
        }
        continue;
      }

      // Neck & Shoulders (y >= 355)
      const progress = Math.min(1, (y - 355) / 85);
      const shoulderLeft = Math.max(0, 140 - progress * 140);
      const shoulderRight = Math.min(460, 320 + progress * 140);

      if (x >= shoulderLeft && x <= shoulderRight) {
        const isShirt = (g > 50 && g > r + 10);
        const isSkin = (r > 60 && r > b + 10);
        const isNeckShadow = (Math.abs(x - 231) < 65 && lum > 20);
        if (isShirt || isSkin || isNeckShadow) {
          mask[y * width + x] = 1;
        }
      }
    }
  }

  return mask;
}

function samplePortrait(imageData, columns, rows, mode = "dark") {
  const { width, height, pixels } = imageData;
  const personMask = buildSegmentationMask(imageData);

  const cropW = 380;
  const cropH = 390;
  const cropX = 231 - cropW / 2;
  const cropY = 65;

  const charsDark = " .':-=+*#%@";
  const charsLight = "@%#*+=-:'. ";

  const lums = new Float32Array(columns * rows);
  const sampleMask = new Uint8Array(columns * rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const srcX = Math.round(cropX + (c / (columns - 1)) * cropW);
      const srcY = Math.round(cropY + (r / (rows - 1)) * cropH);
      const idx = r * columns + c;

      if (
        srcX < 0 ||
        srcX >= width ||
        srcY < 0 ||
        srcY >= height ||
        personMask[srcY * width + srcX] === 0
      ) {
        sampleMask[idx] = 0;
        lums[idx] = 0;
      } else {
        sampleMask[idx] = 1;
        const pIdx = (srcY * width + srcX) * 4;
        const red = pixels[pIdx];
        const green = pixels[pIdx + 1];
        const blue = pixels[pIdx + 2];
        lums[idx] = 0.299 * red + 0.587 * green + 0.114 * blue;
      }
    }
  }

  const lines = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      if (sampleMask[idx] === 0) {
        line += " ";
        continue;
      }

      const lum = lums[idx];
      const left = c > 0 && sampleMask[r * columns + c - 1] ? lums[r * columns + c - 1] : lum;
      const right = c < columns - 1 && sampleMask[r * columns + c + 1] ? lums[r * columns + c + 1] : lum;
      const up = r > 0 && sampleMask[(r - 1) * columns + c] ? lums[(r - 1) * columns + c] : lum;
      const down = r < rows - 1 && sampleMask[(r + 1) * columns + c] ? lums[(r + 1) * columns + c] : lum;

      const edge = Math.hypot(right - left, down - up) / 255;

      if (mode === "dark") {
        let val = (lum - 15) / 235;
        val = Math.pow(Math.max(0, Math.min(1, val)), 0.88);
        const intensity = Math.min(1, Math.max(0, val * 0.90 + edge * 0.22));
        const charIdx = Math.min(charsDark.length - 1, Math.floor(intensity * (charsDark.length - 1)));
        line += charsDark[charIdx];
      } else {
        let val = 1 - (lum - 15) / 235;
        val = Math.pow(Math.max(0, Math.min(1, val)), 1.12);
        const intensity = Math.min(1, Math.max(0, val * 0.90 + edge * 0.22));
        const charIdx = Math.min(charsLight.length - 1, Math.floor(intensity * (charsLight.length - 1)));
        line += charsLight[charIdx];
      }
    }
    lines.push(line);
  }

  return lines;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createAsciiTspans(lines, placement) {
  return lines
    .map(
      (line, row) =>
        `<tspan x="${placement.x}" y="${(placement.y + row * placement.lineHeight).toFixed(2)}" xml:space="preserve">${escapeXml(line)}</tspan>`
    )
    .join("\n");
}

function buildProfileLines(projects) {
  const shortNames = {
    "Akasha-Platform": "Akasha",
    "Quiz-Platform": "Quiz Platform",
    "ICU-Management-System": "ICU System",
    "Library-Management-System": "Library App",
    "Cloud DevOps Pipeline": "DevOps / DEPI"
  };

  return [
    { type: "header", value: "tarek@devops-node" },
    { type: "row", key: "Name", value: "Mohamed Tarek Hussien" },
    { type: "row", key: "Role", value: "Software Engineer" },
    { type: "row", key: "Domain", value: "Full-Stack & DevOps / Cloud" },
    { type: "row", key: "Based", value: "Cairo, Egypt" },
    { type: "row", key: "Mode", value: "Architecting / Building / Scaling" },
    { type: "blank" },
    { type: "section", value: "ENGINEERING.FOCUS" },
    { type: "row", key: "Full-Stack", value: "MERN, Real-Time & REST APIs" },
    { type: "row", key: "DevOps", value: "Docker, K8s, CI/CD, AWS, IaC" },
    { type: "row", key: "AI Platform", value: "System Architecture & Workflows" },
    { type: "row", key: "Quality", value: "Testing, Metrics & Monitoring" },
    { type: "blank" },
    { type: "section", value: "SELECTED.WORK" },
    ...projects.map((project) => ({
      type: "row",
      key: shortNames[project.name] ?? project.name,
      value: project.focus
    })),
    { type: "blank" },
    { type: "footer", value: "SCALABLE WEB & CLOUD INFRASTRUCTURE" }
  ];
}

const palettes = {
  dark: {
    backgroundStart: "#0D1117",
    backgroundEnd: "#161B22",
    panel: "#161B22",
    primary: "#F0F6FC",
    muted: "#8B949E",
    cyan: "#58A6FF",
    blue: "#79C0FF",
    violet: "#A371F7",
    green: "#3FB950",
    red: "#58A6FF",
    portraitStart: "#58A6FF",
    portraitEnd: "#3FB950",
    scanBlend: "screen"
  },
  light: {
    backgroundStart: "#F6F8FA",
    backgroundEnd: "#EAEEF2",
    panel: "#FFFFFF",
    primary: "#24292F",
    muted: "#57606A",
    cyan: "#0969DA",
    blue: "#0550AE",
    violet: "#8250DF",
    green: "#1F883D",
    red: "#CF222E",
    portraitStart: "#0969DA",
    portraitEnd: "#1F883D",
    scanBlend: "multiply"
  }
};

const layouts = {
  desktop: {
    width: 1180,
    height: 610,
    outerRadius: 18,
    titlebar: { x: 3, y: 3, width: 1174, height: 34, radius: 16 },
    visualPanel: { x: 14, y: 64, width: 488, height: 468, radius: 14 },
    infoPanel: { x: 508, y: 48, width: 655, height: 500, radius: 14 },
    visualTitle: { x: 30, y: 62 },
    infoTitle: { x: 524, y: 62 },
    portrait: { columns: 96, rows: 64, x: 28, y: 88, lineHeight: 6.65, fontSize: 6.5 },
    portraitClip: { x: 24, y: 82, width: 470, height: 438, radius: 12 },
    system: { x: 528, y: 82, width: 620, lineHeight: 21.5, fontSize: 14 },
    footerY: 585
  },
  mobile: {
    width: 720,
    height: 1080,
    outerRadius: 22,
    titlebar: { x: 20, y: 20, width: 680, height: 42, radius: 14 },
    visualPanel: { x: 48, y: 94, width: 624, height: 350, radius: 14 },
    infoPanel: { x: 48, y: 470, width: 624, height: 526, radius: 14 },
    visualTitle: { x: 66, y: 116 },
    infoTitle: { x: 66, y: 492 },
    portrait: { columns: 84, rows: 54, x: 56, y: 130, lineHeight: 5.7, fontSize: 6.6 },
    portraitClip: { x: 58, y: 122, width: 604, height: 312, radius: 12 },
    system: { x: 72, y: 520, width: 574, lineHeight: 21, fontSize: 13 },
    footerY: 1045
  }
};

function buildAmbientPortraitLayer(layout, colors, size) {
  const clip = layout.portraitClip;
  const isDesktop = size === "desktop";
  const centerX = clip.x + clip.width * (isDesktop ? 0.5 : 0.5);
  const centerY = clip.y + clip.height * (isDesktop ? 0.48 : 0.45);
  const orbitWidth = clip.width * (isDesktop ? 0.88 : 0.82);
  const orbitHeight = clip.height * (isDesktop ? 0.58 : 0.62);

  const left = clip.x + (isDesktop ? 28 : 34);
  const right = clip.x + clip.width - (isDesktop ? 28 : 34);
  const top = clip.y + (isDesktop ? 46 : 38);
  const bottom = clip.y + clip.height - (isDesktop ? 42 : 30);

  return `<g clip-path="url(#portrait-clip)" class="ambient-map" aria-hidden="true">
  <rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" fill="url(#portrait-grid)"/>
  <ellipse cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.54).toFixed(1)}" ry="${(orbitHeight * 0.54).toFixed(1)}" fill="url(#portrait-halo)"/>
  <ellipse class="motion-orbit motion-orbit--forward" style="transform-origin:${centerX.toFixed(1)}px ${centerY.toFixed(1)}px" cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.5).toFixed(1)}" ry="${(orbitHeight * 0.5).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" stroke-dasharray="3 14" opacity="0.25"/>
  <ellipse class="motion-orbit motion-orbit--backward" style="transform-origin:${centerX.toFixed(1)}px ${centerY.toFixed(1)}px" cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.4).toFixed(1)}" ry="${(orbitHeight * 0.38).toFixed(1)}" fill="none" stroke="${colors.violet}" stroke-width="1" stroke-dasharray="28 24" opacity="0.2"/>
  <path d="M ${left} ${top} H ${left + (isDesktop ? 42 : 62)} M ${left} ${top} V ${top + (isDesktop ? 42 : 54)} M ${right} ${bottom} H ${right - (isDesktop ? 42 : 62)} M ${right} ${bottom} V ${bottom - (isDesktop ? 42 : 54)}" fill="none" stroke="${colors.cyan}" stroke-width="1.2" opacity="0.4"/>
  <path d="M ${left} ${(centerY + 42).toFixed(1)} C ${(left + 32).toFixed(1)} ${(centerY + 8).toFixed(1)}, ${(centerX - orbitWidth * 0.3).toFixed(1)} ${(centerY + 58).toFixed(1)}, ${(centerX - orbitWidth * 0.19).toFixed(1)} ${(centerY + 27).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" opacity="0.25"/>
  <path d="M ${right} ${(centerY - 52).toFixed(1)} C ${(right - 38).toFixed(1)} ${(centerY - 18).toFixed(1)}, ${(centerX + orbitWidth * 0.31).toFixed(1)} ${(centerY - 70).toFixed(1)}, ${(centerX + orbitWidth * 0.2).toFixed(1)} ${(centerY - 30).toFixed(1)}" fill="none" stroke="${colors.green}" stroke-width="1" opacity="0.25"/>
  <g fill="${colors.cyan}">
    <circle cx="${left}" cy="${top}" r="2.2" opacity="0.6"/>
    <circle cx="${right}" cy="${bottom}" r="2.2" opacity="0.6"/>
    <circle cx="${left + (isDesktop ? 12 : 18)}" cy="${(centerY + 48).toFixed(1)}" r="1.7" opacity="0.5"/>
    <circle cx="${right - (isDesktop ? 10 : 16)}" cy="${(centerY - 58).toFixed(1)}" r="1.7" opacity="0.5"/>
  </g>
</g>`;
}

function buildSystemLayer({ x, y, lineHeight, fontSize }, colors, profileLines) {
  const rows = [];

  profileLines.forEach((line, index) => {
    if (line.type === "blank") return;

    const lineY = y + index * lineHeight;

    if (line.type === "header") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-head"><tspan fill="${colors.violet}">${escapeXml(line.value)}</tspan><tspan fill="${colors.muted}"> ------------------------------------------</tspan></text>`);
      return;
    }

    if (line.type === "section") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-section" fill="${colors.green}">- ${escapeXml(line.value)} -----------------------------------</text>`);
      return;
    }

    if (line.type === "footer") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-footer" fill="${colors.blue}">${escapeXml(line.value)}</text>`);
      return;
    }

    const dots = ".".repeat(Math.max(3, 14 - line.key.length));
    rows.push(
      `<text x="${x}" y="${lineY}" class="system-row"><tspan fill="${colors.muted}">. </tspan><tspan class="system-key" fill="${colors.cyan}">${escapeXml(line.key)}</tspan><tspan fill="${colors.muted}">: ${dots} </tspan><tspan fill="${colors.primary}">${escapeXml(line.value)}</tspan></text>`
    );
  });

  return rows.join("\n");
}

function createHeroSvg(mode, size, portrait, profileLines) {
  const colors = palettes[mode];
  const layout = layouts[size];
  const titlebar = layout.titlebar;
  const visual = layout.visualPanel;
  const info = layout.infoPanel;
  const clip = layout.portraitClip;
  const isDesktop = size === "desktop";

  const ascii = createAsciiTspans(portrait, layout.portrait);
  const ambientPortrait = buildAmbientPortraitLayer(layout, colors, size);
  const system = buildSystemLayer(layout.system, colors, profileLines);

  const titleCenter = titlebar.x + titlebar.width / 2;
  const liveX = titlebar.x + titlebar.width - (isDesktop ? 150 : 94);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="title description">
<title id="title">Mohamed Tarek Hussien - Software Engineer (Full-Stack &amp; DevOps)</title>
<desc id="description">A builder profile card with Mohamed Tarek's ASCII portrait, tech focus, and selected projects.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.backgroundStart}"/><stop offset="1" stop-color="${colors.backgroundEnd}"/></linearGradient>
  <linearGradient id="ascii-signal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.portraitStart}"/><stop offset="1" stop-color="${colors.portraitEnd}"/></linearGradient>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors.violet}"/><stop offset="0.48" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.green}"/></linearGradient>
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${colors.cyan}" stop-opacity="0.46"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></linearGradient>
  <radialGradient id="portrait-halo"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0.12"/><stop offset="0.48" stop-color="${colors.blue}" stop-opacity="0.055"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></radialGradient>
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${colors.cyan}" opacity="0.052"/></pattern>
  <pattern id="portrait-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 H 0 V 44" fill="none" stroke="${colors.blue}" stroke-width="0.65" opacity="0.085"/><circle cx="0" cy="0" r="1.2" fill="${colors.cyan}" opacity="0.13"/></pattern>
  <clipPath id="portrait-clip"><rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" rx="${clip.radius}"/></clipPath>
  <style>
    .mono { font-family: 'Courier New', Consolas, monospace; }
    .ascii { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.portrait.fontSize}px; letter-spacing: -0.15px; fill: url(#ascii-signal); font-weight: 600; }
    .panel-title { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 11 : 12}px; letter-spacing: 2px; fill: ${colors.blue}; opacity: 0.88; font-weight: 700; }
    .terminal-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 12 : 11}px; letter-spacing: 0.5px; fill: ${colors.muted}; font-weight: 600; }
    .live-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 10 : 9}px; letter-spacing: 1px; fill: ${colors.green}; font-weight: 700; }
    .system-head { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize + 2}px; font-weight: 700; }
    .system-section, .system-footer, .system-row { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize}px; }
    .system-section, .system-key { font-weight: 700; }
    text, tspan { white-space: pre; }
    .motion-orbit { transform-box: view-box; }
    @keyframes orbit-forward { to { transform: rotate(360deg); } }
    @keyframes orbit-backward { to { transform: rotate(-360deg); } }
    @keyframes scan-sweep { from { transform: translateY(0); } to { transform: translateY(${layout.height + 140}px); } }
    @media (prefers-reduced-motion: no-preference) {
      .motion-orbit--forward { animation: orbit-forward 42s linear infinite; }
      .motion-orbit--backward { animation: orbit-backward 34s linear infinite; }
      .motion-scan { animation: scan-sweep 8s linear infinite; }
    }
    @media (prefers-reduced-motion: reduce) {
      .motion-scan { display: none; }
    }
  </style>
</defs>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#background)"/>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#scanlines)"/>
<rect x="${titlebar.x}" y="${titlebar.y}" width="${titlebar.width}" height="${titlebar.height}" rx="${titlebar.radius}" fill="${colors.panel}" fill-opacity="0.84"/>
<circle cx="${titlebar.x + 21}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.cyan}" opacity="0.88"/>
<circle cx="${titlebar.x + 39}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.violet}" opacity="0.7"/>
<circle cx="${titlebar.x + 57}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.green}" opacity="0.78"/>
<text x="${titleCenter}" y="${titlebar.y + titlebar.height / 2 + 5}" text-anchor="middle" class="terminal-label">tarek@devops-node ~ % ./profile</text>
${isDesktop ? `<circle cx="${liveX}" cy="${titlebar.y + titlebar.height / 2}" r="4" fill="${colors.green}"/><text x="${liveX + 10}" y="${titlebar.y + titlebar.height / 2 + 4}" class="live-label">ONLINE</text>` : ""}
<rect x="${visual.x}" y="${visual.y}" width="${visual.width}" height="${visual.height}" rx="${visual.radius}" fill="${colors.panel}" fill-opacity="0.38" stroke="url(#border)" stroke-opacity="0.42"/>
<rect x="${info.x}" y="${info.y}" width="${info.width}" height="${info.height}" rx="${info.radius}" fill="${colors.panel}" fill-opacity="0.42" stroke="url(#border)" stroke-opacity="0.42"/>
<text x="${layout.visualTitle.x}" y="${layout.visualTitle.y}" class="panel-title">PORTRAIT / MOHAMED</text>
<text x="${layout.infoTitle.x}" y="${layout.infoTitle.y}" class="panel-title">PROFILE / ENGINEER</text>
${ambientPortrait}
<g clip-path="url(#portrait-clip)"><text class="ascii" fill="${colors.cyan}" font-family="'Courier New', Consolas, monospace" font-size="${layout.portrait.fontSize}px" letter-spacing="-0.15px">${ascii}</text></g>
${system}
<text x="${layout.width / 2}" y="${layout.footerY}" text-anchor="middle" class="mono" font-size="10" letter-spacing="1.5" fill="${colors.muted}">FULL-STACK / DEVOPS / CLUSTER ORCHESTRATION / CLOUD SYSTEMS</text>
<rect class="motion-scan" x="0" y="-70" width="${layout.width}" height="70" fill="url(#scan)" opacity="0.42" style="mix-blend-mode:${colors.scanBlend}"/>
<rect x="3" y="3" width="${layout.width - 6}" height="${layout.height - 6}" rx="${layout.outerRadius - 2}" fill="none" stroke="url(#border)" stroke-width="2" opacity="0.76"/>
</svg>`;
}

const outputs = [
  { filename: "builder-profile-v2-dark.svg", mode: "dark", size: "desktop" },
  { filename: "builder-profile-v2-light.svg", mode: "light", size: "desktop" },
  { filename: "builder-profile-v2-mobile-dark.svg", mode: "dark", size: "mobile" },
  { filename: "builder-profile-v2-mobile-light.svg", mode: "light", size: "mobile" }
];

function normalizeSvg(value) {
  return `${value.trimEnd()}\n`;
}

function getSourcePath() {
  const sourceIndex = process.argv.indexOf("--source");
  if (sourceIndex !== -1 && process.argv[sourceIndex + 1]) {
    return resolve(process.argv[sourceIndex + 1]);
  }
  return defaultSourcePath;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const sourcePath = getSourcePath();
  const projects = JSON.parse(await readFile(featuredProjectsPath, "utf8"));

  if (!Array.isArray(projects) || projects.length !== 5) {
    throw new Error("Featured project data must contain exactly five projects.");
  }

  const imageBuffer = await readFile(sourcePath);
  const decodedImage = decodePng(imageBuffer);

  const profileLines = buildProfileLines(projects);
  const generated = outputs.map((output) => {
    const layout = layouts[output.size];
    const portraitLines = samplePortrait(
      decodedImage,
      layout.portrait.columns,
      layout.portrait.rows,
      output.mode
    );
    return {
      ...output,
      content: normalizeSvg(
        createHeroSvg(output.mode, output.size, portraitLines, profileLines)
      )
    };
  });

  await mkdir(outputDirectory, { recursive: true });

  if (checkOnly) {
    const drifted = [];

    for (const output of generated) {
      try {
        const current = await readFile(resolve(outputDirectory, output.filename), "utf8");
        if (current !== output.content) drifted.push(output.filename);
      } catch {
        drifted.push(output.filename);
      }
    }

    if (drifted.length > 0) {
      throw new Error(`Generated hero assets are stale: ${drifted.join(", ")}`);
    }

    console.log("Hero assets match deterministic generator output.");
    return;
  }

  await Promise.all(
    generated.map((output) =>
      writeFile(resolve(outputDirectory, output.filename), output.content)
    )
  );

  console.log(`Generated responsive hero SVG assets with portrait from ${basename(sourcePath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
