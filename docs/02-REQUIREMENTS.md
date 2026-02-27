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
| `02-§2.4` | Today view | `/idag.html` | Participants |
| `02-§2.4a` | Display view | `/dagens-schema.html` | Shared screens |
| `02-§2.5` | Add activity | `/lagg-till.html` | Participants |
| `02-§2.6` | Archive | `/arkiv.html` | Prospective families, returning participants |
| `02-§2.7` | RSS feed | `/schema.rss` | Anyone subscribing to the schedule |
| `02-§2.11` | Edit activity | `/redigera.html` | Participants who submitted the event |
| `02-§2.12` | iCal feed | `/schema.ics` | Anyone subscribing to the schedule |
| `02-§2.13` | Calendar tips | `/kalender.html` | Participants wanting to sync the schedule |

The homepage, schedule pages, add-activity form, and archive share the same header and navigation. <!-- 02-§2.8 -->
None require login. <!-- 02-§2.9 -->

The Today view (`/idag.html`) uses the standard site layout with header and navigation. <!-- 02-§2.4 -->
The Display view (`/dagens-schema.html`) has no header or navigation — it is a minimal, full-screen display intended for shared screens around the camp. <!-- 02-§2.10 -->
Both show today's activities; they differ only in presentation context.

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
The upcoming-camps list renders each camp as a compact one-liner (icon, name, location, and dates on a single line) with no visual separators between items. <!-- 02-§3.5 -->

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

### Today view (`/idag.html`)

- Shows only today's activities in the standard site layout. <!-- 02-§4.5 -->
- No navigation to other days. This view is always today. <!-- 02-§4.13 -->

### Display view (`/dagens-schema.html`)

- Shows today's activities on a dark, full-screen layout for shared screens around the camp.
- Must be legible at a distance: dark background, large text, minimal interface chrome. <!-- 02-§4.6 -->
- Must not require any interaction to stay useful — it should be readable at a glance. <!-- 02-§4.7 -->
- Shows no site-level footer. <!-- 02-§4.14 -->
- Shows a live clock of the current time in the sidebar, updated every second. <!-- 02-§4.15 -->
- Shows when events were last updated; the timestamp is embedded at build time and shown below the clock. <!-- 02-§4.16 -->
- Polls `version.json` every 5 minutes and reloads the page automatically if a newer build is detected. <!-- 02-§4.17 -->
- Automatically reloads shortly after midnight to show the new day's events. <!-- 02-§4.18 -->
- The heading shows only the current day and date (e.g. "måndag 26 februari 2026") without a page-title prefix. <!-- 02-§4.19 -->
- The heading is positioned inside the sidebar, not above the event list, so events use the full available height. <!-- 02-§4.20 -->
- The layout is optimised for portrait-orientation screens; event rows are compact to maximise the number of visible events. <!-- 02-§4.21 -->

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
- **Live date validation:** when the user selects a date value (on `change`), the
  date field must immediately show an inline error if the value is in the past,
  without requiring a submit attempt. <!-- 02-§6.9 -->
- **Live end-time validation:** when the user changes the end time (on `change`),
  the end-time field must immediately show an inline error if start time is already
  filled and end ≤ start. If start is not yet filled, this check is deferred to
  submit. <!-- 02-§6.10 -->
- **Live required-field validation:** when the user leaves any required field
  (on `blur`), the field must immediately show an inline error if it is empty. <!-- 02-§6.11 -->
- **Live error clearing:** an inline error shown by live validation must be
  cleared as soon as the user starts editing that field again (on `input` or
  `change`). <!-- 02-§6.12 -->
- **Live start-time cross-check:** when the user changes the start time (on
  `change`), the end-time field must immediately be re-evaluated: if end is
  filled and end ≤ new start, the error must be shown on end; if end > new
  start (or end is empty), any existing end-time cross-check error must be
  cleared. <!-- 02-§6.13 -->
- **Past start-time on today:** when the selected date is today and the user
  changes the start time (on `change`), an inline error must be shown
  immediately if the start time is more than 2 hours in the past. The same
  check must be applied to an already-set start time when the user changes the
  date to today. A 2-hour buffer is used because the user may be entering data
  for an activity that started recently or may have selected today by mistake
  when meaning tomorrow. <!-- 02-§6.14 -->

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
- Overlapping activities are allowed (see §4.8). <!-- 02-§11.2 -->
- The schedule must remain readable when multiple activities occur at the same time (see §4.8). <!-- 02-§11.3 -->

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

### 15.1 Feed format

The feed must be valid RSS 2.0 XML. <!-- 02-§15.3 -->

All feed metadata must be in Swedish: <!-- 02-§15.4 -->

- `<title>` — "Schema – {camp name}"
- `<description>` — "Aktivitetsschema för {camp name}"
- `<language>` — `sv`

The feed `<link>` must point to the weekly schedule page using the site's
base URL (e.g. `https://sommar.digitalasynctransparency.com/schema.html`). <!-- 02-§15.5 -->

### 15.2 Feed items

Each event in the active camp must produce one `<item>` in the feed. <!-- 02-§15.6 -->

Each item must include: <!-- 02-§15.7 -->

- `<title>` — event title
- `<link>` — absolute URL to the event's per-event detail page (see §36)
- `<guid isPermaLink="true">` — same URL as `<link>`
- `<description>` — a structured, multi-line human-readable summary formatted
  as follows: <!-- 02-§15.15 -->
  - Line 1: formatted date, start–end time (no labels)
  - Line 2: `Plats:` value ` · ` `Ansvarig:` value (with labels)
  - Line 3: event description (only if set, no label)
  - Line 4: event link (only if set, no label)
- `<pubDate>` — the event date and start time, formatted as RFC 822

Items must be sorted chronologically (same order as the weekly schedule). <!-- 02-§15.8 -->

### 15.3 Build-time generation

The RSS feed is generated at build time by `render-rss.js` and written to
`public/schema.rss`. <!-- 02-§15.9 -->

The renderer must not depend on any RSS library — the XML is simple enough
to emit directly. <!-- 02-§15.10 -->

### 15.4 Site base URL

Absolute URLs in the RSS feed (and per-event detail pages) require a
configurable base URL. <!-- 02-§15.11 -->

The build reads the base URL from the `SITE_URL` environment variable. <!-- 02-§15.12 -->

If `SITE_URL` is not set, the build must fail with a clear error message —
RSS links cannot be generated without a base URL. <!-- 02-§15.13 -->

CI workflows that run `npm run build` must pass `SITE_URL` as an
environment variable alongside `API_URL`. <!-- 02-§15.14 -->

---

## 36. Per-Event Detail Pages

Each event in the active camp must have its own static HTML page, generated
at build time. <!-- 02-§36.1 -->

### 36.1 URL structure

Each event page lives in its own sub-folder under `/schema/`: <!-- 02-§36.2 -->

```text
/schema/{event-id}/index.html
```

For example: `/schema/middag-2026-06-30-1630/index.html`, accessible as
`/schema/middag-2026-06-30-1630/`.

### 36.2 Page content

Each event page must show: <!-- 02-§36.3 -->

- Event title (as page heading)
- Date (formatted in Swedish)
- Start time and end time
- Location
- Responsible person
- Description (if set)
- External link (if set)

Fields with no value must not appear. <!-- 02-§36.4 -->

The event detail body must use a structured layout matching the RSS
description format (see §15.15): <!-- 02-§36.11 -->

- Line 1: formatted date, start–end time (no labels)
- Line 2: `Plats:` value ` · ` `Ansvarig:` value (with labels)
- Line 3: description text (only if set, no label)
- Line 4: external link (only if set)

This replaces the previous definition-list (`<dl>`) layout.

The `owner` and `meta` fields must never appear on event pages. <!-- 02-§36.5 -->

### 36.3 Layout and navigation

Event pages must use the shared site layout: header navigation, footer,
and stylesheet. <!-- 02-§36.6 -->

Each event page must include a back link to the weekly schedule page. <!-- 02-§36.7 -->

### 36.4 Crawler blocking

Event pages must include the `<meta name="robots" content="noindex, nofollow">`
tag, consistent with all other pages. <!-- 02-§36.8 -->

