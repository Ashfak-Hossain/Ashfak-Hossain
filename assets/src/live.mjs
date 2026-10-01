// Live cards: a status board for the deployed projects, GitHub activity, and Codeforces.
// .github/workflows/live.yml runs this hourly and publishes the SVGs to the `output` branch.
//   node live.mjs --out <dir>            check, fetch, merge into <dir>/data.json, render
//   node live.mjs --out <dir> --sample   render made-up data for a local preview (never publish it)
// Each source fails on its own: a fetch that fails keeps the previous data and logs a warning.
import fs from 'node:fs';
import path from 'node:path';
import { F, W, T, runs, svgOpen, close, beginDoc, r } from './lib.mjs';
import { THEMES, baseCss, delay } from './theme.mjs';

/* ─────────────────────────────── CONFIG ──────────────────────────────── */
const CONFIG = {
  github: 'Ashfak-Hossain',
  codeforces: '_Berlin_',
  // Public health endpoints; only the status code and the response time are recorded.
  sites: [
    { id: 'echoandaura', name: 'EchoAndAura', host: 'echoandaura.com', path: '/api/health' },
    { id: 'shortn', name: 'shortn', host: 'shortn.ashfak.dev', path: '/healthz' },
    { id: 'nooverlap', name: 'noOverlap', host: 'nooverlap.ashfak.dev', path: '/api/health' },
  ],
  excludeRepos: [],      // repo names left out of stars and languages
  hideLanguages: [],     // e.g. ['Jupyter Notebook']
};
const HISTORY = 24 * 30; // hourly checks kept: 30 days
const UA = `profile-cards (github.com/${CONFIG.github})`;

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = path.resolve(outIdx >= 0 ? args[outIdx + 1] : '.');
const SAMPLE = args.includes('--sample');

/* ─────────────────────────────── FETCH ───────────────────────────────── */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function getJSON(url, init = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000), headers: { 'user-agent': UA, ...init.headers } });
  if (!res.ok) throw new Error(`${new URL(url).host} answered HTTP ${res.status}`);
  return res.json();
}

// Three requests; the verdict is the majority. A 4xx (an edge challenge, a rate limit) says nothing
// about the service, so it counts as no answer rather than as down.
async function checkSite(site) {
  const tries = [];
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    try {
      const res = await fetch(`https://${site.host}${site.path}`, { signal: AbortSignal.timeout(10_000), headers: { 'user-agent': UA }, cache: 'no-store' });
      await res.arrayBuffer();
      tries.push({ up: res.ok ? true : res.status >= 500 ? false : null, ms: Math.round(performance.now() - t0), code: res.status });
    } catch (e) {
      tries.push({ up: false, ms: null, code: String(e.cause?.code ?? e.name) });
    }
  }
  const ups = tries.filter((x) => x.up === true).length, downs = tries.filter((x) => x.up === false).length;
  const okMs = tries.filter((x) => x.up).map((x) => x.ms).sort((a, b) => a - b);
  return {
    up: ups >= 2 ? true : downs >= 2 ? false : null,
    ms: okMs.length ? okMs[Math.floor(okMs.length / 2)] : null,
    codes: tries.map((x) => x.code).join(','),
  };
}

