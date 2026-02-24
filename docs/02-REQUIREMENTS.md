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
- Each activity shows: title, start time, end time (if set), location, responsible person. <!-- 02-§4.3 -->

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
- End time (only if set)
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
- Location
- Responsible person

### Optional fields

- End time
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

Only administrators can edit or remove activities. <!-- 02-§7.1 -->

This is done by modifying the camp's YAML file directly. See [04-OPERATIONS.md](04-OPERATIONS.md) for the workflow.

Participants do not have editing rights.

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
- `end`, if provided, is in valid `HH:MM` format and is after `start`. <!-- 02-§9.4 -->
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
