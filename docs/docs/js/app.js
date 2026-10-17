import { LOCALES } from '../locales/index.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { PAYMENTS, CONFIG } from '../data/config.js';

const tg = window.Telegram?.WebApp;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get() { try { return JSON.parse(localStorage.getItem('mh') || '{}'); } catch { return {}; } },
  set(v) { try { localStorage.setItem('mh', JSON.stringify(v)); } catch {} },
};

/* ---------- State (single source of truth) ---------- */
const saved = store.get();
const tgLang = tg?.initDataUnsafe?.user?.language_code;
const state = {
  screen: 'welcome', cat: null, q: '', letter: '', sheet: null,
  pay: PAYMENTS[0].id, name: '', phone: '',
  lang: LOCALES[saved.lang] ? saved.lang : LOCALES[tgLang] ? tgLang : 'am',
  theme: saved.theme || tg?.colorScheme || 'light',
  cart: saved.cart || {},
};
const persist = () => store.set({ lang: state.lang, theme: state.theme, cart: state.cart });
const set = (patch) => { Object.assign(state, patch); persist(); render(); };

/* ---------- Helpers ---------- */
const t = (k, v = {}) => {
  let s = LOCALES[state.lang].dict[k] ?? LOCALES.en.dict[k] ?? k;
  for (const x in v) s = s.replace(`{${x}}`, v[x]);
  return s;
};
const tr = (o) => o[state.lang] || o.en;
const money = (n) => `${n.toLocaleString('en-US')} ${t('currency')}`;
const cartItems = () => Object.entries(state.cart).map(([id, q]) => ({ p: PRODUCTS.find((p) => p.id === id), q })).filter((x) => x.p);
const count = () => cartItems().reduce((a, x) => a + x.q, 0);
const total = () => cartItems().reduce((a, x) => a + x.q * x.p.price, 0);
const thumb = (p) => (/^(https?:|\/|\.|img\/)/.test(p.thumb) ? `<img src="${esc(p.thumb)}" alt="" loading="lazy">` : esc(p.thumb));
const hap = () => tg?.HapticFeedback?.impactOccurred('light');
let tt;
function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2400); }
function bump(id, d) {
  const n = (state.cart[id] || 0) + d;
  if (n > 0) state.cart[id] = n; else delete state.cart[id];
  persist();
}

/* ---------- Views ---------- */
const tools = (cart) => `
  <select class="ib" data-act="lang" aria-label="${t('language')}">${Object.entries(LOCALES).map(([k, v]) => `<option value="${k}"${k === state.lang ? ' selected' : ''}>${v.short}</option>`).join('')}</select>
  <button class="switch" data-act="theme" role="switch" aria-checked="${state.theme === 'dark'}" aria-label="${t('theme')}"><span>☀️</span><span>🌙</span><i></i></button>
  ${cart ? `<button class="ib" data-act="cart" aria-label="${t('cart')}">🛒<i class="badge" id="badge" hidden></i></button>` : ''}`;

const welcome = () => `
  <section class="welcome">
    <div class="tools">${tools(false)}</div>
    <div class="hero">
      <div class="chips">${CATEGORIES.map((c) => `<span>${c.icon}</span>`).join('')}</div>
      <h1>${t('appName')}</h1>
      <p>${t('welcomeText')}</p>
    </div>
    <button class="btn big" data-act="start">${t('start')}</button>
  </section>`;

const shell = (body) => `
  <header class="top">
    ${state.screen === 'category' ? `<button class="ib" data-act="back" aria-label="${t('back')}">‹</button>` : ''}
    <h1>${esc(state.screen === 'category' ? tr(CATEGORIES.find((c) => c.id === state.cat).name) : t('appName'))}</h1>
    ${tools(true)}
  </header>
  <main>${body}</main>`;

const home = () => `
  <h2 class="sec">${t('categories')}</h2>
  <div class="grid">${CATEGORIES.map((c) => `
    <button class="card cat" data-act="cat" data-id="${c.id}">
      <span class="ico">${c.icon}</span><b>${esc(tr(c.name))}</b>
      <small>${t('manualsCount', { n: PRODUCTS.filter((p) => p.cat === c.id).length })}</small>
    </button>`).join('')}</div>`;

