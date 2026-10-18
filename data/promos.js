// Banner / ad slots shown at the top of the home page (swipe sideways).
// To add an ad: copy a block. Remove `slot: true` and fill title/text.
//   tag: 'featured' | 'sponsored'     image: 'img/promo1.jpg' (optional)
//   product: a product id (opens that manual)   link: 'https://...' (opens a web page)
// Set PROMOS = [] to hide the whole section.
export const PROMOS = [
  {
    id: 'promo1', tag: 'featured', image: '',
    title: { en: 'New manuals every week', am: 'በየሳምንቱ አዳዲስ መመሪያዎች' },
    text: { en: 'Browse the latest arrivals.', am: 'አዳዲስ የገቡትን ይመልከቱ።' },
    product: '', link: '',
  },
  { id: 'ad1', tag: 'sponsored', slot: true, image: '', title: {}, text: {}, product: '', link: '' },
];
