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

// ============ PAYMENT METHODS ============
// `label` is the English name sent to n8n. Names shown to users live in locales (pay_<id>).
export const PAYMENTS = [
  { id: 'telebirr', label: 'Telebirr', icon: '📲', account: '09XXXXXXXX' },
  { id: 'cbe', label: 'CBE Birr', icon: '🏦', account: '1000XXXXXXXXX' },
  { id: 'bank', label: 'Bank Transfer', icon: '💳', account: 'Bank name / account number' },
  { id: 'cash', label: 'Cash on Order', icon: '💵', account: '' },
];