### 36.5 Build integration

Event pages are generated by `render-event.js` and wired into `build.js`. <!-- 02-§36.9 -->

The build must create the `/schema/{event-id}/` directory structure inside
`public/`. <!-- 02-§36.10 -->

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

- Schedule pages add an "Redigera" link next to each event
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

### 18.10 Server-side edit endpoint

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
  `/add-event`, the edit URL falls back to `/edit-event`. <!-- 02-§18.46 -->
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

- Information text (only if non-empty in `camps.yaml`) <!-- 02-§21.9 -->
- A link to the Facebook group (only if `link` is non-empty in `camps.yaml`) <!-- 02-§21.10 -->

Date range and location are already displayed in the accordion header
(§21.4) and must not be repeated inside the panel. <!-- 02-§21.31 -->

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
- Event rows that have a `description` or `link` field must be rendered as
  expandable `<details>` elements — identical to the weekly schedule page
  (`schema.html`). The ℹ️ icon and dotted-underline title style must
  appear on these rows. <!-- 02-§21.27 -->
- Event rows without `description` or `link` remain flat (plain `<div>`),
  showing only time, title, and metadata. <!-- 02-§21.32 -->
- If a camp has no events in its YAML file, the event list section is
  omitted entirely. <!-- 02-§21.28 -->

### 21.8 Visual consistency

- The archive page must use the same typography scale, color tokens, and
  spacing tokens as the rest of the site. <!-- 02-§21.29 -->
- The event list styling in the archive must match the weekly schedule page
  in font size, weight, and color for time, title, and metadata
  spans. <!-- 02-§21.30 -->

---

## 23. Event Data CI Pipeline — superseded by §50

> **Note:** §23.1–23.10 are superseded by §49 (API-layer validation) and §50
> (Docker-based pipeline). §23.11–23.13 are superseded by §50.4 (post-merge
> SCP deploy). §23.14 still applies to `ci.yml`.

### 23.0 Git history for branch comparison

- CI workflows that compare the PR branch to `main` to detect changed files must check out
  with sufficient git history for the three-dot diff (`origin/main...HEAD`) to find a merge
  base. A shallow checkout (depth 1) is not sufficient. <!-- 02-§23.14 -->

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

## 28. Upcoming Camps on Homepage

The homepage must show a list of upcoming (and recently past) camps so that
visitors can see what is planned and what has already happened this year.

### 28.1 Filtering

- The list must include all camps where `archived` is `false` OR the camp's
  `start_date` year matches the current year. <!-- 02-§28.1 -->
- "Current year" is evaluated at page-load time in the visitor's browser,
  not at build time. <!-- 02-§28.2 -->

### 28.2 Sorting

- Camps are sorted by `start_date` ascending (nearest date first). <!-- 02-§28.3 -->

### 28.3 Past-camp marking

- A camp is considered "past" when its `end_date` is strictly before today. <!-- 02-§28.4 -->
- "Today" is evaluated client-side using Stockholm time
  (`Europe/Stockholm`). <!-- 02-§28.5 -->
- Past camps are displayed with a green checkmark (`✔`) and strikethrough
  text, making it immediately clear they have already taken place. <!-- 02-§28.6 -->
- Upcoming camps are displayed with an unchecked indicator (`☐`) and
  normal text. <!-- 02-§28.7 -->

### 28.4 Section placement

- The section is rendered as part of the index page, using data from
  `camps.yaml`. <!-- 02-§28.8 -->
- The section heading is "Kommande läger". <!-- 02-§28.9 -->
- The section must appear as a content section on the index page, positioned
  via `sections.yaml` like other sections. <!-- 02-§28.10 -->

### 28.5 Camp item content

- Each camp item shows: camp name, location, and formatted date range
  (e.g. "2 aug – 9 aug 2026"). <!-- 02-§28.11 -->
- If the camp has a non-empty `link` field, the camp name is rendered as
  a clickable link to that URL. <!-- 02-§28.12 -->
- If the camp has a non-empty `information` field, the information text is
  shown below the camp entry. <!-- 02-§28.13 -->

### 28.6 Client-side date logic

- The past/upcoming status is determined by a small client-side script
  that runs on page load. The build renders all qualifying camps with
  `data-end` attributes; JavaScript applies the visual state. <!-- 02-§28.14 -->
- This avoids the need for daily rebuilds to keep the status current. <!-- 02-§28.15 -->

### 28.7 Implementation constraints

- The section uses only CSS custom properties from `docs/07-DESIGN.md §7`.
  No hardcoded colors, spacing, or typography. <!-- 02-§28.16 -->
- The client-side script is minimal — no framework, no external
  dependency. <!-- 02-§28.17 -->

---

## 29. Camp Naming Convention

The `name` field in `camps.yaml` follows a fixed format so that camp
titles are consistent across the archive, upcoming camps section, and
any other display.

- The format is: `{type} {year} {month}`, where `{type}` is the camp
  series name (e.g. "SB sommar", "SB vinter"), `{year}` is the four-digit
  year, and `{month}` is the Swedish month name in lowercase. <!-- 02-§29.1 -->
- Month names follow Swedish convention and are never
  capitalised. <!-- 02-§29.2 -->
- The camp type name uses sentence case — only the first word is
  capitalised (e.g. "SB sommar", not "SB Sommar"). <!-- 02-§29.3 -->

---

## 30. Hero Section Redesign

The homepage hero section is redesigned from a full-width image to a two-column
layout with a title, social links, and a camp countdown. The goal is a warmer,
more inviting first impression that immediately communicates the site's purpose
and connects visitors to community channels.

### 30.1 Layout structure

- The hero section is a two-column layout: image area (approximately 2/3 width)
  and a sidebar panel (approximately 1/3 width). <!-- 02-§30.1 -->
- On mobile (below 690px), the layout stacks vertically: title, then image,
  then sidebar content. <!-- 02-§30.2 -->

### 30.2 Title

- A heading "Sommarläger i Sysslebäck" is displayed above the hero image,
  left-aligned within the image column. <!-- 02-§30.3 -->
- The title uses `var(--color-terracotta)` as its text color. <!-- 02-§30.4 -->
- The title uses the existing H1 size (40px) and weight (700) from the
  design system. <!-- 02-§30.5 -->

### 30.3 Hero image

- The hero image has rounded corners (a new `--radius-lg` token is added
  to the design system for this purpose). <!-- 02-§30.6 -->
- The image uses `object-fit: cover` and is responsive. <!-- 02-§30.7 -->
- The image occupies approximately 2/3 of the hero section width on
  desktop. <!-- 02-§30.8 -->

### 30.4 Social links sidebar

- The sidebar contains two social link icons stacked vertically:
  a Discord icon and a Facebook icon. <!-- 02-§30.9 -->
- The Discord icon links to the project Discord channel. <!-- 02-§30.10 -->
- The Facebook icon links to the camp's Facebook group. <!-- 02-§30.11 -->
- Icons are displayed at a recognizable size (approximately 64px) and are
  vertically centered within their area of the sidebar. <!-- 02-§30.12 -->

### 30.5 Countdown

- Below the social icons, a countdown displays the number of days remaining
  until the next camp starts. <!-- 02-§30.13 -->
- The countdown target date is derived automatically from `camps.yaml`:
  the `start_date` of the nearest future camp (or the active camp if its
  start date is still in the future). <!-- 02-§30.14 -->
- The countdown shows two lines: the number (large, prominent) and the
  label "Dagar kvar" beneath it. <!-- 02-§30.15 -->
- The countdown is rendered at build time as a `data-target` attribute.
  Client-side JavaScript calculates and updates the number on page
  load. <!-- 02-§30.16 -->
- If no future camp exists, the countdown is hidden. <!-- 02-§30.17 -->
- The countdown area has a subtle background (cream/sand oval or rounded
  rectangle) to visually separate it from the sidebar. <!-- 02-§30.18 -->

### 30.7 Visual refinements

- The countdown background color is `#FAF7EF` (a near-white cream), not
  semi-transparent. <!-- 02-§30.23 -->
