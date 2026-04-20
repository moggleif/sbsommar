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
managing location lists. Bulk data editing is done directly in YAML files.
A lightweight admin token mechanism allows designated administrators to edit
and delete any event through the site's existing UI (see §91).

---

## 1a. Search Engine and Crawler Policy

This site must not be indexed by search engines or crawlers. It is intentionally
hidden — discoverable only by direct link.

- The build must generate a `robots.txt` file at the site root that disallows all
  user agents from all paths. <!-- 02-§1a.1 -->
- Every HTML page must include a `<meta name="robots" content="noindex, nofollow">`
  tag in the `<head>` section. <!-- 02-§1a.2 -->
- No sitemap, Open Graph tags, or other discoverability metadata may be added
  to any page. PWA metadata (`<link rel="manifest">`, `<meta name="theme-color">`,
  Apple touch-icon tags) is not considered discoverability metadata — it controls
  app installation behavior, not search engine visibility. <!-- 02-§1a.3 -->

---

## 2. Site Pages

The following pages must exist:

| ID | Page | URL | Audience |
| --- | --- | --- | --- |
| `02-§2.1` | Homepage | `/` | Prospective families, participants |
| `02-§2.2` | Weekly schedule | `/schema.html` | Participants |
| `02-§2.4` | Today view | `/idag.html` | Participants |
| `02-§2.4a` | Display view | `/live.html` | Shared screens |
| `02-§2.5` | Add activity | `/lagg-till.html` | Participants |
| `02-§2.6` | Archive | `/arkiv.html` | Prospective families, returning participants |
| `02-§2.7` | RSS feed | `/schema.rss` | Anyone subscribing to the schedule |
| `02-§2.11` | Edit activity | `/redigera.html` | Participants who submitted the event |
| `02-§2.12` | iCal feed | `/schema.ics` | Anyone subscribing to the schedule |
| `02-§2.13` | Calendar tips | `/kalender.html` | Participants wanting to sync the schedule |
| `02-§2.14` | Admin activation | `/admin.html` | Administrators |

The homepage, schedule pages, add-activity form, and archive share the same header and navigation. <!-- 02-§2.8 -->
None require login. <!-- 02-§2.9 -->

The Today view (`/idag.html`) uses the standard site layout with header and navigation. <!-- 02-§2.4 -->
The Display view (`/live.html`) has no header or navigation — it is a minimal, full-screen display intended for shared screens around the camp. <!-- 02-§2.10 -->
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

The registration section must link to the external registration service at `event-friend-ai.lovable.app`, where families complete the full sign-up form. <!-- 02-§3.6 -->

The pricing and rules sections must document the cancellation refund tiers and the organiser's right to refuse participation, matching the terms that bind participants at the point of registration. <!-- 02-§3.7 -->

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

### Display view (`/live.html`)

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
- The old URL `/dagens-schema.html` serves a redirect page that sends the visitor to `/live.html` via `<meta http-equiv="refresh">` and a JavaScript fallback. <!-- 02-§76.1 -->

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

- **Date selection:** a grid of day buttons — one per camp day. Each button shows
  the weekday abbreviation and date (e.g. "Mån 28/7"). The user selects a day by
  clicking; the previously selected day is deselected. Exactly one day must be
  selected before submit. The grid contains only days within the active camp's
  `start_date..end_date`. When the current date falls within the camp period,
  only days from today onward are shown. <!-- 02-§6.2 -->
- **Recurring toggle:** a toggle labelled "Återkommande" switches the day grid
  from single-select to multi-select mode. In multi-select mode, clicking a day
  toggles it on or off independently. When toggled on, all camp days except the
  first and last day are pre-selected. The first and last day are unselected by
  default but can be selected manually. At least one day must be selected before
  submit. <!-- 02-§6.15 -->
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
  the end-time field must immediately be evaluated if start time is already filled.
  If end ≤ start, the midnight-crossing rule (§54) applies: a valid crossing shows
  a green info message; an invalid crossing shows a red error. If start is not yet
  filled, this check is deferred to submit. <!-- 02-§6.10 -->
- **Live required-field validation:** when the user leaves any required field
  (on `blur`), the field must immediately show an inline error if it is empty. <!-- 02-§6.11 -->
- **Live error clearing:** an inline error shown by live validation must be
  cleared as soon as the user starts editing that field again (on `input` or
  `change`). <!-- 02-§6.12 -->
- **Live start-time cross-check:** when the user changes the start time (on
  `change`), the end-time field must immediately be re-evaluated using the
  midnight-crossing rule (§54): a valid crossing shows a green info message,
  an invalid crossing shows a red error, and a normal end > start clears any
  message. If end is empty, no action is taken. <!-- 02-§6.13 -->
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

Administrators with a valid admin token (§91) can edit or remove any activity
through the same edit and delete flows available to participants. <!-- 02-§7.2 -->

A user may edit or delete an event if the event ID is present in their session
cookie (ownership) **or** the user holds a valid admin token. <!-- 02-§7.3 -->

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
- `end` is present, in valid `HH:MM` format, and is after `start` — or represents
  a valid midnight crossing per the midnight-crossing rule (§54). <!-- 02-§9.4 -->
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
- The session cookie is initially set only by the server. Client-side JavaScript
  may write back the cookie solely during expiry cleanup (§18.14), but must never
  create a new session or add event IDs. <!-- 02-§18.6 -->
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
- When the client writes back the cleaned cookie, it must include the same
  `Domain` attribute the server used. The domain value is injected at build time
  via a `data-cookie-domain` attribute on the `<body>` element. If the attribute
  is absent or empty, no `Domain` is included (single-origin fallback). <!-- 02-§18.47 -->
- The build process must read the `COOKIE_DOMAIN` environment variable and inject
  it as a `data-cookie-domain` attribute on the `<body>` element of every page
  that loads `session.js`. <!-- 02-§18.48 -->
- "Passed" means the event's date is strictly before today's local date. <!-- 02-§18.15 -->
- Event IDs present in the session cookie but not found in `events.json` must be
  kept — not removed. A newly-submitted event may not yet appear in the JSON
  because the event-data deploy is still in progress. Removing unknown IDs would
  silently discard the session cookie the server just set. <!-- 02-§18.49 -->

### 18.4 Edit links on schedule pages

- Schedule pages add an "Redigera" link next to each event whose ID is present
  in the session cookie **or** whose user holds a valid admin token (§91), and
  whose date has not passed. <!-- 02-§18.16 -->
- The link is injected by client-side JavaScript after page load; it is never
  part of the static HTML. <!-- 02-§18.17 -->
- Each event row in the generated HTML carries a `data-event-id` attribute
  containing the event's stable ID so JavaScript can identify it. <!-- 02-§18.18 -->
- The "Redigera" link navigates to `/redigera.html?id={eventId}`. <!-- 02-§18.19 -->

### 18.7 Edit links on the Idag today view

- The "Idag" today view (`/idag.html`) also shows a "Redigera" link next to
  each event the visitor owns or for which the visitor holds a valid admin
  token (§91), and that has not passed — using the same rule and link text
  as the weekly schedule. <!-- 02-§18.42 -->
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
- If the event ID is not in the session cookie and the user does not hold a
  valid admin token (§91), or the event has already passed, the page shows a
  clear error and no form is rendered. <!-- 02-§18.22 -->
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
  ID array, and verifies the target event ID is present — or that the request
  body contains a valid `adminToken` (§91). <!-- 02-§18.31 -->
- If the event ID is not in the cookie and no valid admin token is provided,
  the server responds with HTTP 403. <!-- 02-§18.32 -->
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
- When the user holds a valid admin token (§91), the edit and delete request
  bodies must include `adminToken` so the server can verify admin
  status. <!-- 02-§18.50 -->

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
  the Facebook logo image (`images/facebook-ikon.webp`)
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
- Lägg till (`lagg-till.html`)
- Arkiv (`arkiv.html`)

The link for the current page must be visually marked as active. <!-- 02-§24.5 -->

On desktop, the page links use the short labels listed above and are
displayed in uppercase via CSS (`text-transform: uppercase`). <!-- 02-§24.6 -->

On mobile, the hamburger menu uses longer, more descriptive labels: <!-- 02-§24.16 -->

- Hem
- Lägrets schema
- Dagens aktiviteter
- Lägg till aktivitet
- Lägerarkiv

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
- The expanded menu must close automatically when the user clicks a
  navigation link inside it. <!-- 02-§24.17 -->

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
- The camp name is rendered as plain text, not a clickable link. <!-- 02-§28.12 -->
- The camp name uses `var(--color-terracotta)`. <!-- 02-§28.18 -->
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
- The Discord icon uses the image `discord-ikon.webp`. <!-- 02-§30.24 -->
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
  archive, RSS feed, or the upcoming-camps list on the index
  page. <!-- 02-§42.13 -->
- In production, `build.js` must filter `qa: true` camps from the
  camps array before passing it to any rendering function, so that
  all downstream output is QA-free without per-renderer
  checks. <!-- 02-§42.30 -->

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
  `idag.html`, `live.html`, `dagens-schema.html`, `events.json`,
  `schema.rss`, and per-event detail pages under `schema/`. <!-- 02-§43.4 -->
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
  (PHP on Loopia) and its secrets. <!-- 02-§44.38 -->
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
  `idag.html`, `live.html`, `dagens-schema.html`, `events.json`, `schema.rss`,
  `schema.ics`, `kalender.html`, and per-event pages under `schema/`. <!-- 02-§50.16 -->
- The workflow must deploy to QA via rsync in a parallel job. <!-- 02-§50.17 -->
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

---

## 51. Event Data Deploy — Eliminate Serial Detect Job

The post-merge event-data deploy workflow (§50.4) currently runs a serial
`detect` job before starting the three parallel deploy jobs. This adds
~15 seconds to the critical path because the deploy jobs must wait for
`detect` to finish before they can start. Each environment requires its
own build (different `SITE_URL` and `BUILD_ENV`), so sharing build
artifacts is not possible. Eliminating the serial dependency is the
primary lever for reducing deploy latency.

### 51.1 Workflow structure (site requirements)

- The post-merge event-data deploy workflow must NOT have a separate
  `detect` job that other jobs depend on. <!-- 02-§51.1 -->
- Each deploy job must perform its own inline detection of changed event
  data files as its first step. <!-- 02-§51.2 -->
- All deploy jobs must start immediately in parallel when the workflow
  triggers — no serial dependency between them. <!-- 02-§51.3 -->

### 51.2 Inline detection (site requirements)

- Each deploy job must check out with `fetch-depth: 2` to support
  `HEAD~1..HEAD` comparison. <!-- 02-§51.4 -->
- Each deploy job must detect changed per-camp YAML files using the same
  `git diff` logic previously in the `detect` job: filter for
  `source/data/*.yaml`, exclude `camps.yaml` and `local.yaml`. <!-- 02-§51.5 -->
- If no event data file changed, the job must skip build and deploy
  steps (exit cleanly). <!-- 02-§51.6 -->

### 51.3 Production QA gating (site requirements)

- The production deploy job must additionally determine whether the
  changed file belongs to a QA camp, using the same `camps.yaml` lookup
  as the previous `detect` job. <!-- 02-§51.7 -->
- If the changed file belongs to a QA camp, the production deploy job
  must skip build and deploy steps. <!-- 02-§51.8 -->

### 51.4 Superseded requirements

- `02-§50.13` (detect via `HEAD~1..HEAD` in a dedicated job) is
  superseded by `02-§51.2` and `02-§51.5` (inline detection per
  job). <!-- 02-§51.9 -->
- `02-§50.14` (QA detection sets `is_qa` output) is superseded by
  `02-§51.7` (inline QA check in production job only). <!-- 02-§51.10 -->

---

## 52. Replace Docker Container with setup-node + npm Cache

The post-merge event-data deploy workflow (§50.4) previously used a
pre-built Docker image from GHCR to avoid running `npm ci` on every
deploy. While this eliminated `npm ci` time, pulling the Docker image
itself added ~20 seconds per job. Replacing the Docker container with
`actions/setup-node` and the built-in npm cache achieves the same
dependency-availability goal with lower overhead: cache restore takes
~2–3 seconds on cache hit, and `npm ci --omit=dev` installs four small
production packages in ~3 seconds.

### 52.1 Dependency installation method (site requirements)

- The post-merge event-data deploy workflow must use
  `actions/setup-node@v4` with `node-version: '20'` and `cache: 'npm'`
  instead of a Docker container. <!-- 02-§52.1 -->
- Each deploy job must run `npm ci --omit=dev` to install only production
  dependencies. <!-- 02-§52.2 -->
- The workflow must NOT use a Docker container (`container:` key must be
  absent from all jobs). <!-- 02-§52.3 -->
- The workflow must NOT require `packages: read` permission (no GHCR
  access needed). <!-- 02-§52.4 -->

### 52.2 Conditional vs unconditional installation (site requirements)

- For the QA deploy job, `setup-node` and `npm ci` must be
  conditional on the gate step output — skipped when no event data file
  changed. <!-- 02-§52.5 -->
- For the production deploy job, `setup-node` and `npm ci` must run
  unconditionally (before the gate step), because the gate step itself
  uses `node -e` with `js-yaml` to check QA camp status. <!-- 02-§52.6 -->

