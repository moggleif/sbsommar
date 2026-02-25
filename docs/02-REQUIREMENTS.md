# SB Sommar – Requirements

This document defines what the site must do and for whom.

Architecture, data design, and rendering logic are downstream of these requirements.
Read this before reading any other technical document.

---

## 1. Who Uses This Site

Three distinct audiences:

**Prospective families (year-round)**
Families considering attending the camp. They arrive not knowing what SB Sommar is.
They need enough information to understand the camp, decide whether it is right for
their child, and take the next step (register or contact). This is the primary
audience for the public site.

**Participants during camp week**
Families and young people who are already at the camp. They use the site to view the
activity schedule, find out what is happening today, and add their own activities.
Speed and mobile usability matter most here.

**Administrators**
Staff who manage the camp data — creating and archiving camps, correcting events,
managing location lists. Editing is done directly in YAML files. No admin UI is needed.

---

## 1a. Search Engine and Crawler Policy

This site must not be indexed by search engines or crawlers. It is intentionally
hidden — discoverable only by direct link.

- The build must generate a `robots.txt` file at the site root that disallows all
  user agents from all paths. <!-- 02-§1a.1 -->
- Every HTML page must include a `<meta name="robots" content="noindex, nofollow">`
  tag in the `<head>` section. <!-- 02-§1a.2 -->
- No sitemap, Open Graph tags, or other discoverability metadata may be added
  to any page. <!-- 02-§1a.3 -->

---

## 2. Site Pages

The following pages must exist:

| ID | Page | URL | Audience |
| --- | --- | --- | --- |
| `02-§2.1` | Homepage | `/` | Prospective families, participants |
| `02-§2.2` | Weekly schedule | `/schema.html` | Participants |
| `02-§2.3` | Daily view | `/dagens-schema.html` | Participants |
| `02-§2.4` | Today / Display view | `/idag.html` | Participants, shared screens |
| `02-§2.5` | Add activity | `/lagg-till.html` | Participants |
| `02-§2.6` | Archive | `/arkiv.html` | Prospective families, returning participants |
| `02-§2.7` | RSS feed | `/schema.rss` | Anyone subscribing to the schedule |
| `02-§2.11` | Edit activity | `/redigera.html` | Participants who submitted the event |

The homepage, schedule pages, add-activity form, and archive share the same header and navigation. <!-- 02-§2.8 -->
None require login. <!-- 02-§2.9 -->

The Today / Display view has no header or navigation — it is a minimal, full-screen display intended for shared screens and quick mobile glances. <!-- 02-§2.10 -->

---

## 3. Homepage — Pre-Camp Requirements

The homepage is for families who know nothing about the camp.

It must answer, in order: <!-- 02-§3.1 -->

- What is SB Sommar, and who is it for?
- Is this the right place for my child?
- When and where does it take place?
- How do I register, and what are the deadlines?
- What does it cost, and what is included?
- Where do we stay, and what do we eat?
- What are the rules and what should we bring?
- What do previous participants say about it?

It must also include a frequently asked questions section. <!-- 02-§3.2 -->

The homepage must feel complete and trustworthy even when no camp is currently active. <!-- 02-§3.3 -->
When a camp is active or upcoming, the schedule and add-activity links are prominent. <!-- 02-§3.4 -->

**Tone:** Warm, calm, and clear. Written in Swedish. Not corporate. Not promotional.
The goal is that a parent visiting for the first time leaves thinking:
*"I understand what this is. I know how it works. I feel comfortable taking the next step."*

---

## 4. Schedule Views

### Weekly schedule

- Shows all activities for the full camp week (Sunday–Sunday). <!-- 02-§4.1 -->
- Activities are grouped by day. <!-- 02-§4.10 -->
- Within each day, activities are listed in chronological order. <!-- 02-§4.2 -->
- Each activity shows: title, start time, end time, location, responsible person. <!-- 02-§4.3 -->

### Daily view

- Shows activities for a single selected day. <!-- 02-§4.11 -->
- Same field display as the weekly view. <!-- 02-§4.12 -->
- The user can navigate between days. <!-- 02-§4.4 -->

### Today / Display view

- Shows only today's activities. <!-- 02-§4.5 -->
- Designed for two uses: mobile phones carried by participants, and shared screens placed around the camp.
- Must be legible at a distance: dark background, large text, minimal interface chrome. <!-- 02-§4.6 -->
- Must not require any interaction to stay useful — it should be readable at a glance. <!-- 02-§4.7 -->
- No navigation to other days. This view is always today. <!-- 02-§4.13 -->

### All schedule views

- Activities are always in chronological order. <!-- 02-§11.1 -->
- Overlapping activities are allowed and must remain readable. <!-- 02-§4.8 -->
- Clicking an activity opens its detail view (see §5). <!-- 02-§4.9 -->

---

## 5. Activity Detail View

When a participant clicks an activity, a detail view must show: <!-- 02-§5.1 -->

- Title
- Date
- Start time
- End time
- Location
- Responsible person
- Full description (only if set)
- Communication link (only if set)

