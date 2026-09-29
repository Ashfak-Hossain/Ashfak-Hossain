// Generates every SVG in ../ (banner, status pill, project cards, toolbox).
//   cd assets/src && npm install && npm run build
// Edit CONTENT below, rebuild, commit the SVGs.
import fs from 'node:fs';
import { F, W, T, runs, esc, arrow, neArrow, repoIcon, pinIcon, svgOpen, close, beginDoc, r } from './lib.mjs';

/* ─────────────────────────────── CONTENT ─────────────────────────────── */
const CONTENT = {
  name: 'Ashfak Hossain Evan',
  eyebrow: 'BACKEND · DISTRIBUTED SYSTEMS',
  tagline: [
    [['Backends that stay ', 'muted'], ['correct', 'fg'], [' under concurrency', 'muted']],
    [['and ', 'muted'], ['fast', 'fg'], [' under load.', 'muted']],
  ],
  meta: ['Dhaka, Bangladesh', 'ashfak.dev'],
  hud: [['p99 ', 'faint'], ['11 ms', 'accent'], ['  ·  overlaps ', 'faint'], ['0', 'accent'], ['  ·  events ', 'faint'], ['exactly-once', 'accent']],
  status: 'Available now · backend internships & new-grad roles · remote or Dhaka',
  projects: {
    shortn: {
      lang: ['Go', '#00ADD8'],
      subtitle: 'Distributed URL shortener, built to production grade',
      chips: ['Redis cache-aside', 'Redpanda · exactly-once', 'Snowflake IDs', 'k8s · Helm · Argo CD'],
      url: 'shortn.ashfak.dev',
    },
    noOverlap: {
      lang: ['TypeScript', '#3178C6'],
      subtitle: 'Double-booking made impossible by construction',
      chips: ['GiST exclusion constraint', 'transactional outbox', 'BullMQ worker', 'OpenTelemetry'],
      url: 'nooverlap.ashfak.dev',
    },
  },
  stack: [
    ['LANGUAGES', [['Go', '#00ADD8'], ['TypeScript', '#3178C6'], ['C++', '#659AD2'], ['SQL', '#E38C00'], ['Python', '#FFD43B'], ['C', '#A8B9CC']]],
    ['BACKEND', [['NestJS', '#E0234E'], ['Node.js', '#5FA04E'], ['chi', '#00ADD8'], ['Express', '#9198A1'], ['Prisma', '#5A67D8']]],
    ['DATA & QUEUES', [['PostgreSQL', '#699ECA'], ['Redis', '#FF4438'], ['Kafka / Redpanda', '#E2401B'], ['BullMQ', '#EF4444'], ['MongoDB', '#47A248']]],
    ['INFRA', [['Docker', '#2496ED'], ['Kubernetes', '#326CE5'], ['Helm', '#5F7CE8'], ['Argo CD', '#EF7B4D'], ['Terraform', '#844FBA'], ['nginx', '#009639'], ['GitHub Actions', '#2088FF']]],
    ['OBSERVABILITY', [['OpenTelemetry', '#F5A800'], ['Prometheus', '#E6522C'], ['Grafana', '#F46800'], ['Loki', '#F7B93E'], ['Tempo', '#F46800'], ['k6', '#7D64FF']]],
    ['FRONTEND & GFX', [['React', '#61DAFB'], ['Next.js', 'FG'], ['TanStack Query', '#FF4154'], ['Tailwind', '#06B6D4'], ['OpenGL', '#5586A4']]],
  ],
};