### 52.3 Superseded requirements

- `02-§50.1`–`02-§50.7` (Docker image and Docker build workflow) are
  superseded — the event-data deploy workflow no longer uses a Docker
  image. <!-- 02-§52.7 -->
- `02-§50.12` (workflow must use Docker image from GHCR) is superseded
  by `02-§52.1` (setup-node + npm cache). <!-- 02-§52.8 -->

---

## 53. Synchronous API Error Visibility and Deploy Safety

Background: the add-event and edit-event API endpoints respond with
`{ success: true }` before the GitHub write completes. If the GitHub
operation fails (missing credentials, network error, invalid token), the
user sees a success confirmation but the event is silently lost. This
violates `02-§6.8` ("Submissions must not be silently lost"). Additionally,
the deploy workflow's `.env` backup can be lost if `public_html` is wiped
before the backup step runs.

### 53.1 Synchronous GitHub commit (API requirements)

- The add-event endpoint (`POST /add-event`) must complete the full GitHub
  operation (create branch, commit, create PR, enable auto-merge) before
  returning a response to the client. <!-- 02-§53.1 -->
- The edit-event endpoint (`POST /edit-event`) must complete the full GitHub
  operation before returning a response to the client. <!-- 02-§53.2 -->
- If any step of the GitHub operation fails, the endpoint must return
  `{ "success": false, "error": "<user-facing message>" }` with HTTP
  status 500. <!-- 02-§53.3 -->
- The user-facing error message must be in Swedish and must not expose
  internal details (e.g. no stack traces, no GitHub API error
  messages). <!-- 02-§53.4 -->
- The `flushToClient()` function and `ob_start()` call must be removed —
  they exist only to support the fire-and-forget pattern. <!-- 02-§53.5 -->

### 53.2 Progress feedback during submission (user requirements)

- While the form submission is in progress, the modal must display a
  step-by-step progress list with the following stages: <!-- 02-§53.6 -->
  1. "Skickar till servern…"
  2. "Kontrollerar aktiviteten…"
  3. "Sparar aktiviteten…"
- Each stage must begin with an unchecked indicator and transition to a
  green check mark (✓) after its allotted time. <!-- 02-§53.7 -->
- The timing is client-side (not streamed from the server). Stages
  transition at approximately 0 s, 0.5 s, and 2 s. <!-- 02-§53.8 -->
- When the API responds with success, all remaining stages must immediately
  show green check marks and a final success message must
  appear. <!-- 02-§53.9 -->
- When the API responds with an error, progress must stop at the current
  stage and the error message from the API must be displayed below the
  progress list. <!-- 02-§53.10 -->
- The progress list must be used for both the add-event and edit-event
  forms. <!-- 02-§53.11 -->

### 53.3 Persistent .env backup (site requirements)

- The reusable deploy workflow must maintain a persistent copy of the PHP
  API `.env` file at `$DEPLOY_DIR/.env.api.persistent`, updated on every
  successful deploy where the `.env` file exists. <!-- 02-§53.12 -->
- The restore step must fall back to `.env.api.persistent` if the primary
  backup (`.env.api.bak`) is missing. <!-- 02-§53.13 -->
- The persistent backup must not be deleted by the restore step
  (`cp`, not `mv`). <!-- 02-§53.14 -->

---

## 54. Midnight-Crossing Events

Events at a summer camp can legitimately cross midnight (e.g. an evening party
starting at 23:00 and ending at 01:00). The system must allow these while
catching likely user mistakes (e.g. entering 16:00→14:00 when 16:00→17:00 was
intended).

### 54.1 Midnight-crossing rule (event/data requirements)

- When `end < start` (string comparison on HH:MM values), the system must
  interpret the event as crossing midnight and calculate the implied duration
  as `(24 × 60 − startMinutes) + endMinutes`. <!-- 02-§54.1 -->
- A midnight-crossing event with a calculated duration of **1 020 minutes
  (17 hours) or less** must be accepted by all validation layers (client live,
  client submit, server API, build-time lint). <!-- 02-§54.2 -->
- A midnight-crossing event with a calculated duration **greater than
  1 020 minutes** must be rejected with a clear error message indicating the
  times appear incorrect. <!-- 02-§54.3 -->
- When `end == start`, the event must always be rejected — zero-length events
  remain invalid regardless of the midnight-crossing rule. <!-- 02-§54.4 -->
- When `end > start` (normal case), behaviour must remain unchanged — no info
  message, no duration calculation. <!-- 02-§54.5 -->

### 54.2 User feedback (user requirements)

- When a valid midnight crossing is detected during live validation, the
  end-time field must show a **green informational message**:
  *"Tolkas som att aktiviteten slutar nästa dag."* — not a red
  error. <!-- 02-§54.6 -->
- The informational message must use sage-green styling (`.field-info` class)
  and must **not** set `aria-invalid="true"` on the input — the input border
  must remain normal. <!-- 02-§54.7 -->
- When a midnight crossing exceeds the threshold, the end-time field must
  show a red error: *"Aktiviteten verkar vara för lång. Kontrollera start-
  och sluttid."* <!-- 02-§54.8 -->
- The informational or error message must be cleared when the user edits the
  start or end field again. <!-- 02-§54.9 -->

### 54.3 Edit form (site requirements)

- The edit form (`redigera.js`) submit validation must apply the same
  midnight-crossing logic as the add form. <!-- 02-§54.10 -->

### 54.4 Build-time lint (site requirements)

- The build-time YAML linter (`lint-yaml.js`) must apply the same
  midnight-crossing threshold when checking existing event
  files. <!-- 02-§54.11 -->

---

## 55. Submit modal design polish

The submit progress modal (used in add-activity and edit-activity forms) needs
visual polish to look clean and consistent with the rest of the site design.

### 55.1 Site requirements

- The modal heading must not show a browser focus outline when
  programmatically focused. The heading uses `tabindex="-1"` for
  programmatic focus only and is not an interactive element. <!-- 02-§55.1 -->
- The modal box must use `--radius-lg` (16 px) border-radius for a softer,
  more modern appearance. <!-- 02-§55.2 -->
- The modal box must use `--space-lg` top/bottom padding for more generous
  internal spacing. <!-- 02-§55.3 -->
- The modal heading and progress steps must be center-aligned. <!-- 02-§55.4 -->
- The modal box must appear with a subtle entry animation (fade in + slide
  up) lasting no more than 300 ms, consistent with the design constraint
  in `07-§10.2`. <!-- 02-§55.5 -->

---

## 56. Render Description as Markdown

The `description` field in event YAML files may contain Markdown syntax
(parsed by `marked`, the same library used for `content/*.md`). All
rendering paths must treat the description as Markdown and produce
appropriate output for each context.

### 56.1 Site requirements

- In the event detail page, the description must be rendered as formatted
  HTML produced by `marked.parse()`. <!-- 02-§56.1 -->
- In the weekly schedule (schema.html), the description inside the
  expandable event row must be rendered as formatted HTML produced by
  `marked.parse()`. <!-- 02-§56.2 -->
- In the today view (idag.html / live.html), the description
  must be rendered as formatted HTML. The HTML must be pre-rendered at
  build time and delivered in the JSON payload to avoid shipping the
  `marked` library to the client. <!-- 02-§56.3 -->
- In the RSS feed (schema.rss), the description must be stripped of
  Markdown syntax and included as plain text in the `<description>`
  element. <!-- 02-§56.4 -->
- In iCal output (schema.ics and per-event .ics files), the description
  must be stripped of Markdown syntax and included as plain text in the
  `DESCRIPTION` property. <!-- 02-§56.5 -->
- All Markdown-to-HTML output must be sanitized: `<script>`, `<iframe>`,
  `<object>`, `<embed>` tags, `on*` event-handler attributes, and
  `javascript:` URIs must be removed. <!-- 02-§56.6 -->
- Descriptions that contain no Markdown syntax (plain text) must continue
  to render correctly — `marked` wraps them in `<p>` tags, which is
  acceptable. <!-- 02-§56.7 -->
- The `.event-description p` rule must no longer apply `font-style:
  italic`, so that Markdown emphasis renders distinctly. <!-- 02-§56.8 -->
- CSS for rendered descriptions must use existing design tokens from
  `07-DESIGN.md`. No new custom properties are introduced. <!-- 02-§56.9 -->
- A shared build-time helper must provide both `renderDescriptionHtml()`
  and `stripMarkdown()` to avoid duplicating Markdown processing logic
  across render modules. <!-- 02-§56.10 -->

---

## 57. Markdown Toolbar for Description Field

The description textarea in the add-activity form (`/lagg-till.html`) and
the edit-activity form (`/redigera.html`) must include a toolbar that helps
users write Markdown without memorising syntax.

### 57.1 User requirements

- The user must be able to apply bold, italic, heading, bullet list,
  numbered list, and block-quote formatting via toolbar buttons without
  knowing Markdown syntax. <!-- 02-§57.1 -->
- When the user has selected text in the description field, clicking a
  toolbar button must wrap or prefix the selected text with the
  corresponding Markdown syntax. <!-- 02-§57.2 -->
- When no text is selected, clicking a toolbar button must insert the
  Markdown syntax with a placeholder word and select that placeholder so
  the user can type over it immediately. <!-- 02-§57.3 -->
- For list and block-quote buttons, if the selection spans multiple lines,
  the prefix must be applied to each line individually. <!-- 02-§57.4 -->

### 57.2 Site requirements

- The toolbar must appear as a single row of buttons directly above the
  description textarea in both `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§57.5 -->
- The buttons must appear in this order: Bold, Italic, Heading, Bullet
  list, Numbered list, Block quote. <!-- 02-§57.6 -->
- Each button must display an inline SVG icon (no icon font or external
  image dependency). <!-- 02-§57.7 -->
- Each button must have an accessible label (`aria-label`) describing its
  action. <!-- 02-§57.8 -->
- The toolbar must be styled using existing design tokens from
  `07-DESIGN.md` — no hardcoded colours, spacing, or typography
  values. <!-- 02-§57.9 -->
- The toolbar logic must live in a single shared JS file
  (`markdown-toolbar.js`) that is loaded by both forms. <!-- 02-§57.10 -->
- The toolbar must not add any external dependencies. <!-- 02-§57.11 -->
- ~~There is no live preview of Markdown — the toolbar only inserts
  syntax.~~ Superseded by §58 (Markdown Preview). <!-- 02-§57.12 -->
- The toolbar buttons must have visible focus indicators that meet the
  existing focus-visible styling. <!-- 02-§57.13 -->

---

## 58. Markdown Preview for Description Field

The description textarea in the add-activity form (`/lagg-till.html`) and
the edit-activity form (`/redigera.html`) must include a live preview that
shows the user how their Markdown will render.

### 58.1 User requirements

- The user must see a live preview of their description text rendered as
  formatted HTML below the description textarea. <!-- 02-§58.1 -->
- The preview must update as the user types, with a debounce delay of
  approximately 300 ms so that rendering does not interfere with
  typing. <!-- 02-§58.2 -->
- When the description textarea is empty, the preview area must either be
  hidden or show a discrete placeholder text (e.g. "Förhandsgranskning
  visas här"). <!-- 02-§58.3 -->
- The preview must be read-only — no user interaction (clicking, selecting,
  editing) should be possible within the preview area. <!-- 02-§58.4 -->

### 58.2 Site requirements

- The preview must render using the same `marked` library used at build
  time, loaded as a client-side script (`marked.min.js`), to guarantee
  identical output. <!-- 02-§58.5 -->
- The `marked.min.js` file must be copied from `node_modules` to the
  public JS directory during the build step. <!-- 02-§58.6 -->
- The `marked.min.js` script must be loaded with the `defer` attribute so
  it does not block page rendering. <!-- 02-§58.7 -->
- The preview must sanitize all rendered HTML using the same rules as
  build-time rendering (02-§56.6): `<script>`, `<iframe>`, `<object>`,
  `<embed>` tags, `on*` event-handler attributes, and `javascript:` URIs
  must be removed. <!-- 02-§58.8 -->
- The preview logic must live in a dedicated JS file
  (`markdown-preview.js`) that is loaded by both forms. <!-- 02-§58.9 -->
- The preview area must use `aria-live="polite"` so that screen readers
  announce content changes without interrupting the user. <!-- 02-§58.10 -->
- The preview area must have an accessible label
  (`aria-label`). <!-- 02-§58.11 -->
- The preview must appear in both `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§58.12 -->

### 58.3 Design requirements

- The preview area must be visually distinct from the textarea (e.g.
  different background, border style) so the user can distinguish input
  from output. <!-- 02-§58.13 -->
- The inner content of the preview must match the `.event-description`
  styling used in the schedule, so the user sees an accurate
  representation of the final output. <!-- 02-§58.14 -->
- All styling must use existing design tokens from `07-DESIGN.md` — no
  hardcoded colours, spacing, or typography values. <!-- 02-§58.15 -->

---

## 59. Scoped Heading Sizes in Event Descriptions

### Context

The global heading styles (h1 = 40 px, h2 = 35 px, h3 = 30 px) are designed
for page-level headings.  When Markdown descriptions containing headings are
rendered inside event cards (`.event-desc`, `.event-description`) and the
Markdown preview (`.md-preview`), those page-level sizes are applied,
producing oversized headings and — in `.md-preview` where only h2 was
overridden — a broken size hierarchy where h3 appears larger than h2.

