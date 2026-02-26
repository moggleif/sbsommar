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

Audit date: 2026-02-24. Last updated: 2026-02-25 (240 new tests — 75 requirements moved from implemented to covered).

---

## Table

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§2.1` | Homepage exists and is served at `/` | 03-ARCHITECTURE.md §5, §6 | COV-01..05 | `source/build/render-index.js`, `source/build/build.js` → `public/index.html` | covered |
| `02-§2.2` | Weekly schedule page exists at `/schema.html` | 03-ARCHITECTURE.md §5 | SNP-01 | `source/build/render.js`, `source/build/build.js` → `public/schema.html` | covered |
| `02-§2.4` | Today view at `/idag.html` shows today's activities in the standard site layout | 03-ARCHITECTURE.md §5 | IDAG-05..18 | `source/build/render-idag.js`, `source/build/build.js` → `public/idag.html` | covered |
| `02-§2.4a` | Display view at `/dagens-schema.html` uses dark background, large text, and no navigation | 03-ARCHITECTURE.md §3, 07-DESIGN.md §6 | DIS-01..18 | `source/build/render-today.js`, `source/build/build.js` → `public/dagens-schema.html` | covered |
| `02-§2.5` | Add-activity form exists at `/lagg-till.html` | 03-ARCHITECTURE.md §3, §6 | RADD-01..04 | `source/build/render-add.js`, `source/build/build.js` → `public/lagg-till.html` | covered |
| `02-§2.6` | Archive page exists at `/arkiv.html` | 03-ARCHITECTURE.md §4a | ARK-01..08 | `source/build/render-arkiv.js`, `source/build/build.js` → `public/arkiv.html` | covered |
| `02-§2.7` | RSS feed exists at `/schema.rss` | 03-ARCHITECTURE.md §17 | RSS-01 | `source/build/render-rss.js`, `source/build/build.js` → `public/schema.rss` | covered |
| `02-§2.8` | Homepage, schedule, add-activity, and archive pages share header and navigation | 03-ARCHITECTURE.md §6 | SNP-01, LAY-01..07 | `source/build/layout.js` – `pageNav()` | covered |
| `02-§2.9` | None of the site pages require login | 03-ARCHITECTURE.md §3 | COV-16 | No authentication exists anywhere in the codebase | covered |
| `02-§2.10` | Display view has no header or navigation | 03-ARCHITECTURE.md §3, 07-DESIGN.md §6 | DIS-04..06 | `source/build/render-today.js` – no `pageNav()` call | covered |
| `02-§3.1` | Homepage answers all pre-camp questions (what, who, when, cost, registration, lodging, rules, testimonials) | 03-ARCHITECTURE.md §5 | COV-06..07 | `source/build/render-index.js`, `source/content/*.md` sections | covered |
| `02-§3.2` | Homepage includes a collapsible FAQ section | 03-ARCHITECTURE.md §5; `collapsible: true` in `sections.yaml` | RNI-22..28 | `source/build/render-index.js` – `convertMarkdown(…, collapsible: true)` | covered |
| `02-§3.3` | Homepage remains complete and usable even when no camp is active | 03-ARCHITECTURE.md §5 (Fallback rule) | COV-12..13 | `source/build/build.js` – falls back to most recent camp by `start_date` | covered |
| `02-§3.4` | Schedule and add-activity links are prominent when a camp is active or upcoming | 03-ARCHITECTURE.md §3 | — | `source/build/layout.js` – nav always shows all links (not conditionally prominent based on camp state) | implemented |
| `02-§3.5` | Upcoming-camps list renders each camp as a compact one-liner with no separators | 03-ARCHITECTURE.md §14.6 | CL-01, CL-02, CL-03 (CSS presence); manual: visual check | `source/assets/cs/style.css` – `.camp-item`, `.camp-body` flex layout | covered |
| `02-§4.1` | Weekly schedule shows all activities for the full camp week, grouped by day | 03-ARCHITECTURE.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `renderSchedulePage()`, `groupAndSortEvents()` | covered |
| `02-§4.2` | Within each day, activities are listed in chronological order by start time | 03-ARCHITECTURE.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.3` | Each activity shows title, start time, end time, location, and responsible person | 05-DATA_CONTRACT.md §2, §3 | RND-39..45 | `source/build/render.js` – `renderEventRow()` | covered |
| `02-§4.5` | Today view (`/idag.html`) shows only today's activities in the standard site layout | 03-ARCHITECTURE.md §5 | IDAG-09..11 | `source/build/render-idag.js`, `source/assets/js/client/events-today.js` | covered |
| `02-§4.6` | Display view has dark background, large text, and minimal chrome; legible at a distance | 07-DESIGN.md §6 | DIS-07, CSS-37 | `source/build/render-today.js` – `class="display-mode"`; `source/assets/cs/style.css` → `/dagens-schema.html` | covered |
| `02-§4.7` | Display view requires no interaction to stay useful | 03-ARCHITECTURE.md §3 | DIS-08..09 | `source/build/render-today.js` – no day controls rendered | covered |
| `02-§4.8` | Overlapping activities are allowed and the schedule remains readable | 03-ARCHITECTURE.md §5, 07-DESIGN.md §6 | RDC-05..06 | No exclusion logic in `source/build/render.js`; CSS handles layout | covered |
| `02-§4.9` | Clicking an activity opens its detail view | 03-ARCHITECTURE.md §5 | RND-41, RND-42 | `source/build/render.js` – `renderEventRow()` uses `<details>` element | covered |
| `02-§5.1` | Detail view shows all populated fields; fields with no value do not appear | 05-DATA_CONTRACT.md §2, §3 | RND-33..38, RND-43 | `source/build/render.js` – `eventExtraHtml()`, `renderEventRow()` | covered |
| `02-§6.1` | Form at `/lagg-till.html` accepts a new activity submission | 03-ARCHITECTURE.md §3 | RADD-03..04 | `source/build/render-add.js` (HTML), `source/assets/js/client/lagg-till.js` (submit) | covered |
| `02-§6.2` | Date field is constrained to the active camp's date range | 05-DATA_CONTRACT.md §4 | RADD-05..07 | `source/build/render-add.js` – `min`/`max` attributes on date input | covered |
| `02-§6.3` | Location field is a dropdown populated from `source/data/local.yaml` | 03-ARCHITECTURE.md §6 | RADD-08..10 | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (renders `<select>`) | covered |
| `02-§6.4` | Time fields guide the user toward a valid `HH:MM` value | 05-DATA_CONTRACT.md §4 | RADD-11..12 | `source/build/render-add.js` – `type="time"` inputs (browser-native validation) | covered |
| `02-§6.5` | Form errors are shown inline, per field, immediately on submit | 03-ARCHITECTURE.md §7a; 07-DESIGN.md §6.34–6.39 | ILE-01..04, ILE-E01..E04 | `render-add.js` / `render-edit.js` (`.field-error` spans, `aria-describedby`); `lagg-till.js` / `redigera.js` (per-field `setFieldError`); `style.css` (`.field-error`, `[aria-invalid]`) | covered |
| `02-§6.6` | Submit button is disabled and shows a visual indicator while submission is in progress | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true`; `textContent = 'Sparar...'` | implemented |
| `02-§6.7` | A clear success confirmation is shown after submission | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – reveals `#result` section with activity title | implemented |
| `02-§6.8` | Network failure shows a clear error and allows retry; submissions are never silently lost | 03-ARCHITECTURE.md §3 | — | `source/assets/js/client/lagg-till.js` – `.catch()` re-enables button and shows error | implemented |
| `02-§7.1` | Only administrators can edit or remove activities (via YAML directly; no participant editing UI) | 04-OPERATIONS.md (Disaster Recovery) | — | No editing UI exists; enforced by absence, not access control | implemented |
| `02-§8.1` | Location names are consistent throughout the week; defined only in `source/data/local.yaml` | 03-ARCHITECTURE.md §6 | RADD-16 | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (uses those names) | covered |
| `02-§8.2` | One "Annat" option allows a free-text location not in the predefined list | 03-ARCHITECTURE.md §6 | RADD-13..15 | `source/build/render-add.js` – "Annat" always appended last | covered |
| `02-§9.1` | `title` is present and non-empty before form submission | 05-DATA_CONTRACT.md §3 | VLD-04..06 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.2` | `date` falls within the active camp's date range | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `min`/`max` (browser-enforced only; not in submit handler) | implemented |
| `02-§9.3` | `start` is in valid `HH:MM` format | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `type="time"` (browser-enforced only; not validated by server — see `05-§4.2`) | implemented |
| `02-§9.4` | `end` is present, in valid `HH:MM` format, and is after `start` | 05-DATA_CONTRACT.md §4 | VLD-16..20, VLD-27..32 | `source/assets/js/client/lagg-till.js` and `redigera.js` (client); `source/api/validate.js` – `validateEventRequest()` and `validateEditRequest()` (server, tested) | covered |
| `02-§9.5` | `location` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-10 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.6` | `responsible` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-11 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§10.1` | All required fields are present and of correct type before any write begins | 03-ARCHITECTURE.md §3 | VLD-01..11 | `source/api/validate.js` – `validateEventRequest()`; `app.js` – returns HTTP 400 on failure | covered |
| `02-§10.2` | Only known fields are written to YAML; unknown POST body fields are silently ignored | 03-ARCHITECTURE.md §3, 05-DATA_CONTRACT.md §2 | GH-24..38 | `source/api/github.js` – `buildEventYaml()` constructs a fixed, explicit field set | covered |
| `02-§10.3` | String values are length-limited; extremely long strings are rejected | 03-ARCHITECTURE.md §3 | VLD-42..49 | `source/api/validate.js` – `MAX_LENGTHS` map; `check-yaml-security.js` – `MAX_LENGTHS` (build-time) | covered |
| `02-§10.4` | User-provided strings are never directly interpolated into YAML; all quoting is handled by the serializer | 05-DATA_CONTRACT.md §8, 06-EVENT_DATA_MODEL.md §8 | GH-12..23, GH-38 | `source/api/github.js` – `yamlScalar()` | covered |
| `02-§10.5` | A validation failure results in an HTTP error response; nothing is committed to GitHub | 03-ARCHITECTURE.md §3 | VLD-01..26 (validate logic; no HTTP integration test) | `app.js` – `res.status(400)` before calling `addEventToActiveCamp` | covered |
| `02-§10.6` | Appended event YAML is indented to match the `events:` list; resulting file is valid YAML | 03-ARCHITECTURE.md §3 | GH-39..43 | `source/api/github.js` – `buildEventYaml(event, indent)` with `indent=2` in `addEventToActiveCamp()` | covered |
| `02-§11.1` | Activities are always displayed in chronological order (by date, then start time) | 03-ARCHITECTURE.md §5 | RND-28..32, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§11.2` | Overlapping activities are allowed; the schedule must remain readable (see `02-§4.8`) | 03-ARCHITECTURE.md §5, 07-DESIGN.md §6 | — | No exclusion logic in `source/build/render.js`; CSS handles layout | implemented |
| `02-§12.1` | A newly submitted activity appears in the live schedule within a few minutes | 03-ARCHITECTURE.md §3 (PR auto-merge → deploy pipeline) | — | `source/api/github.js` – `createPullRequest()`, `enableAutoMerge()` | implemented |
| `02-§12.2` | Admin corrections to YAML are reflected in all schedule views after the next build | 04-OPERATIONS.md (Disaster Recovery) | — | `source/build/build.js` – reads all YAML at build time | implemented |
| `02-§13.1` | Color contrast is at least 4.5:1 for body text | 07-DESIGN.md §9 | — | `source/assets/cs/style.css` – charcoal (`#3B3A38`) on cream (`#F5EEDF`) (passes WCAG AA; not verified programmatically) | implemented |
| `02-§13.2` | All interactive elements have visible focus states | 07-DESIGN.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules on buttons, nav links, toggle, summaries, content links, form inputs | covered |
| `02-§13.3` | Navigation is fully keyboard accessible | 07-DESIGN.md §9 | — | `source/build/layout.js` – `<nav>` and `<a>` elements; `source/build/render-add.js` – standard form controls (native keyboard) | implemented |
| `02-§13.4` | Images have descriptive `alt` text | 07-DESIGN.md §8 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt; `inlineHtml()` passes through alt | covered |
| `02-§13.5` | The add-activity form is fully usable without a mouse | 07-DESIGN.md §9 | — | `source/build/render-add.js` – all standard form controls (native keyboard) | implemented |
| `02-§13.6` | Accordion and expandable elements use proper ARIA attributes (`aria-expanded`, `aria-controls`) | 07-DESIGN.md §9 | — (manual: native `<details>` provides equivalent accessibility; archive uses explicit ARIA via ARK-04, ARK-05) | `source/build/render.js` – native `<details>/<summary>` (browser-exposed state); `source/build/render-arkiv.js` – explicit `aria-expanded`/`aria-controls` | implemented |
| `02-§14.1` | The site is written entirely in Swedish: all content, nav, labels, errors, confirmations, and alt text | 07-DESIGN.md §1 | COV-14..15, RADD-20..21, IDAG-15, REDT-12..16 | All templates and client JS use Swedish text | covered |
| `02-§15.1` | Activity schedule is available as an RSS feed at `/schema.rss` | 03-ARCHITECTURE.md §17 | RSS-01, RSS-04 | `source/build/render-rss.js` | covered |
| `02-§16.1` | Past camp data is never deleted; `archived: true` marks completed camps | 03-ARCHITECTURE.md §4 | — | `source/data/camps.yaml` – `archived` flag; no deletion logic exists | implemented |
| `02-§16.2` | Archive page lists all past camps and links to their schedules | 03-ARCHITECTURE.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – `renderArkivPage()` | covered |
| `02-§16.3` | When no camp is active, the most recent archived camp is shown by default | 03-ARCHITECTURE.md §5 (Fallback rule) | — | `source/build/build.js` – falls back to most recent by `start_date` (not filtered to `archived: true`) | implemented |
| `02-§17.1` | The site works well on mobile devices | 07-DESIGN.md §4, §5 | — | `source/assets/cs/style.css` – responsive layout, container widths, breakpoints | implemented |
| `02-§17.2` | The site requires no explanation; the schedule and add-activity form are self-evident | 07-DESIGN.md §1 | — | UX/design principle; assessed through usability review, not automatable | implemented |
| `05-§1.1` | Each `camps.yaml` entry includes all required fields: `id`, `name`, `start_date`, `end_date`, `file`, `active`, `archived` | 06-EVENT_DATA_MODEL.md §3, 03-ARCHITECTURE.md §2 | — | `source/build/build.js` reads and uses these fields; no build-time schema validator | implemented |
| `05-§1.2` | Active camp is derived from dates (no manual flag) | 03-ARCHITECTURE.md §2; 02-REQUIREMENTS.md §34 | DAC-01..07 | `source/scripts/resolve-active-camp.js` | covered |
| `05-§1.3` | *(Superseded — `active` field removed; conflict impossible)* | — | — | — | *(superseded by 02-§34.6)* |
| `05-§3.1` | Each submitted event must include `id`, `title`, `date`, `start`, `end`, `location`, and `responsible` | 06-EVENT_DATA_MODEL.md §4, 05-DATA_CONTRACT.md §3 | VLD-04..11, VLD-27..28 | `source/api/validate.js` – `validateEventRequest()` and `validateEditRequest()` (note: `id` is server-generated, not submitted as input) | covered |
| `05-§4.1` | Event `date` must fall within the camp's `start_date` and `end_date` (inclusive) | 06-EVENT_DATA_MODEL.md §4 | VLD-50..55, LNT-12, LNT-13 | `source/api/validate.js` – `campDates` range check; `lint-yaml.js` – camp range check; `app.js` – passes `activeCamp` | covered |
| `05-§4.2` | `start` must use 24-hour `HH:MM` format | 06-EVENT_DATA_MODEL.md §4 | VLD-33..34, VLD-37..40, LNT-14 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.3` | `end` must be after `start` | 06-EVENT_DATA_MODEL.md §4 | VLD-16..20, VLD-29..30 | `source/api/validate.js` – `end <= start` check in both `validateEventRequest()` and `validateEditRequest()` | covered |
| `05-§5.1` | The combination of `(title + date + start)` must be unique within a camp file | 03-ARCHITECTURE.md §1 | LNT-19..21 | `source/scripts/lint-yaml.js` – `seenCombos` set (build-time + CI); API layer relies on deterministic ID generation | covered |
| `05-§6.1` | Event `id` must be unique within the camp file | 06-EVENT_DATA_MODEL.md §4 | GH-01..11 (slugify determinism), LNT-18 | `source/scripts/lint-yaml.js` – `seenIds` set (build-time + CI); API generates deterministic IDs from unique (title+date+start) | covered |
| `05-§6.2` | Event `id` must be stable and not change after creation | 06-EVENT_DATA_MODEL.md §4 | EEC-01..03 | `source/api/github.js` – deterministic `slugify(title)+date+start` on first write; `edit-event.js` – `patchEventInYaml()` preserves id | covered |
| `07-§7.1` | All CSS uses the custom properties defined at `:root`; no hardcoded colors, spacing, or typography | 07-DESIGN.md §7 | CSS-32..35 | `source/assets/cs/style.css` – all values use `var(--…)` tokens (not enforced by a linter) | covered |
| `07-§9.5` | Accordion items use `aria-expanded` and `aria-controls` ARIA attributes (see `02-§13.6`; archive accordion uses explicit ARIA via `02-§21.6`) | 07-DESIGN.md §9 | — (manual: native `<details>` provides equivalent accessibility; see `02-§13.6`) | `source/build/render.js` – native `<details>/<summary>`; archive uses explicit ARIA (ARK-04, ARK-05) | implemented |
| `CL-§1.1` | Build output is static HTML/CSS/JS; no server is required to view pages | 03-ARCHITECTURE.md §7 | SNP-01, STR-HTML-01..06 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§1.3` | No client-side rendering framework is used (see `CL-§2.9`) | 03-ARCHITECTURE.md §7 | STR-FW-01..06 | `source/assets/js/client/` – plain vanilla JS only | covered |
| `CL-§4.1` | Event data has a single source of truth (see `CL-§2.3`) | 03-ARCHITECTURE.md §1 | — | `source/data/*.yaml` files; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§3.2` | Main page sections are authored in Markdown (see `CL-§2.2`) | 03-ARCHITECTURE.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§5.1` | HTML validation runs in CI; build fails if HTML is invalid (see `02-§32.1`–`02-§32.8`) | 03-ARCHITECTURE.md §11.5; 02-REQUIREMENTS.md §32 | manual: `npm run build && npm run lint:html` | `.htmlvalidate.json`, `ci.yml` Validate HTML step, `package.json` lint:html script | implemented |
| `CL-§5.2` | CSS linting runs in CI; build fails if CSS is invalid (see `02-§33.1`–`02-§33.8`) | 03-ARCHITECTURE.md §11.5; 02-REQUIREMENTS.md §33 | manual: `npm run lint:css` | `.stylelintrc.json`, `ci.yml` Lint CSS step, `package.json` lint:css script | implemented |
| `CL-§5.3` | JavaScript linting runs in CI; build fails if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – `npm run lint` (ESLint) | implemented |
| `CL-§5.5` | Event data is validated at build time for required fields, valid dates, and no duplicate identifiers | 04-OPERATIONS.md (Disaster Recovery); 05-DATA_CONTRACT.md §3–§6 | LNT-01..23 | `source/scripts/lint-yaml.js` – validates required fields, dates, time format, camp range, duplicate IDs, unique (title+date+start), active+archived; runs in CI via `event-data-deploy.yml` | covered |
| `CL-§9.1` | Built output lives in `/public` | 04-OPERATIONS.md (System Overview) | — | `source/build/build.js` – `OUTPUT_DIR = …/public` | implemented |
| `CL-§9.2` | GitHub Actions builds and validates; deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | implemented |
| `CL-§9.3` | Deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/deploy.yml` – triggered only on push to `main` after CI passes | implemented |
| `CL-§9.4` | For data-only commits (per-camp event files only), CI runs build only — lint and tests are skipped. Configuration files (`camps.yaml`, `local.yaml`) trigger full CI despite living in `source/data/` | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – data-only path check with config-file exclusion; `.github/workflows/deploy.yml` – `paths-ignore: source/data/**.yaml` | implemented |
| `CL-§9.5` | CI workflows that compare branches must check out with enough git history for the diff to succeed (`fetch-depth: 0`) | 03-ARCHITECTURE.md §11.6 | — (CI end-to-end: open a PR and confirm the diff step succeeds) | `.github/workflows/ci.yml` – `fetch-depth: 0`; `.github/workflows/event-data-deploy.yml` – `fetch-depth: 0` on lint-yaml and security-check | implemented |
| `CL-§10.1` | Never push directly to `main` | 01-CONTRIBUTORS.md | — | Enforced by branch protection; described in contributor guide | implemented |
| `CL-§10.2` | At the start of every session, run `git checkout main && git pull && git checkout -b branch-name` before any changes | 01-CONTRIBUTORS.md | — | Developer discipline; documented in `01-CONTRIBUTORS.md` | implemented |
| `CL-§10.3` | Branch names must be descriptive | 01-CONTRIBUTORS.md | — | Developer convention; no technical enforcement | implemented |
| `CL-§10.4` | After a branch is merged and pulled via `main`, delete the local branch | 01-CONTRIBUTORS.md | — | Developer discipline; no technical enforcement | implemented |
| `CL-§1.2` | No backend server is required to view any page | 03-ARCHITECTURE.md §7 | STR-HTML-01..06 | `source/build/build.js` – all pages are pre-rendered to `public/` | covered |
| `CL-§1.4` | JavaScript usage is minimal | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/` – only three small client scripts exist | implemented |
| `CL-§1.5` | Architecture is content-first: content is authored separately from layout | 03-ARCHITECTURE.md §6 | — | `source/content/*.md` (content) vs `source/build/` (layout) | implemented |
| `CL-§1.6` | Content, layout, and styling are clearly separated | 03-ARCHITECTURE.md §6 | — | `source/content/` (Markdown), `source/build/` (templates), `source/assets/cs/` (CSS) | implemented |
| `CL-§1.7` | The site is maintainable by non-developers | 01-CONTRIBUTORS.md | — | Content editable via Markdown + YAML; no build tools needed for content changes | implemented |
| `CL-§1.8` | Pages load fast | 03-ARCHITECTURE.md §7 | — | Static HTML, no runtime framework, CSS custom properties only | implemented |
| `CL-§1.9` | Clarity is preferred over cleverness in all implementation decisions | 03-ARCHITECTURE.md §7 | — | Principle; assessed through code review | implemented |
| `CL-§2.1` | Final build output is static HTML, CSS, and JS | 03-ARCHITECTURE.md §7 | SNP-01 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§2.2` | Main page sections are authored in Markdown | 03-ARCHITECTURE.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§2.3` | Event data has a single source of truth; all views derive from it | 03-ARCHITECTURE.md §1 | — | `source/data/*.yaml`; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§2.4` | Layout components are reused across pages | 03-ARCHITECTURE.md §6 | LAY-01..06 | `source/build/layout.js` – shared `pageHeader()`, `pageNav()`, `pageFooter()` | covered |
| `CL-§2.5` | Markup is not duplicated between pages | 03-ARCHITECTURE.md §6 | LAY-07 | `source/build/layout.js` – single source of shared layout | covered |
| `CL-§2.6` | Heavy runtime dependencies are avoided | 03-ARCHITECTURE.md §7 | — | `package.json` – no client-side framework dependencies | implemented |
| `CL-§2.7` | The site is not a single-page application | 03-ARCHITECTURE.md §7 | STR-SPA-01..06 | Each page is a separate `.html` file; no client-side routing | covered |
| `CL-§2.8` | No database is used | 03-ARCHITECTURE.md §1, §7 | — | YAML files and Git are the only storage layer | implemented |
| `CL-§2.9` | No client-side rendering framework is used | 03-ARCHITECTURE.md §7 | STR-FW-01..06 | `source/assets/js/client/` – plain vanilla JS only | covered |
| `CL-§2.10` | Custom complex build systems must not be created unless clearly justified | 03-ARCHITECTURE.md §7 | — | `source/build/build.js` – straightforward Node.js script, no custom bundler | implemented |
| `CL-§2.11` | Standard, well-established static site tooling is preferred | 03-ARCHITECTURE.md §7 | — | Principle; current toolchain is plain Node.js + YAML + Markdown | implemented |
| `CL-§3.1` | The main page is built from modular, independently reorderable sections | 03-ARCHITECTURE.md §6 | COV-08..09 | `source/content/*.md` sections; `source/build/render-index.js` assembles them | covered |
| `CL-§3.3` | Sections can be reordered or edited without modifying layout code | 03-ARCHITECTURE.md §6 | COV-10..11 | `source/build/render-index.js` – section order driven by config, not hardcoded | covered |
| `CL-§3.4` | All special pages share the same layout structure | 03-ARCHITECTURE.md §6 | LAY-08 | `source/build/layout.js` – shared layout used by all pages except Today/Display view | covered |
| `CL-§4.2` | Event data powers the weekly schedule, daily schedule, Today view, RSS feed, and future archive pages | 03-ARCHITECTURE.md §1, §5 | — | `source/build/build.js` – single load feeds all render targets | implemented |
| `CL-§4.3` | No event is defined in more than one place | 03-ARCHITECTURE.md §1 | — | One YAML file per camp; no duplication mechanism exists | implemented |
| `CL-§4.4` | Event sorting is deterministic | 03-ARCHITECTURE.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` sorts by date + start | covered |
| `CL-§4.5` | Required event fields are validated before data is accepted | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.4` | Build fails if any linter reports errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – lint step gates the build | implemented |
| `CL-§5.6` | Event data is validated for required fields | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.7` | Event data is validated for valid dates | 05-DATA_CONTRACT.md §4 | VLD-12..15 | `source/api/validate.js` – date format check (range check missing — see `05-§4.1`) | implemented |
| `CL-§5.8` | Event data is validated: end time must be after start time | 05-DATA_CONTRACT.md §4 | VLD-16..20 | `source/api/validate.js` – `end <= start` check | covered |
| `CL-§5.9` | Event data is validated for duplicate identifiers (see `05-§6.1`) | 05-DATA_CONTRACT.md §6 | LNT-18, LNT-19..21 | `source/scripts/lint-yaml.js` – `seenIds` (duplicate ID check) + `seenCombos` (title+date+start uniqueness) | covered |
| `CL-§5.10` | The site builds locally without errors | 04-OPERATIONS.md (Local Development) | — | `npm run build` on developer machine | implemented |
| `CL-§5.11` | The site builds in GitHub Actions without errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step | implemented |
| `CL-§5.12` | CI fails if the build fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step failure blocks merge | implemented |
| `CL-§6.1` | Build runs locally before merge | 04-OPERATIONS.md (Local Development) | — | Developer discipline + pre-commit hook | implemented |
| `CL-§6.2` | Lint passes before merge | 04-OPERATIONS.md (CI/CD Workflows) | — | CI lint step blocks merge on failure | implemented |
| `CL-§6.3` | Data validation passes before merge | 05-DATA_CONTRACT.md §3–§6 | LNT-01..23 | `source/scripts/lint-yaml.js` runs in CI (`event-data-deploy.yml` lint-yaml job); pre-commit hook runs `npm test` which includes lint-yaml tests | covered |
| `CL-§6.4` | Automated minimal tests exist for event sorting and date handling | — | RND-01..45 | `tests/render.test.js` | covered |
| `CL-§6.5` | Screenshot comparison tests exist for schedule pages | — | SNP-01..06 | `tests/snapshot.test.js` | covered |
| `CL-§7.1` | JavaScript footprint is minimal | 03-ARCHITECTURE.md §7 | — | Three small client scripts; no framework | implemented |
| `CL-§7.2` | No unused CSS is shipped | 07-DESIGN.md §7 | — | Hand-written CSS with no unused rules (not enforced by tooling) | implemented |
| `CL-§7.3` | No large blocking assets are loaded | 03-ARCHITECTURE.md §7 | — | No large scripts or stylesheets | implemented |
| `CL-§7.5` | No runtime hydration framework is used | 03-ARCHITECTURE.md §7 | — | No framework; plain JS only | implemented |
| `CL-§7.6` | The site feels instant to load | 03-ARCHITECTURE.md §7 | — | Static HTML + minimal JS + optimised CSS | implemented |
| `CL-§8.1` | Non-technical contributors can edit text content in Markdown without touching layout files | 01-CONTRIBUTORS.md | — | `source/content/*.md` editable directly; layout is separate | implemented |
| `CL-§8.2` | Non-technical contributors can add new events via YAML | 01-CONTRIBUTORS.md | — | `source/data/*.yaml` editable directly | implemented |
| `CL-§8.3` | Non-technical contributors can add images without editing layout files | 01-CONTRIBUTORS.md | — | Images referenced from Markdown content files | implemented |
| `CL-§8.4` | Layout files do not need to be edited for content changes | 03-ARCHITECTURE.md §6 | — | Content-layout separation is architectural; `source/build/` is never touched for content edits | implemented |
| `02-§4.10` | Weekly schedule groups activities by day | 03-ARCHITECTURE.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.13` | Today view has no day navigation; it always shows today | 03-ARCHITECTURE.md §3 | DIS-10, IDAG-12..13 | `source/build/render-idag.js`, `source/build/render-today.js` – no day navigation rendered | covered |
| `02-§5.2` | Empty fields are omitted from the detail view; no blank rows appear | 05-DATA_CONTRACT.md §3 | RND-33..38 | `source/build/render.js` – `eventExtraHtml()` guards each optional field | covered |
| `02-§5.3` | The `owner` and `meta` fields are never shown in any public view | 05-DATA_CONTRACT.md §3.3 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `02-§8.3` | Locations must be selected from a predefined list | 03-ARCHITECTURE.md §6 | — | `source/build/render-add.js` – `<select>` populated from `local.yaml` | implemented |
| `02-§8.4` | Participants cannot modify the location list | 03-ARCHITECTURE.md §6 | — | No form UI for adding locations; enforced by absence | implemented |
| `02-§11.3` | The schedule remains readable when multiple activities overlap (see `02-§4.8`) | 07-DESIGN.md §6 | — | CSS layout handles overlap; no exclusion logic in render | implemented |
| `02-§12.3` | All event submissions are permanently recorded in Git history as a full audit trail | 03-ARCHITECTURE.md §3 | — | `source/api/github.js` – every submission creates a Git commit via the Contents API | implemented |
| `02-§15.2` | The RSS feed reflects the current state of the schedule | 03-ARCHITECTURE.md §17 | RSS-04 | `source/build/render-rss.js` — built from active camp events | covered |
| `02-§16.4` | The archive must be usable and complete, not a placeholder | 03-ARCHITECTURE.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – interactive timeline with accordion per camp | covered |
| `02-§17.3` | The site is readable on shared display screens | 07-DESIGN.md §6 | DIS-01..18 | `source/build/render-today.js` – display mode view; `source/assets/cs/style.css` | covered |
| `05-§1.4` | The `file` field in `camps.yaml` references a YAML file in `source/data/` | 06-EVENT_DATA_MODEL.md §1 | — | `source/build/build.js` – loads camp file via `camps.yaml` `file` field | implemented |
| `05-§1.5` | The camp `id` is permanent and must never change after the camp is first created | 06-EVENT_DATA_MODEL.md §3 | — | — (no enforcement; enforced by convention and docs) | implemented |
| `05-§3.2` | Each camp file's `camp:` block must include `id`, `name`, `location`, `start_date`, and `end_date` | 06-EVENT_DATA_MODEL.md §3 | — | `source/build/build.js` – reads and uses all five fields; no build-time schema validator | implemented |
| `05-§3.3` | The `owner` and `meta` fields are for internal use only and must never appear in any public view | 06-EVENT_DATA_MODEL.md §5, §6 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `05-§4.4` | `end` must be a valid `"HH:MM"` string | 06-EVENT_DATA_MODEL.md §4 | VLD-35..36, VLD-41, LNT-15 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.5` | All times are local; no timezone handling | 06-EVENT_DATA_MODEL.md §4 | STR-TZ-01..06 | No timezone conversion anywhere in the codebase | covered |
| `CL-§2.12` | Data file names are never hardcoded; active camp and file paths are always derived from `camps.yaml` | 03-ARCHITECTURE.md §2 | — | `source/build/build.js` – reads `camps.yaml` first; `source/api/github.js` – same | implemented |
| `CL-§5.13` | Markdown linting runs on every commit via pre-commit hook; commit is blocked if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.githooks/` pre-commit hook – `npm run lint:md`; `.markdownlint.json` config | implemented |
| `07-§1.1` | The design has a warm, welcoming, outdoorsy feel — not corporate or sterile | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.2` | Earth tones and natural colors are used throughout | 07-DESIGN.md §2 | — | Color palette defined in `source/assets/cs/style.css` `:root` | implemented |
| `07-§1.3` | Design is clean and readable; content comes first | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.4` | Design is fast and lightweight with no decorative excess | 07-DESIGN.md §1 | — | No decorative assets; minimal CSS | implemented |
| `07-§2.1` | Primary accent color is Terracotta `#C76D48` (buttons, links, highlights) | 07-DESIGN.md §7 | CSS-01 | `source/assets/cs/style.css` – `--color-terracotta: #C76D48` | covered |
| `07-§2.2` | Secondary accent color is Sage green `#ADBF77` (section headers, tags) | 07-DESIGN.md §7 | CSS-02 | `source/assets/cs/style.css` – `--color-sage: #ADBF77` | covered |
| `07-§2.3` | Page background color is Cream `#F5EEDF` | 07-DESIGN.md §7 | CSS-03 | `source/assets/cs/style.css` – `--color-cream: #F5EEDF` | covered |
| `07-§2.4` | Main heading color is Navy `#192A3D` | 07-DESIGN.md §7 | CSS-04 | `source/assets/cs/style.css` – `--color-navy: #192A3D` | covered |
| `07-§2.5` | Body text color is Charcoal `#3B3A38` | 07-DESIGN.md §7 | CSS-05 | `source/assets/cs/style.css` – `--color-charcoal: #3B3A38` | covered |
| `07-§2.6` | Card and contrast surface color is White `#FFFFFF` | 07-DESIGN.md §7 | CSS-06 | `source/assets/cs/style.css` – `--color-white: #FFFFFF` | covered |
| `07-§2.7` | No bright or saturated colors are used outside the defined palette | 07-DESIGN.md §2 | — | Enforced by design convention; not linted | implemented |
| `07-§3.1` | Headings use `system-ui, -apple-system, sans-serif` (or a single humanist web font if added) | 07-DESIGN.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token | covered |
| `07-§3.2` | Body text uses the same sans-serif stack | 07-DESIGN.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token applied to body | covered |
| `07-§3.3` | Pull quotes and callouts use Georgia, serif | 07-DESIGN.md §7 | CSS-08 | `source/assets/cs/style.css` – `--font-serif: Georgia, serif` | covered |
| `07-§3.4` | H1 is 40px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-09 | `source/assets/cs/style.css` – `--font-size-h1: 40px` | covered |
| `07-§3.5` | H2 is 35px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-10 | `source/assets/cs/style.css` – `--font-size-h2: 35px` | covered |
| `07-§3.6` | H3 is 30px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-11 | `source/assets/cs/style.css` – `--font-size-h3: 30px` | covered |
| `07-§3.7` | Body text is 16px, weight 400, color Charcoal `#3B3A38` | 07-DESIGN.md §7 | CSS-12 | `source/assets/cs/style.css` – `--font-size-base: 16px` | covered |
| `07-§3.8` | Small/meta text is 14px, weight 400, color Charcoal | 07-DESIGN.md §7 | CSS-13 | `source/assets/cs/style.css` – `--font-size-small: 14px` | covered |
| `07-§3.9` | Pull quote text is 25px, weight 600, Georgia serif, italic | 07-DESIGN.md §7 | CSS-14 | `source/assets/cs/style.css` – `--font-size-pullquote: 25px` | covered |
| `07-§3.10` | Nav links are 12px, weight 700, uppercase, letter-spaced | 07-DESIGN.md §7 | CSS-15 | `source/assets/cs/style.css` – `--font-size-nav: 12px` | covered |
| `07-§3.11` | Body text line height is `1.65` | 07-DESIGN.md §7 | CSS-16 | `source/assets/cs/style.css` – `--line-height-body: 1.65` | covered |
| `07-§4.1` | Wide container max-width is `1290px` (header, hero, full layout) | 07-DESIGN.md §7 | CSS-17 | `source/assets/cs/style.css` – `--container-wide: 1290px` | covered |
| `07-§4.2` | Narrow container max-width is `750px` (reading sections, articles) | 07-DESIGN.md §7 | CSS-18 | `source/assets/cs/style.css` – `--container-narrow: 750px` | covered |
| `07-§4.3` | Containers are centered with `margin: 0 auto` and horizontal padding on small screens | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.4` | Spacing base unit is `8px`; all spacing values are multiples of it | 07-DESIGN.md §7 | CSS-19..24 | `source/assets/cs/style.css` – spacing tokens at `:root` | covered |
| `07-§4.5` | `space-xs` = `8px` | 07-DESIGN.md §7 | CSS-19 | `source/assets/cs/style.css` – `--space-xs: 8px` | covered |
| `07-§4.6` | `space-sm` = `16px` | 07-DESIGN.md §7 | CSS-20 | `source/assets/cs/style.css` – `--space-sm: 16px` | covered |
| `07-§4.7` | `space-md` = `24px` | 07-DESIGN.md §7 | CSS-21 | `source/assets/cs/style.css` – `--space-md: 24px` | covered |
| `07-§4.8` | `space-lg` = `40px` | 07-DESIGN.md §7 | CSS-22 | `source/assets/cs/style.css` – `--space-lg: 40px` | covered |
| `07-§4.9` | `space-xl` = `64px` | 07-DESIGN.md §7 | CSS-23 | `source/assets/cs/style.css` – `--space-xl: 64px` | covered |
| `07-§4.10` | `space-xxl` = `96px` | 07-DESIGN.md §7 | CSS-24 | `source/assets/cs/style.css` – `--space-xxl: 96px` | covered |
| `07-§4.11` | Desktop grid: up to 3 columns for cards and testimonials | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.12` | Tablet grid: 2 columns | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.13` | Mobile grid: 1 column | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.14` | Grid uses CSS Grid; no grid framework | 07-DESIGN.md §4 | CSS-28 | `source/assets/cs/style.css` – CSS Grid used | covered |
| `07-§5.1` | Desktop breakpoint: > 1000px — full layout, side-by-side columns | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.2` | Tablet breakpoint: 690–999px — 2-column grids, condensed header | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.3` | Mobile breakpoint: < 690px — single column, stacked layout | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.1` | Header is full-width, fixed or sticky at top | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.2` | Header height is `120px` desktop, `70px` mobile | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.3` | Header background is white or cream with a subtle bottom border or shadow | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.4` | Logo is on the left; nav links on the right | 07-DESIGN.md §6 | — | `source/build/layout.js` – `pageHeader()` HTML structure | implemented |
| `07-§6.5` | Nav links are uppercase, `12px`, `700` weight, `letter-spacing: 0.08em` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.6` | Active/hover nav state uses terracotta underline or color shift | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.7` | Mobile header uses a hamburger menu (full-screen or dropdown) | 07-DESIGN.md §6 | NAV-10, NAV-11 | `source/build/layout.js` – `.nav-toggle` button; `source/assets/js/client/nav.js` – toggle logic; `source/assets/cs/style.css` – mobile nav rules (see `02-§24.10`–`02-§24.14`) | implemented |
| `07-§6.8` | Hero section has a large background image (Klarälven river / camp landscape) | 07-DESIGN.md §6 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§6.9` | Hero overlay text shows camp name, dates, and a short tagline | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.10` | Hero has one or two CTA buttons | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.11` | Hero image uses `object-fit: cover` and is responsive | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.12` | Button minimum height is `40px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.13` | Button padding is `10px 24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.14` | Button border-radius is `4px` | 07-DESIGN.md §6 | CSS-29 | `source/assets/cs/style.css` – `--radius-sm: 4px` | covered |
| `07-§6.15` | Primary button: background `#C76D48`, white text, no border | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.16` | Secondary button: border `#C76D48`, text `#C76D48`, transparent background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.17` | Button hover darkens background ~10% with `200ms ease` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.18` | Button font is body stack, weight `700`, size `14–16px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.19` | Cards have white `#FFFFFF` background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.20` | Cards have `border-radius: 6px` | 07-DESIGN.md §6 | CSS-30 | `source/assets/cs/style.css` – `--radius-md: 6px` | covered |
| `07-§6.21` | Cards have box-shadow `0 4px 12px rgba(0,0,0,0.04)` | 07-DESIGN.md §6 | CSS-31 | `source/assets/cs/style.css` – `--shadow-card` | covered |
| `07-§6.22` | Card padding is `24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.23` | Testimonial cards show a circular profile image (`border-radius: 50%`, ~`60px`) | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.24` | Accordion header background is sage green `#ADBF77`, dark text | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.25` | Accordion body background is cream `#F5EEDF` or white | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.26` | Accordion toggle icon is `+`/`−` or a chevron | 07-DESIGN.md §6 | — | `source/build/render.js` – `<details>/<summary>` default disclosure triangle | implemented |
| `07-§6.27` | Accordion open/close is animated with CSS `max-height` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.28` | Accordion uses no JavaScript framework — plain JS or CSS-only | 07-DESIGN.md §6 | CSS-37 | `source/build/render.js` – `<details>/<summary>` (native HTML) | covered |
| `07-§6.29` | Section headings (H2) have a short decorative line or color block underneath | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.30` | Alternatively, a sage-green label appears above the heading at `12px` uppercase | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.31` | Schedule event rows show a bold start time and a lighter end time | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()`; `source/assets/cs/style.css` | implemented |
| `07-§6.32` | Location is shown as small text below the time in event rows | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()` | implemented |
| `07-§7.2` | CSS is written for a component only once its HTML structure exists; no speculative CSS | 07-DESIGN.md §7 | — | Convention; assessed through code review | implemented |
| `07-§7.3` | CSS is organized in one main file: reset → tokens → base → layout → components → utilities | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` | implemented |
| `07-§7.4` | No CSS preprocessor is used; CSS custom properties are sufficient | 07-DESIGN.md §7 | CSS-36 | `source/assets/cs/style.css` – plain CSS with custom properties | covered |
| `07-§7.5` | No CSS framework is used; CSS is hand-written and minimal | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – no framework imports | implemented |
| `07-§8.1` | Photography is natural and warm: river, forest, camp activities, families | 07-DESIGN.md §8 | — | `source/content/` – image references; assessed through visual review | implemented |
| `07-§8.2` | Stock photography is avoided; real photos from actual camps are preferred | 07-DESIGN.md §8 | — | Assessed through visual review | implemented |
| `07-§8.3` | Hero image is landscape format, high resolution, dark enough for text overlay | 07-DESIGN.md §8 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§8.4` | Testimonial avatars are portrait photos, cropped square, displayed circular | 07-DESIGN.md §8 | — | `source/assets/cs/style.css` – `--radius-full: 50%` | implemented |
| `07-§9.1` | Color contrast meets WCAG AA minimum `4.5:1` for body text | 07-DESIGN.md §9 | — | Charcoal `#3B3A38` on Cream `#F5EEDF` passes WCAG AA; not verified programmatically | implemented |
| `07-§9.2` | Interactive elements have visible focus states (see `02-§13.2`) | 07-DESIGN.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules (see `02-§13.2`) | covered |
| `07-§9.3` | Navigation is keyboard accessible (see `02-§13.3`) | 07-DESIGN.md §9 | — | `source/build/layout.js` – standard `<nav>` and `<a>` elements | implemented |
| `07-§9.4` | Images have descriptive `alt` text (see `02-§13.4`) | 07-DESIGN.md §9 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt | covered |
| `07-§10.1` | No gradients or drop shadows heavier than specified are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – only `--shadow-card` used | implemented |
| `07-§10.2` | No animations beyond subtle transitions (`200–300ms`) are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` | implemented |
| `07-§10.3` | No decorative fonts or display typefaces are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – system fonts only | implemented |
| `07-§10.4` | Text is never full-width at desktop widths; always constrained by a container | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – container widths enforced | implemented |
| `07-§10.5` | Layout is not whitespace-heavy; content density is appropriate | 07-DESIGN.md §10 | — | Assessed through visual review | implemented |
| `07-§10.6` | The main site has no dark mode; the Today/Display view dark theme is purpose-built and not site-wide | 07-DESIGN.md §10 | — | `source/build/render-today.js` – dark theme isolated to display mode | implemented |
| `02-§2.11` | Edit-activity page exists at `/redigera.html` | 03-ARCHITECTURE.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§7.1` | Participants can edit their own active events (events not yet passed) via session-cookie ownership | 03-ARCHITECTURE.md §7 | — | `app.js` – `POST /edit-event`; `source/assets/js/client/session.js`; `source/assets/js/client/redigera.js` | implemented |
| `02-§7.2` | Administrators can edit or remove any event by modifying the YAML file directly | 04-OPERATIONS.md | — | No editing UI exists; enforced by absence, not access control | implemented |
| `02-§7.3` | Only the submitting participant (identified by session cookie) may edit a given participant-submitted event | 03-ARCHITECTURE.md §7 | SES-01..05 | `app.js` – `parseSessionIds()` + ownership check, 403 on failure | covered |
| `02-§18.1` | When an event is successfully created, the server sets the `sb_session` cookie containing the new event ID | 03-ARCHITECTURE.md §7 | SES-06..09 | `app.js` – `POST /add-event` sets `Set-Cookie` via `buildSetCookieHeader(mergeIds(…))` | covered |
| `02-§18.2` | The session cookie stores a JSON array of event IDs the current browser owns | 03-ARCHITECTURE.md §7 | SES-03 | `source/api/session.js` – `parseSessionIds()`, `buildSetCookieHeader()` | covered |
| `02-§18.3` | The session cookie has Max-Age of 7 days; submitting another event updates and extends it | 03-ARCHITECTURE.md §7 | SES-07, SES-10..13 | `source/api/session.js` – `MAX_AGE_SECONDS = 604800`; `mergeIds()` | covered |
| `02-§18.4` | The session cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` | 03-ARCHITECTURE.md §7 | SES-08, SES-09, EEC-20..21 | `source/api/session.js` – `buildSetCookieHeader()` | covered |
| `02-§18.5` | The session cookie is JavaScript-readable (not httpOnly) — documented trade-off; server-side validation compensates | 03-ARCHITECTURE.md §7 | EEC-26 | By design: `buildSetCookieHeader()` omits `HttpOnly`; server validates ownership on every edit | covered |
| `02-§18.6` | The session cookie is set only by the server, never written directly by client-side JS | 03-ARCHITECTURE.md §7 | — | `app.js` sets `Set-Cookie`; `session.js` only re-writes the client-readable cookie after expiry cleanup | implemented |
| `02-§18.7` | The session cookie name is `sb_session` | 03-ARCHITECTURE.md §7 | SES-06, EEC-18 | `source/api/session.js` – `COOKIE_NAME = 'sb_session'` | covered |
| `02-§18.41` | When API and static site are on different subdomains, the session cookie must include `Domain` covering the shared parent domain, supplied via `COOKIE_DOMAIN` env var; omitted for single-origin deployments | 03-ARCHITECTURE.md §7 | SES-14, SES-15 | `source/api/session.js` – `buildSetCookieHeader(ids, domain)`; `app.js` – passes `process.env.COOKIE_DOMAIN` | covered |
| `02-§18.8` | Before setting the session cookie, the client displays a modal consent prompt on the add-activity form | 03-ARCHITECTURE.md §7 | — (manual: submit form without prior consent and confirm modal appears) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` | implemented |
| `02-§18.9` | If the user accepts consent, the form submission proceeds and the server sets the session cookie | 03-ARCHITECTURE.md §7 | — | `lagg-till.js` passes `cookieConsent: true`; `app.js` sets cookie | implemented |
| `02-§18.10` | If the user declines consent, the event is still submitted but no session cookie is set | 03-ARCHITECTURE.md §7 | — | `lagg-till.js` passes `cookieConsent: false`; `app.js` skips `Set-Cookie` | implemented |
| `02-§18.11` | Only an accepted consent decision is stored in `localStorage` as `sb_cookie_consent`; declining is not persisted so the user can change their mind | 03-ARCHITECTURE.md §7 | — | `cookie-consent.js` – `saveConsent()` stores only `'accepted'`; decline handler omits `saveConsent()` | implemented |
| `02-§18.12` | The consent prompt is written in Swedish | 02-REQUIREMENTS.md §14 | — | `cookie-consent.js` – banner innerHTML is Swedish text | implemented |
| `02-§18.13` | On every page load, JS removes event IDs from the cookie whose date has already passed | 03-ARCHITECTURE.md §7 | — | `session.js` – `removeExpiredIds()` called on load | implemented |
| `02-§18.14` | After cleaning, if no IDs remain the cookie is deleted; otherwise the cleaned cookie is written back | 03-ARCHITECTURE.md §7 | — | `session.js` – `writeSessionIds([])` sets `Max-Age=0` | implemented |
| `02-§18.15` | "Passed" means the event date is strictly before today's local date | 03-ARCHITECTURE.md §7 | EDIT-01..03 | `source/api/edit-event.js` – `isEventPast()`; `session.js` – `date >= today` | covered |
| `02-§18.16` | Schedule pages show a "Redigera" link for events the visitor owns (in cookie) and that have not passed | 03-ARCHITECTURE.md §7 | — | `session.js` – `injectEditLinks()` appends `.edit-link` to matching `[data-event-id]` rows | implemented |
| `02-§18.17` | Edit links are injected by client-side JS; they are never part of the static HTML | 03-ARCHITECTURE.md §7 | — | `source/build/render.js` – no edit links at build time; `session.js` injects at runtime | implemented |
| `02-§18.18` | Event rows in generated HTML carry a `data-event-id` attribute with the event's stable ID | 03-ARCHITECTURE.md §7 | RND-46, RND-47 | `source/build/render.js` – `renderEventRow()` adds `data-event-id` | covered |
| `02-§18.19` | The "Redigera" link navigates to `/redigera.html?id={eventId}` | 03-ARCHITECTURE.md §7 | — | `session.js` – `link.href = 'redigera.html?id=' + encodeURIComponent(id)` | implemented |
| `02-§18.42` | The "Idag" today view (`/idag.html`) shows a "Redigera" link next to each owned, non-past event — same rule as the weekly schedule | 03-ARCHITECTURE.md §7 | IDAG-03, IDAG-04 | `source/build/render-idag.js` – loads `session.js`; `source/assets/js/client/session.js` – `injectEditLinks()` | covered |
| `02-§18.43` | The events JSON embedded in `idag.html` includes the event `id` field | 03-ARCHITECTURE.md §7 | IDAG-01, IDAG-02 | `source/build/render-idag.js` – `id: e.id \|\| null` in events map | covered |
| `02-§18.44` | Event rows rendered dynamically on `idag.html` carry `data-event-id` and `data-event-date` attributes for edit-link injection | 03-ARCHITECTURE.md §7 | — | `source/assets/js/client/events-today.js` – `idAttr`/`dateAttr` added to both row types; browser-only: verify manually (open idag.html, run `document.querySelectorAll('[data-event-id]')` in console) | implemented |
| `02-§18.20` | An edit page exists at `/redigera.html` | 03-ARCHITECTURE.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§18.21` | The edit page reads the `id` query param, checks the cookie, and fetches `/events.json` to pre-populate the form | 03-ARCHITECTURE.md §7 | — | `redigera.js` – `getParam()`, `readSessionIds()`, `fetch('/events.json')`, `populate()` | implemented |
| `02-§18.22` | If the event ID is not in the cookie or the event has passed, the edit page shows an error and no form | 03-ARCHITECTURE.md §7 | — | `redigera.js` – `showError()` when ID not in cookie or `event.date < today` | implemented |
| `02-§18.23` | The edit form exposes the same fields as the add-activity form | 03-ARCHITECTURE.md §7 | REDT-04..11 | `source/build/render-edit.js` – all add-activity fields present | covered |
| `02-§18.24` | The event's stable `id` must not change after creation even when mutable fields are edited | 06-EVENT_DATA_MODEL.md §4 | EDIT-13 | `source/api/edit-event.js` – `patchEventInYaml()` preserves `event.id` | covered |
| `02-§18.25` | The edit form is subject to the same validation rules as the add-activity form (§9) | 03-ARCHITECTURE.md §7 | VLD-27..32 | `source/api/validate.js` – `validateEditRequest()`; `redigera.js` client-side validate | covered |
| `02-§18.26` | After a successful edit, a clear Swedish confirmation is shown; schedule updates within minutes | 03-ARCHITECTURE.md §7 | — | `render-edit.js` – `#result` section; `github.js` – `updateEventInActiveCamp()` PR pipeline | implemented |
| `02-§18.27` | The edit form is written entirely in Swedish | 02-REQUIREMENTS.md §14 | REDT-12..16 | `source/build/render-edit.js` – all labels and messages in Swedish | covered |
| `02-§18.28` | A static `/events.json` file is generated at build time containing all events for the active camp | 03-ARCHITECTURE.md §7 | — | `source/build/build.js` – writes `public/events.json` | implemented |
| `02-§18.29` | `/events.json` contains only public fields (id, title, date, start, end, location, responsible, description, link); owner and meta are excluded | 03-ARCHITECTURE.md §7 | STR-JSON-01..02 | `build.js` – `PUBLIC_EVENT_FIELDS` array | covered |
| `02-§18.30` | A `POST /edit-event` endpoint accepts edit requests | 03-ARCHITECTURE.md §7 | — | `app.js` – `app.post('/edit-event', …)` | implemented |
| `02-§18.31` | The server reads `sb_session`, parses the event ID array, and verifies the target ID is present | 03-ARCHITECTURE.md §7 | SES-01..05 | `app.js` – `parseSessionIds(req.headers.cookie)` + `ownedIds.includes(eventId)` | covered |
| `02-§18.32` | If the event ID is not in the cookie, the server responds with HTTP 403 | 03-ARCHITECTURE.md §7 | — | `app.js` – `res.status(403)` when `!ownedIds.includes(eventId)` | implemented |
| `02-§18.33` | If the event's date has already passed, the server responds with HTTP 400 | 03-ARCHITECTURE.md §7 | EDIT-01..03 | `app.js` – `isEventPast(req.body.date)` → `res.status(400)` | covered |
| `02-§18.34` | On a valid edit, the server reads YAML from GitHub, replaces mutable fields, commits via ephemeral branch + PR with auto-merge | 03-ARCHITECTURE.md §7 | EDIT-04..17 | `source/api/github.js` – `updateEventInActiveCamp()`; `edit-event.js` – `patchEventInYaml()` | covered |
| `02-§18.35` | The event's `meta.updated_at` is updated on every successful edit | 06-EVENT_DATA_MODEL.md §6 | EDIT-15 | `source/api/edit-event.js` – `patchEventInYaml()` sets `meta.updated_at = now` | covered |
| `02-§18.36` | Only recognised edit-form fields are written; no unrecognised POST body fields are ever committed | 03-ARCHITECTURE.md §7 | REDT-21 | `source/api/validate.js` – `validateEditRequest()`; `patchEventInYaml()` explicit field set | covered |
| `02-§18.37` | The add-event form fetch must use `credentials: 'include'` so cross-origin `Set-Cookie` response headers are applied by the browser | 03-ARCHITECTURE.md §7 | — (manual: verify cookie saved after form submit in a cross-origin deployment) | `source/assets/js/client/lagg-till.js` – `credentials: 'include'` in `fetch()` options | implemented |
| `02-§18.38` | The cookie consent prompt must be displayed as a modal dialog (backdrop, focus trap, centered box) reusing the submit-feedback modal's styling and accessibility patterns | 03-ARCHITECTURE.md §7, §8 | — (manual: submit form without prior consent and confirm modal appears with backdrop and focus trap) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` via `modalApi` from `lagg-till.js` | implemented |
| `02-§18.39` | The add-activity form has no owner name field; event ownership is established entirely via session cookie | 03-ARCHITECTURE.md §7 | — (manual: confirm no ownerName input in rendered lagg-till.html) | `source/build/render-add.js` – `ownerName` field removed from form | implemented |
| `02-§18.40` | The add-activity submit handler must only reference form elements that exist in the HTML form; accessing a missing element via `form.elements` returns `undefined` and calling `.value` on it throws a TypeError that aborts submission | 03-ARCHITECTURE.md §7 | — (no automated test: `form.elements` is a browser DOM API not available in Node.js; manual: open `lagg-till.html` in a browser and submit the form — confirm it submits without TypeError and the consent banner appears and responds correctly) | `source/assets/js/client/lagg-till.js` – `ownerName` line removed from `JSON.stringify` body | implemented |
| `02-§18.46` | The edit form must submit to the `/edit-event` endpoint; the build derives the edit URL from `API_URL` by replacing a trailing `/add-event` with `/edit-event`, falling back to `/edit-event` | 03-ARCHITECTURE.md §7 | BUILD-01..04 | `source/build/render-edit.js` – `editApiUrl()`; `source/build/build.js` – passes `editApiUrl(process.env.API_URL)` | covered |
| `02-§18.45` | The edit form fetch must use `credentials: 'include'` so the `sb_session` cookie is sent to the cross-origin API | 03-ARCHITECTURE.md §7 | — (manual: open `redigera.html` in a browser, submit an edit, and verify the request carries the cookie and returns HTTP 200) | `source/assets/js/client/redigera.js` – `credentials: 'include'` | implemented |
| `02-§19.1` | When validation passes and submission begins, all form inputs and the submit button are immediately disabled | 03-ARCHITECTURE.md §8 | ADD-02; manual: press Skicka and confirm all inputs are disabled before the modal opens | `source/assets/js/client/lagg-till.js` – `lock()` sets `fieldset.disabled = true` and `submitBtn.disabled = true` | implemented |
| `02-§19.2` | Disabled form elements are visually distinct (reduced opacity / grayed out) | 03-ARCHITECTURE.md §8 | — (manual: confirm visual appearance of disabled fieldset) | `source/assets/cs/style.css` – `.event-form fieldset:disabled { opacity: 0.5 }` | implemented |
| `02-§19.3` | The consent prompt is shown as a modal dialog while the form is locked, reusing the `#submit-modal` element | 03-ARCHITECTURE.md §8 | — (manual: submit form without prior consent and confirm consent appears in modal) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` renders consent content into `#submit-modal` via `modalApi` | implemented |
| `02-§19.4` | After the user accepts or declines, the modal content transitions to the progress state (spinner) | 03-ARCHITECTURE.md §8 | — (manual: accept/decline and confirm modal switches to spinner without closing) | `source/assets/js/client/cookie-consent.js` – calls callback; `lagg-till.js` – `setModalLoading()` replaces modal content, skips re-open if already visible | implemented |
| `02-§19.5` | After consent is resolved, a modal dialog opens over the page before the fetch begins | 03-ARCHITECTURE.md §8 | ADD-03; manual: confirm modal opens immediately after consent banner resolves | `source/assets/js/client/lagg-till.js` – `setModalLoading()` called before `fetch()` in consent callback | implemented |
| `02-§19.6` | The modal displays a spinner and the text "Skickar till GitHub…" while the fetch is in progress | 03-ARCHITECTURE.md §8 | — (manual: confirm spinner and text are visible during submission) | `lagg-till.js` – `setModalLoading()` sets `.modal-spinner` + `.modal-status`; CSS animates spinner | implemented |
| `02-§19.7` | The modal carries role="dialog", aria-modal="true", and aria-labelledby pointing to its heading | 03-ARCHITECTURE.md §8 | ADD-04, ADD-05, ADD-06 | `source/build/render-add.js` – `role="dialog" aria-modal="true" aria-labelledby="modal-heading"`; heading has `id="modal-heading"` | covered |
| `02-§19.8` | Keyboard focus is trapped inside the modal while it is open | 03-ARCHITECTURE.md §8 | — (manual: Tab through the modal — focus must not leave it) | `lagg-till.js` – `trapFocus()` registered on `keydown` when modal opens; removed on close | implemented |
| `02-§19.9` | The page behind the modal is not scrollable while the modal is open | 03-ARCHITECTURE.md §8 | — (manual: confirm body does not scroll when modal is open) | `lagg-till.js` – `document.body.classList.add('modal-open')`; CSS – `body.modal-open { overflow: hidden }` | implemented |
| `02-§19.10` | On success, the modal shows the title, confirmation text, "Gå till schemat →" link, and "Lägg till en till" button | 03-ARCHITECTURE.md §8 | — (manual: submit a valid form and confirm modal success content) | `lagg-till.js` – `setModalSuccess()` builds the content with title, intro text, and two action elements | implemented |
| `02-§19.11` | If the user declined cookie consent, the success modal shows a Swedish note about editing not being possible | 03-ARCHITECTURE.md §8 | — (manual: decline consent, submit, and confirm note appears in modal) | `lagg-till.js` – `setModalSuccess(title, consentGiven)` conditionally inserts `.result-note` paragraph | implemented |
| `02-§19.12` | "Lägg till en till" closes the modal, resets the form, and re-enables all fields | 03-ARCHITECTURE.md §8 | — (manual: click "Lägg till en till" and confirm form is blank and enabled) | `lagg-till.js` – `modal-new-btn` click calls `closeModal()`, `form.reset()`, `unlock()`, `scrollTo(0,0)` | implemented |
| `02-§19.13` | On error, the modal shows the error message and a "Försök igen" button | 03-ARCHITECTURE.md §8 | — (manual: simulate a server error and confirm modal error content) | `lagg-till.js` – `setModalError()` sets heading to "Något gick fel" and inserts error message + retry button | implemented |
| `02-§19.14` | "Försök igen" closes the modal and re-enables all form fields (input data preserved) | 03-ARCHITECTURE.md §8 | — (manual: click "Försök igen" and confirm form is enabled with data intact) | `lagg-till.js` – `modal-retry-btn` click calls `closeModal()`, `unlock()`, `submitBtn.focus()` without resetting the form | implemented |
| `02-§19.15` | The modal uses only CSS custom properties from 07-DESIGN.md §7 — no hardcoded colors or spacing | 07-DESIGN.md §7 | — (code review: grep for hardcoded hex/px values in modal CSS) | `source/assets/cs/style.css` – modal section uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`; only `rgba(0,0,0,0.16)` shadow (no design token for overlay shadow) | implemented |
| `02-§19.16` | The modal is implemented in vanilla JavaScript; no library or framework is added | 03-ARCHITECTURE.md §8 | — (code review: confirm no new npm dependencies for modal logic) | `lagg-till.js` – pure DOM manipulation; no new dependencies in `package.json` | implemented |
| `02-§19.17` | The existing #result section is removed; the modal is the sole post-submission feedback mechanism | 03-ARCHITECTURE.md §8 | ADD-01 | `source/build/render-add.js` – `#result` section removed; `#submit-modal` added in its place | covered |
| `02-§20.1` | When edit-form validation passes and submission begins, all form inputs and the submit button are immediately disabled | 03-ARCHITECTURE.md §9 | EDIT-02; manual: press "Spara ändringar" and confirm all inputs are disabled before the modal opens | `source/assets/js/client/redigera.js` – `lock()` sets `fieldset.disabled = true` and `submitBtn.disabled = true` | implemented |
| `02-§20.2` | Disabled edit-form elements are visually distinct (reduced opacity / grayed out) | 03-ARCHITECTURE.md §9 | — (manual: confirm visual appearance of disabled fieldset) | `source/assets/cs/style.css` – `.event-form fieldset:disabled { opacity: 0.5 }` (shared with add form) | implemented |
| `02-§20.3` | After edit-form submission begins, a modal dialog opens over the page before the fetch begins | 03-ARCHITECTURE.md §9 | EDIT-03; manual: confirm modal opens immediately after pressing "Spara ändringar" | `redigera.js` – `setModalLoading()` called before `fetch()` | implemented |
| `02-§20.4` | The edit modal displays a spinner and the text "Sparar till GitHub…" while the fetch is in progress | 03-ARCHITECTURE.md §9 | — (manual: confirm spinner and text are visible during submission) | `redigera.js` – `setModalLoading()` sets `.modal-spinner` + `.modal-status`; CSS animates spinner | implemented |
| `02-§20.5` | The edit modal carries role="dialog", aria-modal="true", and aria-labelledby pointing to its heading | 03-ARCHITECTURE.md §9 | EDIT-04, EDIT-05, EDIT-06 | `source/build/render-edit.js` – `role="dialog" aria-modal="true" aria-labelledby="modal-heading"`; heading has `id="modal-heading"` | covered |
| `02-§20.6` | Keyboard focus is trapped inside the edit modal while it is open | 03-ARCHITECTURE.md §9 | — (manual: Tab through the modal — focus must not leave it) | `redigera.js` – `trapFocus()` registered on `keydown` when modal opens; removed on close | implemented |
| `02-§20.7` | The page behind the edit modal is not scrollable while the modal is open | 03-ARCHITECTURE.md §9 | — (manual: confirm body does not scroll when modal is open) | `redigera.js` – `document.body.classList.add('modal-open')`; CSS – `body.modal-open { overflow: hidden }` | implemented |
| `02-§20.8` | On success, the edit modal shows the activity title, "Aktiviteten är uppdaterad!", and a "Gå till schemat →" link | 03-ARCHITECTURE.md §9 | — (manual: submit a valid edit and confirm modal success content) | `redigera.js` – `setModalSuccess()` sets heading + title + link | implemented |
| `02-§20.9` | On error, the edit modal shows the error message in Swedish and a "Försök igen" button | 03-ARCHITECTURE.md §9 | — (manual: simulate a server error and confirm modal error content) | `redigera.js` – `setModalError()` sets heading to "Något gick fel" and inserts error message + retry button | implemented |
| `02-§20.10` | Clicking "Försök igen" on the edit modal closes it and re-enables all form fields (input data preserved) | 03-ARCHITECTURE.md §9 | — (manual: click "Försök igen" and confirm form is enabled with data intact) | `redigera.js` – `modal-retry-btn` click calls `closeModal()`, `unlock()`, `submitBtn.focus()` without resetting the form | implemented |
| `02-§20.11` | The edit modal uses only CSS custom properties from 07-DESIGN.md §7 — no hardcoded colors or spacing | 07-DESIGN.md §7 | — (code review: confirm modal CSS uses only custom properties) | `source/assets/cs/style.css` – modal CSS shared with add form; uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)` | implemented |
| `02-§20.12` | The edit modal is implemented in vanilla JavaScript; no library or framework is added | 03-ARCHITECTURE.md §9 | — (code review: confirm no new npm dependencies for modal logic) | `redigera.js` – pure DOM manipulation; no new dependencies in `package.json` | implemented |
| `02-§20.13` | The existing #result section in the edit page is removed; the modal is the sole post-submission feedback mechanism | 03-ARCHITECTURE.md §9 | EDIT-01 | `source/build/render-edit.js` – `#result` section removed; `#submit-modal` added in its place | covered |
| `02-§21.1` | Only camps with `archived: true` are shown on the archive page | 03-ARCHITECTURE.md §4a | ARK-01 | `source/build/render-arkiv.js` – filters `archived === true` | covered |
| `02-§21.2` | Archive page lists camps newest first (descending by `start_date`) | 03-ARCHITECTURE.md §4a | ARK-02 | `source/build/render-arkiv.js` – sort descending by `toDateString(start_date)` | covered |
| `02-§21.3` | Archive timeline is vertical; each camp is a point on a vertical line | 03-ARCHITECTURE.md §4a | — (manual: open arkiv.html and verify vertical layout with dots) | `source/assets/cs/style.css` – `.timeline`, `.timeline-dot`, `.timeline::before` | implemented |
| `02-§21.4` | Each camp is an accordion item — a clickable header that expands to reveal details | 03-ARCHITECTURE.md §4a | ARK-03 | `source/build/render-arkiv.js` – `.timeline-panel[hidden]`; `source/assets/js/client/arkiv.js` – toggles `hidden` | covered |
| `02-§21.5` | Only one accordion item may be open at a time; opening a new item closes any previously open item | 03-ARCHITECTURE.md §4a | — (manual: open two items in browser and verify only one stays open) | `source/assets/js/client/arkiv.js` – closes all other panels before opening new one | implemented |
| `02-§21.6` | Each accordion header is a `<button>` with `aria-expanded` and `aria-controls` attributes | 03-ARCHITECTURE.md §4a | ARK-04, ARK-05 | `source/build/render-arkiv.js` – `<button class="timeline-header" aria-expanded="false" aria-controls="…">` | covered |
| `02-§21.7` | Keyboard users can open and close accordion items using Enter or Space | 03-ARCHITECTURE.md §4a | — (manual: tab to header and press Enter or Space) | Native `<button>` keyboard behaviour; `arkiv.js` handles click event | implemented |
| `02-§21.8` | Expanded accordion shows information (if set) and Facebook link (if set) — no date/location | 03-ARCHITECTURE.md §4a | ARK-06 | `source/build/render-arkiv.js` – `renderArkivPage()` renders info + FB link, no `camp-meta` dl | covered |
| `02-§21.9` | Information text is omitted if empty | 03-ARCHITECTURE.md §4a | ARK-07 | `source/build/render-arkiv.js` – `info ? …camp-information… : ''` | covered |
| `02-§21.10` | Facebook link is omitted if empty | 03-ARCHITECTURE.md §4a | ARK-08 | `source/build/render-arkiv.js` – `link ? …camp-link… : ''` | covered |
| `02-§21.11` | No blank rows or placeholder text appear for empty fields | 03-ARCHITECTURE.md §4a | ARK-07, ARK-08 | `source/build/render-arkiv.js` – conditional rendering of optional fields | covered |
| `02-§21.12` | Accordion header shows camp name as primary text with date range and location in subdued gray text | 03-ARCHITECTURE.md §4a | ARK-09 | `source/build/render-arkiv.js` – `.timeline-name` + `.timeline-meta`; `source/assets/cs/style.css` – `.timeline-meta` | covered |
| `02-§21.13` | Header date range is formatted as `D–D månadsnamn YYYY` | 03-ARCHITECTURE.md §4a | ARK-10 | `source/build/render-arkiv.js` – `formatHeaderDateRange()` | covered |
| `02-§21.14` | Header location follows date range, separated by `·` | 03-ARCHITECTURE.md §4a | ARK-11 | `source/build/render-arkiv.js` – template `${headerDateRange} · ${location}` | covered |
| `02-§21.15` | On narrow viewports the header metadata may wrap below the camp name but remains visually subdued | 03-ARCHITECTURE.md §4a | — (manual: resize viewport and verify `.timeline-meta` wraps) | `source/assets/cs/style.css` – `@media (max-width: 690px)` `.timeline-meta` rules | implemented |
| `02-§21.16` | When a camp accordion is expanded, its timeline dot is visually highlighted (larger, accent color) | 03-ARCHITECTURE.md §4a | — (manual: open an accordion and verify dot grows) | `source/assets/js/client/arkiv.js` – toggles `.active` class; `source/assets/cs/style.css` – `.timeline-dot.active` | implemented |
| `02-§21.17` | When the accordion is collapsed the dot returns to default size | 03-ARCHITECTURE.md §4a | — (manual: close accordion and verify dot shrinks) | `source/assets/js/client/arkiv.js` – removes `.active` class on close | implemented |
| `02-§21.18` | Facebook logo image replaces text button when `link` is non-empty | 03-ARCHITECTURE.md §4a | ARK-12 | `source/build/render-arkiv.js` – `<img src="images/social-facebook-button-blue-icon-small.webp">` | covered |
| `02-§21.19` | Facebook logo is placed at top of panel content, before camp information | 03-ARCHITECTURE.md §4a | ARK-15 | `source/build/render-arkiv.js` – `linkHtml` rendered before `.camp-information` | covered |
| `02-§21.20` | Facebook link opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"` | 03-ARCHITECTURE.md §4a | ARK-14 | `source/build/render-arkiv.js` – `target="_blank" rel="noopener noreferrer"` on `<a>` | covered |
| `02-§21.21` | Facebook logo image has accessible `alt` text | 03-ARCHITECTURE.md §4a | ARK-13 | `source/build/render-arkiv.js` – `alt="Facebookgrupp"` | covered |
| `02-§21.22` | Each expanded accordion displays the camp's events from its YAML file, loaded at build time | 03-ARCHITECTURE.md §4a | ARK-16 | `source/build/render-arkiv.js` – `renderEventsSection()`; `source/build/build.js` – loads per-camp YAML into `campEventsMap` | covered |
| `02-§21.23` | Events are grouped by date with day headings (e.g. "måndag 3 augusti 2025") | 03-ARCHITECTURE.md §4a | ARK-17 | `source/build/render-arkiv.js` – `groupAndSortEvents()` + `formatDate()` headings | covered |
| `02-§21.24` | Within each date, events are sorted by start time ascending | 03-ARCHITECTURE.md §4a | ARK-18 | `source/build/render-arkiv.js` – `groupAndSortEvents()` sorts by `start` | covered |
| `02-§21.25` | Event rows use the same visual format as the weekly schedule: time, title, metadata | 03-ARCHITECTURE.md §4a | ARK-19 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` uses `.ev-time`, `.ev-title`, `.ev-meta` | covered |
| `02-§21.26` | Day headings are plain headings, not collapsible | 03-ARCHITECTURE.md §4a | ARK-21 | `source/build/render-arkiv.js` – `<h3>` headings, no `<details>` | covered |
| `02-§21.27` | Event rows with `description` or `link` are rendered as expandable `<details>` elements with ℹ️ icon, matching `schema.html` | 03-ARCHITECTURE.md §4a | ARK-20 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` renders `<details>` when `hasExtra` | covered |
| `02-§21.31` | Date range and location must not be repeated inside the accordion panel (already in header) | 03-ARCHITECTURE.md §4a | ARK-26 | `source/build/render-arkiv.js` – no `camp-meta` dl rendered in panel | covered |
| `02-§21.32` | Event rows without `description` or `link` remain flat (`<div class="event-row plain">`) | 03-ARCHITECTURE.md §4a | ARK-25 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` renders plain `<div>` when no extras | covered |
| `02-§21.28` | If a camp has no events in its YAML file, the event list section is omitted | 03-ARCHITECTURE.md §4a | ARK-22, ARK-23 | `source/build/render-arkiv.js` – `renderEventsSection()` returns `''` for empty events | covered |
| `02-§21.29` | Archive page uses the same typography scale, color tokens, and spacing tokens as the rest of the site | 03-ARCHITECTURE.md §4a, 07-DESIGN.md §7 | — (manual: visual comparison) | `source/assets/cs/style.css` – all archive CSS uses design tokens | implemented |
| `02-§21.30` | Event list styling matches the weekly schedule page in font size, weight, and color | 03-ARCHITECTURE.md §4a | — (manual: visual comparison) | `source/assets/cs/style.css` – reuses `.event-row`, `.ev-time`, `.ev-title`, `.ev-meta` classes | implemented |
| `02-§22.1` | Every page produced by the build includes a `<footer class="site-footer">` element at the bottom of `<body>` | 03-ARCHITECTURE.md §4b | FTR-02, FTR-04, FTR-06, FTR-08, FTR-10, FTR-12, FTR-14, FTR-16 | `source/build/layout.js` – `pageFooter()`; all render functions | covered |
| `02-§22.2` | Footer content is maintained in `source/content/footer.md` | 03-ARCHITECTURE.md §4b | — (convention; code review) | `source/content/footer.md` | implemented |
| `02-§22.3` | The build reads `footer.md`, converts it with `convertMarkdown()`, and injects the result into every page | 03-ARCHITECTURE.md §4b | FTR-03, FTR-04, FTR-06, FTR-08, FTR-10, FTR-12, FTR-14, FTR-16 | `source/build/build.js` – reads `footer.md`, calls `convertMarkdown()`, passes `footerHtml` to all render calls | covered |
| `02-§22.4` | No render function or template contains literal footer markup — `footer.md` is the single source of truth | 03-ARCHITECTURE.md §4b | — (code review: no hardcoded footer text in any render function) | Convention enforced by single-source architecture | implemented |
| `02-§22.5` | If `footer.md` is missing at build time, all pages render with an empty footer and the build does not crash | 03-ARCHITECTURE.md §4b | FTR-01, FTR-05, FTR-07, FTR-09, FTR-11, FTR-13, FTR-15, FTR-17 | `source/build/build.js` – `fs.existsSync()` fallback to `''`; `pageFooter('')` returns `''` | covered |
| `02-§22.6` | Updating `footer.md` and running the build changes the footer on all pages without modifying any other file | 03-ARCHITECTURE.md §4b | — (follows from §22.3; no separate test needed) | Verified structurally: `footerHtml` flows from `footer.md` through `convertMarkdown()` into every page | implemented |

| `02-§23.1` | CI must parse and structurally validate the changed event YAML file on event-branch PRs before merge | 03-ARCHITECTURE.md §11 | LNT-01 | `source/scripts/lint-yaml.js` – `validateYaml()` parses with js-yaml; `.github/workflows/event-data-deploy.yml` – `lint-yaml` job | covered |
| `02-§23.2` | Lint validates all required fields (id, title, date, start, end, location, responsible) are present and non-empty | 03-ARCHITECTURE.md §11.1 | LNT-02..09 | `source/scripts/lint-yaml.js` – `EVENT_REQUIRED` field loop | covered |
| `02-§23.3` | Lint validates that date is YYYY-MM-DD, calendar-valid, and within the camp's date range | 03-ARCHITECTURE.md §11.1 | LNT-10..13 | `source/scripts/lint-yaml.js` – `DATE_RE` check + `isNaN(new Date(d))` + camp range comparison | covered |
| `02-§23.4` | Lint validates start and end match HH:MM and end is strictly after start | 03-ARCHITECTURE.md §11.1 | LNT-14..17 | `source/scripts/lint-yaml.js` – `TIME_RE` checks + `e <= s` comparison | covered |
| `02-§23.5` | Lint rejects files with duplicate event IDs | 03-ARCHITECTURE.md §11.1 | LNT-18 | `source/scripts/lint-yaml.js` – `seenIds` Set with duplicate detection | covered |
| `02-§23.6` | Security scan checks free-text fields for injection patterns (script tags, javascript: URIs, on*= attributes, embedding elements, data: HTML URIs) | 03-ARCHITECTURE.md §11.2 | SEC-01..06 | `source/scripts/check-yaml-security.js` – `INJECTION_PATTERNS` array + field loop | covered |
| `02-§23.7` | Security scan rejects non-empty link values that do not start with http:// or https:// | 03-ARCHITECTURE.md §11.2 | SEC-07..09 | `source/scripts/check-yaml-security.js` – `/^https?:\/\//i` protocol check on `link` field | covered |
| `02-§23.8` | Security scan rejects text fields exceeding their character limits | 03-ARCHITECTURE.md §11.2 | SEC-10..13 | `source/scripts/check-yaml-security.js` – `MAX_LENGTHS` object + length checks | covered |
| `02-§23.9` | If the lint job fails, security scan, build, and deploy jobs must not run | 03-ARCHITECTURE.md §11 | — (CI end-to-end: submit a PR with invalid YAML and confirm only lint-yaml check fails) | `.github/workflows/event-data-deploy.yml` – `security-check` job has `needs: lint-yaml`; `build` has `needs: security-check`; `ftp-deploy` has `needs: build` | implemented |
| `02-§23.10` | If the security scan job fails, build and deploy jobs must not run | 03-ARCHITECTURE.md §11 | — (CI end-to-end: submit a PR with injected content and confirm lint passes but security fails) | `.github/workflows/event-data-deploy.yml` – `build` and `ftp-deploy` both depend on the `security-check` job via the `needs:` chain | implemented |
| `02-§23.11` | On successful validation the pipeline deploys schema.html, idag.html, dagens-schema.html, and events.json to FTP | 03-ARCHITECTURE.md §11.4 | — (CI end-to-end: submit a test event and verify pages update on FTP before PR merges) | `.github/workflows/event-data-deploy.yml` – `ftp-deploy` job uploads the four files via curl | implemented |
| `02-§23.12` | The targeted FTP upload must not modify any files outside the four schema-derived files | 03-ARCHITECTURE.md §11.4 | — (CI end-to-end: confirm no other FTP files are touched after an event PR) | `.github/workflows/event-data-deploy.yml` – `ftp-deploy` job explicitly names only the four files in the curl loop | implemented |
| `02-§23.13` | The targeted deployment must complete while the PR is still open (before auto-merge) | 03-ARCHITECTURE.md §11 | — (CI end-to-end: confirm FTP files update before the PR shows as merged) | `.github/workflows/event-data-deploy.yml` – triggered by `pull_request` event (not `push` to main), so it runs on the PR branch before merge | implemented |
| `02-§23.14` | CI workflows that diff against `main` must check out with sufficient git history for the three-dot diff to find a merge base | 03-ARCHITECTURE.md §11.6 | — (CI end-to-end: open an event PR and confirm the detect-changed-file step succeeds) | `.github/workflows/event-data-deploy.yml` – `fetch-depth: 0` on lint-yaml and security-check checkout steps | implemented |
| `02-§24.1` | Every page must include the same navigation header | 03-ARCHITECTURE.md §12 | NAV-01, NAV-01a..f | `source/build/layout.js` – `pageNav()`; all render functions accept and pass `navSections` | covered |
| `02-§24.2` | Navigation appears once per page, before page content | 03-ARCHITECTURE.md §12.1 | NAV-02 | `source/build/layout.js` – `pageNav()` emits a single `<nav>` element | covered |
| `02-§24.3` | Index page must not have a section-navigation menu below the hero | 03-ARCHITECTURE.md §12.5 | NAV-03 | `source/build/render-index.js` – `<nav class="section-nav">` removed entirely | covered |
| `02-§24.4` | Navigation contains links to all five main pages | 03-ARCHITECTURE.md §12.1 | NAV-04, NAV-04b..e | `source/build/layout.js` – `pageLinks` array in `pageNav()` | covered |
| `02-§24.5` | Current page link is visually marked active | 03-ARCHITECTURE.md §12.1 | NAV-05 | `source/build/layout.js` – `active` class appended when `href === activeHref` | covered |
| `02-§24.6` | Page links are identical on all pages including index | 03-ARCHITECTURE.md §12.1 | NAV-06 | `source/build/layout.js` – single `pageLinks` array; Idag always included (no exclusions) | covered |
| `02-§24.7` | Navigation includes anchor links to index page sections | 03-ARCHITECTURE.md §12.1 | NAV-07 | `source/build/layout.js` – `sectionRow` rendered when `navSections.length > 0` | covered |
| `02-§24.8` | Short nav labels defined per section via `nav:` in `sections.yaml` | 03-ARCHITECTURE.md §12.3 | NAV-08 | `source/content/sections.yaml` – `nav:` field on all 12 sections; `build.js` extracts `navSections` | covered |
| `02-§24.9` | Section links on non-index pages point to `index.html#id` | 03-ARCHITECTURE.md §12.1 | NAV-09, NAV-09b | `source/build/layout.js` – `onIndex` flag switches between `#id` and `index.html#id` | covered |
| `02-§24.10` | Mobile: navigation collapsed by default, toggled via hamburger | 03-ARCHITECTURE.md §12.1 | — (manual: open on mobile, confirm collapsed by default) | `source/assets/css/style.css` – `.nav-menu` hidden at ≤767 px; `source/assets/js/client/nav.js` – toggles `.is-open` | implemented |
| `02-§24.11` | Hamburger button has accessible `aria-label` | 03-ARCHITECTURE.md §12.4 | NAV-10 | `source/build/layout.js` – `aria-label="Öppna meny"` on toggle button | covered |
| `02-§24.12` | Hamburger button uses `aria-expanded` | 03-ARCHITECTURE.md §12.4 | NAV-11 | `source/build/layout.js` – `aria-expanded="false"` on toggle button; `nav.js` updates it on click | covered |
| `02-§24.13` | Expanded menu closable via Escape key | 03-ARCHITECTURE.md §12.4 | — (browser JS behaviour; cannot unit-test in Node) | `source/assets/js/client/nav.js` – `keydown` listener closes on `Escape` | implemented |
| `02-§24.14` | Expanded menu closable by clicking outside | 03-ARCHITECTURE.md §12.4 | — (browser JS behaviour; cannot unit-test in Node) | `source/assets/js/client/nav.js` – document `click` listener closes when outside nav | implemented |
| `02-§24.15` | Desktop: hamburger hidden, all links visible | 07-DESIGN.md §6 | — (manual: view on ≥768 px viewport, confirm hamburger absent) | `source/assets/css/style.css` – `.nav-toggle { display: none }` at `@media (min-width: 768px)` | implemented |

| `02-§25.1` | Content images have `loading="lazy"` (except first section) | 03-ARCHITECTURE.md §4b | IMG-01 | `source/build/render-index.js` – `marked` custom image renderer adds `loading="lazy"`; `renderIndexPage()` strips it from first section | covered |
| `02-§25.2` | Hero image must NOT have `loading="lazy"` | 03-ARCHITECTURE.md §4b | IMG-02 | `source/build/render-index.js` – hero uses separate template without `loading="lazy"` | covered |
| `02-§25.3` | Homepage head includes `<link rel="preload">` for hero image | 03-ARCHITECTURE.md §4b | IMG-03, IMG-04, IMG-05 | `source/build/render-index.js` – `preloadHtml` variable | covered |
| `02-§25.4` | Hero image has `fetchpriority="high"` | 03-ARCHITECTURE.md §4b | IMG-06 | `source/build/render-index.js` – hero `<img>` template | covered |
| `02-§25.5` | First-section images must NOT have `loading="lazy"` (LCP fix) | 03-ARCHITECTURE.md §4b | IMG-07 | `source/build/render-index.js` – `renderIndexPage()` strips `loading="lazy"` when `i === 0` | covered |
| `02-§25.6` | `nav.js` script tag must include `defer` on all pages | 03-ARCHITECTURE.md §4b | STR-NAV-01..06 | All 6 render files + snapshot | covered |

| `02-§27.1` | "Past" means event date is strictly before today's local date | 02-REQUIREMENTS.md §27.1 | — | Definition only; enforced by 02-§27.2–27.6 | — |
| `02-§27.2` | Add-activity form blocks submission when date is in the past | 02-REQUIREMENTS.md §27.2 | PDT-01 (manual: open form, pick yesterday, submit → error shown) | `source/assets/js/client/lagg-till.js` – `date < today` check before submit | implemented |
| `02-§27.3` | Edit-activity form blocks submission when date is in the past | 02-REQUIREMENTS.md §27.3 | PDT-02 (manual: edit event, change date to past, submit → error shown) | `source/assets/js/client/redigera.js` – `date < submitToday` check before submit | implemented |
| `02-§27.4` | `POST /add-event` rejects past dates with HTTP 400 | 02-REQUIREMENTS.md §27.4 | PDT-03, PDT-04 | `source/api/validate.js` – `isDatePast()` in `validateEventRequest` | covered |
| `02-§27.5` | `POST /edit-event` rejects submitted past dates with HTTP 400 | 02-REQUIREMENTS.md §27.5 | PDT-05, PDT-06 | `source/api/validate.js` – `isDatePast()` in `validateEditRequest` | covered |
| `02-§27.6` | Past-date check is in the shared validation module | 02-REQUIREMENTS.md §27.6 | PDT-03..06 | `source/api/validate.js` – single `isDatePast()` function | covered |

| `02-§28.1` | List includes camps where `archived === false` OR `start_date` year matches current year | 03-ARCHITECTURE.md §14.3 | UC-01, UC-02, UC-03 | `source/build/render-index.js` – `renderUpcomingCampsHtml()` filter logic | covered |
| `02-§28.2` | "Current year" evaluated at page-load time in browser | 03-ARCHITECTURE.md §14.3 | — (manual: build uses `new Date().getFullYear()` at build time; year boundary is a rare edge case; build runs frequently) | `source/build/build.js` – passes `new Date().getFullYear()` to `renderUpcomingCampsHtml()` | implemented |
| `02-§28.3` | Camps sorted by `start_date` ascending | 03-ARCHITECTURE.md §14.3 | UC-04 | `source/build/render-index.js` – `.sort()` in `renderUpcomingCampsHtml()` | covered |
| `02-§28.4` | Camp is "past" when `end_date` < today | 03-ARCHITECTURE.md §14.5 | — (manual: open index in browser after a camp ends, verify `.camp-past` class applied) | `source/build/render-index.js` – inline `<script>` compares `data-end` < today | implemented |
| `02-§28.5` | "Today" evaluated client-side using Stockholm time | 03-ARCHITECTURE.md §14.5 | — (manual: browser JS uses `toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })`) | `source/build/render-index.js` – inline `<script>` | implemented |
| `02-§28.6` | Past camps shown with green checkmark and strikethrough | 03-ARCHITECTURE.md §14.6 | — (manual: open index after a camp ends, verify green check + line-through) | `source/assets/cs/style.css` – `.camp-past .camp-check` + `.camp-past .camp-name` | implemented |
| `02-§28.7` | Upcoming camps shown with unchecked indicator and normal text | 03-ARCHITECTURE.md §14.6 | UC-12 | `source/build/render-index.js` – `<span class="camp-check">` rendered for all items; CSS shows transparent check by default | covered |
| `02-§28.8` | Section uses data from `camps.yaml` | 03-ARCHITECTURE.md §14.2 | UC-01..04 (all tests pass camps array from camps.yaml structure) | `source/build/build.js` – passes `camps` to `renderUpcomingCampsHtml()` | covered |
| `02-§28.9` | Section heading is "Kommande läger" | 03-ARCHITECTURE.md §14.3 | UC-05 | `source/build/render-index.js` – `<h2>Kommande läger</h2>` | covered |
| `02-§28.10` | Section positioned via `sections.yaml` | 03-ARCHITECTURE.md §14.4 | — (manual: verify `sections.yaml` has `type: upcoming-camps` entry) | `source/content/sections.yaml` – `type: upcoming-camps` entry; `source/build/build.js` – handles the type | implemented |
| `02-§28.11` | Each item shows camp name, location, and date range | 03-ARCHITECTURE.md §14.3 | UC-06 | `source/build/render-index.js` – `.camp-name`, `.camp-meta` spans in `renderUpcomingCampsHtml()` | covered |
| `02-§28.12` | Camp name linked if `link` is non-empty | 03-ARCHITECTURE.md §14.3 | UC-07, UC-08 | `source/build/render-index.js` – conditional `<a>` wrapper in `renderUpcomingCampsHtml()` | covered |
| `02-§28.13` | Information text shown when non-empty | 03-ARCHITECTURE.md §14.3 | UC-09, UC-10 | `source/build/render-index.js` – conditional `.camp-info` paragraph | covered |
| `02-§28.14` | Past/upcoming status via client-side script with `data-end` attribute | 03-ARCHITECTURE.md §14.5 | UC-11 | `source/build/render-index.js` – `data-end` attribute on `<li>`; inline `<script>` applies `.camp-past` | covered |
| `02-§28.15` | No daily rebuilds needed for status updates | 03-ARCHITECTURE.md §14.5 | — (architectural constraint; client-side JS evaluates dates at page load) | `source/build/render-index.js` – inline `<script>` runs on every page load | implemented |
| `02-§28.16` | Uses only CSS custom properties from 07-DESIGN.md | 03-ARCHITECTURE.md §14.6 | — (manual: inspect `style.css` `.upcoming-camps` section — all values use `--color-*`, `--space-*`, `--font-*`, `--radius-*` tokens) | `source/assets/cs/style.css` – upcoming-camps section | implemented |
| `02-§28.17` | Client-side script is minimal — no framework | 03-ARCHITECTURE.md §14.5 | — (manual: inline IIFE, 6 lines, no imports) | `source/build/render-index.js` – inline `<script>` | implemented |

| `02-§29.1` | Camp `name` format is `{type} {year} {month}` (e.g. "SB sommar 2026 augusti") | 05-DATA_CONTRACT.md §1 | — (data convention; verified by inspection of `camps.yaml`) | `source/data/camps.yaml` – all camp names follow the format | implemented |
| `02-§29.2` | Month names in camp names are lowercase (Swedish convention) | 05-DATA_CONTRACT.md §1 | — (data convention) | `source/data/camps.yaml` – all months lowercase | implemented |
| `02-§29.3` | Camp type name uses sentence case (e.g. "SB sommar", not "SB Sommar") | 05-DATA_CONTRACT.md §1 | — (data convention) | `source/data/camps.yaml` – "SB sommar", "SB vinter" | implemented |

| `02-§1a.1` | The build generates a `robots.txt` that disallows all user agents from all paths | 03-ARCHITECTURE.md §4c | — (manual: run `npm run build` and verify `public/robots.txt` contains `User-agent: *` and `Disallow: /`) | `source/build/build.js` – writes `public/robots.txt` | implemented |
| `02-§1a.2` | Every HTML page includes `<meta name="robots" content="noindex, nofollow">` in `<head>` | 03-ARCHITECTURE.md §4c | ROB-01..07 | All 7 render files – `<meta name="robots">` in `<head>` | covered |
| `02-§1a.3` | No sitemap, Open Graph tags, or other discoverability metadata on any page | 03-ARCHITECTURE.md §4c | ROB-08..14 | No discoverability tags in any render file | covered |

| `02-§26.1` | Each camp in `camps.yaml` has an `opens_for_editing` field (YYYY-MM-DD) | 05-DATA_CONTRACT.md §1 | — | `source/data/camps.yaml` – all 9 camps have `opens_for_editing` | implemented |
| `02-§26.2` | Submission period runs from `opens_for_editing` through `end_date + 1 day` | 03-ARCHITECTURE.md §13.1 | GATE-05..10 | `source/api/time-gate.js` – `isOutsideEditingPeriod()` | covered |
| `02-§26.3` | Before period: add-activity form greyed out (reduced opacity) | 03-ARCHITECTURE.md §13.3 | — (manual: open form before `opens_for_editing`, confirm fields greyed out) | `source/assets/js/client/lagg-till.js` – sets `fieldset.disabled` and `form-gated` class | implemented |
| `02-§26.4` | Before period: submit button disabled | 03-ARCHITECTURE.md §13.3 | — (manual: open form before period, confirm submit disabled) | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true` | implemented |
| `02-§26.5` | Before period: message shown stating when it opens | 03-ARCHITECTURE.md §13.3 | — (manual: open form before period, confirm message with formatted Swedish date) | `source/assets/js/client/lagg-till.js` – inserts `.form-gate-msg` element | implemented |
| `02-§26.6` | After period: add-activity form greyed out (reduced opacity) | 03-ARCHITECTURE.md §13.3 | — (manual: open form after `end_date + 1`, confirm fields greyed out) | `source/assets/js/client/lagg-till.js` – sets `fieldset.disabled` and `form-gated` class | implemented |
| `02-§26.7` | After period: submit button disabled | 03-ARCHITECTURE.md §13.3 | — (manual: open form after period, confirm submit disabled) | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true` | implemented |
| `02-§26.8` | After period: message shown stating camp has ended | 03-ARCHITECTURE.md §13.3 | — (manual: open form after period, confirm "Lägret är avslutat" message) | `source/assets/js/client/lagg-till.js` – inserts `.form-gate-msg` with "Lägret är avslutat." | implemented |
| `02-§26.9` | Same time-gating rules apply to edit-activity form | 03-ARCHITECTURE.md §13.3 | — (manual: open edit form outside period, confirm gating behaviour) | `source/assets/js/client/redigera.js` – time-gate check using `data-opens` / `data-closes` | implemented |
| `02-§26.10` | `POST /add-event` rejects with HTTP 403 outside period | 03-ARCHITECTURE.md §13.4 | GATE-05..10 (logic); — (manual: POST outside period) | `app.js` – `isOutsideEditingPeriod()` check before validation | implemented |
| `02-§26.11` | `POST /edit-event` rejects with HTTP 403 outside period | 03-ARCHITECTURE.md §13.4 | GATE-05..10 (logic); — (manual: POST outside period) | `app.js` – `isOutsideEditingPeriod()` check before validation | implemented |
| `02-§26.12` | API error response includes Swedish message | 03-ARCHITECTURE.md §13.4 | — (manual: inspect 403 response body) | `app.js` – Swedish error strings in both endpoints | implemented |
| `02-§26.13` | Build embeds `opens_for_editing` and `end_date` as `data-` attributes on form | 03-ARCHITECTURE.md §13.2 | GATE-01..04, REDT-22..24 | `source/build/render-add.js`, `source/build/render-edit.js` – `data-opens` and `data-closes` on `<form>` | covered |
| `05-§1.6` | `opens_for_editing` field documented in data contract | 05-DATA_CONTRACT.md §1 | — | `docs/05-DATA_CONTRACT.md` – field added to schema and described | implemented |
| `02-§30.1` | Hero two-column layout: image ~2/3, sidebar ~1/3 | 03-ARCHITECTURE.md §15, 07-DESIGN.md §6 | HERO-01, HERO-02 | `source/build/render-index.js` – `.hero` grid, `.hero-main`, `.hero-sidebar`; `style.css` – `grid-template-columns: 2fr 1fr` | covered |
| `02-§30.2` | Mobile: hero stacks vertically | 03-ARCHITECTURE.md §15, 07-DESIGN.md §6 | — (manual: resize to <690px) | `style.css` – `@media (max-width: 690px) { .hero { grid-template-columns: 1fr } }` | implemented |
| `02-§30.3` | Title "Sommarläger i Sysslebäck" above image, left-aligned | 03-ARCHITECTURE.md §15 | HERO-03 | `source/build/render-index.js` – `<h1 class="hero-title">Sommarläger i Sysslebäck</h1>` | covered |
| `02-§30.4` | Title uses terracotta color | 07-DESIGN.md §6 | HERO-04 | `style.css` – `.hero-title { color: var(--color-terracotta) }` | covered |
| `02-§30.5` | Title uses H1 size (40px) and weight (700) | 07-DESIGN.md §3 | HERO-04 | `style.css` – `.hero-title { font-size: 40px; font-weight: 700 }` | covered |
| `02-§30.6` | Hero image has rounded corners (--radius-lg) | 07-DESIGN.md §7 | — (manual: visual check) | `style.css` – `.hero-img { border-radius: var(--radius-lg) }` | implemented |
| `02-§30.7` | Hero image uses object-fit: cover and is responsive | 07-DESIGN.md §6 | HERO-05, HERO-06 | `style.css` – `.hero-img { object-fit: cover; width: 100% }` | covered |
| `02-§30.8` | Image occupies ~2/3 of hero width on desktop | 07-DESIGN.md §6 | HERO-01 | `style.css` – `.hero { grid-template-columns: 2fr 1fr }` | covered |
| `02-§30.9` | Sidebar contains Discord and Facebook icons stacked vertically | 03-ARCHITECTURE.md §15.4 | HERO-09 | `source/build/render-index.js` – `.hero-sidebar` with two `.hero-social-link` | covered |
| `02-§30.10` | Discord icon links to Discord channel | 03-ARCHITECTURE.md §15.4 | HERO-07 | `source/build/render-index.js` – `<a href="${discordUrl}">` | covered |
| `02-§30.11` | Facebook icon links to Facebook group | 03-ARCHITECTURE.md §15.4 | HERO-08 | `source/build/render-index.js` – `<a href="${facebookUrl}">` | covered |
| `02-§30.12` | Icons displayed at ~64px, vertically centered | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-social-link img { width: 64px; height: 64px }` | implemented |
| `02-§30.13` | Countdown shows days remaining until next camp | 03-ARCHITECTURE.md §15.3 | HERO-10 | `source/build/render-index.js` – countdown inline script | covered |
| `02-§30.14` | Countdown target derived from camps.yaml (nearest future camp) | 03-ARCHITECTURE.md §15.2 | HERO-10 | `source/build/build.js` – `futureCamps` filter and sort | covered |
| `02-§30.15` | Countdown shows large number + "Dagar kvar" label | 07-DESIGN.md §6 | HERO-11, HERO-13 | `source/build/render-index.js` – `.hero-countdown-number` + `.hero-countdown-label` | covered |
| `02-§30.16` | Countdown target embedded as data-target; JS computes on load | 03-ARCHITECTURE.md §15.3 | HERO-10 | `source/build/render-index.js` – `data-target="${countdownTarget}"` | covered |
| `02-§30.17` | Countdown hidden if no future camp | 03-ARCHITECTURE.md §15.3 | HERO-12 | `source/build/render-index.js` – no countdown HTML when `countdownTarget` is null | covered |
| `02-§30.18` | Countdown has subtle cream/sand background | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.19` | All hero styling uses CSS custom properties | 07-DESIGN.md §7 | — (manual: CSS review) | `style.css` – all hero rules use `var(--…)` tokens | implemented |
| `02-§30.20` | Countdown JS is minimal, no framework | 03-ARCHITECTURE.md §15.3 | — (manual: code review) | `source/build/render-index.js` – ~8-line inline `<script>` | implemented |
| `02-§30.21` | Social icon images stored in source/content/images/ | 03-ARCHITECTURE.md §15.4 | — | `source/content/images/DiscordLogo.webp`, `social-facebook-button-blue-icon-small.webp` | implemented |
| `02-§30.22` | Social links provided at build time, not hardcoded | 03-ARCHITECTURE.md §15.2 | HERO-14, HERO-15 | `source/build/build.js` – passes `discordUrl`, `facebookUrl` to `renderIndexPage` | covered |
| `02-§30.23` | Countdown background color is `#FAF7EF` (solid, not semi-transparent) | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.24` | Discord icon uses `DiscordLogo.webp` | 03-ARCHITECTURE.md §15.4 | HERO-16 | `render-index.js` – `DiscordLogo.webp` in Discord link `<img>` | covered |
| `02-§30.25` | Sidebar vertically centered alongside hero image | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero { align-items: center }` | implemented |

### 31. Inline Camp Listing and Link Styling

| ID | Requirement | Design ref | Test ID(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§31.1` | Camp listing rendered inside intro section after first h4 | 07-DESIGN.md §6 | — (manual: visual check) | `source/build/build.js` – injects camp HTML after first `</h4>` | implemented |
| `02-§31.2` | Camp listing is not a separate section or nav entry | 07-DESIGN.md §6 | — (manual: visual check) | `source/content/sections.yaml` – `upcoming-camps` entry removed | implemented |
| `02-§31.3` | Upcoming camps show sun icon (☀️) | 07-DESIGN.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-icon::after { content: '☀️' }` | implemented |
| `02-§31.4` | Past camps show green checkbox (✅) | 07-DESIGN.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-past .camp-icon::after { content: '✅' }` | implemented |
| `02-§31.5` | Status detection remains client-side via data-end | 02-§28.14 | UC-11 | `source/build/render-index.js` – same inline `<script>` | covered |
| `02-§31.6` | Each item shows name, location, date range | 02-§28.11–13 | UC-06 | `source/build/render-index.js` – `renderUpcomingCampsHtml()` | covered |
| `02-§31.7` | Camp information text no longer rendered | — | — | `source/build/render-index.js` – info block removed | implemented |
| `02-§31.8` | Content links use terracotta color | 07-DESIGN.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { color: var(--color-terracotta) }` | implemented |
| `02-§31.9` | Content links no underline, underline on hover | 07-DESIGN.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { text-decoration: none }` | implemented |
| `02-§31.10` | Markdown converter supports h4 headings | — | — (manual: build output check) | `source/build/render-index.js` – `####` pattern added | implemented |
| `02-§31.11` | All styling uses CSS custom properties | 07-DESIGN.md §7 | — (manual: code review) | `source/assets/cs/style.css` | implemented |
| `02-§31.12` | No additional runtime JS | — | — (manual: code review) | No new scripts added | implemented |
| `02-§32.1` | HTML validation uses `html-validate` | 03-ARCHITECTURE.md §11.5 | manual: check `package.json` devDeps include `html-validate` | `package.json` devDeps: `html-validate` | implemented |
| `02-§32.2` | Validation runs on all `public/*.html` after build | 03-ARCHITECTURE.md §11.5 | manual: run `npm run build && npm run lint:html` | `package.json` lint:html script targets `public/*.html` | implemented |
| `02-§32.3` | `lint:html` npm script runs `html-validate` | 03-ARCHITECTURE.md §11.5 | manual: run `npm run lint:html` | `package.json` lint:html script | implemented |
| `02-§32.4` | CI runs `lint:html` after build step | 03-ARCHITECTURE.md §11.5 | manual: inspect `ci.yml` for `lint:html` step after build | `.github/workflows/ci.yml` – Validate HTML step | implemented |
| `02-§32.5` | HTML validation failures fail CI | 03-ARCHITECTURE.md §11.5 | manual: `lint:html` step has no `continue-on-error` | `.github/workflows/ci.yml` – default fail behaviour | implemented |
| `02-§32.6` | HTML validation skipped for data-only commits | 03-ARCHITECTURE.md §11.5 | manual: `lint:html` step uses same `has_code` condition | `.github/workflows/ci.yml` – `if: has_code == 'true'` | implemented |
| `02-§32.7` | Configured via `.htmlvalidate.json` | 03-ARCHITECTURE.md §11.5 | manual: file exists at project root | `.htmlvalidate.json` | implemented |
| `02-§32.8` | Rules tuned to accept existing generated HTML | 03-ARCHITECTURE.md §11.5 | manual: `npm run build && npm run lint:html` passes | `.htmlvalidate.json` – 4 rules tuned | implemented |
| `02-§33.1` | CSS linting uses Stylelint with `stylelint-config-standard` | 03-ARCHITECTURE.md §11.5 | manual: check `package.json` devDeps and `.stylelintrc.json` | `package.json` devDeps: `stylelint`, `stylelint-config-standard`; `.stylelintrc.json` extends | implemented |
| `02-§33.2` | Linting runs on `source/assets/cs/*.css` | 03-ARCHITECTURE.md §11.5 | manual: run `npm run lint:css` | `package.json` lint:css script targets `source/assets/cs/**/*.css` | implemented |
| `02-§33.3` | `lint:css` npm script runs Stylelint | 03-ARCHITECTURE.md §11.5 | manual: run `npm run lint:css` | `package.json` lint:css script | implemented |
| `02-§33.4` | CI runs `lint:css` alongside existing lint steps | 03-ARCHITECTURE.md §11.5 | manual: inspect `ci.yml` for `lint:css` step | `.github/workflows/ci.yml` – Lint CSS step | implemented |
| `02-§33.5` | CSS lint failures fail CI | 03-ARCHITECTURE.md §11.5 | manual: `lint:css` step has no `continue-on-error` | `.github/workflows/ci.yml` – default fail behaviour | implemented |
| `02-§33.6` | CSS linting skipped for data-only commits | 03-ARCHITECTURE.md §11.5 | manual: `lint:css` step uses same `has_code` condition | `.github/workflows/ci.yml` – `if: has_code == 'true'` | implemented |
| `02-§33.7` | Configured via `.stylelintrc.json` | 03-ARCHITECTURE.md §11.5 | manual: file exists at project root | `.stylelintrc.json` | implemented |
| `02-§33.8` | Rules tuned to accept existing CSS | 03-ARCHITECTURE.md §11.5 | manual: `npm run lint:css` passes | `.stylelintrc.json` – 9 rules tuned | implemented |

### §34 — Derived Active Camp

| ID | Requirement | Doc reference | Test | Implementation | Status |
| -- | ----------- | ------------- | ---- | -------------- | ------ |
| `02-§34.1` | Active camp derived from dates with defined priority | 03-ARCHITECTURE.md §2 | DAC-01..07 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§34.2` | On-dates camp is active | 03-ARCHITECTURE.md §2 | DAC-01 | `resolve-active-camp.js` | covered |
| `02-§34.3` | Next upcoming camp if none on dates | 03-ARCHITECTURE.md §2 | DAC-02 | `resolve-active-camp.js` | covered |
| `02-§34.4` | Most recent camp if no upcoming | 03-ARCHITECTURE.md §2 | DAC-03 | `resolve-active-camp.js` | covered |
| `02-§34.5` | Overlapping camps: earlier start_date wins | 03-ARCHITECTURE.md §2 | DAC-04 | `resolve-active-camp.js` | covered |
| `02-§34.6` | `active` field removed from camps.yaml | 05-DATA_CONTRACT.md §1 | DAC-05 | `source/data/camps.yaml` | covered |
| `02-§34.7` | `active` field removed from data contract | 05-DATA_CONTRACT.md §1 | manual: field absent in doc | `docs/05-DATA_CONTRACT.md` | implemented |
| `02-§34.8` | active+archived lint check removed | — | DAC-06 | `source/scripts/lint-yaml.js` | covered |
| `02-§34.9` | build.js uses derivation at build time | 03-ARCHITECTURE.md §5 | DAC-07 | `source/build/build.js` | covered |
| `02-§34.10` | Resolved camp logged to stdout | 03-ARCHITECTURE.md §5 | manual: build output | `source/build/build.js` | implemented |
| `02-§34.11` | github.js uses derivation for API requests | 03-ARCHITECTURE.md §3 | manual: code review | `source/api/github.js` | implemented |
| `02-§34.12` | Derivation logic shared (not duplicated) | 03-ARCHITECTURE.md §2 | manual: code review | `source/scripts/resolve-active-camp.js` | implemented |
| `02-§34.13` | lint-yaml no longer checks active field | — | DAC-06 | `source/scripts/lint-yaml.js` | covered |
| `02-§34.14` | Existing active-field tests updated/removed | — | manual: `npm test` passes | test files | implemented |
| `02-§15.3` | RSS feed is valid RSS 2.0 XML | 03-ARCHITECTURE.md §17 | RSS-01 | `source/build/render-rss.js` | covered |
| `02-§15.4` | Feed metadata in Swedish (title, description, language) | 03-ARCHITECTURE.md §17.3 | RSS-02 | `source/build/render-rss.js` | covered |
| `02-§15.5` | Feed `<link>` points to weekly schedule via SITE_URL | 03-ARCHITECTURE.md §17.2, §17.3 | RSS-03 | `source/build/render-rss.js` | covered |
| `02-§15.6` | One `<item>` per event in the active camp | 03-ARCHITECTURE.md §17.3 | RSS-04 | `source/build/render-rss.js` | covered |
| `02-§15.7` | Each item has title, link, guid, description, pubDate | 03-ARCHITECTURE.md §17.3 | RSS-05, RSS-06, RSS-07, RSS-12 | `source/build/render-rss.js` | covered |
| `02-§15.8` | Items sorted chronologically | 03-ARCHITECTURE.md §17.3 | RSS-08 | `source/build/render-rss.js` | covered |
| `02-§15.9` | Feed generated at build time by render-rss.js | 03-ARCHITECTURE.md §17, §17.6 | RSS-01 | `source/build/render-rss.js`, `source/build/build.js` | covered |
| `02-§15.10` | No RSS library dependency | 03-ARCHITECTURE.md §17 | RSS-09 | `source/build/render-rss.js` — no external RSS imports | covered |
| `02-§15.11` | Absolute URLs require configurable base URL | 03-ARCHITECTURE.md §17.2 | RSS-03, RSS-05 | `source/build/build.js` — `SITE_URL` env var | covered |
| `02-§15.12` | Build reads SITE_URL from environment variable | 03-ARCHITECTURE.md §17.2 | manual: build output | `source/build/build.js` — `process.env.SITE_URL` | implemented |
| `02-§15.13` | Build fails if SITE_URL is not set | 03-ARCHITECTURE.md §17.2 | manual: run build without SITE_URL | `source/build/build.js` — `process.exit(1)` | implemented |
| `02-§15.14` | CI workflows pass SITE_URL alongside API_URL | 03-ARCHITECTURE.md §17.7 | manual: CI workflow config | `.github/workflows/deploy.yml`, `ci.yml`, `event-data-deploy.yml` | implemented |
| `02-§15.15` | RSS description uses structured multi-line format: date+time, plats+ansvarig, description, link | 03-ARCHITECTURE.md §17.3 | RSS-13 | `source/build/render-rss.js` — `buildDescription()` | gap |
| `02-§36.1` | Each event has its own static HTML page | 03-ARCHITECTURE.md §18 | EVT-01 | `source/build/render-event.js` | covered |
| `02-§36.2` | Event pages at `/schema/{event-id}/index.html` | 03-ARCHITECTURE.md §18 | manual: build output | `source/build/build.js` — creates dirs | implemented |
| `02-§36.3` | Event page shows title, date, time, location, responsible, description, link | 03-ARCHITECTURE.md §18.2 | EVT-01..07 | `source/build/render-event.js` | covered |
| `02-§36.4` | Empty fields omitted from event page | 03-ARCHITECTURE.md §18.2 | EVT-08, EVT-09 | `source/build/render-event.js` | covered |
| `02-§36.5` | owner and meta fields never shown on event pages | 03-ARCHITECTURE.md §18.2 | EVT-10 | `source/build/render-event.js` | covered |
| `02-§36.6` | Event pages use shared layout (nav, footer, stylesheet) | 03-ARCHITECTURE.md §18.3 | EVT-11, EVT-12, EVT-13 | `source/build/render-event.js` | covered |
| `02-§36.7` | Event page includes back link to weekly schedule | 03-ARCHITECTURE.md §18.2 | EVT-14 | `source/build/render-event.js` | covered |
| `02-§36.8` | Event pages include meta robots noindex nofollow | 03-ARCHITECTURE.md §18.3 | EVT-15 | `source/build/render-event.js` | covered |
| `02-§36.9` | Event pages generated by render-event.js | 03-ARCHITECTURE.md §18.6 | EVT-01 | `source/build/render-event.js`, `source/build/build.js` | covered |
| `02-§36.10` | Build creates `/schema/{event-id}/` directories | 03-ARCHITECTURE.md §18.4 | manual: build output | `source/build/build.js` | implemented |

