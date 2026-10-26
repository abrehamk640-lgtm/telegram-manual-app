// ============ APP SETTINGS (edit here) ============
export const CONFIG = {
  // Your n8n Webhook "Production URL" (POST). Every request has an `action` field:
  //   create_order     -> Chapa hosted payment (reply: { "checkout_url": "https://checkout.chapa.co/..." }); the app opens that page
  //   manual_order     -> bank-transfer order (reply: { "status": "awaiting_verification" })
  // In the n8n Webhook node > Options > "Allowed Origins (CORS)" set * (or your site URL).
  WEBHOOK_URL: 'https://gandalfk.app.n8n.cloud/webhook/manual-checkout',
  // n8n Webhook "Production URL" that receives each NEW user's registration (POST, JSON):
  //   { name, phone, telegram_id, register_date, init_data }   Leave '' to skip sending (details are still saved on the phone).
  // In that n8n Webhook node > Options > "Allowed Origins (CORS)" set * (or your site URL).
  USER_REGISTER_WEBHOOK: 'https://gandalfk.app.n8n.cloud/webhook/manual-register',
  // TESTING ONLY: pretend payments succeed when WEBHOOK_URL is empty. Keep false in real use.
  DEMO_PAYMENTS: false,
  SHOW_WELCOME: true,          // false = open straight on the products page
  CURRENCY: 'ETB',
  DELIVERY_FEE: 0,             // e.g. 99 adds a "Delivery Fee" line. 0 hides it.
  // Pickup places shown on the Order Summary page. [] hides the pickup block and delivery note.
  PICKUP_LOCATIONS: [
    { id: 'main', name: { en: 'Main Office', am: 'ዋና ቢሮ' }, address: { en: 'Your address here', am: 'አድራሻዎን እዚህ ያስገቡ' } },
  ],
  POLL_SECONDS: 4,             // how often to check a Telebirr payment
  POLL_MAX: 30,                // 30 x 4s = 2 minutes, then "timed out"
  USE_SEND_DATA: false,        // also send manual orders to your bot via sendData (closes the app)
};

// ============ ADMIN ACCESS ============
// Opening the Admin panel (tap the header logo 5 times, or the gear in Settings) asks for a password.
// If no password is set below, the Admin panel stays locked.
//
// OPTION A (simple): put a password here. Note: anyone who opens your GitHub repo or website files can read it.
export const ADMIN_PASSWORD = '32394619';
// OPTION B (recommended): keep only a scrambled version here. Open tools/make-admin-password.html in your
// browser, type your password, and paste the line it gives you. If this is set, ADMIN_PASSWORD is ignored.
export const ADMIN_PASSWORD_HASH = '';
// Optional extra rule: Telegram user ids allowed to even try (also shows the gear button). [] = anyone with the password.
// Get your id from @userinfobot. Example: [123456789]
export const ADMIN_IDS = [928441512];

// ============ PAYMENT METHODS (gateway cards on the Payment page) ============
// mode 'direct' = Telebirr prompt to the customer's phone (needs the n8n workflow).
// mode 'manual' = customer transfers money to `account`, you confirm it yourself.
export const PAYMENTS = [
  // mode 'checkout' = opens the Chapa payment page (Telebirr, CBE, cards...). The backend sends the manual to the customer's Telegram after payment.
  { id: 'chapa', mode: 'checkout', label: { en: 'Pay online', am: 'በኦንላይን ክፈል' } },
  {
    id: 'bank', mode: 'manual', label: { en: 'Bank', am: 'ባንክ' },
    account: { name: 'Commercial Bank of Ethiopia (CBE)', number: '1000XXXXXXXXX', holder: 'Account holder name' },
  },
];
