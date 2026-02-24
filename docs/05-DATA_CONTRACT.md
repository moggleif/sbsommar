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
    location: string     # place name displayed on the archive page
    file: string         # filename in source/data/ (e.g. 2026-06-syssleback.yaml)
    active: boolean      # true for the current camp; only one at a time
    archived: boolean    # true once the camp has ended
    information: string | null   # optional descriptive text shown on archive page
    link: string | null          # optional URL (e.g. Facebook group) shown on archive page
```

All fields except `information` and `link` are required for each entry. <!-- 05-§1.1 -->

Rules:

- Exactly one camp may have `active: true` at a time. <!-- 05-§1.2 -->
- A camp that is `active: true` must not also be `archived: true`. <!-- 05-§1.3 -->
- The `file` field references a YAML file in `source/data/`. <!-- 05-§1.4 -->
- The camp `id` is permanent and must never change after the camp is first created. <!-- 05-§1.5 -->

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

How to read this schema:

- `string` means a text value (e.g. `"Schack"`)
- `boolean` means `true` or `false` (no quotes)
- `YYYY-MM-DD` means a date written as `2026-06-28`
- `"HH:MM"` means a 24-hour time written as `"14:00"` (quoted)
- `ISO-8601` means a full datetime string: `2026-06-28T14:00:00`
- `| null` means the field can be omitted or set to `null`

See §7 for a complete worked example.

---

## 3. Required Fields

### Required in the camp file (under `camp:`) <!-- 05-§3.2 -->

- `id`
- `name`
- `location`
- `start_date`
- `end_date`

### Required for each event <!-- 05-§3.1 -->

- `id`
- `title`
- `date`
- `start`
- `end`
- `location`
- `responsible`

### Optional for each event

- `description`
- `link`
- `owner`
- `meta`

The `owner` and `meta` fields are for internal use only and must never be displayed in any public view. <!-- 05-§3.3 -->

---

## 4. Date and Time Rules

- `date` must fall within the camp's `start_date` and `end_date` (inclusive). <!-- 05-§4.1 -->
- `start` must use 24-hour format: `"HH:MM"`. <!-- 05-§4.2 -->
- `end` must be `"HH:MM"`. <!-- 05-§4.4 -->
- `end` must be after `start`. <!-- 05-§4.3 -->
- No timezone handling. All times are local. <!-- 05-§4.5 -->

---

## 5. Uniqueness Rule

The combination of:

```text
(title + date + start)
```

must be unique within a camp file. <!-- 05-§5.1 -->

Duplicate events are not allowed.

---

## 6. Event ID Rules

- Must be unique within the file. <!-- 05-§6.1 -->
- Must be stable — do not change after creation. <!-- 05-§6.2 -->
- Recommended format:

```text
slug-title-YYYY-MM-DD-HHMM
```

A "slug" is a URL-friendly version of the title: lowercase letters, numbers, and hyphens only (no spaces or special characters). For example, "Middag & dans" becomes `middag-dans`.

Example ID:

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
