# Requirements Traceability Matrix – SB Sommar

## What is this document?

A requirements traceability matrix answers three questions for every requirement:

1. **Is it documented?** Where does the requirement come from?
2. **Is it implemented?** Which code makes it work?
3. **Is it verified?** Which test proves it works?

When a requirement has no test, it may be broken without anyone noticing.
When a requirement has no implementation, it is a gap — a feature that is missing.
This document makes those gaps visible so they can be planned and prioritised.

---

## How to read the columns

### ID

A short, stable reference you can use in issues, pull requests, and commit messages.

Format: `{doc}-§{section}.{counter}`

- `02` = the document the requirement comes from (`02-REQUIREMENTS.md`)
- `§4` = the section number inside that document
- `.2` = the second requirement extracted from that section

Examples:

- `02-§4.2` = second requirement from §4 of `02-REQUIREMENTS.md`
- `05-§4.1` = first requirement from §4 of `05-DATA_CONTRACT.md`
- `CL-§5.3` = third requirement from §5 of `CLAUDE.md`

The documents requirements are drawn from:

| Prefix | Document |
| --- | --- |
| `02` | `docs/02-REQUIREMENTS.md` — what the site must do and for whom |
| `05` | `docs/05-DATA_CONTRACT.md` — YAML schema and validation rules |
| `07` | `docs/07-DESIGN.md` — visual design, CSS tokens, accessibility |
| `CL` | `CLAUDE.md` — architectural constraints and quality requirements |

### Requirement

One sentence describing a single, testable thing the system must do.
"Single" matters — if a sentence could be split into two independently verifiable things, it should be.

### Doc Ref

This is **not** where the requirement is stated — it is where the *solution approach* is documented.
It points to the doc that tells a developer *how* to implement the requirement.

Example: the requirement "event date must fall within camp dates" comes from `02-REQUIREMENTS.md §9`,
but the implementation rules (date format, range check) are specified in `06-EVENT_DATA_MODEL.md §4`,
so that is the Doc Ref.

A `—` here means no implementation guidance has been written yet.
That is itself a gap worth noting.

### Test(s)

Short IDs that point to tests in the `tests/` directory.
The full mapping from ID to file and describe-suite is in the **Test ID Legend** at the bottom.

Examples:

- `VLD-04..11` = tests VLD-04 through VLD-11 in `tests/validate.test.js`
- `SNP-01` = first test in `tests/snapshot.test.js`

Tests are listed **before** Implementation to reflect the intended order of work:
write the test first, then write the code that makes it pass.

A `—` here means no automated test exists for this requirement.

### Implementation

The file(s) and function(s) in the codebase where the requirement is satisfied.
A `—` means nothing has been built yet.
Notes in parentheses explain partial or incorrect implementations.

### Status

| Value | Meaning |
| --- | --- |
| `covered` | Code exists **and** a test verifies it |
| `implemented` | Code exists, but no automated test |
| `gap` | The requirement has no implementation (and no test) |

`implemented` is not the same as `covered`. Code that is not tested may break silently.
Aim to move all `implemented` rows toward `covered` over time.

---

Audit date: 2026-02-23.

---

