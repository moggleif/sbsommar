'use strict';

const https = require('https');
const yaml  = require('js-yaml');
const { patchEventInYaml } = require('./edit-event');

const CAMPS_PATH = 'source/data/camps.yaml';

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

// Commit an updated file to a specific branch.
async function putFile(filePath, content, sha, message, branch) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}`;
  await githubRequest('PUT', apiPath, {
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch,
  }, token);
}

// Return the latest commit SHA on the configured main branch.
async function getMainSha() {
  const owner  = env('GITHUB_OWNER');
  const repo   = env('GITHUB_REPO');
  const branch = env('GITHUB_BRANCH');
  const token  = env('GITHUB_TOKEN');

  const { data } = await githubRequest('GET', `/repos/${owner}/${repo}/git/refs/heads/${branch}`, null, token);
  return data.object.sha;
}

// Create a new branch pointing at the given commit SHA.
async function createBranch(name, sha) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  await githubRequest('POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${name}`,
    sha,
  }, token);
}

// Open a pull request from head into the configured main branch.
// Returns { number, node_id } — node_id is required for GraphQL auto-merge.
async function createPullRequest(title, head, body) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const base  = env('GITHUB_BRANCH');
  const token = env('GITHUB_TOKEN');

  const { data } = await githubRequest('POST', `/repos/${owner}/${repo}/pulls`, {
    title,
    head,
    base,
    body: body || 'Automatically generated by the SB Sommar API.',
  }, token);

  return { number: data.number, node_id: data.node_id };
}

// Enable squash auto-merge on a pull request via the GraphQL API.
// GraphQL errors arrive as HTTP 200 with a body-level errors array — must be checked explicitly.
async function enableAutoMerge(nodeId) {
  const token = env('GITHUB_TOKEN');

  const query = `
    mutation($id: ID!) {
      enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) {
        pullRequest { number }
      }
    }
  `;

  const { data } = await githubRequest('POST', '/graphql', {
    query,
    variables: { id: nodeId },
  }, token);

  if (data && data.errors && data.errors.length > 0) {
    throw new Error(`GraphQL error enabling auto-merge: ${data.errors[0].message}`);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

// Appends a new event to the active camp's per-camp YAML file.
// Creates an ephemeral branch, commits to it, opens a PR, and enables auto-merge.
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

  // Step 1: resolve active camp from main
  const { content: campsYaml } = await getFile(CAMPS_PATH);
  const campsData = yaml.load(campsYaml);
  const activeCamps = (campsData.camps || []).filter((c) => c.active === true);

  if (activeCamps.length === 0) throw new Error('No active camp found');
  if (activeCamps.length > 1)  throw new Error('Multiple active camps found');

  const camp         = activeCamps[0];
  const campFilePath = `source/data/${camp.file}`;

  // Step 2: fetch camp file + SHA (reads from main via GITHUB_BRANCH)
  const { content: campContent, sha: fileSha } = await getFile(campFilePath);

  // Step 3: build new file content
  const newContent = campContent.trimEnd() + '\n' + buildEventYaml(event) + '\n';
  const commitMsg  = `Add event to ${camp.name}: ${title} (${date})`;

  // Step 4: create ephemeral branch from current main HEAD
  const mainSha    = await getMainSha();
  const branchName = `event/${date}-${slugify(title)}-${Date.now()}`;
  await createBranch(branchName, mainSha);

  // Step 5: commit to ephemeral branch (SHA conflict impossible on a fresh branch)
  await putFile(campFilePath, newContent, fileSha, commitMsg, branchName);

  // Step 6: open PR and enable auto-merge
  const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar add-event API.');
  await enableAutoMerge(pr.node_id);
}

// Finds an event by ID in the active camp's YAML file and replaces its
// mutable fields.  Uses the same ephemeral-branch + PR + auto-merge
// pipeline as addEventToActiveCamp.
async function updateEventInActiveCamp(eventId, updates) {
  // Step 1: resolve active camp
  const { content: campsYaml } = await getFile(CAMPS_PATH);
  const campsData = yaml.load(campsYaml);
  const activeCamps = (campsData.camps || []).filter((c) => c.active === true);

  if (activeCamps.length === 0) throw new Error('No active camp found');
  if (activeCamps.length > 1)  throw new Error('Multiple active camps found');

  const camp         = activeCamps[0];
  const campFilePath = `source/data/${camp.file}`;

  // Step 2: fetch camp file
  const { content: campContent, sha: fileSha } = await getFile(campFilePath);

  // Step 3: patch the event in the YAML string
  const newContent = patchEventInYaml(campContent, eventId, updates);
  if (newContent === null) throw new Error(`Event not found: ${eventId}`);

  const commitMsg  = `Edit event in ${camp.name}: ${eventId}`;

  // Step 4: ephemeral branch → commit → PR → auto-merge
  const mainSha    = await getMainSha();
  const branchName = `event-edit/${eventId}-${Date.now()}`;
  await createBranch(branchName, mainSha);
  await putFile(campFilePath, newContent, fileSha, commitMsg, branchName);
  const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar edit-event API.');
  await enableAutoMerge(pr.node_id);
}

module.exports = { addEventToActiveCamp, updateEventInActiveCamp, slugify, yamlScalar, buildEventYaml };
