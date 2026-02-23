# SB Sommar – Event Handling Requirements

This document describes what users must be able to do regarding activities and the weekly schedule.

It focuses strictly on user needs and expected behaviour.

For field definitions and data validation rules, see [04-DATA_CONTRACT.md](04-DATA_CONTRACT.md).

---

## 1. Viewing the Schedule

Participants must be able to:

- View the full weekly schedule (Sunday–Sunday).
- View a daily schedule showing only one day.
- View a simplified "Today" version suitable for mobile devices and shared screens.
- See activities listed in chronological order.

In schedule views, each activity must display:

- Title
- Start time
- End time (if set)
- Location
- Responsible person

The day is used for placement in the weekly structure, not for display inside each activity row.

The schedule must be quick to scan and easy to understand.

### Today View

The Today view is a stripped-back version of the daily schedule intended for:

- Mobile phones (used by participants on the go)
- Shared display screens placed around the camp

It must be legible at a distance. It must use a dark background, large text, and minimal interface elements.

---

## 2. Viewing Activity Details

Participants must be able to click an activity to see more information.

The detail view must include:

- Title
- Date
- Start time
- End time (if set)
- Location
- Responsible person
- Full description (if set)
- Communication link (if set)

If no end time, description, or communication link exists, those fields must not be shown.

Users should clearly understand whether additional information exists beyond the schedule row.

---

## 3. Creating a New Activity

Participants must be able to create a new activity.

Mandatory fields:

- Title
- Date
- Start time
- Location
- Responsible person

Optional fields:

- End time
- Description (free text)
- Communication link

Creating an activity must be simple and fast, requiring minimal effort.

The form must be accessible at `/lagg-till.html`.

---

## 4. Editing and Removing Activities

An administrator must be able to:

- Remove activities.
- Correct mistakes in any field.

Participants do not need editing rights.

Admin editing is done by modifying the camp YAML file directly. See [03-OPERATIONS.md](03-OPERATIONS.md) for the workflow.

---

## 5. Locations

- Locations must primarily be selected from predefined options.
- One flexible option ("Other" / "Annan") must exist for locations not in the list.
- Location names must remain consistent throughout the week.
- Predefined locations are maintained in `source/data/local.yaml`.

Participants cannot modify the location list.

---

## 6. Validation Rules

When a participant submits an activity, the following must be checked:

- `title` is present and non-empty.
- `date` is present and falls within the active camp's date range.
- `start` is present and in valid `HH:MM` format.
- `end`, if provided, is in valid `HH:MM` format and is after `start`.
- `location` is present and non-empty.
- `responsible` is present and non-empty.

Invalid submissions must be rejected with a clear error message.
Valid submissions must receive a confirmation immediately.

---

## 7. Order and Overlaps

- Activities must always be displayed in chronological order.
- Overlapping activities are allowed.
- The schedule must remain readable even when multiple activities occur simultaneously.

---

## 8. Reliability

Participants must be able to trust that:

- The schedule reflects the current plan.
- A newly submitted activity appears in the schedule within a few minutes.
- Changes and deletions are visible in all schedule views.

The schedule functions as a shared coordination tool during the camp.

---

## 9. Simplicity

The event handling must:

- Work well on mobile devices.
- Be readable on shared display screens.
- Require minimal explanation.
- Avoid unnecessary complexity.

The purpose is coordination, not administration.
