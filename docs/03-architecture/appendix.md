# SB Sommar – Architecture: Appendix

Trailing sections from the original architecture document: decisions deliberately rejected, and the design philosophy that frames the system. Both `§10` and `§11` here are out of numerical order with the rest of the document and `§11` is a duplicate heading (the other `§11` is "Event Data CI Pipeline" in [`ci-and-deploy.md`](./ci-and-deploy.md)). These irregularities are preserved as-is — the section IDs are stable strings, not encoded positions.

Part of [the architecture index](./index.md).

---

## 10. Decided Against

Decisions evaluated and deliberately rejected. Kept here so they are not re-proposed.

| Decision | Reason | Date |
| --- | --- | --- |
| CSS/JS minification | Total CSS+JS is ~22 KB; server gzips text assets, so actual transfer savings would be ~3–5 KB. Images (~1.7 MB) are the real payload. Build complexity not justified. | 2026-02 |

---

## 11. Design Philosophy

- YAML is the database
- Git is the archive
- Simplicity over cleverness
- One clear data contract
- No hidden state

The system must remain:

- Predictable
- Minimal
- Maintainable
