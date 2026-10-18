// =====================================================================
//  AD / PROMO BANNERS on the home page
//  The whole banner section is HIDDEN unless at least one ad is active.
//  An ad is active when:  active is not false  AND  today is not past `until`.
//  Easiest way to edit: open the Admin panel in the app (tap the header logo 5 times).
// =====================================================================
//  id       unique, no spaces
//  tag      'featured' | 'sponsored'
//  active   true / false  (false = hidden)
//  image    optional banner image, e.g. 'img/promo1.jpg'
//  title    { en, am }     text { en, am }
//  product  optional product id -> tapping opens that manual
//  link     optional https:// link -> tapping opens that page
//  until    optional 'YYYY-MM-DD' -> ad disappears after this day
// =====================================================================
export const PROMOS = [
  // (no ads yet - paste ads here)
];

/* ===================== TEMPLATE - copy, paste inside the [ ] above =====================
  {
    id: 'promo1', tag: 'featured', active: true, image: '',
    title: { en: 'New manuals every week', am: 'በየሳምንቱ አዳዲስ መመሪያዎች' },
    text: { en: 'Browse the latest arrivals.', am: 'አዳዲስ የገቡትን ይመልከቱ።' },
    product: '', link: '', until: '2026-12-31',
  },
================================================================================== */
