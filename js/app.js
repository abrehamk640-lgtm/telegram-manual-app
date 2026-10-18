import { LOCALES } from '../locales/index.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { PROMOS } from '../data/promos.js';
import { PAYMENTS, CONFIG, ADMIN_IDS } from '../data/config.js';

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
const state = {
  screen: CONFIG.SHOW_WELCOME ? 'welcome' : 'shop',
  cat: '', q: '', letter: '', sheet: null, view: null,
  pay: PAYMENTS[0].id, phone: saved.phone || '', name: saved.name || tgUser.first_name || '', pickup: 0,
  orderId: '', err: '', busy: false, wait: null, done: null,
  lang: LOCALES[saved.lang] ? saved.lang : LOCALES[tgUser.language_code] ? tgUser.language_code : 'am',
  theme: saved.theme || tg?.colorScheme || 'light',
  cart: saved.cart || {},
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
const cartItems = () => Object.entries(state.cart).map(([id, q]) => ({ p: prod(id), q })).filter((x) => x.p);
const count = () => cartItems().reduce((a, x) => a + x.q, 0);
const subtotal = () => cartItems().reduce((a, x) => a + x.q * x.p.price, 0);
const deliveryFee = () => (count() ? CONFIG.DELIVERY_FEE || 0 : 0);
const grand = () => subtotal() + deliveryFee();
const method = () => PAYMENTS.find((x) => x.id === state.pay) || PAYMENTS[0];
const media = (p) => (p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '') + (p.image ? '' : esc(p.emoji || '📘'));
const activePromos = () => PROMOS.filter((x) => x.active !== false && (!x.until || new Date(x.until + 'T23:59:59') >= new Date()));
const hap = () => tg?.HapticFeedback?.impactOccurred('light');
const openLink = (u) => (tg?.openLink ? tg.openLink(u) : window.open(u, '_blank'));
const normPhone = (s) => {
  let d = String(s).replace(/\D/g, '');
  if (d.startsWith('251')) d = d.slice(3); else if (d.startsWith('0')) d = d.slice(1);
  return /^9\d{8}$/.test(d) ? '251' + d : '';
};
let tt;
function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2400); }
function bump(id, d) {
  const n = (state.cart[id] || 0) + d;
  if (n > 0) state.cart[id] = n; else delete state.cart[id];
  persist();
}
const ICONS = {
  telebirr: '<svg viewBox="0 0 32 32" fill="none" stroke="#1F5FBF" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="4" width="14" height="24" rx="3"/><path d="M14 24h4M5 11c-2 3-2 7 0 10M27 11c2 3 2 7 0 10"/></svg>',
  bank: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12L16 5l12 7zM7 14v9M13 14v9M19 14v9M25 14v9M4 27h24"/></svg>',
};

