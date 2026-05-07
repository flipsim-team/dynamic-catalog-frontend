# Seller Catalog

## GLID-based Seller Redirection Flow

The catalog now supports dynamic seller pages based on the URL path.

- Route `/<glid>` loads seller data from `src/data/<glid>.json`.
- Route `/` continues to load the default static dataset from `src/data/sellerData.json`.
- If the JSON file for a GLID does not exist, the UI shows a "Seller not found" state.

### Vercel Deployment Routing

Because this project uses client-side routing (`react-router-dom` with `BrowserRouter`), Vercel must rewrite all incoming paths to `index.html`.

- Added `vercel.json` with SPA rewrite from `/(.*)` to `/index.html`.
- This ensures direct URL access like `https://your-domain/<glid>` does not return server 404.
- React Router then resolves the route and the app loads `src/data/<glid>.json`.

## How to Add a New Seller

1. Add a JSON file in `src/data` with file name as the seller GLID, for example `ABCD1234.json`.
2. Open the app with `/<glid>` (example: `/ABCD1234`).
3. The app resolves and renders the matching seller profile automatically.

## Feedback Email Setup (EmailJS)

The catalog feedback widget can send feedback directly through EmailJS without opening any mail app.

1. Create a `.env` file at the project root by copying `.env.example`.
2. Fill in the values from your EmailJS dashboard:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
3. Optional: set `VITE_FEEDBACK_RECIPIENT_EMAIL` (defaults to `gunjan.bhanarkar@indiamart.com`).
4. Restart the dev server after editing `.env`.

Template fields sent to EmailJS:

- `to_email`
- `recipient_email`
- `seller_id`
- `seller_name`
- `sentiment`
- `comment`
- `submitted_at`
- `catalog_path`
- `source`
- `payload_json`