Fields with no value must not appear. <!-- 02-§5.2 --> The user must clearly understand whether
additional information exists beyond what the schedule row shows.

The `owner` and `meta` fields are internal and must never appear in any public view. <!-- 02-§5.3 -->

---

## 6. Adding an Activity

Participants must be able to submit a new activity through the form at `/lagg-till.html`. <!-- 02-§6.1 -->

### Required fields

- Title
- Date
- Start time
- End time
- Location
- Responsible person

### Optional fields

- Description (free text)
- Communication link

### Form UX

The form must help the user fill it in correctly. This is not about security —
it is about reducing confusion and frustration.

- **Date field:** constrained to the active camp's date range. The user cannot
  select a date outside the camp week. <!-- 02-§6.2 -->
- **Location field:** a dropdown populated from `source/data/local.yaml`.
  One option ("Annat") allows a free-text location not in the list. <!-- 02-§6.3 -->
- **Time fields:** display a `HH:MM` format hint. The field should guide the user
  toward a valid value. <!-- 02-§6.4 -->
- **Errors:** shown inline, per field, immediately on submit. Not as a single
  generic message at the top of the form. Each error message must name the specific
  problem (e.g. "Sluttid måste vara efter starttid"). <!-- 02-§6.5 -->
- **Submit button:** disabled while the submission is in progress.
  Shows a visual indication that something is happening. <!-- 02-§6.6 -->
- **Success state:** a clear confirmation that the activity has been received.
  The user should not be left wondering whether it worked. <!-- 02-§6.7 -->
- **Network failure:** if the submission cannot reach the server, the user is
  told clearly that it failed and can try again. Submissions must not be silently lost. <!-- 02-§6.8 -->

---

## 7. Editing and Removing Activities

Participants can edit their own active events (events whose date has not yet passed)
through a session-cookie-based ownership mechanism. See §18 for the full specification. <!-- 02-§7.1 -->

Administrators can edit or remove any activity by modifying the camp's YAML file
directly. See [04-OPERATIONS.md](04-OPERATIONS.md) for the workflow. <!-- 02-§7.2 -->

Only the submitting participant (identified by their session cookie) may edit a
given participant-submitted event. <!-- 02-§7.3 -->

---

## 8. Locations

- Locations must be selected from a predefined list. <!-- 02-§8.3 -->
- Location names must remain consistent throughout the week. <!-- 02-§8.1 -->
- One flexible option ("Annat") must exist for locations not in the list. <!-- 02-§8.2 -->
- The predefined list is maintained in `source/data/local.yaml` — this is the
  only place locations are defined.

Participants cannot modify the location list. <!-- 02-§8.4 -->

---

## 9. Form Validation

When a participant submits an activity, the following must be verified:

- `title` is present and non-empty. <!-- 02-§9.1 -->
- `date` falls within the active camp's date range. <!-- 02-§9.2 -->
- `start` is in valid `HH:MM` format. <!-- 02-§9.3 -->
- `end` is present, in valid `HH:MM` format, and is after `start`. <!-- 02-§9.4 -->
- `location` is present and non-empty. <!-- 02-§9.5 -->
- `responsible` is present and non-empty. <!-- 02-§9.6 -->

Invalid submissions must be rejected with a clear, specific error message.
Valid submissions must receive a confirmation immediately.

---

## 10. API Input Validation

The API server (`app.js`) receives submitted events and commits them to a YAML file
on GitHub. Malformed input that reaches the YAML file can corrupt the file and break
the entire site.

The server must therefore validate all input before touching GitHub:

- All required fields must be present and of the correct type before any write begins. <!-- 02-§10.1 -->
- Only known fields are written to the YAML file. Unknown or extra fields in the
  POST body are ignored — they are never committed. <!-- 02-§10.2 -->
- String values are type-checked and length-limited. Extremely long strings are rejected. <!-- 02-§10.3 -->
- YAML escaping is handled entirely by the YAML serializer. User-provided strings
  are never interpolated directly into YAML text. <!-- 02-§10.4 -->
- Any validation failure results in an HTTP error response. Nothing is committed to GitHub. <!-- 02-§10.5 -->
- When a new event is appended to a camp YAML file, the serialised YAML block must be
  indented to match the existing `events:` list. The resulting file must remain valid YAML
  that parses identically to the original file plus the new event entry. <!-- 02-§10.6 -->

This is separate from form UX validation. Form validation helps users. API validation
protects the site's data integrity.

---

## 11. Activity Order and Overlaps

- Activities must always be displayed in chronological order (by date, then start time). <!-- 02-§11.1 -->
- Overlapping activities are allowed. <!-- 02-§11.2 -->
- The schedule must remain readable when multiple activities occur at the same time. <!-- 02-§11.3 -->

---

## 12. Reliability

Participants must be able to trust that:

- The schedule reflects the current plan.
- A newly submitted activity appears in the schedule within a few minutes. <!-- 02-§12.1 -->
- Corrections and removals made by an admin are visible in all schedule views. <!-- 02-§12.2 -->
- All event submissions are permanently recorded in Git history as a full audit trail. <!-- 02-§12.3 -->

