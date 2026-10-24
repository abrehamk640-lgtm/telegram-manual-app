import { LOCALES } from '../locales/index.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { PROMOS } from '../data/promos.js';
import { PAYMENTS, CONFIG, ADMIN_IDS, ADMIN_PASSWORD, ADMIN_PASSWORD_HASH } from '../data/config.js';

const tg = window.Telegram?.WebApp;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get() { try { return JSON.parse(localStorage.getItem('mh') || '{}'); } catch { return {}; } },
  set(v) { try { localStorage.setItem('mh', JSON.stringify(v)); } catch {} },
};

/* ---------- State ---------- */
const saved = store.get();
const tgUser = tg?.initDataUnsafe?.user || {};
const canAdmin = () => !ADMIN_IDS.length || ADMIN_IDS.includes(tgUser.id);
const isAdmin = () => ADMIN_IDS.length > 0 && ADMIN_IDS.includes(tgUser.id);
const MANUAL_LANGS = ['am', 'en'].filter((k) => LOCALES[k]); // languages a manual can be bought in
const startLang = LOCALES[saved.lang] ? saved.lang : LOCALES[tgUser.language_code] ? tgUser.language_code : 'am';
const dfltManualLang = MANUAL_LANGS.includes(startLang) ? startLang : MANUAL_LANGS[0];
// cart: { [manualId]: { q: 1, lang: 'am' | 'en' } }  (older saved carts were { id: 1 } - upgraded here)
const normCart = (c) => Object.fromEntries(Object.entries(c || {}).map(([id, v]) => [id, { q: 1, lang: MANUAL_LANGS.includes(v?.lang) ? v.lang : dfltManualLang }]));
const lsGet = (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch {} };
const regName = lsGet('userName'), regPhone = lsGet('userPhone'); // saved by the registration popup
const state = {
  screen: CONFIG.SHOW_WELCOME ? 'welcome' : 'shop',
  cat: '', q: '', letter: '', sheet: null, view: null, vtab: 'summary', vlang: dfltManualLang, buy: null, zoom: '',
  pay: PAYMENTS[0].id, phone: saved.phone || regPhone || '', name: saved.name || regName || tgUser.first_name || '', pickup: 0, reg: null,
  orderId: '', err: '', busy: false, wait: null, done: null, pw: null,
  lang: startLang,
  theme: saved.theme || tg?.colorScheme || 'light',
  cart: normCart(saved.cart),
};
const persist = () => store.set({ lang: state.lang, theme: state.theme, cart: state.cart, phone: state.phone, name: state.name });
const set = (patch) => {
  const nav = patch.screen && patch.screen !== state.screen;
  Object.assign(state, patch); persist(); render();
  if (nav) window.scrollTo(0, 0);
};

