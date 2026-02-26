'use strict';

// Validates camps.yaml and syncs camp headers to per-camp event files.
//
// Usage (CLI):  node source/scripts/validate-camps.js
// Usage (API):  const { validateCamps } = require('./validate-camps')
//               const result = validateCamps(campsArray, filesMap)
//
// The filesMap parameter is a plain object keyed by filename. Each value is
// a YAML string. When a file is missing, the validator creates it in the map.
// When a file's camp header differs from camps.yaml, the validator rewrites it.
//
// CLI mode reads/writes real files in source/data/.
// Exits 0 on success, 1 on any validation failure.

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_FIELDS = ['id', 'name', 'start_date', 'end_date', 'opens_for_editing', 'location', 'file', 'archived'];
const CAMP_HEADER_FIELDS = ['id', 'name', 'location', 'start_date', 'end_date'];

// ── Core validation and sync ────────────────────────────────────────────────

function validateCamps(camps, files) {
  const errors = [];
  const log = [];

  if (!Array.isArray(camps)) {
    return { ok: false, errors: ['camps must be an array'], log };
  }

  const seenIds = new Set();
  const seenFiles = new Set();

  for (const camp of camps) {
    const ref = `camp "${camp.id || 'UNKNOWN'}"`;

    // ── Required fields (02-§37.1) ────────────────────────────────────────
    for (const field of REQUIRED_FIELDS) {
      if (camp[field] === undefined || camp[field] === null || camp[field] === '') {
        if (field === 'archived' && camp[field] === false) continue;
        errors.push(`${ref}: required field "${field}" is missing or empty`);
      }
    }

    // ── Date format (02-§37.2) ────────────────────────────────────────────
    for (const dateField of ['start_date', 'end_date', 'opens_for_editing']) {
      const val = camp[dateField];
      if (val !== undefined && val !== null && val !== '') {
        const str = String(val);
        if (!DATE_RE.test(str)) {
          errors.push(`${ref}: ${dateField} must be YYYY-MM-DD, got "${str}"`);
        }
      }
    }

    // ── end_date >= start_date (02-§37.3) ─────────────────────────────────
    const startStr = String(camp.start_date || '');
    const endStr = String(camp.end_date || '');
    if (DATE_RE.test(startStr) && DATE_RE.test(endStr) && endStr < startStr) {
      errors.push(`${ref}: end_date (${endStr}) must be on or after start_date (${startStr})`);
    }

    // ── archived is boolean (02-§37.4) ────────────────────────────────────
    if (camp.archived !== undefined && camp.archived !== null && camp.archived !== '') {
      if (typeof camp.archived !== 'boolean') {
        errors.push(`${ref}: archived must be a boolean, got "${typeof camp.archived}"`);
      }
    }

    // ── qa is optional boolean (02-§42.27) ────────────────────────────────
    if (camp.qa !== undefined && camp.qa !== null) {
      if (typeof camp.qa !== 'boolean') {
        errors.push(`${ref}: qa must be a boolean, got "${typeof camp.qa}"`);
      }
    }

    // ── Unique id (02-§37.5) ──────────────────────────────────────────────
    if (camp.id) {
      if (seenIds.has(camp.id)) {
        errors.push(`${ref}: duplicate id "${camp.id}"`);
      }
      seenIds.add(camp.id);
    }

    // ── Unique file (02-§37.6) ────────────────────────────────────────────
    if (camp.file) {
      if (seenFiles.has(camp.file)) {
        errors.push(`${ref}: duplicate file "${camp.file}"`);
      }
      seenFiles.add(camp.file);
    }
  }

  // ── Stop here if validation errors found (02-§37.7) ─────────────────────
  if (errors.length > 0) {
    return { ok: false, errors, log };
  }

  // ── File creation and sync (02-§37.8–36.15) ────────────────────────────
  if (files) {
    for (const camp of camps) {
      const filename = camp.file;
      if (!filename) continue;

      if (!(filename in files)) {
        // Create new file (02-§37.8, 02-§37.9, 02-§37.10, 02-§37.11)
        files[filename] = serializeCampFile(camp, []);
        log.push(`Created ${filename}`);
      } else {
        // Check and sync header (02-§37.13, 02-§37.14, 02-§37.15)
        const existing = files[filename];
        let data;
        try {
          data = yaml.load(existing);
        } catch {
          log.push(`WARNING: Could not parse ${filename}, skipping sync`);
          continue;
        }

        if (!data || !data.camp) {
          log.push(`WARNING: ${filename} has no camp header, skipping sync`);
          continue;
        }

        // Compare header fields (values)
        const valuesDiffer = CAMP_HEADER_FIELDS.some(field => {
          return String(data.camp[field] || '') !== String(camp[field] || '');
        });

        // Check field order (02-§37.15) by comparing key positions
        const existingKeys = Object.keys(data.camp);
        const headerKeys = CAMP_HEADER_FIELDS.filter(k => k in data.camp);
        const orderCorrect = headerKeys.every((key, i) => existingKeys.indexOf(key) === i);

        const needsSync = valuesDiffer || !orderCorrect;

        if (needsSync) {
          const events = data.events || [];
          files[filename] = serializeCampFile(camp, events);
          log.push(`Synced ${filename} header to match camps.yaml`);
        }
      }
    }
  }

  return { ok: true, errors: [], log };
}