## Table

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§2.1` | Homepage exists and is served at `/` | 03-ARCHITECTURE.md §5, §6 | — | `source/build/render-index.js`, `source/build/build.js` → `public/index.html` | implemented |
| `02-§2.2` | Weekly schedule page exists at `/schema.html` | 03-ARCHITECTURE.md §5 | SNP-01 | `source/build/render.js`, `source/build/build.js` → `public/schema.html` | covered |
| `02-§2.3` | Daily view page at `/dagens-schema.html` allows navigation between days | 03-ARCHITECTURE.md §5 | — | — (page exists but shows today only in display mode; no day navigation) | gap |
| `02-§2.4` | Today/Display view at `/idag.html` uses dark background, large text, and no navigation | 03-ARCHITECTURE.md §3, 07-DESIGN.md §6 | — | — (URL mismatch: `idag.html` has standard layout; dark/no-nav view is at `dagens-schema.html`) | gap |
| `02-§2.5` | Add-activity form exists at `/lagg-till.html` | 03-ARCHITECTURE.md §3, §6 | — | `source/build/render-add.js`, `source/build/build.js` → `public/lagg-till.html` | implemented |
| `02-§2.6` | Archive page exists at `/arkiv.html` | 03-ARCHITECTURE.md §4 | — | — | gap |
| `02-§2.7` | RSS feed exists at `/schema.rss` | — (no implementation doc) | — | — | gap |
| `02-§2.8` | Homepage, schedule, add-activity, and archive pages share header and navigation | 03-ARCHITECTURE.md §6 | SNP-01 | `source/build/layout.js` – `pageNav()` | covered |
| `02-§2.9` | Today/Display view has no header or navigation | 03-ARCHITECTURE.md §3, 07-DESIGN.md §6 | — | `source/build/render-today.js` – no `pageNav()` call | implemented |
| `02-§3.1` | Homepage answers all pre-camp questions (what, who, when, cost, registration, lodging, rules, testimonials) | 03-ARCHITECTURE.md §5 | — | `source/build/render-index.js`, `source/content/*.md` sections | implemented |
| `02-§3.2` | Homepage includes a collapsible FAQ section | 03-ARCHITECTURE.md §5; `collapsible: true` in `sections.yaml` | RNI-22..28 | `source/build/render-index.js` – `convertMarkdown(…, collapsible: true)` | covered |
| `02-§3.3` | Homepage remains complete and usable even when no camp is active | 03-ARCHITECTURE.md §5 (Fallback rule) | — | `source/build/build.js` – falls back to most recent camp by `start_date` | implemented |
| `02-§3.4` | Schedule and add-activity links are prominent when a camp is active or upcoming | 03-ARCHITECTURE.md §3 | — | `source/build/layout.js` – nav always shows all links (not conditionally prominent based on camp state) | implemented |
| `02-§4.1` | Weekly schedule shows all activities for the full camp week, grouped by day | 03-ARCHITECTURE.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `renderSchedulePage()`, `groupAndSortEvents()` | covered |
| `02-§4.2` | Within each day, activities are listed in chronological order by start time | 03-ARCHITECTURE.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.3` | Each activity shows title, start time, end time (if set), location, and responsible person | 05-DATA_CONTRACT.md §2, §3 | RND-39..45 | `source/build/render.js` – `renderEventRow()` | covered |
| `02-§4.4` | Daily view allows the user to navigate between days | 03-ARCHITECTURE.md §5 | — | — | gap |
| `02-§4.5` | Today view (`/idag.html`) shows only today's activities in the standard site layout | 03-ARCHITECTURE.md §5 | — | `source/build/render-idag.js`, `source/assets/js/client/events-today.js` | implemented |
| `02-§4.6` | Today/Display view has dark background, large text, and minimal chrome; legible at a distance | 07-DESIGN.md §6 | — | `source/build/render-today.js` – `class="display-mode"`; `source/assets/cs/style.css` (at `/dagens-schema.html`, not `/idag.html` — see `02-§2.4`) | implemented |
| `02-§4.7` | Today/Display view requires no interaction; no day navigation controls | 03-ARCHITECTURE.md §3 | — | `source/build/render-today.js` – no day controls rendered | implemented |
| `02-§4.8` | Overlapping activities are allowed and the schedule remains readable | 03-ARCHITECTURE.md §5, 07-DESIGN.md §6 | — | No exclusion logic in `source/build/render.js`; CSS handles layout | implemented |
| `02-§4.9` | Clicking an activity opens its detail view | 03-ARCHITECTURE.md §5 | RND-41, RND-42 | `source/build/render.js` – `renderEventRow()` uses `<details>` element | covered |
| `02-§5.1` | Detail view shows all populated fields; fields with no value do not appear | 05-DATA_CONTRACT.md §2, §3 | RND-33..38, RND-43 | `source/build/render.js` – `eventExtraHtml()`, `renderEventRow()` | covered |
| `02-§6.1` | Form at `/lagg-till.html` accepts a new activity submission | 03-ARCHITECTURE.md §3 | — | `source/build/render-add.js` (HTML), `source/assets/js/client/lagg-till.js` (submit) | implemented |
| `02-§6.2` | Date field is constrained to the active camp's date range | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `min`/`max` attributes on date input | implemented |
| `02-§6.3` | Location field is a dropdown populated from `source/data/local.yaml` | 03-ARCHITECTURE.md §6 | — | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (renders `<select>`) | implemented |
| `02-§6.4` | Time fields guide the user toward a valid `HH:MM` value | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `type="time"` inputs (browser-native validation) | implemented |
| `02-§6.5` | Form errors are shown inline, per field, immediately on submit | 03-ARCHITECTURE.md §3 | — | — (`lagg-till.js` collects all errors into a single `#form-errors` div, not per-field) | gap |
| `02-§6.6` | Submit button is disabled and shows a visual indicator while submission is in progress | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true`; `textContent = 'Sparar...'` | implemented |
| `02-§6.7` | A clear success confirmation is shown after submission | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – reveals `#result` section with activity title | implemented |
| `02-§6.8` | Network failure shows a clear error and allows retry; submissions are never silently lost | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – `.catch()` re-enables button and shows error | implemented |
| `02-§7.1` | Only administrators can edit or remove activities (via YAML directly; no participant editing UI) | 04-OPERATIONS.md (Disaster Recovery) | — | No editing UI exists; enforced by absence, not access control | implemented |
| `02-§8.1` | Location names are consistent throughout the week; defined only in `source/data/local.yaml` | 03-ARCHITECTURE.md §6 | — | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (uses those names) | implemented |
| `02-§8.2` | One "Annat" option allows a free-text location not in the predefined list | 03-ARCHITECTURE.md §6 | — | `source/build/render-add.js` – "Annat" always appended last | implemented |
| `02-§9.1` | `title` is present and non-empty before form submission | 05-DATA_CONTRACT.md §3 | VLD-04..06 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.2` | `date` falls within the active camp's date range | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `min`/`max` (browser-enforced only; not in submit handler) | implemented |
| `02-§9.3` | `start` is in valid `HH:MM` format | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `type="time"` (browser-enforced only; not validated by server — see `05-§4.2`) | implemented |
| `02-§9.4` | `end`, if provided, is after `start` | 05-DATA_CONTRACT.md §4 | VLD-16..20 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.5` | `location` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-10 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.6` | `responsible` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-11 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§10.1` | All required fields are present and of correct type before any write begins | 03-ARCHITECTURE.md §3 | VLD-01..11 | `source/api/validate.js` – `validateEventRequest()`; `app.js` – returns HTTP 400 on failure | covered |
| `02-§10.2` | Only known fields are written to YAML; unknown POST body fields are silently ignored | 03-ARCHITECTURE.md §3, 05-DATA_CONTRACT.md §2 | GH-24..38 | `source/api/github.js` – `buildEventYaml()` constructs a fixed, explicit field set | covered |
| `02-§10.3` | String values are length-limited; extremely long strings are rejected | 03-ARCHITECTURE.md §3 | — | — (`source/api/validate.js` type-checks strings but has no max-length check) | gap |
| `02-§10.4` | User-provided strings are never directly interpolated into YAML; all quoting is handled by the serializer | 05-DATA_CONTRACT.md §8, 06-EVENT_DATA_MODEL.md §8 | GH-12..23, GH-38 | `source/api/github.js` – `yamlScalar()` | covered |
| `02-§10.5` | A validation failure results in an HTTP error response; nothing is committed to GitHub | 03-ARCHITECTURE.md §3 | VLD-01..26 (validate logic; no HTTP integration test) | `app.js` – `res.status(400)` before calling `addEventToActiveCamp` | covered |
| `02-§11.1` | Activities are always displayed in chronological order (by date, then start time) | 03-ARCHITECTURE.md §5 | RND-28..32, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§11.2` | Overlapping activities are allowed; the schedule must remain readable | 03-ARCHITECTURE.md §5, 07-DESIGN.md §6 | — | No exclusion logic in `source/build/render.js`; CSS handles layout | implemented |
| `02-§12.1` | A newly submitted activity appears in the live schedule within a few minutes | 03-ARCHITECTURE.md §3 (PR auto-merge → deploy pipeline) | — | `source/api/github.js` – `createPullRequest()`, `enableAutoMerge()` | implemented |
| `02-§12.2` | Admin corrections to YAML are reflected in all schedule views after the next build | 04-OPERATIONS.md (Disaster Recovery) | — | `source/build/build.js` – reads all YAML at build time | implemented |
| `02-§13.1` | Color contrast is at least 4.5:1 for body text | 07-DESIGN.md §9 | — | `source/assets/cs/style.css` – charcoal (`#3B3A38`) on cream (`#F5EEDF`) (passes WCAG AA; not verified programmatically) | implemented |
| `02-§13.2` | All interactive elements have visible focus states | 07-DESIGN.md §9 | — | — (explicit `:focus-visible` rules not confirmed in `style.css`) | gap |
| `02-§13.3` | Navigation is fully keyboard accessible | 07-DESIGN.md §9 | — | `source/build/layout.js` – `<nav>` and `<a>` elements; `source/build/render-add.js` – standard form controls (native keyboard) | implemented |
| `02-§13.4` | Images have descriptive `alt` text | 07-DESIGN.md §8 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt; `inlineHtml()` passes through alt | covered |
| `02-§13.5` | The add-activity form is fully usable without a mouse | 07-DESIGN.md §9 | — | `source/build/render-add.js` – all standard form controls (native keyboard) | implemented |
| `02-§13.6` | Accordion and expandable elements use proper ARIA attributes (`aria-expanded`, `aria-controls`) | 07-DESIGN.md §9 | — | `source/build/render.js` – `<details>/<summary>` used without explicit ARIA attributes | gap |
| `02-§14.1` | The site is written entirely in Swedish: all content, nav, labels, errors, confirmations, and alt text | 07-DESIGN.md §1 | — | All templates and client JS use Swedish text | implemented |
| `02-§15.1` | Activity schedule is available as an RSS feed at `/schema.rss` | — (no implementation doc) | — | — | gap |
| `02-§16.1` | Past camp data is never deleted; `archived: true` marks completed camps | 03-ARCHITECTURE.md §4 | — | `source/data/camps.yaml` – `archived` flag; no deletion logic exists | implemented |
| `02-§16.2` | Archive page lists all past camps and links to their schedules | 03-ARCHITECTURE.md §4 | — | — | gap |
| `02-§16.3` | When no camp is active, the most recent archived camp is shown by default | 03-ARCHITECTURE.md §5 (Fallback rule) | — | `source/build/build.js` – falls back to most recent by `start_date` (not filtered to `archived: true`) | implemented |
| `02-§17.1` | The site works well on mobile devices | 07-DESIGN.md §4, §5 | — | `source/assets/cs/style.css` – responsive layout, container widths, breakpoints | implemented |
| `02-§17.2` | The site requires no explanation; the schedule and add-activity form are self-evident | 07-DESIGN.md §1 | — | UX/design principle; assessed through usability review, not automatable | implemented |
| `05-§1.1` | Each `camps.yaml` entry includes all required fields: `id`, `name`, `start_date`, `end_date`, `file`, `active`, `archived` | 06-EVENT_DATA_MODEL.md §3, 03-ARCHITECTURE.md §2 | — | `source/build/build.js` reads and uses these fields; no build-time schema validator | implemented |
| `05-§1.2` | Exactly one camp may have `active: true` at a time | 03-ARCHITECTURE.md §2, 04-OPERATIONS.md | — | `source/api/github.js` – `addEventToActiveCamp()` rejects if `activeCamps.length ≠ 1` (checked at submit time only, not at build time) | implemented |
| `05-§1.3` | A camp with `active: true` must not also have `archived: true` | 03-ARCHITECTURE.md §2, 04-OPERATIONS.md | — | — | gap |
| `05-§3.1` | Each submitted event must include `id`, `title`, `date`, `start`, `location`, and `responsible` | 06-EVENT_DATA_MODEL.md §4, 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` (note: `id` is server-generated, not submitted as input) | covered |
| `05-§4.1` | Event `date` must fall within the camp's `start_date` and `end_date` (inclusive) | 06-EVENT_DATA_MODEL.md §4 | — | — (`source/api/validate.js` validates date format but not range against the active camp) | gap |
| `05-§4.2` | `start` must use 24-hour `HH:MM` format | 06-EVENT_DATA_MODEL.md §4 | VLD-08 (non-empty check only) | — (`source/api/validate.js` checks that `start` is non-empty; format not validated) | gap |
| `05-§4.3` | `end`, when present, must be after `start` | 06-EVENT_DATA_MODEL.md §4 | VLD-16..20 | `source/api/validate.js` – `end <= start` check | covered |
| `05-§5.1` | The combination of `(title + date + start)` must be unique within a camp file | 03-ARCHITECTURE.md §1 | — | — (no uniqueness check before committing) | gap |
| `05-§6.1` | Event `id` must be unique within the camp file | 06-EVENT_DATA_MODEL.md §4 | GH-01..11 (slugify determinism) | — (no uniqueness check against existing IDs; ID is deterministic but not verified) | gap |
| `05-§6.2` | Event `id` must be stable and not change after creation | 06-EVENT_DATA_MODEL.md §4 | — | `source/api/github.js` – deterministic `slugify(title)+date+start` on first write; no update path exists | implemented |
| `07-§7.1` | All CSS uses the custom properties defined at `:root`; no hardcoded colors, spacing, or typography | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – all values use `var(--…)` tokens (not enforced by a linter) | implemented |
| `07-§9.1` | Accordion items use `aria-expanded` and `aria-controls` ARIA attributes | 07-DESIGN.md §9 | — | `source/build/render.js` – `<details>/<summary>` without explicit `aria-expanded` or `aria-controls` | gap |
| `CL-§1.1` | Build output is static HTML/CSS/JS; no server is required to view pages | 03-ARCHITECTURE.md §7 | SNP-01 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§1.2` | No client-side rendering framework is used | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/` – plain vanilla JS only | implemented |
| `CL-§1.3` | Event data has a single source of truth | 03-ARCHITECTURE.md §1 | — | `source/data/*.yaml` files; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§4.1` | Main page sections are authored in Markdown | 03-ARCHITECTURE.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§5.1` | HTML validation runs in CI; build fails if HTML is invalid | 04-OPERATIONS.md (CI/CD Workflows) | — | — (no HTML linter configured; `ci.yml` runs ESLint and markdownlint only) | gap |
| `CL-§5.2` | CSS linting runs in CI; build fails if CSS is invalid | 04-OPERATIONS.md (CI/CD Workflows) | — | — (no CSS linter configured) | gap |
| `CL-§5.3` | JavaScript linting runs in CI; build fails if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – `npm run lint` (ESLint) | implemented |
| `CL-§5.4` | Event data is validated at build time for required fields, valid dates, and no duplicate identifiers | 04-OPERATIONS.md (Disaster Recovery); 05-DATA_CONTRACT.md §3–§6 | VLD-04..16 (server-side only) | — (validation only in API layer; manually edited YAML is not validated at build time) | gap |
| `CL-§9.1` | Built output lives in `/public` | 04-OPERATIONS.md (System Overview) | — | `source/build/build.js` – `OUTPUT_DIR = …/public` | implemented |
| `CL-§9.2` | GitHub Actions builds and validates; deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | implemented |

---

## Summary

```text
Total requirements:              84
Covered (implemented + tested):  21
Implemented, not tested:         43
Gap (no implementation):         20
Orphan tests (no requirement):    0
```

---

## Top Gaps — Prioritised Action List

### Critical — broken or missing user-facing features

1. **`02-§2.3` / `02-§4.4` — Daily view with day navigation** (`/dagens-schema.html`)
   The spec defines this page as a per-day schedule with forward/back navigation.
   The current page at this URL is the projector/display mode view (dark, QR code, no nav).
   No page exists that lets a user browse the schedule day by day.

2. **`02-§2.4` — URL and layout mismatch for Today/Display view** (`/idag.html`)
   The spec assigns the dark, no-nav display view to `/idag.html`.
   In the implementation: `/idag.html` has the standard layout with nav; the dark view is at `/dagens-schema.html`.
   The two pages need their URLs swapped, or the spec updated to match reality.

3. **`02-§6.5` — Per-field inline errors on form submit**
   `lagg-till.js` collects all validation messages into a single `#form-errors` block.
   The requirement is that each error appears inline next to the relevant field.

### High — missing whole features

4. **`02-§2.6` / `02-§16.2` — Archive page** (`/arkiv.html`)
   No page exists to browse past camps.

5. **`02-§2.7` / `02-§15.1` — RSS feed** (`/schema.rss`)
   No RSS feed is generated. No implementation guidance document exists for this feature.

6. **`02-§10.3` — String length limits in API validation**
   `validate.js` type-checks strings but sets no maximum length.
   Unbounded strings can be committed to the YAML file.

### Medium — data integrity

7. **`05-§4.1` — Event date must fall within camp dates (API server)**
   The API accepts any structurally valid `YYYY-MM-DD` date regardless of camp `start_date`/`end_date`.

8. **`05-§4.2` — `start` must be `HH:MM` format (API server)**
   `validate.js` checks that `start` is non-empty but not that it matches `HH:MM`.
   An invalid string (e.g. `"morning"`) passes validation and is written to YAML.

9. **`05-§5.1` — Duplicate event uniqueness not enforced**
   The `(title + date + start)` combination is never checked for uniqueness before committing.

10. **`05-§6.1` — Event ID uniqueness not enforced**
    Identical submissions produce identical IDs. No check is made against existing IDs in the file.

11. **`05-§1.3` — `active: true` and `archived: true` mutual exclusion**
    No code prevents a camp from being marked both active and archived.

12. **`CL-§5.4` — Build-time YAML data validation**
    Manually edited YAML bypasses all validation.

### Low — tooling and accessibility gaps

13. **`CL-§5.1` — HTML validation in CI**
    No HTML linter is configured; invalid HTML does not fail the build.

14. **`CL-§5.2` — CSS linting in CI**
    No CSS linter is configured.

15. **`02-§13.2` — Visible focus states**
    Explicit `:focus-visible` rules are not confirmed in `style.css`.

16. **`02-§13.6` / `07-§9.1` — Accordion ARIA attributes**
    `<details>/<summary>` is used without explicit `aria-expanded` or `aria-controls`.

---

## Test ID Legend

| ID range | File | `describe` suite |
| --- | --- | --- |
| VLD-01..03 | `tests/validate.test.js` | `validateEventRequest – body guard` |
| VLD-04..11 | `tests/validate.test.js` | `validateEventRequest – required fields` |
| VLD-12..15 | `tests/validate.test.js` | `validateEventRequest – date validation` |
| VLD-16..20 | `tests/validate.test.js` | `validateEventRequest – time ordering` |
| VLD-21..24 | `tests/validate.test.js` | `validateEventRequest – optional fields` |
| VLD-25..26 | `tests/validate.test.js` | `validateEventRequest – happy path` |
| GH-01..11 | `tests/github.test.js` | `slugify` |
| GH-12..23 | `tests/github.test.js` | `yamlScalar` |
| GH-24..38 | `tests/github.test.js` | `buildEventYaml` |
| RND-01..03 | `tests/render.test.js` | `toDateString` |
| RND-04..09 | `tests/render.test.js` | `escapeHtml` |
| RND-10..27 | `tests/render.test.js` | `formatDate` |
| RND-28..32 | `tests/render.test.js` | `groupAndSortEvents` |
| RND-33..38 | `tests/render.test.js` | `eventExtraHtml` |
| RND-39..45 | `tests/render.test.js` | `renderEventRow` |
| RNI-01..05 | `tests/render-index.test.js` | `convertMarkdown – inline Markdown` |
| RNI-06..16 | `tests/render-index.test.js` | `convertMarkdown – block types` |
| RNI-17..21 | `tests/render-index.test.js` | `convertMarkdown – headingOffset` |
| RNI-22..28 | `tests/render-index.test.js` | `convertMarkdown – collapsible mode` |
| RNI-29..33 | `tests/render-index.test.js` | `extractHeroImage` |
| RNI-34..38 | `tests/render-index.test.js` | `extractH1` |
| SNP-01..06 | `tests/snapshot.test.js` | `renderSchedulePage` |