- The Discord icon uses the image `DiscordLogo.webp`. <!-- 02-§30.24 -->
- The sidebar is vertically centered alongside the hero image (not
  top-aligned). <!-- 02-§30.25 -->

### 30.6 Implementation constraints

- All styling uses CSS custom properties from `docs/07-DESIGN.md §7`.
  No hardcoded colors, spacing, or typography. <!-- 02-§30.19 -->
- The countdown client-side script is minimal — no framework, no external
  dependency. <!-- 02-§30.20 -->
- Social icon images are stored in `source/content/images/` and copied
  to `public/images/` at build time. <!-- 02-§30.21 -->
- The Facebook link and Discord link are provided at build time from
  configuration, not hardcoded in templates. <!-- 02-§30.22 -->

---

## 31. Inline Camp Listing and Link Styling

The camp listing is moved from a standalone section into the intro section,
appearing directly below the first heading. Link styling is updated site-wide.

### 31.1 Camp listing placement

- The camp listing (upcoming and recent camps) is rendered inside the intro
  section, immediately after the first `<h4>` heading. <!-- 02-§31.1 -->
- The camp listing is no longer a separate page section and does not have its
  own heading or navigation entry. <!-- 02-§31.2 -->

### 31.2 Camp status icons

- Upcoming camps (end date in the future) display a sun icon (☀️) before the
  camp name. <!-- 02-§31.3 -->
- Past camps (end date in the past) display a green checkbox icon (✅) before
  the camp name. <!-- 02-§31.4 -->
- Status detection remains client-side via `data-end` attributes and
  JavaScript, as defined in 02-§28.14. <!-- 02-§31.5 -->

### 31.3 Camp item content

- Each camp item shows the camp name, location, and formatted date
  range. <!-- 02-§31.6 -->
- Camp information text is no longer rendered in the listing. <!-- 02-§31.7 -->

### 31.4 Content link styling

- All links inside `.content` use `var(--color-terracotta)` as their text
  color. <!-- 02-§31.8 -->
- Content links have no underline by default; underline appears on
  hover. <!-- 02-§31.9 -->

### 31.5 Markdown heading support

- The markdown converter supports `####` (h4) headings in addition to
  h1–h3. <!-- 02-§31.10 -->

### 31.6 Implementation constraints

- All styling must use CSS custom properties from the design system.
  No hardcoded colors, spacing, or typography. <!-- 02-§31.11 -->
- No additional runtime JavaScript beyond the existing client-side date
  detection. <!-- 02-§31.12 -->

---

## 32. HTML Validation in CI

The build generates HTML pages. Invalid HTML must be caught automatically
before merge. This closes the `CL-§5.1` gap.

### 32.1 Tool

- HTML validation uses `html-validate` — a standard, offline HTML
  validator with configurable rules. <!-- 02-§32.1 -->

### 32.2 Scope

- Validation runs against all `.html` files in `public/` after the
  build step completes. <!-- 02-§32.2 -->

### 32.3 CI integration

- A `lint:html` npm script runs `html-validate` on `public/*.html`. <!-- 02-§32.3 -->
- The CI workflow (`ci.yml`) runs `lint:html` after the build step. <!-- 02-§32.4 -->
- HTML validation failures cause the CI job to fail. <!-- 02-§32.5 -->
- HTML validation is skipped for data-only commits (same condition as
  existing lint steps). <!-- 02-§32.6 -->

### 32.4 Configuration

- The tool is configured via `.htmlvalidate.json` at the project root. <!-- 02-§32.7 -->
- Rules must be tuned to accept the existing generated HTML without
  false positives. Overly strict rules that conflict with the project's
  markup patterns must be disabled or adjusted. <!-- 02-§32.8 -->

---

## 33. CSS Linting in CI

CSS source files must be linted automatically before merge. This closes
the `CL-§5.2` gap.

### 33.1 Tool

- CSS linting uses Stylelint with `stylelint-config-standard` as the
  base configuration. <!-- 02-§33.1 -->

### 33.2 Scope

- Linting runs against all `.css` files in `source/assets/cs/`. <!-- 02-§33.2 -->

### 33.3 CI integration

- A `lint:css` npm script runs Stylelint on the CSS source files. <!-- 02-§33.3 -->
- The CI workflow (`ci.yml`) runs `lint:css` alongside the existing
  lint steps. <!-- 02-§33.4 -->
- CSS lint failures cause the CI job to fail. <!-- 02-§33.5 -->
- CSS linting is skipped for data-only commits (same condition as
  existing lint steps). <!-- 02-§33.6 -->

### 33.4 Configuration

- The tool is configured via `.stylelintrc.json` at the project root. <!-- 02-§33.7 -->
- Rules must be tuned to accept the existing CSS without false
  positives. Rules that conflict with project conventions (e.g.
  custom property patterns, selector patterns) must be disabled or
  adjusted. <!-- 02-§33.8 -->

---

## 34. Derived Active Camp

The active camp must be derived automatically from camp dates at build time
and at API request time. The manual `active` field is removed from the data
model. This ensures exactly one camp is active at all times without manual
intervention.

### 34.1 Derivation rules

The system determines the active camp using the following priority: <!-- 02-§34.1 -->

1. **On dates** — if today falls within a camp's `start_date..end_date`
   (inclusive), that camp is active. <!-- 02-§34.2 -->
2. **Next upcoming** — if no camp is on dates, the camp with the nearest
   future `start_date` is active. <!-- 02-§34.3 -->
3. **Most recent** — if no upcoming camps exist, the camp with the latest
   `end_date` is active, even if it is archived. <!-- 02-§34.4 -->

If two camps overlap in dates, the one with the earlier `start_date` wins. <!-- 02-§34.5 -->

### 34.2 Data model changes

- The `active` field is removed from `camps.yaml` entries. <!-- 02-§34.6 -->
- The `active` field is removed from the data contract (`05-DATA_CONTRACT.md`). <!-- 02-§34.7 -->
- The `active + archived` conflict check is removed from lint-yaml.js
  (the conflict is impossible when `active` no longer exists). <!-- 02-§34.8 -->

### 34.3 Build-time resolution

- `build.js` resolves the active camp by applying the derivation rules
  at build time using the current date. <!-- 02-§34.9 -->
- The resolved camp is logged to stdout for operator visibility. <!-- 02-§34.10 -->

### 34.4 API resolution

- `github.js` resolves the active camp using the same derivation rules
  when handling add-event and edit-event requests. <!-- 02-§34.11 -->
- The derivation logic is shared between build and API (not duplicated). <!-- 02-§34.12 -->

### 34.5 Validation

- `lint-yaml.js` no longer checks for the `active` field or the
  `active + archived` conflict. <!-- 02-§34.13 -->
- Existing tests that assert on the `active` field are updated or
  removed. <!-- 02-§34.14 -->

---

## 35. Location Accordions on Index Page

The Lokaler section on the index page must display each location from `local.yaml`
as an individual accordion item. The section heading and introductory text remain
visible; only the individual locations are collapsible.

### 35.1 Section heading

- The "Lokaler" heading (`## Lokaler` in `locations.md`) must render as a regular
  heading, not wrapped in an accordion. <!-- 02-§35.1 -->
- The introductory paragraph below the heading must remain visible (not inside
  any accordion). <!-- 02-§35.2 -->

### 35.2 Location accordions

- Each location entry in `local.yaml` must render as a separate
  `<details class="accordion">` element. <!-- 02-§35.3 -->
- The location `name` must appear as the `<summary>` text. <!-- 02-§35.4 -->
- The location `information` text must appear inside the accordion body. <!-- 02-§35.5 -->
- Locations with one or more `image_path` values must render each image as an
  `<img>` inside the accordion body, below the information text. <!-- 02-§35.6 -->
- Locations with empty `information` and empty `image_path` must still render as
  an accordion (summary only, empty body). <!-- 02-§35.7 -->
- Accordions must appear in the same order as entries in `local.yaml`. <!-- 02-§35.8 -->

### 35.3 Build integration

- The build must pass the full location data (not just names) to the index
  rendering pipeline. <!-- 02-§35.9 -->
- The `collapsible: true` flag in `sections.yaml` must be removed for the lokaler
  section (individual location accordions replace it). <!-- 02-§35.10 -->