### §35 — Location Accordions on Index Page

| ID | Requirement | Doc reference | Test | Implementation | Status |
| -- | ----------- | ------------- | ---- | -------------- | ------ |
| `02-§35.1` | Lokaler heading renders as regular heading, not accordion | 03-ARCHITECTURE.md §16 | manual: build output shows `<h3>Lokaler</h3>` | `sections.yaml` — `collapsible` removed | implemented |
| `02-§35.2` | Introductory paragraph stays visible above accordions | 03-ARCHITECTURE.md §16 | manual: build output shows `<p>` before first `<details>` | `render-index.js` — markdown rendered normally | implemented |
| `02-§35.3` | Each location renders as `<details class="accordion">` | 03-ARCHITECTURE.md §16 | LOC-01 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.4` | Location name appears as `<summary>` text | 03-ARCHITECTURE.md §16 | LOC-02 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.5` | Location information appears in accordion body | 03-ARCHITECTURE.md §16 | LOC-03 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.6` | Location images render as `<img>` in accordion body | 03-ARCHITECTURE.md §16 | LOC-04, LOC-05 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.7` | Empty locations render as accordion with empty body | 03-ARCHITECTURE.md §16 | LOC-06 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.8` | Accordions appear in `local.yaml` order | 03-ARCHITECTURE.md §16 | LOC-07 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.9` | Build passes full location data to index pipeline | 03-ARCHITECTURE.md §16 | LOC-01 (indirect) | `build.js` — `allLocations` → `renderLocationAccordions()` | covered |
| `02-§35.10` | `collapsible: true` removed from lokaler in sections.yaml | 03-ARCHITECTURE.md §16 | manual: file diff | `sections.yaml` | implemented |
| `02-§37.1` | camps.yaml entries have all required fields | 03-ARCHITECTURE.md §19 | VCMP-01..08 | `validate-camps.js` | covered |
| `02-§37.2` | Date fields are valid YYYY-MM-DD | 03-ARCHITECTURE.md §19 | VCMP-09..12 | `validate-camps.js` | covered |
| `02-§37.3` | end_date on or after start_date | 03-ARCHITECTURE.md §19 | VCMP-13..14 | `validate-camps.js` | covered |
| `02-§37.4` | archived is boolean | 03-ARCHITECTURE.md §19 | VCMP-15..16 | `validate-camps.js` | covered |
| `02-§37.5` | Camp id values are unique | 03-ARCHITECTURE.md §19 | VCMP-17 | `validate-camps.js` | covered |
| `02-§37.6` | Camp file values are unique | 03-ARCHITECTURE.md §19 | VCMP-18 | `validate-camps.js` | covered |
| `02-§37.7` | Non-zero exit on validation error | 03-ARCHITECTURE.md §19 | VCMP-19..20 | `validate-camps.js` | covered |
| `02-§37.8` | Missing camp files created automatically | 03-ARCHITECTURE.md §19 | VCMP-21 | `validate-camps.js` | covered |
| `02-§37.9` | Created files have camp header from camps.yaml | 03-ARCHITECTURE.md §19 | VCMP-22 | `validate-camps.js` | covered |
| `02-§37.10` | Created files have empty events section | 03-ARCHITECTURE.md §19 | VCMP-23 | `validate-camps.js` | covered |
| `02-§37.11` | Field order: id, name, location, start_date, end_date | 03-ARCHITECTURE.md §19 | VCMP-24 | `validate-camps.js` | covered |
| `02-§37.12` | camps.yaml is single source of truth | 03-ARCHITECTURE.md §19 | VCMP-25 | `validate-camps.js` | covered |
| `02-§37.13` | Validator compares camp header against camps.yaml | 03-ARCHITECTURE.md §19 | VCMP-25 | `validate-camps.js` | covered |
| `02-§37.14` | Validator updates camp file to match camps.yaml | 03-ARCHITECTURE.md §19 | VCMP-26 | `validate-camps.js` | covered |
| `02-§37.15` | Field order preserved after sync | 03-ARCHITECTURE.md §19 | VCMP-27 | `validate-camps.js` | covered |
| `02-§37.16` | Runnable as npm run validate:camps | 03-ARCHITECTURE.md §19 | manual: `npm run validate:camps` | `package.json` | implemented |
| `02-§37.17` | Logs each action to stdout | 03-ARCHITECTURE.md §19 | VCMP-28 | `validate-camps.js` | covered |
| `02-§37.18` | Importable as module for tests | 03-ARCHITECTURE.md §19 | VCMP-29 | `validate-camps.js` | covered |
| `02-§38.1` | Build uses `marked` as markdown converter | 03-ARCHITECTURE.md §20 | RNI-01..38 | `source/build/render-index.js` – `require('marked')` | covered |
| `02-§38.2` | `marked` is a production dependency (build-time only) | 03-ARCHITECTURE.md §20 | — | `package.json` dependencies | implemented |
| `02-§38.3` | No other new dependencies added | 03-ARCHITECTURE.md §20 | — | `package.json` | implemented |
| `02-§38.4` | Heading offset shifts heading levels, capped at h6 | 03-ARCHITECTURE.md §20 | RNI-17..21 | `render-index.js` – `createMarked()` custom heading renderer | covered |
| `02-§38.5` | Collapsible accordion wraps ##-level sections in `<details>` | 03-ARCHITECTURE.md §20 | RNI-22..28 | `render-index.js` – `convertMarkdown()` post-processing | covered |
| `02-§38.6` | Images have `class="content-img"` and `loading="lazy"` | 03-ARCHITECTURE.md §20 | RNI-03, IMG-01 | `render-index.js` – custom image renderer | covered |
| `02-§38.7` | Standard markdown features render correctly | 03-ARCHITECTURE.md §20 | MKD-01..05 | `render-index.js` – `marked.parse()` | covered |
| `02-§38.8` | Existing content files are not modified | 03-ARCHITECTURE.md §20 | — | No content files in diff | implemented |
| `02-§38.9` | Tables have basic CSS styling using design tokens | 03-ARCHITECTURE.md §20 | manual: visual check | `source/assets/cs/style.css` – `.content table` rules | implemented |
| `02-§38.10` | All existing tests pass | 03-ARCHITECTURE.md §20 | 785/785 pass | — | covered |
| `02-§38.11` | Build, lint, and HTML validation pass | 03-ARCHITECTURE.md §20 | manual: CI | — | implemented |