The schedule is a shared coordination tool during the camp week.

---

## 13. Accessibility

The site must meet WCAG AA as a baseline:

- Color contrast must be at least `4.5:1` for body text. <!-- 02-§13.1 -->
- All interactive elements must have visible focus states. <!-- 02-§13.2 -->
- Navigation must be fully keyboard accessible. <!-- 02-§13.3 -->
- Images must have descriptive `alt` text. <!-- 02-§13.4 -->
- The add-activity form must be usable without a mouse. <!-- 02-§13.5 -->
- Accordion or expandable elements must use proper ARIA attributes. <!-- 02-§13.6 -->

---

## 14. Language

The site is written entirely in Swedish. <!-- 02-§14.1 -->

This includes: all page content, navigation labels, form labels, error messages,
confirmation messages, and accessibility text (alt, aria-label, etc.).

---

## 15. RSS Feed

The activity schedule must be available as an RSS feed at `/schema.rss`. <!-- 02-§15.1 -->

The feed must reflect the current state of the schedule. <!-- 02-§15.2 --> It is intended for
participants who want to follow the schedule in an RSS reader or use it to
integrate the schedule elsewhere.

---

## 16. Archive

Past camps must remain accessible.

- When a camp ends, it becomes an archived camp. Its data is never deleted. <!-- 02-§16.1 -->
- The archive page must list all past camps and link to their schedules. <!-- 02-§16.2 -->
- When no camp is active, the most recent archived camp is shown by default. <!-- 02-§16.3 -->
- The archive must be usable and complete, not a placeholder. <!-- 02-§16.4 -->

---

## 17. Simplicity

The site must:

- Work well on mobile devices. Schedule viewing and event submission are
  frequently done from a phone during camp week. <!-- 02-§17.1 -->
- Be readable on shared display screens (see Today view in §4). <!-- 02-§17.3 -->
- Require no explanation to use. A first-time visitor should understand the
  schedule and the add-activity form without instructions. <!-- 02-§17.2 -->
- Avoid complexity that does not serve a clear user need.

The purpose of the schedule is coordination, not administration.

---

## 18. Participant Event Editing

Participants who submit events should be able to edit those events for as long as
the event is in the future. This uses a lightweight, cookie-based ownership model
that requires no login.

### 18.1 Ownership and session cookie

- When a participant's event is successfully created, the server sets a session
  cookie in the response containing the new event's ID. <!-- 02-§18.1 -->
