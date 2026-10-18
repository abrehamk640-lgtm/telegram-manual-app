// ============ APP SETTINGS (edit here) ============
export const CONFIG = {
  // Your n8n Webhook "Production URL" (POST). Every request has an `action` field:
  //   telebirr_charge  -> start a Telebirr payment prompt on the customer's phone
  //   telebirr_status  -> ask if that payment is done  (reply: { "status": "pending" | "success" | "failed" })
  //   manual_order     -> bank-transfer order (reply: { "status": "received" })
  // In the n8n Webhook node > Options > "Allowed Origins (CORS)" set * (or your site URL).
  WEBHOOK_URL: '',
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
// Telegram user ids allowed to open the Admin panel (tap the header logo 5 times).
// Get your id from @userinfobot. Example: [123456789]. Leave [] while testing.
export const ADMIN_IDS = [];

// ============ PAYMENT METHODS (gateway cards on the Payment page) ============
// mode 'direct' = Telebirr prompt to the customer's phone (needs the n8n workflow).
// mode 'manual' = customer transfers money to `account`, you confirm it yourself.
export const PAYMENTS = [
  { id: 'telebirr', mode: 'direct', label: { en: 'Telebirr', am: 'ቴሌብር' } },
  {
    id: 'bank', mode: 'manual', label: { en: 'Bank', am: 'ባንክ' },
    account: { name: 'Commercial Bank of Ethiopia (CBE)', number: '1000XXXXXXXXX', holder: 'Account holder name' },
  },
];
