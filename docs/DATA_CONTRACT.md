# SB Sommar – Data Contract

This document defines the official data structure for all camp YAML files.

This contract must not change casually.
Rendering logic depends on it.

---

# 1. Camp File Structure

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

# 2. Required Fields

## Required on camp level

- id
- name
- start_date
- end_date

## Required on event level

- id
- title
- date
- start
- location
- responsible

Optional:

- end
- description
- link
- owner
- meta

---

# 3. Date & Time Rules

- `date` must be within camp start_date and end_date.
- `start` must be in 24h format: "HH:MM".
- `end` must be null or "HH:MM".
- No timezone handling.

---

# 4. Uniqueness Rule

The combination of:

(title + date + start)

MUST be unique within a camp file.

Duplicate events are not allowed.

---

# 5. Event ID Rules

- Must be unique within file.
- Recommended format:

slug-title-YYYY-MM-DD-HHMM

Example:

middag-2025-06-30-1630

---

# 6. Live File Rules (current.yaml)

- Must follow exact same structure.
- Must not contain experimental fields.
- Must be compatible with archive files.

---

# 7. Stability Policy

Breaking changes to this structure require:

- Explicit version bump
- Update of rendering logic
- Update of DATA_CONTRACT.md

This contract is the foundation of the system.