- The session cookie stores a JSON array of event IDs the current browser owns. <!-- 02-§18.2 -->
- The cookie has a `Max-Age` of 7 days; submitting another event updates (extends) it. <!-- 02-§18.3 -->
- The cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` to prevent
  cross-site misuse. <!-- 02-§18.4 -->
- **The session cookie is intentionally JavaScript-readable (not `httpOnly`).**
  Because the schedule pages are static HTML pre-rendered at build time, client-side
  JavaScript is the only layer that can read the cookie and show or hide edit links
  per event. Server-side validation on every edit request compensates for the
  absence of `httpOnly`. This trade-off is explicit and documented. <!-- 02-§18.5 -->
- The session cookie is set only by the server — never written directly by
  client-side JavaScript. <!-- 02-§18.6 -->
- The cookie name is `sb_session`. <!-- 02-§18.7 -->
- When the API server and the static site are deployed on different subdomains
  (e.g. `api.sommar.example.com` and `sommar.example.com`), the session cookie
  must be set with a `Domain` attribute covering the shared parent domain so that
  client-side JavaScript running on the static site can read the cookie via
  `document.cookie`. The domain is supplied via the `COOKIE_DOMAIN` environment
  variable. If the variable is not set, no `Domain` attribute is included and the
  cookie is scoped to the API host only (acceptable for single-origin deployments). <!-- 02-§18.41 -->

### 18.2 Cookie consent

- Before the server sets the session cookie, the client must first obtain the
  user's explicit consent through a modal dialog on the add-activity form. <!-- 02-§18.8 -->
- If the user accepts, the form submission proceeds and the server sets the
  session cookie in its response. <!-- 02-§18.9 -->
- If the user declines, the form submission still proceeds (the event is still
  submitted), but the server does not set the session cookie and the user receives
  no editing capability. <!-- 02-§18.10 -->
- Only an **accepted** decision is stored in `localStorage` as `sb_cookie_consent`.
  A declined decision is not persisted — the prompt will appear again next time
  the user submits an event, allowing them to change their mind. <!-- 02-§18.11 -->
- The consent prompt must be written in Swedish. <!-- 02-§18.12 -->

### 18.3 Expiry management

- On every page load, client-side JavaScript reads the session cookie and removes
  any event IDs whose date has already passed. <!-- 02-§18.13 -->
- The cleaned cookie is written back. If no event IDs remain after cleaning, the
  cookie is deleted. <!-- 02-§18.14 -->
- "Passed" means the event's date is strictly before today's local date. <!-- 02-§18.15 -->

### 18.4 Edit links on schedule pages

- Schedule pages (weekly and daily) add an "Redigera" link next to each event
  whose ID is present in the session cookie and whose date has not passed. <!-- 02-§18.16 -->
- The link is injected by client-side JavaScript after page load; it is never
  part of the static HTML. <!-- 02-§18.17 -->
- Each event row in the generated HTML carries a `data-event-id` attribute
  containing the event's stable ID so JavaScript can identify it. <!-- 02-§18.18 -->
- The "Redigera" link navigates to `/redigera.html?id={eventId}`. <!-- 02-§18.19 -->

### 18.7 Edit links on the Idag today view

- The "Idag" today view (`/idag.html`) also shows a "Redigera" link next to
  each event the visitor owns and that has not passed — using the same rule and
  link text as the weekly schedule. <!-- 02-§18.42 -->
- The events JSON embedded in `idag.html` at build time includes the event's
  `id` field so client-side JavaScript can associate rendered rows with their
  stable IDs. <!-- 02-§18.43 -->
- Event rows rendered dynamically on `idag.html` carry `data-event-id` and
  `data-event-date` HTML attributes so `session.js` can inject the edit link
  using the same mechanism as on `schema.html`. <!-- 02-§18.44 -->

### 18.5 Edit form

- An edit page exists at `/redigera.html`. <!-- 02-§18.20 -->
- When loaded, it reads the `id` query parameter, checks the session cookie,
  and fetches `/events.json` to pre-populate the form with the event's current
  values. <!-- 02-§18.21 -->
- If the event ID is not in the session cookie, or the event has already passed,
  the page shows a clear error and no form is rendered. <!-- 02-§18.22 -->
- The edit form exposes the same fields as the add-activity form (title, date,
  start time, end time, location, responsible person, description, link). <!-- 02-§18.23 -->
- The event's stable `id` must not change after creation, even when mutable
  fields are edited. <!-- 02-§18.24 -->
- The edit form is subject to the same field-level validation rules as the
  add-activity form (§9). <!-- 02-§18.25 -->
- After a successful edit, a clear Swedish confirmation is shown. The schedule
  updates within a few minutes via the same PR auto-merge pipeline. <!-- 02-§18.26 -->
- The edit form is written entirely in Swedish (§14). <!-- 02-§18.27 -->

### 18.6 Event data API

- A static file `/events.json` is generated at build time containing all events
  for the active camp. <!-- 02-§18.28 -->
- The file contains only fields that appear in the edit form (id, title, date,
  start, end, location, responsible, description, link). Internal fields
  (`owner`, `meta`) are excluded. <!-- 02-§18.29 -->

### 18.7 Server-side edit endpoint

- A `POST /edit-event` endpoint accepts edit requests. <!-- 02-§18.30 -->
- The server reads the `sb_session` cookie from the request, parses the event
  ID array, and verifies the target event ID is present. <!-- 02-§18.31 -->
- If the event ID is not in the cookie, the server responds with HTTP 403. <!-- 02-§18.32 -->
- If the event's date has already passed, the server responds with HTTP 400. <!-- 02-§18.33 -->
- If validation passes, the server reads the YAML file from GitHub, replaces the
  target event's mutable fields in place, and commits the change via an ephemeral
  branch and PR with auto-merge — the same pipeline used for additions. <!-- 02-§18.34 -->
- The event's `meta.updated_at` field is updated on every successful edit. <!-- 02-§18.35 -->
- Only fields that are part of the edit form are written. No unrecognised fields
  from the request body are ever committed. <!-- 02-§18.36 -->

### 18.8 Client-side cookie mechanics

- The add-activity form submission must use `credentials: 'include'` so that
  `Set-Cookie` response headers from the cross-origin API are applied by the
  browser. Without this, the cookie is silently discarded. <!-- 02-§18.37 -->
- The cookie consent prompt must be displayed as a modal dialog (with backdrop,
  focus trap, and centered box) so the user cannot miss it. The modal reuses the
  same styling and accessibility patterns as the submit-feedback modal. <!-- 02-§18.38 -->
- The add-activity form does not include an owner name field. Event ownership is
  established entirely via the session cookie; no name is required for the editing
  mechanism to work. <!-- 02-§18.39 -->
- The add-activity submit handler must only reference form elements that are
  rendered in the form HTML. Accessing a missing element via `form.elements`
  returns `undefined`; calling `.value` on it throws a `TypeError` that aborts
  the submission and breaks the consent banner interaction. <!-- 02-§18.40 -->

### 18.9 Edit form API mechanics

- The edit form must submit to the `/edit-event` endpoint. The build step derives
  the edit URL from the `API_URL` environment variable by replacing a trailing
  `/add-event` path segment with `/edit-event`; if `API_URL` does not end with
  `/add-event`, the edit URL falls back to `/edit-event`. <!-- 02-§18.44 -->
- The edit form submission must use `credentials: 'include'` so that the
  `sb_session` cookie is sent to the cross-origin API. Without this the server
  cannot verify ownership and will reject the request with HTTP 403. <!-- 02-§18.45 -->

---

## 20. Edit-Activity Submit Flow

When the user submits the edit-activity form, the submission proceeds through a
defined sequence: field locking → progress modal → result. This mirrors the
add-activity submit flow (§19) but without a consent step, and with success text
and actions appropriate for an edit rather than a new submission.

### 20.1 Field locking

- When validation passes and submission begins, all form inputs (text, date, time,
  select, textarea) and the submit button are immediately disabled. This prevents
  edits and duplicate submissions during the async flow. <!-- 02-§20.1 -->
- Disabled elements are visually distinct from their enabled state (reduced opacity
  or grayed-out appearance). <!-- 02-§20.2 -->

### 20.2 Progress modal

- After submission begins, a modal dialog opens over the page before the fetch
  begins. <!-- 02-§20.3 -->
- The modal displays a loading indicator (spinner or equivalent) and the text
  "Sparar till GitHub…". <!-- 02-§20.4 -->
- The modal carries `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
  pointing to its heading element. <!-- 02-§20.5 -->
