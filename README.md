# Manual Hub - store flow update
Replace in the ROOT of your GitHub repo (same paths):
  index.html, css/styles.css, js/app.js, data/config.js, locales/en.js, locales/am.js
Unchanged from the last version: js/admin.js, css/admin.css, data/categories.js, data/products.js, data/promos.js
Then edit data/config.js: WEBHOOK_URL, PICKUP_LOCATIONS, DELIVERY_FEE, bank account, ADMIN_IDS.

n8n webhook (POST, JSON). Every request has "action":
  telebirr_charge -> reply {"status":"pending","tx_ref":"..."}  (or "success" / "failed" + "message")
  telebirr_status -> reply {"status":"pending" | "success" | "failed"}
  manual_order    -> reply {"status":"received"}
The payer's number arrives as payer_phone (format 2519XXXXXXXX). Order fields: order_id, user, items, subtotal, delivery_fee, total, payment_method.