const filtered = () => {
  const q = state.q.trim().toLowerCase();
  return PRODUCTS.filter((p) => p.cat === state.cat
    && (!state.letter || p.name.en[0].toUpperCase() === state.letter)
    && (!q || [p.name.en, p.name.am, p.code].some((s) => s.toLowerCase().includes(q))))
    .sort((a, b) => a.name.en.localeCompare(b.name.en));
};
const listHTML = () => {
  const l = filtered();
  if (!l.length) return `<p class="empty">${t('noResults')}</p>`;
  return l.map((p) => `
    <article class="card prod">
      <div class="thumb">${thumb(p)}</div>
      <div class="info">
        <h3>${esc(tr(p.name))}</h3>
        <small>${esc(tr(CATEGORIES.find((c) => c.id === p.cat).name))}</small>
        <p>${esc(tr(p.desc))}</p>
        <div class="buy"><b>${money(p.price)}</b>
          <button class="btn" data-act="add" data-id="${p.id}">${t('addToCart')}${state.cart[p.id] ? ` (${state.cart[p.id]})` : ''}</button>
        </div>
      </div>
    </article>`).join('');
};

const category = () => `
  <div class="search">
    <input id="q" type="search" inputmode="search" placeholder="${t('search')}" value="${esc(state.q)}" aria-label="${t('search')}">
    <button class="ib" data-act="scan" aria-label="${t('scan')}">📷</button>
  </div>
  <div class="alpha">${['', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((l) => `<button class="${state.letter === l ? 'on' : ''}" data-act="letter" data-l="${l}">${l || t('all')}</button>`).join('')}</div>
  <div id="list">${listHTML()}</div>`;

const head = (title) => `<div class="sh-h"><h2>${title}</h2><button class="ib" data-act="close" aria-label="✕">✕</button></div>`;

const sheetCart = () => {
  const it = cartItems();
  return `<div class="sheet">${head(t('cart'))}${it.length ? `
    ${it.map(({ p, q }) => `
      <div class="line"><div class="thumb s">${thumb(p)}</div>
        <div class="lt"><b>${esc(tr(p.name))}</b><small>${money(p.price)}</small></div>
        <div class="step"><button data-act="dec" data-id="${p.id}" aria-label="−">−</button><span>${q}</span><button data-act="inc" data-id="${p.id}" aria-label="+">+</button></div>
      </div>`).join('')}
    <div class="tot"><span>${t('total')}</span><b>${money(total())}</b></div>
    <button class="btn big" data-act="checkout">${t('checkout')}</button>` : `<p class="empty">${t('cartEmpty')}</p>`}</div>`;
};

const sheetCheckout = () => {
  const pm = PAYMENTS.find((x) => x.id === state.pay);
  return `<div class="sheet">${head(t('checkout'))}
    <h3>${t('orderSummary')}</h3>
    <div class="sum">${cartItems().map(({ p, q }) => `<div><span>${q}× ${esc(tr(p.name))}</span><span>${money(p.price * q)}</span></div>`).join('')}
      <div class="tot"><span>${t('total')}</span><b>${money(total())}</b></div></div>
    <h3>${t('payMethod')}</h3>
    <div class="pays">${PAYMENTS.map((x) => `<label class="pay${x.id === state.pay ? ' on' : ''}"><input type="radio" name="pay" value="${x.id}"${x.id === state.pay ? ' checked' : ''}><span>${x.icon}</span><b>${t('pay_' + x.id)}</b></label>`).join('')}</div>
    <p class="note">${pm.account ? t('payTo', { acc: esc(pm.account) }) : t('payCashNote')}</p>
    <input id="nm" placeholder="${t('fullName')}" value="${esc(state.name)}" autocomplete="name">
    <input id="ph" type="tel" placeholder="${t('phone')}" value="${esc(state.phone)}" autocomplete="tel">
    <button class="btn big" data-act="place">${t('placeOrder')}</button></div>`;
};

