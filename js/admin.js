// Admin panel - loaded on demand from app.js (regular users never download this file).
// It does NOT change the live app: it generates code that you paste into GitHub.
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { PROMOS } from '../data/promos.js';

const tg = window.Telegram?.WebApp;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Saved drafts (kept on this device until you upload the files) ---------- */
const KEY = 'mh_admin';
let db = {};
try { db = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
db = { drafts: [], ads: [], toggles: {}, tab: 'manual', ...db };
db.drafts = db.drafts.filter((d) => !PRODUCTS.some((p) => p.id === d.id)); // already uploaded -> drop
db.ads = db.ads.filter((a) => !PROMOS.some((p) => p.id === a.id));
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
const vals = {}; // current form values by input id
const val = (id) => vals[id] ?? '';
let note = '', root;

const all = () => [...PRODUCTS, ...db.drafts];
const ads = () => [...PROMOS, ...db.ads].map((a) => ({ ...a, active: db.toggles[a.id] ?? a.active ?? true }));

function suggest(cat) {
  const list = all();
  const ci = CATEGORIES.findIndex((c) => c.id === cat) + 1;
  const inCat = list.filter((p) => p.cat === cat).length;
  let n = inCat + 1, id;
  do { id = cat[0] + n; n++; } while (list.some((p) => p.id === id));
  let code = ci * 100000 + inCat + 1;
  while (list.some((p) => String(p.code) === String(code))) code++;
  return { id, code: String(code) };
}

/* ---------- Code generation ---------- */
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k));
function ser(v, ind = 0) {
  const pad = '  '.repeat(ind), pad2 = '  '.repeat(ind + 1);
  if (typeof v === 'string') return q(v);
  if (v === null || typeof v !== 'object') return String(v);
  if (Array.isArray(v)) return v.length ? '[\n' + v.map((x) => pad2 + ser(x, ind + 1)).join(',\n') + ',\n' + pad + ']' : '[]';
  const e = Object.entries(v);
  if (!e.length) return '{}';
  if (e.every(([, x]) => typeof x !== 'object' || x === null) && JSON.stringify(v).length < 72)
    return '{ ' + e.map(([k, x]) => key(k) + ': ' + ser(x)).join(', ') + ' }';
  return '{\n' + e.map(([k, x]) => pad2 + key(k) + ': ' + ser(x, ind + 1)).join(',\n') + ',\n' + pad + '}';
}
const entries = (list) => list.map((x) => '  ' + ser(x, 1) + ',').join('\n');

const PRODUCTS_HEAD = `// =====================================================================
//  MANUALS CATALOG  -  add manuals with the Admin panel (tap the header logo 5 times)
//  or by copying the TEMPLATE at the bottom
// =====================================================================
//  id, cat (category id), code (QR/barcode), price (ETB), name {en,am}, image, emoji,
//  summary {en,am}, voiceNoteUrl (optional MP3), manualPdfUrl (optional PDF)
// =====================================================================
export const PRODUCTS = [
`;
const PRODUCTS_TAIL = `
  // ↓↓↓ PASTE NEW MANUALS ABOVE THIS LINE ↓↓↓
];

/* ===================== TEMPLATE - copy, paste above, then edit =====================
  {
    id: 'x1', cat: 'electronics', code: '123456', price: 100,
    name: { en: 'Product name', am: 'የምርት ስም' },
    image: 'img/x1.jpg', emoji: '📘',
    summary: {
      en: 'Short summary of the manual.',
      am: 'የመመሪያው አጭር ማጠቃለያ።',
    },
    voiceNoteUrl: 'https://example.com/x1.mp3',
    manualPdfUrl: 'https://example.com/x1.pdf',
  },
================================================================================== */
`;
const PROMOS_HEAD = `// =====================================================================
//  AD / PROMO BANNERS on the home page
//  The whole banner section is HIDDEN unless at least one ad is active.
//  An ad is active when:  active is not false  AND  today is not past \`until\`.
//  Easiest way to edit: open the Admin panel in the app (tap the header logo 5 times).
// =====================================================================
//  id, tag ('featured'|'sponsored'), active (true/false), image, title {en,am}, text {en,am},
//  product (product id), link (https://...), until ('YYYY-MM-DD', optional)
// =====================================================================
export const PROMOS = [
`;
const PROMOS_TAIL = `];

/* ===================== TEMPLATE - copy, paste inside the [ ] above =====================
  {
    id: 'promo1', tag: 'featured', active: true, image: '',
    title: { en: 'New manuals every week', am: 'በየሳምንቱ አዳዲስ መመሪያዎች' },
    text: { en: 'Browse the latest arrivals.', am: 'አዳዲስ የገቡትን ይመልከቱ።' },
    product: '', link: '', until: '2026-12-31',
  },
================================================================================== */
`;
const productsFile = (list) => PRODUCTS_HEAD + entries(list) + '\n' + PRODUCTS_TAIL;
const promosFile = (list) => PROMOS_HEAD + (list.length ? entries(list) + '\n' : '  // (no ads yet - paste ads here)\n') + PROMOS_TAIL;
export const _gen = { productsFile, promosFile, ser };

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch {}
  ta.remove(); return ok;
}