### 59.1 Heading size requirements

- Headings h1–h4 inside `.md-preview`, `.event-desc`, and
  `.event-description` must be visually smaller than the global page
  headings and must follow a strictly decreasing size
  order (h1 > h2 > h3 > h4). <!-- 02-§59.1 -->
- The scoped sizes must use relative `em` units so they scale with the
  container's font-size context (e.g. 13 px in `.event-extra` vs
  16 px in `.md-preview`). <!-- 02-§59.2 -->
- h4 must be the same size as body text but bold, to provide a clear
  lower-bound heading level. <!-- 02-§59.3 -->
- All scoped heading styles must use existing design tokens or plain
  `em` values — no hardcoded pixel sizes. <!-- 02-§59.4 -->

### 59.2 Markdown guide link

- The help link in the Markdown preview header must point to a
  beginner-friendly guide (`https://www.markdownguide.org/basic-syntax/`),
  not a library API reference. <!-- 02-§59.5 -->
- The link text and URL must be identical in `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§59.6 -->

---

## 60. Release and Deployment Documentation

### Background

The project has a working CI/CD pipeline (QA auto-deploy, production manual
trigger) but no contributor-facing documentation explaining the deploy flow,
how to release to production, or who is authorized to do so. A new contributor
who is not familiar with the GitHub Actions setup cannot determine how their
changes reach users.

### 60.1 Contributor documentation requirements

- The contributor guide (`01-CONTRIBUTORS.md`) must include a section
  explaining what happens after a PR is merged: QA auto-deploy for code,
  dual auto-deploy for event data, and manual trigger for
  production. <!-- 02-§60.1 -->
- The contributor guide must link to the release guide for production
  deploy steps. <!-- 02-§60.2 -->

### 60.2 Environment protection requirements

- The environments document (`08-ENVIRONMENTS.md`) must document the
  required reviewers configuration for the `production`
  environment. <!-- 02-§60.3 -->
- The environments document must name the current production
  approver(s). <!-- 02-§60.4 -->

### 60.3 Release guide requirements

- A dedicated release guide (`09-RELEASING.md`) must exist with
  step-by-step instructions for deploying to production. <!-- 02-§60.5 -->
- The guide must cover: verifying QA, triggering the production deploy,
  verifying production, and rollback. <!-- 02-§60.6 -->
- The guide must be usable without Claude Code — written for GitHub UI
  and standard CLI. <!-- 02-§60.7 -->
- The guide must document release tagging conventions for
  milestones. <!-- 02-§60.8 -->

---

## 61. Mobile Navigation Improvements

### Motivation

The mobile hamburger menu has usability problems on long pages: it scrolls
out of view so users cannot access navigation without scrolling back to the
top, and its visual design (same cream background as the page) makes it hard
to distinguish from surrounding content. These issues were identified through
manual testing on mobile devices.

### 61.1 Sticky navigation requirements

- On mobile viewports (≤ 767 px), the navigation bar must remain visible
  at the top of the viewport when the user scrolls. <!-- 02-§61.1 -->
- The sticky behaviour must also apply on desktop viewports so navigation
  is always reachable. <!-- 02-§61.2 -->

### 61.2 Hamburger button design requirements

- The hamburger button must have a terracotta (`var(--color-terracotta)`)
  background with white icon bars so it is clearly visible against the
  page background. <!-- 02-§61.3 -->
- The button must have rounded corners (`var(--radius-md)`) for a softer
  appearance. <!-- 02-§61.4 -->

### 61.3 Mobile menu panel design requirements

- The dropdown menu panel must use a terracotta background with white
  text. <!-- 02-§61.5 -->
- Text colour must be `var(--color-white)` to meet WCAG AA contrast
  for large text (14 px bold qualifies as large text; contrast ratio
  ≥ 3:1). <!-- 02-§61.6 -->
- The panel must have fully rounded corners (`var(--radius-lg)`) and
  horizontal inset margins so it appears as a floating card. <!-- 02-§61.7 -->
- Page links (top section) and section links (bottom section) must be
  visually separated: page links at 15 px / 700 weight, section links
  at 12 px / uppercase / reduced opacity, with a visible
  divider. <!-- 02-§61.8 -->

### 61.4 Menu transition requirements

- Opening and closing the menu must use a smooth CSS transition
  (max-height, 250 ms) instead of an abrupt display toggle. <!-- 02-§61.9 -->

### 61.5 Accessibility requirements

- Focus outlines on the hamburger button and menu links must remain
  visible against the terracotta background (white outline). <!-- 02-§61.10 -->
- Existing keyboard and ARIA behaviour (Escape to close, aria-expanded,
  click-outside-to-close) must be preserved. <!-- 02-§61.11 -->

---

## 62. Footer Versioning

### 62.0 Motivation

QA testers and administrators need to confirm which version of the site is
deployed. Without a visible version indicator, there is no way to know whether
a deploy has completed or which build is currently live. A version string in
the footer solves this with minimal visual impact.

### 62.1 VERSION file

- The project root must contain a `VERSION` file with the major.minor version
  (e.g. `1.0`). This file is the single source of truth for the base
  version. <!-- 02-§62.1 -->
- Major and minor numbers are bumped manually by editing the file. <!-- 02-§62.2 -->

### 62.2 Footer version display

- Every page that includes a site footer must display the version string
  in a `<p class="site-footer__version">` element at the bottom of the
  footer. <!-- 02-§62.3 -->
- The version text must be visually subordinate to the main footer content:
  smaller font size and reduced opacity. <!-- 02-§62.4 -->
- Pages without a site footer (e.g. display mode) must not display a
  version string. <!-- 02-§62.5 -->

### 62.3 Version string per environment

- **Production**: The version string must be the full semantic version
  derived from git tags, e.g. `v1.0.4`. <!-- 02-§62.6 -->
- **QA**: The version string must include the full semantic version
  (matching the latest production tag) and the PR number from the merge
  commit, e.g. `v1.0.4 – QA PR212`. If no PR number can be extracted,
  the short commit SHA is used as fallback. <!-- 02-§62.7 -->
- **Local**: The version string must include the base version and a
  Stockholm-timezone timestamp, e.g.
  `v1.0 – Lokal 2026-03-02 14:30`. <!-- 02-§62.8 -->
- **Event-data deploys**: When `BUILD_ENV` is set but `BUILD_VERSION` is
  not (event-data deploys), no version string is rendered in the
  footer. <!-- 02-§62.9 -->

### 62.4 Automatic production tagging

- Each successful production deploy must create an annotated git tag
  with the computed version (e.g. `v1.0.4`). <!-- 02-§62.10 -->
- The tag must be created only after a successful deploy, not
  before. <!-- 02-§62.11 -->
- If a tag already exists (re-run), the tagging step must skip
  gracefully. <!-- 02-§62.12 -->

### 62.5 Automatic GitHub Release on major/minor bump

- When the first production deploy for a new major.minor version occurs
  (no prior tags with that prefix), a GitHub Release must be created
  automatically with `--generate-notes`. <!-- 02-§62.13 -->
- Patch-only deploys must not create a GitHub Release. <!-- 02-§62.14 -->

### 62.6 Build integration

- The build must accept an optional `BUILD_VERSION` environment variable.
  When set, it is used as the version string. <!-- 02-§62.15 -->
- When `BUILD_VERSION` is not set and `BUILD_ENV` is not set (local
  development), the build must read the `VERSION` file and generate a
  local timestamp version. <!-- 02-§62.16 -->
- The version logic must be in a separate module that can be
  unit-tested. <!-- 02-§62.17 -->

### 62.7 QA redeploy after production deploy

- After a successful production deploy and tagging, the production
  deploy workflow must automatically trigger a QA redeploy so that
  QA runs the exact same build as production. <!-- 02-§62.18 -->
- The QA redeploy must use the exact production version string
  (e.g. if production tagged `v1.0.1`, QA must also show
  `v1.0.1`). This makes it visible that QA is running the
  production release with no additional changes. <!-- 02-§62.19 -->
- When the next PR is merged to `main`, the normal QA deploy
  (`deploy-qa.yml`) restores the QA-suffixed version string
  (e.g. `v1.0.1 – QA PR217`). <!-- 02-§62.20 -->

---

## 63. Site Analytics

The site needs usage analytics to answer questions about traffic, visitor
behaviour, and content effectiveness. Analytics must respect the static-site,
no-backend, minimal-JS constraints.

### 63.1 Tool choice

- The analytics tool must be GoatCounter (hosted, free tier). <!-- 02-§63.1 -->
- No cookies may be set by the analytics tool. <!-- 02-§63.2 -->
- The analytics script must be lightweight (< 5 KB). <!-- 02-§63.3 -->

### 63.2 Environment scope

- Analytics must be collected in both production and QA
  environments. <!-- 02-§63.4 -->
- Each environment uses its own GoatCounter site code so data is kept
  separate. <!-- 02-§63.5 -->
- Local development must not send analytics data (environment variable
  left unset). <!-- 02-§63.6 -->

### 63.3 Script inclusion

- The GoatCounter script tag must be included on every page that uses the
  shared site layout (header/footer pages). <!-- 02-§63.7 -->
- The display view (`/live.html`) must also include the analytics
  script, even though it has no shared layout. <!-- 02-§63.8 -->
- The script must load asynchronously and must not block page
  rendering. <!-- 02-§63.9 -->
- The GoatCounter site code must be configurable via an environment variable
  (`GOATCOUNTER_SITE_CODE`) so it is not hardcoded in source. <!-- 02-§63.10 -->
- When the environment variable is not set (local dev), the script tag must
  not be rendered. <!-- 02-§63.11 -->

### 63.4 Basic traffic (automatic)

GoatCounter provides these automatically — no custom code required:

- Page views per day/week. <!-- 02-§63.12 -->
- Most visited pages. <!-- 02-§63.13 -->
- Referrer tracking. <!-- 02-§63.14 -->
- Device type and screen size. <!-- 02-§63.15 -->
- Returning visitors. <!-- 02-§63.16 -->
- 404 hits. <!-- 02-§63.17 -->
- Page load times. <!-- 02-§63.18 -->
- Traffic patterns over time (before/during/after camp). <!-- 02-§63.19 -->

### 63.5 Custom events (behaviour tracking)

The following interactions must be tracked as GoatCounter custom events:

- Activity form submission (successful). <!-- 02-§63.20 -->
- Activity form abandonment (cancel/navigate away). <!-- 02-§63.21 -->
- Today view page load. <!-- 02-§63.22 -->
- Display mode page load. <!-- 02-§63.23 -->
- Click on Discord link. <!-- 02-§63.24 -->
- Click on Facebook link. <!-- 02-§63.25 -->
- iCal file download. <!-- 02-§63.26 -->
- RSS feed link click. <!-- 02-§63.27 -->
- Scroll depth on schedule pages (25 %, 50 %, 75 %, 100 %). <!-- 02-§63.28 -->

### 63.6 QR code referrer tracking

- A data file in the repository (`source/data/qr-codes.yaml`) must list all
  QR code identifiers. <!-- 02-§63.29 -->
- The file is maintained manually — new rows are added when new QR codes are
  printed. <!-- 02-§63.30 -->
- Each QR code entry must have at minimum an `id` and a `description`
  field. <!-- 02-§63.31 -->
- QR code URLs must include the identifier as a query parameter (e.g.
  `?ref=qr-affisch-01`) so GoatCounter records it as a distinct
  referrer. <!-- 02-§63.32 -->
- The existing QR code on the display view sidebar must use a tracked
  referrer parameter from the QR codes data file. <!-- 02-§63.33 -->

### 63.7 Constraints

- No personal data may be collected. <!-- 02-§63.34 -->
- No cookie consent banner is needed (GoatCounter is cookieless). <!-- 02-§63.35 -->
- The analytics implementation must not increase the total JS payload
  beyond what GoatCounter itself requires (no wrapper libraries). <!-- 02-§63.36 -->
- Custom event tracking must use HTML `data-goatcounter-click` attributes
  where possible, minimising inline JavaScript. <!-- 02-§63.37 -->
- All deploy workflows that build site pages must pass
  `GOATCOUNTER_SITE_CODE` to the build step so that rebuilt pages retain
  the analytics script. <!-- 02-§63.38 -->

---

## 64. Index Page Design Improvements

Visual polish for the main landing page to reduce monotony on a long single-page
scroll and better leverage existing design tokens.

### 64.1 Testimonial cards

- Each testimonial (name, photo, quote) must be wrapped in a white card with
  `box-shadow`, `border-radius`, and `padding` matching the card component
  spec (07-§6.19–22). <!-- 02-§64.1 -->
- The testimonial photo must be displayed as a circular thumbnail (~60 px)
  beside the name, matching 07-§6.23. <!-- 02-§64.2 -->
- Testimonial cards must be constrained to `--container-narrow` max-width. <!-- 02-§64.3 -->
- The card structure must be generated at build time from the existing
  Markdown format (## Name + image + blockquote). Content files must not
  need to change. <!-- 02-§64.4 -->

### 64.2 Alternating section backgrounds

- Every other content section on the index page must have a cream-light
  background (`--color-cream-light`) using a full-bleed pseudo-element,
  creating edge-to-edge colour bands. <!-- 02-§64.5 -->
- The first section (section-first) is excluded from alternation. <!-- 02-§64.6 -->
- Alternating sections must not display the default border-top divider. <!-- 02-§64.7 -->

### 64.3 Decorative section headings

- Section headings use the existing terracotta colour; no additional
  decorative line is rendered. <!-- 02-§64.8 -->

### 64.4 RFSB logo placement

- The RFSB logo in the first section must be displayed as a small inline
  floated image (~70 px wide) beside the opening paragraph. <!-- 02-§64.9 -->

### 64.6 Consistent content image widths

- General content images (`.content-img`) must be constrained to
  max-width 500 px. <!-- 02-§64.13 -->
- Accommodation images (Stuga, Vandrarhem, Campingplats, Klarälvsbyn)
  must be constrained to 250 px. <!-- 02-§64.14 -->
- The Servicehus image must match the hero width
  (`--container-narrow`). <!-- 02-§64.15 -->

### 64.7 Compact section spacing

- Content sections must use compact vertical spacing (padding-top and
  margin-bottom ≤ `--space-md`). <!-- 02-§64.16 -->
- Section-alt padding must match regular section spacing. <!-- 02-§64.17 -->

### 64.8 Full-bleed footer

- The site footer must use a full-bleed pseudo-element background
  (sage/cream mix) with no gap below the last content section. <!-- 02-§64.18 -->
- Body must have no bottom padding. <!-- 02-§64.19 -->

### 64.9 Mobile scroll-to-top button

- A scroll-to-top button must appear on mobile viewports (≤ 767 px)
  after scrolling 300 px. <!-- 02-§64.20 -->
- The button must match the hamburger toggle in size (42 × 42 px),
  colour, and border-radius. <!-- 02-§64.21 -->
- The button must be a child of `<nav class="page-nav">`, centred
  horizontally (`position: absolute; left: 50%;
  transform: translateX(-50%)`). <!-- 02-§64.22 -->
- The button must smooth-scroll to the top on click. <!-- 02-§64.23 -->

---

## 65. Client-Side Date and Regex Robustness

### 65.1 Locale-independent date formatting

- Client-side scripts that derive "today" must produce a guaranteed
  `YYYY-MM-DD` string using `Intl.DateTimeFormat.formatToParts`, not
  `toLocaleDateString`. <!-- 02-§65.1 -->
- This applies to both the hero countdown script and the upcoming-camps
  past-marking script. <!-- 02-§65.2 -->

### 65.2 Countdown injection regex

- The regex that wraps the upcoming-camps list and its companion script
  in a `.camps-row` div must anchor on `</ul>` and `<script>`
  explicitly. <!-- 02-§65.3 -->

### 65.3 Testimonial image regex robustness

- The image `src` extraction regex must not assume attribute
  order. <!-- 02-§65.4 -->
- The image-wrapping `<p>` removal regex must tolerate optional
  whitespace inside the `<p>` element. <!-- 02-§65.5 -->

---

## 66. Image Dimension Attributes

Every `<img>` element in the rendered HTML must have explicit `width` and
`height` attributes. This reserves layout space before the image loads,
preventing Cumulative Layout Shift (CLS).

### 66.1 Fixed-size images

Images whose display size is constant (not responsive) must have hardcoded
`width` and `height` attributes matching their CSS display dimensions:

- Testimonial images (`.testimonial-img`): `width="60" height="60"`. <!-- 02-§66.1 -->
- Social icons (`.hero-social-link img`): `width="32" height="32"`. <!-- 02-§66.2 -->
- RSS icon (`.rss-icon`): dimensions matching the image's natural aspect
  ratio at the CSS display height. <!-- 02-§66.3 -->
- Facebook logo in archive (`.camp-fb-logo`): dimensions matching the
  image's natural aspect ratio at the CSS display size. <!-- 02-§66.4 -->

### 66.2 Hero image

- The hero image (`.hero-img`) must have `width` and `height` attributes
  reflecting its natural pixel dimensions. <!-- 02-§66.5 -->

### 66.3 Content and facility images

- Content images produced by the Markdown renderer (`content-img`) must
  have `width` and `height` attributes set to the source image's natural
  pixel dimensions, read at build time. <!-- 02-§66.6 -->
- Location/facility images rendered from `local.yaml` must have `width`
  and `height` attributes set to their natural pixel dimensions, read at
  build time. <!-- 02-§66.7 -->
- The build must use a lightweight method to read image dimensions (e.g.
  parsing the image header) — it must not decode the full image
  data. <!-- 02-§66.8 -->

### 66.4 No CSS changes

- Adding `width` and `height` attributes must not change the rendered
  appearance of any image. Existing CSS rules control display
  size. <!-- 02-§66.9 -->

---

## 67. Static Asset Cache Headers

The site must serve static assets with appropriate `Cache-Control` headers
to reduce repeat-visit load times. Cache rules are delivered via an Apache
`.htaccess` file in the site root.

### 67.1 Cache rules

- Images (`.webp`, `.png`, `.jpg`, `.ico`): `Cache-Control: max-age=31536000`
  (1 year). <!-- 02-§67.1 -->
- CSS and JS files: `Cache-Control: max-age=604800` (1 week). <!-- 02-§67.2 -->
- HTML files: `Cache-Control: no-cache` (always revalidate). <!-- 02-§67.3 -->

### 67.2 Build integration

- The `.htaccess` file must live at `source/static/.htaccess` in the source
  tree. <!-- 02-§67.4 -->
- The build must copy `source/static/.htaccess` to `public/.htaccess`
  during the build step. <!-- 02-§67.5 -->
- The copy must use an explicit `fs.copyFileSync()` call — not the
  `copyFlattened()` helper which operates on `source/assets/`. <!-- 02-§67.6 -->

### 67.3 Separation from API

- This `.htaccess` is for the static site root only. The existing
  `api/.htaccess` (PHP routing) must not be modified. <!-- 02-§67.7 -->

---

## 68. Descriptive Image Filenames

All image files in `source/content/images/` must have descriptive,
human-readable filenames that follow a consistent naming convention. This
makes markdown editing easier for non-technical contributors and aligns
filenames with their natural alt-text descriptions.

### 68.1 Naming convention

- All lowercase. <!-- 02-§68.1 -->
- Swedish characters replaced: ä→a, ö→o, å→a, é→e. <!-- 02-§68.2 -->
- Words separated by hyphens (no underscores, no camelCase). <!-- 02-§68.3 -->
- No numbering suffixes unless genuinely needed (e.g. multiple similar
  images of the same subject). <!-- 02-§68.4 -->
- The filename (without extension) should work as alt-text
  directly. <!-- 02-§68.5 -->

### 68.2 Reference consistency

- Every image reference in markdown files (`source/content/*.md`) must
  point to the renamed file. <!-- 02-§68.6 -->
- Every `image_path` in `source/data/local.yaml` must point to the
  renamed file. <!-- 02-§68.7 -->
- Hardcoded image paths in build scripts (`render-index.js`,
  `render.js`) must point to the renamed files. <!-- 02-§68.8 -->
- CSS selectors using `[alt="..."]` must be updated if the corresponding
  alt-text changes. <!-- 02-§68.9 -->

### 68.3 Constraints

- Image content and dimensions must not change — only
  filenames. <!-- 02-§68.10 -->
- No broken image references may exist after the rename — the build must
  succeed and all images must render. <!-- 02-§68.11 -->

---

## 69. CSS Cache-Busting

HTML files are served with `Cache-Control: no-cache` and always revalidate,
but CSS is cached for up to one week (02-§67.2). When a deploy changes CSS
selectors or styles, browsers may serve stale CSS against fresh HTML,
causing visual regressions. The build must append a content-based hash to
the CSS URL so that any CSS change forces a cache miss.

### 69.1 Build behaviour

- After all HTML files and assets are written, the build must read
  `public/style.css` and compute a short content hash. <!-- 02-§69.1 -->
- The build must replace every `href="style.css"` in all HTML files
  under `public/` with `href="style.css?v=<hash>"`. <!-- 02-§69.2 -->
- The hash must be deterministic: identical CSS content must always
  produce the same hash. <!-- 02-§69.3 -->

### 69.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§69.4 -->
- Existing tests that verify `style.css` presence must continue to
  pass. <!-- 02-§69.5 -->

---

## 70. Main Landmark Element

Every HTML page must contain a `<main>` landmark element so that screen
readers can let users skip past navigation directly to the page content.
This addresses the PageSpeed Accessibility audit flag for missing `<main>`
landmark.

### 70.1 Structural rules

- Every page must have exactly one `<main>` element. <!-- 02-§70.1 -->
- The `<main>` element must wrap all page content between the navigation
  and the footer (or end of content if there is no footer). <!-- 02-§70.2 -->
- The `<main>` element must NOT contain `<nav>` or `<footer>`
  elements. <!-- 02-§70.3 -->

### 70.2 Constraints

- Adding `<main>` must not change any visual styling — it is a semantic
  element only. <!-- 02-§70.4 -->
- Only one `<main>` element is permitted per page (HTML spec
  requirement). <!-- 02-§70.5 -->

---

## 71. Hero Action Buttons

When a camp is active and within its editing period, three quick-access
action buttons must appear directly below the hero image on the index page.
The buttons provide fast navigation to the most-used pages during an
active camp.

### 71.1 User requirements

- A camp participant visiting the home page during an active editing
  period must see three action buttons immediately below the hero
  image. <!-- 02-§71.1 -->
- The buttons must link to, in this order: Idag (`idag.html`), Schema
  (`schema.html`), and Lägg till (`lagg-till.html`). <!-- 02-§71.2 -->
- The buttons must be visually prominent, using terracotta pill-shaped
  styling. <!-- 02-§71.3 -->

### 71.2 Visibility rules

- The buttons must be rendered in the static HTML at build time with
  data attributes for the editing period dates. <!-- 02-§71.4 -->
- A client-side script must show the buttons only when the current date
  falls within `[opens_for_editing, end_date + 1 day]`. <!-- 02-§71.5 -->
- Outside the editing period the button container must be hidden
  (`hidden` attribute). <!-- 02-§71.6 -->

### 71.3 Styling

- Each button must use pill-shaped border-radius (`border-radius: 999px`),
  terracotta background, white text, bold weight. <!-- 02-§71.7 -->
- The button row must be centred within the hero container and have
  appropriate spacing between buttons. <!-- 02-§71.8 -->
- The buttons must be responsive: wrapping naturally on smaller
  screens. <!-- 02-§71.9 -->

### 71.4 Constraints

- The buttons must only appear on the index page. <!-- 02-§71.10 -->
- No new JavaScript files may be added — the script must be inline in
  `index.html`. <!-- 02-§71.11 -->
- CSS must use existing design tokens from `07-DESIGN.md §7`. <!-- 02-§71.12 -->

---

## 72. Close Past-Day Accordions on Schedule Page

On the schedule page (`schema.html`), day accordions for dates that have
already passed should be collapsed by default, so that the visitor sees
current and future days open and past days closed.

### 72.1 User requirements

- When a participant opens the schedule page, day sections whose date
  is before the visitor's current date must be collapsed
  (closed). <!-- 02-§72.1 -->
- Day sections for today and future dates must remain open. <!-- 02-§72.2 -->
- The visitor must still be able to manually open a closed past-day
  accordion by clicking it. <!-- 02-§72.3 -->

### 72.2 Implementation rules

- The comparison must use the visitor's local date (client-side),
  not the build date. <!-- 02-§72.4 -->
- The script must run on page load and close past days by removing
  the `open` attribute from `<details class="day">` elements whose
  `id` (ISO date) is before today. <!-- 02-§72.5 -->
- The script must be inline in the schedule page — no new JS files
  may be added. <!-- 02-§72.6 -->

### 72.3 Constraints

- All days must still be rendered with the `open` attribute at build
  time, so that the page is fully usable without JavaScript. <!-- 02-§72.7 -->
- The script must not affect event-row `<details>` elements, only
  day-level `<details class="day">` elements. <!-- 02-§72.8 -->

---

## 73. Feedback Button (GitHub Issues)

A discreet feedback button in the navigation bar lets any visitor submit
feedback that is automatically created as a GitHub Issue. The feature
uses the same API patterns as add-event (Node.js + PHP dual
implementation) and the same GitHub API primitives.

### 73.1 User requirements

- A feedback icon button (speech-bubble SVG, no text label) must be
  visible on every page. On mobile it is fixed at the top-right corner
  (`position: fixed; top: var(--space-xs); right: var(--space-sm)`);
  on desktop it is positioned near the content column
  edge. <!-- 02-§73.1 -->
- Clicking the button must open a modal dialog. <!-- 02-§73.2 -->
- The modal must contain a form with the following fields: <!-- 02-§73.3 -->
  - Category (radio buttons): Bugg, Förslag, Övrigt — mapping to GitHub
    labels `feedback:bug`, `feedback:suggestion`, `feedback:other`.
  - Title (required, max 200 characters).
  - Description (required, max 2 000 characters).
  - Name / contact info (optional, max 200 characters).
- On successful submission the modal must show a confirmation message
  with a clickable link to the created GitHub Issue (opens in new
  tab). <!-- 02-§73.4 -->
- On failure the modal must show an error message with a retry
  option. <!-- 02-§73.5 -->
- The modal must show progress steps during submission, following the
  same pattern as the add-event modal. <!-- 02-§73.6 -->

### 73.2 API requirements

- A `POST /feedback` endpoint (Node.js) and `POST /api/feedback`
  endpoint (PHP) must accept the feedback form data. <!-- 02-§73.7 -->
- The API must create a GitHub Issue with: <!-- 02-§73.8 -->
  - Title: `[Feedback] {category}: {title}`
  - Body: description text followed by a metadata table containing
    category, page URL, viewport size, timestamp (ISO 8601), name/contact
    (or "Ej angivet"), and User-Agent.
  - Labels: `feedback:bug`, `feedback:suggestion`, or `feedback:other`
    depending on the selected category.
- The API must return `{ success: true, issueUrl: "<URL>" }` on success
  so the client can link to the created issue. <!-- 02-§73.9 -->
- In local development (when `BUILD_ENV` is neither `production` nor
  `qa`), the API must not create a GitHub Issue. It must log the request
  and return `{ success: true, issueUrl: "" }` (empty
  string). <!-- 02-§73.28 -->
- In the QA environment (`BUILD_ENV` is `qa`), the API must create a
  GitHub Issue just as in production, so that testers can give
  feedback. <!-- 02-§73.29 -->

### 73.3 Validation requirements

- Client-side: title and description are required; submit button is
  disabled until both are filled; length limits are enforced
  visually. <!-- 02-§73.10 -->
- Server-side: title (≤ 200), description (≤ 2 000), name (≤ 200)
  length limits must be enforced. <!-- 02-§73.11 -->
- Server-side: the same injection-pattern scan as §49 must be applied
  to title, description, and name fields. <!-- 02-§73.12 -->
- A honeypot field ("website", hidden from users) must be included. If
  filled, the API returns `200 OK` with `{ success: true }` but does
  not create an issue. <!-- 02-§73.13 -->
- Rate-limiting: max 5 requests per IP per hour (in-memory in Node.js,
  simplest possible in PHP). <!-- 02-§73.14 -->

### 73.4 Accessibility requirements

- The modal must use `role="dialog"`, `aria-modal="true"`, and a
  focus trap. <!-- 02-§73.15 -->
- The button must have `aria-label="Ge feedback"`. <!-- 02-§73.16 -->
- The modal must be closable with Escape, click outside, or a close
  button. <!-- 02-§73.17 -->
- All form fields must have associated `<label>` elements and
  `aria-required` where applicable. <!-- 02-§73.18 -->

### 73.5 Metadata collection

- The form must silently collect and include in the API request: page
  URL, viewport size (width × height), User-Agent string, and timestamp
  (ISO 8601). <!-- 02-§73.19 -->

### 73.6 Implementation parity

- The Node.js and PHP implementations must validate identically and
  produce equivalent error messages. <!-- 02-§73.20 -->
- Both must use the existing `githubRequest()` / `githubRequest()`
  primitives for the GitHub Issues API call. <!-- 02-§73.21 -->

### 73.7 Clarity requirements

- The modal heading must be "Feedback om hemsidan" so visitors
  understand the feedback concerns the website, not the
  camp. <!-- 02-§73.22 -->
- A short help text must appear below the heading: "Gäller hemsidan
  och informationen här, inte själva
  lägret." <!-- 02-§73.23 -->

### 73.8 Local environment warning

- When the API returns a successful response without an issue URL
  (dry-run in local development), the success view must show a
  warning below the "Tack för din feedback!" heading. <!-- 02-§73.24 -->
- The warning text must be: "OBS: Detta är en testsida. Din feedback
  sparades inte. Besök den riktiga siten för att skicka
  feedback." <!-- 02-§73.25 -->
- The warning must use the same styling as form validation errors
  (`.form-error-msg`: terracotta left border, light background). <!-- 02-§73.26 -->
- The warning must not include a URL to the production site. <!-- 02-§73.27 -->

## 74. Sticky Navigation Positioning

### 74.1 Site requirements

- The navigation bar remains at the same vertical position whether the
  page is at the top or scrolled — no visible shift when sticky
  positioning activates. <!-- 02-§74.1 -->
- The navigation bar appears at the same vertical position on every
  page load. <!-- 02-§74.2 -->
- When a user clicks an anchor link in the navigation, the target
  section is visible below the navigation bar, not hidden
  behind it. <!-- 02-§74.3 -->
- The navigation bar remains at the same horizontal position when
  navigating between pages, regardless of whether the page content
  requires a scrollbar. <!-- 02-§74.4 -->

---

## 75. Consistent Navigation and Page Title Labels

Navigation labels follow the principle: short where space is limited,
descriptive where there is room.

### 75.1 User requirements

- A visitor on desktop sees short, uppercase navigation labels so the
  menu stays compact. <!-- 02-§75.1 -->
- A visitor using the mobile hamburger menu sees longer, descriptive
  labels so every link is self-explanatory. <!-- 02-§75.2 -->
- A visitor using hero quick-access buttons sees short labels in the
  order Idag, Schema, Lägg till. <!-- 02-§75.3 -->

### 75.2 Site requirements

- The desktop navigation bar displays page links with short labels
  (Hem, Schema, Idag, Lägg till, Arkiv) rendered in uppercase via
  `text-transform: uppercase`. <!-- 02-§75.4 -->
- The mobile hamburger menu displays page links with descriptive labels:
  Hem, Lägrets schema, Dagens aktiviteter, Lägg till aktivitet,
  Lägerarkiv. <!-- 02-§75.5 -->
- The hero action buttons use short labels in this order: Idag, Schema,
  Lägg till. <!-- 02-§75.6 -->
- The `<h1>` page title on `schema.html` is
  "Lägrets schema – {campName}". <!-- 02-§75.7 -->
- The `<h1>` page title on `idag.html` is
  "Dagens aktiviteter". <!-- 02-§75.8 -->
- The `<title>` element on `schema.html` is
  "Lägrets schema – {campName}". <!-- 02-§75.9 -->
- The `<title>` element on `idag.html` is
  "Dagens aktiviteter – {campName}". <!-- 02-§75.10 -->
- The layout module renders separate label sets for desktop and
  hamburger rather than sharing a single list. <!-- 02-§75.11 -->

---

## 77. JavaScript Cache-Busting

HTML files are served with `Cache-Control: no-cache` and always revalidate,
but JS is cached for up to one week (02-§67.2). When a deploy changes
client-side JavaScript, browsers may serve stale scripts against fresh HTML,
causing broken behaviour. The build must append a content-based hash to
JS URLs so that any JS change forces a cache miss while unchanged files
continue to be served from cache.

### 77.1 Build behaviour

- After all HTML files and assets are written, the build must read each
  JS file referenced by `<script>` tags in `public/` and compute a short
  content hash (first 8 hex characters of the MD5
  digest). <!-- 02-§77.1 -->
- The build must replace every `src="<file>.js"` in all HTML files
  under `public/` with `src="<file>.js?v=<hash>"`. <!-- 02-§77.2 -->
- The hash must be deterministic: identical JS content must always
  produce the same hash. <!-- 02-§77.3 -->

### 77.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§77.4 -->
- Existing tests that verify JS file presence must continue to
  pass. <!-- 02-§77.5 -->

---

## 78. Image Cache-Busting

Images are cached for up to one year (02-§67.1). When an image is replaced
with new content but the same filename, browsers may serve the old version
indefinitely. The build must append a content-based hash to image URLs in
HTML so that changed images force a cache miss while unchanged images
continue to be served from cache.

### 78.1 Build behaviour

- After all HTML files and assets are written, the build must read each
  image file referenced by `<img>` tags in `public/` and compute a short
  content hash (first 8 hex characters of the MD5
  digest). <!-- 02-§78.1 -->
- The build must replace every `src="<file>.<ext>"` (where ext is webp,
  png, jpg, jpeg, or ico) in all HTML files under `public/` with
  `src="<file>.<ext>?v=<hash>"`. <!-- 02-§78.2 -->
- The hash must be deterministic: identical image content must always
  produce the same hash. <!-- 02-§78.3 -->

### 78.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§78.4 -->
- Existing tests that verify image file presence must continue to
  pass. <!-- 02-§78.5 -->

---

## 79. Section Anchor ID Consistency

Section anchor IDs on the index page must match their navigation labels.
The `id` field in `sections.yaml` is the single source of truth for both
the `<section id="…">` attribute and the `href="#…"` in navigation links.

### 79.1 Anchor IDs

- The testimonials section must use `id="roster"`. <!-- 02-§79.1 -->
- The pricing section must use `id="kostnader"`. <!-- 02-§79.2 -->

### 79.2 Navigation link targets

- The navigation link for "Röster" must point to `#roster`. <!-- 02-§79.3 -->
- The navigation link for "Kostnader" must point to `#kostnader`. <!-- 02-§79.4 -->

---

## 80. Multi-Day Selection and Batch Submission

Participants often run the same activity on multiple days at the same time and
place. The add-activity form uses a day grid that is always multi-select —
clicking days toggles them on/off. When more than one day is selected, the
submission uses the batch endpoint. A confirmation modal is shown before every
submission.

### 80.1 Day grid component (user requirements)

- The date picker on the add-activity form is a grid of day buttons replacing
  the native `<input type="date">`. <!-- 02-§80.1 -->
- Each button displays the Swedish weekday abbreviation and the date in
  day/month format (e.g. "Mån 28/7"). <!-- 02-§80.2 -->
- The grid contains exactly the days within the active camp's
  `start_date..end_date`. <!-- 02-§80.3 -->
- When the current date falls within the camp period, only days from today
  onward are shown. Before the camp period, all days are shown. <!-- 02-§80.4 -->
- The day grid is always multi-select. Clicking a day toggles it on or off
  independently. There is no single-select mode. <!-- 02-§80.5 -->

### 80.2 Multi-day info and validation (user requirements)

- The day grid is always multi-select. Clicking any day toggles its
  selection. <!-- 02-§80.6 -->
- When two or more days are selected, an info text is shown below the day grid
  stating the count and that each day becomes a separate editable
  activity. <!-- 02-§80.7 -->
- When exactly one day is selected after having had multiple selected, a soft
  hint is shown reminding the user that only one day is selected. <!-- 02-§80.8 -->
- Clicking a day toggles it on or off independently. <!-- 02-§80.9 -->
- At least one day must be selected before submit. An error message is shown
  immediately (live validation) if no day is selected. <!-- 02-§80.10 -->
- The day grid paginates at 8 days per page. Navigation arrows (← →) allow
  moving between pages. <!-- 02-§80.11 -->

### 80.3 Batch API endpoint (API requirements)

- A new endpoint `POST /add-events` (and PHP equivalent `POST /api/add-events`)
  accepts the same fields as `POST /add-event` but with `dates` (an array of
  `YYYY-MM-DD` strings) instead of `date`. <!-- 02-§80.12 -->
- The endpoint validates every date in the array using the same rules as the
  single-event endpoint (within camp range, not in the past, valid
  format). <!-- 02-§80.13 -->
- The endpoint validates the uniqueness constraint `(title + date + start)` for
  every date in the batch against existing events in the camp
  file. <!-- 02-§80.14 -->
- All validation runs before any write. If any single date fails validation,
  the entire batch is rejected and no events are created
  (all-or-nothing). <!-- 02-§80.15 -->
- On success, all events are committed in a single branch and PR — not one PR
  per event. <!-- 02-§80.16 -->
- The response includes `{ "success": true, "eventIds": [...] }` listing all
  created event IDs. <!-- 02-§80.17 -->
- Time-gating (§26) and injection scanning (§49) apply to the batch endpoint
  identically. <!-- 02-§80.18 -->
- The session cookie is updated with all new event IDs when consent is
  given. <!-- 02-§80.19 -->

### 80.4 Confirmation and submit flow (user requirements)

- Before every submission (single or batch), a confirmation modal is shown
  displaying the activity summary: title, date(s), time, location, responsible,
  description, and link. <!-- 02-§80.20 -->
- The progress modal (§53.2) displays the same stages as single submit. The
  final success message states the number of created activities
  (e.g. "5 aktiviteter tillagda!"). <!-- 02-§80.21 -->
- On error, the modal displays the error message. Since the batch is
  all-or-nothing, no partial state needs to be communicated. <!-- 02-§80.22 -->
- "Lägg till en till" resets the form including the day grid. <!-- 02-§80.23 -->

### 80.5 Edit form (site requirements)

- The edit form is not affected by this feature. Editing always operates on a
  single event. The date field on the edit form remains a single day
  selector. <!-- 02-§80.24 -->

### 80.6 Implementation constraints

- The day grid is implemented in vanilla JavaScript. <!-- 02-§80.25 -->
- The day grid uses CSS custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§80.26 -->
- The batch endpoint must be implemented in both Node.js and PHP with identical
  validation and response format. <!-- 02-§80.27 -->

---

## 81. Client-side link field validation

The add-activity form validates the optional link field on blur so that the user
gets immediate feedback when the format is incorrect, without having to submit
the form first.

### 81.1 Blur validation (user requirements)

- When the user leaves the link field and the value is non-empty, the client
  validates that the value starts with `http://` or `https://`
  (case-insensitive). <!-- 02-§81.1 -->
- When the value is non-empty and does not start with `http://` or `https://`,
  the client validates that the value contains at least one dot after the
  protocol. <!-- 02-§81.2 -->
- When validation fails, an error message is shown below the field using the
  same error pattern as other fields (red text, `field-error`
  class). <!-- 02-§81.3 -->
- When the link field is empty, no validation error is shown (the field is
  optional). <!-- 02-§81.4 -->

### 81.2 Clearing errors (user requirements)

- When the user types in the link field after an error has been shown, the error
  is cleared on `input` event. <!-- 02-§81.5 -->

### 81.3 Error messages (user requirements)

- Missing protocol: the error message is
  "Länken måste börja med https:// eller http://". <!-- 02-§81.6 -->
- Missing dot (no valid domain): the error message is
  "Länken ser inte ut som en giltig webbadress". <!-- 02-§81.7 -->

### 81.4 Submit gating (site requirements)

- The form must not allow submission while the link field has a validation
  error. The submit button validation checks must include the link field
  state. <!-- 02-§81.8 -->

### 81.5 Implementation constraints

- The validation is implemented in vanilla JavaScript in
  `lagg-till.js`. <!-- 02-§81.9 -->
- The validation reuses the existing `setFieldError` / `clearFieldError`
  helpers. <!-- 02-§81.10 -->

---

## 82. Character counter on text input fields

The add-activity and edit-activity forms display a discreet character counter on
text input fields so the user sees how much space remains before hitting the
maximum length.

### 82.1 Affected fields and maximum lengths (site requirements)

- The following fields display a character counter and enforce a `maxlength`
  attribute in HTML: <!-- 02-§82.1 -->

  | Field       | Max length |
  |-------------|-----------|
  | title       | 80        |
  | responsible | 60        |
  | description | 2000      |
  | link        | 500       |

- The `maxlength` attribute is set on each `<input>` and `<textarea>` element in
  both the add-activity form (`render-add.js`) and the edit-activity form
  (`render-edit.js`). <!-- 02-§82.2 -->
- The API validation in `validate.js` uses the same limits. The `responsible`
  field limit is reduced from 200 to 60 to match the new client-side
  constraint. <!-- 02-§82.3 -->

### 82.2 Counter visibility (user requirements)

- The counter is hidden when the field value is below 70 % of the maximum
  length. <!-- 02-§82.4 -->
- The counter becomes visible when the field value reaches or exceeds 70 % of
  the maximum length. <!-- 02-§82.5 -->
- The counter text turns terracotta (`var(--color-terracotta)`) when the field
  value reaches or exceeds 90 % of the maximum length. <!-- 02-§82.6 -->

### 82.3 Counter format and placement (user requirements)

- The counter text shows the current length and the maximum length in the format
  `N / MAX` (e.g. `58 / 80`). <!-- 02-§82.7 -->
- The counter is placed directly below the input field, right-aligned within the
  `.field` container. <!-- 02-§82.8 -->
- The counter uses `font-size: var(--font-size-small)` and
  `color: var(--color-charcoal)` at `opacity: 0.6` by default. <!-- 02-§82.9 -->

### 82.4 Counter updates (site requirements)

- The counter updates on every `input` event on the field. <!-- 02-§82.10 -->
- When the form is reset (e.g. after successful submission), counters are hidden
  again. <!-- 02-§82.11 -->

### 82.5 Both forms (site requirements)

- The character counter is present on both the add-activity form
  (`lagg-till.html`) and the edit-activity form
  (`redigera.html`). <!-- 02-§82.12 -->

### 82.6 Implementation constraints

- The counters are implemented in vanilla JavaScript. <!-- 02-§82.13 -->
- The counters use CSS custom properties from `docs/07-DESIGN.md
  §7`. <!-- 02-§82.14 -->
- No new npm dependencies are added. <!-- 02-§82.15 -->

---

## 83. Progressive Web App (PWA) Support

The site must be installable as a Progressive Web App so participants can add it
to their home screen and use it in a standalone app-like experience. A service
worker provides offline caching so that core pages and recent event data remain
accessible without network connectivity.

### 83.1 Web App Manifest (site requirements)

- The build must produce an `app.webmanifest` file at the site root. <!-- 02-§83.1 -->
- The manifest must set `name` to `"SB Sommar"` and `short_name` to
  `"SB Sommar"`. <!-- 02-§83.2 -->
- The manifest must set `display` to `"standalone"`. <!-- 02-§83.3 -->
- The manifest must set `start_url` to `"/"`. <!-- 02-§83.4 -->
- The manifest must set `theme_color` and `background_color` to values from
  the design palette (`07-DESIGN.md §2`). <!-- 02-§83.5 -->
- The manifest must declare at least two icon sizes: 192×192 and
  512×512, both PNG. <!-- 02-§83.6 -->
- The manifest `icons` array must include a `"purpose": "any"` entry. <!-- 02-§83.7 -->
- The manifest `icons` array must include at least one entry with
  `"purpose": "maskable"` so the icon renders correctly in adaptive icon
  contexts (Android home screen, etc.). <!-- 02-§83.26 -->

### 83.2 HTML head tags (site requirements)

- Every HTML page must include `<link rel="manifest" href="app.webmanifest">`
  in `<head>`. <!-- 02-§83.8 -->
- Every HTML page must include `<meta name="theme-color">` with the same value
  as the manifest `theme_color`. <!-- 02-§83.9 -->
- Every HTML page must include `<meta name="mobile-web-app-capable"
  content="yes">`. <!-- 02-§83.10 -->
- Every HTML page must include `<meta name="apple-mobile-web-app-status-bar-style"
  content="default">`. <!-- 02-§83.11 -->
- Every HTML page must include `<link rel="apple-touch-icon" href="images/sbsommar-icon-192.png">`. <!-- 02-§83.12 -->

### 83.3 Service worker (site requirements)

- The build must produce a `sw.js` file at the site root. <!-- 02-§83.13 -->
- A registration script must be included on every page and must register
  `sw.js` only when the browser supports service workers. <!-- 02-§83.14 -->
- The service worker must use a versioned cache name so that updates can
  invalidate old caches. <!-- 02-§83.15 -->
- On `install`, the service worker pre-caches all site assets (HTML
  pages, CSS, JS, images, `events.json`) so the full site is available
  offline from the first launch. The pre-cache list is generated at
  build time (see §92). <!-- 02-§83.16 -->
- On `fetch`, the service worker must serve cached responses for navigation
  and static-asset requests when the network is unavailable
  (network-first with cache fallback for HTML, cache-first for CSS/JS/images). <!-- 02-§83.17 -->
- On `activate`, the service worker must delete caches whose name does not
  match the current version. <!-- 02-§83.18 -->
- The service worker does not cache API responses (`/api/` paths) or
  form-submission endpoints (`/add-event`, `/edit-event`,
  `/delete-event`, `/verify-admin`). Form pages (`lagg-till.html`,
  `redigera.html`) are pre-cached and served offline; an offline guard
  (§92) disables submission when there is no network. <!-- 02-§83.19 -->
- The service worker must only handle requests with `http:` or `https:`
  schemes; all other schemes (e.g. `chrome-extension:`) must be
  ignored. <!-- 02-§83.27 -->
- The service worker must cache `events.json` using a
  network-first strategy with cache fallback so that schedule data is
  available offline. <!-- 02-§83.28 -->
- When a navigation request fails and the requested page is not in the
  cache, the service worker must respond with a dedicated offline
  fallback page (`/offline.html`) that tells the user they are offline
  and lists which pages may be available from cache. <!-- 02-§83.29 -->

### 83.4 Icon assets (site requirements)

- PNG icon files `sbsommar-icon-192.png` (192×192) and `sbsommar-icon-512.png` (512×512) must
  exist in the images directory. <!-- 02-§83.20 -->
- The build copies them to `public/images/` alongside other image
  assets. <!-- 02-§83.21 -->

### 83.6 Offline fallback page (site requirements)

- The build must produce an `offline.html` page at the site root. <!-- 02-§83.30 -->
- The offline page must use the same shared layout (header, footer,
  CSS) as other pages. <!-- 02-§83.31 -->
- The offline page must display a Swedish-language message informing the
  user that they are offline. <!-- 02-§83.32 -->
- The offline page must only link to pages that are pre-cached and
  functional offline. It must not link to pages that require network
  (e.g. `lagg-till.html`). <!-- 02-§83.35 -->
- The service worker must pre-cache `offline.html` on install. <!-- 02-§83.33 -->

### 83.7 Implementation constraints

- The service worker is implemented in vanilla JavaScript. <!-- 02-§83.22 -->
- No new npm dependencies are added. <!-- 02-§83.23 -->
- Existing pages and functionality must not break. <!-- 02-§83.24 -->
- Every HTML page must use the PWA icon (`images/sbsommar-icon-192.png`) as
  the browser favicon (`<link rel="icon">`). <!-- 02-§83.25 -->
- The cache version constant is updated when caching behaviour changes,
  so that old caches are invalidated on the next
  activation. <!-- 02-§83.34 -->

---

## 84. API Error Messages

When an API call fails, the user must receive an error message that helps them
understand whether the problem is actionable or not.

### 84.1 User requirements

- When submitting an activity fails, the user sees a message that indicates
  the nature of the failure — not just "kunde inte sparas". <!-- 02-§84.1 -->
- The user can distinguish between a temporary problem (try again later) and
  a permanent problem (contact the organiser). <!-- 02-§84.2 -->

### 84.2 Site requirements

- The PHP API classifies GitHub API errors into categories before returning
  them to the client: <!-- 02-§84.3 -->
  - **Authentication** (401/403) — token missing or expired.
  - **Conflict** (409/422) — concurrent write or validation failure.
  - **Rate limit** (403 with rate-limit header, 429) — too many requests.
  - **Network / timeout** — GitHub unreachable.
  - **Other server errors** (5xx) — transient GitHub failure.
- Each category maps to a Swedish user-facing message that tells the user
  whether to retry or contact the organiser. <!-- 02-§84.4 -->
- The classification applies to all three mutation endpoints: `/add-event`,
  `/add-events`, and `/edit-event`. <!-- 02-§84.5 -->
- Error messages must never expose internal details such as tokens, file
  paths, or full stack traces. <!-- 02-§84.6 -->
- The existing client-side code (`lagg-till.js`) already displays
  `json.error` — no client changes are needed. <!-- 02-§84.7 -->

## 85. Form Draft Cache (sessionStorage)

When filling in the add-activity form, all field values are saved to
`sessionStorage` so that a page reload preserves the user's input.

### 85.1 User requirements

- When the user reloads the add-activity page, all previously entered field
  values are restored automatically. <!-- 02-§85.1 -->
- After a successful submission, the cached draft is cleared so the form
  starts fresh. <!-- 02-§85.2 -->
- The draft cache does not survive closing the browser tab — it only
  protects against reloads within the same session. <!-- 02-§85.3 -->

### 85.2 Site requirements

- All form fields are persisted to `sessionStorage` under a single key
  (`sb_form_draft`). <!-- 02-§85.4 -->
- Text inputs (title, start time, end time, responsible, description, link)
  are saved on every `input` event. <!-- 02-§85.5 -->
- The selected location is saved on `change`. <!-- 02-§85.6 -->
- Selected day-grid dates are saved on click. <!-- 02-§85.7 -->
- On page load, if a draft exists in `sessionStorage`, all fields are
  restored from it before the user interacts with the form. <!-- 02-§85.8 -->
- Restored day-grid selections re-activate the visual selected state and
  update the hidden input. <!-- 02-§85.9 -->
- The draft is removed from `sessionStorage` after a successful
  submission. <!-- 02-§85.10 -->
- The `sb_responsible` field continues to use `localStorage` as before —
  the draft cache does not replace that existing behaviour. <!-- 02-§85.11 -->
- The implementation uses vanilla JavaScript with no new
  dependencies. <!-- 02-§85.12 -->

---

## 86. Image Cache-Busting for href and Manifest References

Section 78 covers `src` attributes in `<img>` tags. Images also appear in
`href` attributes (`<link rel="preload">`, `<link rel="icon">`,
`<link rel="apple-touch-icon">`) and in the PWA manifest
(`app.webmanifest`). These references must receive the same content-based
hash so that the browser treats them as identical URLs and avoids
redundant downloads.

### 86.1 Build behaviour

- After the existing image cache-busting step, the build must also replace
  `href="<file>.<ext>"` (where ext is webp, png, jpg, jpeg, or ico) in all
  HTML files under `public/` with
  `href="<file>.<ext>?v=<hash>"`. <!-- 02-§86.1 -->
- The build must replace `"src": "<file>.<ext>"` (same extensions) in
  `app.webmanifest` under `public/` with
  `"src": "<file>.<ext>?v=<hash>"`. <!-- 02-§86.2 -->
- The hash values must reuse the same image hash cache as the existing
  `src` cache-busting to ensure consistency. <!-- 02-§86.3 -->

### 86.2 Constraints

- The preload `href` must match the corresponding `<img src>` URL exactly
  (including query string) so that the browser can match the preloaded
  resource. <!-- 02-§86.4 -->
- No render function signatures may change — this is a post-processing
  extension. <!-- 02-§86.5 -->
- Existing tests must continue to pass. <!-- 02-§86.6 -->

---

## 87. Manifest Metadata for Richer Install UI

Chrome requires additional manifest fields to show a richer install prompt.
Missing fields degrade the install experience or block the install prompt on
newer browser versions.

### 87.1 Manifest identity (site requirements)

- The manifest must set `id` to `"/"`. <!-- 02-§87.1 -->
- The manifest must set `description` to `"Information och aktiviteter för SB Sommar-lägret"`. <!-- 02-§87.2 -->

### 87.2 Manifest screenshots (site requirements)

- The manifest must include a `screenshots` array with at least two
  entries. <!-- 02-§87.3 -->
- One screenshot must have `form_factor` set to `"wide"` with size
  `"1280x720"` and type `"image/png"`. <!-- 02-§87.4 -->
- One screenshot must have `form_factor` set to `"narrow"` with size
  `"750x1334"` and type `"image/png"`. <!-- 02-§87.5 -->
- Screenshot `src` paths must point to files in the `images/` directory
  and must be cache-busted by the existing build pipeline. <!-- 02-§87.6 -->

### 87.3 Constraints

- No new npm dependencies. <!-- 02-§87.7 -->
- Existing tests must continue to pass. <!-- 02-§87.8 -->

## 88. PWA Install Guide

Many users — especially on iPhone — do not notice that the site can be
installed as an app. A discreet install button in the top bar helps them
discover this without being intrusive.

### 88.1 Install button in navigation (user requirements)

- The header bar must include an install button alongside the existing
  controls (hamburger menu, scroll-to-top, feedback). <!-- 02-§88.1 -->
- The button must use a recognisable install/download icon, styled
  consistently with the other header buttons. <!-- 02-§88.2 -->
- The button label/tooltip must be in Swedish
  (e.g. "Installera appen"). <!-- 02-§88.3 -->
- The button must appear on all pages (it lives in the shared
  header). <!-- 02-§88.4 -->

### 88.2 Platform-specific behaviour (site requirements)

- On browsers that support the `beforeinstallprompt` event
  (Chrome/Edge on Android and desktop), the button must capture the
  event and trigger the native install prompt when clicked. <!-- 02-§88.5 -->
- After a successful installation (detected via the `appinstalled`
  event), the button must be hidden. <!-- 02-§88.6 -->
- On iOS Safari (detected by user-agent and lack of
  `beforeinstallprompt`), the button must show a tooltip or small
  overlay with the instruction: "Tryck på Dela-ikonen och välj
  'Lägg till på hemskärmen'". <!-- 02-§88.7 -->
- The iOS tooltip must close when the user taps outside it or presses
  Escape. <!-- 02-§88.8 -->
- When the site is already running in standalone mode
  (`display-mode: standalone`), the button must not be rendered at
  all. <!-- 02-§88.9 -->
- On browsers where neither `beforeinstallprompt` nor iOS Safari is
  detected, the button must not be rendered. <!-- 02-§88.10 -->

### 88.3 Persistence (site requirements)

- The button is always visible as long as the platform conditions are
  met — no dismiss logic and no localStorage gating. <!-- 02-§88.11 -->

### 88.4 Constraints

- The install button logic must be implemented in a dedicated vanilla
  JavaScript file (`pwa-install.js`). <!-- 02-§88.12 -->
- CSS must use custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§88.13 -->
- No new npm dependencies. <!-- 02-§88.14 -->
- Existing pages and functionality must not break. <!-- 02-§88.15 -->
- All user-facing text must be in Swedish. <!-- 02-§88.16 -->

---

## 89. Delete Activity

Participants who submitted an activity can delete it from the edit page.
Deletion removes the event entirely from the camp's YAML file.

### 89.1 Delete button on edit page (user requirements)

- When an event is loaded for editing on `/redigera.html`, a delete button
  is visible below the form. <!-- 02-§89.1 -->
- The button label is "Radera aktivitet" and is styled as a destructive
  action (visually distinct from the save button). <!-- 02-§89.2 -->
- Clicking the delete button shows a confirmation dialog asking the user
  to confirm deletion before proceeding. <!-- 02-§89.3 -->
- The confirmation dialog includes the event title so the user knows
  which event will be deleted. <!-- 02-§89.4 -->
- The confirmation dialog has two buttons: "Ja, radera" (confirm) and
  "Avbryt" (cancel). <!-- 02-§89.5 -->
- After successful deletion, a clear Swedish confirmation is shown. <!-- 02-§89.6 -->
- The delete button is not shown when the editing period is closed or
  when the event date has passed. <!-- 02-§89.7 -->

### 89.2 Delete submit flow (site requirements)

- After the user confirms deletion, a progress modal is shown with
  status steps, matching the style of the edit submit flow (§20). <!-- 02-§89.8 -->
- The progress modal shows steps: sending request, checking activity,
  deleting activity. <!-- 02-§89.9 -->
- On success, the modal shows a confirmation message and a link back
  to the schedule page. <!-- 02-§89.10 -->
- On failure, the modal shows an error message with a retry
  option. <!-- 02-§89.11 -->

### 89.3 Server-side delete endpoint (site requirements)

- A `POST /delete-event` endpoint accepts delete requests. <!-- 02-§89.12 -->
- The server reads the `sb_session` cookie from the request, parses the
  event ID array, and verifies the target event ID is present — or that the
  request body contains a valid `adminToken` (§91). <!-- 02-§89.13 -->
- If the event ID is not in the cookie and no valid admin token is provided,
  the server responds with HTTP 403. <!-- 02-§89.14 -->
- If the event's date has already passed, the server responds with
  HTTP 400. <!-- 02-§89.15 -->
- If the editing period is closed, the server responds with
  HTTP 400. <!-- 02-§89.16 -->
- If validation passes, the server reads the YAML file from GitHub,
  removes the target event entirely, and commits the change via an
  ephemeral branch and PR with auto-merge — the same pipeline used
  for additions and edits. <!-- 02-§89.17 -->

### 89.4 Client-side session cleanup (site requirements)

- After a successful delete, the event ID is removed from the
  `sb_session` cookie on the client side. <!-- 02-§89.18 -->

### 89.5 Constraints

- The delete flow must reuse existing modal, progress, and accessibility
  patterns from the edit submit flow. <!-- 02-§89.19 -->
- CSS must use custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§89.20 -->
- No new npm dependencies. <!-- 02-§89.21 -->
- All user-facing text must be in Swedish. <!-- 02-§89.22 -->
- The delete endpoint must use `credentials: 'include'` so that the
  `sb_session` cookie is sent cross-origin. <!-- 02-§89.23 -->

---

## 90. Cookie Debug Panel and Session Cookie Repair

### 90.1 Context

The `sb_session` cookie tracks which events the current user has created,
enabling the edit and delete flows. A bug in `removeIdFromCookie`
(redigera.js) writes the cookie back without the `Secure` flag and without
the `Domain` attribute, which can create duplicate cookies with the same
name. Additionally, there is no way for users to inspect what is stored
in the cookie or understand why editing may not work, making cookie
problems difficult to diagnose.

### 90.2 Cookie debug panel (user requirements)

- The edit page (`redigera.html`) must include a collapsible information
  section (e.g. `<details>`) that shows the contents of the user's
  session cookie. <!-- 02-§90.1 -->
- The section must display: <!-- 02-§90.2 -->
  - Whether the page is loaded over HTTP or HTTPS, with a warning if
    HTTP (since the `Secure` flag prevents the cookie from being saved
    over plain HTTP).
  - The cookie domain (from the `data-cookie-domain` attribute on
    `<body>`), or "ej satt" if absent.
  - The number of event IDs currently stored in the cookie.
  - A list of each event ID with its status:
    - "finns i schemat" — the ID exists in `events.json` and the event
      date has not passed.
    - "passerat" — the ID exists in `events.json` but the event date
      has passed (will be cleaned automatically).
    - "hittades inte i schemat" — the ID does not appear in
      `events.json` (may be pending deploy or orphaned).
  - Whether automatic cookie repair was performed during this page
    load (see §90.4).
- The section must be collapsed by default and use a descriptive Swedish
  heading (e.g. "Om din cookie"). <!-- 02-§90.3 -->
- The section must update its content dynamically after `events.json`
  has been fetched. <!-- 02-§90.4 -->

### 90.3 Informational text about event cleanup (user requirements)

- The edit page must display a brief explanation that events whose date
  has passed are automatically removed from the cookie and will not
  appear in the user's list of editable events. <!-- 02-§90.5 -->
- The purpose is to set expectations so the user understands this is
  normal behaviour, not an error. <!-- 02-§90.6 -->

### 90.4 Cookie repair — duplicate detection and merge (site requirements)

- On every page load, `session.js` must detect if more than one
  `sb_session` cookie exists (e.g. one with `Domain` and one
  without). <!-- 02-§90.7 -->
- If duplicates are found, all ID arrays must be parsed, merged, and
  deduplicated. <!-- 02-§90.8 -->
- All existing `sb_session` cookies must be deleted (both the
  exact-host variant and the domain-scoped variant) by setting
  `Max-Age=0`. <!-- 02-§90.9 -->
- A single correct cookie must then be written back with the proper
  attributes (`Path=/`, `Max-Age`, `Secure`, `SameSite=Strict`, and
  `Domain` when configured). <!-- 02-§90.10 -->
- The repair must happen before the existing expiry cleanup, so that
  all valid IDs are preserved. <!-- 02-§90.11 -->

### 90.5 Bug fix — `removeIdFromCookie` attributes (site requirements)

- The `removeIdFromCookie` function in `redigera.js` must write the
  cookie with the same attributes as `session.js`: `Path=/`,
  `Max-Age=604800`, `Secure`, `SameSite=Strict`, and `Domain` when
  `data-cookie-domain` is set on `<body>`. <!-- 02-§90.12 -->
- This fixes a violation of 02-§44.16 (cookie attributes must match
  across all write paths). <!-- 02-§90.13 -->

### 90.6 Constraints

- All user-facing text must be in Swedish. <!-- 02-§90.14 -->
- CSS must use custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§90.15 -->
- The debug panel must be accessible (keyboard-navigable, screen-reader
  friendly). <!-- 02-§90.16 -->

---

## 91. Admin Token — Activation and Status Indicator

### 91.1 Context

The site uses a cookie-based ownership model where each participant can
only edit events they created. During camp, one or two designated
administrators need the ability to edit or delete any event — for example
to correct mistakes, remove duplicates, or update events on behalf of
participants who lost their cookie.

This requirement covers the token infrastructure: storage, activation,
verification, and a visual status indicator. The edit/delete authorisation
behaviour that uses this token is defined in §7, §18, and §89.

### 91.2 Admin tokens (site requirements)

- The server must accept a comma-separated list of valid admin tokens
  via the environment variable `ADMIN_TOKENS`. <!-- 02-§91.1 -->
- Each token follows the format `namn_uuid_epoch`, where `namn` is a
  lowercase identifier for the admin, `uuid` is a v4 UUID, and `epoch`
  is a Unix timestamp (seconds) representing the token's expiry
  date. <!-- 02-§91.2 -->
- A token whose embedded epoch is in the past is rejected server-side
  regardless of whether it appears in `ADMIN_TOKENS`. <!-- 02-§91.29 -->
- The creation script `npm run admin:create` generates a token with
  60 days validity and prints instructions for where to store
  it. <!-- 02-§91.30 -->
- When `ADMIN_TOKENS` is unset or empty, all admin functionality is
  disabled — the site behaves exactly as before. <!-- 02-§91.3 -->

### 91.3 Token verification endpoint (API requirements)

- The API must expose `POST /verify-admin`. <!-- 02-§91.4 -->
- The request body must contain `{ "token": "<string>" }`. <!-- 02-§91.5 -->
- If the token matches any entry in `ADMIN_TOKENS`, the response is
  `200 { "valid": true }`. <!-- 02-§91.6 -->
- If the token does not match, the response is
  `403 { "valid": false }`. <!-- 02-§91.7 -->
- The endpoint enforces the rate limits defined in §93 and performs
  token comparison using constant-time string comparison to prevent
  timing attacks. <!-- 02-§91.8 -->

### 91.4 Admin activation page (user requirements)

- A page at `/admin.html` must allow an administrator to enter their
  token. <!-- 02-§91.9 -->
- The page must contain a single text input and a submit button. <!-- 02-§91.10 -->
- On submit, the page must call `POST /verify-admin` with the entered
  token. <!-- 02-§91.11 -->
- If the server responds with `valid: true`: <!-- 02-§91.12 -->
  - Store the token and the current timestamp in `localStorage` under
    the key `sb_admin`. The stored value is a JSON object:
    `{ "token": "<string>", "activated": <unix-ms> }`.
  - Show a success message (in Swedish).
- If the server responds with `valid: false`: <!-- 02-§91.13 -->
  - Do not store anything.
  - Show an error message (in Swedish).
- The page must use the same layout (header, navigation, footer) as
  other site pages. <!-- 02-§91.14 -->
- The page must not be listed in the site navigation. <!-- 02-§91.15 -->

### 91.5 Token expiry (site requirements)

- A stored admin token is considered expired if more than 30 days
  (2 592 000 000 ms) have passed since the `activated`
  timestamp. <!-- 02-§91.16 -->
- Expiry is checked client-side before any admin-related behaviour. <!-- 02-§91.17 -->
- An expired token is treated as if no token exists — the user must
  re-activate. <!-- 02-§91.18 -->

### 91.6 Footer status indicator (user requirements)

- Every page that includes the shared site footer must display an admin
  status icon when a token exists in `localStorage`. <!-- 02-§91.19 -->
- **No token in `localStorage`**: nothing is displayed. <!-- 02-§91.20 -->
- **Valid token (not expired)**: a filled/locked icon is displayed,
  indicating active admin status. <!-- 02-§91.21 -->
- **Expired token (> 30 days)**: an open/unlocked icon is displayed,
  indicating the token needs renewal. Clicking the icon navigates to
  `/admin.html`. <!-- 02-§91.22 -->
- The icon must be small and unobtrusive — it is not intended for
  regular visitors. <!-- 02-§91.23 -->
- The icon must have a `title` attribute explaining its meaning in
  Swedish (e.g. "Admin aktiv" / "Admin utgången"). <!-- 02-§91.24 -->

### 91.7 Constraints

- All user-facing text must be in Swedish. <!-- 02-§91.25 -->
- CSS must use custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§91.26 -->
- The activation page must be accessible (keyboard-navigable,
  screen-reader friendly). <!-- 02-§91.27 -->
- The admin token must never be sent in cookies — it is stored only in
  `localStorage` and sent explicitly in API request bodies or
  headers. <!-- 02-§91.28 -->

---

## 92. PWA Full Pre-Cache and Offline Guard

The PWA pre-caches every asset the build produces so the entire site works
offline from the first launch after installation. Form pages and the feedback
modal detect offline status and clearly communicate that submission requires
an internet connection.

### 92.1 Build-time pre-cache manifest (site requirements)

- The build scans all files in `public/` after all post-processing
  (cache-busting) is complete and generates a pre-cache URL
  list. <!-- 02-§92.1 -->
- The generated list excludes files that are not meaningful to cache:
  `.htaccess`, `robots.txt`, `sw.js`, `version.json`,
  `.ics` files, `.rss` files, and per-event detail pages
  (`schema/*/index.html`). <!-- 02-§92.2 -->
- The build injects the generated list into `sw.js` by replacing a
  placeholder token (`/* __PRE_CACHE_URLS__ */`). <!-- 02-§92.3 -->
- The injected URLs are root-relative paths (e.g. `/images/hero.jpg`,
  `/style.css`). <!-- 02-§92.4 -->
- After injection, `sw.js` contains no remaining placeholder
  tokens. <!-- 02-§92.5 -->

### 92.2 Service worker (site requirements)

- The `PRE_CACHE_URLS` array in `sw.js` is populated by the build-time
  injection. There is no hand-maintained list. <!-- 02-§92.6 -->
- The service worker cache name is `sb-sommar-v4`. <!-- 02-§92.7 -->
- The service worker pre-caches all site pages, including
  `lagg-till.html` and `redigera.html`. <!-- 02-§92.8 -->
- The `NO_CACHE_PATTERNS` list contains only API and submission
  endpoints: `/add-event`, `/edit-event`, `/delete-event`,
  `/verify-admin`, `/api/`. It does not contain any `.html`
  pages. <!-- 02-§92.9 -->
- The `cacheFirstThenNetwork` strategy uses `{ ignoreSearch: true }`
  when matching cache entries so that cache-busted URLs
  (e.g. `style.css?v=abc`) match pre-cached files. <!-- 02-§92.10 -->
- The `networkFirstWithOfflineFallback` strategy uses
  `{ ignoreSearch: true }` when matching cache entries. <!-- 02-§92.11 -->

### 92.3 Offline guard — form pages (user requirements)

- A client-side script `offline-guard.js` detects offline status using
  `navigator.onLine` and the `online`/`offline` events. <!-- 02-§92.12 -->
- When the user is offline on `lagg-till.html` or `redigera.html`, an
  alert banner appears at the top of the form area with the message:
  *"Du är offline. Formuläret kräver internetanslutning för att
  skicka."* <!-- 02-§92.13 -->
- When the user is offline, all submit buttons on the form page are
  disabled (`disabled` attribute set). <!-- 02-§92.14 -->
- When the user comes back online, the banner disappears and the submit
  buttons are re-enabled. <!-- 02-§92.15 -->
- The banner uses the existing `.form-error-msg` styling from the design
  system. <!-- 02-§92.16 -->
- The script is included on `lagg-till.html` and
  `redigera.html`. <!-- 02-§92.17 -->

### 92.4 Offline guard — feedback modal (user requirements)

- When the feedback modal is open and the user is offline, a warning
  message appears inside the modal:
  *"Du är offline — feedback kan inte skickas just nu."* <!-- 02-§92.18 -->
- The feedback submit button is disabled when offline. <!-- 02-§92.19 -->
- When the user comes back online, the warning disappears and the submit
  button follows its normal enabled/disabled logic (based on field
  validation). <!-- 02-§92.20 -->

### 92.5 Constraints

- All user-facing text is in Swedish. <!-- 02-§92.21 -->
- CSS uses custom properties from `docs/07-DESIGN.md §7`. <!-- 02-§92.22 -->
- No npm dependencies are added. <!-- 02-§92.23 -->
- The service worker is vanilla JavaScript with no external
  libraries. <!-- 02-§92.24 -->
- The offline fallback page (`offline.html`) continues to function as a
  last resort when a page is not in the cache. <!-- 02-§92.25 -->

---

## 93. Rate Limiting for Authorization Endpoints

### 93.1 Context

The API exposes four `POST` endpoints that either perform authorization
(`/verify-admin`) or accept ownership-gated writes (`/edit-event`,
`/delete-event`), plus the user-feedback channel (`/feedback`). CodeQL
flagged three of these as missing rate limiting (alerts #40, #41, #42,
rule `js/missing-rate-limiting`), which allows an attacker to brute-force
admin tokens or hammer the GitHub write path. The feedback endpoint
already enforces a per-IP rate limit through an in-memory / file-based
counter; this requirement extends the same protection to the remaining
authorization endpoints and consolidates the mechanism into a single
reusable implementation per runtime.

### 93.2 Per-endpoint rate limits (API requirements)

- `/verify-admin` rejects more than **5 requests per IP per hour**
  with HTTP `429` and the Swedish error message "För många
  förfrågningar. Försök igen senare." <!-- 02-§93.1 -->
- `/edit-event` rejects more than **30 requests per IP per hour**
  with HTTP `429` and the same Swedish error message. <!-- 02-§93.2 -->
- `/delete-event` rejects more than **30 requests per IP per hour**
  with HTTP `429` and the same Swedish error message. <!-- 02-§93.3 -->
- `/feedback` continues to reject more than **5 requests per IP per
  hour** with HTTP `429` (no behavior change; see §73.14). <!-- 02-§93.4 -->
- The rate-limit check runs before authorization, validation, and
  time-gating so a throttled client never touches the GitHub API or the
  admin-token comparison path. <!-- 02-§93.5 -->
- The client IP is derived from the `X-Forwarded-For` header if
  present, falling back to the connection's remote address — the same
  resolution order used by the existing feedback handler. <!-- 02-§93.6 -->

### 93.3 Shared rate-limit implementation (site requirements)

- Node (`app.js`) imports a single helper, `source/api/rate-limit.js`,
  that exposes `isRateLimited(key, config)`. The helper holds state in
  an in-process `Map` keyed by `"{namespace}:{ip}"` so different
  endpoints do not share quotas. <!-- 02-§93.7 -->
- The Node feedback handler uses the shared helper. The previous
  `isRateLimited` export in `source/api/feedback.js` is removed;
  `/feedback` calls the shared helper with the same `{ limit: 5,
  windowMs: 3_600_000 }` configuration to preserve §73.14
  behavior. <!-- 02-§93.8 -->
- PHP (`api/index.php`) calls `SBSommar\RateLimit::isLimited($ip,
  $namespace, $limit, $windowSeconds)` from
  `api/src/RateLimit.php`. Counter state lives in a single JSON file
  under `sys_get_temp_dir()` with namespaced keys so endpoints do not
  share quotas. <!-- 02-§93.9 -->
- The PHP feedback handler uses the shared class. `Feedback::isRateLimited`
  no longer exists as a separate implementation; it delegates to
  `RateLimit::isLimited` with the feedback namespace and
  `{ limit: 5, window: 3600 }`. <!-- 02-§93.10 -->
- Rate-limit state is process-local in Node and file-local in PHP —
  neither runtime coordinates across processes. This is acceptable
  because both deployments are single-process (one Node server,
  single-shared-host PHP). <!-- 02-§93.11 -->

### 93.4 Constraints

- All user-facing error text is in Swedish. <!-- 02-§93.12 -->
- No new npm dependencies are added. <!-- 02-§93.13 -->
- No new Composer dependencies are added. <!-- 02-§93.14 -->
- The rate-limit helper imposes no hard requirement on
  `X-Forwarded-For` spoof protection; trust boundaries are deferred to
  reverse-proxy configuration, consistent with the existing feedback
  handler. <!-- 02-§93.15 -->

---

## 94. Registration Banner and CTA Button

### 94.1 Context

The homepage must signal, at a glance, that registration is open for each
upcoming camp. The "Hur anmäler jag oss?" section contains an inline bold
markdown link that first-time visitors easily miss, and nothing else on the
page communicates whether registration is currently open or when it closes.
Two changes address this: a banner below the hero that announces the open
registration window and links to the section, and a prominent CTA button
inside the section itself that replaces the inline markdown link.

### 94.2 User requirements

- A prospective family visiting the homepage during an open registration
  period for a camp sees a banner directly below the hero image announcing
  that registration for that camp is open, together with the last
  registration date. <!-- 02-§94.1 -->
- Clicking the banner navigates to the `#anmalan` section on the same
  page. <!-- 02-§94.2 -->