/* ---------- Helpers ---------- */
const t = (k, v = {}) => {
  let s = LOCALES[state.lang].dict[k] ?? LOCALES.en.dict[k] ?? k;
  for (const x in v) s = s.replace(`{${x}}`, v[x]);
  return s;
};
const tr = (o = {}) => o[state.lang] || o.en || '';
const money = (n) => `${t('cur')}${Number(n).toLocaleString('en-US')}`;
const prod = (id) => PRODUCTS.find((p) => p.id === id);
const catOf = (p) => CATEGORIES.find((c) => c.id === p.cat) || { name: {} };
const cartItems = () => Object.entries(state.cart).map(([id, c]) => ({ p: prod(id), q: 1, lang: c.lang })).filter((x) => x.p);
const count = () => cartItems().reduce((a, x) => a + x.q, 0);
const subtotal = () => cartItems().reduce((a, x) => a + x.q * x.p.price, 0);
const deliveryFee = () => (count() ? CONFIG.DELIVERY_FEE || 0 : 0);
const grand = () => subtotal() + deliveryFee();
const method = () => PAYMENTS.find((x) => x.id === state.pay) || PAYMENTS[0];
const media = (p) => (p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '') + (p.image ? '' : esc(p.emoji || '📘'));
const activePromos = () => PROMOS.filter((x) => x.active !== false && (!x.until || new Date(x.until + 'T23:59:59') >= new Date()));
const mlName = (k) => LOCALES[k]?.label || k;
const mlShort = (k) => LOCALES[k]?.short || k;
const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
// a field can be a plain value or { en, am }: pick the reader's language, fall back to another one
const pick = (v, l) => (isMap(v) ? v[l] || v.en || v.am || '' : v || '');
const lacks = (v, l) => isMap(v) && !v[l] && Object.values(v).some(Boolean);
const anyVal = (v) => (isMap(v) ? Object.values(v).some(Boolean) : Array.isArray(v) ? v.length > 0 : !!v);
const imgsOf = (p, l) => {
  const raw = Array.isArray(p.images) ? p.images : (isMap(p.images) && (p.images[l] || p.images.en || p.images.am)) || [];
  return raw.map((x) => (typeof x === 'string' ? { src: x, cap: '' } : { src: x.src, cap: tr(x.caption) })).filter((x) => x.src);
};
// tiny formatter for fullText / summary: "# heading", "- bullet", "1. step", blank line = new paragraph
function rich(srcText) {
  let out = '', list = '';
  const close = () => { if (list) { out += `</${list}>`; list = ''; } };
  for (const raw of String(srcText || '').replace(/\r/g, '').split('\n')) {
    const ln = raw.trim(); let m;
    if (!ln) close();
    else if ((m = ln.match(/^#{1,3}\s+(.*)$/))) { close(); out += `<h4>${esc(m[1])}</h4>`; }
    else if ((m = ln.match(/^[-•*]\s+(.*)$/))) { if (list !== 'ul') { close(); out += '<ul>'; list = 'ul'; } out += `<li>${esc(m[1])}</li>`; }
    else if ((m = ln.match(/^\d+[.)]\s+(.*)$/))) { if (list !== 'ol') { close(); out += '<ol>'; list = 'ol'; } out += `<li>${esc(m[1])}</li>`; }
    else { close(); out += `<p>${esc(ln)}</p>`; }
  }
  close(); return out;
}
const hap = () => tg?.HapticFeedback?.impactOccurred('light');
const openLink = (u) => (tg?.openLink ? tg.openLink(u) : window.open(u, '_blank'));
const normPhone = (s) => {
  let d = String(s).replace(/\D/g, '');
  if (d.startsWith('251')) d = d.slice(3); else if (d.startsWith('0')) d = d.slice(1);
  return /^9\d{8}$/.test(d) ? '251' + d : '';
};
let tt;
function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2400); }
const ui = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const UI = {
  scan: ui('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10"/>'),
  cart: ui('<path d="M6 8h12l-1 12H7L6 8zM9 8a3 3 0 0 1 6 0"/>'),
  sun: ui('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
  moon: ui('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
};
const ICONS = {
  telebirr: '<svg viewBox="0 0 32 32" fill="none" stroke="#1F5FBF" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="4" width="14" height="24" rx="3"/><path d="M14 24h4M5 11c-2 3-2 7 0 10M27 11c2 3 2 7 0 10"/></svg>',
  bank: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12L16 5l12 7zM7 14v9M13 14v9M19 14v9M25 14v9M4 27h24"/></svg>',
};

/* ---------- Views ---------- */
const langSwitch = () => `<div class="seg" role="group" aria-label="${t('langSwitch')}">${Object.entries(LOCALES).map(([k, v]) => `<button class="${k === state.lang ? 'on' : ''}" data-act="setlang" data-k="${k}" aria-pressed="${k === state.lang}">${v.short}</button>`).join('')}</div>`;
const themeBtn = () => `<button class="rnd" data-act="theme" aria-label="${state.theme === 'dark' ? t('themeToLight') : t('themeToDark')}">${state.theme === 'dark' ? UI.sun : UI.moon}</button>`;

const welcome = () => `
  <section class="welcome">
    <div class="banner"><img src="img/hero-banner.jpg" alt="" onerror="this.remove()"><div class="wtools">${langSwitch()}${themeBtn()}</div></div>
    <div class="wcard">
      <div class="wchips">${CATEGORIES.map((c) => `<span>${c.svg || esc(c.icon)}</span>`).join('')}</div>
      <h1 data-act="logo">${t('heroTitle')}</h1>
      <p>${t('welcomeText')}</p>
      <button class="cta" data-act="start">${t('start')}</button>
    </div>
  </section>`;

const topbar = () => {
  const ini = ((tgUser.first_name || state.name || 'M')[0] || 'M').toUpperCase();
  return `<header class="app">
    <span class="brand" data-act="logo">${esc(t('appName'))}</span>
    <div class="hr">
      ${langSwitch()}${themeBtn()}
      <button class="rnd" data-act="scan" aria-label="${t('scan')}">${UI.scan}</button>
      <button class="rnd" data-act="cart" aria-label="${t('yourOrder')}">${UI.cart}<i class="badge" id="badge" hidden></i></button>
      <button class="avatar" data-act="settings" aria-label="${t('settings')}">${tgUser.photo_url ? `<img src="${esc(tgUser.photo_url)}" alt="" onerror="this.remove()">` : ''}${esc(ini)}</button>
    </div></header>`;
};

const pagehead = (title) => `<div class="pagehead"><button class="back" data-act="back" aria-label="${t('back')}">←</button><h1>${title}</h1></div>`;

const filtered = () => {
  const q = state.q.trim().toLowerCase();
  return PRODUCTS.filter((p) => (!state.cat || p.cat === state.cat)
    && (!state.letter || p.name.en[0].toUpperCase() === state.letter)
    && (!q || [p.name.en, p.name.am, p.code].some((s) => String(s).toLowerCase().includes(q))))
    .sort((a, b) => a.name.en.localeCompare(b.name.en));
};
const listHTML = () => {
  const l = filtered();
  if (!l.length) return `<p class="empty">${t('noResults')}</p>`;
  return l.map((p) => {
    const n = state.cart[p.id];
    const badges = `${anyVal(p.fullText) ? '📖' : ''}${anyVal(p.voiceNoteUrl) ? '🎧' : ''}${anyVal(p.images) || anyVal(p.manualPdfUrl) ? '📄' : ''}`;
    return `<article class="pcard" role="button" tabindex="0" data-act="open" data-id="${p.id}">
      <div class="pimg">${media(p)}${badges ? `<span class="pbadge">${badges}</span>` : ''}</div>
      <div class="pbody"><h3>${esc(tr(p.name))}</h3><div class="price">${money(p.price)}</div>
        <button class="pbtn${n ? ' on' : ''}" data-act="buy" data-id="${p.id}">${n ? t('inCartLang', { l: mlShort(n.lang) }) : t('buy')}</button>
      </div></article>`;
  }).join('');
};
const promoCard = (x) => `<button class="promo${x.image ? ' img' : ''}" data-act="promo" data-id="${esc(x.id)}">
    ${x.image ? `<img src="${esc(x.image)}" alt="" onerror="this.remove()">` : ''}
    <span class="tag">${x.tag === 'sponsored' ? t('sponsored') : t('featuredPromo')}</span>
    <b class="pt">${esc(tr(x.title))}</b><span class="pt pd">${esc(tr(x.text))}</span></button>`;

const shop = () => `
  ${activePromos().length ? `<div class="promos">${activePromos().map(promoCard).join('')}</div>` : ''}
  <div class="chips" id="chips">${[{ id: '', name: { en: t('all') } }, ...CATEGORIES].map((c) => `<button class="chip${state.cat === c.id ? ' on' : ''}" data-act="chip" data-id="${c.id}">${c.svg ? `<span class="ci">${c.svg}</span>` : ''}${esc(tr(c.name))}</button>`).join('')}</div>
  <div class="search"><input id="q" type="search" inputmode="search" placeholder="${t('search')}" value="${esc(state.q)}" aria-label="${t('search')}"></div>
  <div class="alpha">${['', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((l) => `<button class="${state.letter === l ? 'on' : ''}" data-act="letter" data-l="${l}">${l || t('all')}</button>`).join('')}</div>
  <div class="pgrid" id="list">${listHTML()}</div>`;

const order = () => {
  const it = cartItems();
  return pagehead(t('yourOrder')) + (it.length ? `
    <div class="box">${it.map(({ p, q, lang }) => `<div class="oline"><div class="oth">${media(p)}</div>
      <div class="oi"><b>${esc(tr(p.name))}</b><span>${money(p.price)}</span><div><button class="lchip" data-act="buy" data-id="${p.id}" aria-label="${t('manualLang')}">🌐 ${esc(mlName(lang))} ▾</button></div></div>
      <button class="trash" data-act="rm" data-id="${p.id}" aria-label="${t('remove')}">🗑</button></div>`).join('')}</div>
    <div class="box rows"><div><span>${t('subtotal', { n: count() })}</span><span>${money(subtotal())}</span></div>
      <div class="mut"><span>${t('shipping')}</span><span>${t('shippingNext')}</span></div><hr>
      <div class="big"><span>${t('total')}</span><span>${money(subtotal())}</span></div></div>` : `<p class="empty">${t('cartEmpty')}</p>`);
};

const summary = () => {
  const locs = CONFIG.PICKUP_LOCATIONS, loc = locs[state.pickup] || locs[0];
  return pagehead(t('orderSummary')) + `<div class="box">
    ${locs.length ? `<h2>${t('pickupLocation')}</h2>${locs.length > 1
      ? locs.map((l, i) => `<label class="loc${i === state.pickup ? ' on' : ''}"><input type="radio" name="pickup" value="${i}"${i === state.pickup ? ' checked' : ''}><span><b>${esc(tr(l.name))}</b><br><small>${esc(tr(l.address))}</small></span></label>`).join('')
      : `<h3 style="margin:4px 0">${esc(tr(loc.name))}</h3><small>${esc(tr(loc.address))}</small>`}<hr style="border:0;border-top:1px solid var(--line);margin:16px 0">` : ''}
    <h2>${t('itemsOrdered')}</h2>
    ${cartItems().map(({ p, q, lang }) => `<div class="li"><span>${esc(tr(p.name))}<small>${t('manualLang')}: ${esc(mlName(lang))}</small></span><b>${money(p.price * q)}</b></div>`).join('')}
    <div class="rows"><hr><div class="mut"><span>${t('subtotal', { n: count() })}</span><span>${money(subtotal())}</span></div>
      ${deliveryFee() ? `<div class="mut"><span>${t('deliveryFee')}</span><span>${money(deliveryFee())}</span></div>` : ''}<hr>
      <div class="big"><span>${t('finalTotal')}</span><span>${money(grand())}</span></div></div></div>
    ${locs.length ? `<div class="note">${t('deliveryNote')}</div>` : ''}`;
};

const pay = () => {
  const m = method(), label = tr(m.label);
  const ref = state.orderId;
  return pagehead(t('paymentOptions')) + `<div class="box">
    <div class="cap">${t('chooseGateway')}</div>
    <div class="gw">${PAYMENTS.map((x) => `<button class="gwc${x.id === state.pay ? ' on' : ''}" data-act="gw" data-id="${x.id}">${ICONS[x.id] || esc(x.icon || '💳')}<span>${esc(tr(x.label))}</span></button>`).join('')}</div>
    ${m.mode === 'direct' ? `<h3>${t('yourPhone')}</h3><input id="ph" class="fld" type="tel" inputmode="tel" placeholder="09XXXXXXXX" value="${esc(state.phone)}" autocomplete="tel"><p class="hint">${t('phonePrompt')}</p>`
      : `<h3>${t('howToPay', { m: esc(label) })}</h3>
        <ol class="steps"><li>${t('manualStep1', { amt: money(grand()) })}</li><li>${t('manualStep2', { ref: esc(ref) })}</li><li>${t('manualStep3')}</li></ol>
        ${m.account ? `<div class="acct"><div><span><small>${t('bankName')}</small>${esc(m.account.name)}</span></div>
          <div><span><small>${t('accountNo')}</small><b>${esc(m.account.number)}</b></span><button class="copy" data-act="copy" data-v="${esc(m.account.number)}">${t('copy')}</button></div>
          <div><span><small>${t('accountHolder')}</small>${esc(m.account.holder)}</span></div>
          <div><span><small>${t('orderNo')}</small><b>${esc(ref)}</b></span><button class="copy" data-act="copy" data-v="${esc(ref)}">${t('copy')}</button></div></div>` : ''}`}
    <h3>${t('yourName')}</h3><input id="nm" class="fld" value="${esc(state.name)}" autocomplete="name">
  </div>${state.err ? `<p class="err" role="alert">${esc(state.err)}</p>` : ''}`;
};

const done = () => { const d = state.done || {}; return `<div class="doneb"><div class="check">✓</div><h1>${t('thankYou')}</h1>
  <p>${d.paid ? t('paidText') : t('pendingText')}</p>
  <div class="box rows"><div><span>${t('orderNo')}</span><b>${esc(d.ref)}</b></div><div><span>${t('total')}</span><b>${money(d.total || 0)}</b></div></div></div>`; };

const barHTML = () => {
  const m = method();
  switch (state.screen) {
    case 'shop': return count() ? `<button class="cta" data-act="toOrder">${t('checkout')} · ${money(subtotal())}</button>` : '';
    case 'order': return count() ? `<button class="cta" data-act="toSummary">${t('continue')} · ${money(grand())}</button>` : '';
    case 'summary': return `<button class="cta" data-act="toPay">${t('toPayment')}</button>`;
    case 'pay': return `<button class="cta" data-act="pay"${state.busy ? ' disabled' : ''}>${state.busy ? t('processing') : m.mode === 'direct' ? t('payWith', { m: tr(m.label) }) : t('placeOrder')}</button>`;
    case 'done': return `<button class="cta" data-act="home">${t('backToShop')}</button>`;
    default: return '';
  }
};

const head = (title) => `<div class="sh-h"><h2>${title}</h2><button class="ib" data-act="close" aria-label="✕">✕</button></div>`;
const TABS = [['read', '📖', 'tabRead'], ['summary', '📝', 'tabSummary'], ['audio', '🎧', 'tabAudio'], ['media', '🖼', 'tabMedia']];
const hasTab = (p, L) => ({
  read: !!pick(p.fullText, L), summary: !!pick(p.summary, L), audio: !!pick(p.voiceNoteUrl, L),
  media: imgsOf(p, L).length > 0 || !!pick(p.manualPdfUrl, L),
});
const note = (v, L) => (lacks(v, L) ? `<p class="hint">${t('fallbackNote', { l: esc(mlName(L)) })}</p>` : '');
const panel = (p, L, tab) => {
  switch (tab) {
    case 'read': return note(p.fullText, L) + `<div class="doc">${rich(pick(p.fullText, L))}</div>`;
    case 'summary': return note(p.summary, L) + `<div class="doc">${rich(pick(p.summary, L))}</div>`;
    case 'audio': return note(p.voiceNoteUrl, L) + `<h3>${t('voiceGuide')}</h3><audio controls preload="none" src="${esc(pick(p.voiceNoteUrl, L))}"></audio>`;
    case 'media': {
      const imgs = imgsOf(p, L), pdfUrl = pick(p.manualPdfUrl, L);
      return note(p.images, L) + note(p.manualPdfUrl, L)
        + (imgs.length ? `<h3>${t('imagesTitle')}</h3><div class="gal">${imgs.map((x) => `<figure><img src="${esc(x.src)}" alt="${esc(x.cap)}" loading="lazy" data-act="zoom" data-src="${esc(x.src)}" onerror="this.closest('figure').remove()">${x.cap ? `<figcaption>${esc(x.cap)}</figcaption>` : ''}</figure>`).join('')}</div>` : '')
        + (pdfUrl ? `<button class="btn ghost big" data-act="pdf" data-id="${p.id}" data-l="${L}">📄 ${t('openPdf')}</button>` : '');
    }
    default: return `<p class="empty">${t('noContent')}</p>`;
  }
};
const vfooter = (p) => { const c = state.cart[p.id]; return `<div class="vft"><div><b class="vprice">${money(p.price)}</b>${c ? `<small>${t('manualLang')}: ${esc(mlName(c.lang))}</small>` : ''}</div>
    <button class="btn${c ? ' on' : ''}" data-act="buy" data-id="${p.id}">${c ? t('inCartLang', { l: mlShort(c.lang) }) : t('buy')}</button></div>`; };
const sheetManual = () => {
  const p = prod(state.view); if (!p) return '';
  const L = state.vlang, has = hasTab(p, L);
  const tabs = TABS.filter(([id]) => has[id]);
  const tab = tabs.some(([id]) => id === state.vtab) ? state.vtab : tabs[0]?.[0] || '';
  return `<div class="sheet vs">
    <div class="vhd"><div class="vth">${media(p)}</div>
      <div class="vtt"><h2>${esc(tr(p.name))}</h2><small>${esc(tr(catOf(p).name))} · ${t('code')}: ${esc(p.code)}</small></div>
      <button class="ib" data-act="close" aria-label="✕">✕</button></div>
    ${tabs.length ? `<div class="tabs" role="tablist">${tabs.map(([id, ic, k]) => `<button class="tab${id === tab ? ' on' : ''}" role="tab" aria-selected="${id === tab}" data-act="vtab" data-k="${id}">${ic} ${t(k)}</button>`).join('')}</div>` : ''}
    <div class="vbody">
      ${MANUAL_LANGS.length > 1 ? `<div class="vlr"><small>${t('contentLang')}</small><div class="seg">${MANUAL_LANGS.map((k) => `<button class="${k === L ? 'on' : ''}" data-act="vlang" data-k="${k}">${mlShort(k)}</button>`).join('')}</div></div>` : ''}
      ${panel(p, L, tab)}
    </div>
    ${vfooter(p)}</div>`;
};
const sheetSettings = () => `<div class="sheet">${head(t('profile'))}
  <div class="prof"><span class="pav">${esc(((tgUser.first_name || state.name || 'M')[0] || 'M').toUpperCase())}</span>
    <div><b>${esc(state.name || tgUser.first_name || '—')}</b>${tgUser.username ? `<small> @${esc(tgUser.username)}</small>` : ''}</div></div>
  ${state.phone ? `<small>${esc(state.phone)}</small>` : ''}
  <button class="btn ghost big" data-act="regedit">${t('editDetails')}</button>
  ${isAdmin() ? `<button class="btn ghost big" data-act="admin">⚙️ ${t('admin')}</button>` : ''}</div>`;
const pwBox = () => `<div class="scrim" data-act="pwcancel"></div><div class="waitbox"><div class="waitc">
  <h2>🔒 ${t('adminTitle')}</h2><p>${t('adminPrompt')}</p>
  <input id="pw" class="fld" type="password" autocomplete="off" autocapitalize="off" aria-label="${t('adminPrompt')}">
  ${state.pw.err ? `<p class="err" role="alert">${esc(state.pw.err)}</p>` : ''}
  <button class="btn big" data-act="pwsubmit">${t('unlock')}</button><button class="btn ghost big" data-act="pwcancel">${t('cancel')}</button></div></div>`;
const waitBox = () => `<div class="scrim"></div><div class="waitbox"><div class="waitc"><div class="spin"></div><h2>${t('waitTitle')}</h2>
  <p>${t('waitText', { amt: money(state.wait.amt) })}</p><button class="btn ghost big" data-act="cancelwait">${t('cancel')}</button></div></div>`;

/* ---------- Overlays (own container, so the page and any playing audio are not redrawn) ---------- */
const regHTML = () => { const r = state.reg; return `<div class="scrim hi"></div>
  <div class="lmodal regm" role="dialog" aria-modal="true" aria-labelledby="regt"><div class="lmc regc">
    ${langSwitch()}
    <h2 id="regt">${t('regTitle')}</h2><p class="rs">${t('regText')}</p>
    <label for="reg-name">${t('regName')}</label><input id="reg-name" class="fld" autocomplete="name" maxlength="60" value="${esc(r.nm)}">
    <label for="reg-phone">${t('regPhone')}</label><input id="reg-phone" class="fld" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="0911223344" value="${esc(r.ph)}">
    <p id="reg-err" class="err" role="alert"></p>
    <button class="btn big" data-act="regsave">${t('regSave')}</button>
    ${r.edit ? `<button class="lx" data-act="regcancel">${t('cancel')}</button>` : `<small class="priv">${t('regPrivacy')}</small>`}
  </div></div>`; };
const modalHTML = () => {
  if (state.reg) return regHTML();
  if (state.zoom) return `<div class="zoom" data-act="unzoom" role="dialog" aria-modal="true"><img src="${esc(state.zoom)}" alt=""></div>`;
  const p = state.buy && prod(state.buy); if (!p) return '';
  const cur = state.cart[p.id]?.lang;
  return `<div class="scrim hi" data-act="closebuy"></div>
    <div class="lmodal" role="dialog" aria-modal="true" aria-labelledby="lmt"><div class="lmc">
      <h2 id="lmt">${esc(LOCALES.en.dict.manualLangTitle)} / ${esc(LOCALES.am.dict.manualLangTitle)}</h2>
      <p class="lmn">${esc(tr(p.name))}</p>
      <div class="lopts">${MANUAL_LANGS.map((k) => `<button class="lopt${cur === k ? ' on' : ''}" data-act="pickml" data-k="${k}">${esc(mlName(k))}</button>`).join('')}</div>
      ${cur ? `<button class="lrm" data-act="rmcart">${t('removeFromCart')}</button>` : ''}
      <button class="lx" data-act="closebuy">${t('cancel')}</button>
    </div></div>`;
};
function renderModal() { const m = $('#modal'); if (m) m.innerHTML = modalHTML(); syncTelegram(); if (state.reg) { const i = $(state.reg.nm ? '#reg-phone' : '#reg-name'); i?.focus(); } }
function swap(sel, html) { // replace one element in place (keeps the rest of the drawer, e.g. the audio player, untouched)
  const el = document.querySelector(sel); if (!el || !html) return;
  const box = document.createElement('div'); box.innerHTML = html;
  const next = box.firstElementChild; if (next.classList.contains('sheet')) next.style.animation = 'none';
  el.replaceWith(next);
}
const renderDrawer = () => swap('.sheet.vs', sheetManual());
const refreshFooter = () => { const p = prod(state.view); if (p) swap('.vft', vfooter(p)); };

/* ---------- Render ---------- */
function updateCart() {
  const n = count(), b = $('#badge'), p = $('#pilltxt'), bar = $('#bar');
  if (b) { b.textContent = n; b.hidden = !n; }
  if (p) p.textContent = money(subtotal());
  if (bar) { bar.innerHTML = barHTML(); document.querySelector('main')?.classList.toggle('hasbar', !!bar.innerHTML); }
}
const BACK = { order: 'shop', summary: 'order', pay: 'summary', done: 'shop' };
function syncTelegram() {
  if (!tg) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); } catch {}
  (state.zoom || state.buy || state.sheet || state.wait || state.pw || BACK[state.screen]) ? tg.BackButton.show() : tg.BackButton.hide();
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = state.lang;
  const pages = { shop, order, summary, pay, done };
  const body = state.screen === 'welcome' ? welcome() : `${topbar()}<main>${pages[state.screen]()}</main><div id="bar" class="bar"></div>`;
  const sheet = { manual: sheetManual, settings: sheetSettings }[state.sheet];
  $('#app').innerHTML = body + (sheet ? `<div class="scrim" data-act="close"></div>${sheet()}` : '') + (state.wait ? waitBox() : '') + (state.pw ? pwBox() : '');
  updateCart(); syncTelegram();
  if (state.pw) $('#pw')?.focus();
}