/* ---------- Views ---------- */
const welcome = () => `
  <section class="welcome">
    <div class="banner"><img src="img/hero-banner.jpg" alt="" onerror="this.remove()"></div>
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
      <button class="rnd" data-act="scan" aria-label="${t('scan')}">📷</button>
      <button class="cartpill" data-act="cart" aria-label="${t('yourOrder')}">🛍<span id="pilltxt"></span><i class="badge" id="badge" hidden></i></button>
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
    return `<article class="pcard" role="button" tabindex="0" data-act="open" data-id="${p.id}">
      <div class="pimg">${media(p)}${p.voiceNoteUrl || p.manualPdfUrl ? `<span class="pbadge">${p.voiceNoteUrl ? '🎧' : ''}${p.manualPdfUrl ? '📄' : ''}</span>` : ''}</div>
      <div class="pbody"><h3>${esc(tr(p.name))}</h3><div class="price">${money(p.price)}</div>
        ${n ? `<div class="qty"><button data-act="decl" data-id="${p.id}" aria-label="−">−</button><b>${n}</b><button data-act="add" data-id="${p.id}" aria-label="+">+</button></div>`
          : `<button class="pbtn" data-act="add" data-id="${p.id}">${t('add')}</button>`}
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
    <div class="box">${it.map(({ p, q }) => `<div class="oline"><div class="oth">${media(p)}</div>
      <div class="oi"><b>${esc(tr(p.name))}</b><span>${money(p.price)}</span></div>
      <div class="ostep"><div class="stepper"><button data-act="dec" data-id="${p.id}" aria-label="−">−</button><b>${q}</b><button data-act="inc" data-id="${p.id}" aria-label="+">+</button></div>
      <button class="trash" data-act="rm" data-id="${p.id}" aria-label="${t('remove')}">🗑</button></div></div>`).join('')}</div>
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
    ${cartItems().map(({ p, q }) => `<div class="li"><span><b>${q}×</b> ${esc(tr(p.name))}</span><b>${money(p.price * q)}</b></div>`).join('')}
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
    ${tgUser.first_name ? '' : `<h3>${t('yourName')}</h3><input id="nm" class="fld" value="${esc(state.name)}" autocomplete="given-name">`}
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
const sheetManual = () => {
  const p = prod(state.view); if (!p) return '';
  return `<div class="sheet">${head(esc(tr(p.name)))}
    <div class="vimg">${media(p)}</div>
    <div class="meta"><small>${esc(tr(catOf(p).name))}</small><small>${t('code')}: ${esc(p.code)}</small></div>
    <h3>${t('summary')}</h3><p class="vtext">${esc(tr(p.summary))}</p>
    ${p.voiceNoteUrl ? `<h3>${t('voiceGuide')}</h3><audio controls preload="none" src="${esc(p.voiceNoteUrl)}"></audio>` : ''}
    ${p.manualPdfUrl ? `<button class="btn ghost big" data-act="pdf" data-id="${p.id}">📄 ${t('downloadPdf')}</button>` : ''}
    <div class="buy" style="margin-top:14px"><b>${money(p.price)}</b><button class="btn" data-act="addv" data-id="${p.id}">${t('addToCart')}${state.cart[p.id] ? ` (${state.cart[p.id]})` : ''}</button></div></div>`;
};
const sheetSettings = () => `<div class="sheet">${head(t('settings'))}
  <h3>${t('language')}</h3><div class="langs">${Object.entries(LOCALES).map(([k, v]) => `<button class="${k === state.lang ? 'on' : ''}" data-act="setlang" data-k="${k}">${v.label}</button>`).join('')}</div>
  <div class="setrow"><span>${t('theme')}</span><button class="switch" data-act="theme" role="switch" aria-checked="${state.theme === 'dark'}" aria-label="${t('theme')}"><span>☀️</span><span>🌙</span><i></i></button></div>
  ${isAdmin() ? `<button class="btn ghost big" data-act="admin">⚙️ ${t('admin')}</button>` : ''}</div>`;
const waitBox = () => `<div class="scrim"></div><div class="waitbox"><div class="waitc"><div class="spin"></div><h2>${t('waitTitle')}</h2>
  <p>${t('waitText', { amt: money(state.wait.amt) })}</p><button class="btn ghost big" data-act="cancelwait">${t('cancel')}</button></div></div>`;

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
  (state.sheet || state.wait || BACK[state.screen]) ? tg.BackButton.show() : tg.BackButton.hide();
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = state.lang;
  const pages = { shop, order, summary, pay, done };
  const body = state.screen === 'welcome' ? welcome() : `${topbar()}<main>${pages[state.screen]()}</main><div id="bar" class="bar"></div>`;
  const sheet = { manual: sheetManual, settings: sheetSettings }[state.sheet];
  $('#app').innerHTML = body + (sheet ? `<div class="scrim" data-act="close"></div>${sheet()}` : '') + (state.wait ? waitBox() : '');
  updateCart(); syncTelegram();
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
    items: cartItems().map(({ p, q }) => ({ id: p.id, code: p.code, name: p.name.en, name_am: p.name.am, qty: q, price: p.price, subtotal: p.price * q })),
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
  const name = (tgUser.first_name || state.name || '').trim();
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