const GQL = `query($login: String!) {
  user(login: $login) {
    pullRequests(states: MERGED) { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
      totalCount
      nodes { name stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

async function fetchGitHub(login, token) {
  const j = await getJSON('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query: GQL, variables: { login } }),
  });
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join('; '));
  const u = j.data.user;
  let stars = 0;
  const langs = new Map();
  for (const repo of u.repositories.nodes) {
    if (CONFIG.excludeRepos.includes(repo.name)) continue;
    stars += repo.stargazerCount;
    for (const { size, node } of repo.languages.edges) {
      if (CONFIG.hideLanguages.includes(node.name)) continue;
      const l = langs.get(node.name) ?? { name: node.name, color: node.color, size: 0 };
      l.size += size;
      langs.set(node.name, l);
    }
  }
  const cal = u.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  return {
    at: new Date().toISOString(),
    total: cal.totalContributions,
    commits: u.contributionsCollection.totalCommitContributions,
    mergedPRs: u.pullRequests.totalCount,
    repos: u.repositories.totalCount,
    stars,
    langs: [...langs.values()].sort((a, b) => b.size - a.size),
    start: days[0].date,
    counts: days.map((d) => d.contributionCount),
  };
}

async function fetchCodeforces(handle) {
  // The API allows one call every two seconds.
  const api = async (method, query) => {
    const j = await getJSON(`https://codeforces.com/api/${method}?${query}`);
    await sleep(2100);
    if (j.status !== 'OK') throw new Error(`codeforces ${method}: ${j.comment}`);
    return j.result;
  };
  const h = encodeURIComponent(handle);
  const [info] = await api('user.info', `handles=${h}`);
  const history = await api('user.rating', `handle=${h}`);
  const subs = await api('user.status', `handle=${h}`);
  const solved = new Map();
  for (const s of subs) {
    if (s.verdict !== 'OK') continue;
    const key = `${s.problem.contestId ?? s.problem.problemsetName}/${s.problem.index}`;
    if (!solved.has(key)) solved.set(key, s.problem.rating ?? null);
  }
  const byRating = {};
  for (const rt of solved.values()) if (rt) byRating[rt] = (byRating[rt] ?? 0) + 1;
  return {
    at: new Date().toISOString(),
    handle: info.handle,
    rating: info.rating ?? null,
    maxRating: info.maxRating ?? null,
    rank: info.rank ?? 'unrated',
    maxRank: info.maxRank ?? null,
    contests: history.length,
    solved: solved.size,
    byRating,
    history: history.map((x) => [x.ratingUpdateTimeSeconds, x.newRating]),
  };
}

/* ─────────────────────────────── HELPERS ─────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => { const d = new Date(iso); return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtTime = (iso) => { const d = new Date(iso); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`; };
const num = (n) => Number(n).toLocaleString('en-US');
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const eyebrow = (t, label, x, y) => `<rect x="${x}" y="${y - 6}" width="22" height="2.5" rx="1.25" fill="${t.accent}"/>` +
  T(label, { f: F.monoM, size: 12, x: x + 32, y, ls: 0.14, fill: t.accent });
const sampleTag = (t, x, y) => T('SAMPLE DATA · PREVIEW ONLY', { f: F.monoM, size: 11, x, y, anchor: 'end', ls: 0.1, fill: t.red });
const growCss = `
@keyframes gy{from{transform:scaleY(0)}to{transform:none}}@keyframes gx{from{transform:scaleX(0)}to{transform:none}}
@keyframes draw{to{stroke-dashoffset:0}}
.gy{transform-box:fill-box;transform-origin:50% 100%;animation:gy .7s cubic-bezier(.2,.7,.2,1) both}
.gx{transform-box:fill-box;transform-origin:0 50%;animation:gx .9s cubic-bezier(.2,.7,.2,1) both}
.draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2s cubic-bezier(.4,.1,.2,1) .4s forwards}
@media (prefers-reduced-motion:reduce){.draw{stroke-dashoffset:0}}`;
const frame = (t, Wd, H) => `<rect x=".5" y=".5" width="${Wd - 1}" height="${H - 1}" rx="14" fill="${t.bg0}" stroke="${t.border}"/>`;

/* ─────────────────────────────── STATUS BOARD ────────────────────────── */
function siteSummary(checks, now) {
  const recent = checks.filter((c) => now - Date.parse(c.t) <= 30 * 864e5);
  const known = recent.filter((c) => c.up !== null);
  const last = known.at(-1);
  const upCount = known.filter((c) => c.up).length;
  const days = known.length ? (now - Date.parse(known[0].t)) / 864e5 : 0;
  const ms = checks.filter((c) => c.up && c.ms != null).slice(-24).map((c) => c.ms).sort((a, b) => a - b);
  return {
    state: !last ? 'none' : last.up ? 'up' : 'down',
    uptime: known.length ? (upCount / known.length) * 100 : null,
    span: !known.length ? null : days >= 1 ? `${Math.min(30, Math.round(days))}d` : `${known.length} check${known.length === 1 ? '' : 's'}`,
    median: ms.length ? ms[Math.floor(ms.length / 2)] : null,
    bars: checks.slice(-48),
  };
}