- One banner is rendered per non-archived camp that has a registration
  window, ordered by the camp's `start_date` ascending (closest camp
  first). <!-- 02-§94.3 -->
- The "Hur anmäler jag oss?" section contains a visually prominent
  "Anmäl er här" button that opens the external registration service at
  `event-friend-ai.lovable.app` in a new tab. <!-- 02-§94.4 -->
- On desktop (≥ 720 px), the "Anmäl er här" button sits to the right of
  the section column, and surrounding text flows around it. <!-- 02-§94.5 -->
- On mobile (< 720 px), the "Anmäl er här" button spans the full column
  width and is centred. <!-- 02-§94.6 -->
- The registration section contains no inline bold markdown link labelled
  "Anmäl er här"; the CTA button is the single call-to-action. <!-- 02-§94.7 -->

### 94.3 Data requirements

- Each non-archived camp in `camps.yaml` declares the fields
  `registration_opens` and `registration_closes`, both as ISO dates
  (`YYYY-MM-DD`, inclusive). <!-- 02-§94.8 -->
- The data validator rejects a non-archived camp that is missing either
  field, has a non-ISO date, has `registration_opens > registration_closes`,
  or has `registration_closes >= start_date`. <!-- 02-§94.9 -->
- Archived camps may omit the registration fields; the validator does not
  require them. <!-- 02-§94.10 -->

