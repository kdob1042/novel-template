# Repository working rules

## Purpose

This repository is a reusable starter kit for a Markdown novel and its Cloudflare reader.
It contains generic scaffolding only. Project-specific characters, plot facts, and prose
belong in the project created from this template.

## Source boundaries

- `manuscript/` is the current prose source. One episode is one Markdown file.
- `settings/` is the current story, writing, character, and publishing configuration.
- `manifest.json` is the authoritative reading order and source-path registry.
- `assets/` holds reusable visual assets; do not embed large binaries in Markdown.
- `dist/` is generated output. Never edit it directly.
- `archive/` and `revisions/` are historical records, not current source.
- `TODO.md` is the project setup checklist, not story canon.

## Editing

- Replace placeholders before public release.
- Preserve stable IDs and paths when changing prose.
- Keep personal information and project-specific facts out of the template itself.
- When changing the manifest shape, update `scripts/build-viewer.mjs` and tests together.
- Do not add secrets to the repository. Put deployment credentials in the external platform.

## Validation

Run:

```bash
npm run build
npm test
```

Open `dist/index.html` through a local HTTP server before publishing.

## Git flow

Use `dev` as the integration branch. Create a short-lived `feature/*`, `fix/*`,
or `docs/*` branch, open a PR into `dev`, then release `dev` into `main`.