/* ---------- Views ---------- */
const inp = (id, label, ph = '', type = 'text') => `<label class="f"><span>${label}</span><input id="${id}" type="${type}" placeholder="${esc(ph)}" value="${esc(val(id))}"></label>`;
const area = (id, label) => `<label class="f"><span>${label}</span><textarea id="${id}">${esc(val(id))}</textarea></label>`;

function manualTab() {
  const cat = val('m-cat') || CATEGORIES[0].id, s = suggest(cat);
  const out = entries(db.drafts);
  return `
  <section class="adm-sec"><h3>Add a manual</h3>
    <label class="f"><span>Category</span><select id="m-cat">${CATEGORIES.map((c) => `<option value="${c.id}"${c.id === cat ? ' selected' : ''}>${esc(c.name.en)}</option>`).join('')}</select></label>
    <div class="row3">${inp('m-id', 'ID', s.id)}${inp('m-code', 'QR / barcode', s.code)}${inp('m-price', 'Price (ETB)', '100', 'number')}</div>
    <div class="row2">${inp('m-name_en', 'Name (English)')}${inp('m-name_am', 'Name (አማርኛ)')}</div>
    ${area('m-summary_en', 'Summary (English)')}${area('m-summary_am', 'Summary (አማርኛ)')}
    ${inp('m-audio', 'Audio link (MP3, optional)', 'https://...')}
    ${inp('m-pdf', 'PDF link (optional)', 'https://...')}
    <div class="row2">${inp('m-image', 'Image path / link (optional)', 'img/product.jpg')}${inp('m-emoji', 'Emoji if no image', '📘')}</div>
    <div id="a-msg">${esc(note)}</div>
    <button class="btn big" data-a="addm">Add to draft list</button>
  </section>
  <section class="adm-sec"><h3>Draft manuals (${db.drafts.length})</h3>
    ${db.drafts.length ? db.drafts.map((d, i) => `<div class="item"><div><b>${esc(d.name.en)}</b><small>${esc(d.id)}, ${esc(d.cat)}, ${d.price} ETB</small></div><button class="x" data-a="rmd" data-i="${i}" aria-label="Remove">✕</button></div>`).join('') : '<p class="hint">No drafts yet. Fill the form above.</p>'}
    ${db.drafts.length ? `<h3 style="margin-top:14px">Code for data/products.js</h3>
    <p class="hint">Paste this just above the line <b>↓↓↓ PASTE NEW MANUALS ABOVE THIS LINE ↓↓↓</b>, or copy the full file and replace data/products.js completely.</p>
    <textarea class="code" readonly>${esc(out)}</textarea>
    <div class="btnrow"><button class="btn" data-a="copy" data-w="entries">Copy new entries</button><button class="btn ghost" data-a="copy" data-w="products">Copy full products.js</button></div>
    <button class="btn ghost big" data-a="clr">Clear drafts</button>` : ''}
  </section>`;
}

