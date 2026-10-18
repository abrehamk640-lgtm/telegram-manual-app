// =====================================================================
//  MANUALS CATALOG  -  add manuals with the Admin panel (tap the header logo 5 times)
//  or by copying the TEMPLATE at the bottom
// =====================================================================
//  id            unique, no spaces (e.g. 'e4')
//  cat           must match an id in data/categories.js
//  name          { en, am }  product name in both languages (A-Z filter uses the English name)
//  price         number in ETB
//  code          QR / barcode value printed on the product (scan opens this manual)
//  image         photo path or full URL, e.g. 'img/air-fryer.jpg'  ('' = show emoji instead)
//  emoji         shown when there is no image
//  summary       { en, am }  quick, easy-to-read summary of the manual
//  voiceNoteUrl  optional MP3 / audio link ('' = hide the audio player)
//  manualPdfUrl  optional full PDF link ('' = hide the download button)
// =====================================================================
export const PRODUCTS = [
  // ---------- Electronics ----------
  {
    id: 'e1', cat: 'electronics', code: '100001', price: 80,
    name: { en: 'Air Fryer Manual', am: 'የኤር ፍራየር መመሪያ' },
    image: '', emoji: '🍟',
    summary: {
      en: 'How to set up your air fryer, choose cooking times and temperatures, and clean it safely after use.',
      am: 'ኤር ፍራየርዎን እንዴት ማዘጋጀት፣ የማብሰያ ጊዜና ሙቀት መምረጥ እና ከተጠቀሙ በኋላ በደህና ማጽዳት እንደሚቻል።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'e2', cat: 'electronics', code: '100002', price: 60,
    name: { en: 'Bluetooth Speaker Manual', am: 'የብሉቱዝ ስፒከር መመሪያ' },
    image: '', emoji: '🔊',
    summary: {
      en: 'Pair the speaker with your phone, charge it correctly, and fix common sound and connection problems.',
      am: 'ስፒከሩን ከስልክዎ ጋር ማገናኘት፣ በትክክል ቻርጅ ማድረግ እና የተለመዱ የድምጽና የግንኙነት ችግሮችን መፍታት።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'e3', cat: 'electronics', code: '100003', price: 100,
    name: { en: 'Smartphone Quick Guide', am: 'የስማርት ስልክ አጭር መመሪያ' },
    image: '', emoji: '📱',
    summary: {
      en: 'First-time setup, key settings, and how to back up your photos and contacts.',
      am: 'የመጀመሪያ ቅንብር፣ ዋና ዋና ማስተካከያዎች እና ፎቶና ስልክ ቁጥሮችን ባክአፕ ማድረግ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  // ---------- Medicines (always follow the doctor's / pharmacist's advice) ----------
  {
    id: 'm1', cat: 'medicines', code: '200001', price: 40,
    name: { en: 'Amoxicillin Leaflet', am: 'የአሞክሲሲሊን መመሪያ' },
    image: '', emoji: '💊',
    summary: {
      en: 'What this medicine is used for, warnings, and when to ask a doctor or pharmacist.',
      am: 'መድኃኒቱ ለምን እንደሚያገለግል፣ ማስጠንቀቂያዎች እና ሐኪም ወይም ፋርማሲስት መጠየቅ ሲያስፈልግ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'm2', cat: 'medicines', code: '200002', price: 40,
    name: { en: 'Ibuprofen Leaflet', am: 'የኢቡፕሮፌን መመሪያ' },
    image: '', emoji: '🩹',
    summary: {
      en: 'What this medicine is used for, possible side effects, and how to store it.',
      am: 'መድኃኒቱ ለምን እንደሚያገለግል፣ ሊኖሩ የሚችሉ የጎንዮሽ ጉዳቶች እና አያያዝ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'm3', cat: 'medicines', code: '200003', price: 40,
    name: { en: 'Paracetamol Leaflet', am: 'የፓራሲታሞል መመሪያ' },
    image: '', emoji: '🌡️',
    summary: {
      en: 'What this medicine is used for, safety limits, and when to see a doctor.',
      am: 'መድኃኒቱ ለምን እንደሚያገለግል፣ የደህንነት ገደቦች እና ሐኪም ማየት ሲያስፈልግ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  // ---------- Applications ----------
  {
    id: 'a1', cat: 'apps', code: '300001', price: 90,
    name: { en: 'Excel Quick Guide', am: 'የኤክሴል አጭር መመሪያ' },
    image: '', emoji: '📊',
    summary: {
      en: 'Beginner guide to formulas, tables and charts in Excel.',
      am: 'ለጀማሪዎች የኤክሴል ፎርሙላ፣ ሠንጠረዥ እና ቻርት መመሪያ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'a2', cat: 'apps', code: '300002', price: 50,
    name: { en: 'Telebirr App Guide', am: 'የቴሌብር አፕ መመሪያ' },
    image: '', emoji: '📲',
    summary: {
      en: 'How to send money, pay bills and check your balance in the Telebirr app.',
      am: 'በቴሌብር አፕ ገንዘብ መላክ፣ ሂሳብ መክፈል እና ቀሪ ሒሳብ ማየት።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  // ---------- Packaged foods ----------
  {
    id: 'f1', cat: 'foods', code: '400001', price: 45,
    name: { en: 'Baby Formula Guide', am: 'የሕጻናት ወተት መመሪያ' },
    image: '', emoji: '🍼',
    summary: {
      en: 'Preparation steps as printed on the pack, hygiene tips and storage.',
      am: 'በማሸጊያው ላይ እንደተጻፈው የአዘገጃጀት ደረጃዎች፣ የንጽህና ምክሮች እና አያያዝ።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },
  {
    id: 'f2', cat: 'foods', code: '400002', price: 35,
    name: { en: 'Canned Tuna Guide', am: 'የታሸገ ቱና መመሪያ' },
    image: '', emoji: '🐟',
    summary: {
      en: 'Nutrition facts and how to store the tuna after opening.',
      am: 'የአመጋገብ መረጃ እና ከከፈቱ በኋላ ቱናውን እንዴት ማስቀመጥ እንደሚቻል።',
    },
    voiceNoteUrl: '', manualPdfUrl: '',
  },

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