/* ─────────────────────────────── THEMES ──────────────────────────────── */
const THEMES = {
  dark: {
    bg0: '#0d1117', bg1: '#0a1a1b', border: '#21262d', fg: '#e6edf3', muted: '#9198a1', faint: '#6e7681',
    accent: '#5eead4', packet: '#2dd4bf', panel: '#161b22', panelStroke: '#21262d',
    node: '#161b22', nodeStroke: '#30363d', edge: '#3d444d', grid: '#30363d',
    chipBg: '#2dd4bf14', chipStroke: '#2dd4bf47', chipText: '#99f6e4',
    track: '#0d1117', red: '#f85149', ok: '#3fb950', glow: 0.12,
  },
  light: {
    bg0: '#ffffff', bg1: '#effcf9', border: '#d0d7de', fg: '#1f2328', muted: '#59636e', faint: '#818b98',
    accent: '#0f766e', packet: '#0d9488', panel: '#f6f8fa', panelStroke: '#d8dee4',
    node: '#ffffff', nodeStroke: '#d0d7de', edge: '#afb8c1', grid: '#d0d7de',
    chipBg: '#0d948812', chipStroke: '#0d94884d', chipText: '#115e59',
    track: '#ffffff', red: '#cf222e', ok: '#1a7f37', glow: 0.10,
  },
};
const col = (t, k) => (k === 'FG' ? t.fg : t[k] ?? k);

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const baseCss = `
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ring{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(2.6)}}
.up{animation:up .8s ${EASE} both}.fade{animation:fade .9s ease both}
.pulse{animation:pulse 2.4s ease-in-out infinite}
.ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
const delay = (s) => `style="animation-delay:${s}s"`;

/* ─────────────────────────────── BANNER ──────────────────────────────── */
function banner(t) {
  beginDoc();
  const Wd = 1200, H = 400, X = 72;
  let s = svgOpen(Wd, H, `${CONTENT.name} — backend and distributed systems engineer`,
    'Animated banner: name, tagline, and a small service graph with requests flowing between proxy, API, Redis, Postgres, a queue and a worker.');
  s += `<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.bg0}"/><stop offset="1" stop-color="${t.bg1}"/></linearGradient>
