# Contributing to SB Sommar

This document explains how to contribute to this project.

There are two types of contributors: **content editors** and **developers**.
Most contributions are content edits and require no programming knowledge.

---

## Content Editors

Content editors update Markdown files and YAML data files.
No build tools or technical setup needed.

### Editing Page Content

Page content lives in the `content/` directory as Markdown files.

Each file corresponds to a section of the site:

- `content/index.md` — front page
- `content/faq.md` — frequently asked questions
- `content/registration.md` — registration information
- `content/pricing.md` — pricing
- `content/food.md` — food and meals
- `content/rules.md` — camp rules
- `content/activities.md` — activities overview
- `content/local-info.md` — practical local information
- `content/discord-guide.md` — Discord guide
- `content/how-it-started.md` — background story
- `content/testimonials.md` — participant testimonials

Edit these files directly. Layout is handled separately and does not need to change.

### Adding or Editing Events

Event data lives in `/data/`.

The active camp's events are in `current.yaml` during camp week.
Historical camps are stored as individual YAML files (e.g. `2025-06-syssleback.yaml`).

See [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md) for the full data structure.
See [docs/OPERATIONS.md](docs/OPERATIONS.md) for the operational workflow.

### Rules for Content Edits

- Write in Swedish unless the content is explicitly multilingual.
- Do not edit layout or template files.
- Do not modify files in `docs/` unless you are updating process documentation.
- Follow the Markdown formatting rules (a linter will check automatically on commit).

---

## Developers

Developers make changes to templates, build tooling, or project infrastructure.

### Setup

Requirements:

- [Node.js](https://nodejs.org/) (for dev tooling)
- Git

Install dev dependencies:

```bash
npm install
```

This also installs the pre-commit hook automatically via Husky.

### Pre-commit Hook

Every commit runs `markdownlint` on all Markdown files automatically.
If the lint check fails, the commit is blocked until the issue is fixed.

To run the check manually:

```bash
npm run lint:md
```

### Linting Rules

Linting is configured in [.markdownlint.json](.markdownlint.json).

Disabled rules and the reasons:

| Rule | Reason |
|------|--------|
| MD013 | Line length is not enforced — content editors should not worry about it |
| MD025 | Numbered `# 1.` section headings are used intentionally in documentation |
| MD029 | Ordered lists interrupted by code blocks or content are acceptable |
| MD033 | Inline HTML is allowed where needed |
| MD042 | Empty `(#)` placeholder links are acceptable during development |

### Architecture

Before making structural changes, read:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md)
- [CLAUDE.md](CLAUDE.md)

### Core Constraints

- Static output only. No backend, no database.
- No client-side frameworks (React, Vue, etc.).
- Minimal JavaScript.
- Build must pass before merge.
- Lint must pass before merge.

---

## Questions

If something is unclear, open an issue or contact the maintainers directly.
