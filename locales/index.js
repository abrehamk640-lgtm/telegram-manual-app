// To add a language (e.g. Afaan Oromoo):
// 1) copy locales/en.js to locales/om.js and translate the values (keep the keys);
// 2) add: import om from './om.js'; and un-comment/add one line below.
// Names in data/categories.js and data/products.js take an extra `om: '...'` (falls back to English if missing).
import en from './en.js';
import am from './am.js';

export const LOCALES = {
  am: { short: 'አማ', label: 'አማርኛ', dict: am },
  en: { short: 'EN', label: 'English', dict: en },
  // om: { short: 'OM', label: 'Afaan Oromoo', dict: om },
  // ti: { short: 'ትግ', label: 'ትግርኛ', dict: ti },
};