function statusBoard(t, data) {
  beginDoc();
  const Wd = 940, P = 24, rowH = 60, top = 74, cols = [P + 28, 300, 436, 556, 684];
  const H = top + CONFIG.sites.length * rowH + 42;
  const now = data.checkedAt ? Date.parse(data.checkedAt) : Date.now();
  const rows = CONFIG.sites.map((s) => ({ s, ...siteSummary(data.status?.[s.id] ?? [], now) }));
  const down = rows.filter((x) => x.state === 'down').length, none = rows.every((x) => x.state === 'none');
  const fmtUp = (u) => (u == null ? '—' : u === 100 ? '100%' : `${u.toFixed(2)}%`);
  const desc = rows.map((x) => `${x.s.name}: ${x.state === 'up' ? 'operational' : x.state === 'down' ? 'down' : 'no data'}, uptime ${fmtUp(x.uptime)}, median ${x.median ?? '—'} ms`).join('; ');
  let s = svgOpen(Wd, H, 'Live systems status', desc);
  s += `<style>${baseCss}${growCss}</style>` + frame(t, Wd, H);
  s += `<g class="up">${eyebrow(t, 'LIVE SYSTEMS', P, 38)}</g>`;

  // summary pill
  const [sumText, sumCol] = none ? ['waiting for the first check', t.faint] : down ? [`${down} of ${rows.length} down`, t.red] : ['all systems operational', t.ok];
  if (data.sample) s += sampleTag(t, Wd - P, 38);
  else {
    const sw = W(sumText, F.m, 13) + 40, sx = Wd - P - sw;
    s += `<g class="up" ${delay(0.1)}><rect x="${r(sx)}" y="18" width="${r(sw)}" height="28" rx="14" fill="${t.panel}" stroke="${t.border}"/>` +
      `<circle class="ring" cx="${r(sx + 17)}" cy="32" r="4" fill="${sumCol}"/><circle cx="${r(sx + 17)}" cy="32" r="4" fill="${sumCol}"/>` +
      T(sumText, { f: F.m, size: 13, x: sx + 29, y: 36.5, fill: t.fg }) + `</g>`;
  }

  // column heads
  ['SERVICE', 'STATE', 'UPTIME', 'RESPONSE', 'LAST 48 CHECKS'].forEach((h, i) => {
    s += T(h, { f: F.monoM, size: 10.5, x: i ? cols[i] : P, y: top - 8, ls: 0.12, fill: t.faint });
  });

  rows.forEach((row, i) => {
    const y = top + i * rowH;
    const c = row.state === 'up' ? t.ok : row.state === 'down' ? t.red : t.faint;
    let g = `<line x1="${P}" y1="${y}" x2="${Wd - P}" y2="${y}" stroke="${t.border}" stroke-dasharray="2 4"/>`;
    g += (row.state === 'up' ? `<circle class="ring" cx="${P + 8}" cy="${y + 25}" r="4.5" fill="${c}"/>` : '') + `<circle cx="${P + 8}" cy="${y + 25}" r="4.5" fill="${c}"/>`;
    g += T(row.s.name, { f: F.sb, size: 16, x: cols[0], y: y + 30, fill: t.fg });
    g += T(row.s.host, { f: F.mono, size: 12, x: cols[0], y: y + 48, fill: t.muted });
    g += T(row.state === 'up' ? 'operational' : row.state === 'down' ? 'down' : 'no data', { f: F.m, size: 14, x: cols[1], y: y + 30, fill: c });
    g += T(`GET ${row.s.path}`, { f: F.mono, size: 11, x: cols[1], y: y + 48, fill: t.faint });
    g += T(fmtUp(row.uptime), { f: F.monoM, size: 16, x: cols[2], y: y + 30, fill: t.fg });
    g += T(row.span ? `over ${row.span}` : 'no checks yet', { f: F.mono, size: 11, x: cols[2], y: y + 48, fill: t.faint });
    g += T(row.median == null ? '—' : `${row.median} ms`, { f: F.monoM, size: 16, x: cols[3], y: y + 30, fill: t.fg });
    g += T('p50 · last 24', { f: F.mono, size: 11, x: cols[3], y: y + 48, fill: t.faint });
    // bars: one per hourly check, oldest left; empty slots fill in as history grows
    const bx = cols[4], bw = Wd - P - bx, n = 48, pitch = bw / n, base = y + 48, maxH = 32;
    const pad = n - row.bars.length;
    for (let k = 0; k < n; k++) {
      const x = r(bx + k * pitch);
      const ck = row.bars[k - pad];
      if (!ck) { g += `<rect x="${x}" y="${base - 2}" width="${r(pitch - 1.6)}" height="2" rx="1" fill="${t.grid}"/>`; continue; }
      let h, fill;
      if (ck.up === false) { h = maxH; fill = t.red; }
      else if (ck.up == null || ck.ms == null) { h = 3; fill = t.faint; }
      else { h = 4 + (maxH - 4) * Math.min(1, Math.max(0, Math.log(ck.ms / 20) / Math.log(2000 / 20))); fill = t.packet; }
      g += `<rect class="gy" style="animation-delay:${(0.2 + k * 0.012).toFixed(3)}s" x="${x}" y="${r(base - h)}" width="${r(pitch - 1.6)}" height="${r(h)}" rx="1" fill="${fill}"/>`;
    }
    s += `<g class="up" ${delay(0.15 + i * 0.08)}>${g}</g>`;
  });

  const fy = H - 18;
  s += `<line x1="${P}" y1="${fy - 22}" x2="${Wd - P}" y2="${fy - 22}" stroke="${t.border}"/>`;
  s += `<g class="fade" ${delay(0.6)}>` + T('health endpoints checked hourly from GitHub Actions', { f: F.mono, size: 11.5, x: P, y: fy, fill: t.faint }) +
    T(data.checkedAt ? `last check ${fmtDate(data.checkedAt)} · ${fmtTime(data.checkedAt)}` : 'no checks yet', { f: F.mono, size: 11.5, x: Wd - P, y: fy, anchor: 'end', fill: t.faint }) + `</g>`;
  return close(s);
}

