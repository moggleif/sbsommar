# SB Sommar – Operations Guide

This document describes how to operate the system before, during, and after a camp.

---

# Before Camp

1. Create new entry in /data/camps.yaml

Example:

```yaml
- id: 2026-06
  name: SB Sommar Juni 2026
  location: Sysslebäck
  start_date: 2026-06-28
  end_date: 2026-07-05
  file: current.yaml
  archived: false
  active: true
```

2. Ensure:
   - No other camp has active: true
   - current.yaml exists (can be empty initially)

3. Deploy.

The site now uses current.yaml.

---

# During Camp

All live updates happen in:

/data/current.yaml

You may:

- Edit manually
- Use admin interface (future)
- Upload via FTP

Important:

- current.yaml is NOT version controlled
- Make backups if necessary

---

# After Camp

1. Download current.yaml
2. Rename it to:

YYYY-MM-syssleback.yaml

3. Place it in /data/
4. Commit to Git
5. Update camps.yaml:

```yaml
   - file: YYYY-MM-syssleback.yaml
   - archived: true
   - active: false
```

6. Remove or clear current.yaml

The camp is now archived permanently.

---

# Rules

- Only one camp may be active at a time
- All camp files must follow EVENT_DATA_MODEL
- No manual editing of archived files after commit
- Do not version control current.yaml

---

# Disaster Recovery

If something goes wrong during camp:

- Restore from backup of current.yaml
- Or restore from server snapshot

After camp:

- Git history protects archived data
