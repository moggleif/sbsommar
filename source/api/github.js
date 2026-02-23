'use strict';

const https = require('https');
const yaml  = require('js-yaml');

const MAX_RETRIES  = 3;
const CAMPS_PATH   = 'source/data/camps.yaml';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

// Wrap a YAML scalar in single quotes only when necessary.
function yamlScalar(val) {
  if (val === null || val === undefined) return 'null';
  const s = String(val);
  if (!s) return "''";
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /^[\s"'0-9]/.test(s) || s !== s.trim()) {
    return "'" + s.replace(/'/g, "''") + "'";
  }
  return s;
}

// Serialise a single event as a YAML block ready to append.
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

// ── GitHub API primitives ────────────────────────────────────────────────────

function env(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

// Make a single HTTPS request to the GitHub Contents API.
// Returns Promise<{ status: number, data: object }>.
function githubRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept':        'application/vnd.github+json',
        'User-Agent':    'sbsommar-api/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(payload ? {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let data = null;
        try { data = JSON.parse(raw); } catch { /* non-JSON body, ignore */ }
        if (res.statusCode >= 400) {
          const err = new Error(`GitHub API ${res.statusCode}: ${data && data.message || raw}`);
          err.status = res.statusCode;
          return reject(err);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Fetch a file from the repo. Returns { content: string, sha: string }.
async function getFile(filePath) {
  const owner  = env('GITHUB_OWNER');
  const repo   = env('GITHUB_REPO');
  const branch = env('GITHUB_BRANCH');
  const token  = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const { data } = await githubRequest('GET', apiPath, null, token);

  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

// Commit an updated file. Throws with err.status === 409 on SHA conflict.
async function putFile(filePath, content, sha, message) {
  const owner  = env('GITHUB_OWNER');
  const repo   = env('GITHUB_REPO');
  const branch = env('GITHUB_BRANCH');
  const token  = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}`;
  await githubRequest('PUT', apiPath, {
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch,
  }, token);
}

// ── Public API ───────────────────────────────────────────────────────────────

// Appends a new event to the active camp's per-camp YAML file via GitHub commit.
// Retries up to MAX_RETRIES times on SHA conflict (409).
async function addEventToActiveCamp(body) {
  const title       = body.title.trim();
  const date        = body.date.trim();
  const start       = body.start.trim();
  const end         = body.end.trim();
  const location    = body.location.trim();
  const responsible = body.responsible.trim();
  const description = typeof body.description === 'string' ? body.description.trim() || null : null;
  const link        = typeof body.link        === 'string' ? body.link.trim()        || null : null;
  const ownerName   = typeof body.ownerName   === 'string' ? body.ownerName.trim()          : '';

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const event = {
    id:          `${slugify(title)}-${date}-${start.replace(':', '')}`,
    title, date, start, end, location, responsible, description, link,
    owner:       { name: ownerName, email: '' },
    meta:        { created_at: now, updated_at: now },
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Step 1: resolve active camp → per-camp file path
    const { content: campsYaml } = await getFile(CAMPS_PATH);
    const campsData = yaml.load(campsYaml);
    const activeCamps = (campsData.camps || []).filter((c) => c.active === true);

    if (activeCamps.length === 0) throw new Error('No active camp found');
    if (activeCamps.length > 1)  throw new Error('Multiple active camps found');

    const camp         = activeCamps[0];
    const campFilePath = `source/data/${camp.file}`;

    // Step 2: fetch current camp file + SHA
    const { content: campContent, sha } = await getFile(campFilePath);

    // Step 3: append event block
    const newContent   = campContent.trimEnd() + '\n' + buildEventYaml(event) + '\n';
    const commitMsg    = `Add event to ${camp.name}: ${title} (${date})`;

    // Step 4: commit — retry on SHA conflict
    try {
      await putFile(campFilePath, newContent, sha, commitMsg);
      return; // success
    } catch (err) {
      if (err.status === 409 && attempt < MAX_RETRIES - 1) {
        // SHA mismatch: another commit landed between our GET and PUT — retry
        continue;
      }
      throw err;
    }
  }

  throw new Error(`SHA conflict: failed to commit after ${MAX_RETRIES} attempts`);
}

module.exports = { addEventToActiveCamp };
