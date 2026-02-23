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
| `docs/01-CONTRIBUTORS.md` | Contribution guidelines, git workflow, setup, linting |
| `docs/02-REQUIREMENTS.md` | What the site must do and for whom — user, site, and API requirements |
| `docs/03-ARCHITECTURE.md` | System structure, data layers, rendering logic, fallback rules |
| `docs/04-OPERATIONS.md` | Camp lifecycle: before/during/after, deployment, disaster recovery |
| `docs/05-DATA_CONTRACT.md` | YAML schema, required fields, validation rules, ID format |
| `docs/06-EVENT_DATA_MODEL.md` | Why the event data is shaped the way it is — ownership, metadata, stability reasoning |
| `docs/07-DESIGN.md` | Color palette, typography scale, spacing tokens, component rules |

Rules:

- Do not invent colors, spacing, or layout patterns not present in `07-DESIGN.md`.
- Do not modify YAML files or the data schema without checking `05-DATA_CONTRACT.md` first.
- Do not change the camp lifecycle flow without checking `04-OPERATIONS.md` first.
- CSS must use the custom properties defined in `07-DESIGN.md §7` — do not hardcode colors, spacing, or typography values.

---

# 1. Core Principles

- Static build output. <!-- CL-§1.1 -->
- No backend server. <!-- CL-§1.2 -->
- No client-side framework (no React, Vue, etc.). <!-- CL-§1.3 -->
- Minimal JavaScript. <!-- CL-§1.4 -->
- Content-first architecture. <!-- CL-§1.5 -->
- Clear separation of content, layout, and styling. <!-- CL-§1.6 -->
- Maintainable by non-developers. <!-- CL-§1.7 -->
- Fast loading. <!-- CL-§1.8 -->

Clarity over cleverness. <!-- CL-§1.9 -->

---

# 2. Architecture Constraints

The implementation must:

- Produce static HTML/CSS/JS as final output. <!-- CL-§2.1 -->
- Support Markdown-based content for main sections. <!-- CL-§2.2 -->
- Support structured data for events (single source of truth). <!-- CL-§2.3 -->
- Reuse layout components across pages. <!-- CL-§2.4 -->
- Avoid duplicating markup between pages. <!-- CL-§2.5 -->
- Avoid heavy runtime dependencies. <!-- CL-§2.6 -->

Do NOT:

- Build a SPA. <!-- CL-§2.7 -->
- Introduce a database. <!-- CL-§2.8 -->
- Use client-side rendering frameworks. <!-- CL-§2.9 -->
- Create custom complex build systems unless clearly justified. <!-- CL-§2.10 -->

Prefer standard, well-established static site tooling. <!-- CL-§2.11 -->

---

# 3. Content Model

Main page:

- Built from modular sections. <!-- CL-§3.1 -->
- Content written in Markdown. <!-- CL-§3.2 -->
- Sections can be reordered or edited without modifying layout code. <!-- CL-§3.3 -->

Special pages:

- Add Activity
- Weekly Schedule
- Today View
- Display Mode (dark)
- RSS Feed
- Archive pages (later)

All must share layout structure. <!-- CL-§3.4 -->

---

# 4. Event Data Rules

Event data must:

- Live in one central structured source. <!-- CL-§4.1 -->
- Power: <!-- CL-§4.2 -->
  - Weekly schedule
  - Daily schedule
  - Today view
  - RSS feed
  - Future archive pages

There must be:

- No duplicated event definitions. <!-- CL-§4.3 -->
- Deterministic sorting. <!-- CL-§4.4 -->
- Clear validation of required fields. <!-- CL-§4.5 -->

---

# 5. Quality Requirements (From Day One)

## Linting

- HTML validation <!-- CL-§5.1 -->
- CSS linting <!-- CL-§5.2 -->
- JS linting <!-- CL-§5.3 -->

Build must fail if lint fails. <!-- CL-§5.4 -->

## Data Validation

Event data must be validated for: <!-- CL-§5.5 -->

- Required fields <!-- CL-§5.6 -->
- Valid dates <!-- CL-§5.7 -->
- End time after start time <!-- CL-§5.8 -->
- No duplicate identifiers <!-- CL-§5.9 -->

## Build Integrity

The site must:

- Build locally. <!-- CL-§5.10 -->
- Build in GitHub Actions. <!-- CL-§5.11 -->
- Fail CI if build fails. <!-- CL-§5.12 -->

---

# 6. Local Development Requirements

Before merge:

- Build must run locally. <!-- CL-§6.1 -->
- Lint must pass. <!-- CL-§6.2 -->
- Validation must pass. <!-- CL-§6.3 -->

Optional but encouraged:

- Automated minimal tests for event sorting and date handling. <!-- CL-§6.4 -->
- Screenshot comparison tests for schedule pages. <!-- CL-§6.5 -->

---

# 7. Performance Requirements

- Minimal JS footprint. <!-- CL-§7.1 -->
- No unused CSS. <!-- CL-§7.2 -->
- No blocking large assets. <!-- CL-§7.3 -->
- Optimized images. <!-- CL-§7.4 -->
- No runtime hydration frameworks. <!-- CL-§7.5 -->

The site should feel instant. <!-- CL-§7.6 -->

---

# 8. Maintainability

Non-technical contributors must be able to:

- Edit text content in Markdown. <!-- CL-§8.1 -->
- Add new events via structured data. <!-- CL-§8.2 -->
- Add images. <!-- CL-§8.3 -->
- Without editing layout files. <!-- CL-§8.4 -->

---

# 9. Deployment

- Built output lives in /public. <!-- CL-§9.1 -->
- GitHub Actions builds and validates. <!-- CL-§9.2 -->
- Deployment happens only after successful CI. <!-- CL-§9.3 -->

---

# 10. Git Workflow

- Never push directly to `main`. <!-- CL-§10.1 -->
- At the start of every session — before writing any code or making any changes — run: <!-- CL-§10.2 -->

  ```bash
  git checkout main
  git pull
  git checkout -b branch-name
  ```

- Choose a descriptive branch name (e.g. `fix/schedule-sort`, `feature/today-view`, `docs/update-contract`). <!-- CL-§10.3 -->
- After a branch has been merged and the merge has been pulled back via `main`, delete the local branch. <!-- CL-§10.4 -->

---

# Final Rule

If something adds complexity without clear value, it should not be added.