/* ---------- Payments (talks to your n8n webhook) ---------- */
// Returns the JSON reply, null if no WEBHOOK_URL is set, undefined on a network/server error.
async function api(payload) {
  if (!CONFIG.WEBHOOK_URL) {
    if (!CONFIG.DEMO_PAYMENTS) return null;
    await sleep(900);
    return { telebirr_charge: { status: 'pending', tx_ref: 'demo-' + payload.order_id }, telebirr_status: { status: 'success' } }[payload.action] || { status: 'received' };
  }
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(CONFIG.WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, init_data: tg?.initData || '' }), signal: ctl.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json().catch(() => ({}));
  } catch { return undefined; } finally { clearTimeout(to); }
}

function buildOrder(m, name, phone) {
  const loc = CONFIG.PICKUP_LOCATIONS[state.pickup] || CONFIG.PICKUP_LOCATIONS[0];
  return {
    event: 'order_created', order_id: state.orderId, created_at: new Date().toISOString(),
    user: { user_id: tgUser.id ?? null, first_name: name, username: tgUser.username || null, phone: phone || state.phone.trim(), language: state.lang },
    items: cartItems().map(({ p, q, lang }) => ({ id: p.id, code: p.code, name: p.name.en, name_am: p.name.am, manual_language: lang, manual_language_label: mlName(lang), qty: q, price: p.price, subtotal: p.price * q })),
    subtotal: subtotal(), delivery_fee: deliveryFee(), total: grand(), currency: CONFIG.CURRENCY,
    payment_method: m.label.en, payment_code: m.id,
    pickup: loc ? { id: loc.id, name: loc.name.en, address: loc.address.en } : null,
  };
}

