# Logo References and Usage

## What is included

- `starter/public/logos/` contains local SVG assets used by the sanitized sample engine.
- `references/logo-urls.txt` is the original URL list supplied for logo and interface-image reference.
- `starter/src/logos.ts` maps logical logo keys to local files.

## Why logos are local

Remote images can fail, change, require authentication, or taint the canvas and prevent frame extraction. Download approved assets once, inspect them, and render from `public/logos/`.

## Adding a logo

1. Obtain an approved SVG or high-resolution PNG from an authorized source.
2. Remove tracking parameters and private query strings from any recorded source URL.
3. Inspect the SVG for scripts, embedded remote resources, and excessive whitespace.
4. Crop or correct the `viewBox` so the mark fills its intended disc or card.
5. Save it in `public/logos/` with a stable lowercase name.
6. Add the key and fallback initials to `src/logos.ts`.
7. Add the source and approval status to `project/brand.md`.
8. Render a contact sheet and verify legibility on paper, blue, and halftone backgrounds.

## Important restrictions

- The URL list is a reference inventory, not proof of redistribution rights.
- Customer logos require explicit approval for the intended audience.
- Third-party product marks remain owned by their respective companies.
- Glean-hosted URLs can be internal, authenticated, or temporary.
- Do not publish a public GitHub repository containing marks until brand/legal review is complete.
- Do not hotlink assets in the renderer.

For internal reuse, a private repository is the safest default.
