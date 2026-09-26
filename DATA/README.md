# RetailAI Catalog Studio

RetailAI is a full-stack product-description workspace for the TCS Technology Day demo. It imports structured product data, generates reviewable product copy, tracks generation batches and scores, and exports a catalog. Mock AI is the default when no OpenAI key is configured, so the demo can run without calling an external AI service.

## Requirements

1. Install Node.js 20.9 or newer and Docker (Node.js 20.9+ is required by the selected Next.js 16 release).
2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create `.env` from `.env.example` and adjust values if needed.
5. Generate the Prisma client and apply the database schema:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. Seed the demo catalog (50 products) and built-in style profiles:

   ```bash
   npm run db:seed
   ```

7. Start the application:

   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000).

The Dashboard also includes **Load Demo Catalog**, which idempotently loads the synthetic products and style presets from `data/products.csv`.

## AI provider configuration

AI keys are used only by server-side code. Set `AI_PROVIDER` to:

- `auto` (default): use OpenAI when `OPENAI_API_KEY` is present, otherwise use Mock AI.
- `mock`: always use deterministic local Mock AI.
- `openai`: require `OPENAI_API_KEY` and use OpenAI.

Set `OPENAI_MODEL` to choose the model (default `gpt-4o-mini`). `GENERATION_CONCURRENCY` controls parallel batch jobs (default `3`, capped at 10). The app never returns the API key to the browser.

## Workflow

- Use Products to search the catalog, add products, and select items for bulk generation.
- Use Import to upload a CSV or JSON product array. CSV array fields use `|` separators; invalid rows are reported with row numbers. Uploads are limited to 5 MB.
- Use Generate to select products, style profile, and additional keywords. Each product is processed independently and job failures do not cancel other jobs.
- Review descriptions on product detail pages, edit copy, approve it, regenerate a new version, or copy it.
- Use Batches and Analytics to inspect recorded runs and heuristic scores.
- Export CSV or JSON from Products or the Import page.

## API overview

Product CRUD: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`; import: `POST /api/products/import`; export: `GET /api/products/export?format=csv|json`; generation: `POST /api/generate` and `POST /api/generate/batch`; history: `GET/PATCH /api/generations/:id`; style profiles: CRUD under `/api/style-profiles`; analytics: `GET /api/analytics`; status: `GET /api/health`; demo seed: `POST /api/demo`.

All API responses use `{ success, data }` or `{ success: false, error: { code, message, details } }` envelopes. Product and profile inputs are Zod validated.

## Scoring and safety

Quality, relevance, creativity, SEO, completeness, and consistency scores are deterministic 0–100 heuristics. SEO scores measure content signals and do not guarantee search rankings. Product attributes are treated as untrusted facts in the prompt builder; generation instructions prohibit invented product claims. CSV exports quote values and neutralize formula-leading content.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:watch
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Batch CSV processor

The independent Python CSV pipeline remains available as `python3 batch_processor.py`; details are in [BATCH_PROCESSING.md](./BATCH_PROCESSING.md). It writes to the same `data/generated_products.csv` format and does not call AI.
