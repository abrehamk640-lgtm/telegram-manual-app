// =====================================================================
//  CATEGORIES
//  icon : emoji combo (used if `svg` is missing)
//  svg  : sleek vector icon (64x64) shown as a tile in the app. Crisp on every screen.
//  To add a category: copy the TEMPLATE at the bottom, give it a new unique id.
// =====================================================================
export const CATEGORIES = [
  {
    id: 'electronics',
    icon: '⚡💻🔌',
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="#1F1B10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="6" y="14" width="38" height="26" rx="3.5" fill="#fff"/>
      <rect x="10" y="18" width="30" height="18" rx="1.5" fill="#FFE082" stroke="none"/>
      <path d="M2 44h46l-3.5 6h-39z" fill="#FFB800"/>
      <circle cx="47" cy="16" r="11" fill="#FFB800"/>
      <path d="M49.5 8l-6 10h5l-2.5 9 8-12h-5.5z" fill="#1F1B10" stroke="none"/>
      <path d="M55 40v5M59 40v5"/><rect x="52" y="45" width="10" height="8" rx="2.5" fill="#fff"/><path d="M57 53v6"/>
    </svg>`,
    name: { en: 'Electronics', am: 'ኤሌክትሮኒክስ' },
  },
  {
    id: 'medicines',
    icon: '🩺💊🏥',
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="#1F1B10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="5" y="6" width="36" height="36" rx="10" fill="#12B886"/>
      <path d="M23 13v22M12 24h22" stroke="#fff" stroke-width="6"/>
      <g transform="rotate(-40 47 44)"><rect x="34" y="37" width="26" height="14" rx="7" fill="#fff"/><path d="M47 37h-6a7 7 0 0 0 0 14h6z" fill="#FFB800"/></g>
      <path d="M3 57h9l3-6 5 12 4-8h6" stroke="#12B886"/>
    </svg>`,
    name: { en: 'Medicines', am: 'መድኃኒቶች' },
  },
  {
    id: 'apps',
    icon: '⚙️📱💻',
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="#1F1B10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="12" y="4" width="28" height="48" rx="7" fill="#fff"/>
      <path d="M23 9h6"/>
      <rect x="16" y="14" width="20" height="30" rx="2" fill="#FFE082" stroke="none"/>
      <path d="M24 24l-5 5 5 5M30 24l5 5-5 5"/><path d="M23 48h6"/>
      <circle cx="46" cy="45" r="11.5" stroke="#FFB800" stroke-width="5" stroke-dasharray="4.5 4.5"/>
      <circle cx="46" cy="45" r="8" fill="#FFB800"/><circle cx="46" cy="45" r="3" fill="#fff"/>
    </svg>`,
    name: { en: 'Applications', am: 'አፕሊኬሽኖች' },
  },
  {
    id: 'foods',
    icon: '📦🥫🛒',
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="#1F1B10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="20" cy="16" r="9" fill="#F76707"/><path d="M20 8V4M16 9l4-1 4 1" stroke="#2F9E44"/>
      <rect x="4" y="30" width="31" height="26" rx="3" fill="#FFB800"/>
      <rect x="14" y="30" width="11" height="9" fill="#fff"/><path d="M4 39h31"/>
      <rect x="40" y="33" width="18" height="14" fill="#F76707" stroke="none"/>
      <path d="M40 26h18v28a3 3 0 0 1-3 3H43a3 3 0 0 1-3-3z" fill="none"/><path d="M40 33h18M40 47h18"/>
    </svg>`,
    name: { en: 'Packaged Foods', am: 'የታሸጉ ምግቦች' },
  },

  // ↓↓↓ PASTE NEW CATEGORIES ABOVE THIS LINE ↓↓↓
];

/* ===================== TEMPLATE - copy, paste above, then edit =====================
  {
    id: 'toys',                       // unique, no spaces; products use this as `cat`
    icon: '🧸🎲🚗',                   // emoji combo (fallback)
    svg: '',                          // optional vector; leave '' to show the emoji combo
    name: { en: 'Toys', am: 'መጫወቻዎች' },
  },
================================================================================== */