---

## 37. camps.yaml Validator

A validation and sync tool that enforces `camps.yaml` as the single source of truth
for camp metadata, ensures referenced camp files exist, and keeps camp headers in
sync.

### 37.1 camps.yaml validation

- The validator must check that every entry in `camps.yaml` has all required fields:
  `id`, `name`, `start_date`, `end_date`, `opens_for_editing`, `location`, `file`,
  `archived`. <!-- 02-§37.1 -->
- `start_date`, `end_date`, and `opens_for_editing` must be valid `YYYY-MM-DD`
  dates. <!-- 02-§37.2 -->
- `end_date` must be on or after `start_date`. <!-- 02-§37.3 -->
- `archived` must be a boolean. <!-- 02-§37.4 -->
- Camp `id` values must be unique across all entries. <!-- 02-§37.5 -->
- Camp `file` values must be unique across all entries. <!-- 02-§37.6 -->
- The validator must exit with a non-zero code if any validation error is
  found. <!-- 02-§37.7 -->

### 37.2 Camp file creation

- If a camp entry's `file` does not exist in `source/data/`, the validator must
  create it automatically. <!-- 02-§37.8 -->
- The created file must contain a `camp:` header with `id`, `name`, `location`,
  `start_date`, and `end_date` — all sourced from `camps.yaml`. <!-- 02-§37.9 -->
- The created file must contain an empty `events: []` section. <!-- 02-§37.10 -->
- Field order in the `camp:` header must be: `id`, `name`, `location`,
  `start_date`, `end_date`. <!-- 02-§37.11 -->

### 37.3 Camp header sync

- `camps.yaml` is the single source of truth for camp metadata. <!-- 02-§37.12 -->
- When a camp file exists, the validator must compare its `camp:` header fields
  (`id`, `name`, `location`, `start_date`, `end_date`) against `camps.yaml`. <!-- 02-§37.13 -->
- If any field differs, the validator must update the camp file to match
  `camps.yaml`, preserving the `events:` section unchanged. <!-- 02-§37.14 -->
- The field order after sync must be: `id`, `name`, `location`, `start_date`,
  `end_date`. <!-- 02-§37.15 -->

### 37.4 Integration

- The validator must be runnable as `npm run validate:camps`. <!-- 02-§37.16 -->
- The validator must log each action (created file, synced header, validation error)
  to stdout. <!-- 02-§37.17 -->
- The validator must be importable as a module for use in tests. <!-- 02-§37.18 -->

---

## 38. Replace Hand-Rolled Markdown Converter with marked

The build-time markdown converter (`convertMarkdown()` and `inlineHtml()` in
`render-index.js`) supports only a limited subset of markdown. Content authors
write standard markdown (including tables) that the converter silently mangles.
Replace the hand-rolled converter with the `marked` library.

### 38.1 Library integration

- The build must use `marked` as the markdown-to-HTML converter. <!-- 02-§38.1 -->
- `marked` must be a production dependency (build-time only; no client-side
  JS change). <!-- 02-§38.2 -->
- No other new dependencies may be added. <!-- 02-§38.3 -->

### 38.2 Preserved behaviours

- Heading offset: the `headingOffset` parameter must shift all heading levels
  (e.g. `## Foo` with offset 1 becomes `<h3>`), capped at `h6`. <!-- 02-§38.4 -->
- Collapsible accordion: when `collapsible` is true, each `##`-level section
  (after offset) must be wrapped in a
  `<details class="accordion"><summary>…</summary>…</details>`
  element. Content before the first `##` must not be wrapped. <!-- 02-§38.5 -->
- Images rendered from markdown must have `class="content-img"` and
  `loading="lazy"`. <!-- 02-§38.6 -->

### 38.3 Full markdown support

- Standard markdown features (tables, ordered lists, code blocks, nested lists,
  emphasis, line breaks) must render correctly. <!-- 02-§38.7 -->
- Existing content files must not be modified — the converter must handle them
  as-is. <!-- 02-§38.8 -->

### 38.4 Table styling

- Tables rendered from markdown must have basic CSS styling using existing
  design tokens. <!-- 02-§38.9 -->

### 38.5 Quality

- All existing tests must continue to pass (with assertion adjustments where
  marked produces correct but different HTML). <!-- 02-§38.10 -->
- Build, lint, and HTML validation must pass. <!-- 02-§38.11 -->

---

## 39. CodeQL Alert Remediation

GitHub CodeQL static analysis reports six alerts across workflows, server code,
and test files. All must be resolved so the repository reaches zero open CodeQL
alerts.

### 39.1 Workflow permissions (CI)

- `ci.yml` must declare an explicit `permissions` block with minimal
  scope. The workflow only reads repository contents, so `contents: read`
  is sufficient. <!-- 02-§39.1 -->

### 39.2 Workflow permissions (deploy)

- `deploy-reusable.yml` must declare an explicit `permissions` block with
  minimal scope. The workflow reads repository contents and deploys via
  external FTP/SSH (no GitHub Pages token needed), so `contents: read` is
  sufficient. <!-- 02-§39.2 -->

### 39.3 ReDoS-safe slugify

- The `slugify()` function in `source/api/github.js` must not contain
  regex patterns that CodeQL flags as polynomial-time backtracking risks.
  The current `/^-+|-+$/g` alternation must be replaced with an equivalent
  that avoids backtracking. <!-- 02-§39.3 -->
- The replacement must produce identical output for all existing test
  cases. <!-- 02-§39.4 -->

### 39.4 Test assertion specificity

- Test assertions that check for URL substrings must be specific enough
  that CodeQL does not flag them as incomplete URL sanitisation. <!-- 02-§39.5 -->
- Assertions in `tests/render.test.js` and `tests/github.test.js` that
  use bare `includes('https://…')` must be changed to match a surrounding
  context (e.g. `includes('href="https://…"')` or
  `includes('link: https://…')`). <!-- 02-§39.6 -->

### 39.5 Verification

- After the changes are merged, `gh api repos/{owner}/{repo}/code-scanning/alerts?state=open`
  must return fewer open alerts (ideally zero). <!-- 02-§39.7 -->

---

## 40. Zero-Downtime Static Site Deploy

The static site deploy must use a staging-and-swap strategy that limits
downtime to milliseconds. The build output is uploaded to a staging directory
via SCP, then swapped into the live web root with server-side `mv` operations.

### 40.1 Deploy method (site requirements)

- The static site must be uploaded to a staging directory on the server
  via `scp` over SSH, not via FTP. <!-- 02-§40.1 -->
- After upload, an SSH command must swap the staging directory into
  the live web root (`public_html`). <!-- 02-§40.2 -->
- The swap must preserve the hosting infrastructure `domains/` directory
  inside `public_html` by moving it into the new release before the
  swap. <!-- 02-§40.3 -->
- Downtime during the swap must be limited to the time needed for two
  `mv` operations on the same filesystem (milliseconds, not seconds). <!-- 02-§40.4 -->
- Leftover directories from the previous release (`public_html_old`)
  and from any previous failed deploy (`release_new`) must be cleaned
  up automatically. <!-- 02-§40.5 -->

### 40.2 Build packaging (site requirements)

- The build output must be packaged into a single `tar.gz` archive
  before upload, to avoid per-file transfer overhead. <!-- 02-§40.6 -->
- The archive must be extracted on the server side into the staging
  directory. <!-- 02-§40.7 -->
- The archive must be deleted from the server after extraction. <!-- 02-§40.8 -->

### 40.3 Secrets and configuration (site requirements)

- The deploy must use the existing SSH secrets: `SERVER_HOST`,
  `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`. <!-- 02-§40.9 -->
- A new secret `DEPLOY_DIR` must be added, pointing to the domain
  directory on the server (the parent of `public_html`). <!-- 02-§40.10 -->
- The FTP static-site upload step and `FTP_TARGET_DIR` validation
  step must be removed from the workflow. <!-- 02-§40.11 -->

### 40.4 Unchanged behaviour (site requirements)