- Keyboard focus is trapped inside the modal while it is open. <!-- 02-§20.6 -->
- The page behind the modal is not scrollable while the modal is open. <!-- 02-§20.7 -->

### 20.3 Success state

- On a successful response, the modal shows: the edited activity title, the text
  "Aktiviteten är uppdaterad! Den syns i schemat om ungefär en minut.", and a
  primary link "Gå till schemat →" to `schema.html`. <!-- 02-§20.8 -->

### 20.4 Error state

- On an error response or network failure, the modal shows the error message in
  Swedish and a "Försök igen" button. <!-- 02-§20.9 -->
- Clicking "Försök igen" closes the modal and re-enables all form fields,
  allowing the user to correct and resubmit without losing their typed input. <!-- 02-§20.10 -->

### 20.5 Implementation constraints

- The modal uses only CSS custom properties defined in `docs/07-DESIGN.md §7`.
  No hardcoded colors, spacing, or typography values. <!-- 02-§20.11 -->
- The modal is implemented in vanilla JavaScript; no library or framework is
  added. <!-- 02-§20.12 -->
- The existing `#result` section in the edit-page HTML is removed; the modal is
  the sole post-submission feedback mechanism for the edit form. <!-- 02-§20.13 -->

---

## 19. Add-Activity Submit Flow

When validation passes and the user submits the add-activity form, the submission
proceeds through a defined sequence: field locking → optional consent prompt →
progress modal → result.

### 19.1 Field locking

- When validation passes and submission begins, all form inputs (text, date, time,
  select, textarea) and the submit button are immediately disabled. This prevents
  edits and duplicate submissions during the async flow. <!-- 02-§19.1 -->
- Disabled elements are visually distinct from their enabled state (reduced opacity
  or grayed-out appearance). <!-- 02-§19.2 -->

### 19.2 Consent prompt

- The consent prompt (§18.2) is shown as a modal dialog while the form is locked.
  The modal uses the same `#submit-modal` element and styling as the progress and
  result modals. <!-- 02-§19.3 -->
- After the user accepts or declines, the modal content transitions to the
  progress state (spinner) and the submission continues. <!-- 02-§19.4 -->

### 19.3 Progress modal

- After consent is resolved, a modal dialog opens over the page before the fetch
  begins. <!-- 02-§19.5 -->
- The modal displays a loading indicator (spinner or equivalent) and the text
  "Skickar till GitHub…". <!-- 02-§19.6 -->
- The modal carries `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
  pointing to its heading element. <!-- 02-§19.7 -->
- Keyboard focus is trapped inside the modal while it is open. <!-- 02-§19.8 -->
- The page behind the modal is not scrollable while the modal is open. <!-- 02-§19.9 -->

### 19.4 Success state

- On a successful response, the modal content changes to show: the submitted
  activity title, the text "Aktiviteten är tillagd! Den syns i schemat om ungefär
  en minut.", a primary link "Gå till schemat →" to `schema.html`, and a secondary
  button "Lägg till en till". <!-- 02-§19.10 -->
- If the user declined cookie consent, the success state also shows a Swedish note
  explaining they cannot edit the activity from this browser, and that they can
  resubmit with consent next time. <!-- 02-§19.11 -->
- Clicking "Lägg till en till" closes the modal, resets the form, and re-enables
  all form fields. <!-- 02-§19.12 -->

### 19.5 Error state

- On an error response or network failure, the modal content changes to show the
  error message in Swedish and a "Försök igen" button. <!-- 02-§19.13 -->
- Clicking "Försök igen" closes the modal and re-enables all form fields, allowing
  the user to correct and resubmit without losing their typed input. <!-- 02-§19.14 -->

### 19.6 Implementation constraints

- The modal uses only CSS custom properties defined in `docs/07-DESIGN.md §7`.
  No hardcoded colors, spacing, or typography values. <!-- 02-§19.15 -->
- The modal is implemented in vanilla JavaScript; no library or framework is
  added. <!-- 02-§19.16 -->
- The existing `#result` section in the page HTML is removed; the modal is the
  sole post-submission feedback mechanism. <!-- 02-§19.17 -->