function finish(paid, order) {
  state.cart = {};
  set({ done: { paid, ref: order.order_id, total: order.total }, wait: null, busy: false, screen: 'done', orderId: '', err: '' });
}

let pollId = 0;
async function poll(order, txRef) {
  const id = ++pollId;
  for (let i = 0; i < CONFIG.POLL_MAX; i++) {
    await sleep(CONFIG.POLL_SECONDS * 1000);
    if (id !== pollId) return;
    const r = await api({ action: 'telebirr_status', order_id: order.order_id, tx_ref: txRef });
    if (id !== pollId) return;
    if (r?.status === 'success') return finish(true, order);
    if (r?.status === 'failed') return set({ wait: null, err: r.message || t('payFailed') });
  }
  if (id === pollId) set({ wait: null, err: t('payTimeout') });
}

async function payNow() {
  if (state.busy) return;
  const m = method();
  const name = (state.name || tgUser.first_name || '').trim();
  if (name.length < 2) return set({ err: t('fillName') });
  let phone = '';
  if (m.mode === 'direct') {
    phone = normPhone(state.phone);
    if (!phone) return set({ err: t('badPhone') });
  }
  set({ busy: true, err: '' });
  const order = buildOrder(m, name, phone);
  if (m.mode === 'direct') {
    const r = await api({ action: 'telebirr_charge', ...order, payer_phone: phone });
    if (r == null) return set({ busy: false, err: r === null ? t('payNotReady') : t('netError') });
    if (r.status === 'success') return finish(true, order);
    if (r.status === 'failed') return set({ busy: false, err: r.message || t('payFailed') });
    set({ busy: false, wait: { amt: order.total } });
    poll(order, r.tx_ref || '');
  } else {
    const r = await api({ action: 'manual_order', ...order });
    if (r == null) return set({ busy: false, err: r === null ? t('payNotReady') : t('netError') });
    if (r.status === 'failed') return set({ busy: false, err: r.message || t('payFailed') });
    finish(false, order);
    if (CONFIG.USE_SEND_DATA && tg?.initData) { try { tg.sendData(JSON.stringify(order)); } catch {} }
  }
}