---

## Summary

```text
Total requirements:             571
Covered (implemented + tested): 292
Implemented, not tested:        278
Gap (no implementation):          0
Orphan tests (no requirement):    0

Note: Archive timeline implemented (02-§2.6, 02-§16.2, 02-§16.4, 02-§21.1–21.11).
8 of 11 new requirements are covered (ARK-01..08 tests).
3 are implemented but require manual/visual verification
  (02-§21.3 layout, 02-§21.5 single-open, 02-§21.7 keyboard).
02-§2.6, 02-§16.2, 02-§16.4 moved from gap to covered.
11 requirements added for archive timeline (02-§21.1–21.11), all now implemented.
13 requirements added for event data CI pipeline (02-§23.1–23.13):
  8 covered (LNT-01..18, SEC-01..13): 02-§23.1–23.8
  5 implemented (CI workflow, no unit test possible): 02-§23.9–23.13
15 requirements added for unified navigation (02-§24.1–24.15):
  11 covered (NAV-01..11): 02-§24.1–24.9, 02-§24.11–24.12
  4 implemented (CSS/JS mobile/desktop, browser-only): 02-§24.10, 02-§24.13–24.15

Snapshot updated to include Arkiv nav link.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
02-§18.46 covered (BUILD-01..04): edit form URL derivation via editApiUrl().
02-§18.45 implemented (manual): edit form credentials: 'include' for cross-origin API.
02-§18.41 added and covered: cross-subdomain cookie domain fix (COOKIE_DOMAIN env var).
6 requirements added for shared site footer (02-§22.1–22.6): 4 covered (FTR tests), 2 implemented (convention + structural).
SES-14 and SES-15 verify Domain= is included/omitted correctly.
17 requirements added for add-activity submit UX flow (02-§19.1–19.17).
3 of these are covered (ADD-01..06 test structural HTML: 02-§19.7, 02-§19.17, and
  fieldset via ADD-02 for 02-§19.1).
14 are implemented but browser-only; cannot be unit-tested in Node.js.
3 requirements added for cookie consent UX fixes (02-§18.37–39).
02-§18.11 updated: only 'accepted' is now persisted (not 'declined').
End time is now required everywhere (add form, edit form, data contract).
02-§9.4, 05-§3.1, 05-§4.3, 02-§18.25 all moved to covered (VLD-27..32).
02-§18.40 added and implemented: ownerName crash fix.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
3 covered (EDIT-01, EDIT-02 partial, EDIT-04–06): §20.13, §20.1, §20.5.
10 implemented but browser-only; cannot be unit-tested in Node.js.
2 requirements added for CI checkout depth (CL-§9.5, 02-§23.14):
  both implemented (CI workflow config, no unit test possible).
4 requirements added for image loading performance (02-§25.1–25.4):
  all 4 covered (IMG-01..06 in render-index.test.js).
2 requirements added for speed-index performance fixes (02-§25.5–25.6):
  02-§25.5 covered (IMG-07): first-section images stripped of loading="lazy".
  02-§25.6 covered (snapshot + manual): nav.js defer on all pages.
  02-§25.1 updated: exception added for first-section images.
3 requirements added for search engine blocking (02-§1a.1–1a.3):
  2 covered (ROB-01..14): 02-§1a.2, 02-§1a.3
  1 implemented (build writes robots.txt; manual verification): 02-§1a.1
14 requirements added for form time-gating (02-§26.1–26.13, 05-§1.6):
  2 covered (GATE-01..10): 02-§26.2 (period logic), 02-§26.13 (data attributes).
  12 implemented (browser-only or manual): 02-§26.1, 02-§26.3–26.12, 05-§1.6.
6 requirements added for past-date blocking (02-§27.1–27.6):
  3 covered (PDT-03..06): 02-§27.4, 02-§27.5, 02-§27.6
  2 implemented (browser-only client validation): 02-§27.2, 02-§27.3
  1 definition (no implementation needed): 02-§27.1
19 requirements added for archive page improvements (02-§21.12–21.30):
  14 covered (ARK-09..24): header layout, FB logo, event list.
  5 implemented (browser-only or manual): responsive, active dot, visual consistency.
5 requirements added for archive cleanup and camp naming (02-§21.31–32, 02-§29.1–3):
  4 covered (ARK-06, ARK-20, ARK-25, ARK-26): 02-§21.8, 02-§21.27, 02-§21.31, 02-§21.32.
  3 implemented (data convention): 02-§29.1, 02-§29.2, 02-§29.3.
  02-§21.8 updated: date/location removed from accordion content.
  02-§21.27 updated: event rows now expandable when description/link present.
17 requirements added for upcoming camps on homepage (02-§28.1–28.17):
  10 covered (UC-01..14): filtering, sorting, heading, content, data-end, indicators.
  7 implemented (browser-only or manual): past-marking, Stockholm time, CSS tokens,
    section placement, no-rebuild, minimal JS.
02-§6.5 moved from gap to covered (ILE-01..04, ILE-E01..E04):
  per-field inline validation errors on add and edit forms.
22 requirements added for hero section redesign (02-§30.1–30.22):
  15 covered (HERO-01..15): layout structure, title, image, social links, countdown.
  7 implemented (browser-only or manual): mobile responsive, rounded corners, icon size,
    countdown background, CSS tokens, minimal JS, image files.
Matrix cleanup (2026-02-25):
  07-§6.7 moved from gap to implemented (hamburger menu exists; see 02-§24.10–14, NAV-10, NAV-11).
  11 duplicate rows annotated with cross-references (see-also notes):
    02-§4.7→02-§2.10, 02-§11.2→02-§4.8, 02-§11.3→02-§4.8,
    CL-§1.3→CL-§2.9, CL-§3.2→CL-§2.2, CL-§4.1→CL-§2.3, CL-§5.9→05-§6.1,
    07-§9.2→02-§13.2, 07-§9.3→02-§13.3, 07-§9.4→02-§13.4, 07-§9.5→02-§13.6.
  Top Gaps list updated: item 8 consolidated with CL-§5.9; item 16 notes
    native <details> accessibility.
3 requirements added for hero visual refinements (02-§30.23–30.25):
  1 covered (HERO-16): 02-§30.24 (Discord icon image).
  2 implemented (visual/CSS, manual check): 02-§30.23 (countdown bg), 02-§30.25 (sidebar centering).
  02-§30.18 updated: background changed from rgba(245,238,223,0.7) to #FAF7EF.
  02-§30.21 updated: discord_group.webp → DiscordLogo.webp.
12 requirements added for inline camp listing and link styling (02-§31.1–31.12):
  2 covered (UC-06, UC-11): 02-§31.5, 02-§31.6.
  10 implemented (visual/CSS or manual code review): 02-§31.1–31.4, 02-§31.7–31.12.
  02-§28.9 superseded (camp listing no longer has its own heading).
  02-§28.13 superseded (information text no longer rendered).
10 data validation gaps closed (02-§10.3, 05-§1.3, 05-§4.1, 05-§4.2, 05-§4.4,
  05-§5.1, 05-§6.1, CL-§5.5, CL-§5.9, CL-§6.3) — all moved from gap to covered:
  validate.js: HH:MM format (TIME_RE), string length limits (MAX_LENGTHS),
    camp date range (campDates param). Tests: VLD-33..55.
  lint-yaml.js: unique (title+date+start) combo, active+archived conflict.
    Tests: LNT-19..23.
  app.js: passes activeCamp to validators for range checking.
16 requirements added for CI linting (02-§32.1–32.8, 02-§33.1–33.8):
  all 16 implemented (infrastructure/tooling, manual verification).
  CL-§5.1 and CL-§5.2 moved from gap to implemented.
  html-validate for HTML validation of built output.
  Stylelint with stylelint-config-standard for CSS linting.
  Both integrated into ci.yml with data-only skip condition.
14 requirements added for derived active camp (02-§34.1–34.14):
  8 covered (DAC-01..07): 02-§34.1–34.6, 02-§34.8–34.9, 02-§34.13.
  5 implemented (manual/code review): 02-§34.7, 02-§34.10–34.12, 02-§34.14.
  05-§1.2 updated: now references derivation logic instead of manual flag.
  05-§1.3 superseded: active+archived conflict is impossible without active field.
  LNT-22..23 tests removed (active+archived check removed).
  `active` field removed from camps.yaml and data contract.
4 accessibility gaps closed:
  02-§13.2 / 07-§9.2 moved from gap to covered (A11Y-01..09):
    :focus-visible rules added to all interactive elements in style.css.
  02-§13.6 / 07-§9.5 moved from gap to implemented:
    native <details>/<summary> accepted as satisfying ARIA requirement;
    archive accordion already uses explicit aria-expanded/aria-controls.
1 requirement added for compact camp list layout (02-§3.5):
  covered (CL-01..03): CSS presence tests for flex layout, no border, no display: block.
  Manual visual check: open homepage and confirm one-liner layout.
10 requirements added for location accordions on index page (02-§35.1–35.10):
  7 covered (LOC-01..10): 02-§35.3–35.9.
  3 implemented (visual/structural, manual verification): 02-§35.1, 02-§35.2, 02-§35.10.
240 new tests added across 10 test files (coverage-*.test.js):
  75 requirements moved from implemented to covered.
  Test files: coverage-index, coverage-layout, coverage-today, coverage-idag,
    coverage-add, coverage-edit, coverage-render, coverage-css,
    coverage-structural, coverage-edit-event.
  Categories: homepage, layout, display mode, today view, add/edit forms,
    schedule render, CSS design tokens, structural cross-page, edit-event API.
18 requirements added for camps.yaml validator (02-§37.1–37.18):
  17 covered (VCMP-01..32): validation, file creation, header sync.
  1 implemented (manual, npm script): 02-§37.16.
11 requirements added for marked markdown converter (02-§38.1–38.11):
  6 covered (existing RNI/IMG tests + MKD-01..05): 02-§38.1, 02-§38.4–38.7, 02-§38.10.
  5 implemented (manual/structural): 02-§38.2, 02-§38.3, 02-§38.8, 02-§38.9, 02-§38.11.
```