---

## 22. Shared Site Footer

A shared footer must appear at the bottom of every page. Its content is maintained
in a single Markdown file so non-technical contributors can update it without
touching any template or layout code.

- Every page produced by the build must include a footer element at the bottom of
  `<body>`. <!-- 02-§22.1 -->
- Footer content is maintained in `source/content/footer.md`. <!-- 02-§22.2 -->
- The build reads `footer.md`, converts it to HTML using the same Markdown pipeline
  as other content pages, and injects the result into every page via the shared
  rendering layer. <!-- 02-§22.3 -->
- There must be no duplicated footer markup in any template or render function —
  the Markdown file is the single source of truth. <!-- 02-§22.4 -->
- If `footer.md` does not exist at build time, every page must still render
  successfully with an empty footer. The build must not crash or exit with an error. <!-- 02-§22.5 -->
- Updating `footer.md` and running the build must change the footer on all pages
  without modifying any other file. <!-- 02-§22.6 -->

---

## 21. Archive Timeline

The archive page (`/arkiv.html`) presents past camps as an interactive vertical
timeline. Each camp is a point on the timeline that expands to show details.

### 21.1 Timeline layout

- Only camps with `archived: true` in `camps.yaml` are shown. <!-- 02-§21.1 -->
- Camps are listed newest first (descending by `start_date`). <!-- 02-§21.2 -->
- The timeline is vertical; each camp is a point on a vertical line. <!-- 02-§21.3 -->

### 21.2 Accordion interaction

- Each camp is rendered as an accordion item — a clickable header that expands
  to reveal camp details below. <!-- 02-§21.4 -->
- Only one accordion item may be open at a time; opening a new item closes
  any previously open item. <!-- 02-§21.5 -->
- Each accordion header uses a `<button>` element with `aria-expanded` and
  `aria-controls` attributes so screen readers announce the state. <!-- 02-§21.6 -->
- Keyboard users must be able to open and close accordion items using Enter
  or Space on the focused header button. <!-- 02-§21.7 -->

### 21.3 Accordion content

Each expanded accordion shows, in order: <!-- 02-§21.8 -->

- Camp name (already visible in the header)
- Start date and end date formatted in Swedish (`D månadsnamn YYYY`)
- Location
- Information text (only if non-empty in `camps.yaml`) <!-- 02-§21.9 -->
- A link to the Facebook group (only if `link` is non-empty in `camps.yaml`) <!-- 02-§21.10 -->

Fields that are empty or absent must not produce blank rows or placeholder
text. <!-- 02-§21.11 -->

### 21.4 Header layout

The accordion header must display the camp name as the primary text, followed
by the date range and location in subdued (gray) text to the right. <!-- 02-§21.12 -->

- The date range is formatted as `D–D månadsnamn YYYY` (or spanning months
  when the camp crosses a month boundary). <!-- 02-§21.13 -->
- The location follows the date range, separated by a centered dot
  (`·`). <!-- 02-§21.14 -->
- On narrow viewports the metadata may wrap below the camp name, but must
  remain visually subdued. <!-- 02-§21.15 -->

### 21.5 Active camp indicator

- When a camp accordion is expanded, its timeline dot must be visually
  highlighted — larger and with an accent color — to mark the selected
  camp on the timeline. <!-- 02-§21.16 -->
- When the accordion is collapsed the dot returns to its default
  size. <!-- 02-§21.17 -->

### 21.6 Facebook logo link

- When a camp has a non-empty `link` field, the expanded panel must show
  the Facebook logo image (`images/social-facebook-button-blue-icon-small.webp`)
  as a clickable link to the Facebook group, replacing the previous text
  button. <!-- 02-§21.18 -->
- The logo must be placed at the top of the panel content, near the camp
  metadata. <!-- 02-§21.19 -->
- The link must open in a new tab (`target="_blank"`,
  `rel="noopener noreferrer"`). <!-- 02-§21.20 -->
- The image must have an accessible `alt` text (e.g.
  "Facebookgrupp"). <!-- 02-§21.21 -->

### 21.7 Event list in archive

Each expanded accordion must display the camp's events below the description
and Facebook link. Events are loaded from the camp's event YAML file at build
time. <!-- 02-§21.22 -->

- Events are grouped by date, with each date shown as a heading (e.g.
  "måndag 3 augusti 2025"). <!-- 02-§21.23 -->
- Within each date, events are sorted by start time
  ascending. <!-- 02-§21.24 -->
- Each event row uses the same visual format as the weekly schedule page:
  time range, title, and location/responsible metadata. <!-- 02-§21.25 -->
- Day headings are plain headings, not collapsible. <!-- 02-§21.26 -->
- Event rows are flat (not accordion/collapsible) — descriptions are not
  shown; only time, title, and metadata. <!-- 02-§21.27 -->
