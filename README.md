# Content Aggregated Seller Catalog: Agentic Pipeline with Gemini

## Getting Started (Local Development)

Follow these steps to run the app locally:

- Install dependencies: `npm install`
- Start the dev server: `npm run dev`
- Build for production: `npm run build`
- Run lint: `npm run lint`
- Run tests: `npm run test`

Notes:

- The app uses Vite + React + TypeScript. Environment variables for EmailJS should be provided via a `.env` file (see the EmailJS section below).
- Seller catalogs are fetched from Supabase (`glid_data`) at runtime using the seller GLID from the route.

## Developer Notes (recent refactor)

- Formatting helpers (`formatCount`, `formatPrice`) have been consolidated into `src/lib/formatters.ts` to reduce duplication and improve reuse across components.
- When refactoring, prefer importing helpers from `src/lib/formatters.ts` or via the public re-exports in `src/lib/sellerDataExtractor.ts` to keep import paths stable.
- Run `npm run lint` and `npm run build` after changes; the repo uses TypeScript and Vite for type-check/build.

# Dynamic Catalog Agent Pipeline

**Intelligent, multi-agent catalog enrichment powered by Google Gemini**

---

## What It Does

The Dynamic Catalog Pipeline transforms raw seller data from a Google Sheet into a fully enriched, production-ready product catalog. It combines AI reasoning, computer vision, social media scraping, phone verification, and deduplication — all orchestrated autonomously by a chain of specialized AI agents.

**Input:** Google Sheet rows (seller profile + product listings)
**Output:** Structured JSON catalog — enriched products, media assets, social profiles, reviews, company profile

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                    │
│              POST /api/catalog/run  { glid, spreadsheet_url }       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1 — INPUT INTAKE                    Agent00                  │
│  Google Sheet → normalize columns → group rows by seller            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2 — PIVOT + SHIVA OVERRIDE          Agent01                  │
│  Flat rows → structured SellerRecord                                │
│  SHIVA JSON (matched_confidence > 0) → overrides company profile    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 3 — ORCHESTRATOR (ReAct Loop)       Agent02                  │
│                                                                     │
│   t=0 ──► Agent07 Social Scraping (parallel, non-blocking)         │
│            │  Instagram · Facebook · YouTube · LinkedIn             │
│            │                                                        │
│   ┌────────▼────────────────────────────────────────────┐          │
│   │  Gemini ReAct Loop — decides tool execution order   │          │
│   │                                                     │          │
│   │  1. plan_execution      ← Gemini decides strategy   │          │
│   │  2. run_company_agent   ← enrich company profile    │          │
│   │  3. run_sign3           ← verify phone (pass 1)     │          │
│   │  4. run_product_agent   ← Agent03a + Agent03 + 04   │          │
│   │  5. evaluate_output     ← quality gate (retry?)     │          │
│   │  6. run_dedup_agent     ← Agent05 dedup + index     │          │
│   │  7. await_social        ← waits for Agent07         │          │
│   │  8. run_sign3           ← verify new phones (pass2) │          │
│   │  9. write_to_catalog    ← reconcile + write output  │          │
│   └─────────────────────────────────────────────────────┘          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 4 — REFLECTION (async, every 5th run)   Agent06             │
│  Audit log → pattern analysis → learned rules → auto-inject        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
             catalog_<glid>.json  (final output)
