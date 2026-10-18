# Manual Hub - update guide
Replace in the ROOT of your GitHub repo (same paths):
  index.html, css/styles.css, js/app.js, data/config.js, locales/en.js, locales/am.js
Add (new): tools/make-admin-password.html
Unchanged: js/admin.js, css/admin.css, data/categories.js, data/products.js, data/promos.js, img/*

IMPORTANT: the Admin panel stays LOCKED until you set a password in data/config.js
 - Quick: ADMIN_PASSWORD = 'your password'
 - Better: open tools/make-admin-password.html in your browser, type a password, paste the line it gives you into data/config.js