- If a camp has no events in its YAML file, the event list section is
  omitted entirely. <!-- 02-§21.28 -->

### 21.8 Visual consistency

- The archive page must use the same typography scale, color tokens, and
  spacing tokens as the rest of the site. <!-- 02-§21.29 -->
- The event list styling in the archive must match the weekly schedule page
  in font size, weight, and color for time, title, and metadata
  spans. <!-- 02-§21.30 -->

---

## 23. Event Data CI Pipeline

When a participant submits or edits an activity, the API creates an ephemeral Git branch,
commits the updated YAML, and opens a pull request. The CI pipeline must intercept these
PRs and validate the data before the merge completes.

This section covers requirements for that targeted CI pipeline.
It applies only to PRs from branches matching `event/**` (add-event) and
`event-edit/**` (edit-event).

### 22.0 Git history for branch comparison

- CI workflows that compare the PR branch to `main` to detect changed files must check out
  with sufficient git history for the three-dot diff (`origin/main...HEAD`) to find a merge
  base. A shallow checkout (depth 1) is not sufficient. <!-- 02-§23.14 -->

### 22.1 YAML structural validation

- The CI pipeline must parse and structurally validate the changed event YAML file before
  the PR is merged. <!-- 02-§23.1 -->
- Validation must check all required fields are present and non-empty: `id`, `title`,
  `date`, `start`, `end`, `location`, `responsible`. <!-- 02-§23.2 -->
- Validation must check that `date` is a valid YYYY-MM-DD calendar date within the
  camp's start/end date range. <!-- 02-§23.3 -->
- Validation must check that `start` and `end` match HH:MM format and `end` is strictly
  after `start`. <!-- 02-§23.4 -->
- Validation must check for duplicate event IDs within the file. <!-- 02-§23.5 -->

### 22.2 Security scan

- The CI pipeline must scan all free-text event fields for injection patterns (script
  tags, JavaScript URIs, event handler attributes) before the PR is merged. <!-- 02-§23.6 -->
- The `link` field, when non-empty, must use `http://` or `https://` protocol; any other
  protocol must be rejected. <!-- 02-§23.7 -->
- Text fields must be length-limited; payloads exceeding reasonable limits must be
  rejected. <!-- 02-§23.8 -->

### 22.3 Failure gates

- If the YAML lint step fails, the security scan, build, and deploy steps must not run. <!-- 02-§23.9 -->
- If the security scan step fails, the build and deploy steps must not run. <!-- 02-§23.10 -->

### 22.4 Targeted deployment

- On successful validation, the pipeline must build the site and deploy only the four
  event-data-derived files: `schema.html`, `idag.html`, `dagens-schema.html`, and
  `events.json`. <!-- 02-§23.11 -->
- No other files may be touched by this pipeline's FTP upload step. <!-- 02-§23.12 -->
- This deployment must happen while the PR is open (before auto-merge), so the updated
  schedule is visible to participants without waiting for the full site deploy. <!-- 02-§23.13 -->

---

## 24. Unified Navigation

The site must have exactly one navigation component, appearing at the top of every
page. There must be no secondary or duplicate navigation menus elsewhere on any page.

### 24.1 Structure

- Every page must include the same navigation header. <!-- 02-§24.1 -->
- The navigation must appear only once per page, in the header area, before
  any page content. <!-- 02-§24.2 -->
- The index page must not have an additional section-navigation menu below the
  hero image. <!-- 02-§24.3 -->

### 24.2 Page links

The navigation must contain links to all main pages: <!-- 02-§24.4 -->

- Hem (`index.html`)
- Schema (`schema.html`)
- Idag (`idag.html`)
- Lägg till aktivitet (`lagg-till.html`)
- Arkiv (`arkiv.html`)

The link for the current page must be visually marked as active. <!-- 02-§24.5 -->
These links must be identical on all pages, including the index page. <!-- 02-§24.6 -->

### 24.3 Section links

The navigation must also include anchor links to the main sections of the
index page. <!-- 02-§24.7 -->

- Short nav labels are defined per section in `sections.yaml` via the `nav:` field. <!-- 02-§24.8 -->
- Section links on non-index pages must point to `index.html#id`. <!-- 02-§24.9 -->

### 24.4 Mobile behaviour

- On mobile (viewport narrower than 768 px), the navigation must be collapsed
  by default and toggled via a hamburger button. <!-- 02-§24.10 -->
- The hamburger button must have an accessible label (`aria-label`). <!-- 02-§24.11 -->
- The hamburger button must use `aria-expanded` to communicate state to
  assistive technologies. <!-- 02-§24.12 -->
- The expanded menu must be closable by pressing Escape. <!-- 02-§24.13 -->
- The expanded menu must be closable by clicking outside it. <!-- 02-§24.14 -->

### 24.5 Desktop behaviour

- On desktop (viewport 768 px and wider), the hamburger button must be hidden
  and all navigation links must be directly visible. <!-- 02-§24.15 -->

---

## 25. Image Loading Performance

