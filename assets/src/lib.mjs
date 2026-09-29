// Tiny text-to-outline + SVG helpers.
// Text is converted to vector paths so the banner and cards look identical on
// every OS and browser (GitHub renders README SVGs inside <img>, which can't load web fonts).
import opentype from 'opentype.js';
import fs from 'node:fs';

const here = new URL('.', import.meta.url);
const load = (rel) => {
  const b = fs.readFileSync(new URL(`./node_modules/@fontsource/${rel}`, here));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

export const F = {
  r: load('inter/files/inter-latin-400-normal.woff'),
  m: load('inter/files/inter-latin-500-normal.woff'),
  sb: load('inter/files/inter-latin-600-normal.woff'),
  b: load('inter/files/inter-latin-700-normal.woff'),
  xb: load('inter/files/inter-latin-800-normal.woff'),
  mono: load('jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
  monoM: load('jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'),
  monoB: load('jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff'),
};

for (const [k, f] of Object.entries(F)) f.__k = '_' + k;

/* per-document glyph registry: each glyph outline is stored once in <defs> and reused with <use> */
let reg = new Map();
export const beginDoc = () => { reg = new Map(); };
const defsOf = () => `<defs>${[...reg].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('')}</defs>`;

function glyphsOf(str, font) {
  return [...str].map((ch) => {
    const g = font.charToGlyph(ch);
    if (!g || g.index === 0) throw new Error(`Glyph missing for "${ch}" in "${str}"`);
    return g;
  });
}

function layout(str, font, size, ls = 0) {
  const glyphs = glyphsOf(str, font);
  const scale = size / font.unitsPerEm;
  let x = 0;
  const out = [];
  glyphs.forEach((g, i) => {
    out.push({ g, x });
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale + ls * size;
  });
  return { out, width: x };
}

/** width of a string in px */
export const W = (str, f, size, ls = 0) => layout(str, f, size, ls).width;

/** text as reused glyph outlines; returns a <g> */
export function T(str, o) {
  const { f, size, x = 0, y = 0, ls = 0, anchor = 'start' } = o;
  const glyphs = glyphsOf(str, f);
  const upm = f.unitsPerEm;
  let ux = 0;
  let inner = '';
  glyphs.forEach((g, i) => {
    const id = f.__k + g.index;
    if (!reg.has(id)) reg.set(id, g.getPath(0, 0, upm).toPathData(0));
    if (reg.get(id)) inner += `<use href="#${id}" x="${Math.round(ux)}"/>`;
    ux += g.advanceWidth;
    if (i < glyphs.length - 1) ux += f.getKerningValue(g, glyphs[i + 1]) + ls * upm;
  });
  const k = size / upm;
  const width = ux * k;
  const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const attrs = [`fill="${o.fill}"`, `transform="translate(${r(x0)} ${r(y)})scale(${+k.toFixed(6)})"`];
  if (o.cls) attrs.push(`class="${o.cls}"`);
  if (o.op != null) attrs.push(`opacity="${o.op}"`);
  return `<g ${attrs.join(' ')}>${inner}</g>`;
}

/** several differently-coloured runs on one baseline; returns { svg, width } */
export function runs(parts, { f, size, x = 0, y = 0, ls = 0 }) {
  let cx = x;
  let svg = '';
  for (const p of parts) {
    const pf = p.f || f;
    svg += T(p.s, { f: pf, size, x: cx, y, ls, fill: p.fill, cls: p.cls });
    cx += W(p.s, pf, size, ls);
  }
  return { svg, width: cx - x };
}

export const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** stroke arrow → */
export const arrow = (x, y, len, color, sw = 2, cls = '') =>
  `<path${cls ? ` class="${cls}"` : ''} d="M${x} ${y}h${len}m-6 -6l6 6l-6 6" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** small north-east arrow ↗ (external link) */
export const neArrow = (x, y, s, color, sw = 1.6) =>
  `<path d="M${x} ${y + s}L${x + s} ${y}M${x + s * 0.3} ${y}H${x + s}V${y + s * 0.7}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** octicon repo-16 */
export const repoIcon = (x, y, color) =>
  `<path transform="translate(${x} ${y})" fill="${color}" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>`;

/** map-pin glyph (drawn, 16×16 box) */
export const pinIcon = (x, y, color) =>
  `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="1.5">` +
  `<path d="M8 15s5-4.6 5-8.6A5 5 0 0 0 3 6.4C3 10.4 8 15 8 15Z" stroke-linejoin="round"/><circle cx="8" cy="6.5" r="1.8"/></g>`;

export const svgOpen = (w, h, title, desc) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">` +
  `<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc><!--DEFS-->`;
};
export const close = (s) => s.replace('<!--DEFS-->', defsOf()) + '</svg>';

export const r = (n) => Math.round(n * 100) / 100;