<radialGradient id="glow" cx="950" cy="200" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.packet}" stop-opacity="${t.glow}"/><stop offset="1" stop-color="${t.packet}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.1" fill="${t.grid}"/></pattern>
<radialGradient id="fadeMask" cx="950" cy="200" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="${Wd}" height="${H}" fill="url(#fadeMask)"/></mask>
<clipPath id="clip"><rect x="1" y="1" width="${Wd - 2}" height="${H - 2}" rx="17"/></clipPath>
<filter id="gl" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="${t.edge}"/></marker>
</defs><style>${baseCss}</style>`;
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="18" fill="url(#bg)" stroke="${t.border}"/>`;
  s += `<g clip-path="url(#clip)"><rect width="${Wd}" height="${H}" fill="url(#dots)" mask="url(#m)"/><rect width="${Wd}" height="${H}" fill="url(#glow)"/></g>`;

  // left column
  s += `<g class="up" ${delay(0.05)}><rect x="${X}" y="95" width="22" height="2.5" rx="1.25" fill="${t.accent}"/>` +
    T(CONTENT.eyebrow, { f: F.monoM, size: 14, x: X + 34, y: 101, ls: 0.16, fill: t.accent }) + `</g>`;

  let nameSize = 60;
  while (W(CONTENT.name, F.xb, nameSize, -0.025) > 640) nameSize -= 1;
  s += `<g class="up" ${delay(0.15)}>` + T(CONTENT.name, { f: F.xb, size: nameSize, x: X - 3, y: 172, ls: -0.025, fill: t.fg }) + `</g>`;

  CONTENT.tagline.forEach((line, i) => {
    const parts = line.map(([str, c]) => ({ s: str, fill: t[c], f: c === 'fg' ? F.sb : F.r }));
    s += `<g class="up" ${delay(0.28 + i * 0.07)}>` + runs(parts, { f: F.r, size: 24, x: X, y: 228 + i * 34 }).svg + `</g>`;
  });

  // meta row
  let mx = X;
  let meta = pinIcon(mx, 317, t.faint);
  mx += 24;
  CONTENT.meta.forEach((m, i) => {
    if (i) { meta += `<circle cx="${r(mx + 11)}" cy="${326}" r="2" fill="${t.faint}"/>`; mx += 22; }
    meta += T(m, { f: F.mono, size: 15, x: mx, y: 331, fill: t.muted });
    mx += W(m, F.mono, 15);
  });
  s += `<g class="up" ${delay(0.45)}>${meta}</g>`;

  // service graph
  const nw = 104, nh = 40;
  const C = [760, 896, 1032], R = [88, 176, 264];
  const nodes = [
    ['proxy', 0, 0], ['api ×3', 1, 0, true], ['redis', 2, 0], ['postgres', 2, 1], ['queue', 1, 2], ['worker', 2, 2],
  ];
  const edges = [
    ['e1', `M864 108H893`],
    ['e2', `M1010 108H1029`],
    ['e3', `M985 128V188Q985 196 993 196H1029`],
    ['e4', `M948 128V261`],
    ['e5', `M1000 284H1029`],
    ['e6', `M1084 264V219`],
  ];
  let g = '';
  edges.forEach(([id, d], i) => {
    g += `<path id="${id}" class="fade" ${delay(0.9 + i * 0.08)} d="${d}" fill="none" stroke="${t.edge}" stroke-width="1.5" stroke-linecap="round" marker-end="url(#ah)"/>`;
  });
  nodes.forEach(([label, c, rw, replicas], i) => {
    const x = C[c], y = R[rw];
    let n = '';
    if (replicas) {
      n += `<rect x="${x + 8}" y="${y - 8}" width="${nw}" height="${nh}" rx="9" fill="${t.node}" stroke="${t.nodeStroke}" opacity=".45"/>`;
      n += `<rect x="${x + 4}" y="${y - 4}" width="${nw}" height="${nh}" rx="9" fill="${t.node}" stroke="${t.nodeStroke}" opacity=".75"/>`;
    }
    n += `<rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="9" fill="${t.node}" stroke="${t.nodeStroke}"/>`;
    n += `<circle class="pulse" style="animation-delay:${(i * 0.37).toFixed(2)}s" cx="${x + 17}" cy="${y + 20}" r="3.5" fill="${t.ok}"/>`;
    n += T(label, { f: F.monoM, size: 14, x: x + 29, y: y + 25, fill: t.fg });
    g += `<g class="up" ${delay(0.55 + i * 0.07)}>${n}</g>`;
  });
  // packets
  const flows = [['e1', 0.0, 1.1], ['e2', 1.1, 0.9], ['e3', 1.4, 1.5], ['e4', 1.9, 1.6], ['e5', 3.3, 0.9], ['e6', 4.0, 1.0]];
  const cycle = 5.2;
  flows.forEach(([id, start, dur]) => {
    for (const k of [0, 1]) {
      const begin = (1.5 + start + k * cycle / 2).toFixed(2);
      g += `<circle r="3.3" fill="${t.packet}" filter="url(#gl)" opacity="0">` +
        `<animateMotion dur="${cycle}s" begin="${begin}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;${(dur / cycle).toFixed(3)};1" calcMode="linear"><mpath xlink:href="#${id}"/></animateMotion>` +
        `<animate attributeName="opacity" dur="${cycle}s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;${(0.12 * dur / cycle).toFixed(3)};${(0.85 * dur / cycle).toFixed(3)};${(dur / cycle).toFixed(3)};1"/></circle>`;
    }
  });
  s += g;

  // hud
  const hud = CONTENT.hud.map(([str, c]) => ({ s: str, fill: t[c], f: c === 'accent' ? F.monoM : F.mono }));
  s += `<g class="fade" ${delay(1.4)}>` + runs(hud, { f: F.mono, size: 13, x: 760, y: 350 }).svg + `</g>`;
  return close(s);
}

