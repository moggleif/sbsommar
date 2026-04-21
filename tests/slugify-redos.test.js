'use strict';

// Tests for slugify() ReDoS safety and output stability (02-§95.1, 02-§95.2).
//
// The old implementation used two separate trim passes (`/^-+/` then
// `/-+$/`) where the trailing pass can backtrack polynomially on
// `-`-heavy inputs. The fixed implementation combines both trims into a
// single linear-time pass and must produce bit-for-bit identical output
// for every input.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { slugify } = require('../source/api/github.js');

// Baseline reference implementation that mirrors the documented output
// contract of slugify(). Used to prove output equivalence.
function referenceSlug(str) {
  return String(str)
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 48);
}

describe('02-§95.1 — slugify runs in linear time (SLUG-RD-01..02)', () => {
  it('SLUG-RD-01: pathological dash-heavy input returns under 50 ms', () => {
    const pathological = '-'.repeat(100_000);
    const start = process.hrtime.bigint();
    const out = slugify(pathological);
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    assert.equal(out, '');
    assert.ok(
      durationMs < 50,
      `slugify(${pathological.length} dashes) took ${durationMs.toFixed(2)}ms — expected < 50ms`,
    );
  });

  it('SLUG-RD-02: mixed dash/alphanum pathological input returns under 50 ms', () => {
    const mixed = ('a' + '-'.repeat(1000)).repeat(100);
    const start = process.hrtime.bigint();
    slugify(mixed);
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    assert.ok(
      durationMs < 50,
      `slugify mixed-pathological took ${durationMs.toFixed(2)}ms — expected < 50ms`,
    );
  });
});

describe('02-§95.2 — slugify output matches reference for every input (SLUG-RD-03..12)', () => {
  const cases = [
    ['Frukost',              'frukost'],
    ['Å och Ö',              'a-och-o'],
    ['Grillkväll vid sjön',  'grillkvall-vid-sjon'],
    ['---trim-leading',      'trim-leading'],
    ['trim-trailing---',     'trim-trailing'],
    ['---both-ends---',      'both-ends'],
    ['',                     ''],
    ['!!!???!!!',            ''],
    ['multiple   spaces',    'multiple-spaces'],
    ['abc'.repeat(40),       'abc'.repeat(40).slice(0, 48)],
  ];

  cases.forEach(([input, expected], i) => {
    const id = `SLUG-RD-${String(i + 3).padStart(2, '0')}`;
    it(`${id}: ${JSON.stringify(input).slice(0, 40)} → ${JSON.stringify(expected)}`, () => {
      assert.equal(slugify(input), expected);
      assert.equal(slugify(input), referenceSlug(input));
    });
  });

  it('SLUG-RD-13: output never exceeds 48 characters', () => {
    const longInput = 'a'.repeat(1000);
    assert.ok(slugify(longInput).length <= 48);
  });

  it('SLUG-RD-14: output contains no leading or trailing dash', () => {
    const inputs = ['-foo', 'foo-', '-foo-', '--foo--bar--', '  hej  '];
    for (const input of inputs) {
      const out = slugify(input);
      assert.ok(!out.startsWith('-'), `leading dash in output for ${JSON.stringify(input)}`);
      assert.ok(!out.endsWith('-'), `trailing dash in output for ${JSON.stringify(input)}`);
    }
  });
});