function adsTab() {
  const list = ads(), n = list.filter((a) => a.active).length;
  const pid = val('a-product');
  return `
  <section class="adm-sec"><h3>Ad banners</h3>
    <p class="hint">${n ? `${n} ad${n > 1 ? 's' : ''} active: shown on the home page.` : 'No active ads: the banner section is hidden for users.'}</p>
    ${list.length ? list.map((a) => `<div class="item"><div><b>${esc(a.title?.en || '(untitled)')}</b><small>${esc(a.tag)}${a.until ? ', until ' + esc(a.until) : ''}${db.ads.some((x) => x.id === a.id) ? ', new' : ''}</small></div>
      <button class="tg" role="switch" aria-checked="${a.active}" data-a="tog" data-id="${esc(a.id)}" aria-label="Toggle ad"></button>
      ${db.ads.some((x) => x.id === a.id) ? `<button class="x" data-a="rma" data-id="${esc(a.id)}" aria-label="Remove">✕</button>` : ''}</div>`).join('') : '<p class="hint">No ads yet.</p>'}
  </section>
  <section class="adm-sec"><h3>New ad announcement</h3>
    <div class="row2"><label class="f"><span>Type</span><select id="a-tag"><option value="featured"${val('a-tag') !== 'sponsored' ? ' selected' : ''}>Featured promo</option><option value="sponsored"${val('a-tag') === 'sponsored' ? ' selected' : ''}>Sponsored</option></select></label>
    ${inp('a-until', 'Show until (optional)', '', 'date')}</div>
    <div class="row2">${inp('a-title_en', 'Title (English)')}${inp('a-title_am', 'Title (አማርኛ)')}</div>
    <div class="row2">${inp('a-text_en', 'Text (English)')}${inp('a-text_am', 'Text (አማርኛ)')}</div>
    ${inp('a-image', 'Banner image (optional)', 'img/promo1.jpg')}
    <div class="row2">${inp('a-link', 'Opens link (optional)', 'https://...')}
    <label class="f"><span>Or opens manual</span><select id="a-product"><option value="">None</option>${all().map((p) => `<option value="${esc(p.id)}"${p.id === pid ? ' selected' : ''}>${esc(p.name.en)}</option>`).join('')}</select></label></div>
    <div id="a-msg">${esc(note)}</div>
    <button class="btn big" data-a="addad">Add ad</button>
  </section>
  <section class="adm-sec"><h3>Code for data/promos.js</h3>
    <p class="hint">Includes your on/off switches and new ads. Copy the full file and replace data/promos.js.</p>
    <textarea class="code" readonly>${esc(promosFile(list))}</textarea>
    <div class="btnrow"><button class="btn" data-a="copy" data-w="promos">Copy full promos.js</button></div>
  </section>`;
}

function render() {
  const st = root.querySelector('.adm-body')?.scrollTop || 0;
  root.innerHTML = `<div class="adm-scrim" data-a="close"></div>
  <aside class="adm" role="dialog" aria-label="Admin panel">
    <div class="adm-h"><h2>Admin panel</h2><button data-a="close" aria-label="Close">✕</button></div>
    <div class="adm-tabs">
      <button class="${db.tab === 'manual' ? 'on' : ''}" data-a="tab" data-t="manual">Manuals${db.drafts.length ? ` (${db.drafts.length})` : ''}</button>
      <button class="${db.tab === 'ads' ? 'on' : ''}" data-a="tab" data-t="ads">Ads</button>
    </div>
    <div class="adm-body">${db.tab === 'ads' ? adsTab() : manualTab()}
      <p class="hint">Drafts stay on this device. Nothing goes live until you upload the copied code to GitHub.</p></div>
  </aside>`;
  root.querySelector('.adm-body').scrollTop = st;
}
const say = (m) => { note = m; render(); setTimeout(() => { note = ''; const e = $('#a-msg'); if (e) e.textContent = ''; }, 3000); };

