# Registration popup update
Replace these 5 files in your repo (same paths):
  js/app.js, css/styles.css, data/config.js, locales/en.js, locales/am.js
index.html does not change.
Then set USER_REGISTER_WEBHOOK in data/config.js to your n8n Webhook URL.
Your existing ADMIN_PASSWORD and ADMIN_IDS in config.js were kept.
Webhook body: { name, phone, telegram_id, register_date, init_data }
