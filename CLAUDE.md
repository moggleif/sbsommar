# CLAUDE.md – SB Sommar Static Site

This document defines architectural rules and quality requirements.

The goal is a fast, maintainable, content-driven static site with light dynamic behavior.

Technology choices are not locked yet.
Architectural principles are.

---

# 0. Reference Documentation

Before writing any code, CSS, or data, read the relevant docs in `/docs/`.
These are the authoritative sources. CLAUDE.md summarises principles; the docs define detail.

| File | What it governs |
| ---- | --------------- |
| `docs/ARCHITECTURE.md` | System structure, data layers, rendering logic, fallback rules |
| `docs/DATA_CONTRACT.md` | YAML schema, required fields, validation rules, ID format |
| `docs/DESIGN.md` | Color palette, typography scale, spacing tokens, component rules |
| `docs/OPERATIONS.md` | Camp lifecycle: before/during/after, what is and is not version-controlled |
| `docs/EVENT_DATA_MODEL.md` | Event field definitions and constraints |
| `docs/EVENT_REQUIREMENTS.md` | Event display and behaviour requirements |

Rules:

- Do not invent colors, spacing, or layout patterns not present in `DESIGN.md`.
- Do not modify YAML files or the data schema without checking `DATA_CONTRACT.md` first.
- Do not change the camp lifecycle flow without checking `OPERATIONS.md` first.
- CSS must use the custom properties defined in `DESIGN.md §7` — do not hardcode design values.

---

# 1. Core Principles

- Static build output.
- No backend server.
- No client-side framework (no React, Vue, etc.).
- Minimal JavaScript.
- Content-first architecture.
- Clear separation of content, layout, and styling.
- Maintainable by non-developers.
- Fast loading.

Clarity over cleverness.

---

# 2. Architecture Constraints

The implementation must:

- Produce static HTML/CSS/JS as final output.
- Support Markdown-based content for main sections.
- Support structured data for events (single source of truth).
- Reuse layout components across pages.
- Avoid duplicating markup between pages.
- Avoid heavy runtime dependencies.

Do NOT:

- Build a SPA.
- Introduce a database.
- Use client-side rendering frameworks.
- Create custom complex build systems unless clearly justified.

Prefer standard, well-established static site tooling.

---

# 3. Content Model

Main page:

- Built from modular sections.
- Content written in Markdown.
- Sections can be reordered or edited without modifying layout code.

Special pages:

- Add Activity
- Weekly Schedule
- Today View
- Display Mode (dark)
- RSS Feed
- Archive pages (later)

All must share layout structure.

---

# 4. Event Data Rules

Event data must:

- Live in one central structured source.
- Power:
  - Weekly schedule
  - Daily schedule
  - Today view
  - RSS feed
  - Future archive pages

There must be:

- No duplicated event definitions.
- Deterministic sorting.
- Clear validation of required fields.

---

# 5. Quality Requirements (From Day One)

## Linting

- HTML validation
- CSS linting
- JS linting

Build must fail if lint fails.

## Data Validation

Event data must be validated for:

- Required fields
- Valid dates
- End time after start time
- No duplicate identifiers

## Build Integrity

The site must:

- Build locally.
- Build in GitHub Actions.
- Fail CI if build fails.

---

# 6. Local Development Requirements

Before merge:

- Build must run locally.
- Lint must pass.
- Validation must pass.

Optional but encouraged:

- Automated minimal tests for event sorting and date handling.
- Screenshot comparison tests for schedule pages.

---

# 7. Performance Requirements

- Minimal JS footprint.
- No unused CSS.
- No blocking large assets.
- Optimized images.
- No runtime hydration frameworks.

The site should feel instant.

---

# 8. Maintainability

Non-technical contributors must be able to:

- Edit text content in Markdown.
- Add new events via structured data.
- Add images.
- Without editing layout files.

---

# 9. Deployment

- Built output lives in /public.
- GitHub Actions builds and validates.
- Deployment happens only after successful CI.

---

# Final Rule

If something adds complexity without clear value, it should not be added.