- The server app deploy (FTP + SSH restart) must remain unchanged.
  **Superseded by 02-§43.6–43.8**: the FTP step is now removed; SSH
  restart is sufficient. <!-- 02-§40.12 -->
- The build step (checkout, node setup, npm ci, npm run build) must
  remain unchanged. <!-- 02-§40.13 -->
- The workflow trigger (push to `main`, paths-ignore data files) must
  remain unchanged. <!-- 02-§40.14 -->

### 40.5 Error handling (site requirements)

- The SSH swap script must use `set -e` so any failing command aborts
  the deploy immediately. <!-- 02-§40.15 -->
- If the swap fails mid-way, the state must be recoverable by a
  subsequent deploy (clean-up of stale directories at the start of
  the script). <!-- 02-§40.16 -->

---

## 41. Environment Management

The project uses three environments — Local, QA, and Production — deployed
from a single `main` branch. Code changes are promoted to Production manually;
event data reaches both environments immediately.

### 41.1 Environments (site requirements)

- The project must define three environments: Local, QA, and
  Production. <!-- 02-§41.1 -->
- QA deploys the full site automatically on every push to
  `main`. <!-- 02-§41.2 -->
- Production deploys the full site only via a manual
  `workflow_dispatch` trigger. <!-- 02-§41.3 -->
- Both QA and Production deploy from the `main` branch; no separate
  production branch exists. <!-- 02-§41.4 -->
- Event data submitted via the API always commits to `main`, regardless
  of which environment the API runs in. <!-- 02-§41.5 -->

### 41.2 GitHub Environments (site requirements)

- QA deploy secrets must be scoped to a GitHub Environment named
  `qa`. <!-- 02-§41.6 -->
- Production deploy secrets must be scoped to a GitHub Environment
  named `production`. <!-- 02-§41.7 -->
- Each environment must have its own independent values for:
  `SITE_URL`, `API_URL`, `SERVER_HOST`, `SERVER_USER`,
  `SERVER_SSH_KEY`, `SERVER_SSH_PORT`, `DEPLOY_DIR`.
  Production additionally requires: `FTP_HOST`, `FTP_USERNAME`,
  `FTP_PASSWORD`, `FTP_APP_DIR`, `FTP_TARGET_DIR`.
  QA no longer uses FTP secrets (see §43). <!-- 02-§41.8 -->

### 41.3 Reusable deploy workflow (site requirements)

- A reusable workflow (`.github/workflows/deploy-reusable.yml`) must
  contain the shared build-and-deploy logic. <!-- 02-§41.9 -->
- The reusable workflow must accept the environment name as an
  input. <!-- 02-§41.10 -->
- `deploy-qa.yml` must call the reusable workflow with environment
  `qa`. <!-- 02-§41.11 -->
- `deploy-prod.yml` must call the reusable workflow with environment
  `production`. <!-- 02-§41.12 -->
- The original `deploy.yml` must be removed after the split is
  complete. <!-- 02-§41.13 -->

### 41.4 Event data deploy (site requirements)

- When an event PR merges, `event-data-deploy.yml` must deploy the
  event data pages to both QA and Production in
  parallel. <!-- 02-§41.14 -->
- Each parallel deploy job must build with its own environment's
  `SITE_URL` and `API_URL` so that per-event page links point to the
  correct domain. <!-- 02-§41.15 -->

### 41.5 Hardcoded URL fix (site requirements)

- The QR code URL in `build.js` must use the `SITE_URL` environment
  variable instead of a hardcoded domain. <!-- 02-§41.16 -->

### 41.6 CI workflow (site requirements)

- `ci.yml` does not need environment-scoped secrets; its `SITE_URL`
  remains a repository-level secret. <!-- 02-§41.17 -->

### 41.7 Local development (site requirements)

- Local development uses `.env` for all environment
  variables. <!-- 02-§41.18 -->
- `.env.example` must document the environment management
  setup. <!-- 02-§41.19 -->

---

## 42. QA Camp Isolation

QA and Production share the same `camps.yaml` registry and the same git branch.
A dedicated QA camp allows testing the full event flow (form submission, schedule
rendering, today view) without polluting production data. The QA camp must be
invisible to production builds and APIs, and must always be the active camp in
QA environments.

### 42.1 Data model (data requirements)

- `camps.yaml` entries may include an optional `qa` field of type
  boolean. <!-- 02-§42.1 -->
- When `qa` is omitted or `false`, the camp is a normal production
  camp. <!-- 02-§42.2 -->
- When `qa` is `true`, the camp is a QA-only camp. <!-- 02-§42.3 -->

### 42.2 QA camp entry (data requirements)

- The existing `2026-02-testar` camp must be renamed to
  `id: qa-testcamp`. <!-- 02-§42.4 -->
- Its `file` must be renamed to `qa-testcamp.yaml`. <!-- 02-§42.5 -->
- Its date range must span the full calendar year (e.g.
  `start_date: 2026-01-01`, `end_date: 2026-12-31`) so that events
  submitted on any day of the year pass date validation. <!-- 02-§42.6 -->
- Its `opens_for_editing` must be set to the start of the year so the
  form is always open. <!-- 02-§42.7 -->
- It must have `qa: true`. <!-- 02-§42.8 -->
- The corresponding data file must be renamed from
  `2026-02-testar.yaml` to `qa-testcamp.yaml`, with the camp header
  updated to match. <!-- 02-§42.9 -->
- Existing events in the file are preserved (they are test
  data). <!-- 02-§42.10 -->

### 42.3 Production filtering (site requirements)

- In production (`BUILD_ENV=production`), the build must exclude all
  camps with `qa: true` before resolving the active
  camp. <!-- 02-§42.11 -->
- In production, the API must exclude all camps with `qa: true` before
  resolving the active camp for add-event and edit-event
  requests. <!-- 02-§42.12 -->
- QA camps must never appear in production schedule pages, today view,
  archive, or RSS feed. <!-- 02-§42.13 -->

### 42.4 QA resolution (site requirements)

- In QA (`BUILD_ENV=qa`), if a camp with `qa: true` exists and its
  dates cover today, it must win the active camp resolution regardless
  of other camps' dates. <!-- 02-§42.14 -->
- The resolution priority in QA is: QA camp on dates first, then
  normal derivation rules for remaining camps. <!-- 02-§42.15 -->
- This ensures the QA camp is always active in QA, even when a real
  production camp's dates also cover today. <!-- 02-§42.16 -->

### 42.5 Environment signal (site requirements)

- The build must read a `BUILD_ENV` environment variable to determine
  the environment (`qa` or `production`). <!-- 02-§42.17 -->
- `deploy-reusable.yml` must pass the environment name as `BUILD_ENV`
  to the build step. <!-- 02-§42.18 -->
- The API (`app.js`) must read `BUILD_ENV` from its environment to
  apply the correct filtering. <!-- 02-§42.19 -->
- `.env.example` must document the `BUILD_ENV` variable. <!-- 02-§42.20 -->
- When `BUILD_ENV` is not set (local development), no filtering is
  applied — all camps are included, and normal derivation rules
  apply. <!-- 02-§42.21 -->

### 42.6 Resolve function changes (site requirements)

- `resolveActiveCamp()` must accept an optional `environment`
  parameter (e.g. `'qa'`, `'production'`). <!-- 02-§42.22 -->
- When `environment` is `'production'`, camps with `qa: true` are
  filtered out before resolution. <!-- 02-§42.23 -->
- When `environment` is `'qa'`, QA camps that are on dates take
  priority over non-QA camps. <!-- 02-§42.24 -->
- When `environment` is not set, the function behaves as it does
  today (no filtering, no QA priority). <!-- 02-§42.25 -->

### 42.7 Validation (site requirements)

- `lint-yaml.js` must accept `qa` as a valid optional boolean field
  in `camps.yaml` entries. <!-- 02-§42.26 -->
- The camps.yaml validator (`validate-camps.js`) must accept `qa` as
  a valid optional boolean field. <!-- 02-§42.27 -->

### 42.8 Yearly maintenance (operational)

- Once per year, the QA camp's date range should be updated to cover
  the new calendar year. <!-- 02-§42.28 -->
- This is a manual one-line change in `camps.yaml` — no automation
  is required. <!-- 02-§42.29 -->

