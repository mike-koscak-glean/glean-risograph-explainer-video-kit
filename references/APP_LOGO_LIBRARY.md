# Expanded App Logo Library

This kit includes an on-demand local app-logo library derived from the [`glean_logo_urls` spreadsheet](https://docs.google.com/spreadsheets/d/1_Y2pxl_OgSTS54j1unFKimIZNC-JIdfwXzCSISRWquQ/edit?gid=1229009384#gid=1229009384).

## Coverage

- Source inventory: `references/app-logo-assets.csv` with 207 asset rows.
- Preferred app-logo set: 180 unique filename stems. When the same stem has SVG and raster copies, SVG is preferred.
- Available locally: 179 app-logo entries.
  - 17 reuse files from the active `starter/public/logos/` set.
  - 162 live in `starter/public/logos/library/` for on-demand use.
- Unavailable: `rubrik-connector.svg` currently returns HTTP 404 and is recorded in `references/logo-library-unavailable.json`.
- Reference-only: 21 connector-doc relative paths, generic Feather icons, and other Glean UI icons remain in the CSV but are not copied into the app-logo library.

## Browse the library

From a generated project:

```bash
npm run dev
```

Open:

```text
http://localhost:5198/logos/library/
```

The local gallery supports search by key, filename, source, or storage location. It reads `public/logos/library/catalog.json` and does not load the assets until they become visible.

## Use a logo

Import the generated path map:

```ts
import { APP_LOGO_PATHS } from './logo-library';

const slackLogo = APP_LOGO_PATHS.slack;
const githubLogo = APP_LOGO_PATHS.github;
```

The expanded library is intentionally not added to `src/logos.ts` by default. Preloading every logo would slow the video preview and create unnecessary failure points. When a story needs a logo:

1. Find its key in the gallery or `src/logo-library.ts`.
2. Add only that key and path to `LOGO_URLS` in `src/logos.ts`.
3. Add a short fallback label to `LOGO_INITIAL`.
4. Record source and approval status in `project/brand.md`.
5. Render a contact sheet and verify crop, contrast, and readability.

## Refresh or validate

From the kit root:

```bash
npm run logos:sync
npm run logos:check
```

`logos:sync` reads the CSV, downloads only allowlisted `https://app.glean.com/images/logos/` assets, validates image signatures, rejects unsafe SVG content, writes SHA-256 hashes, updates the searchable gallery, and regenerates `starter/src/logo-library.ts`.

`logos:check` performs the same local validation without downloading missing files. Use `npm run logos:sync -- --force` to redownload library assets or `npm run logos:sync -- --prune` to remove unreferenced library files.

## Rights and safety

The spreadsheet and local catalog identify technical asset locations; they do not grant trademark or redistribution rights. Third-party marks remain owned by their respective companies. Confirm authorization and intended audience before using any customer or product logo. Do not hotlink logos in video rendering.