---

## Top Gaps — Prioritised Action List

### High — missing whole features

1. **`02-§2.7` / `02-§15.1`–`02-§15.14` / `02-§36.1`–`02-§36.10` — RSS feed + per-event pages** *(resolved)*
   RSS feed at `/schema.rss` and per-event detail pages at `/schema/{id}/`.
   Architecture: `03-ARCHITECTURE.md §17–18`. Implementation: `render-rss.js`, `render-event.js`.
   22 covered (RSS-01..12, EVT-01..18), 5 implemented (manual/CI config).

### Low — tooling, design, and accessibility gaps

2. **`CL-§5.1` / `02-§32.1`–`02-§32.8` — HTML validation in CI**
    No HTML linter is configured; invalid HTML does not fail the build.
    Requirements added in §32; implementation in progress.

3. **`CL-§5.2` / `02-§33.1`–`02-§33.8` — CSS linting in CI**
    No CSS linter is configured.
    Requirements added in §33; implementation in progress.

4. **`02-§13.2` / `07-§9.2` — Visible focus states** *(resolved)*
    `:focus-visible` rules added to all interactive elements in `style.css`:
    `outline: 2px solid var(--color-terracotta); outline-offset: 2px`.
    Form inputs retain their `:focus` border-color change and gain the outline on `:focus-visible`.