---

## 43. Replace FTP with SSH for QA Deploys

FTP transmits credentials in cleartext and requires a separate set of secrets
(`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`). The static site deploy already
uses SCP/SSH. This section migrates the remaining FTP-based deploy steps to
SSH for the QA environment, reducing the attack surface and the number of
secrets to manage. Production remains on FTP until QA is validated.

### 43.1 Event data deploy — QA (site requirements)

- The `deploy-qa` job in `event-data-deploy.yml` must upload event data
  pages via SCP over SSH instead of FTP. <!-- 02-§43.1 -->
- The upload must use the existing QA SSH secrets: `SERVER_HOST`,
  `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`. <!-- 02-§43.2 -->
- The target directory must be derived from `DEPLOY_DIR` (the same
  secret the full site deploy uses), with `/public_html/` appended,
  instead of requiring a separate `FTP_TARGET_DIR` secret. <!-- 02-§43.3 -->
- The upload must include the same files as today: `schema.html`,
  `idag.html`, `dagens-schema.html`, `events.json`, `schema.rss`,
  and per-event detail pages under `schema/`. <!-- 02-§43.4 -->
- The `FTP_TARGET_DIR` validation step must be removed from the QA
  job. <!-- 02-§43.5 -->

### 43.2 API server deploy — remove redundant FTP step (site requirements)

- The "Upload server app to FTP" step in `deploy-reusable.yml` must
  be removed. <!-- 02-§43.6 -->
- The "Stage server files for upload" step must also be removed, since
  it only exists to feed the FTP step. <!-- 02-§43.7 -->
- The SSH restart step (`Deploy API via SSH`) must remain unchanged —
  it already performs `git pull` and `npm install`, which is sufficient
  to deploy the API server. <!-- 02-§43.8 -->

### 43.3 Production — superseded by §50.5

> **Note:** Production event data deploy now uses SCP (§50.5).
> `02-§43.9` and `02-§43.10` are superseded by `02-§50.19`–`02-§50.22`.

### 43.4 Documentation (site requirements)

- `docs/08-ENVIRONMENTS.md` must be updated to reflect that QA no longer
  requires FTP secrets for event data deploy. <!-- 02-§43.11 -->
- `docs/04-OPERATIONS.md` must be updated to describe the new QA event
  data deploy method (SCP instead of FTP). <!-- 02-§43.12 -->
- The secrets schema in `08-ENVIRONMENTS.md` must note which FTP secrets
  are production-only and which are shared. <!-- 02-§43.13 -->

### 43.5 QA FTP secret cleanup (operational)

- After verifying the QA SCP deploy works, the FTP secrets (`FTP_HOST`,
  `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_APP_DIR`, `FTP_TARGET_DIR`) should
  be removed from the `qa` GitHub Environment. <!-- 02-§43.14 -->
- This is a manual step — no automation required. <!-- 02-§43.15 -->

---

## 44. PHP API for Shared Hosting

The Node.js API server (`app.js`) requires a Node.js-capable host with Passenger
or a similar process manager. Loopia (the target webhotell) supports PHP and
Apache but not Node.js. This section adds a PHP implementation of the same API
so that the entire site — static files and API — can be served from a single
shared hosting account.

The Node.js API is kept intact for local development and for any future host
that supports Node.js.

### 44.1 PHP API endpoints (site requirements)

- The PHP API must implement `POST /api/add-event` with the same request body,
  validation rules, and response format as the Node.js `POST /add-event`. <!-- 02-§44.1 -->
- The PHP API must implement `POST /api/edit-event` with the same request body,
  validation rules, and response format as the Node.js `POST /edit-event`. <!-- 02-§44.2 -->
- Both endpoints must return JSON responses with `Content-Type: application/json`. <!-- 02-§44.3 -->
- A `GET /api/health` endpoint must return `{"status":"API running"}` for
  monitoring and deploy verification. <!-- 02-§44.4 -->

### 44.2 Input validation (site requirements)

- All validation rules from §10 (required fields, type checks, length limits,
  YAML safety) must be replicated in the PHP implementation. <!-- 02-§44.5 -->
- Camp date range validation (event date must fall within the active camp's
  `start_date..end_date`) must be enforced. <!-- 02-§44.6 -->
- Past-date blocking (§27) must be enforced for both add and edit. <!-- 02-§44.7 -->
- Edit requests must require a non-empty `id` field. <!-- 02-§44.8 -->

### 44.3 Time-gating (site requirements)

- The PHP API must enforce the same time-gating rules as the Node.js API
  (§26): submissions are accepted only when today falls within
  `opens_for_editing..end_date + 1 day`. <!-- 02-§44.9 -->
- When outside the editing period, both endpoints must return HTTP 403 with
  the same Swedish error message as the Node.js implementation. <!-- 02-§44.10 -->

### 44.4 GitHub integration (site requirements)

- The PHP API must commit new events to the active camp's YAML file via the
  GitHub Contents API, using the same ephemeral-branch → PR → auto-merge
  pipeline as the Node.js implementation. <!-- 02-§44.11 -->
- Edit requests must patch the existing event in the YAML file using the
  same field replacement logic as the Node.js `patchEventInYaml`. <!-- 02-§44.12 -->
- The active camp must be resolved by reading `source/data/camps.yaml` from
  GitHub (not from a local file), using the same derivation rules as
  `resolveActiveCamp`. <!-- 02-§44.13 -->
- YAML serialisation must produce output compatible with the existing data
  contract (05-DATA_CONTRACT.md). <!-- 02-§44.14 -->

### 44.5 Session cookies (site requirements)

- The PHP API must read and write the `sb_session` cookie using the same
  format (JSON-encoded array of event IDs, URL-encoded) as the Node.js
  implementation. <!-- 02-§44.15 -->
- Cookie attributes must match: `Path=/`, `Max-Age=604800`, `Secure`,
  `SameSite=Strict`, and optional `Domain` when `COOKIE_DOMAIN` is set. <!-- 02-§44.16 -->
- Edit requests must verify that the event ID is present in the session
  cookie; return HTTP 403 if not. <!-- 02-§44.17 -->
- The cookie is only set when the client signals consent
  (`cookieConsent: true` in the request body). <!-- 02-§44.18 -->

### 44.6 CORS (site requirements)

- The PHP API must set CORS headers (`Access-Control-Allow-Origin`,
  `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`,
  `Access-Control-Allow-Credentials`) for origins listed in
  `ALLOWED_ORIGIN` and `QA_ORIGIN` environment variables. <!-- 02-§44.19 -->
- `OPTIONS` preflight requests must return HTTP 204 with the correct
  CORS headers. <!-- 02-§44.20 -->

### 44.7 Configuration (site requirements)

- The PHP API must read configuration from environment variables with the
  same names as the Node.js API: `GITHUB_OWNER`, `GITHUB_REPO`,
  `GITHUB_BRANCH`, `GITHUB_TOKEN`, `ALLOWED_ORIGIN`, `QA_ORIGIN`,
  `COOKIE_DOMAIN`, `BUILD_ENV`. <!-- 02-§44.21 -->
- On Loopia, environment variables are provided via a `.env` file in the
  API directory. The PHP API must load this file at startup if it
  exists. <!-- 02-§44.22 -->
- `GITHUB_TOKEN` and other secrets must never appear in error responses
  or logs visible to end users. <!-- 02-§44.23 -->

### 44.8 File structure (site requirements)

- The PHP API must live in an `api/` directory at the project root,
  separate from the Node.js source. <!-- 02-§44.24 -->
- Dependencies are managed via Composer (`api/composer.json`). <!-- 02-§44.25 -->
- The directory structure must be: `api/index.php` (router/entry point),
  `api/src/` (modules), `api/composer.json`, `api/.env` (not committed,
  git-ignored). <!-- 02-§44.26 -->

### 44.9 Apache routing (site requirements)

- An `.htaccess` file in the `api/` directory must route all requests
  to `index.php` (front-controller pattern). <!-- 02-§44.27 -->
- The `.htaccess` must work on Loopia's Apache 2.4 with `mod_rewrite`
  enabled. <!-- 02-§44.28 -->