/* ---------- Actions ---------- */
const newOrderId = () => 'MH-' + Date.now().toString(36).toUpperCase();
const back = () => {
  if (state.wait) return actions.cancelwait();
  if (state.sheet) return set({ sheet: null });
  if (BACK[state.screen]) set({ screen: BACK[state.screen], err: '' });
};
function scan() {
  const found = (txt) => {
    const p = PRODUCTS.find((x) => x.code === String(txt).trim());
    p ? set({ screen: 'shop', sheet: 'manual', view: p.id }) : toast(t('scanNotFound'));
  };
  if (tg?.showScanQrPopup) tg.showScanQrPopup({ text: t('scanHint') }, (txt) => { found(txt); return true; });
  else { const v = prompt(t('scanHint')); if (v) found(v); }
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
function openAdmin() {
  if (!canAdmin()) return;
  import('./admin.js').then((m) => m.openAdmin()).catch(() => toast('Admin panel failed to load'));
}
const refreshList = () => { const l = $('#list'); if (l) l.innerHTML = listHTML(); updateCart(); };

const actions = {
  logo: () => { taps++; clearTimeout(tapT); tapT = setTimeout(() => (taps = 0), 1500); if (taps >= 5) { taps = 0; openAdmin(); } },
  admin: () => { set({ sheet: null }); openAdmin(); },
  start: () => set({ screen: 'shop' }),
  home: () => set({ screen: 'shop', done: null }),
  back,
  settings: () => set({ sheet: 'settings' }),
  setlang: (d) => set({ lang: d.k }),
  theme: () => set({ theme: state.theme === 'dark' ? 'light' : 'dark' }),
  chip: (d) => { state.cat = d.id; document.querySelectorAll('#chips .chip').forEach((b) => b.classList.toggle('on', b.dataset.id === d.id)); refreshList(); },
  letter: (d) => { state.letter = d.l; document.querySelectorAll('.alpha button').forEach((b) => b.classList.toggle('on', b.dataset.l === d.l)); refreshList(); },
  promo: (d) => { const x = PROMOS.find((y) => y.id === d.id); if (x?.product && prod(x.product)) set({ sheet: 'manual', view: x.product }); else if (x?.link) openLink(x.link); },
  scan,
  open: (d) => set({ sheet: 'manual', view: d.id }),
  add: (d) => { bump(d.id, 1); hap(); refreshList(); },
  decl: (d) => { bump(d.id, -1); refreshList(); },
  addv: (d) => { bump(d.id, 1); hap(); toast(t('added')); render(); },
  pdf: (d) => {
    const p = prod(d.id);
    if (tg?.downloadFile && tg.isVersionAtLeast?.('8.0')) tg.downloadFile({ url: p.manualPdfUrl, file_name: `${p.code}.pdf` });
    else openLink(p.manualPdfUrl);
  },
  cart: () => (count() ? set({ screen: 'order', sheet: null }) : toast(t('cartEmpty'))),
  toOrder: () => set({ screen: 'order' }),
  inc: (d) => { bump(d.id, 1); render(); },
  dec: (d) => { bump(d.id, -1); render(); },
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
document.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.matches?.('article[data-act]')) ev.target.click(); });
document.addEventListener('change', (ev) => {
  if (ev.target.name === 'pickup') set({ pickup: Number(ev.target.value) });
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.id === 'q') { state.q = el.value; refreshList(); }
  if (el.id === 'ph') { state.phone = el.value; persist(); }
  if (el.id === 'nm') { state.name = el.value; persist(); }
});

tg?.ready(); tg?.expand();
tg?.BackButton.onClick(back);
tg?.onEvent('themeChanged', () => { if (!store.get().theme) { state.theme = tg.colorScheme; render(); } });
render();
