#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../assets/hero");
const featuredProjectsPath = resolve(scriptDirectory, "../data/featured-projects.json");

const portraitFilter = [
  "crop=1700:1900:800:1950",
  "format=gray",
  "eq=contrast=1.18:brightness=0.04:gamma=0.96",
  "unsharp=3:3:0.35"
].join(",");

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

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function generateTechVisualAscii(columns, rows, isDesktop) {
  const lines = [];
  
  const headerText = "┌─[ SYSTEM TELEMETRY / DEVOPS STACK ]────────────────┐";
  const archNodes = [
    "│  [ CLIENT / WEB ]  ──▶  [ REACT + TAILWIND CSS ]       │",
    "│           │                                         │",
    "│           ▼                                         │",
    "│  [ API GATEWAY ]   ──▶  [ NODE.JS / EXPRESS / REST ] │",
    "│           │                                         │",
    "│           ├───▶ [ SOCKET.IO REALTIME CLUSTER ]      │",
    "│           └───▶ [ MONGODB / MYSQL / NEO4J ]         │",
    "│                                                     │",
    "│  [ CLOUD INFRASTRUCTURE & CI/CD PIPELINE ]          │",
    "│  ├── DOCKER CONTAINERS     [ OK ]  ● HEALTHY        │",
    "│  ├── KUBERNETES PODS       [ 6/6 ] ● RUNNING        │",
    "│  ├── AWS CLOUD CLUSTER     [ 99.99% UPTIME ]        │",
    "│  ├── TERRAFORM IAC         [ SYNCED ]               │",
    "│  ├── GITHUB ACTIONS / CI   [ PASSING ]              │",
    "│  └── PROMETHEUS / GRAFANA  [ ACTIVE METRICS ]       │",
    "└─────────────────────────────────────────────────────┘"
  ];

  const totalLines = rows;
  const padding = Math.max(0, Math.floor((totalLines - archNodes.length - 8) / 2));

  for (let i = 0; i < padding; i++) lines.push("");
  
  lines.push("   ╔═══════════════════════════════════════════════╗");
  lines.push("   ║  MOHAMED TAREK // FULL-STACK & DEVOPS CORE    ║");
  lines.push("   ╚═══════════════════════════════════════════════╝");
  lines.push("");
  lines.push("   STATUS: ONLINE ── CLUSTER: HEALTHY ── NODES: 06");
  lines.push("");

  for (const node of archNodes) {
    if (lines.length < rows - 4) {
      lines.push("   " + node);
    }
  }

  while (lines.length < rows - 2) {
    lines.push("   > latency: 12ms | memory: optimal | security: verified");
  }

  return lines;
}

function createTechAsciiTspans(layout, isDesktop) {
  const lines = generateTechVisualAscii(layout.portrait.columns, layout.portrait.rows, isDesktop);
  const rows = [];

  lines.forEach((line, index) => {
    rows.push(
      `<tspan x="${layout.portrait.x}" y="${(layout.portrait.y + index * layout.portrait.lineHeight).toFixed(2)}" xml:space="preserve">${escapeXml(line)}</tspan>`
    );
  });

  return rows.join("\n");
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

function createHeroSvg(mode, size, profileLines) {
  const colors = palettes[mode];
  const layout = layouts[size];
  const titlebar = layout.titlebar;
  const visual = layout.visualPanel;
  const info = layout.infoPanel;
  const clip = layout.portraitClip;
  const isDesktop = size === "desktop";
  
  const ascii = createTechAsciiTspans(layout, isDesktop);
  const ambientPortrait = buildAmbientPortraitLayer(layout, colors, size);
  const system = buildSystemLayer(layout.system, colors, profileLines);

  const titleCenter = titlebar.x + titlebar.width / 2;
  const liveX = titlebar.x + titlebar.width - (isDesktop ? 150 : 94);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="title description">
<title id="title">Mohamed Tarek Hussien - Software Engineer (Full-Stack &amp; DevOps)</title>
<desc id="description">A builder profile card with Mohamed Tarek's engineering telemetry, tech focus, and selected projects.</desc>
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
<text x="${layout.visualTitle.x}" y="${layout.visualTitle.y}" class="panel-title">SYSTEM / ARCHITECTURE</text>
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

async function main() {
  const checkOnly = process.argv.includes("--check");
  const projects = JSON.parse(await readFile(featuredProjectsPath, "utf8"));

  if (!Array.isArray(projects) || projects.length !== 5) {
    throw new Error("Featured project data must contain exactly five projects.");
  }

  const seenRepos = new Set();

  for (const project of projects) {
    for (const field of ["name", "repo", "url", "role", "status", "focus", "summary"]) {
      if (typeof project[field] !== "string" || project[field].trim() === "") {
        throw new Error(`Featured project ${project.name ?? "(unknown)"} is missing ${field}.`);
      }
    }

    if (seenRepos.has(project.repo)) {
      throw new Error(`Featured project repo is duplicated: ${project.repo}.`);
    }
    seenRepos.add(project.repo);

    for (const [field, value] of [["url", project.url], ["homepage", project.homepage]]) {
      if (value === null && field === "homepage") continue;
      if (typeof value !== "string" || new URL(value).protocol !== "https:") {
        throw new Error(`Featured project ${project.name} has an unsafe ${field}.`);
      }
    }
  }

  const profileLines = buildProfileLines(projects);
  const generated = outputs.map((output) => ({
    ...output,
    content: normalizeSvg(
      createHeroSvg(output.mode, output.size, profileLines)
    )
  }));

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

  console.log("Successfully generated all responsive hero SVG assets!");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
