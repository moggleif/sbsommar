'use strict';

// Tests for secret-file protection via web-server config and PHP env loading
// (§100, 02-§100.2 / 02-§100.4 / 02-§100.5).
//
// These are structural checks against committed files. The actual HTTP
// behaviour (a request for /api/.env returning 403) can only be confirmed on
// a live Apache/LiteSpeed host — see the manual checkpoints below.
//
// Manual checkpoints:
//   HTACC-M01: curl -sI https://sbsommar.se/api/.env  → first line is 403/404.
//   HTACC-M02: curl -sI https://qa.sbsommar.se/api/.env → first line is 403/404.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = (...p) => path.resolve(__dirname, '..', ...p);
const read = (rel) => fs.readFileSync(root(rel), 'utf8');

// A directive that denies access regardless of whether the file exists.
const DENY = /Require\s+all\s+denied/i;

describe('02-§100.4 — api/.htaccess denies dotfiles', () => {
  const src = read('api/.htaccess');

  it('HTACC-01: a deny directive is present', () => {
    assert.match(src, DENY, 'api/.htaccess must contain "Require all denied"');
  });

  it('HTACC-02: the dotfile pattern (^\\.) is denied', () => {
    // The deny must apply to every dotfile, not just .env, so .git, .htpasswd
    // etc. are also unreachable.
    const block = src.match(/<FilesMatch\s+"\^\\\."\s*>([\s\S]*?)<\/FilesMatch>/i);
    assert.ok(block, 'api/.htaccess must have a <FilesMatch "^\\."> block');
    assert.match(block[1], DENY, 'the dotfile FilesMatch block must deny access');
  });

  it('HTACC-03: the deny precedes the index.php rewrite', () => {
    const denyAt = src.search(DENY);
    const rewriteAt = src.search(/RewriteRule/i);
    assert.ok(denyAt !== -1 && rewriteAt !== -1, 'both deny and rewrite must exist');
    assert.ok(
      denyAt < rewriteAt,
      'the dotfile denial must come before the index.php RewriteRule',
    );
  });
});

describe('02-§100.5 — site-root .htaccess denies .env', () => {
  it('HTACC-04: source/static/.htaccess denies a file named .env', () => {
    const src = read('source/static/.htaccess');
    const block = src.match(/<Files\s+"\.env"\s*>([\s\S]*?)<\/Files>/i);
    assert.ok(block, 'source/static/.htaccess must have a <Files ".env"> block');
    assert.match(block[1], DENY, 'the .env Files block must deny access');
  });
});

describe('02-§100.2 — index.php loads .env from outside the web root', () => {
  const src = read('api/index.php');

  it('HTACC-05: the env directory is resolved as dirname(__DIR__, 2)', () => {
    assert.match(
      src,
      /dirname\(__DIR__,\s*2\)/,
      'index.php must resolve the env dir to the parent of public_html',
    );
  });

  it('HTACC-06: Dotenv is not loaded from __DIR__ (the web root)', () => {
    assert.doesNotMatch(
      src,
      /createImmutable\(__DIR__\)/,
      'index.php must not load .env from its own (web-served) directory',
    );
  });
});
