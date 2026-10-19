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
//
//  THE FOUR MANUAL FORMATS (all optional - a tab only appears when its content exists)
//  ---------------------------------------------------------------------------------
//  fullText      { en, am }  the whole manual, read inside the app ("Read Full Manual" tab).
//                Plain text. Simple formatting:  "# Heading"   "- bullet"   "1. numbered step"
//                and a blank line between paragraphs. Use `back-ticks` so you can type on many lines.
//  summary       { en, am }  short summary / highlights ("Summary" tab). Same simple formatting.
//  voiceNoteUrl  MP3 / audio link ("Listen Audio" tab). Either one link for both languages:
//                  'https://example.com/guide.mp3'
//                or one link per language:  { en: 'https://.../en.mp3', am: 'https://.../am.mp3' }
//  images        screenshots / visual guide ("View Images/PDF" tab). A list of image links:
//                  ['img/x1-1.jpg', 'img/x1-2.jpg']
//                or with captions:  [{ src: 'img/x1-1.jpg', caption: { en: 'Step 1', am: 'ደረጃ 1' } }]
//                or per language:   { en: [...], am: [...] }
//  manualPdfUrl  full PDF link (same tab). One link, or { en: '...pdf', am: '...pdf' }
//
//  Missing language? The app shows the other language and tells the reader.
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
    fullText: {
      en: `# Before you start
- Place the air fryer on a flat, heat-safe surface with at least 10 cm of free space around it.
- Wash the basket and tray with warm soapy water and dry them well.

# Cooking steps
1. Plug in the fryer and set the temperature (usually 160-200 °C).
2. Preheat for 3 minutes.
3. Put the food in the basket without overfilling it, then slide the basket in.
4. Set the timer. Shake the basket halfway through for even cooking.

# Cleaning
- Unplug the fryer and let it cool completely first.
- Wash the basket and tray. Never put the main unit in water.

# Safety
- Never cover the air vents while it is running.
- Keep the cord away from hot surfaces and out of children's reach.`,
      am: `# ከመጀመርዎ በፊት
- ኤር ፍራየሩን ሙቀት በሚቋቋም ጠፍጣፋ ቦታ ላይ ያስቀምጡ፤ በዙሪያው ቢያንስ 10 ሴ.ሜ ክፍት ቦታ ይተዉ።
- ቅርጫቱንና ትሪውን በሞቀ ሳሙና ውሃ ያጠቡና በደንብ ያደርቁ።

# የአጠቃቀም ደረጃዎች
1. ኤር ፍራየሩን ከኤሌክትሪክ ጋር ያገናኙና ሙቀቱን ያስተካክሉ (ብዙውን ጊዜ 160-200 °C)።
2. ለ3 ደቂቃ ቀድመው ያሙቁ።
3. ምግቡን ሳይሞላ ቅርጫቱ ውስጥ ያስገቡና ቅርጫቱን ይግፉት።
4. ሰዓት ቆጣሪውን ያስተካክሉ። ምግቡ እኩል እንዲበስል በመሃል ቅርጫቱን ያነቃንቁ።

# ጽዳት
- መጀመሪያ ከኤሌክትሪክ ያላቅቁና ሙሉ በሙሉ እስኪቀዘቅዝ ይጠብቁ።
- ቅርጫቱንና ትሪውን ይታጠቡ። ዋናውን መሣሪያ በውሃ ውስጥ በጭራሽ አያስገቡ።

# ደህንነት
- በሚሠራበት ጊዜ የአየር መውጫዎቹን በጭራሽ አይሸፍኑ።
- ገመዱን ከሞቁ ቦታዎችና ከልጆች እጅ ያርቁ።`,
    },
    voiceNoteUrl: '', images: [], manualPdfUrl: '',
  },
  {
    id: 'e2', cat: 'electronics', code: '100002', price: 60,
    name: { en: 'Bluetooth Speaker Manual', am: 'የብሉቱዝ ስፒከር መመሪያ' },
    image: '', emoji: '🔊',
    summary: {
      en: 'Pair the speaker with your phone, charge it correctly, and fix common sound and connection problems.',
      am: 'ስፒከሩን ከስልክዎ ጋር ማገናኘት፣ በትክክል ቻርጅ ማድረግ እና የተለመዱ የድምጽና የግንኙነት ችግሮችን መፍታት።',
    },
    fullText: {
      en: `# Pairing
1. Hold the power button for 3 seconds until the light blinks.
2. Open Bluetooth on your phone and choose the speaker from the list.
3. Wait for the confirmation sound.

# Charging
- Use the original cable and a standard 5V charger.
- A full charge takes about 3 hours.

# Troubleshooting
- No sound: raise the volume on both the phone and the speaker.
- Cannot connect: forget the speaker in your phone's Bluetooth list, then pair again.`,
      am: `# ማገናኘት
1. መብራቱ እስኪያበራ ድረስ የኃይል ቁልፉን ለ3 ሰከንድ ይያዙ።
2. በስልክዎ ብሉቱዝ ይክፈቱና ስፒከሩን ከዝርዝሩ ይምረጡ።
3. የማረጋገጫ ድምጽ እስኪሰማ ይጠብቁ።

# ቻርጅ ማድረግ
- ዋናውን ገመድና መደበኛ 5V ቻርጀር ይጠቀሙ።
- ሙሉ ቻርጅ ለማድረግ ወደ 3 ሰዓት ይወስዳል።

# ችግር መፍታት
- ድምጽ ከሌለ፦ በስልክዎም በስፒከሩም ላይ ድምጹን ከፍ ያድርጉ።
- ካልተገናኘ፦ ስፒከሩን ከስልክዎ ብሉቱዝ ዝርዝር ያስረሱና እንደገና ያገናኙ።`,
    },
    voiceNoteUrl: '', images: [], manualPdfUrl: '',
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
    fullText: {
      en: `# First heading
Write the full manual here. Leave a blank line between paragraphs.

- A bullet point
- Another bullet point

# Steps
1. First step
2. Second step`,
      am: `# የመጀመሪያ ርዕስ
ሙሉውን መመሪያ እዚህ ይጻፉ። በአንቀጾች መካከል አንድ ባዶ መስመር ይተዉ።

- አንድ ነጥብ
- ሌላ ነጥብ

# ደረጃዎች
1. የመጀመሪያ ደረጃ
2. ሁለተኛ ደረጃ`,
    },
    voiceNoteUrl: { en: 'https://example.com/x1-en.mp3', am: 'https://example.com/x1-am.mp3' },
    images: [
      { src: 'img/x1-1.jpg', caption: { en: 'Step 1', am: 'ደረጃ 1' } },
      'img/x1-2.jpg',
    ],
    manualPdfUrl: { en: 'https://example.com/x1-en.pdf', am: 'https://example.com/x1-am.pdf' },
  },
================================================================================== */