/* ---------- First-time registration ---------- */
// Ethiopian mobile in local form: 09XXXXXXXX or 07XXXXXXXX ('' if not valid). Accepts +251 / 251 / 0 / bare.
const localPhone = (s) => {
  let d = String(s).replace(/\D/g, '');
  if (d.startsWith('251')) d = d.slice(3); else if (d.startsWith('0')) d = d.slice(1);
  return /^[79]\d{8}$/.test(d) ? '0' + d : '';
};
const REG_PENDING = 'mh_reg_pending';
async function sendRegistration(payload) { // background; if it fails it is retried the next time the app opens
  const url = CONFIG.USER_REGISTER_WEBHOOK;
  if (!url) return;
  lsSet(REG_PENDING, JSON.stringify(payload));
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, init_data: tg?.initData || '' }), keepalive: true });
    if (r.ok) lsDel(REG_PENDING);
  } catch {}
}
function regSave() {
  const r = state.reg; if (!r) return;
  const name = (r.nm || '').trim().replace(/\s+/g, ' '), phone = localPhone(r.ph || '');
  const err = $('#reg-err');
  if (name.length < 2) { if (err) err.textContent = t('regBadName'); return $('#reg-name')?.focus(); }
  if (!phone) { if (err) err.textContent = t('regBadPhone'); return $('#reg-phone')?.focus(); }
  const date = new Date().toISOString();
  lsSet('userName', name); lsSet('userPhone', phone); lsSet('userRegisteredAt', date);
  state.name = name; state.phone = phone; state.reg = null; persist();
  renderModal(); render(); hap(); toast(t('regThanks', { n: name.split(' ')[0] }));
  sendRegistration({ name, phone, telegram_id: tgUser.id ?? null, register_date: date });
}