5. **`02-§13.6` / `07-§9.5` — Accordion ARIA attributes** *(resolved)*
    Native `<details>/<summary>` elements satisfy the ARIA requirement — browsers expose
    expanded/collapsed state to assistive technology without explicit attributes.
    Custom accordion components (archive timeline) already use explicit `aria-expanded`
    and `aria-controls` (ARK-04, ARK-05). Design doc updated to codify this decision.

6. **`02-§34.1`–`02-§34.14` — Derived active camp** *(resolved)*
   The `active` flag has been removed from `camps.yaml`. The active camp
   is now derived from dates at build and API time. 8 covered (DAC-01..07),
   5 implemented (manual/code review). 05-§1.3 superseded.

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
| IMG-01..06 | `tests/render-index.test.js` | `renderIndexPage – image loading performance` |
| SES-01..05 | `tests/session.test.js` | `parseSessionIds` |
| SES-06..09 | `tests/session.test.js` | `buildSetCookieHeader` |
| SES-10..13 | `tests/session.test.js` | `mergeIds` |
| SES-14..15 | `tests/session.test.js` | `buildSetCookieHeader – domain` |
| SNP-01..06 | `tests/snapshot.test.js` | `renderSchedulePage` |
| ARK-01..08 | `tests/render-arkiv.test.js` | `renderArkivPage` (original timeline tests) |
| ARK-09..24 | `tests/render-arkiv.test.js` | `renderArkivPage` (header layout, FB logo, event list) |
| NAV-01..11 | `tests/nav.test.js` | `pageNav` |
| ROB-01..07 | `tests/robots.test.js` | `meta robots noindex (02-§1a.2)` |
| ROB-08..14 | `tests/robots.test.js` | `no discoverability metadata (02-§1a.3)` |
| GATE-01..02 | `tests/time-gate.test.js` | `renderAddPage – time-gating data attributes` |
| GATE-03..04 | `tests/time-gate.test.js` | `renderEditPage – time-gating data attributes` |
| GATE-05..10 | `tests/time-gate.test.js` | `isOutsideEditingPeriod` |
| HERO-01..02 | `tests/hero.test.js` | `hero section – layout structure (02-§30.1)` |
| HERO-03..04 | `tests/hero.test.js` | `hero section – title (02-§30.3–30.5)` |
| HERO-05..06 | `tests/hero.test.js` | `hero section – image (02-§30.6–30.7)` |
| HERO-07..09 | `tests/hero.test.js` | `hero section – social links (02-§30.9–30.11)` |
| HERO-10..13 | `tests/hero.test.js` | `hero section – countdown (02-§30.13–30.17)` |
| HERO-14..15 | `tests/hero.test.js` | `hero section – links from config (02-§30.22)` |
| HERO-16 | `tests/hero.test.js` | `hero section – Discord icon image (02-§30.24)` |
| VLD-33..39 | `tests/validate.test.js` | `validateEventRequest – time format` |
| VLD-40..41 | `tests/validate.test.js` | `validateEditRequest – time format` |
| VLD-42..48 | `tests/validate.test.js` | `validateEventRequest – string length limits` |
| VLD-49 | `tests/validate.test.js` | `validateEditRequest – string length limits` |
| VLD-50..54 | `tests/validate.test.js` | `validateEventRequest – date within camp range` |
| VLD-55 | `tests/validate.test.js` | `validateEditRequest – date within camp range` |
| LNT-19..21 | `tests/lint-yaml.test.js` | `validateYaml – unique (title+date+start) combo (05-§5.1)` |
| LNT-22..23 | *(removed — active+archived check no longer exists; see 02-§34.8)* | — |
| A11Y-01..09 | `tests/accessibility.test.js` | `:focus-visible rules (02-§13.2)` |
| DAC-01..07 | `tests/resolve-active-camp.test.js` | `resolveActiveCamp` |
| LOC-01..10 | `tests/render-locations.test.js` | `renderLocationAccordions` |
| COV-01..16 | `tests/coverage-index.test.js` | Homepage render tests (02-§2.1, 02-§3.1, CL-§3.1, CL-§3.3, 02-§2.9, 02-§14.1) |
| LAY-01..15 | `tests/coverage-layout.test.js` | Layout component tests (CL-§2.4, CL-§2.5, CL-§3.4, 02-§2.8, 02-§24.10) |
| DIS-01..18 | `tests/coverage-today.test.js` | Display mode view tests (02-§2.4a, 02-§2.10, 02-§4.6, 02-§4.7, 02-§4.13, 02-§17.3) |
| IDAG-01..18 | `tests/coverage-idag.test.js` | Today standard view tests (02-§2.4, 02-§4.5, 02-§4.13, 02-§14.1) |
| RADD-01..30 | `tests/coverage-add.test.js` | Add-activity form tests (02-§2.5, 02-§6.1–6.4, 02-§8.2, 02-§14.1, 02-§26.13) |
| REDT-01..28 | `tests/coverage-edit.test.js` | Edit-activity form tests (02-§2.11, 02-§18.20, 02-§18.23, 02-§18.27, 02-§18.36) |
| RDC-01..06 | `tests/coverage-render.test.js` | Schedule render tests (02-§5.3, 02-§4.8) |
| CSS-01..37 | `tests/coverage-css.test.js` | CSS design token tests (07-§2.1–2.7, 07-§3.1–3.11, 07-§4.1–4.14, 07-§6.14–6.28, 07-§7.1–7.4) |
| STR-HTML-01..06 | `tests/coverage-structural.test.js` | Static HTML output tests (CL-§1.1, CL-§1.2) |
| STR-FW-01..06 | `tests/coverage-structural.test.js` | No-framework tests (CL-§1.3, CL-§2.9) |
| STR-SPA-01..06 | `tests/coverage-structural.test.js` | Not-a-SPA tests (CL-§2.7) |
| STR-NAV-01..06 | `tests/coverage-structural.test.js` | nav.js defer tests (02-§25.6) |
| STR-JSON-01..02 | `tests/coverage-structural.test.js` | events.json public fields (02-§18.29, 05-§3.3) |
| STR-EID-01..05 | `tests/coverage-structural.test.js` | data-event-id attributes (02-§18.18) |
| STR-TZ-01..06 | `tests/coverage-structural.test.js` | No timezone references (05-§4.5) |
| EEC-01..03 | `tests/coverage-edit-event.test.js` | Event ID stability (05-§6.2) |
| EEC-04 | `tests/coverage-edit-event.test.js` | meta.created_at preserved (02-§18.35) |
| EEC-05..08 | `tests/coverage-edit-event.test.js` | addOneDay date arithmetic |
| EEC-09..13 | `tests/coverage-edit-event.test.js` | isOutsideEditingPeriod time-gate logic |
| EEC-14..17 | `tests/coverage-edit-event.test.js` | mergeIds session cookie deduplication |
| EEC-18..26 | `tests/coverage-edit-event.test.js` | Session cookie properties (02-§18.4, 02-§18.5, 02-§18.7, 02-§18.41) |
| VCMP-01..08 | `tests/validate-camps.test.js` | `validateCamps – required fields (02-§37.1)` |
| VCMP-09..12 | `tests/validate-camps.test.js` | `validateCamps – date format (02-§37.2)` |
| VCMP-13..14 | `tests/validate-camps.test.js` | `validateCamps – date ordering (02-§37.3)` |
| VCMP-15..16 | `tests/validate-camps.test.js` | `validateCamps – archived type (02-§37.4)` |
| VCMP-17 | `tests/validate-camps.test.js` | `validateCamps – unique ids (02-§37.5)` |
| VCMP-18 | `tests/validate-camps.test.js` | `validateCamps – unique file values (02-§37.6)` |
| VCMP-19..20 | `tests/validate-camps.test.js` | `validateCamps – exit behaviour (02-§37.7)` |
| VCMP-21..24 | `tests/validate-camps.test.js` | `validateCamps – file creation and field order (02-§37.8–37.11)` |
| VCMP-25..27 | `tests/validate-camps.test.js` | `validateCamps – camp header sync (02-§37.12–37.15)` |
| VCMP-28 | `tests/validate-camps.test.js` | `validateCamps – logging (02-§37.17)` |
| VCMP-29 | `tests/validate-camps.test.js` | `validateCamps – module API (02-§37.18)` |
| VCMP-30..32 | `tests/validate-camps.test.js` | `validateCamps – edge cases` |
| MKD-01..05 | `tests/render-index.test.js` | `convertMarkdown – standard markdown features (02-§38.7)` |