/* ---------- Actions ---------- */
const g = (p, k) => (vals[`${p}-${k}`] || '').trim();
const clearForm = (p, keep = []) => Object.keys(vals).forEach((k) => { if (k.startsWith(p + '-') && !keep.includes(k)) delete vals[k]; });

function addManual() {
  const cat = g('m', 'cat') || CATEGORIES[0].id, s = suggest(cat);
  if (!g('m', 'name_en')) return say('Enter the English name.');
  if (g('m', 'price') === '' || !(Number(g('m', 'price')) >= 0)) return say('Enter a price.');
  const id = g('m', 'id') || s.id, code = g('m', 'code') || s.code;
  if (all().some((p) => p.id === id)) return say('That ID already exists.');
  if (all().some((p) => String(p.code) === code)) return say('That QR / barcode is already used.');
  db.drafts.push({
    id, cat, code, price: Number(g('m', 'price')),
    name: { en: g('m', 'name_en'), am: g('m', 'name_am') },
    image: g('m', 'image'), emoji: g('m', 'emoji') || '📘',
    summary: { en: g('m', 'summary_en'), am: g('m', 'summary_am') },
    voiceNoteUrl: g('m', 'audio'), manualPdfUrl: g('m', 'pdf'),
  });
  save(); clearForm('m', ['m-cat']); say('Added to the draft list.');
}
function addAd() {
  if (!g('a', 'title_en')) return say('Enter the English title.');
  let n = ads().length + 1, id; do { id = 'promo' + n++; } while (ads().some((a) => a.id === id));
  const ad = {
    id, tag: g('a', 'tag') || 'featured', active: true, image: g('a', 'image'),
    title: { en: g('a', 'title_en'), am: g('a', 'title_am') }, text: { en: g('a', 'text_en'), am: g('a', 'text_am') },
    product: g('a', 'product'), link: g('a', 'link'),
  };
  if (g('a', 'until')) ad.until = g('a', 'until');
  db.ads.push(ad); save(); clearForm('a'); say('Ad added and switched on.');
}
const confirmAsk = (m, ok) => (tg?.showConfirm ? tg.showConfirm(m, (y) => y && ok()) : confirm(m) && ok());

const A = {
  close: () => { root.hidden = true; },
  tab: (d) => { db.tab = d.t; save(); render(); },
  addm: addManual, addad: addAd,
  rmd: (d) => { db.drafts.splice(+d.i, 1); save(); render(); },
  rma: (d) => { db.ads = db.ads.filter((a) => a.id !== d.id); delete db.toggles[d.id]; save(); render(); },
  tog: (d) => { db.toggles[d.id] = !ads().find((a) => a.id === d.id).active; save(); render(); },
  clr: () => confirmAsk('Clear all draft manuals?', () => { db.drafts = []; save(); render(); }),
  copy: async (d) => {
    const text = { entries: () => entries(db.drafts), products: () => productsFile(all()), promos: () => promosFile(ads()) }[d.w]();
    say((await copyText(text)) ? 'Copied. Now paste it into GitHub or VS Code.' : 'Copy failed. Select the text box and copy it manually.');
  },
};

function bind(el) {
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-a]');
    if (b) A[b.dataset.a]?.(b.dataset);
  });
  const onField = (ev) => { const t = ev.target; if (t.id && /^[ma]-/.test(t.id)) vals[t.id] = t.value; };
  el.addEventListener('input', onField);
  el.addEventListener('change', (ev) => { onField(ev); if (ev.target.id === 'm-cat') render(); });
}

export function openAdmin() {
  if (!$('#adm-css')) {
    const l = document.createElement('link');
    l.id = 'adm-css'; l.rel = 'stylesheet'; l.href = new URL('../css/admin.css', import.meta.url).href;
    document.head.appendChild(l);
  }
  if (!root) { root = document.createElement('div'); root.id = 'admin'; document.body.appendChild(root); bind(root); }
  root.hidden = false;
  render();
}