/* ─────────────────────────────── STATUS PILL ─────────────────────────── */
function status(t) {
  beginDoc();
  const size = 14, padL = 34, padR = 16, H = 34;
  // first phrase (before the first " · ") is set in semibold
  const [lead, ...rest] = CONTENT.status.split(' · ');
  const tail = rest.length ? ' · ' + rest.join(' · ') : '';
  const tw = W(lead, F.sb, size) + (tail ? W(tail, F.m, size) : 0);
  const Wd = Math.ceil(padL + tw + padR) + 2;
  let s = svgOpen(Wd, H + 2, CONTENT.status, 'Availability status');
  s += `<style>${baseCss}</style>`;
  s += `<rect x="1" y="1" width="${Wd - 2}" height="${H}" rx="${H / 2}" fill="${t.panel}" stroke="${t.border}"/>`;
  s += `<circle class="ring" cx="18" cy="${1 + H / 2}" r="4.5" fill="${t.ok}"/><circle cx="18" cy="${1 + H / 2}" r="4.5" fill="${t.ok}"/>`;
  const parts = [{ s: lead, f: F.sb, fill: t.fg }];
  if (tail) parts.push({ s: tail, fill: t.muted });
  s += runs(parts, { f: F.m, size, x: padL, y: 1 + H / 2 + 5 }).svg;
  return close(s);
}

/* ─────────────────────────────── PROJECT CARDS ───────────────────────── */
function chipsLayout(list, maxW, { size = 12.5, padX = 11, h = 26, gap = 8 } = {}) {
  let x = 0, y = 0;
  const out = [];
  for (const c of list) {
    const w = W(c, F.m, size) + padX * 2;
    if (x > 0 && x + w > maxW) { x = 0; y += h + gap; }
    out.push({ c, x, y, w });
    x += w + gap;
  }
  return { out, height: y + h };
}

function card(t, key, panelFn) {
  beginDoc();
  const p = CONTENT.projects[key];
  const Wd = 460, P = 24, inner = Wd - P * 2;
  const chips = chipsLayout(p.chips, inner);
  const chipsY = 232;
  const H = chipsY + chips.height + 58;
  let s = svgOpen(Wd, H, `${key} — ${p.subtitle}`, `Project card for ${key}. ${p.chips.join(', ')}. Live at ${p.url}.`);
  s += `<style>${baseCss}${panelFn.css ? panelFn.css(t) : ''}</style>`;
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="14" fill="${t.bg0}" stroke="${t.border}"/>`;
  // header
  s += `<g class="up" ${delay(0.05)}>` + repoIcon(P, 29, t.muted) +
    T(key, { f: F.b, size: 22, x: P + 26, y: 45, ls: -0.01, fill: t.fg });
  const [lang, lc] = p.lang;
  const lw = W(lang, F.mono, 12.5);
  s += `<circle cx="${r(Wd - P - lw - 12)}" cy="40.5" r="5" fill="${lc}"/>` + T(lang, { f: F.mono, size: 12.5, x: Wd - P, y: 45, anchor: 'end', fill: t.muted }) + `</g>`;
  s += `<g class="up" ${delay(0.12)}>` + T(p.subtitle, { f: F.r, size: 14.5, x: P, y: 74, fill: t.muted }) + `</g>`;
  // panel
  s += `<g class="up" ${delay(0.2)}><rect x="${P}" y="94" width="${inner}" height="118" rx="10" fill="${t.panel}" stroke="${t.panelStroke}"/>${panelFn(t, P, inner)}</g>`;
  // chips
  let cs = '';
  chips.out.forEach(({ c, x, y, w }, i) => {
    cs += `<g class="up" ${delay(0.45 + i * 0.06)}><rect x="${r(P + x)}" y="${chipsY + y}" width="${r(w)}" height="26" rx="13" fill="${t.chipBg}" stroke="${t.chipStroke}"/>` +
      T(c, { f: F.m, size: 12.5, x: P + x + 11, y: chipsY + y + 17.5, fill: t.chipText }) + `</g>`;
  });
  s += cs;
  // footer
  const fy = H - 24;
  s += `<line x1="${P}" y1="${fy - 22}" x2="${Wd - P}" y2="${fy - 22}" stroke="${t.border}"/>`;
  s += `<g class="fade" ${delay(0.7)}>` + T(p.url, { f: F.mono, size: 13, x: P, y: fy, fill: t.muted }) +
    neArrow(P + W(p.url, F.mono, 13) + 7, fy - 9, 8, t.muted) +
    T('view repo', { f: F.mono, size: 13, x: Wd - P - 16, y: fy, anchor: 'end', fill: t.faint }) +
    `<path d="M${Wd - P - 9} ${fy - 8}l5 4.5l-5 4.5" fill="none" stroke="${t.faint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return close(s);
}

