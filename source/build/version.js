'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Reads the VERSION file from the project root.
 * Returns the trimmed content, or '0.0' if the file is missing.
 *
 * @param {string} rootDir - Absolute path to the project root
 * @returns {string} e.g. '1.0'
 */
function readVersionFile(rootDir) {
  const versionPath = path.join(rootDir, 'VERSION');
  if (!fs.existsSync(versionPath)) return '0.0';
  return fs.readFileSync(versionPath, 'utf8').trim();
}

/**
 * Builds a local-dev version string: "1.0 – Lokal YYYY-MM-DD HH:MM"
 * The date/time is in Europe/Stockholm time.
 *
 * @param {string} baseVersion - e.g. '1.0'
 * @returns {string}
 */
function buildLocalVersion(baseVersion) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const timeStr = now.toLocaleTimeString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${baseVersion} \u2013 Lokal ${dateStr} ${timeStr}`;
}

/**
 * Returns the version string to embed in the footer, or null if none
 * should be shown.
 *
 * Logic:
 *   - If BUILD_VERSION is set: use it directly (set by CI for prod/QA).
 *   - If running in CI (GITHUB_ACTIONS is set) without BUILD_VERSION:
 *     return null (event-data deploy — no misleading version).
 *   - Otherwise (local dev): build a local timestamp version.
 *     Local .env may set BUILD_ENV for testing, but that should not
 *     suppress the version — only real CI runs should.
 *
 * @param {object} env - process.env or a mock
 * @param {string} rootDir - project root for reading VERSION
 * @returns {string|null}
 */
function resolveVersionString(env, rootDir) {
  if (env.BUILD_VERSION) return env.BUILD_VERSION;
  if (env.GITHUB_ACTIONS) return null;
  return buildLocalVersion(readVersionFile(rootDir));
}

module.exports = { readVersionFile, buildLocalVersion, resolveVersionString };
