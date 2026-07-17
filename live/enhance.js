/**
 * Live isnow enhancer for the docs site. Progressive enhancement: every fenced
 * `isnow` code block (rendered by Hugo as <figure class="listing"> with a
 * "isnow" language label) is upgraded in place into editable rows. Each line
 * becomes an input that re-evaluates through the real @tsvsheet/isnow engine on
 * every keystroke — canonical form, whether it holds right now, the next
 * occurrence, and a plain-English explanation — with parse faults shown inline.
 *
 * The whole engine is bundled in (no CDN, no network at runtime). The bundle is
 * loaded only when a docs repo opts in via `params.enhanceScript`, so a docs
 * site without a live language ships nothing.
 */

import { parse, IsnowError } from '../../isnow.js/src/isnow/index.js';

const ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const rows = [];

/** evaluate parses src at the current instant and returns a render-ready result. */
function evaluate(src) {
  try {
    const p = parse(src, { timeZone: ZONE });
    const now = new Date();
    return { ok: true, canonical: p.canonical, explain: p.explain(), holds: p.holds(now), next: p.next(now) };
  } catch (e) {
    const code = e instanceof IsnowError ? e.code : 'error';
    return { ok: false, code, message: (e && e.message) || String(e) };
  }
}

const UNITS = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60], ['s', 1]];

/** relative renders a signed second-delta as a compact "in 2h 14m" phrase. */
function relative(target, from) {
  let s = Math.round((target - from) / 1000);
  if (s <= 0) return 'now';
  const parts = [];
  for (const [u, secs] of UNITS) {
    if (s >= secs && parts.length < 2) { parts.push(Math.floor(s / secs) + u); s %= secs; }
  }
  return 'in ' + parts.join(' ');
}

const pad = (n) => String(n).padStart(2, '0');

/** stamp formats a Date as a local YYYY-MM-DD HH:MM wall-clock label. */
function stamp(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** render writes an evaluation result into a row's output nodes. */
function render(row) {
  const r = evaluate(row.input.value.trim());
  row.el.classList.toggle('il-fault', !r.ok);
  if (!r.ok) {
    row.verdict.textContent = r.code;
    row.lamp.className = 'il-lamp il-err';
    row.next.textContent = '';
    row.detail.textContent = r.message;
    return;
  }
  const now = new Date();
  row.lamp.className = 'il-lamp ' + (r.holds ? 'il-on' : 'il-off');
  row.verdict.textContent = r.holds ? 'holds now' : 'not now';
  row.next.textContent = r.next ? `next ${relative(r.next, now)} · ${stamp(r.next)}` : 'no next occurrence';
  // With a caption from the docs, show the canonical form; otherwise the
  // engine's own plain-English explanation stands in.
  row.detail.textContent = row.caption ? r.canonical : r.explain;
}

/** buildRow turns one pattern (and its optional doc caption) into a live row. */
function buildRow(item) {
  const el = document.createElement('div');
  el.className = 'il-row';
  el.innerHTML =
    '<div class="il-head"><input class="il-input" spellcheck="false" autocapitalize="off" ' +
    'autocorrect="off" aria-label="editable isnow pattern"><span class="il-cap"></span></div>' +
    '<div class="il-out"><div class="il-status"><span class="il-lamp"></span>' +
    '<span class="il-verdict"></span><span class="il-next"></span></div>' +
    '<div class="il-detail"></div></div>';
  const row = {
    el,
    caption: item.caption,
    input: el.querySelector('.il-input'),
    lamp: el.querySelector('.il-lamp'),
    verdict: el.querySelector('.il-verdict'),
    next: el.querySelector('.il-next'),
    detail: el.querySelector('.il-detail'),
  };
  row.input.value = item.pattern;
  el.querySelector('.il-cap').textContent = item.caption;
  row.input.addEventListener('input', () => render(row));
  render(row);
  rows.push(row);
  return el;
}

/**
 * patternsOf splits a code block into rows. Docs align an optional gloss after
 * the pattern with two or more spaces, and an isnow only ever uses single
 * spaces internally, so a run of two-plus spaces reliably separates them.
 */
function patternsOf(figure) {
  const code = figure.querySelector('code') || figure.querySelector('pre');
  return (code ? code.textContent : '')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const parts = l.trim().split(/\s{2,}/);
      return { pattern: parts[0].trim(), caption: parts.slice(1).join(' ').trim() };
    });
}

/** isLive reports whether a listing figure was fenced as the isnow language. */
function isLive(figure) {
  const lang = figure.querySelector('.listing-lang');
  return lang && lang.textContent.trim() === 'isnow';
}

/** enhance replaces every isnow listing with a live, editable widget. */
function enhance() {
  injectStyle();
  document.querySelectorAll('figure.listing').forEach((figure) => {
    if (!isLive(figure)) return;
    const widget = document.createElement('div');
    widget.className = 'il-widget';
    patternsOf(figure).forEach((p) => widget.appendChild(buildRow(p)));
    figure.replaceWith(widget);
  });
  // Keep "holds now" and the countdown honest as time passes.
  setInterval(() => rows.forEach(render), 5000);
}

/** injectStyle adds the widget CSS once, themed through the docs' own tokens. */
function injectStyle() {
  const css = `
  :root{--il-on:#2f9e57;--il-off:#9b9585;--il-fault:#b3402f}
  @media (prefers-color-scheme:dark){:root{--il-on:#5fd39a;--il-off:#6d6450;--il-fault:#ff8a76}}
  :root[data-theme="light"]{--il-on:#2f9e57;--il-off:#9b9585;--il-fault:#b3402f}
  :root[data-theme="dark"]{--il-on:#5fd39a;--il-off:#6d6450;--il-fault:#ff8a76}
  .il-widget{margin:1.5rem 0;display:flex;flex-direction:column;gap:10px}
  .il-row{border:1px solid var(--rule);border-radius:8px;background:var(--surface);overflow:hidden}
  .il-head{display:flex;align-items:stretch;border-bottom:1px solid var(--rule)}
  .il-input{flex:1 1 auto;min-width:0;box-sizing:border-box;border:0;
    background:var(--bg);color:var(--accent-strong,var(--accent));font-family:var(--mono);
    font-size:15px;font-weight:600;padding:11px 13px;outline:0}
  .il-input:focus{box-shadow:inset 0 -2px 0 var(--accent)}
  .il-row.il-fault .il-input{color:var(--il-fault)}
  .il-cap{flex:0 1 auto;display:flex;align-items:center;padding:0 13px;background:var(--bg);
    color:var(--muted);font-size:13px;border-left:1px solid var(--rule);white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;max-width:45%}
  .il-cap:empty{display:none}
  .il-out{padding:10px 13px;display:flex;flex-direction:column;gap:5px}
  .il-status{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;flex-wrap:wrap}
  .il-lamp{width:9px;height:9px;border-radius:50%;background:var(--il-off);flex:none}
  .il-lamp.il-on{background:var(--il-on);box-shadow:0 0 8px -1px var(--il-on)}
  .il-lamp.il-err{background:var(--il-fault)}
  .il-verdict{font-weight:600;color:var(--ink)}
  .il-next{color:var(--muted)}
  .il-detail{font-family:var(--mono);font-size:13px;color:var(--muted);word-break:break-word}
  .il-row.il-fault .il-detail{color:var(--il-fault)}
  .il-widget::after{content:"live — edit any pattern";font-family:var(--mono);font-size:11px;
    letter-spacing:.06em;text-transform:uppercase;color:var(--faint);align-self:flex-end}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhance);
} else {
  enhance();
}