```

---

## Agent Roster

### Agent00 — Input Intake

**Goal:** Read the Google Sheet and produce normalized, grouped seller payloads.

- Connects to Google Apps Script to fetch raw spreadsheet rows
- Applies `ALIAS_MAP` to normalize 50+ column name variants into canonical field names
- Groups rows by seller ID
- Validates required fields and emits warnings for missing data
- Output: array of intake payloads, one per seller

---

### Agent01 — Pivot

**Goal:** Convert flat attribute rows into a structured `SellerRecord`.

- Maps attribute IDs to typed fields:
  - ID 1 → seller name, ID 20 → website, ID 46 → new product marker
  - ID 23–26, 29, 33 → social platform URLs (Facebook, Instagram, Twitter, LinkedIn, YouTube)
  - ID 43 → price, ID 18 → photo URL, ID 45 → source URL
- Makes a single lightweight Gemini call to classify the seller's business domain and industry
- Applies **SHIVA override** if `seller_<glid>.json` exists and `matched_confidence > 0` — SHIVA data (GST, Google Business, cross-platform enrichment) is treated as authoritative
- Output: `SellerRecord` with `company_profile`, `raw_products`, `social_urls`

---

### Agent02 — Orchestrator

**Goal:** Run the full catalog pipeline for one seller, in the right order, with the right quality.

This is the brain of the system. It runs a **Gemini ReAct loop** — Gemini reasons about the seller's data, decides which agents to run and in what order, calls tools, evaluates results, and adapts.

**Key behaviors:**

- Calls `plan_execution` first — Gemini assesses available data and decides which agents to skip (e.g. skips product agent if no products, skips dedup if only 1 product)
- Injects **learned rules** from Agent06 into its system prompt before the loop starts
- Launches **Agent07 social scraping in parallel at t=0** so it runs concurrently with product enrichment
- Enforces quality gates — if product confidence is below 0.65, triggers one retry
- Blocks `write_to_catalog` until both Sign3 and social enrichment are complete
- Falls back to a deterministic JavaScript execution path if Gemini hits iteration limits

**Tools Gemini can call:**
| Tool | What It Does |
|------|-------------|
| `plan_execution` | Strategic planning — which agents to run, quality target |
| `run_company_agent` | Enrich company profile (address, description, social links) |
| `run_product_agent` | Classify + enrich + vision-analyze all products |
| `evaluate_product_output` | Quality gate — decide proceed or retry |
| `run_dedup_agent` | Deduplicate products against existing index |
| `await_social_enrichment` | Wait for Agent07, merge social data into profile |
| `run_sign3_enrichment` | Verify phone numbers via Sign3 Persona API |
| `write_to_catalog` | Apply reconciliation rules and write final catalog |

---

### Agent03a — Category Intelligence

**Goal:** Classify each product into the correct category with confidence scoring.

- Runs a full Gemini ReAct loop per unique product name
- Outputs: `product_category`, `product_sub_type`, `domain_attributes` schema (varies by category — tiles vs. chemicals vs. textiles all have different spec fields), `classification_confidence`
- Results are cached within a run — same product name is never classified twice
- Injects learned rules from Agent06 for category-specific corrections

---

### Agent03 — Product Enrichment

**Goal:** Transform raw product rows into fully enriched catalog entries.

- Filters junk (UI chrome, navigation labels, generic placeholders)
- For each product: calls Agent03a for category, then Gemini for enrichment
- Generates: `clean_name`, `description`, `seo_title`, `tags[]`, `domain_attributes`, `b2b_attributes` (HSN code, GST%, MOQ, country of origin)
- Runs up to 5 products in parallel (`BATCH_CONCURRENCY = 5`)
- Sets a fingerprint: `md5(clean_name + price).slice(0,12)` for dedup
- Processes up to 20 products per seller (`PRODUCT_LIMIT = 20`)

---

### Agent04 — Media & Vision

**Goal:** Analyze every product image with Gemini Vision and extract structured visual data.

- Fetches image bytes, encodes as base64, sends to Gemini multimodal
- Extracts per image: `scene_type`, `visual_features` (shape, color, clarity, setting, material), `visual_description`, `alt_text`, confidence score
- Runs up to 5 images in parallel (`VISION_CONCURRENCY = 5`)
- Falls back to URL pattern analysis if image fetch fails (classifies by URL structure, generates basic alt text)
- Every product gets a `media_data` stub even if no image URL exists (`used_vision: false`)
- Called directly inside `run_product_agent` — not separately by Gemini

---

### Agent05 — Enrich & Dedup

**Goal:** Deduplicate enriched products against the seller's existing product index.

Runs a **Gemini ReAct loop** with three dedup layers:

1. **Hash match** — exact fingerprint collision → instant decision
2. **Gemini reasoning** — Gemini reads both product descriptions and decides: `write_new` / `merge` / `skip` / `flag_review`
3. **Embedding similarity** — `text-embedding-004` vectors, cosine similarity threshold 0.80

- Fills B2B fields (MOQ, HSN, GST rate) for products that passed enrichment
- Flags products with `final_confidence < 0.60` for human review
- Writes/updates `products_index_<glid>.json` — the persistent dedup index
- Max iterations: `max(80, product_count × 5)` to handle large catalogs

---

### Agent06 — Reflection

**Goal:** Learn from past runs and generate corrective rules that improve future pipeline quality.

- Runs asynchronously after every 5th pipeline execution (non-blocking)
- Reads `audit_log.json` — full history of tool calls, confidence scores, retries, failures
- Identifies patterns: miscategorizations, low-confidence clusters, repeated tool failures
- Generates corrective rules (minimum 2 examples per rule required)
- Rules with confidence ≥ 0.85 are auto-approved and written to `learned_rules.json`
- Injected into Agent02, Agent03a, and Agent05 system prompts on next run

---

### Agent07 — Social Media Scraping

**Goal:** Scrape social media profiles and posts for the seller, in parallel with product enrichment.

- Launched at `t=0` of the orchestrator loop — runs entirely in parallel
- Detects platforms from seller's social URLs and calls Apify actors:

| Platform  | Actor                                                     | Data Collected                         |
| --------- | --------------------------------------------------------- | -------------------------------------- |
| Instagram | `apify~instagram-profile-scraper`                         | Profile, bio, followers, up to 5 posts |
| Facebook  | `apify~facebook-pages-scraper` + `facebook-posts-scraper` | Page info, 3 posts                     |
| YouTube   | `streamers~youtube-scraper`                               | Channel info, up to 5 videos/shorts    |
| LinkedIn  | `apimaestro~linkedin-company-posts`                       | Company posts                          |

- Pipeline waits for Agent07 only at the `await_social_enrichment` step — by then, scraping is typically already done
- Output: `social_profiles[]` — same shape as SHIVA social data, so Agent08 can process both sources identically

---

### Agent08 — Social Vision

**Goal:** Extract products from social media post images and add them to the catalog.

- Runs after Agent07 completes, within the social enrichment step
- Sends each post thumbnail to Gemini Vision
- Classifies post type: `product_showcase` / `promotional` / `festival` / `company_info` / `logo`
- For product posts: extracts product name, specs, price from image + caption
- Deduplicates extracted products against the existing catalog (fingerprint + semantic match)
- New products appended to `catalog_items` with `source = "instagram"` / `"youtube"` etc.

---

## Data Flow

```
Google Sheet
     │
     ▼  Agent00