// shortn: 172 ms → 11 ms
function shortnPanel(t, P, inner) {
  const x0 = P + 16;
  let s = T('REDIRECT P99 · SAME LOAD', { f: F.monoM, size: 11.5, x: x0, y: 119, ls: 0.12, fill: t.accent });
  const before = '172 ms', after = '11 ms';
  const bw = W(before, F.b, 34, -0.02);
  s += T(before, { f: F.b, size: 34, x: x0, y: 165, ls: -0.02, fill: t.faint });
  s += `<line class="strike" x1="${x0 - 2}" y1="153" x2="${r(x0 + bw + 2)}" y2="153" stroke="${t.red}" stroke-width="2.5" stroke-linecap="round" pathLength="1"/>`;
  s += `<g class="arr">${arrow(x0 + bw + 18, 153, 34, t.muted, 2.2)}</g>`;
  s += `<g class="win">` + T(after, { f: F.xb, size: 34, x: x0 + bw + 68, y: 165, ls: -0.02, fill: t.accent }) + `</g>`;
  s += runs([
    { s: 'Root cause: ', fill: t.fg, f: F.m },
    { s: 'nginx had no upstream keepalive', fill: t.muted },
  ], { f: F.r, size: 13, x: x0, y: 195 }).svg;
  return s;
}
shortnPanel.css = () => `
@keyframes strike{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.strike{stroke-dasharray:1;stroke-dashoffset:1;animation:strike .5s ease-out 1s forwards}
.arr{animation:fade .4s ease 1.4s both}
.win{transform-box:fill-box;transform-origin:left center;animation:pop .6s ${EASE} 1.6s both}
@keyframes pop{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.strike{stroke-dashoffset:0}}`;

// noOverlap: many holds race for one slot, one wins
function noOverlapPanel(t, P, inner) {
  const x0 = P + 16, x1 = P + inner - 16;
  let s = T('ONE SLOT · CONCURRENT HOLDS', { f: F.monoM, size: 11.5, x: x0, y: 119, ls: 0.12, fill: t.accent });
  s += runs([
    { s: '201', fill: t.ok, f: F.monoM }, { s: ' ×1  ', fill: t.muted },
    { s: '409', fill: t.red, f: F.monoM }, { s: ' ×99', fill: t.muted },
  ], { f: F.mono, size: 12, x: x1 - W('201 ×1  409 ×99', F.mono, 12), y: 119 }).svg;
  // calendar track
  const tx = x0, tw = x1 - x0, ty = 150, th = 24, cells = 8, cw = tw / cells;
  s += `<rect x="${tx}" y="${ty}" width="${r(tw)}" height="${th}" rx="6" fill="${t.track}" stroke="${t.panelStroke}"/>`;
  for (let i = 1; i < cells; i++) s += `<line x1="${r(tx + cw * i)}" y1="${ty + 5}" x2="${r(tx + cw * i)}" y2="${ty + th - 5}" stroke="${t.panelStroke}"/>`;
  const sx = r(tx + cw * 2 + 3), sw = r(cw * 3 - 6);
  // winner + losers
  s += `<rect class="rq w" x="${sx}" y="127" width="${sw}" height="12" rx="4" fill="${t.packet}"/>`;
  for (let i = 1; i <= 4; i++) s += `<rect class="rq l${i}" x="${sx}" y="127" width="${sw}" height="12" rx="4" fill="${t.faint}"/>`;
  s += T('EXCLUDE USING gist (listing_id WITH =, range WITH &&)', { f: F.mono, size: 11.2, x: x0, y: 197, fill: t.muted });
  return s;
}
noOverlapPanel.css = (t) => {
  const cyc = 4.6;
  const pct = (sec) => ((sec / cyc) * 100).toFixed(2) + '%';
  let css = `.rq{opacity:0;animation-duration:${cyc}s;animation-iteration-count:infinite;animation-delay:.9s;animation-timing-function:ease-in-out}`;
  css += `@keyframes w{0%{opacity:0;transform:translateY(0)}3%{opacity:1}${pct(0.4)}{transform:translateY(29px)}88%{opacity:1;transform:translateY(29px)}96%,100%{opacity:0;transform:translateY(29px)}}.w{animation-name:w}`;
  for (let i = 1; i <= 4; i++) {
    const st = 0.55 + i * 0.42;
    css += `@keyframes l${i}{0%,${pct(st)}{opacity:0;transform:translateY(0);fill:${t.faint}}${pct(st + 0.06)}{opacity:1}${pct(st + 0.3)}{transform:translateY(9px);fill:${t.faint}}${pct(st + 0.36)}{transform:translateY(7px);fill:${t.red}}${pct(st + 0.75)}{opacity:.9;fill:${t.red}}${pct(st + 1.0)},100%{opacity:0;transform:translateY(7px);fill:${t.red}}}.l${i}{animation-name:l${i}}`;
  }
  css += `@media (prefers-reduced-motion:reduce){.w{opacity:1;transform:translateY(29px)}}`;
  return css;
};