const sheetDone = () => `<div class="sheet"><div class="done">✅<h2>${t('orderPlaced')}</h2><p>${t('orderPlacedText')}</p></div><button class="btn big" data-act="close">${t('done')}</button></div>`;

/* ---------- Render ---------- */
function updateBadge() { const b = $('#badge'); if (b) { const n = count(); b.textContent = n; b.hidden = !n; } }
function syncTelegram() {
  if (!tg) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); } catch {}
  (state.sheet || state.screen === 'category') ? tg.BackButton.show() : tg.BackButton.hide();
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = state.lang;
  const body = state.screen === 'welcome' ? welcome() : shell(state.screen === 'home' ? home() : category());
  const sheet = { cart: sheetCart, checkout: sheetCheckout, done: sheetDone }[state.sheet];
  $('#app').innerHTML = body + (sheet ? `<div class="scrim" data-act="close"></div>${sheet()}` : '');
  updateBadge(); syncTelegram();
}

/* ---------- Actions ---------- */
const back = () => state.sheet === 'checkout' ? set({ sheet: 'cart' }) : state.sheet ? set({ sheet: null }) : set({ screen: 'home', q: '', letter: '' });

function scan() {
  const found = (txt) => {
    const p = PRODUCTS.find((x) => x.code === String(txt).trim());
    p ? set({ screen: 'category', cat: p.cat, q: p.code, letter: '' }) : toast(t('scanNotFound'));
  };
  if (tg?.showScanQrPopup) tg.showScanQrPopup({ text: t('scanHint') }, (txt) => { found(txt); return true; });
  else { const v = prompt(t('scanHint')); if (v) found(v); }
}

async function place() {
  if (state.name.trim().length < 2 || state.phone.replace(/\D/g, '').length < 9) return toast(t('fillDetails'));
  const order = {
    items: cartItems().map(({ p, q }) => ({ id: p.id, name: p.name.en, qty: q, price: p.price })),
    total: total(), payment: state.pay, name: state.name.trim(), phone: state.phone.trim(),
    lang: state.lang, user: tg?.initDataUnsafe?.user || null,
  };
  if (CONFIG.ORDER_ENDPOINT) {
    const r = await fetch(CONFIG.ORDER_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `tma ${tg?.initData || ''}` }, body: JSON.stringify(order),
    }).catch(() => null);
    if (!r?.ok) return toast(t('orderFailed'));
  }
  state.cart = {};
  set({ sheet: 'done' });
  if (!CONFIG.ORDER_ENDPOINT && tg?.initData) { try { tg.sendData(JSON.stringify(order)); } catch {} }
}

const actions = {
  start: () => set({ screen: 'home' }),
  theme: () => set({ theme: state.theme === 'dark' ? 'light' : 'dark' }),
  cat: (d) => set({ screen: 'category', cat: d.id, q: '', letter: '' }),
  back,
  letter: (d) => {
    state.letter = d.l;
    document.querySelectorAll('.alpha button').forEach((b) => b.classList.toggle('on', b.dataset.l === d.l));
    $('#list').innerHTML = listHTML();
  },
  scan,
  add: (d) => { bump(d.id, 1); hap(); $('#list').innerHTML = listHTML(); updateBadge(); },
  inc: (d) => { bump(d.id, 1); render(); },
  dec: (d) => { bump(d.id, -1); render(); },
  cart: () => set({ sheet: 'cart' }),
  close: () => set({ sheet: null }),
  checkout: () => set({ sheet: 'checkout' }),
  place,
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (el && el.tagName !== 'SELECT') actions[el.dataset.act]?.(el.dataset);
});
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.act === 'lang') set({ lang: el.value });
  if (el.name === 'pay') set({ pay: el.value });
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.id === 'q') { state.q = el.value; $('#list').innerHTML = listHTML(); }
  if (el.id === 'nm') state.name = el.value;
  if (el.id === 'ph') state.phone = el.value;
});

tg?.ready(); tg?.expand();
tg?.BackButton.onClick(back);
tg?.onEvent('themeChanged', () => { if (!store.get().theme) { state.theme = tg.colorScheme; render(); } });
render();