// ── YAML serialisation ──────────────────────────────────────────────────────

// Produces a camp file YAML string with correct field order (02-§37.11).
function serializeCampFile(camp, events) {
  const campHeader = {
    id: camp.id,
    name: camp.name,
    location: camp.location,
    start_date: camp.start_date,
    end_date: camp.end_date,
  };

  // Build the camp section with explicit string quoting for dates.
  const campYaml = yaml.dump({ camp: campHeader }, {
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: false,
    sortKeys: false,
    noCompatMode: true,
  });

  // For dates, js-yaml may not quote them consistently. Force quote date values.
  const campYamlFixed = campYaml
    .replace(/start_date: (\d{4}-\d{2}-\d{2})$/m, "start_date: '$1'")
    .replace(/end_date: (\d{4}-\d{2}-\d{2})$/m, "end_date: '$1'");

  // Build events section
  let eventsYaml;
  if (!events || events.length === 0) {
    eventsYaml = 'events: []\n';
  } else {
    eventsYaml = yaml.dump({ events }, {
      lineWidth: -1,
      quotingType: "'",
      forceQuotes: false,
      sortKeys: false,
      noCompatMode: true,
    });
    // Force-quote date and time values in events
    eventsYaml = eventsYaml
      .replace(/(\s+date: )(\d{4}-\d{2}-\d{2})$/gm, "$1'$2'")
      .replace(/(\s+start: )(\d{2}:\d{2})$/gm, "$1'$2'")
      .replace(/(\s+end: )(\d{2}:\d{2})$/gm, "$1'$2'")
      .replace(/(\s+created_at: )(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})$/gm, "$1'$2'")
      .replace(/(\s+updated_at: )(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})$/gm, "$1'$2'");
  }

  return campYamlFixed + eventsYaml;
}

module.exports = { validateCamps };

// ── CLI entry point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const DATA_DIR = path.join(__dirname, '..', 'data');
  const campsFile = path.join(DATA_DIR, 'camps.yaml');

  if (!fs.existsSync(campsFile)) {
    console.error('ERROR: source/data/camps.yaml not found');
    process.exit(1);
  }

  const campsData = yaml.load(fs.readFileSync(campsFile, 'utf8'));
  const camps = campsData.camps;

  if (!Array.isArray(camps)) {
    console.error('ERROR: camps.yaml does not contain a camps array');
    process.exit(1);
  }

  // Build files map from disk
  const files = {};
  for (const camp of camps) {
    if (!camp.file) continue;
    const filePath = path.join(DATA_DIR, camp.file);
    if (fs.existsSync(filePath)) {
      files[camp.file] = fs.readFileSync(filePath, 'utf8');
    }
  }

  const result = validateCamps(camps, files);

  // Print log messages
  for (const msg of result.log) {
    console.log(msg);
  }

  if (!result.ok) {
    for (const err of result.errors) {
      console.error(`ERROR: ${err}`);
    }
    process.exit(1);
  }

  // Write back any created or synced files
  for (const camp of camps) {
    if (!camp.file) continue;
    if (camp.file in files) {
      const filePath = path.join(DATA_DIR, camp.file);
      const diskContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
      if (diskContent !== files[camp.file]) {
        fs.writeFileSync(filePath, files[camp.file], 'utf8');
        console.log(`Wrote ${filePath}`);
      }
    }
  }

  console.log(`OK: ${camps.length} camps validated`);
}