/* ─────────────────────────────── TOOLBOX ─────────────────────────────── */
function stack(t) {
  beginDoc();
  const Wd = 920, labelW = 168, rowGap = 12, chipH = 32, gap = 8, size = 14;
  let y = 8;
  let body = '';
  let n = 0;
  CONTENT.stack.forEach(([label, items], ri) => {
    let x = labelW, rowY = y;
    let row = T(label, { f: F.monoM, size: 12, x: 0, y: y + 21, ls: 0.14, fill: t.accent });
    for (const [name, c] of items) {
      const w = 12 + 8 + 8 + W(name, F.m, size) + 12;
      if (x + w > Wd) { x = labelW; y += chipH + gap; }
      row += `<g class="up" ${delay(0.1 + n++ * 0.025)}><rect x="${r(x + 0.5)}" y="${y + 0.5}" width="${r(w - 1)}" height="${chipH - 1}" rx="8" fill="${t.node}" stroke="${t.nodeStroke}"/>` +
        `<circle cx="${r(x + 16)}" cy="${y + chipH / 2}" r="4" fill="${col(t, c)}"/>` +
        T(name, { f: F.m, size, x: x + 28, y: y + 21, fill: t.fg }) + `</g>`;
      x += w + gap;
    }
    body += `<g class="fade" ${delay(ri * 0.05)}>${row}</g>`;
    y += chipH + rowGap;
    if (ri < CONTENT.stack.length - 1) body += `<line x1="0" y1="${y - rowGap / 2}" x2="${Wd}" y2="${y - rowGap / 2}" stroke="${t.border}" stroke-dasharray="2 4" opacity=".8"/>`;
    void rowY;
  });
  const H = y;
  const items = CONTENT.stack.map(([l, i]) => `${l}: ${i.map((x) => x[0]).join(', ')}`).join('. ');
  let s = svgOpen(Wd, H, 'Toolbox', items);
  s += `<style>${baseCss}</style>` + body;
  return close(s);
}

/* ─────────────────────────────── WRITE ───────────────────────────────── */
const outDir = new URL('../', import.meta.url);
const files = {};
for (const [name, t] of Object.entries(THEMES)) {
  files[`banner-${name}.svg`] = banner(t);
  files[`status-${name}.svg`] = status(t);
  files[`card-shortn-${name}.svg`] = card(t, 'shortn', shortnPanel);
  files[`card-nooverlap-${name}.svg`] = card(t, 'noOverlap', noOverlapPanel);
  files[`stack-${name}.svg`] = stack(t);
}
for (const [f, svg] of Object.entries(files)) {
  fs.writeFileSync(new URL(f, outDir), svg);
  console.log(f.padEnd(28), (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
}
