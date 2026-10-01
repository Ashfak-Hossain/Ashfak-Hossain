// Generates every SVG in ../ (banner, status pill, project cards, toolbox).
//   cd assets/src && npm install && npm run build
// Edit CONTENT below, rebuild, commit the SVGs.
import fs from 'node:fs';
import { F, W, T, runs, esc, arrow, neArrow, repoIcon, pinIcon, svgOpen, close, beginDoc, r } from './lib.mjs';
import { THEMES, col, EASE, baseCss, delay, frames, blink } from './theme.mjs';

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
  // the banner's boot log, before the name appears
  boot: [
    ['  OK  ', 'Started postgresql.service'],
    ['  OK  ', 'Started redis.service'],
    ['  OK  ', 'Mounted /dev/coffee'],
    [' WARN ', 'sleep.service masked by deadline.target'],
    ['  OK  ', 'Started curiosity.service'],
    ['  OK  ', 'Reached target ashfak.target'],
  ],
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
  // Client project: only the engineering (load tests, architecture) is shown, never usage or sales.
  flagship: {
    name: 'EchoAndAura',
    badge: 'in production',
    lang: ['TypeScript', '#3178C6'],
    subtitle: 'Ticketing for a live-events company in Dhaka: payments, QR tickets, a door that works offline',
    chips: ['Next.js 16 · React 19', 'Postgres 17 · Drizzle', 'Redis · BullMQ worker', 'offline-first scanner', 'Traefik load shedding', 'append-only audit log', 'Cloudflare · Dokploy'],
    url: 'echoandaura.com',
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

/* ─────────────────────────────── BANNER ──────────────────────────────── */
function banner(t) {
  beginDoc();
  // a short boot log plays first; everything else starts once it fades
  const BOOT = 1.55;
  const bd = (sec) => delay(sec + BOOT);
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
</defs><style>${baseCss}
@keyframes bl{from{opacity:0}to{opacity:1}}.bl{animation:bl .08s linear both}
@keyframes bo{to{opacity:0;transform:translateY(-6px)}}.boot{animation:bo .3s ease ${BOOT - 0.3}s forwards}
@media (prefers-reduced-motion:reduce){.boot{opacity:0}}</style>`;
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="18" fill="url(#bg)" stroke="${t.border}"/>`;
  s += `<g clip-path="url(#clip)"><rect width="${Wd}" height="${H}" fill="url(#dots)" mask="url(#m)"/><rect width="${Wd}" height="${H}" fill="url(#glow)"/></g>`;

  // left column
  s += `<g class="up" ${bd(0.05)}><rect x="${X}" y="95" width="22" height="2.5" rx="1.25" fill="${t.accent}"/>` +
    T(CONTENT.eyebrow, { f: F.monoM, size: 14, x: X + 34, y: 101, ls: 0.16, fill: t.accent }) + `</g>`;

  let nameSize = 60;
  while (W(CONTENT.name, F.xb, nameSize, -0.025) > 640) nameSize -= 1;
  s += `<g class="up" ${bd(0.15)}>` + T(CONTENT.name, { f: F.xb, size: nameSize, x: X - 3, y: 172, ls: -0.025, fill: t.fg }) + `</g>`;

  CONTENT.tagline.forEach((line, i) => {
    const parts = line.map(([str, c]) => ({ s: str, fill: t[c], f: c === 'fg' ? F.sb : F.r }));
    s += `<g class="up" ${bd(0.28 + i * 0.07)}>` + runs(parts, { f: F.r, size: 24, x: X, y: 228 + i * 34 }).svg + `</g>`;
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
  s += `<g class="up" ${bd(0.45)}>${meta}</g>`;

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
    g += `<path id="${id}" class="fade" ${bd(0.9 + i * 0.08)} d="${d}" fill="none" stroke="${t.edge}" stroke-width="1.5" stroke-linecap="round" marker-end="url(#ah)"/>`;
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
    g += `<g class="up" ${bd(0.55 + i * 0.07)}>${n}</g>`;
  });
  // packets
  const flows = [['e1', 0.0, 1.1], ['e2', 1.1, 0.9], ['e3', 1.4, 1.5], ['e4', 1.9, 1.6], ['e5', 3.3, 0.9], ['e6', 4.0, 1.0]];
  const cycle = 5.2;
  flows.forEach(([id, start, dur]) => {
    for (const k of [0, 1]) {
      const begin = (BOOT + 1.5 + start + k * cycle / 2).toFixed(2);
      g += `<circle r="3.3" fill="${t.packet}" filter="url(#gl)" opacity="0">` +
        `<animateMotion dur="${cycle}s" begin="${begin}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;${(dur / cycle).toFixed(3)};1" calcMode="linear"><mpath xlink:href="#${id}"/></animateMotion>` +
        `<animate attributeName="opacity" dur="${cycle}s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;${(0.12 * dur / cycle).toFixed(3)};${(0.85 * dur / cycle).toFixed(3)};${(dur / cycle).toFixed(3)};1"/></circle>`;
    }
  });
  s += g;

  // hud
  const hud = CONTENT.hud.map(([str, c]) => ({ s: str, fill: t[c], f: c === 'accent' ? F.monoM : F.mono }));
  s += `<g class="fade" ${bd(1.4)}>` + runs(hud, { f: F.mono, size: 13, x: 760, y: 350 }).svg + `</g>`;

  // boot log
  let boot = '';
  CONTENT.boot.forEach(([tag, text], i) => {
    const c = tag.trim() === 'OK' ? t.ok : t.warn;
    boot += `<g class="bl" ${delay((0.1 + i * 0.17).toFixed(2))}>` + runs([
      { s: '[', fill: t.faint }, { s: tag, f: F.monoB, fill: c }, { s: '] ', fill: t.faint }, { s: text, fill: t.fg },
    ], { f: F.mono, size: 16, x: X, y: 112 + i * 30 }).svg + `</g>`;
  });
  s += `<g class="boot">${boot}</g>`;
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

/* ─────────────────────────────── FLAGSHIP CARD ───────────────────────── */
// Seeded PRNG so a rebuild produces the same seat order and QR pattern.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const checkMark = (x, y, s, color, sw = 2) =>
  `<path d="M${r(x)} ${r(y + s * 0.5)}l${r(s * 0.35)} ${r(s * 0.35)}l${r(s * 0.65)} ${r(-s * 0.75)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

function flagship(t) {
  beginDoc();
  const p = CONTENT.flagship;
  const Wd = 940, P = 24, inner = Wd - P * 2, gap = 16;
  const pw = (inner - gap) / 2, py = 94, ph = 200;
  const chips = chipsLayout(p.chips, inner);
  const chipsY = py + ph + 22;
  const H = chipsY + chips.height + 58;
  let css = '';
  let s = svgOpen(Wd, H, `${p.name} — ${p.subtitle}`,
    `Flagship project card. Left: 200 buyers race for 100 seats; every seat is held once, 0 oversold. ` +
    `Right: a door phone loses signal, keeps admitting from its offline list, then syncs the queued scans. ${p.chips.join(', ')}.`);

  // card + header
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="14" fill="${t.bg0}" stroke="${t.border}"/>`;
  const nw = W(p.name, F.b, 22, -0.01);
  const bx = P + 26 + nw + 12, bw = 26 + W(p.badge, F.m, 12) + 10;
  s += `<g class="up" ${delay(0.05)}>` + repoIcon(P, 29, t.muted) +
    T(p.name, { f: F.b, size: 22, x: P + 26, y: 45, ls: -0.01, fill: t.fg }) +
    `<rect x="${r(bx)}" y="27.5" width="${r(bw)}" height="23" rx="11.5" fill="${t.panel}" stroke="${t.border}"/>` +
    `<circle class="ring" cx="${r(bx + 13)}" cy="39" r="3.5" fill="${t.ok}"/><circle cx="${r(bx + 13)}" cy="39" r="3.5" fill="${t.ok}"/>` +
    T(p.badge, { f: F.m, size: 12, x: bx + 24, y: 43.5, fill: t.muted });
  const [lang, lc] = p.lang;
  const lw = W(lang, F.mono, 12.5);
  s += `<circle cx="${r(Wd - P - lw - 12)}" cy="40.5" r="5" fill="${lc}"/>` + T(lang, { f: F.mono, size: 12.5, x: Wd - P, y: 45, anchor: 'end', fill: t.muted }) + `</g>`;
  s += `<g class="up" ${delay(0.12)}>` + T(p.subtitle, { f: F.r, size: 14.5, x: P, y: 74, fill: t.muted }) + `</g>`;

  /* ── left panel: the on-sale rush ── */
  const lx = P, x0 = lx + 16;
  let L = `<rect x="${lx}" y="${py}" width="${r(pw)}" height="${ph}" rx="10" fill="${t.panel}" stroke="${t.panelStroke}"/>`;
  L += T('ON-SALE RUSH · 200 BUYERS, 100 SEATS', { f: F.monoM, size: 11.5, x: x0, y: py + 25, ls: 0.12, fill: t.accent });
  // "SOLD OUT" stamp, shown while every seat is held
  const so = 'SOLD OUT', sow = W(so, F.monoM, 10.5, 0.1) + 14, sox = lx + pw - 16 - sow;
  L += `<g class="so"><rect x="${r(sox)}" y="${py + 12}" width="${r(sow)}" height="19" rx="5" fill="none" stroke="${t.red}" stroke-width="1.2"/>` +
    T(so, { f: F.monoM, size: 10.5, x: sox + 7, y: py + 25.5, ls: 0.1, fill: t.red }) + `</g>`;
  // 100 seats, filled in a random order
  const cols = 20, rows = 5, cg = 5, gw = pw - 32, cw = (gw - (cols - 1) * cg) / cols, ch = 14, gy = py + 40;
  const rand = rng(7);
  const order = [...Array(cols * rows).keys()];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const rank = new Map(order.map((cell, i) => [cell, i]));
  let seats = '', fills = '';
  for (let i = 0; i < cols * rows; i++) {
    const cx = r(x0 + (i % cols) * (cw + cg)), cy = gy + Math.floor(i / cols) * (ch + cg);
    seats += `<rect x="${cx}" y="${cy}" width="${r(cw)}" height="${ch}" rx="3" fill="${t.track}" stroke="${t.panelStroke}"/>`;
    const d = (1.0 + 2.0 * rank.get(i) / 99 + rand() * 0.08).toFixed(2);
    fills += `<rect class="st" style="animation-delay:${d}s" x="${cx}" y="${cy}" width="${r(cw)}" height="${ch}" rx="3" fill="${t.packet}"/>`;
  }
  L += seats + fills;
  L += runs([
    { s: '100', f: F.monoM, fill: t.fg }, { s: ' held · ', fill: t.muted },
    { s: '100', f: F.monoM, fill: t.fg }, { s: ' sold out · ', fill: t.muted },
    { s: '0', f: F.monoM, fill: t.fg }, { s: ' errors · ', fill: t.muted },
    { s: '0', f: F.monoB, fill: t.accent }, { s: ' oversold', fill: t.accent, f: F.monoM },
  ], { f: F.mono, size: 12.5, x: x0, y: py + ph - 46 }).svg;
  L += T('UPDATE … WHERE total - sold - reserved >= qty', { f: F.mono, size: 11.2, x: x0, y: py + ph - 20, fill: t.muted });
  // seat: fills at its own moment, stays while the house is full, clears; 8 s loop
  css += `@keyframes st{0%{opacity:0}2%{opacity:1}72%{opacity:1}78%,100%{opacity:0}}.st{opacity:0;animation:st 8s linear infinite}`;
  css += blink('so', 8, [[3.25, 6.6]]);
  s += `<g class="up" ${delay(0.2)}>${L}</g>`;

  /* ── right panel: the door scanner ── */
  const rx0 = P + pw + gap, sx0 = rx0 + 16;
  let R = `<rect x="${r(rx0)}" y="${py}" width="${r(pw)}" height="${ph}" rx="10" fill="${t.panel}" stroke="${t.panelStroke}"/>`;
  R += T('DOOR SCANNER · NO SIGNAL', { f: F.monoM, size: 11.5, x: sx0, y: py + 25, ls: 0.12, fill: t.accent });
  const rEnd = rx0 + pw - 16;
  const onW = W('online', F.mono, 12), offW = W('offline', F.mono, 12);
  R += `<g class="on"><circle cx="${r(rEnd - onW - 10)}" cy="${py + 21}" r="3.5" fill="${t.ok}"/>` + T('online', { f: F.mono, size: 12, x: rEnd, y: py + 25, anchor: 'end', fill: t.ok }) + `</g>`;
  R += `<g class="off"><circle cx="${r(rEnd - offW - 10)}" cy="${py + 21}" r="3.5" fill="${t.warn}"/>` + T('offline', { f: F.mono, size: 12, x: rEnd, y: py + 25, anchor: 'end', fill: t.warn }) + `</g>`;

  // phone
  const fx = sx0, fy = py + 40, fw = 78, fh = 146;
  R += `<rect x="${r(fx)}" y="${fy}" width="${fw}" height="${fh}" rx="13" fill="${t.track}" stroke="${t.nodeStroke}" stroke-width="1.5"/>`;
  R += `<rect x="${r(fx + fw / 2 - 11)}" y="${fy + 6}" width="22" height="4" rx="2" fill="${t.nodeStroke}"/>`;
  // signal bars: four up (online) or faint with a cross (offline)
  const bars = (color, op) => [3, 5, 7, 9].map((h, i) => `<rect x="${r(fx + 10 + i * 4)}" y="${fy + 24 - h}" width="2.6" height="${h}" rx=".8" fill="${color}" opacity="${op}"/>`).join('');
  R += `<g class="on">${bars(t.fg, 1)}</g>`;
  R += `<g class="off">${bars(t.faint, 0.45)}<path d="M${r(fx + 29)} ${fy + 16}l5 5m0 -5l-5 5" stroke="${t.warn}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  // queue badge counts scans waiting to sync
  const qx = fx + fw - 15, qy = fy + 20;
  for (const n of ['1', '2']) {
    R += `<g class="q${n}"><circle cx="${r(qx)}" cy="${qy}" r="7.5" fill="${t.warn}"/>` + T(n, { f: F.monoB, size: 10, x: qx, y: qy + 3.6, anchor: 'middle', fill: t.bg0 }) + `</g>`;
  }
  // a small QR code: three finder patterns + seeded modules
  const mods = 13, m = 4.2, qrw = mods * m, qrx = fx + (fw - qrw) / 2, qry = fy + 36;
  const finder = (i, j) => [[0, 0], [mods - 5, 0], [0, mods - 5]].some(([a, b]) => i >= a - 1 && i <= a + 5 && j >= b - 1 && j <= b + 5);
  let qd = '';
  for (const [a, b] of [[0, 0], [mods - 5, 0], [0, mods - 5]]) {
    const X = qrx + a * m, Y = qry + b * m;
    qd += `M${r(X)} ${r(Y)}h${r(5 * m)}v${r(5 * m)}h${r(-5 * m)}zM${r(X + m)} ${r(Y + m)}v${r(3 * m)}h${r(3 * m)}v${r(-3 * m)}zM${r(X + 2 * m)} ${r(Y + 2 * m)}h${r(m)}v${r(m)}h${r(-m)}z`;
  }
  const qr = rng(42);
  for (let i = 0; i < mods; i++) for (let j = 0; j < mods; j++) {
    if (finder(i, j) || qr() < 0.52) continue;
    qd += `M${r(qrx + i * m)} ${r(qry + j * m)}h${m}v${m}h-${m}z`;
  }
  R += `<path d="${qd}" fill="${t.fg}" fill-rule="evenodd"/>`;
  // the scan line sweeping the code
  R += `<g class="sw"><rect x="${r(qrx - 4)}" y="${r(qry - 1)}" width="${r(qrw + 8)}" height="2" rx="1" fill="${t.packet}"/></g>`;
  // the verdict
  const vx = fx + 7, vy = fy + fh - 32, vw = fw - 14;
  R += `<g class="vd"><rect x="${r(vx)}" y="${vy}" width="${vw}" height="22" rx="6" fill="${t.ok}"/>` +
    checkMark(vx + 9, vy + 5, 11, t.bg0, 2.2) + T('ADMIT', { f: F.b, size: 10.5, x: vx + 25, y: vy + 15, ls: 0.04, fill: t.bg0 }) + `</g>`;

  // the log beside the phone
  const lgx = fx + fw + 18, lg0 = py + 54, lp = 20, ls = 11;
  const lines = [
    [1.3, [['21:04:02', 'faint'], ['  scan  ', 'muted'], ['admit', 'ok', F.monoM], ['  online', 'muted']]],
    [2.8, [['21:04:09', 'faint'], ['  — signal lost —', 'warn']]],
    [4.1, [['21:04:11', 'faint'], ['  scan  ', 'muted'], ['admit', 'ok', F.monoM], ['  offline · queued', 'warn']]],
    [6.1, [['21:04:14', 'faint'], ['  scan  ', 'muted'], ['admit', 'ok', F.monoM], ['  offline · queued', 'warn']]],
    [7.5, [['21:04:20', 'faint'], ['  — signal back —', 'ok']]],
    [8.0, [['21:04:20', 'faint'], ['  sync  ', 'muted'], ['2 scans', 'fg', F.monoM], [' replayed as check-ins', 'muted']]],
  ];
  const C = 10;
  lines.forEach(([at, parts], i) => {
    R += `<g class="lg${i}">` + runs(parts.map(([str, c, f]) => ({ s: str, fill: t[c], f })), { f: F.mono, size: ls, x: lgx, y: lg0 + i * lp }).svg + `</g>`;
    css += blink(`lg${i}`, C, [[at, 9.3]], 0.2);
  });
  R += T('judged on the phone from a hashed list', { f: F.mono, size: 11.2, x: lgx, y: py + ph - 20, fill: t.muted });

  // the scanner's 10 s story: online scan, signal lost, two offline scans queue, signal back, sync
  css += blink('on', C, [[0, 2.8], [7.5, C]], 0.12) + blink('off', C, [[2.8, 7.5]], 0.12);
  css += blink('vd', C, [[1.3, 2.3], [4.1, 5.1], [6.1, 7.1]], 0.1);
  css += blink('q1', C, [[4.1, 6.1]], 0.1) + blink('q2', C, [[6.1, 8.0]], 0.1);
  const sweep = [];
  for (const [a, b] of [[0.6, 1.3], [3.4, 4.1], [5.4, 6.1]]) {
    sweep.push([a, 'opacity:0;transform:translateY(0)'], [a + 0.05, 'opacity:1;transform:translateY(0)'],
      [b - 0.05, `opacity:1;transform:translateY(${r(qrw)}px)`], [b, `opacity:0;transform:translateY(${r(qrw)}px)`]);
  }
  css += frames('sw', C, [[0, 'opacity:0;transform:translateY(0)'], ...sweep, [C, 'opacity:0;transform:translateY(0)']]);
  s += `<g class="up" ${delay(0.28)}>${R}</g>`;

  // a still frame for reduced motion: every seat held, the log complete
  css += `@media (prefers-reduced-motion:reduce){.st,.so,.on,.vd,${lines.map((_, i) => `.lg${i}`).join(',')}{opacity:1!important}.off,.q1,.q2,.sw{opacity:0!important}}`;

  // chips + footer
  chips.out.forEach(({ c, x, y, w }, i) => {
    s += `<g class="up" ${delay(0.45 + i * 0.05)}><rect x="${r(P + x)}" y="${chipsY + y}" width="${r(w)}" height="26" rx="13" fill="${t.chipBg}" stroke="${t.chipStroke}"/>` +
      T(c, { f: F.m, size: 12.5, x: P + x + 11, y: chipsY + y + 17.5, fill: t.chipText }) + `</g>`;
  });
  const fyy = H - 24;
  s += `<line x1="${P}" y1="${fyy - 22}" x2="${Wd - P}" y2="${fyy - 22}" stroke="${t.border}"/>`;
  s += `<g class="fade" ${delay(0.7)}>` + T(p.url, { f: F.mono, size: 13, x: P, y: fyy, fill: t.muted }) +
    neArrow(P + W(p.url, F.mono, 13) + 7, fyy - 9, 8, t.muted) +
    T('view repo', { f: F.mono, size: 13, x: Wd - P - 16, y: fyy, anchor: 'end', fill: t.faint }) +
    `<path d="M${Wd - P - 9} ${fyy - 8}l5 4.5l-5 4.5" fill="none" stroke="${t.faint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;

  s = s.replace('<!--DEFS-->', `<!--DEFS--><style>${baseCss}${css}</style>`);
  return close(s);
}

/* ─────────────────────────────── RECRUITER TERMINAL ──────────────────── */
// A typed shell session that plays once. Typing is a background-coloured cover that steps right
// one character at a time (monospace, so every step is exactly one glyph), carrying the cursor.
const TERM = [
  { at: 0.5, prompt: true, type: 'sudo hire ashfak', speed: 0.07 },
  { at: 2.3, text: [['[sudo] password for recruiter: ', 'muted']], type: '********', speed: 0.08, typeFill: 'muted' },
  { at: 3.7, check: 'ok', text: [['access granted', 'ok']] },
  { at: 4.1, check: 'ok', text: [['offer letter queued', 'fg'], [' · exactly-once delivery · idempotency key: ', 'muted'], ['you', 'accent']] },
  null,
  { at: 5.0, prompt: true, type: '# two recruiters, one interview slot, the same millisecond', speed: 0.03, typeFill: 'faint' },
  { at: 7.4, prompt: true, type: 'book "Mon 10:00" & book "Mon 10:00"', speed: 0.05 },
  { at: 9.9, text: [['[1] ', 'faint'], ['201 Created ', 'ok', 'b'], ['  interview confirmed: Mon 10:00', 'muted']] },
  { at: 10.05, text: [['[2] ', 'faint'], ['409 Conflict', 'red', 'b'], ['  ashfak is already booked. next free slot: Mon 11:00', 'muted']] },
  null,
  { at: 10.7, prompt: true, cursor: true },
];

function terminal(t) {
  beginDoc();
  const Wd = 940, bar = 38, x0 = 28, y0 = bar + 34, pitch = 25, size = 14, cw = W('a', F.mono, size);
  const H = y0 + (TERM.length - 1) * pitch + 28;
  const prompt = [{ s: 'recruiter@github', fill: t.accent }, { s: ':~$ ', fill: t.muted }];
  const transcript = TERM.filter(Boolean).map((l) => `${l.prompt ? '$ ' : ''}${(l.text ?? []).map((p) => p[0]).join('')}${l.type ?? ''}`).join(' / ');
  let s = svgOpen(Wd, H, 'A recruiter at the terminal', transcript);
  let css = `${baseCss}@keyframes ln{from{opacity:0}to{opacity:1}}.ln{animation:ln .01s linear both}
@keyframes hide{to{opacity:0}}@keyframes blinkc{0%,49%{opacity:1}50%,100%{opacity:0}}`;
  s += `<defs><clipPath id="body"><rect x="1" y="${bar}" width="${Wd - 2}" height="${H - bar - 1}"/></clipPath></defs>`;
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="14" fill="${t.bg0}" stroke="${t.border}"/>`;
  s += `<path d="M1 ${bar}V14.5A13.5 13.5 0 0 1 14.5 1H${Wd - 14.5}A13.5 13.5 0 0 1 ${Wd - 1} 14.5V${bar}Z" fill="${t.panel}"/><line x1="1" y1="${bar}" x2="${Wd - 1}" y2="${bar}" stroke="${t.border}"/>`;
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { s += `<circle cx="${22 + i * 20}" cy="${bar / 2}" r="6" fill="${c}" opacity=".85"/>`; });
  s += T('recruiter@github: ~', { f: F.mono, size: 12.5, x: Wd / 2, y: bar / 2 + 4.5, anchor: 'middle', fill: t.faint });

  let covers = '';
  TERM.forEach((l, i) => {
    if (!l) return;
    const y = y0 + i * pitch;
    const parts = [...(l.prompt ? prompt : []), ...(l.text ?? []).map(([str, c, b]) => ({ s: str, fill: t[c], f: b ? F.monoB : undefined }))];
    let x = x0, g = '';
    if (l.check) { g += checkMark(x, y - 11, 11, t[l.check], 2); x += 20; }
    const head = runs(parts, { f: F.mono, size, x, y });
    g += head.svg;
    x += head.width;
    if (l.type) g += T(l.type, { f: F.mono, size, x, y, fill: t[l.typeFill ?? 'fg'] });
    s += `<g class="ln" ${delay(l.at)}>${g}</g>`;
    const cur = (cls, style) => `<rect class="${cls}" style="${style}" x="${r(x + 1)}" y="${y - 13}" width="${r(cw - 1)}" height="17" rx="1.5" fill="${t.accent}"/>`;
    if (l.type) {
      // cover + cursor step right together; the cursor goes when the next line starts
      const n = l.type.length, start = l.at + 0.3, dur = n * l.speed, tw = r(n * cw);
      const next = TERM.slice(i + 1).find(Boolean)?.at ?? start + dur + 0.5;
      // steps end at 90% and the rest holds: a step that lands at the very end can round one glyph short
      css += `@keyframes tp${i}{0%{transform:none}90%,100%{transform:translateX(${tw}px)}}`;
      covers += `<g style="animation:tp${i} ${(dur / 0.9).toFixed(3)}s steps(${n},end) ${start.toFixed(2)}s both">` +
        `<rect class="cv" x="${r(x)}" y="${y - 17}" width="${r(tw + cw + 4)}" height="23" fill="${t.bg0}"/>` +
        cur('', `opacity:0;animation:ln .01s linear ${l.at}s both,hide .01s linear ${next}s forwards`) + `</g>`;
    }
    if (l.cursor) covers += cur('', `opacity:0;animation:ln .01s linear ${l.at}s both,blinkc 1.1s steps(1) ${l.at}s infinite`);
  });
  s += `<g clip-path="url(#body)">${covers}</g>`;
  // still frame: the whole session, no covers or cursors
  css += `@media (prefers-reduced-motion:reduce){.cv{opacity:0}g[clip-path] rect{opacity:0!important}}`;
  s = s.replace('<!--DEFS-->', `<!--DEFS--><style>${css}</style>`);
  return close(s);
}

/* ─────────────────────────────── CHAOS MONKEY ────────────────────────── */
// A 12 s loop: a monkey unplugs api-2, the load balancer opens its circuit and retries on the
// others, Kubernetes restarts api-2, traffic returns. Nothing is lost.
function chaos(t) {
  beginDoc();
  const Wd = 940, H = 214, P = 24, C = 12;
  const fur = t === THEMES.dark ? '#a8743f' : '#8b5a2b', face = t === THEMES.dark ? '#f0cfa5' : '#e8c39e', ink = '#24170b';
  let s = svgOpen(Wd, H, 'Chaos drill',
    'A cartoon monkey unplugs one of three API nodes. The load balancer opens the circuit, retries on another node, Kubernetes restarts the node, and traffic returns. Requests lost: 0.');
  let css = baseCss;
  s += `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="14" fill="${t.bg0}" stroke="${t.border}"/>`;
  s += `<rect x="${P}" y="29" width="22" height="2.5" rx="1.25" fill="${t.accent}"/>` + T('CHAOS DRILL · EVERY 12 S', { f: F.monoM, size: 12, x: P + 32, y: 35, ls: 0.14, fill: t.accent });
  s += T('how I like my systems to fail', { f: F.mono, size: 11.5, x: Wd - P, y: 35, anchor: 'end', fill: t.faint });

  // nodes and edges
  const node = (x, y, w, label, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="36" rx="9" fill="${t.node}" stroke="${t.nodeStroke}"/>` +
    `<circle cx="${x + 16}" cy="${y + 18}" r="3.5" fill="${t.ok}"/>` + T(label, { f: F.monoM, size: 13.5, x: x + 28, y: y + 23, fill: t.fg }) + extra;
  const lbx = P, ax = 226, aw = 100, ys = [62, 106, 150];
  ys.forEach((y, i) => {
    s += `<path id="ce${i}" d="M${lbx + 86} 124C${lbx + 150} 124 ${ax - 60} ${y + 18} ${ax - 2} ${y + 18}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>`;
  });
  s += node(lbx, 106, 86, 'lb');
  ys.forEach((y, i) => { s += node(ax, y, aw, `api-${i + 1}`); });
  // api-2 down: red outline and dot while unplugged
  s += `<g class="dn"><rect x="${ax}" y="${ys[1]}" width="${aw}" height="36" rx="9" fill="none" stroke="${t.red}" stroke-width="1.5"/><circle cx="${ax + 16}" cy="${ys[1] + 18}" r="3.5" fill="${t.red}"/></g>`;
  // packets: api-2's lane goes quiet while it is out
  const pk = (id, begin) => `<circle r="3" fill="${t.packet}"><animateMotion dur="1.3s" begin="${begin}s" repeatCount="indefinite"><mpath xlink:href="#${id}"/></animateMotion></circle>`;
  s += pk('ce0', 0) + pk('ce0', 0.65) + pk('ce2', 0.3) + pk('ce2', 0.95);
  s += `<g class="tr">${pk('ce1', 0.15) + pk('ce1', 0.8)}</g>`;

  // the plug in api-2's right side, and a spark when it comes out
  const px = ax + aw, py = ys[1] + 18;
  s += `<line x1="${px}" y1="${py}" x2="${px + 12}" y2="${py}" stroke="${t.edge}" stroke-width="2"/>`;
  s += `<g class="pg"><rect x="${px + 12}" y="${py - 6}" width="11" height="12" rx="2.5" fill="${t.faint}"/><line x1="${px + 23}" y1="${py}" x2="${px + 34}" y2="${py}" stroke="${t.faint}" stroke-width="2.5"/></g>`;
  s += `<g class="sp" stroke="${t.warn}" stroke-width="1.6" stroke-linecap="round">` +
    [[-1, -1], [1, -1], [0, -1.3], [-1, 1], [1, 1]].map(([dx, dy]) => `<line x1="${px + 13 + dx * 4}" y1="${py + dy * 4}" x2="${px + 13 + dx * 9}" y2="${py + dy * 9}"/>`).join('') + `</g>`;

  // the monkey
  const mx = px + 58, my = py;
  s += `<g class="mk">` +
    `<line x1="${mx - 12}" y1="${my + 7}" x2="${px + 34}" y2="${py}" stroke="${fur}" stroke-width="3.5" stroke-linecap="round"/><circle cx="${px + 34}" cy="${py}" r="3.2" fill="${fur}"/>` +
    `<circle cx="${mx}" cy="${my + 22}" r="11" fill="${fur}"/>` +
    `<circle cx="${mx - 14}" cy="${my - 3}" r="6.5" fill="${fur}"/><circle cx="${mx + 14}" cy="${my - 3}" r="6.5" fill="${fur}"/>` +
    `<circle cx="${mx - 14}" cy="${my - 3}" r="3.5" fill="${face}"/><circle cx="${mx + 14}" cy="${my - 3}" r="3.5" fill="${face}"/>` +
    `<circle cx="${mx}" cy="${my}" r="14" fill="${fur}"/><ellipse cx="${mx}" cy="${my + 3}" rx="10" ry="9" fill="${face}"/>` +
    `<circle cx="${mx - 4}" cy="${my}" r="2" fill="${ink}"/><circle cx="${mx + 4}" cy="${my}" r="2" fill="${ink}"/>` +
    `<path d="M${mx - 4.5} ${my + 6}Q${mx} ${my + 10.5} ${mx + 4.5} ${my + 6}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/></g>`;

  // the log
  const lx = 486, l0 = 66, lp = 22;
  const lines = [
    [2.2, [['14:02:07', 'faint'], ['  chaos  ', 'muted'], ['unplugged api-2', 'warn']]],
    [2.7, [['14:02:07', 'faint'], ['  lb     ', 'muted'], ['api-2 failing · circuit open', 'fg']]],
    [3.2, [['14:02:08', 'faint'], ['  lb     ', 'muted'], ['retried on api-3 · ', 'fg'], ['200 OK', 'ok']]],
    [6.5, [['14:02:12', 'faint'], ['  k8s    ', 'muted'], ['api-2 restarted · ready', 'ok']]],
    [7.2, [['14:02:13', 'faint'], ['  lb     ', 'muted'], ['circuit closed · traffic back', 'fg']]],
  ];
  lines.forEach(([at, parts], i) => {
    s += `<g class="cl${i}">` + runs(parts.map(([str, c]) => ({ s: str, fill: t[c] })), { f: F.mono, size: 11.5, x: lx, y: l0 + i * lp }).svg + `</g>`;
    css += blink(`cl${i}`, C, [[at, 11.3]], 0.2);
  });
  s += `<line x1="${lx}" y1="${H - 42}" x2="${Wd - P}" y2="${H - 42}" stroke="${t.border}" stroke-dasharray="2 4"/>`;
  s += runs([{ s: 'requests lost ', fill: t.muted }, { s: '0', f: F.monoB, fill: t.accent }, { s: '  ·  ', fill: t.faint }, { s: 'the monkey is a volunteer', fill: t.faint }], { f: F.mono, size: 12.5, x: lx, y: H - 22 }).svg;

  css += blink('dn', C, [[2.25, 6.5]], 0.1) + blink('tr', C, [[0, 2.2], [6.7, C]], 0.1) + blink('sp', C, [[2.25, 2.6]], 0.05);
  css += frames('pg', C, [[0, 'transform:none'], [2.2, 'transform:none'], [2.45, 'transform:translateX(16px)'], [6.3, 'transform:translateX(16px)'], [6.45, 'transform:none'], [C, 'transform:none']]);
  const up = 'transform:translate(0,0)', down = 'transform:translate(0,26px)', pulled = 'transform:translate(16px,0)';
  css += frames('mk', C, [[0, `opacity:0;${down}`], [1.0, `opacity:0;${down}`], [1.4, `opacity:1;${up}`], [2.2, `opacity:1;${up}`], [2.45, `opacity:1;${pulled}`],
    [5.2, `opacity:1;${pulled}`], [5.6, 'opacity:0;transform:translate(16px,26px)'], [C, `opacity:0;${down}`]]);
  css += `@media (prefers-reduced-motion:reduce){.mk,${lines.map((_, i) => `.cl${i}`).join(',')}{opacity:1!important}.dn,.sp{opacity:0!important}.tr{opacity:1!important}}`;
  s = s.replace('<!--DEFS-->', `<!--DEFS--><style>${css}</style>`);
  return close(s);
}

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
  files[`card-echoandaura-${name}.svg`] = flagship(t);
  files[`terminal-${name}.svg`] = terminal(t);
  files[`chaos-${name}.svg`] = chaos(t);
  files[`stack-${name}.svg`] = stack(t);
}
for (const [f, svg] of Object.entries(files)) {
  fs.writeFileSync(new URL(f, outDir), svg);
  console.log(f.padEnd(28), (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
}