### 94.4 Banner visibility rules

- Each banner is rendered in the static HTML at build time with the
  `hidden` attribute and the data attributes `data-opens` and
  `data-closes` carrying the camp's registration window. <!-- 02-§94.11 -->
- A client-side script removes `hidden` only when the current
  Europe/Stockholm date satisfies
  `data-opens <= today <= data-closes`. <!-- 02-§94.12 -->
- Outside the registration window the banner remains hidden; it does not
  briefly flash visible, and its container reserves no visible space when
  empty. <!-- 02-§94.13 -->
- Banners are only rendered for non-archived camps. <!-- 02-§94.14 -->

### 94.5 CTA button placement and behaviour

- The CTA button is injected by the homepage renderer into the `anmalan`
  section, not authored in the markdown source, following the same
  injection pattern as `wrapTestimonialCards` in
  `source/build/render-index.js`. <!-- 02-§94.15 -->
- The button opens in a new browser tab with `target="_blank"` and
  `rel="noopener noreferrer"`, consistent with other external links on
  the site. <!-- 02-§94.16 -->
- The button reuses the existing `.btn-primary` class from
  `source/assets/cs/style.css`; no new colour, typography, or spacing
  tokens are introduced. <!-- 02-§94.17 -->

### 94.6 Analytics

- Each banner carries
  `data-goatcounter-click="click-register-banner-<camp-id>"`, where
  `<camp-id>` is the camp's `id` from `camps.yaml`. <!-- 02-§94.18 -->
- The CTA button carries
  `data-goatcounter-click="click-register-section"`. <!-- 02-§94.19 -->

### 94.7 Constraints

- All user-facing text is in Swedish. <!-- 02-§94.20 -->
- CSS uses existing design tokens from `07-DESIGN.md §7`; no hardcoded
  colours, spacing, or typography. <!-- 02-§94.21 -->
- No new JavaScript files are added; the visibility script is inline in
  the generated `index.html`, consistent with §71.11. <!-- 02-§94.22 -->
- No new npm or Composer dependencies. <!-- 02-§94.23 -->