/* ─────────────────────────────── GITHUB ACTIVITY ─────────────────────── */
function streaks(counts) {
  let longest = 0, run = 0;
  for (const c of counts) { run = c > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  // today may simply not have a contribution yet; the streak is alive until tomorrow
  let i = counts.length - 1, current = 0;
  if (i >= 0 && counts[i] === 0) i--;
  while (i >= 0 && counts[i] > 0) { current++; i--; }
  return { current, longest };
}

function githubCard(t, data, sample) {
  beginDoc();
  const g = data;
  const Wd = 940, P = 24, H = 396;
  if (!g) return placeholder(t, Wd, 'GITHUB · LAST 12 MONTHS', 'GitHub activity appears after the first successful fetch.');
  const { current, longest } = streaks(g.counts);
  const days = (n) => (n === 1 ? ' day' : ' days');
  const tiles = [
    [num(g.total), '', 'contributions · 1y'],
    [`${current}`, days(current), 'current streak'],
    [`${longest}`, days(longest), 'longest streak · 1y'],
    [num(g.commits), '', 'commits · 1y'],
    [num(g.mergedPRs), '', 'merged PRs'],
    [num(g.stars), '', 'stars earned'],
  ];
  let s = svgOpen(Wd, H, 'GitHub activity',
    `${g.total} contributions in the last year; current streak ${current} days, longest ${longest}; ${g.commits} commits; ${g.mergedPRs} merged pull requests; ${g.stars} stars. ` +
    `Top languages: ${g.langs.slice(0, 6).map((l) => l.name).join(', ')}.`);
  s += `<style>${baseCss}${growCss}</style>` + frame(t, Wd, H);
  s += `<g class="up">${eyebrow(t, 'GITHUB · LAST 12 MONTHS', P, 38)}</g>`;
  s += sample ? sampleTag(t, Wd - P, 38) : `<g class="fade">` + T(`updated ${fmtDate(g.at)}`, { f: F.mono, size: 11.5, x: Wd - P, y: 38, anchor: 'end', fill: t.faint }) + `</g>`;

  // tiles
  const tg = 10, tw = (Wd - 2 * P - tg * (tiles.length - 1)) / tiles.length, ty = 56;
  tiles.forEach(([v, unit, label], i) => {
    const x = P + i * (tw + tg);
    s += `<g class="up" ${delay(0.08 + i * 0.05)}><rect x="${r(x)}" y="${ty}" width="${r(tw)}" height="68" rx="10" fill="${t.panel}" stroke="${t.panelStroke}"/>` +
      runs([{ s: v, f: F.b, fill: i === 1 && current > 0 ? t.accent : t.fg }, ...(unit ? [{ s: unit, f: F.m, size: 14, fill: t.muted }] : [])], { f: F.b, size: 26, x: x + 14, y: ty + 36 }).svg +
      T(label, { f: F.mono, size: 10.5, x: x + 14, y: ty + 55, fill: t.muted }) + `</g>`;
  });

  // heatmap: one column per week, Sunday on top
  const hx = P + 30, hy = 162, pitch = (Wd - P - hx) / 53, cs = r(pitch - 3.2);
  const start = new Date(g.start + 'T00:00:00Z'), wd0 = start.getUTCDay();
  const nz = g.counts.filter((c) => c > 0).sort((a, b) => a - b);
  const q = [0.25, 0.5, 0.75].map((p) => nz[Math.floor(p * (nz.length - 1))] ?? 1);
  const level = (c) => (c <= 0 ? 0 : c <= q[0] ? 1 : c <= q[1] ? 2 : c <= q[2] ? 3 : 4);
  const op = [1, 0.3, 0.5, 0.75, 1];
  let defs = `<rect id="hc0" width="${cs}" height="${cs}" rx="3" fill="${t.panel}" stroke="${t.panelStroke}"/>`;
  for (let l = 1; l <= 4; l++) defs += `<rect id="hc${l}" width="${cs}" height="${cs}" rx="3" fill="${t.packet}" fill-opacity="${op[l]}"/>`;
  s += `<defs>${defs}</defs>`;
  const columns = [];
  let lastMonthCol = -9;
  let months = '';
  g.counts.forEach((c, i) => {
    const col = Math.floor((i + wd0) / 7), row = (i + wd0) % 7;
    (columns[col] ??= []).push(`<use href="#hc${level(c)}" x="${r(hx + col * pitch)}" y="${r(hy + row * pitch)}"/>`);
    const d = new Date(start.getTime() + i * 864e5);
    if (d.getUTCDate() === 1 && col - lastMonthCol >= 3 && col <= 50) {
      months += T(MONTHS[d.getUTCMonth()], { f: F.mono, size: 10.5, x: hx + col * pitch, y: hy - 8, fill: t.faint });
      lastMonthCol = col;
    }
  });
  s += `<g class="fade" ${delay(0.3)}>${months}` +
    ['Mon', 'Wed', 'Fri'].map((d, i) => T(d, { f: F.mono, size: 10.5, x: P, y: hy + (1 + 2 * i) * pitch + cs - 2, fill: t.faint })).join('') + `</g>`;
  columns.forEach((cells, col) => { s += `<g class="fade" ${delay((0.3 + col * 0.016).toFixed(3))}>${cells.join('')}</g>`; });
  // today, ringed
  const li = g.counts.length - 1, lcol = Math.floor((li + wd0) / 7), lrow = (li + wd0) % 7;
  s += `<rect class="pulse" x="${r(hx + lcol * pitch - 2)}" y="${r(hy + lrow * pitch - 2)}" width="${r(cs + 4)}" height="${r(cs + 4)}" rx="4.5" fill="none" stroke="${t.accent}" stroke-width="1.5"/>`;
  // legend
  const ly = hy + 7 * pitch + 18;
  let lg = T('less', { f: F.mono, size: 10.5, x: Wd - P - 5 * (cs + 4) - 34, y: ly, anchor: 'end', fill: t.faint });
  for (let l = 0; l <= 4; l++) lg += `<use href="#hc${l}" x="${r(Wd - P - 30 - (5 - l) * (cs + 4))}" y="${r(ly - cs + 2)}"/>`;
  lg += T('more', { f: F.mono, size: 10.5, x: Wd - P, y: ly, anchor: 'end', fill: t.faint });
  s += `<g class="fade" ${delay(1.1)}>${lg}` +
    runs([{ s: num(g.total), f: F.monoM, fill: t.fg }, { s: ' contributions in the last year', fill: t.muted }], { f: F.mono, size: 11.5, x: P, y: ly }).svg + `</g>`;

  // languages
  const top = g.langs.slice(0, 6), rest = g.langs.slice(6).reduce((a, l) => a + l.size, 0);
  const all = [...top, ...(rest ? [{ name: 'Other', color: t.faint, size: rest }] : [])];
  const total = all.reduce((a, l) => a + l.size, 0) || 1;
  const by = 332, bw = Wd - 2 * P;
  s += `<g class="up" ${delay(0.5)}>` + T('LANGUAGES · PUBLIC REPOS, BY CODE SIZE', { f: F.monoM, size: 10.5, x: P, y: by - 10, ls: 0.12, fill: t.faint }) + `</g>`;
  s += `<defs><clipPath id="lb"><rect x="${P}" y="${by}" width="${bw}" height="10" rx="5"/></clipPath></defs>`;
  let bx = P, bars = '', legend = '', lx = P;
  all.forEach((l, i) => {
    const w = (l.size / total) * bw;
    bars += `<rect class="gx" style="animation-delay:${(0.6 + i * 0.08).toFixed(2)}s" x="${r(bx)}" y="${by}" width="${r(w + 0.5)}" height="10" fill="${l.color ?? t.faint}"/>`;
    bx += w;
    const pct = `${((l.size / total) * 100).toFixed(1)}%`;
    legend += `<circle cx="${r(lx + 5)}" cy="${by + 31}" r="4.5" fill="${l.color ?? t.faint}"/>` +
      T(l.name, { f: F.m, size: 13, x: lx + 15, y: by + 35.5, fill: t.fg }) +
      T(pct, { f: F.mono, size: 12, x: lx + 21 + W(l.name, F.m, 13), y: by + 35.5, fill: t.muted });
    lx += 21 + W(l.name, F.m, 13) + W(pct, F.mono, 12) + 22;
  });
  s += `<g clip-path="url(#lb)"><rect x="${P}" y="${by}" width="${bw}" height="10" fill="${t.panel}"/>${bars}</g>`;
  s += `<g class="fade" ${delay(0.9)}>${legend}</g>`;
  return close(s);
}

/* ─────────────────────────────── CODEFORCES ──────────────────────────── */
// [from rating, colour on dark, colour on light]
const CF_RANKS = [
  [-Infinity, '#9198a1', '#808080'], [1200, '#3fb950', '#1a7f37'], [1400, '#2dd4bf', '#03a89e'],
  [1600, '#79a6ff', '#2448d8'], [1900, '#d38bf0', '#aa00aa'], [2100, '#ffa94d', '#d97706'],
  [2400, '#ff6b6b', '#e5383b'],
];
const cfColor = (t, rating) => {
  const row = [...CF_RANKS].reverse().find(([min]) => rating >= min);
  return t === THEMES.dark ? row[1] : row[2];
};

function cfCard(t, cf, sample) {
  beginDoc();
  const Wd = 940, P = 24, H = 372;
  if (!cf) return placeholder(t, Wd, 'COMPETITIVE PROGRAMMING', 'Codeforces stats appear after the first successful fetch.');
  const rc = cf.rating != null ? cfColor(t, cf.rating) : t.faint;
  let s = svgOpen(Wd, H, `Codeforces: ${cf.handle}`,
    `${titleCase(cf.rank)}, rating ${cf.rating ?? 'unrated'}${cf.maxRating ? `, max ${cf.maxRating}` : ''}; ${cf.contests} rated contests; ${cf.solved} problems solved.`);
  s += `<style>${baseCss}${growCss}</style>` + frame(t, Wd, H);
  s += `<g class="up">${eyebrow(t, 'COMPETITIVE PROGRAMMING', P, 38)}</g>`;
  s += sample ? sampleTag(t, Wd - P, 38) : `<g class="fade">` + T(`codeforces.com/profile/${cf.handle} · updated ${fmtDate(cf.at)}`, { f: F.mono, size: 11.5, x: Wd - P, y: 38, anchor: 'end', fill: t.faint }) + `</g>`;

  // left: rank, rating, totals
  let L = T(titleCase(cf.rank), { f: F.sb, size: 17, x: P, y: 82, fill: rc });
  L += T(cf.rating != null ? String(cf.rating) : '—', { f: F.xb, size: 52, x: P - 2, y: 136, ls: -0.03, fill: rc });
  if (cf.maxRating) L += runs([{ s: 'max ', fill: t.faint }, { s: String(cf.maxRating), f: F.monoM, fill: cfColor(t, cf.maxRating) }, { s: ` · ${cf.maxRank}`, fill: t.faint }], { f: F.mono, size: 12, x: P, y: 160 }).svg;
  [[num(cf.contests), 'rated contests'], [num(cf.solved), 'problems solved']].forEach(([v, label], i) => {
    const x = P + i * 130;
    L += T(v, { f: F.b, size: 22, x, y: 206, fill: t.fg }) + T(label, { f: F.mono, size: 10.5, x, y: 224, fill: t.muted });
  });
  s += `<g class="up" ${delay(0.1)}>${L}</g>`;

  // right: rating history over the rank bands
  const cx = 330, cy = 60, cw = Wd - P - cx, ch = 170;
  let C = `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="10" fill="${t.panel}" stroke="${t.panelStroke}"/>`;
  const hist = cf.history;
  if (hist.length >= 2) {
    const rs = hist.map((h) => h[1]);
    const lo = Math.floor((Math.min(...rs) - 100) / 100) * 100, hi = Math.ceil((Math.max(...rs) + 100) / 100) * 100;
    const t0 = hist[0][0], t1 = hist.at(-1)[0];
    const ix = cx + 46, iw = cw - 46 - 18, iy = cy + 14, ih = ch - 28;
    const X = (ts) => ix + ((ts - t0) / (t1 - t0 || 1)) * iw;
    const Y = (v) => iy + ih - ((v - lo) / (hi - lo)) * ih;
    C += `<defs><clipPath id="cc"><rect x="${cx + 1}" y="${cy + 1}" width="${cw - 2}" height="${ch - 2}" rx="9"/></clipPath></defs><g clip-path="url(#cc)">`;
    CF_RANKS.forEach(([min], i) => {
      const max = CF_RANKS[i + 1]?.[0] ?? Infinity;
      const a = Math.max(lo, min), b = Math.min(hi, max);
      if (a >= b) return;
      C += `<rect x="${cx}" y="${r(Y(b))}" width="${cw}" height="${r(Y(a) - Y(b))}" fill="${cfColor(t, a)}" opacity="${t === THEMES.dark ? 0.07 : 0.09}"/>`;
      if (min > lo && min < hi) {
        C += `<line x1="${cx}" y1="${r(Y(min))}" x2="${cx + cw}" y2="${r(Y(min))}" stroke="${cfColor(t, min)}" stroke-opacity=".35" stroke-dasharray="2 4"/>`;
        C += T(String(min), { f: F.mono, size: 10, x: cx + 10, y: Y(min) + 3.5, fill: t.faint });
      }
    });
    C += `</g>`;
    const d = hist.map(([ts, v], i) => `${i ? 'L' : 'M'}${r(X(ts))} ${r(Y(v))}`).join('');
    C += `<path class="draw" pathLength="1" d="${d}" fill="none" stroke="${t.fg}" stroke-opacity=".8" stroke-width="1.6" stroke-linejoin="round"/>`;
    let dots = '';
    hist.forEach(([ts, v]) => { dots += `<circle cx="${r(X(ts))}" cy="${r(Y(v))}" r="2.3" fill="${cfColor(t, v)}"/>`; });
    C += `<g class="fade" ${delay(1.6)}>${dots}</g>`;
    const [lt, lv] = hist.at(-1);
    C += `<g class="fade" ${delay(2.2)}><circle class="ring" cx="${r(X(lt))}" cy="${r(Y(lv))}" r="4" fill="${cfColor(t, lv)}"/><circle cx="${r(X(lt))}" cy="${r(Y(lv))}" r="4" fill="${cfColor(t, lv)}"/></g>`;
  } else {
    C += T('The rating graph appears after two rated contests.', { f: F.mono, size: 12, x: cx + cw / 2, y: cy + ch / 2 + 4, anchor: 'middle', fill: t.faint });
  }
  s += `<g class="up" ${delay(0.2)}>${C}</g>`;

  // bottom: solved problems by difficulty
  const ratings = Object.keys(cf.byRating).map(Number);
  const by = 262;
  s += `<g class="up" ${delay(0.3)}>` + T('SOLVED BY PROBLEM RATING', { f: F.monoM, size: 10.5, x: P, y: by, ls: 0.12, fill: t.faint }) + `</g>`;
  if (ratings.length) {
    const lo = Math.min(800, ...ratings), hi = Math.max(...ratings);
    const buckets = []; for (let v = lo; v <= hi; v += 100) buckets.push(v);
    const maxC = Math.max(...buckets.map((v) => cf.byRating[v] ?? 0));
    const gap = 4, bw = (Wd - 2 * P - gap * (buckets.length - 1)) / buckets.length, base = by + 70, maxH = 52;
    let b = '';
    buckets.forEach((v, i) => {
      const c = cf.byRating[v] ?? 0, x = P + i * (bw + gap), h = c ? Math.max(3, (c / maxC) * maxH) : 2;
      b += `<rect class="gy" style="animation-delay:${(0.5 + i * 0.03).toFixed(2)}s" x="${r(x)}" y="${r(base - h)}" width="${r(bw)}" height="${r(h)}" rx="2" fill="${c ? cfColor(t, v) : t.grid}" ${c ? 'fill-opacity=".85"' : ''}/>`;
      if (c) b += T(String(c), { f: F.mono, size: 9.5, x: x + bw / 2, y: base - h - 5, anchor: 'middle', fill: t.muted });
      if (buckets.length <= 16 || i % 2 === 0) b += T(String(v), { f: F.mono, size: 9.5, x: x + bw / 2, y: base + 15, anchor: 'middle', fill: t.faint });
    });
    s += b;
  }
  return close(s);
}

function placeholder(t, Wd, label, text) {
  beginDoc();
  const H = 120, P = 24;
  let s = svgOpen(Wd, H, label, text) + `<style>${baseCss}</style>` + frame(t, Wd, H);
  s += eyebrow(t, label, P, 38) + T(text, { f: F.r, size: 14, x: P, y: 82, fill: t.muted });
  return close(s);
}

/* ─────────────────────────────── SAMPLE DATA ─────────────────────────── */
function sampleData() {
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const now = Date.now();
  const status = {};
  for (const [k, site] of CONFIG.sites.entries()) {
    const n = 40 + k * 4;
    status[site.id] = Array.from({ length: n }, (_, i) => ({
      t: new Date(now - (n - 1 - i) * 3600e3).toISOString(),
      up: site.id === 'shortn' && i === 30 ? false : true,
      ms: Math.round(60 + k * 25 + rnd() * 90),
    }));
  }
  const start = new Date(now - 370 * 864e5);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const counts = Array.from({ length: Math.floor((now - start) / 864e5) + 1 }, (_, i) => (rnd() < 0.3 + 0.4 * (i / 371) ? Math.floor(rnd() * 12) + 1 : 0));
  let v = 1100;
  const history = Array.from({ length: 38 }, (_, i) => [Math.floor(now / 1000) - (38 - i) * 9 * 864e2, (v = Math.round(v + (rnd() - 0.38) * 90))]);
  const byRating = {};
  for (let x = 800; x <= 2000; x += 100) byRating[x] = Math.max(0, Math.round(90 - (x - 800) / 15 + rnd() * 10));
  return {
    sample: true,
    checkedAt: new Date(now).toISOString(),
    status,
    github: {
      at: new Date(now).toISOString(), total: counts.reduce((a, b) => a + b, 0), commits: 912, mergedPRs: 143, repos: 34, stars: 57,
      langs: [['TypeScript', '#3178c6', 52], ['Go', '#00ADD8', 21], ['C++', '#f34b7d', 14], ['JavaScript', '#f1e05a', 6], ['Python', '#3572A5', 4], ['CSS', '#663399', 2], ['Shell', '#89e051', 1]]
        .map(([name, color, size]) => ({ name, color, size })),
      start: start.toISOString().slice(0, 10), counts,
    },
    codeforces: {
      at: new Date(now).toISOString(), handle: CONFIG.codeforces, rating: v, maxRating: Math.max(...history.map((h) => h[1])),
      rank: 'specialist', maxRank: 'expert', contests: history.length, solved: 640, byRating, history,
    },
  };
}

/* ─────────────────────────────── MAIN ────────────────────────────────── */
fs.mkdirSync(outDir, { recursive: true });
const dataPath = path.join(outDir, 'data.json');
let data;
if (SAMPLE) {
  data = sampleData();
} else {
  try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { data = {}; }
  data.status ??= {};
  const now = new Date().toISOString();
  for (const site of CONFIG.sites) {
    const c = await checkSite(site);
    data.status[site.id] = [...(data.status[site.id] ?? []), { t: now, ...c }].slice(-HISTORY);
    console.log(`${site.host.padEnd(24)} up=${c.up} ms=${c.ms} codes=${c.codes}`);
  }
  data.checkedAt = now;
  const attempt = async (key, fn) => {
    try { data[key] = await fn(); console.log(`${key}: ok`); }
    catch (e) { console.log(`::warning::${key}: kept the previous data (${e.message})`); }
  };
  if (process.env.GITHUB_TOKEN) await attempt('github', () => fetchGitHub(CONFIG.github, process.env.GITHUB_TOKEN));
  else console.log('::warning::github: no GITHUB_TOKEN, kept the previous data');
  await attempt('codeforces', () => fetchCodeforces(CONFIG.codeforces));
  fs.writeFileSync(dataPath, JSON.stringify(data));
}

for (const [name, t] of Object.entries(THEMES)) {
  const files = {
    [`live-status-${name}.svg`]: statusBoard(t, data),
    [`github-stats-${name}.svg`]: githubCard(t, data.github, data.sample),
    [`cp-stats-${name}.svg`]: cfCard(t, data.codeforces, data.sample),
  };
  for (const [f, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(outDir, f), svg);
    console.log(f.padEnd(26), (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
  }
}