The site must use browser-native loading hints to improve perceived performance
and reduce layout shift. No new client-side JavaScript is required.

### 25.1 Lazy loading for below-fold images

- Content images (class `content-img`) produced by the build must include
  `loading="lazy"`, except for images in the first content section (which is
  above the fold on mobile and may contain the LCP element). <!-- 02-§25.1 -->
- Images in the first content section must NOT have `loading="lazy"` — they are
  above the fold on mobile and lazy-loading them delays the Largest Contentful
  Paint. <!-- 02-§25.5 -->
- The hero image (class `hero-img`) must NOT have `loading="lazy"` — it is
  above the fold and must load immediately. <!-- 02-§25.2 -->

### 25.2 Hero image preload and priority

- The `<head>` of the homepage must include a `<link rel="preload" as="image">`
  element whose `href` matches the hero image source. The path must not be
  hardcoded — it is derived from the hero image extracted at build time. <!-- 02-§25.3 -->
- The hero `<img>` tag must include `fetchpriority="high"`. <!-- 02-§25.4 -->

### 25.3 Script loading

- The `nav.js` script tag must include the `defer` attribute on all pages. This
  breaks the critical request chain (HTML → CSS → JS) identified by Lighthouse,
  allowing the browser to discover and preload the script during HTML
  parsing. <!-- 02-§25.6 -->

---

## 26. Form Time-Gating

The add-activity and edit-activity forms must only be usable during a defined
period around the active camp. Outside this period, participants cannot create
or edit activities.

### 26.1 Data model

- Each camp in `camps.yaml` must have an `opens_for_editing` field containing a
  `YYYY-MM-DD` date. This is the first date on which the forms become
  available. <!-- 02-§26.1 -->
- The submission period for a camp runs from `opens_for_editing` through
  `end_date + 1 day` (inclusive on both ends, compared as dates without
  timezone). <!-- 02-§26.2 -->

### 26.2 UI behaviour — before the period opens

- When the current date is before `opens_for_editing`, the add-activity form
  is rendered but visually greyed out (reduced opacity on all form fields). <!-- 02-§26.3 -->
- The submit button is disabled. <!-- 02-§26.4 -->
- A message is displayed above the form stating when it opens, e.g.
  "Formuläret öppnar den 15 februari 2026." <!-- 02-§26.5 -->

### 26.3 UI behaviour — after the period closes

- When the current date is after `end_date + 1 day`, the add-activity form
  is rendered but visually greyed out (reduced opacity on all form fields). <!-- 02-§26.6 -->
- The submit button is disabled. <!-- 02-§26.7 -->
- A message is displayed above the form stating that the camp has ended, e.g.
  "Lägret är avslutat." <!-- 02-§26.8 -->

### 26.4 UI behaviour — edit form

- The same time-gating rules apply to the edit-activity form
  (`/redigera.html`). <!-- 02-§26.9 -->

### 26.5 API enforcement

- The `POST /add-event` endpoint must reject requests with HTTP 403 when the
  current date is outside the `[opens_for_editing, end_date + 1d]`
  period. <!-- 02-§26.10 -->
- The `POST /edit-event` endpoint must apply the same check. <!-- 02-§26.11 -->
- The error response must include a Swedish message explaining why the
  submission was rejected. <!-- 02-§26.12 -->

### 26.6 Build-time data passing

- The build must embed `opens_for_editing` and `end_date` as `data-` attributes
  on the form element so client-side JavaScript can evaluate the period at page
  load without an API call. <!-- 02-§26.13 -->

---

## 27. Past-Date Blocking

Events must not be created or edited with a date in the past. This rule applies
to both the add-activity and edit-activity flows, at both the client and server
layers.

### 27.1 Definition

- "Past" means the event's date is strictly before today's local date
  (`YYYY-MM-DD` string comparison). Today itself is not considered past. <!-- 02-§27.1 -->

### 27.2 Add-activity form (client)

- Before submission, the add-activity form must check that the selected date is
  not in the past. If it is, the form must show the error message
  "Datum kan inte vara i det förflutna." and prevent submission. <!-- 02-§27.2 -->

### 27.3 Edit-activity form (client)

- Before submission, the edit-activity form must check that the date field value
  is not in the past. If it is, the form must show the error message
  "Datum kan inte vara i det förflutna." and prevent submission. <!-- 02-§27.3 -->

### 27.4 Add-event API endpoint (server)

- The `POST /add-event` endpoint must reject requests where the `date` field is
  in the past, responding with HTTP 400 and a Swedish error message. <!-- 02-§27.4 -->

### 27.5 Edit-event API endpoint (server)

- The `POST /edit-event` endpoint must reject requests where the submitted
  `date` field is in the past, responding with HTTP 400 and a Swedish error
  message. This is in addition to the existing check that blocks editing events
  whose original date has passed. <!-- 02-§27.5 -->

### 27.6 Server validation location

- The past-date check must be implemented in the shared validation module
  (`source/api/validate.js`) so that both endpoints use the same logic. <!-- 02-§27.6 -->

---
