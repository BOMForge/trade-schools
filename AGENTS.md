# Repository Guidelines

## Project Structure & Module Organization
- `src/` hosts the production frontend (map, admin, employer flows); adjust assets in `src/assets/js` and `src/assets/css` alongside the page consuming them.
- `functions/api/` contains Cloudflare Pages Functions in TypeScript; keep shared helpers near `schools/submit.ts` and reuse the D1 binding `DB` declared in `wrangler.toml`.
- `data/` holds CSV inputs and generated outputs (`production/` for live data, `raw/` for imports, `analysis/` for reports); avoid editing `production/` manually.
- `scripts/` stores Python utilities for enrichment and geocoding; manage dependencies with `pip install -r scripts/requirements.txt`.
- Decommissioned experiments live in `archive/`; reference before deleting related assets.

## Build, Test, and Development Commands
- `wrangler pages dev src/ --d1 DB=trade-schools-db --port 8080` launches a local preview wired to a D1 database.
- `wrangler d1 execute trade-schools-db --file=schema.sql` applies schema changes; pair with targeted selects during verification.
- `python scripts/geocode-missing.py` refreshes coordinates after data edits; other helpers reside in `scripts/`.
- `wrangler pages deploy src/ --project-name=trade-schools` publishes to Cloudflare Pages; CI in `.github/workflows/deploy.yml` mirrors this for pushes to `main`.

## Coding Style & Naming Conventions
- Follow existing indentation: TypeScript functions use 2-space blocks, legacy browser scripts in `src/assets/js` use 4 spaces.
- Use `camelCase` for variables, `PascalCase` for types/interfaces, and `UPPER_SNAKE_CASE` for shared constants.
- Prefer `const` and early returns for guards; keep validation logic co-located with schemas (see `functions/api/schools/submit.ts`).
- Static assets should remain ES5-compatible unless the target page imports modern bundles. Document any transpilation needs in the PR.

## Testing Guidelines
- Exercise user flows via `wrangler pages dev`, covering map tiles, accordion form validation, and employer submission.
- Hit APIs directly when altering backend validation: `curl -X POST http://localhost:8080/api/schools/submit ...` using fixtures from `SCHOOL_SUBMISSION_SETUP.md`.
- Inspect data changes with `wrangler d1 execute trade-schools-db --command="SELECT school_name, state FROM pending_schools ORDER BY submitted_at DESC LIMIT 5"`; purge test entries before merging.
- Record manual test notes in the PR description and attach updated CSV samples when datasets move between `raw/` and `production/`.

## Commit & Pull Request Guidelines
- Craft imperative commit titles similar to history (`Fix visualization modes`, optional emoji prefix for feature work) and keep scope focused.
- Squash noisy commits locally; explain data or schema adjustments in the body so reviewers understand downstream impacts.
- Pull requests should state purpose, test evidence, and deployment considerations; include screenshots or screencasts for UI touchpoints.
- Link related issues, request at least one reviewer, and confirm secrets or API keys never appear in diffs.

## Security & Configuration Tips
- Store credentials with `wrangler pages secret put`; never commit actual reCAPTCHA keys or Resend tokens.
- Update `wrangler.toml` with environment-specific `database_id` locally, and coordinate D1 migrations before production deploys.
- When sharing data extracts, scrub PII and keep sanitized copies under `data/raw/` rather than email threads.
