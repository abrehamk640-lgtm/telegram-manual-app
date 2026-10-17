// To add a manual: copy one line and edit. `cat` must match a category id.
// `thumb` can be an emoji or an image path/URL (e.g. 'img/tv.jpg'). `code` is what the QR/barcode scan matches.
// The first letter of the English name drives the A-Z filter. Prices are in ETB (sample values).
const p = (id, cat, en, am, dEn, dAm, price, thumb, code) =>
  ({ id, cat, name: { en, am }, desc: { en: dEn, am: dAm }, price, thumb, code });

export const PRODUCTS = [
  p('e1', 'electronics', 'Air Fryer Manual', 'የኤር ፍራየር መመሪያ', 'Setup, cooking times and cleaning.', 'አጠቃቀም፣ የማብሰያ ጊዜ እና ጽዳት።', 80, '🍟', '100001'),
  p('e2', 'electronics', 'Bluetooth Speaker Manual', 'የብሉቱዝ ስፒከር መመሪያ', 'Pairing, charging and troubleshooting.', 'ማገናኘት፣ ቻርጅ ማድረግ እና ችግር መፍታት።', 60, '🔊', '100002'),
  p('e3', 'electronics', 'Smartphone Quick Guide', 'የስማርት ስልክ አጭር መመሪያ', 'First setup, settings and backups.', 'የመጀመሪያ ቅንብር፣ ማስተካከያ እና ባክአፕ።', 100, '📱', '100003'),
  p('m1', 'medicines', 'Amoxicillin Leaflet', 'የአሞክሲሲሊን መመሪያ', 'Usage, dosage form and warnings.', 'አጠቃቀም፣ የመጠን ዓይነት እና ማስጠንቀቂያዎች።', 40, '💊', '200001'),
  p('m2', 'medicines', 'Ibuprofen Leaflet', 'የኢቡፕሮፌን መመሪያ', 'Usage, side effects and storage.', 'አጠቃቀም፣ የጎንዮሽ ጉዳት እና አያያዝ።', 40, '🩹', '200002'),
  p('m3', 'medicines', 'Paracetamol Leaflet', 'የፓራሲታሞል መመሪያ', 'Usage, limits and when to see a doctor.', 'አጠቃቀም፣ ገደብ እና ሐኪም ማየት ሲያስፈልግ።', 40, '🌡️', '200003'),
  p('a1', 'apps', 'Excel Quick Guide', 'የኤክሴል አጭር መመሪያ', 'Formulas, tables and charts for beginners.', 'ለጀማሪዎች ፎርሙላ፣ ሠንጠረዥ እና ቻርት።', 90, '📊', '300001'),
  p('a2', 'apps', 'Telebirr App Guide', 'የቴሌብር አፕ መመሪያ', 'Send, pay and check your balance.', 'መላክ፣ መክፈል እና ሒሳብ ማየት።', 50, '📲', '300002'),
  p('f1', 'foods', 'Baby Formula Guide', 'የሕጻናት ወተት መመሪያ', 'Preparation steps and storage.', 'የአዘገጃጀት ደረጃዎች እና አያያዝ።', 45, '🍼', '400001'),
  p('f2', 'foods', 'Canned Tuna Guide', 'የታሸገ ቱና መመሪያ', 'Nutrition facts and storage after opening.', 'የአመጋገብ መረጃ እና ከከፈቱ በኋላ አያያዝ።', 35, '🐟', '400002'),
];
