'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ROOT_DIR = path.join(__dirname, '..', '..');

function toDateString(val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function getActiveCampFile() {
  const campsFile = path.join(DATA_DIR, 'camps.yaml');
  const campsData = yaml.load(fs.readFileSync(campsFile, 'utf8'));
  const camps = campsData.camps;

  let active = camps.find((c) => c.active === true);
  if (!active) {
    const sorted = [...camps].sort((a, b) =>
      toDateString(b.start_date).localeCompare(toDateString(a.start_date)),
    );
    active = sorted[0];
  }
  return path.join(DATA_DIR, active.file);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

// Wrap a YAML scalar value in single quotes if it needs quoting.
function yamlScalar(val) {
  if (!val) return 'null';
  const s = String(val);
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /^[\s"'0-9]/.test(s) || s !== s.trim()) {
    return "'" + s.replace(/'/g, "''") + "'";
  }
  return s;
}

function buildEventYaml(event) {
  const lines = [
    `- id: ${event.id}`,
    `  title: ${yamlScalar(event.title)}`,
    `  date: '${event.date}'`,
    `  start: '${event.start}'`,
    `  end: '${event.end}'`,
    `  location: ${yamlScalar(event.location)}`,
    `  responsible: ${yamlScalar(event.responsible)}`,
  ];

  if (event.description) {
    lines.push('  description: |');
    event.description.split('\n').forEach((l) => lines.push(`    ${l}`));
  } else {
    lines.push('  description: null');
  }

  lines.push(`  link: ${event.link ? yamlScalar(event.link) : 'null'}`);
  lines.push('  owner:');
  lines.push(`    name: '${(event.owner.name || '').replace(/'/g, "''")}'`);
  lines.push("    email: ''");
  lines.push('  meta:');
  lines.push(`    created_at: ${event.meta.created_at}`);
  lines.push(`    updated_at: ${event.meta.updated_at}`);

  return lines.join('\n');
}

async function handleAddEvent(body, res) {
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const title       = String(body.title || '').trim();
  const date        = String(body.date || '').trim();
  const start       = String(body.start || '').trim();
  const end         = String(body.end || '').trim();
  const location    = String(body.location || '').trim();
  const responsible = String(body.responsible || '').trim();
  const description = String(body.description || '').trim() || null;
  const link        = String(body.link || '').trim() || null;
  const ownerName   = String(body.ownerName || '').trim();

  const errors = [];
  if (!title)       errors.push('Rubrik är obligatoriskt.');
  if (!date)        errors.push('Datum är obligatoriskt.');
  if (!start)       errors.push('Starttid är obligatorisk.');
  if (!end)         errors.push('Sluttid är obligatorisk.');
  else if (end <= start) errors.push('Sluttid måste vara efter starttid.');
  if (!location)    errors.push('Plats är obligatoriskt.');
  if (!responsible) errors.push('Ansvarig är obligatoriskt.');

  if (errors.length) return send(400, { errors });

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const event = {
    id:          `${slugify(title)}-${date}-${start.replace(':', '')}`,
    title, date, start, end, location, responsible, description, link,
    owner:       { name: ownerName, email: '' },
    meta:        { created_at: now, updated_at: now },
  };

  try {
    const campFilePath = getActiveCampFile();
    fs.appendFileSync(campFilePath, '\n' + buildEventYaml(event) + '\n');
    execSync('node source/build/build.js', { cwd: ROOT_DIR });
    send(200, { ok: true, id: event.id, title: event.title });
  } catch (err) {
    console.error('Failed to save event:', err);
    send(500, { errors: ['Kunde inte spara aktiviteten. Försök igen.'] });
  }
}

module.exports = { handleAddEvent };
