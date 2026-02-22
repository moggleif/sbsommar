# SB Sommar – Architecture Overview

This project is a static, YAML-driven camp platform.

The system is intentionally simple:
- No database
- No CMS
- No backend dependency for rendering
- Git is the archive

---

## 1. Data Layer

Each camp has exactly one YAML file:

/data/2025-06-syssleback.yaml
/data/2025-08-syssleback.yaml

These files contain:
- Camp metadata (name, dates, location)
- A list of events
- Each event is unique on (title + date + start)

This is the single source of truth for camp content.

---

## 2. Metadata Layer

/data/camps.yaml defines all camps.

It contains:
- All historical camps
- Their date ranges
- Which file contains their events
- Which camp is currently active

Example:

camps:
  - id: 2026-06
    name: SB Sommar Juni 2026
    start_date: 2026-06-28
    end_date: 2026-07-05
    file: current.yaml
    archived: false
    active: true

The site never hardcodes file names.
It always reads from camps.yaml.

---

## 3. Live Layer

During camp week:

/data/current.yaml

This file:
- Has the exact same structure as archived camp files
- Is NOT version controlled
- Is excluded via .gitignore
- Is the only file updated live

The system loads the camp where active: true
and reads its file.

---

## 4. Archive Layer

After camp:

1. Rename current.yaml → YYYY-MM.yaml
2. Commit to Git
3. Update camps.yaml
   - archived: true
   - active: false
   - file: YYYY-MM.yaml

Git becomes the permanent archive.

No data is ever lost.

---

## 5. Rendering Logic

Rendering is simple:

1. Load camps.yaml
2. Find camp where active: true
3. Load its file
4. Render events

If no camp is active:
- Show archive view
- Or show latest archived camp

---

## 6. Design Philosophy

- YAML is the database
- Git is the archive
- Simplicity over cleverness
- AI-friendly structure
- One clear data contract
- No hidden state

The system must remain:
- Predictable
- Minimal
- Maintainable
