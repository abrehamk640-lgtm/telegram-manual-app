// ============ APP SETTINGS (edit here) ============
export const CONFIG = {
  // Your n8n Webhook node "Production URL" (POST). Leave '' while testing.
  // In the n8n Webhook node > Options > "Allowed Origins (CORS)" set * (or your site URL).
  // If your workflow answers with JSON like { "payment_url": "https://..." }, a "Pay now" button appears.
  WEBHOOK_URL: '',
  // Also send the order to your bot via Telegram.WebApp.sendData (only works when the app is opened
  // from a bot keyboard button; it closes the app). Use ONE of the two, or dedupe by order_id in n8n.
  USE_SEND_DATA: true,
  CURRENCY: 'ETB',
};

// ============ ADMIN ACCESS ============
// Telegram user ids allowed to open the Admin panel (tap the header logo 5 times).
// Get your id from @userinfobot. Example: [123456789]. Admins also get a gear button in the header.
// Leave [] while testing (then anyone who finds the secret tap can open it - it only generates text,
// nothing goes live until YOU upload the files to GitHub).
export const ADMIN_IDS = [];

// ============ PAYMENT METHODS ============
// `label` is the English name sent to n8n. Names shown to users live in locales (pay_<id>).
export const PAYMENTS = [
  { id: 'telebirr', label: 'Telebirr', icon: '📲', account: '09XXXXXXXX' },
  { id: 'cbe', label: 'CBE Birr', icon: '🏦', account: '1000XXXXXXXXX' },
  { id: 'bank', label: 'Bank Transfer', icon: '💳', account: 'Bank name / account number' },
  { id: 'cash', label: 'Cash on Order', icon: '💵', account: '' },
];
