# Logo References and Usage

## What is included

- `starter/public/logos/` contains the small active SVG set used by the sanitized sample engine.
- `starter/public/logos/library/` contains the expanded on-demand app-logo library.
- `starter/public/logos/library/catalog.json` records key, path, source URL, provenance, byte size, and SHA-256 hash.
- `starter/public/logos/library/index.html` provides a searchable local gallery.
- `starter/src/logo-library.ts` provides typed paths for every available app-logo entry.
- `references/app-logo-assets.csv` preserves the complete source spreadsheet inventory.
- `references/logo-urls.txt` is the older mixed URL inventory retained for historical reference.

See [APP_LOGO_LIBRARY.md](APP_LOGO_LIBRARY.md) for coverage, browsing, sync commands, and the unavailable-asset report.

## Why logos are local

Remote images can fail, change, require authentication, or taint the canvas and prevent frame extraction. Use approved local assets during rendering. Do not hotlink logos in the video engine.

## Choosing and activating a logo

1. Search the local gallery at `/logos/library/` while `npm run dev` is running.
2. Import the path from `src/logo-library.ts`.
3. Add only the selected logo to `LOGO_URLS` and `LOGO_INITIAL` in `src/logos.ts`.
4. Record source and approval status in `project/brand.md`.
5. Inspect the file for crop, contrast, and readable detail at video scale.
6. Render a contact sheet on paper, blue, and halftone backgrounds.

Do not add the complete expanded library to `LOGO_URLS`; that map preloads every entry.

## Adding a new source asset

1. Add its source row to `references/app-logo-assets.csv`.
2. Use an approved SVG or high-resolution PNG/JPEG from an authorized source.
3. Remove tracking parameters and private query strings.
4. Run `npm run logos:sync`.
5. Review any rejection in `references/logo-library-unavailable.json` rather than bypassing validation.
6. Run `npm run logos:check` and `npm run build`.

The sync tool accepts only canonical `app.glean.com/images/logos/` HTTPS URLs for automatic download. Relative documentation paths, generic UI icons, signed URLs, and other hosts remain reference-only until explicitly reviewed.

## Important restrictions

- The inventories identify asset locations; they are not proof of redistribution rights.
- Customer logos require explicit approval for the intended audience.
- Third-party product marks remain owned by their respective companies.
- Glean-hosted URLs can change or become unavailable.
- Do not publish customer marks, signed URLs, or private source material.

For internal reuse, a private repository remains the safest default.
