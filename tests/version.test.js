'use strict';

// Tests for source/build/version.js — 02-§62.8, 02-§62.9, 02-§62.15, 02-§62.16, 02-§62.17.
//
// These verify:
//   - readVersionFile reads the VERSION file or falls back to '0.0' (VER-01..02)
//   - buildLocalVersion produces the correct format (VER-03..04)
//   - resolveVersionString picks the right source per environment (VER-05..08)

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { readVersionFile, buildLocalVersion, resolveVersionString } = require('../source/build/version');

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ver-test-'));
}

// ── readVersionFile ─────────────────────────────────────────────────────────

describe('readVersionFile (02-§62.1, 02-§62.17)', () => {
  it('VER-01: returns content of VERSION file', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    assert.strictEqual(readVersionFile(dir), '1.0');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-02: returns "0.0" when VERSION file is missing', () => {
    const dir = makeTmpDir();
    assert.strictEqual(readVersionFile(dir), '0.0');
    fs.rmSync(dir, { recursive: true });
  });
});

// ── buildLocalVersion ───────────────────────────────────────────────────────

describe('buildLocalVersion (02-§62.8)', () => {
  it('VER-03: includes the base version and "Lokal"', () => {
    const result = buildLocalVersion('1.0');
    assert.ok(result.startsWith('1.0'), 'Expected version to start with base version');
    assert.ok(result.includes('Lokal'), 'Expected "Lokal" in local version string');
  });

  it('VER-04: includes a date in YYYY-MM-DD format', () => {
    const result = buildLocalVersion('2.5');
    assert.match(result, /\d{4}-\d{2}-\d{2}/, 'Expected date in YYYY-MM-DD format');
  });
});

// ── resolveVersionString ────────────────────────────────────────────────────

describe('resolveVersionString (02-§62.9, 02-§62.15, 02-§62.16)', () => {
  it('VER-05: returns BUILD_VERSION directly when set', () => {
    const dir = makeTmpDir();
    const env = { BUILD_VERSION: '1.0.4' };
    assert.strictEqual(resolveVersionString(env, dir), '1.0.4');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-06: returns null in CI without BUILD_VERSION (event-data deploy)', () => {
    const dir = makeTmpDir();
    const env = { GITHUB_ACTIONS: 'true', BUILD_ENV: 'production' };
    assert.strictEqual(resolveVersionString(env, dir), null);
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-07: returns local timestamp string when no env vars set', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    const env = {};
    const result = resolveVersionString(env, dir);
    assert.ok(result.startsWith('1.0'), 'Expected base version');
    assert.ok(result.includes('Lokal'), 'Expected "Lokal" for local dev');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-08: returns local version even when BUILD_ENV is set locally', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    const env = { BUILD_ENV: 'production' };
    const result = resolveVersionString(env, dir);
    assert.ok(result.includes('Lokal'), 'Expected local version when not in CI');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-09: returns null for QA CI without BUILD_VERSION', () => {
    const dir = makeTmpDir();
    const env = { GITHUB_ACTIONS: 'true', BUILD_ENV: 'qa' };
    assert.strictEqual(resolveVersionString(env, dir), null);
    fs.rmSync(dir, { recursive: true });
  });
});
