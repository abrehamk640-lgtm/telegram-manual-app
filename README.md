# Manual Hub – Telegram Mini App (frontend)

Static app: no install, no build. Put this `docs/` folder in your repo.

## Run / publish
1. Test locally: in this folder run `python3 -m http.server 8000`, open http://localhost:8000
2. Publish free: GitHub repo → Settings → Pages → Deploy from branch → `main` / `/docs`.
3. In @BotFather: `/newapp` (or Bot Settings → Menu Button) and paste your `https://<user>.github.io/<repo>/` link.

## Where to edit
- `data/categories.js` – add categories (one block each)
- `data/products.js` – add manuals (one line each; `code` = QR/barcode value)
- `data/config.js` – payment account numbers, `ORDER_ENDPOINT`
- `locales/` – texts; see the comment in `locales/index.js` to add Afaan Oromoo / Tigrigna