### 44.10 Deployment (site requirements)

- The deploy workflow must upload the `api/` directory (including
  `vendor/`) to the server alongside the static site. <!-- 02-§44.29 -->
- `composer install --no-dev` must run either locally in CI or the
  `vendor/` directory must be included in the deploy archive. <!-- 02-§44.30 -->
- The `.env` file on the server is managed manually — it is not part
  of the deploy archive. <!-- 02-§44.31 -->

### 44.11 Build integration (site requirements)

- The build must set `API_URL` to point to the PHP API path
  (e.g. `https://sbsommar.se/api/add-event`) when building for
  environments that use the PHP API. <!-- 02-§44.32 -->
- The existing Node.js `API_URL` format remains valid for environments
  that still use the Node.js API. <!-- 02-§44.33 -->

### 44.12 Coexistence with Node.js API (site requirements)

- The Node.js API (`app.js`, `source/api/`) must remain fully functional
  and unmodified. <!-- 02-§44.34 -->
- Local development continues to use `npm start` (Node.js). <!-- 02-§44.35 -->
- The choice of API backend is determined solely by the `API_URL`
  environment variable in each GitHub Environment. <!-- 02-§44.36 -->

### 44.13 Documentation (site requirements)

- `docs/04-OPERATIONS.md` must document the PHP API: directory structure,
  configuration, and how to set it up on a new host. <!-- 02-§44.37 -->
- `docs/08-ENVIRONMENTS.md` must document the `qa` GitHub Environment
  (PHP on Loopia) and its secrets. The previous Node.js QA setup is
  preserved as the `qanode` environment. <!-- 02-§44.38 -->
- `docs/03-ARCHITECTURE.md` must note the dual API architecture (Node.js
  for local dev and Node.js hosts, PHP for shared hosting). <!-- 02-§44.39 -->

---

## 45. iCal Calendar Export

The activity schedule must be available as iCalendar (`.ics`) files so
participants can sync events to their phone or desktop calendar. <!-- 02-§45.1 -->

### 45.1 Per-event iCal file

Each event in the active camp must have a static `.ics` file generated at
build time, located alongside the event detail page: <!-- 02-§45.2 -->

```text
/schema/{event-id}/event.ics
```

The `.ics` file must be valid iCalendar format (RFC 5545). <!-- 02-§45.3 -->

Each per-event `.ics` file must include exactly one `VEVENT` with: <!-- 02-§45.4 -->

- `DTSTART` / `DTEND` — event start and end time
- `SUMMARY` — event title
- `LOCATION` — event location
- `DESCRIPTION` — responsible person, followed by description text if set
- `URL` — absolute URL to the event detail page
- `UID` — `{event-id}@{hostname}` (stable, unique)

All times must use floating local format (`YYYYMMDDTHHMMSS` with no `Z`
suffix and no `TZID`) — consistent with the no-timezone policy
(05-§4.5). <!-- 02-§45.5 -->

When `end` is null, `DTEND` must be omitted. <!-- 02-§45.6 -->

The iCal renderer must not depend on any external iCal library — the
format is simple enough to emit directly. <!-- 02-§45.7 -->

### 45.2 Per-event iCal link on event detail page

The event detail page (§36) must include a download link to the per-event
`.ics` file. <!-- 02-§45.8 -->

The link must appear as a third line in the event detail body, after the
existing Plats/Ansvarig line, styled consistently with those
lines. <!-- 02-§45.9 -->

### 45.3 Full-camp iCal feed

A complete iCalendar file containing all events in the active camp must be
generated at build time at `/schema.ics`. <!-- 02-§45.10 -->

The full-camp `.ics` file must contain one `VEVENT` per event, using the
same field mapping as per-event files (§45.4). <!-- 02-§45.11 -->

The `VCALENDAR` must include: <!-- 02-§45.12 -->

- `PRODID` — identifies the generator (e.g. `-//SB Sommar//Schema//SV`)
- `X-WR-CALNAME` — `Schema – {camp name}`
- `METHOD` — `PUBLISH`

### 45.4 Webcal link on schedule page

The weekly schedule page must include a webcal subscription link to the
full-camp iCal feed, alongside the existing RSS link. <!-- 02-§45.13 -->

The link must use the `webcal://` protocol scheme (replacing `https://` in
the site URL). <!-- 02-§45.14 -->

### 45.5 Calendar tips page

A static page must exist at `/kalender.html`. <!-- 02-§45.15 -->

The page must include step-by-step instructions for subscribing to the
camp calendar on: iOS Calendar, Android / Google Calendar, Gmail (web),
and Outlook. <!-- 02-§45.16 -->

The page must explain the difference between subscribing to the full camp
calendar (auto-updates) and downloading individual event files
(one-time import). <!-- 02-§45.17 -->

The page must be written in Swedish. <!-- 02-§45.18 -->

The page must use the shared site layout: header, navigation, and
footer. <!-- 02-§45.19 -->

### 45.6 Build integration

The iCal renderer must be a separate module (`render-ical.js`), following
the same pattern as `render-rss.js`. <!-- 02-§45.20 -->

The tips page renderer must be a separate module
(`render-kalender.js`). <!-- 02-§45.21 -->

Both must be wired into `build.js`. <!-- 02-§45.22 -->

iCal generation reuses the existing `SITE_URL` environment variable — no
new configuration is needed. <!-- 02-§45.23 -->

---

## 46. iCal Presentation and Compliance

### 46.1 Schedule page calendar icon

The schedule page header displays a calendar icon that links to the
calendar tips page (`kalender.html`). <!-- 02-§46.4 -->

The icon is an inline SVG, matching the RSS icon height
(38 px). <!-- 02-§46.1 -->

No text label accompanies the icon — the title attribute and visual
design provide sufficient affordance. <!-- 02-§46.3 -->

### 46.2 Per-event iCal link in schedule rows

Every event row on the weekly schedule page includes a download link to
its `.ics` file. <!-- 02-§46.5 -->

The link appears at the end of the row, after location and responsible
metadata, as a small text link labelled "iCal". <!-- 02-§46.6 -->

It is styled consistently with `.ev-meta` (small font, terracotta colour)
and does not disrupt the existing row layout. <!-- 02-§46.7 -->

The link uses the `download` attribute so the browser saves the file
rather than navigating. <!-- 02-§46.8 -->

### 46.3 Calendar tips page discoverability

The weekly schedule page includes a visible link to `kalender.html` near
the header or intro text so users can find instructions for subscribing
to the calendar. <!-- 02-§46.9 -->

### 46.4 Calendar tips page layout

The calendar tips page uses the card-based layout style used elsewhere on
the site (white background, rounded corners, card shadow, sage left
border). <!-- 02-§46.11 -->

Each platform section (iOS, Android, Gmail, Outlook) is visually
separated as its own card or clearly delineated
section. <!-- 02-§46.12 -->

The webcal URL is displayed in a copy-friendly code block styled
consistently with existing code blocks on the site. <!-- 02-§46.13 -->

### 46.5 DTSTAMP in VEVENT blocks

Every `VEVENT` block in both per-event and full-camp `.ics` files
includes a `DTSTAMP` property (RFC 5545 §3.6.1). <!-- 02-§46.14 -->

The value is a UTC timestamp representing the build time, formatted as
`YYYYMMDDTHHMMSSZ`. <!-- 02-§46.15 -->

---

## 47. Heading and Link Color Update

### 47.1 Site requirements

All heading elements (h1–h6) use terracotta (`var(--color-terracotta)`)
as their text color. <!-- 02-§47.1 -->

Content links (`.content a`) are styled with terracotta color and a
permanent underline (`text-decoration: underline`), not only on
hover. <!-- 02-§47.2 -->

Navigation links, back-links, and other non-content links retain their
existing styles. <!-- 02-§47.3 -->

---

## 48. Add-Activity and Edit-Activity Cookie Enhancements

Participants who have accepted the session cookie should get a smoother
experience when adding and editing activities. The add form remembers
the responsible person, and the edit page shows a list of owned events
without requiring the user to navigate from the schedule.

### 48.1 Auto-fill responsible person on the add form

