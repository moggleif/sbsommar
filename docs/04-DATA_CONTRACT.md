# SB Sommar – Data Contract

This document defines the official data structure for all camp YAML files.

This contract must not change casually.
Rendering logic depends on it.

---

## 1. camps.yaml Structure

`source/data/camps.yaml` is the central registry of all camps.

```yaml
camps:
  - id: string           # stable identifier, never changes
    name: string         # display name
    start_date: YYYY-MM-DD
    end_date: YYYY-MM-DD
    file: string         # filename in source/data/ (e.g. 2026-06-syssleback.yaml)
    active: boolean      # true for the current camp; only one at a time
    archived: boolean    # true once the camp has ended
```

All fields shown are required for each entry.

Rules:

- Exactly one camp may have `active: true` at a time.
- A camp that is `active: true` must not also be `archived: true`.
- The `file` field references a YAML file in `source/data/`.

---

## 2. Camp File Structure

Each camp file must follow this structure:

```yaml
camp:
  id: string
  name: string
  location: string
  start_date: YYYY-MM-DD
  end_date: YYYY-MM-DD

events:
  - id: string
    title: string
    date: YYYY-MM-DD
    start: "HH:MM"
    end: "HH:MM" | null
    location: string
    responsible: string
    description: string | null
    link: string | null
    owner:
      name: string
      email: string
    meta:
      created_at: ISO-8601 | null
      updated_at: ISO-8601 | null
```

---

## 3. Required Fields

### Required in the camp file (under `camp:`)

- `id`
- `name`
- `location`
- `start_date`
- `end_date`

### Required for each event

- `id`
- `title`
- `date`
- `start`
- `location`
- `responsible`

### Optional for each event

- `end`
- `description`
- `link`
- `owner`
- `meta`

---

## 4. Date and Time Rules

- `date` must fall within the camp's `start_date` and `end_date` (inclusive).
- `start` must use 24-hour format: `"HH:MM"`.
- `end` must be `null` or `"HH:MM"`.
- `end`, when present, must be after `start`.
- No timezone handling. All times are local.

---

## 5. Uniqueness Rule

The combination of:

```text
(title + date + start)
```

must be unique within a camp file.

Duplicate events are not allowed.

---

## 6. Event ID Rules

- Must be unique within the file.
- Must be stable — do not change after creation.
- Recommended format:

```text
slug-title-YYYY-MM-DD-HHMM
```

Example:

```text
middag-2025-06-30-1630
```

---

## 7. Complete Example

```yaml
camp:
  id: 2025-08-syssleback
  name: SB Sommar Augusti 2025
  location: Sysslebäck
  start_date: 2025-08-03
  end_date: 2025-08-10

events:
  - id: schack-2025-08-04-1400
    title: Schack
    date: 2025-08-04
    start: "14:00"
    end: "16:00"
    location: Samlingssalen
    responsible: Anna
    description: >
      Öppet parti för alla åldrar.
      Ta med eget schackbräde om du vill.
    link: null
    owner:
      name: ""
      email: ""
    meta:
      created_at: null
      updated_at: null
```

---

## 8. Stability Policy

Breaking changes to this structure require:

- An explicit version bump.
- Updated rendering logic.
- An update to this document.

Fields may be added in future versions.
Fields must not be removed without a migration plan.

This contract is the foundation of the system.