/* ---------- Actions ---------- */
const newOrderId = () => 'MH-' + Date.now().toString(36).toUpperCase();
const back = () => {
  if (state.reg) { if (state.reg.edit) { state.reg = null; renderModal(); } return; }
  if (state.zoom) { state.zoom = ''; return renderModal(); }
  if (state.buy) { state.buy = null; return renderModal(); }
  if (state.pw) return set({ pw: null });
  if (state.wait) return actions.cancelwait();
  if (state.sheet) return set({ sheet: null });
  if (BACK[state.screen]) set({ screen: BACK[state.screen], err: '' });
};
const openManual = (id) => set({ screen: 'shop', sheet: 'manual', view: id, vtab: 'summary', vlang: state.cart[id]?.lang || dfltManualLang });
function scan() {
  // Telegram's native camera scanner (WebApp.showScanQrPopup, Bot API 6.4+). It reads QR codes.
  const found = (txt) => {
    const s = String(txt || '').trim();
    const p = PRODUCTS.find((x) => String(x.code) === s) || PRODUCTS.find((x) => x.code && s.includes(String(x.code)));
    if (p) { openManual(p.id); return true; }
    toast(t('scanNotFound')); return true; // true = close the scanner either way
  };
  if (tg?.showScanQrPopup && (!tg.isVersionAtLeast || tg.isVersionAtLeast('6.4'))) {
    try { tg.showScanQrPopup({ text: String(t('scanHint')).slice(0, 64) }, found); return; } catch {}
  }
  if (tg?.initData) return toast(t('scanUnsupported')); // inside Telegram but too old
  const v = prompt(t('scanHint')); if (v) found(v);     // plain browser (testing only)
}
async function copy(v) {
  let ok = false;
  try { await navigator.clipboard.writeText(v); ok = true; } catch {
    const ta = document.createElement('textarea'); ta.value = v; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch {} ta.remove();
  }
  toast(ok ? t('copied') : v);
}
let taps = 0, tapT;
/* ---- Admin password gate (the admin code itself is only loaded after the password is accepted) ---- */
const LOCK_KEY = 'mh_lock';
let adminOK = false;
const lockInfo = () => { try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 }; } catch { return { fails: 0, until: 0 }; } };
const setLock = (v) => { try { localStorage.setItem(LOCK_KEY, JSON.stringify(v)); } catch {} };
const same = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
async function checkPassword(pw) {
  if (ADMIN_PASSWORD_HASH) { // format: pbkdf2$iterations$saltHex$hashHex  (made with tools/make-admin-password.html)
    const [alg, iter, salt, hash] = ADMIN_PASSWORD_HASH.split('$');
    if (alg !== 'pbkdf2' || !crypto?.subtle) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(salt), iterations: +iter }, key, 256);
    return same(hex(bits), hash);
  }
  return !!ADMIN_PASSWORD && same(pw, ADMIN_PASSWORD);
}
const loadAdmin = () => import('./admin.js').then((m) => m.openAdmin()).catch(() => toast('Admin panel failed to load'));
function openAdmin() {
  if (!canAdmin()) return;
  if (!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) return toast(t('adminNotSet'));
  if (adminOK) return loadAdmin();
  set({ pw: { err: '' }, sheet: null });
}
const refreshList = () => { const l = $('#list'); if (l) l.innerHTML = listHTML(); updateCart(); };

