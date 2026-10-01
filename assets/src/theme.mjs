// Colours and shared animation CSS for every generated SVG (build.mjs and live.mjs).

export const THEMES = {
  dark: {
    bg0: '#0d1117', bg1: '#0a1a1b', border: '#21262d', fg: '#e6edf3', muted: '#9198a1', faint: '#6e7681',
    accent: '#5eead4', packet: '#2dd4bf', panel: '#161b22', panelStroke: '#21262d',
    node: '#161b22', nodeStroke: '#30363d', edge: '#3d444d', grid: '#30363d',
    chipBg: '#2dd4bf14', chipStroke: '#2dd4bf47', chipText: '#99f6e4',
    track: '#0d1117', red: '#f85149', ok: '#3fb950', warn: '#d29922', glow: 0.12,
  },
  light: {
    bg0: '#ffffff', bg1: '#effcf9', border: '#d0d7de', fg: '#1f2328', muted: '#59636e', faint: '#818b98',
    accent: '#0f766e', packet: '#0d9488', panel: '#f6f8fa', panelStroke: '#d8dee4',
    node: '#ffffff', nodeStroke: '#d0d7de', edge: '#afb8c1', grid: '#d0d7de',
    chipBg: '#0d948812', chipStroke: '#0d94884d', chipText: '#115e59',
    track: '#ffffff', red: '#cf222e', ok: '#1a7f37', warn: '#9a6700', glow: 0.10,
  },
};
export const col = (t, k) => (k === 'FG' ? t.fg : t[k] ?? k);

export const EASE = 'cubic-bezier(.2,.7,.2,1)';
export const baseCss = `
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ring{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(2.6)}}
.up{animation:up .8s ${EASE} both}.fade{animation:fade .9s ease both}
.pulse{animation:pulse 2.4s ease-in-out infinite}
.ring{transform-box:fill-box;transform-origin:center;animation:ring 2s ease-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
export const delay = (s) => `style="animation-delay:${s}s"`;

/**
 * Looping timeline. `points` is [[seconds, css], ...] within one cycle of `cycle` seconds, where css is
 * a declaration string or a bare opacity number; returns the @keyframes rule plus a class running it forever.
 */
export function frames(name, cycle, points) {
  const decl = (v) => (typeof v === 'number' ? `opacity:${v}` : v);
  const pct = (s) => +((s / cycle) * 100).toFixed(2) + '%';
  const kf = points.map(([s, v]) => `${pct(s)}{${decl(v)}}`).join('');
  return `@keyframes ${name}{${kf}}.${name}{${decl(points[0][1])};animation:${name} ${cycle}s linear infinite}`;
}

/** Visible during each [from, to] window (seconds) of the cycle, hidden otherwise, with short fades. */
export function blink(name, cycle, windows, ramp = 0.15) {
  const pts = [];
  if (windows[0][0] > 0) pts.push([0, 0]);
  for (const [a, b] of windows) {
    if (a > 0) pts.push([a, 0], [a + ramp, 1]); else pts.push([0, 1]);
    if (b < cycle) pts.push([b, 1], [b + ramp, 0]); else pts.push([cycle, 1]);
  }
  if (pts[pts.length - 1][0] < cycle) pts.push([cycle, 0]);
  return frames(name, cycle, pts);
}
