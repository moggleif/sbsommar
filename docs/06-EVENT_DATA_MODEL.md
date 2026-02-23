# SB Sommar – Event Data Model

This document explains *why* the event data is structured the way it is — the reasoning, the future-proofing decisions, and the design intent.

It applies to all camps (lägerveckor).

For the authoritative field list, required fields, and validation rules, see [04-DATA_CONTRACT.md](04-DATA_CONTRACT.md). Read that first if you need to know what fields exist. Read this if you need to understand why.

---

## 1. File Strategy

One YAML file per camp.

Location: `source/data/`

Examples:

- `source/data/2025-06-syssleback.yaml`
- `source/data/2025-08-syssleback.yaml`
- `source/data/2026-06-syssleback.yaml`

Each file is self-contained and independent.

---

## 2. Camp Structure

Each file must contain:

- Camp metadata
- Events list

Nothing else.

---

## 3. Camp Metadata

Required fields:

- `id`
- `name`
- `location`
- `start_date`
- `end_date`

Example:

```yaml
camp:
  id: 2025-08-syssleback
  name: SB Sommar Augusti 2025
  location: Sysslebäck
  start_date: 2025-08-03
  end_date: 2025-08-10
```

Dates must use ISO format (`YYYY-MM-DD`).

The camp `id` must remain stable permanently. It is used in archives and must never change after creation.

---

## 4. Event Structure

Required fields:

- `id`
- `title`
- `date`
- `start`
- `location`
- `responsible`

Optional fields:

- `end`
- `description`
- `link`
- `owner`
- `meta`

Dates must use ISO format (`YYYY-MM-DD`). Times must use 24-hour format (`HH:MM`).

Event IDs must be unique within the file. The recommended ID format (`slug-title-YYYY-MM-DD-HHMM`) naturally produces globally unique IDs, which is the preferred outcome.

Events must be chronologically sortable by `date` + `start`.

---

## 5. Ownership (Future-Proofing)

Ownership is not yet active functionality, but must be structurally supported from the beginning.

Each event contains an `owner` object:

```yaml
owner:
  name: ""
  email: ""
```

Initial state:

- Fields may be empty strings.
- Email is not yet used.
- Email is not publicly displayed.
- Ownership logic is not implemented.

This structure allows future:

- Self-editing functionality
- Token-based editing links
- Week-based session validation
- Ownership verification

Ownership design will be defined separately.

---

## 6. Metadata (System Fields)

Each event contains a `meta` object:

```yaml
meta:
  created_at: null
  updated_at: null
```

Format when populated: ISO datetime — `YYYY-MM-DDTHH:MM:SS`

Initial state:

- Fields may be `null`.
- Not required.
- Not publicly displayed.

Meta is for system integrity only.

---

## 7. Full Example

File: `source/data/2025-08-syssleback.yaml`

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

## 8. Stability Rules

The data model must:

- Remain stable across years
- Be readable by humans
- Be deterministic
- Be future-compatible
- Avoid breaking structural changes

Fields may be added in future versions. Fields must not be removed without a migration plan.

---

## 9. Core Principle

Event data is infrastructure.

It must survive:

- Design changes
- Generator changes
- Build changes
- AI regeneration

Structure first. Function later. Presentation never.