- When a participant successfully submits an activity after accepting the
  cookie, the value of the "Ansvarig" field is saved to `localStorage`
  under the key `sb_responsible`. <!-- 02-§48.1 -->
- On page load of `/lagg-till.html`, if `sb_responsible` exists in
  `localStorage` and the "Ansvarig" field is empty, the field is
  pre-filled with the stored value. <!-- 02-§48.2 -->
- The stored value is updated on every successful submission, so it
  always reflects the most recently used name. <!-- 02-§48.3 -->

### 48.2 Dynamic intro text on the add form

- The add form shows a paragraph (line 46 in the current HTML) explaining
  that a temporary ID will be saved so the user can edit their activity
  later. This is the "cookie paragraph". <!-- 02-§48.4 -->
- If the user has already accepted cookie consent (`sb_cookie_consent`
  is `'accepted'` in `localStorage`), the cookie paragraph is replaced
  with a message stating that the user can edit their submitted activities,
  with a link to `/redigera.html`. <!-- 02-§48.5 -->
- If consent has not been given, the paragraph remains unchanged. <!-- 02-§48.6 -->
- The replacement is done client-side on page load. <!-- 02-§48.7 -->

### 48.3 Edit page without cookie

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has no session cookie (`sb_session`), the page shows a text
  explaining that this page is for editing activities and that it
  requires accepting the cookie when adding an activity. <!-- 02-§48.8 -->
- The text is written in Swedish. <!-- 02-§48.9 -->
- The loading spinner is hidden; the edit form is not shown. <!-- 02-§48.10 -->

### 48.4 Edit page with cookie but no editable events

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has a session cookie, but none of the owned event IDs match
  current, non-past events in `/events.json`, the page shows a message
  saying that the user's editable activities will appear here. <!-- 02-§48.11 -->
- The loading spinner is hidden; the edit form is not shown. <!-- 02-§48.12 -->

### 48.5 Edit page with cookie and editable events

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has a session cookie containing event IDs that match current,
  non-past events in `/events.json`, the page shows a list of those
  events. <!-- 02-§48.13 -->
- Each list item shows only the event title and is a link to
  `/redigera.html?id={eventId}`. <!-- 02-§48.14 -->
- Events whose date has already passed are filtered out entirely. <!-- 02-§48.15 -->
- The loading spinner is hidden; the edit form is not shown until the
  user clicks a specific event link. <!-- 02-§48.16 -->

### 48.6 Edit page with a specific event selected

- When `/redigera.html` is loaded with a URL `id` parameter, the
  existing behaviour is preserved: ownership check, event loading,
  form population. <!-- 02-§48.17 -->
- If the user also has other editable events, the event list from §48.5
  is shown above the edit form so the user can switch between events. <!-- 02-§48.18 -->

---

## 49. API-Layer Security Validation

The event security scan (injection patterns, link protocol, length limits) currently
runs only in CI as a post-commit check. This means malicious payloads can reach the
git repository before being caught. Moving these checks into the API request
validation layer rejects dangerous input at submission time — before any data is
written to git.

This change does not remove the existing CI security scan; it adds an earlier,
identical check. The CI scan will be removed in a future pipeline optimisation.

### 49.1 Injection pattern scanning in the API

- The API request validation (`validateEventRequest` / `validateEditRequest`) must
  scan the free-text fields `title`, `location`, `responsible`, and `description`
  for injection patterns before accepting the request. <!-- 02-§49.1 -->
- The following patterns must be rejected (case-insensitive): `<script`, `javascript:`,
  event handler attributes (`on*=`), `<iframe`, `<object`, `<embed`,
  `data:text/html`. <!-- 02-§49.2 -->
- A request containing any injection pattern must be rejected with an error message
  identifying the offending field and pattern category. <!-- 02-§49.3 -->

### 49.2 Link protocol validation in the API

- When the `link` field is a non-empty string, the API must verify that it starts
  with `http://` or `https://` (case-insensitive). Any other protocol or a missing
  protocol must be rejected. <!-- 02-§49.4 -->

### 49.3 Parity between Node.js and PHP implementations

- The injection patterns and link protocol checks must be implemented identically
  in both `source/api/validate.js` and `api/src/Validate.php`. <!-- 02-§49.5 -->
- Both implementations must produce equivalent error messages for the same
  invalid input. <!-- 02-§49.6 -->

---

## 50. Docker-Based Event Data CI Pipeline

Event data validation (injection patterns, link protocol, length limits) runs in the
API layer at submission time. Data that reaches git is already validated. The CI
pipeline for event-data PRs provides a branch-protection gate, and a post-merge
workflow builds and deploys via a pre-built Docker image.

### 50.1 Docker build image (site requirements)

- A Docker image containing Node.js 20 and the project's production dependencies
  (`js-yaml`, `marked`, `qrcode`) must be available for CI workflows. <!-- 02-§50.1 -->
- The image must be based on `node:20` (full image, not slim). <!-- 02-§50.2 -->
- The Dockerfile must live in `.github/docker/Dockerfile`. <!-- 02-§50.3 -->
- The image must be published to GitHub Container Registry
  (`ghcr.io/<owner>/<repo>`). <!-- 02-§50.4 -->

### 50.2 Docker image build workflow (site requirements)

- A workflow (`.github/workflows/docker-build.yml`) must build and push the Docker
  image when `package.json` or `.github/docker/Dockerfile` changes on push to
  `main`. <!-- 02-§50.5 -->
- The workflow must tag images with both `latest` and the git SHA. <!-- 02-§50.6 -->
- The workflow must have `packages: write` and `contents: read` permissions. <!-- 02-§50.7 -->

### 50.3 Event data PR check (site requirements)

- `event-data-deploy.yml` must contain a single job that logs "Validated at API
  layer" and passes. <!-- 02-§50.8 -->
- The workflow must trigger on PRs to `main` with path `source/data/**.yaml` and
  only for branches matching `event/` and `event-edit/` prefixes. <!-- 02-§50.9 -->

### 50.4 Post-merge event data deploy (site requirements)

- A workflow (`.github/workflows/event-data-deploy-post-merge.yml`) must trigger
  on push to `main` with path filter `source/data/**.yaml`. <!-- 02-§50.11 -->
- The workflow must use the pre-built Docker image from GHCR instead of
  `setup-node` + `npm ci`. <!-- 02-§50.12 -->
- The workflow must detect which per-camp YAML file changed by comparing
  `HEAD~1..HEAD`. <!-- 02-§50.13 -->
- The workflow must determine whether the changed file belongs to a QA camp
  and set an `is_qa` output. <!-- 02-§50.14 -->
- The workflow must build the site using `node source/build/build.js`. <!-- 02-§50.15 -->
- The workflow must stage only event-data-derived files for upload: `schema.html`,
  `idag.html`, `dagens-schema.html`, `events.json`, `schema.rss`, `schema.ics`,
  `kalender.html`, and per-event pages under `schema/`. <!-- 02-§50.16 -->
- The workflow must deploy to QA and QA Node via SCP in parallel jobs. <!-- 02-§50.17 -->
- The workflow must deploy to Production via SCP, skipped when the changed
  file belongs to a QA camp. <!-- 02-§50.18 -->

### 50.5 Production event data deploy method (site requirements)

- Production event data deploy must use SCP over SSH. <!-- 02-§50.19 -->
- The deploy must use the existing SSH secrets: `SERVER_HOST`, `SERVER_USER`,
  `SERVER_SSH_KEY`, `SERVER_SSH_PORT`, `DEPLOY_DIR`. <!-- 02-§50.20 -->
- After validation, the FTP secrets (`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`,
  `FTP_APP_DIR`, `FTP_TARGET_DIR`) should be removed from the production GitHub
  Environment. This is a manual step. <!-- 02-§50.22 -->

### 50.6 CI workflow for data-only changes (site requirements)

- For data-only event changes (`has_code == false`), `ci.yml` must skip
  `npm ci` and `npm run build`, letting the job pass after the detect
  step. <!-- 02-§50.23 -->
- Building event-data changes is the responsibility of the post-merge
  deploy workflow (§50.4). <!-- 02-§50.24 -->