Normalized rows grouped by seller
     │
     ▼  Agent01 + SHIVA override
SellerRecord {
  company_profile: { name, address, phones, emails, website, social_urls }
  raw_products:    [ { name, price, photo_url, source_url } ]
}
     │
     ├──────────────────────────────────────────────┐
     ▼  Agent02 (sync)                              ▼  Agent07 (parallel)
  Company enrichment                          Social scraping
  Product classification (Agent03a)           Instagram / Facebook
  Product enrichment (Agent03)                YouTube / LinkedIn
  Vision analysis (Agent04)                        │
  Quality evaluation                               │
  Deduplication (Agent05)                          │
     │                                             │
     └──────────────────── await ─────────────────►│
                                                   ▼
                                          Social profiles + posts
                                          Agent08 vision on posts
                                               │
     ◄─────────────────────────────────────────┘
     │
     ▼  Reconciliation rules applied
catalog_<glid>.json {
  company_profile    — enriched from sheet + SHIVA + social + Sign3
  products[]         — enriched, classified, B2B-attributed
  catalog_items[]    — merged sheet + social products, reconciled
  media_assets[]     — vision analysis per product image
  rejected_items[]   — dropped products with rejection reason
  social_profiles[]  — Instagram, Facebook, YouTube, LinkedIn profiles
  reviews[]          — Google Business reviews
  reviews_summary    — rating, count, sentiment
}
```

---

## Reconciliation Rules

Applied in `write_to_catalog` before the final output is written:

| Rule                      | Trigger                                                    | Action                                             |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| **Rule 1: Type mismatch** | Vision says "ceramic tile", product name says "wall paint" | Move to `rejected_items`                           |
| **Rule 2: Spec mismatch** | Vision detects different color/material than listed specs  | Override specs from image, keep product            |
| **Rule 3: Vague name**    | Product name is generic ("Premium Quality Product")        | Replace name with image-derived name, keep product |

---

## External Services

| Service                     | Purpose                                                        | Used By          |
| --------------------------- | -------------------------------------------------------------- | ---------------- |
| **Google Gemini 2.5 Flash** | LLM reasoning, text generation, classification                 | All agents       |
| **Gemini Vision**           | Product image analysis, social post analysis                   | Agent04, Agent08 |
| **text-embedding-004**      | Semantic similarity for deduplication                          | Agent05          |
| **Apify**                   | Social media scraping (Instagram, Facebook, YouTube, LinkedIn) | Agent07          |
| **Sign3 Persona API**       | Phone number verification against company name                 | Agent02          |
| **Google Apps Script**      | Read raw rows from Google Sheets                               | Agent00          |
| **SerpAPI**                 | Google Business reviews fallback                               | Agent02          |
| **SHIVA Agent Data**        | Pre-enriched company data (GST, GMB, cross-platform URLs)      | Agent01          |

---

## Quality & Safety Mechanisms

**Confidence scoring** — every product carries `classification_confidence` and `extraction_confidence`. Products below threshold are flagged for human review, not silently dropped.

**Self-healing** — if a product enrichment call returns malformed output, the orchestrator retries with a corrected prompt (tracked via `self_healing_attempted` flag).

**Learned rules** — Agent06 continuously improves all agents by injecting data-driven corrections based on observed failures across runs.

**Sign3 phone verification** — validates seller phone numbers against company/owner name via fuzzy matching. Runs twice: once early (sheet phone), once after social enrichment (newly discovered phones).

**Audit trail** — every tool call, confidence score, retry, and decision is written to `audit_log.json` and a per-run structured log file.

**Human review queue** — products the pipeline is uncertain about land in `review_queue.json` with full context, not silently discarded.

---

## Pipeline Timing

| Step                                | Duration           | Parallel?                   |
| ----------------------------------- | ------------------ | --------------------------- |
| Input Intake (Agent00)              | ~15s               | No                          |
| Pivot + SHIVA (Agent01)             | ~15s               | No                          |
| Social scraping launch (Agent07)    | t=0, runs ~2–4 min | Yes — fully parallel        |
| Company enrichment                  | ~10s               | No                          |
| Sign3 (pass 1)                      | ~2s                | No                          |
| Product classification + enrichment | ~30–60s            | 5 products parallel         |
| Vision analysis (Agent04)           | ~30–50s            | 5 images parallel           |
| Quality evaluation + retry          | ~5s                | No                          |
| Deduplication (Agent05)             | ~60–90s            | No                          |
| Await social + Sign3 pass 2         | ~0s (already done) | —                           |
| Write catalog + reconciliation      | ~5s                | No                          |
| **Total**                           | **~3–6 min**       | Bottleneck: social scraping |

---

## Cost Per Seller (Typical)

| Service                    | Cost            |
| -------------------------- | --------------- |
| Gemini (tokens + vision)   | ~$0.01–0.025    |
| Apify (social scraping)    | ~$0.003–0.030   |
| SerpAPI (reviews)          | ~$0.020         |
| Sign3 (phone verification) | ~$0.005–0.015   |
| **Total**                  | **~$0.03–0.09** |

---

## Output Structure

```json
{
  "seller_id": 12345678,
  "company_profile": {
    "name": "Astila Ceramic Pvt Ltd",
    "business_type": "Tile Manufacturer",
    "address": "Morbi, Gujarat",
    "phones": ["9726424001"],
    "emails": ["export@astilaceramic.com"],
    "website": "https://astilaceramic.com",
    "instagram": "https://www.instagram.com/astilaceramic",
    "rating_value": 4.8,
    "rating_count": 124,
    "gst_number": "24XXXXX",
    "sign3_verified_phone": "9726424001",
    "data_sources": ["website", "instagram", "youtube", "google"]
  },
  "products": [ ...enriched products with B2B attributes... ],
  "catalog_items": [ ...merged sheet + social products, reconciled... ],
  "media_assets": [ ...vision analysis per image... ],
  "rejected_items": [ ...dropped products with rejection reason... ],
  "social_profiles": [ ...Instagram, Facebook, YouTube profiles... ],
  "reviews": [ ...Google Business reviews... ],
  "reviews_summary": { "rating": 4.8, "total_reviews": 124 }
}
```

---

## File Structure

```
server/catalogagent/
├── agents/
│   ├── agent00_inputIntake.js     — Sheet reader + column normalizer
│   ├── agent01_pivot.js           — Flat rows → SellerRecord
│   ├── agent02_orchestrator.js    — ReAct orchestrator + reconciliation
│   ├── agent03_product.js         — Product enrichment (batch)
│   ├── agent03a_category.js       — Category classification (agentic)
│   ├── agent04_media.js           — Vision analysis
│   ├── agent05_enrichDedup.js     — Dedup + B2B fill (agentic)
│   ├── agent06_reflection.js      — Rule learning (async)
│   ├── agent07_social.js          — Social media scraping (Apify)
│   └── agent08_socialVision.js    — Social post product extraction
├── tools/
│   └── shivaReader.js             — SHIVA JSON parser
├── data/
│   ├── catalog_<glid>.json        — Final catalog output
│   ├── seller_record_<glid>.json  — Pivot output (checkpoint)
│   ├── products_index_<glid>.json — Dedup index with embeddings
│   ├── learned_rules.json         — Agent06 generated rules
│   ├── audit_log.json             — Append-only run history
│   ├── review_queue.json          — Flagged products for humans
│   └── logs/pipeline_<glid>_<ts>.log
├── geminiAgent.js                 — Shared ReAct loop engine
├── pipeline.js                    — Top-level pipeline runner
├── logger.js                      — Structured logging
├── config.js                      — Model names, limits, paths
└── routes/index.js                — Express route handlers
```

---

_Built with Google Gemini 2.5 Flash · Apify · Sign3 · Node.js_

## GLID-based Seller Redirection Flow

The catalog now supports dynamic seller pages based on the URL path and Supabase-backed data.

- Route `/<glid>` loads the seller record from Supabase using the GLID in the URL.
- Route `/` loads the dashboard list from Supabase and shows all available catalogs.
- If no row exists for a GLID, the UI shows a "Page Doesn't Exist" state.

### Vercel Deployment Routing

Because this project uses client-side routing (`react-router-dom` with `BrowserRouter`), Vercel must rewrite all incoming paths to `index.html`.

- Added `vercel.json` with SPA rewrite from `/(.*)` to `/index.html`.
- This ensures direct URL access like `https://your-domain/<glid>` does not return server 404.
- React Router then resolves the route and the app fetches the matching Supabase row.

## How to Add a New Seller

1. Add a row to the `glid_data` table with the seller GLID and the catalog payload.
2. Open the app with `/<glid>` (example: `/12345`).
3. The app resolves and renders the matching seller profile automatically.

## Feedback Email Setup (EmailJS)

The catalog feedback widget can send feedback directly through EmailJS without opening any mail app.

1. Create a `.env` file at the project root by copying `.env.example`.
2. Fill in the values from your EmailJS dashboard:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
3. Optional: set `VITE_FEEDBACK_RECIPIENT_EMAIL`.
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
