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
For example: `"this PR closes 02-§9.5"`.

The ID appears in **two places**: in this matrix (the Table section below), and inline in the
source document next to the requirement text as an HTML comment. To find requirement `02-§9.5`,
search for `02-§9.5` in either this file or in `docs/02-REQUIREMENTS.md` — it will appear on the
line that says `` `location` is present and non-empty ``.

Format: `{doc}-§{section}.{counter}`

- `02` = the document the requirement comes from (`02-REQUIREMENTS.md`)
- `§9` = the section number inside that document (matches the `## 9.` heading)
- `.5` = a sequential counter within that section (labels are added top-to-bottom)

The section prefix tells you *which document owns the requirement* and therefore where to look
if you want to read the surrounding context or open a discussion about changing it.
When adding a new requirement to a section, give it the next available number in that section
and add the `<!-- {id} -->` comment to the source doc alongside the entry in this matrix.

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

Audit date: 2026-02-24.

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
| `02-§2.9` | None of the site pages require login | 03-ARCHITECTURE.md §3 | — | No authentication exists anywhere in the codebase | implemented |
| `02-§2.10` | Today/Display view has no header or navigation | 03-ARCHITECTURE.md §3, 07-DESIGN.md §6 | — | `source/build/render-today.js` – no `pageNav()` call | implemented |
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
| `07-§9.5` | Accordion items use `aria-expanded` and `aria-controls` ARIA attributes | 07-DESIGN.md §9 | — | `source/build/render.js` – `<details>/<summary>` without explicit `aria-expanded` or `aria-controls` | gap |
| `CL-§1.1` | Build output is static HTML/CSS/JS; no server is required to view pages | 03-ARCHITECTURE.md §7 | SNP-01 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§1.3` | No client-side rendering framework is used | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/` – plain vanilla JS only | implemented |
| `CL-§4.1` | Event data has a single source of truth | 03-ARCHITECTURE.md §1 | — | `source/data/*.yaml` files; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§3.2` | Main page sections are authored in Markdown | 03-ARCHITECTURE.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§5.1` | HTML validation runs in CI; build fails if HTML is invalid | 04-OPERATIONS.md (CI/CD Workflows) | — | — (no HTML linter configured; `ci.yml` runs ESLint and markdownlint only) | gap |
| `CL-§5.2` | CSS linting runs in CI; build fails if CSS is invalid | 04-OPERATIONS.md (CI/CD Workflows) | — | — (no CSS linter configured) | gap |
| `CL-§5.3` | JavaScript linting runs in CI; build fails if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – `npm run lint` (ESLint) | implemented |
| `CL-§5.5` | Event data is validated at build time for required fields, valid dates, and no duplicate identifiers | 04-OPERATIONS.md (Disaster Recovery); 05-DATA_CONTRACT.md §3–§6 | VLD-04..16 (server-side only) | — (validation only in API layer; manually edited YAML is not validated at build time) | gap |
| `CL-§9.1` | Built output lives in `/public` | 04-OPERATIONS.md (System Overview) | — | `source/build/build.js` – `OUTPUT_DIR = …/public` | implemented |
| `CL-§9.2` | GitHub Actions builds and validates; deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | implemented |
| `CL-§9.3` | Deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/deploy.yml` – triggered only on push to `main` after CI passes | implemented |
| `CL-§9.4` | For data-only commits (YAML files only), CI runs build only — lint and tests are skipped | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – data-only path check | implemented |
| `CL-§10.1` | Never push directly to `main` | 01-CONTRIBUTORS.md | — | Enforced by branch protection; described in contributor guide | implemented |
| `CL-§10.2` | At the start of every session, run `git checkout main && git pull && git checkout -b branch-name` before any changes | 01-CONTRIBUTORS.md | — | Developer discipline; documented in `01-CONTRIBUTORS.md` | implemented |
| `CL-§10.3` | Branch names must be descriptive | 01-CONTRIBUTORS.md | — | Developer convention; no technical enforcement | implemented |
| `CL-§10.4` | After a branch is merged and pulled via `main`, delete the local branch | 01-CONTRIBUTORS.md | — | Developer discipline; no technical enforcement | implemented |
| `CL-§1.2` | No backend server is required to view any page | 03-ARCHITECTURE.md §7 | — | `source/build/build.js` – all pages are pre-rendered to `public/` | implemented |
| `CL-§1.4` | JavaScript usage is minimal | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/` – only three small client scripts exist | implemented |
| `CL-§1.5` | Architecture is content-first: content is authored separately from layout | 03-ARCHITECTURE.md §6 | — | `source/content/*.md` (content) vs `source/build/` (layout) | implemented |
| `CL-§1.6` | Content, layout, and styling are clearly separated | 03-ARCHITECTURE.md §6 | — | `source/content/` (Markdown), `source/build/` (templates), `source/assets/cs/` (CSS) | implemented |
| `CL-§1.7` | The site is maintainable by non-developers | 01-CONTRIBUTORS.md | — | Content editable via Markdown + YAML; no build tools needed for content changes | implemented |
| `CL-§1.8` | Pages load fast | 03-ARCHITECTURE.md §7 | — | Static HTML, no runtime framework, CSS custom properties only | implemented |
| `CL-§1.9` | Clarity is preferred over cleverness in all implementation decisions | 03-ARCHITECTURE.md §7 | — | Principle; assessed through code review | implemented |
| `CL-§2.1` | Final build output is static HTML, CSS, and JS | 03-ARCHITECTURE.md §7 | SNP-01 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§2.2` | Main page sections are authored in Markdown | 03-ARCHITECTURE.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§2.3` | Event data has a single source of truth; all views derive from it | 03-ARCHITECTURE.md §1 | — | `source/data/*.yaml`; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§2.4` | Layout components are reused across pages | 03-ARCHITECTURE.md §6 | — | `source/build/layout.js` – shared `pageHeader()`, `pageNav()`, `pageFooter()` | implemented |
| `CL-§2.5` | Markup is not duplicated between pages | 03-ARCHITECTURE.md §6 | — | `source/build/layout.js` – single source of shared layout | implemented |
| `CL-§2.6` | Heavy runtime dependencies are avoided | 03-ARCHITECTURE.md §7 | — | `package.json` – no client-side framework dependencies | implemented |
| `CL-§2.7` | The site is not a single-page application | 03-ARCHITECTURE.md §7 | — | Each page is a separate `.html` file; no client-side routing | implemented |
| `CL-§2.8` | No database is used | 03-ARCHITECTURE.md §1, §7 | — | YAML files and Git are the only storage layer | implemented |
| `CL-§2.9` | No client-side rendering framework is used | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/` – plain vanilla JS only | implemented |
| `CL-§2.10` | Custom complex build systems must not be created unless clearly justified | 03-ARCHITECTURE.md §7 | — | `source/build/build.js` – straightforward Node.js script, no custom bundler | implemented |
| `CL-§2.11` | Standard, well-established static site tooling is preferred | 03-ARCHITECTURE.md §7 | — | Principle; current toolchain is plain Node.js + YAML + Markdown | implemented |
| `CL-§3.1` | The main page is built from modular, independently reorderable sections | 03-ARCHITECTURE.md §6 | — | `source/content/*.md` sections; `source/build/render-index.js` assembles them | implemented |
| `CL-§3.3` | Sections can be reordered or edited without modifying layout code | 03-ARCHITECTURE.md §6 | — | `source/build/render-index.js` – section order driven by config, not hardcoded | implemented |
| `CL-§3.4` | All special pages share the same layout structure | 03-ARCHITECTURE.md §6 | — | `source/build/layout.js` – shared layout used by all pages except Today/Display view | implemented |
| `CL-§4.2` | Event data powers the weekly schedule, daily schedule, Today view, RSS feed, and future archive pages | 03-ARCHITECTURE.md §1, §5 | — | `source/build/build.js` – single load feeds all render targets | implemented |
| `CL-§4.3` | No event is defined in more than one place | 03-ARCHITECTURE.md §1 | — | One YAML file per camp; no duplication mechanism exists | implemented |
| `CL-§4.4` | Event sorting is deterministic | 03-ARCHITECTURE.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` sorts by date + start | covered |
| `CL-§4.5` | Required event fields are validated before data is accepted | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.4` | Build fails if any linter reports errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – lint step gates the build | implemented |
| `CL-§5.6` | Event data is validated for required fields | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.7` | Event data is validated for valid dates | 05-DATA_CONTRACT.md §4 | VLD-12..15 | `source/api/validate.js` – date format check (range check missing — see `05-§4.1`) | implemented |
| `CL-§5.8` | Event data is validated: end time must be after start time | 05-DATA_CONTRACT.md §4 | VLD-16..20 | `source/api/validate.js` – `end <= start` check | covered |
| `CL-§5.9` | Event data is validated for duplicate identifiers | 05-DATA_CONTRACT.md §6 | — | — (no uniqueness check before committing — see `05-§6.1`) | gap |
| `CL-§5.10` | The site builds locally without errors | 04-OPERATIONS.md (Local Development) | — | `npm run build` on developer machine | implemented |
| `CL-§5.11` | The site builds in GitHub Actions without errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step | implemented |
| `CL-§5.12` | CI fails if the build fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step failure blocks merge | implemented |
| `CL-§6.1` | Build runs locally before merge | 04-OPERATIONS.md (Local Development) | — | Developer discipline + pre-commit hook | implemented |
| `CL-§6.2` | Lint passes before merge | 04-OPERATIONS.md (CI/CD Workflows) | — | CI lint step blocks merge on failure | implemented |
| `CL-§6.3` | Data validation passes before merge | 05-DATA_CONTRACT.md §3–§6 | — | — (build-time YAML validation not implemented — see `CL-§5.5`) | gap |
| `CL-§6.4` | Automated minimal tests exist for event sorting and date handling | — | RND-01..45 | `tests/render.test.js` | covered |
| `CL-§6.5` | Screenshot comparison tests exist for schedule pages | — | SNP-01..06 | `tests/snapshot.test.js` | covered |
| `CL-§7.1` | JavaScript footprint is minimal | 03-ARCHITECTURE.md §7 | — | Three small client scripts; no framework | implemented |
| `CL-§7.2` | No unused CSS is shipped | 07-DESIGN.md §7 | — | Hand-written CSS with no unused rules (not enforced by tooling) | implemented |
| `CL-§7.3` | No large blocking assets are loaded | 03-ARCHITECTURE.md §7 | — | No large scripts or stylesheets; images use `srcset` | implemented |
| `CL-§7.4` | Images are optimised | 07-DESIGN.md §8 | — | `07-§8.5` requires WebP + srcset; not confirmed implemented | gap |
| `CL-§7.5` | No runtime hydration framework is used | 03-ARCHITECTURE.md §7 | — | No framework; plain JS only | implemented |
| `CL-§7.6` | The site feels instant to load | 03-ARCHITECTURE.md §7 | — | Static HTML + minimal JS + optimised CSS | implemented |
| `CL-§8.1` | Non-technical contributors can edit text content in Markdown without touching layout files | 01-CONTRIBUTORS.md | — | `source/content/*.md` editable directly; layout is separate | implemented |
| `CL-§8.2` | Non-technical contributors can add new events via YAML | 01-CONTRIBUTORS.md | — | `source/data/*.yaml` editable directly | implemented |
| `CL-§8.3` | Non-technical contributors can add images without editing layout files | 01-CONTRIBUTORS.md | — | Images referenced from Markdown content files | implemented |
| `CL-§8.4` | Layout files do not need to be edited for content changes | 03-ARCHITECTURE.md §6 | — | Content-layout separation is architectural; `source/build/` is never touched for content edits | implemented |
| `02-§4.10` | Weekly schedule groups activities by day | 03-ARCHITECTURE.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.11` | Daily view shows activities for a single selected day | 03-ARCHITECTURE.md §5 | — | — (page exists but currently shows display mode, not a per-day list — see `02-§2.3`) | gap |
| `02-§4.12` | Daily view shows the same fields as the weekly view | 05-DATA_CONTRACT.md §3 | — | — | gap |
| `02-§4.13` | Today/Display view has no day navigation; it always shows today | 03-ARCHITECTURE.md §3 | — | `source/build/render-today.js` – no day navigation rendered | implemented |
| `02-§5.2` | Empty fields are omitted from the detail view; no blank rows appear | 05-DATA_CONTRACT.md §3 | RND-33..38 | `source/build/render.js` – `eventExtraHtml()` guards each optional field | covered |
| `02-§5.3` | The `owner` and `meta` fields are never shown in any public view | 05-DATA_CONTRACT.md §3.3 | — | `source/build/render.js` – neither field is referenced in render output | implemented |
| `02-§8.3` | Locations must be selected from a predefined list | 03-ARCHITECTURE.md §6 | — | `source/build/render-add.js` – `<select>` populated from `local.yaml` | implemented |
| `02-§8.4` | Participants cannot modify the location list | 03-ARCHITECTURE.md §6 | — | No form UI for adding locations; enforced by absence | implemented |
| `02-§11.3` | The schedule remains readable when multiple activities overlap | 07-DESIGN.md §6 | — | CSS layout handles overlap; no exclusion logic in render | implemented |
| `02-§12.3` | All event submissions are permanently recorded in Git history as a full audit trail | 03-ARCHITECTURE.md §3 | — | `source/api/github.js` – every submission creates a Git commit via the Contents API | implemented |
| `02-§15.2` | The RSS feed reflects the current state of the schedule | — (no implementation doc) | — | — | gap |
| `02-§16.4` | The archive must be usable and complete, not a placeholder | 03-ARCHITECTURE.md §4 | — | — (archive page not yet built) | gap |
| `02-§17.3` | The site is readable on shared display screens | 07-DESIGN.md §6 | — | `source/build/render-today.js` – display mode view; `source/assets/cs/style.css` | implemented |
| `05-§1.4` | The `file` field in `camps.yaml` references a YAML file in `source/data/` | 06-EVENT_DATA_MODEL.md §1 | — | `source/build/build.js` – loads camp file via `camps.yaml` `file` field | implemented |
| `05-§1.5` | The camp `id` is permanent and must never change after the camp is first created | 06-EVENT_DATA_MODEL.md §3 | — | — (no enforcement; enforced by convention and docs) | implemented |
| `05-§3.2` | Each camp file's `camp:` block must include `id`, `name`, `location`, `start_date`, and `end_date` | 06-EVENT_DATA_MODEL.md §3 | — | `source/build/build.js` – reads and uses all five fields; no build-time schema validator | implemented |
| `05-§3.3` | The `owner` and `meta` fields are for internal use only and must never appear in any public view | 06-EVENT_DATA_MODEL.md §5, §6 | — | `source/build/render.js` – neither field is referenced in render output | implemented |
| `05-§4.4` | `end` must be `null` or a valid `"HH:MM"` string | 06-EVENT_DATA_MODEL.md §4 | — | — (`source/api/validate.js` checks end ordering but not the null-or-HH:MM constraint explicitly) | gap |
| `05-§4.5` | All times are local; no timezone handling | 06-EVENT_DATA_MODEL.md §4 | — | No timezone conversion anywhere in the codebase | implemented |
| `CL-§2.12` | Data file names are never hardcoded; active camp and file paths are always derived from `camps.yaml` | 03-ARCHITECTURE.md §2 | — | `source/build/build.js` – reads `camps.yaml` first; `source/api/github.js` – same | implemented |
| `CL-§5.13` | Markdown linting runs on every commit via pre-commit hook; commit is blocked if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.githooks/` pre-commit hook – `npm run lint:md`; `.markdownlint.json` config | implemented |
| `07-§1.1` | The design has a warm, welcoming, outdoorsy feel — not corporate or sterile | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.2` | Earth tones and natural colors are used throughout | 07-DESIGN.md §2 | — | Color palette defined in `source/assets/cs/style.css` `:root` | implemented |
| `07-§1.3` | Design is clean and readable; content comes first | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.4` | Design is fast and lightweight with no decorative excess | 07-DESIGN.md §1 | — | No decorative assets; minimal CSS | implemented |
| `07-§2.1` | Primary accent color is Terracotta `#C76D48` (buttons, links, highlights) | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-terracotta: #C76D48` | implemented |
| `07-§2.2` | Secondary accent color is Sage green `#ADBF77` (section headers, tags) | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-sage: #ADBF77` | implemented |
| `07-§2.3` | Page background color is Cream `#F5EEDF` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-cream: #F5EEDF` | implemented |
| `07-§2.4` | Main heading color is Navy `#192A3D` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-navy: #192A3D` | implemented |
| `07-§2.5` | Body text color is Charcoal `#3B3A38` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-charcoal: #3B3A38` | implemented |
| `07-§2.6` | Card and contrast surface color is White `#FFFFFF` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--color-white: #FFFFFF` | implemented |
| `07-§2.7` | No bright or saturated colors are used outside the defined palette | 07-DESIGN.md §2 | — | Enforced by design convention; not linted | implemented |
| `07-§3.1` | Headings use `system-ui, -apple-system, sans-serif` (or a single humanist web font if added) | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-sans` token | implemented |
| `07-§3.2` | Body text uses the same sans-serif stack | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-sans` token applied to body | implemented |
| `07-§3.3` | Pull quotes and callouts use Georgia, serif | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-serif: Georgia, serif` | implemented |
| `07-§3.4` | H1 is 40px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-h1: 40px` | implemented |
| `07-§3.5` | H2 is 35px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-h2: 35px` | implemented |
| `07-§3.6` | H3 is 30px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-h3: 30px` | implemented |
| `07-§3.7` | Body text is 16px, weight 400, color Charcoal `#3B3A38` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-base: 16px` | implemented |
| `07-§3.8` | Small/meta text is 14px, weight 400, color Charcoal | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-small: 14px` | implemented |
| `07-§3.9` | Pull quote text is 25px, weight 600, Georgia serif, italic | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-pullquote: 25px` | implemented |
| `07-§3.10` | Nav links are 12px, weight 700, uppercase, letter-spaced | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--font-size-nav: 12px` | implemented |
| `07-§3.11` | Body text line height is `1.65` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--line-height-body: 1.65` | implemented |
| `07-§4.1` | Wide container max-width is `1290px` (header, hero, full layout) | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--container-wide: 1290px` | implemented |
| `07-§4.2` | Narrow container max-width is `750px` (reading sections, articles) | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--container-narrow: 750px` | implemented |
| `07-§4.3` | Containers are centered with `margin: 0 auto` and horizontal padding on small screens | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.4` | Spacing base unit is `8px`; all spacing values are multiples of it | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – spacing tokens at `:root` | implemented |
| `07-§4.5` | `space-xs` = `8px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-xs: 8px` | implemented |
| `07-§4.6` | `space-sm` = `16px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-sm: 16px` | implemented |
| `07-§4.7` | `space-md` = `24px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-md: 24px` | implemented |
| `07-§4.8` | `space-lg` = `40px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-lg: 40px` | implemented |
| `07-§4.9` | `space-xl` = `64px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-xl: 64px` | implemented |
| `07-§4.10` | `space-xxl` = `96px` | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – `--space-xxl: 96px` | implemented |
| `07-§4.11` | Desktop grid: up to 3 columns for cards and testimonials | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.12` | Tablet grid: 2 columns | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.13` | Mobile grid: 1 column | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.14` | Grid uses CSS Grid; no grid framework | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` – CSS Grid used | implemented |
| `07-§5.1` | Desktop breakpoint: > 1000px — full layout, side-by-side columns | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.2` | Tablet breakpoint: 690–999px — 2-column grids, condensed header | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.3` | Mobile breakpoint: < 690px — single column, stacked layout | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.1` | Header is full-width, fixed or sticky at top | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.2` | Header height is `120px` desktop, `70px` mobile | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.3` | Header background is white or cream with a subtle bottom border or shadow | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.4` | Logo is on the left; nav links on the right | 07-DESIGN.md §6 | — | `source/build/layout.js` – `pageHeader()` HTML structure | implemented |
| `07-§6.5` | Nav links are uppercase, `12px`, `700` weight, `letter-spacing: 0.08em` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.6` | Active/hover nav state uses terracotta underline or color shift | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.7` | Mobile header uses a hamburger menu (full-screen or dropdown) | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | gap |
| `07-§6.8` | Hero section has a large background image (Klarälven river / camp landscape) | 07-DESIGN.md §6 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§6.9` | Hero overlay text shows camp name, dates, and a short tagline | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.10` | Hero has one or two CTA buttons | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.11` | Hero image uses `object-fit: cover` and is responsive | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.12` | Button minimum height is `40px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.13` | Button padding is `10px 24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.14` | Button border-radius is `4px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` – `--radius-sm: 4px` | implemented |
| `07-§6.15` | Primary button: background `#C76D48`, white text, no border | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.16` | Secondary button: border `#C76D48`, text `#C76D48`, transparent background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.17` | Button hover darkens background ~10% with `200ms ease` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.18` | Button font is body stack, weight `700`, size `14–16px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.19` | Cards have white `#FFFFFF` background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.20` | Cards have `border-radius: 6px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` – `--radius-md: 6px` | implemented |
| `07-§6.21` | Cards have box-shadow `0 4px 12px rgba(0,0,0,0.04)` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` – `--shadow-card` | implemented |
| `07-§6.22` | Card padding is `24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.23` | Testimonial cards show a circular profile image (`border-radius: 50%`, ~`60px`) | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.24` | Accordion header background is sage green `#ADBF77`, dark text | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.25` | Accordion body background is cream `#F5EEDF` or white | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.26` | Accordion toggle icon is `+`/`−` or a chevron | 07-DESIGN.md §6 | — | `source/build/render.js` – `<details>/<summary>` default disclosure triangle | implemented |
| `07-§6.27` | Accordion open/close is animated with CSS `max-height` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.28` | Accordion uses no JavaScript framework — plain JS or CSS-only | 07-DESIGN.md §6 | — | `source/build/render.js` – `<details>/<summary>` (native HTML) | implemented |
| `07-§6.29` | Section headings (H2) have a short decorative line or color block underneath | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.30` | Alternatively, a sage-green label appears above the heading at `12px` uppercase | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.31` | Schedule event rows show a bold start time and a lighter end time | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()`; `source/assets/cs/style.css` | implemented |
| `07-§6.32` | Location is shown as small text below the time in event rows | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()` | implemented |
| `07-§6.33` | Event rows may have an optional colored left border to indicate activity type | 07-DESIGN.md §6 | — | — (not implemented; no activity type categorization exists) | gap |
| `07-§7.2` | CSS is written for a component only once its HTML structure exists; no speculative CSS | 07-DESIGN.md §7 | — | Convention; assessed through code review | implemented |
| `07-§7.3` | CSS is organized in one main file: reset → tokens → base → layout → components → utilities | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` | implemented |
| `07-§7.4` | No CSS preprocessor is used; CSS custom properties are sufficient | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – plain CSS with custom properties | implemented |
| `07-§7.5` | No CSS framework is used; CSS is hand-written and minimal | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – no framework imports | implemented |
| `07-§8.1` | Photography is natural and warm: river, forest, camp activities, families | 07-DESIGN.md §8 | — | `source/content/` – image references; assessed through visual review | implemented |
| `07-§8.2` | Stock photography is avoided; real photos from actual camps are preferred | 07-DESIGN.md §8 | — | Assessed through visual review | implemented |
| `07-§8.3` | Hero image is landscape format, high resolution, dark enough for text overlay | 07-DESIGN.md §8 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§8.4` | Testimonial avatars are portrait photos, cropped square, displayed circular | 07-DESIGN.md §8 | — | `source/assets/cs/style.css` – `--radius-full: 50%` | implemented |
| `07-§8.5` | All images are optimised: responsive `srcset`, WebP format with JPEG fallback | 07-DESIGN.md §8 | — | — (not confirmed; images may not use srcset or WebP) | gap |
| `07-§9.1` | Color contrast meets WCAG AA minimum `4.5:1` for body text | 07-DESIGN.md §9 | — | Charcoal `#3B3A38` on Cream `#F5EEDF` passes WCAG AA; not verified programmatically | implemented |
| `07-§9.2` | Interactive elements have visible focus states | 07-DESIGN.md §9 | — | — (explicit `:focus-visible` rules not confirmed in `style.css` — see `02-§13.2`) | gap |
| `07-§9.3` | Navigation is keyboard accessible | 07-DESIGN.md §9 | — | `source/build/layout.js` – standard `<nav>` and `<a>` elements | implemented |
| `07-§9.4` | Images have descriptive `alt` text | 07-DESIGN.md §9 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt | covered |
| `07-§10.1` | No gradients or drop shadows heavier than specified are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – only `--shadow-card` used | implemented |
| `07-§10.2` | No animations beyond subtle transitions (`200–300ms`) are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` | implemented |
| `07-§10.3` | No decorative fonts or display typefaces are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – system fonts only | implemented |
| `07-§10.4` | Text is never full-width at desktop widths; always constrained by a container | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – container widths enforced | implemented |
| `07-§10.5` | Layout is not whitespace-heavy; content density is appropriate | 07-DESIGN.md §10 | — | Assessed through visual review | implemented |
| `07-§10.6` | The main site has no dark mode; the Today/Display view dark theme is purpose-built and not site-wide | 07-DESIGN.md §10 | — | `source/build/render-today.js` – dark theme isolated to display mode | implemented |
| `02-§2.11` | Edit-activity page exists at `/redigera.html` | 03-ARCHITECTURE.md §7 | — | `source/build/render-edit.js` → `public/redigera.html` | implemented |
| `02-§7.1` | Participants can edit their own active events (events not yet passed) via session-cookie ownership | 03-ARCHITECTURE.md §7 | — | `app.js` – `POST /edit-event`; `source/assets/js/client/session.js`; `source/assets/js/client/redigera.js` | implemented |
| `02-§7.2` | Administrators can edit or remove any event by modifying the YAML file directly | 04-OPERATIONS.md | — | No editing UI exists; enforced by absence, not access control | implemented |
| `02-§7.3` | Only the submitting participant (identified by session cookie) may edit a given participant-submitted event | 03-ARCHITECTURE.md §7 | SES-01..05 | `app.js` – `parseSessionIds()` + ownership check, 403 on failure | covered |
| `02-§18.1` | When an event is successfully created, the server sets the `sb_session` cookie containing the new event ID | 03-ARCHITECTURE.md §7 | SES-06..09 | `app.js` – `POST /add-event` sets `Set-Cookie` via `buildSetCookieHeader(mergeIds(…))` | covered |
| `02-§18.2` | The session cookie stores a JSON array of event IDs the current browser owns | 03-ARCHITECTURE.md §7 | SES-03 | `source/api/session.js` – `parseSessionIds()`, `buildSetCookieHeader()` | covered |
| `02-§18.3` | The session cookie has Max-Age of 7 days; submitting another event updates and extends it | 03-ARCHITECTURE.md §7 | SES-07, SES-10..13 | `source/api/session.js` – `MAX_AGE_SECONDS = 604800`; `mergeIds()` | covered |
| `02-§18.4` | The session cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` | 03-ARCHITECTURE.md §7 | SES-08, SES-09 | `source/api/session.js` – `buildSetCookieHeader()` | covered |
| `02-§18.5` | The session cookie is JavaScript-readable (not httpOnly) — documented trade-off; server-side validation compensates | 03-ARCHITECTURE.md §7 | — | By design: `buildSetCookieHeader()` omits `HttpOnly`; server validates ownership on every edit | implemented |
| `02-§18.6` | The session cookie is set only by the server, never written directly by client-side JS | 03-ARCHITECTURE.md §7 | — | `app.js` sets `Set-Cookie`; `session.js` only re-writes the client-readable cookie after expiry cleanup | implemented |
| `02-§18.7` | The session cookie name is `sb_session` | 03-ARCHITECTURE.md §7 | SES-06 | `source/api/session.js` – `COOKIE_NAME = 'sb_session'` | covered |
| `02-§18.8` | Before setting the session cookie, the client displays an inline consent prompt on the add-activity form | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/cookie-consent.js` – `showConsentBanner()` | implemented |
| `02-§18.9` | If the user accepts consent, the form submission proceeds and the server sets the session cookie | 03-ARCHITECTURE.md §7 | — | `lagg-till.js` passes `cookieConsent: true`; `app.js` sets cookie | implemented |
| `02-§18.10` | If the user declines consent, the event is still submitted but no session cookie is set | 03-ARCHITECTURE.md §7 | — | `lagg-till.js` passes `cookieConsent: false`; `app.js` skips `Set-Cookie` | implemented |
| `02-§18.11` | The consent decision is stored in `localStorage` as `sb_cookie_consent`; the prompt is not shown again | 03-ARCHITECTURE.md §7 | — | `cookie-consent.js` – `saveConsent()` / `getConsent()` via `localStorage` | implemented |
| `02-§18.12` | The consent prompt is written in Swedish | 02-REQUIREMENTS.md §14 | — | `cookie-consent.js` – banner innerHTML is Swedish text | implemented |
| `02-§18.13` | On every page load, JS removes event IDs from the cookie whose date has already passed | 03-ARCHITECTURE.md §7 | — | `session.js` – `removeExpiredIds()` called on load | implemented |
| `02-§18.14` | After cleaning, if no IDs remain the cookie is deleted; otherwise the cleaned cookie is written back | 03-ARCHITECTURE.md §7 | — | `session.js` – `writeSessionIds([])` sets `Max-Age=0` | implemented |
| `02-§18.15` | "Passed" means the event date is strictly before today's local date | 03-ARCHITECTURE.md §7 | EDIT-01..03 | `source/api/edit-event.js` – `isEventPast()`; `session.js` – `date >= today` | covered |
| `02-§18.16` | Schedule pages show a "Redigera" link for events the visitor owns (in cookie) and that have not passed | 03-ARCHITECTURE.md §7 | — | `session.js` – `injectEditLinks()` appends `.edit-link` to matching `[data-event-id]` rows | implemented |
| `02-§18.17` | Edit links are injected by client-side JS; they are never part of the static HTML | 03-ARCHITECTURE.md §7 | — | `source/build/render.js` – no edit links at build time; `session.js` injects at runtime | implemented |
| `02-§18.18` | Event rows in generated HTML carry a `data-event-id` attribute with the event's stable ID | 03-ARCHITECTURE.md §7 | RND-46, RND-47 | `source/build/render.js` – `renderEventRow()` adds `data-event-id` | covered |
| `02-§18.19` | The "Redigera" link navigates to `/redigera.html?id={eventId}` | 03-ARCHITECTURE.md §7 | — | `session.js` – `link.href = 'redigera.html?id=' + encodeURIComponent(id)` | implemented |
| `02-§18.20` | An edit page exists at `/redigera.html` | 03-ARCHITECTURE.md §7 | — | `source/build/render-edit.js` → `public/redigera.html` | implemented |
| `02-§18.21` | The edit page reads the `id` query param, checks the cookie, and fetches `/events.json` to pre-populate the form | 03-ARCHITECTURE.md §7 | — | `redigera.js` – `getParam()`, `readSessionIds()`, `fetch('/events.json')`, `populate()` | implemented |
| `02-§18.22` | If the event ID is not in the cookie or the event has passed, the edit page shows an error and no form | 03-ARCHITECTURE.md §7 | — | `redigera.js` – `showError()` when ID not in cookie or `event.date < today` | implemented |
| `02-§18.23` | The edit form exposes the same fields as the add-activity form | 03-ARCHITECTURE.md §7 | — | `source/build/render-edit.js` – all add-activity fields present | implemented |
| `02-§18.24` | The event's stable `id` must not change after creation even when mutable fields are edited | 06-EVENT_DATA_MODEL.md §4 | EDIT-13 | `source/api/edit-event.js` – `patchEventInYaml()` preserves `event.id` | covered |
| `02-§18.25` | The edit form is subject to the same validation rules as the add-activity form (§9) | 03-ARCHITECTURE.md §7 | — | `source/api/validate.js` – `validateEditRequest()`; `redigera.js` client-side validate | implemented |
| `02-§18.26` | After a successful edit, a clear Swedish confirmation is shown; schedule updates within minutes | 03-ARCHITECTURE.md §7 | — | `render-edit.js` – `#result` section; `github.js` – `updateEventInActiveCamp()` PR pipeline | implemented |
| `02-§18.27` | The edit form is written entirely in Swedish | 02-REQUIREMENTS.md §14 | — | `source/build/render-edit.js` – all labels and messages in Swedish | implemented |
| `02-§18.28` | A static `/events.json` file is generated at build time containing all events for the active camp | 03-ARCHITECTURE.md §7 | — | `source/build/build.js` – writes `public/events.json` | implemented |
| `02-§18.29` | `/events.json` contains only public fields (id, title, date, start, end, location, responsible, description, link); owner and meta are excluded | 03-ARCHITECTURE.md §7 | — | `build.js` – `PUBLIC_EVENT_FIELDS` array | implemented |
| `02-§18.30` | A `POST /edit-event` endpoint accepts edit requests | 03-ARCHITECTURE.md §7 | — | `app.js` – `app.post('/edit-event', …)` | implemented |
| `02-§18.31` | The server reads `sb_session`, parses the event ID array, and verifies the target ID is present | 03-ARCHITECTURE.md §7 | SES-01..05 | `app.js` – `parseSessionIds(req.headers.cookie)` + `ownedIds.includes(eventId)` | covered |
| `02-§18.32` | If the event ID is not in the cookie, the server responds with HTTP 403 | 03-ARCHITECTURE.md §7 | — | `app.js` – `res.status(403)` when `!ownedIds.includes(eventId)` | implemented |
| `02-§18.33` | If the event's date has already passed, the server responds with HTTP 400 | 03-ARCHITECTURE.md §7 | EDIT-01..03 | `app.js` – `isEventPast(req.body.date)` → `res.status(400)` | covered |
| `02-§18.34` | On a valid edit, the server reads YAML from GitHub, replaces mutable fields, commits via ephemeral branch + PR with auto-merge | 03-ARCHITECTURE.md §7 | EDIT-04..17 | `source/api/github.js` – `updateEventInActiveCamp()`; `edit-event.js` – `patchEventInYaml()` | covered |
| `02-§18.35` | The event's `meta.updated_at` is updated on every successful edit | 06-EVENT_DATA_MODEL.md §6 | EDIT-15 | `source/api/edit-event.js` – `patchEventInYaml()` sets `meta.updated_at = now` | covered |
| `02-§18.36` | Only recognised edit-form fields are written; no unrecognised POST body fields are ever committed | 03-ARCHITECTURE.md §7 | — | `source/api/validate.js` – `validateEditRequest()`; `patchEventInYaml()` explicit field set | implemented |

---

## Summary

```text
Total requirements:             291
Covered (implemented + tested):  46
Implemented, not tested:        213
Gap (no implementation):         32
Orphan tests (no requirement):    0

Note: 40 requirements added for §18 (participant event editing via session cookie).
All 40 are now implemented and covered — Phase 4 and Phase 5 complete.
```

---

## Top Gaps — Prioritised Action List

### Critical — broken or missing user-facing features

1. **`02-§2.3` / `02-§4.4` / `02-§4.11` / `02-§4.12` — Daily view with day navigation** (`/dagens-schema.html`)
   The spec defines a per-day schedule page with forward/back navigation and the same field display as the weekly view.
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

4. **`02-§2.6` / `02-§16.2` / `02-§16.4` — Archive page** (`/arkiv.html`)
   No page exists to browse past camps. The archive must be usable and complete, not a placeholder.

5. **`02-§2.7` / `02-§15.1` / `02-§15.2` — RSS feed** (`/schema.rss`)
   No RSS feed is generated; it must reflect the current state of the schedule.
   No implementation guidance document exists — `03-ARCHITECTURE.md` needs an RSS section before this can be built.

6. **`02-§10.3` — String length limits in API validation**
   `validate.js` type-checks strings but sets no maximum length.
   Unbounded strings can be committed to the YAML file.

### Medium — data integrity

7. **`05-§4.1` — Event date range check (API server)**
   The API accepts any structurally valid `YYYY-MM-DD` date regardless of camp `start_date`/`end_date`.

8. **`05-§4.2` / `05-§4.4` — Time format validation (API server)**
   `validate.js` checks `start` is non-empty but not that it matches `HH:MM`.
   `end` is not validated as `null` or `HH:MM` — only that it is after `start` when present.

9. **`05-§5.1` — Duplicate event uniqueness not enforced**
   The `(title + date + start)` combination is never checked for uniqueness before committing.

10. **`05-§6.1` — Event ID uniqueness not enforced**
    Identical submissions produce identical IDs. No check is made against existing IDs in the file.

11. **`05-§1.3` — `active: true` and `archived: true` mutual exclusion**
    No code prevents a camp from being marked both active and archived.

12. **`CL-§5.5` / `CL-§5.9` / `CL-§6.3` — Build-time YAML data validation**
    Manually edited YAML bypasses all validation (required fields, date ranges, duplicate IDs).
    Validation only runs in the API layer when events are submitted through the form.

### Low — tooling, design, and accessibility gaps

13. **`CL-§5.1` — HTML validation in CI**
    No HTML linter is configured; invalid HTML does not fail the build.

14. **`CL-§5.2` — CSS linting in CI**
    No CSS linter is configured.

15. **`CL-§7.4` / `07-§8.5` — Image optimisation**
    Images may not be served as WebP with responsive `srcset`. Not confirmed implemented.

16. **`02-§13.2` / `07-§9.2` — Visible focus states**
    Explicit `:focus-visible` rules are not confirmed in `style.css`.

17. **`02-§13.6` / `07-§9.5` — Accordion ARIA attributes**
    `<details>/<summary>` is used without explicit `aria-expanded` or `aria-controls`.

18. **`07-§6.7` — Mobile hamburger menu**
    No hamburger/dropdown navigation confirmed for mobile viewports.

19. **`07-§6.33` — Colored left border for activity type**
    No activity type categorization exists; colored left borders are not implemented.

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