let pwBusy = false;
async function tryPassword() {
  const v = $('#pw')?.value || '', lk = lockInfo(), left = Math.ceil((lk.until - Date.now()) / 1000);
  if (left > 0) return set({ pw: { err: t('adminLocked', { s: left }) } });
  let ok = false; try { ok = await checkPassword(v); } catch { ok = false; }
  if (ok) { setLock({ fails: 0, until: 0 }); adminOK = true; set({ pw: null }); return loadAdmin(); }
  await sleep(700); // slow down guessing
  const fails = (lk.fails || 0) + 1, lock = fails >= 5;
  setLock({ fails: lock ? 0 : fails, until: lock ? Date.now() + 60000 : 0 });
  set({ pw: { err: lock ? t('adminLocked', { s: 60 }) : t('adminWrong') } });
}

const actions = {
  logo: () => { taps++; clearTimeout(tapT); tapT = setTimeout(() => (taps = 0), 1500); if (taps >= 5) { taps = 0; openAdmin(); } },
  admin: () => { set({ sheet: null }); openAdmin(); },
  start: () => set({ screen: 'shop' }),
  home: () => set({ screen: 'shop', done: null }),
  back,
  settings: () => set({ sheet: 'settings' }),
  setlang: (d) => { set({ lang: d.k }); if (state.reg) renderModal(); },
  regsave: () => regSave(),
  regcancel: () => { state.reg = null; renderModal(); },
  regedit: () => { state.sheet = null; state.reg = { nm: state.name, ph: state.phone, edit: true }; render(); renderModal(); },
  theme: () => set({ theme: state.theme === 'dark' ? 'light' : 'dark' }),
  chip: (d) => { state.cat = d.id; document.querySelectorAll('#chips .chip').forEach((b) => b.classList.toggle('on', b.dataset.id === d.id)); refreshList(); },
  letter: (d) => { state.letter = d.l; document.querySelectorAll('.alpha button').forEach((b) => b.classList.toggle('on', b.dataset.l === d.l)); refreshList(); },
  promo: (d) => { const x = PROMOS.find((y) => y.id === d.id); if (x?.product && prod(x.product)) openManual(x.product); else if (x?.link) openLink(x.link); },
  scan,
  open: (d) => openManual(d.id),
  // Buy -> small popup asking for the manual language -> the choice is saved on the cart item
  buy: (d) => { if (!prod(d.id)) return; state.buy = d.id; renderModal(); },
  closebuy: () => { state.buy = null; renderModal(); },
  pickml: (d) => {
    const id = state.buy; if (!id || !MANUAL_LANGS.includes(d.k)) return;
    const had = !!state.cart[id];
    state.cart[id] = { q: 1, lang: d.k }; state.buy = null; persist(); hap();
    toast(t(had ? 'langUpdated' : 'addedLang', { l: mlName(d.k) }));
    renderModal(); refreshList(); refreshFooter();
    if (state.screen !== 'shop') render(); // order / summary pages show the language tag
  },
  rmcart: () => {
    const id = state.buy; if (!id) return;
    delete state.cart[id]; state.buy = null; persist(); toast(t('removed'));
    renderModal(); refreshList(); refreshFooter();
    if (state.screen !== 'shop') render();
  },
  vtab: (d) => { state.vtab = d.k; renderDrawer(); },
  vlang: (d) => { state.vlang = d.k; renderDrawer(); },
  zoom: (d) => { state.zoom = d.src; renderModal(); },
  unzoom: () => { state.zoom = ''; renderModal(); },
  pdf: (d) => {
    const p = prod(d.id), url = pick(p.manualPdfUrl, d.l || state.vlang);
    if (tg?.downloadFile && tg.isVersionAtLeast?.('8.0')) tg.downloadFile({ url, file_name: `${p.code}-${d.l || state.vlang}.pdf` });
    else openLink(url);
  },
  cart: () => (count() ? set({ screen: 'order', sheet: null }) : toast(t('cartEmpty'))),
  toOrder: () => set({ screen: 'order' }),
  pwcancel: () => set({ pw: null }),
  pwsubmit: async () => {
    if (pwBusy) return;
    pwBusy = true;
    try { await tryPassword(); } finally { pwBusy = false; }
  },
  rm: (d) => { delete state.cart[d.id]; persist(); render(); },
  toSummary: () => set({ screen: 'summary', orderId: state.orderId || newOrderId() }),
  toPay: () => set({ screen: 'pay', err: '', orderId: state.orderId || newOrderId() }),
  gw: (d) => set({ pay: d.id, err: '' }),
  pay: payNow,
  copy: (d) => copy(d.v),
  cancelwait: () => { pollId++; set({ wait: null }); },
  close: () => set({ sheet: null }),
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (el) actions[el.dataset.act]?.(el.dataset);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  if (ev.target.matches?.('article[data-act]')) ev.target.click();
  if (ev.target.id === 'pw') actions.pwsubmit();
  if (ev.target.id === 'reg-name' || ev.target.id === 'reg-phone') regSave();
});
document.addEventListener('change', (ev) => {
  if (ev.target.name === 'pickup') set({ pickup: Number(ev.target.value) });
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.id === 'q') { state.q = el.value; refreshList(); }
  if (el.id === 'ph') { state.phone = el.value; persist(); }
  if (el.id === 'nm') { state.name = el.value; persist(); }
  if (state.reg && el.id === 'reg-name') state.reg.nm = el.value;
  if (state.reg && el.id === 'reg-phone') state.reg.ph = el.value;
});

tg?.ready(); tg?.expand();
if (!regName || !regPhone) state.reg = { nm: state.name, ph: state.phone, edit: false }; // first launch: ask who they are
else { const pend = lsGet(REG_PENDING); if (pend && CONFIG.USER_REGISTER_WEBHOOK) { try { sendRegistration(JSON.parse(pend)); } catch {} } }
tg?.BackButton.onClick(back);
tg?.onEvent('themeChanged', () => { if (!store.get().theme) { state.theme = tg.colorScheme; render(); } });
render();
if (state.reg) renderModal();
