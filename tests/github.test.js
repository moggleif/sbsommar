'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { slugify, yamlScalar, buildEventYaml } = require('../source/api/github');

// ── slugify ───────────────────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases ASCII text', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  it('replaces å and ä with a', () => {
    assert.strictEqual(slugify('åäng'), 'aang');
  });

  it('replaces ö with o', () => {
    assert.strictEqual(slugify('öppen'), 'oppen');
  });

  it('handles a typical Swedish event title', () => {
    assert.strictEqual(slugify('Välkommen till lägret'), 'valkommen-till-lagret');
  });

  it('collapses multiple non-alphanumeric chars into a single hyphen', () => {
    assert.strictEqual(slugify('a  --  b'), 'a-b');
  });

  it('removes leading and trailing hyphens', () => {
    assert.strictEqual(slugify('  hello  '), 'hello');
  });

  it('removes all special characters', () => {
    assert.strictEqual(slugify('C# & D!'), 'c-d');
  });

  it('caps output at 48 characters', () => {
    const long = 'a'.repeat(100);
    assert.strictEqual(slugify(long).length, 48);
  });

  it('does not exceed 48 chars with Swedish chars that expand', () => {
    // å → a (no length change), so this just verifies the cap
    const result = slugify('å'.repeat(60));
    assert.ok(result.length <= 48, `Length ${result.length} exceeds 48`);
  });

  it('returns empty string for all-special input', () => {
    assert.strictEqual(slugify('!!! ???'), '');
  });

  it('handles numbers', () => {
    assert.strictEqual(slugify('Event 2026'), 'event-2026');
  });
});

// ── yamlScalar ────────────────────────────────────────────────────────────────

describe('yamlScalar', () => {
  it('returns null for null input', () => {
    assert.strictEqual(yamlScalar(null), 'null');
  });

  it('returns null for undefined input', () => {
    assert.strictEqual(yamlScalar(undefined), 'null');
  });

  it("returns '' for empty string", () => {
    assert.strictEqual(yamlScalar(''), "''");
  });

  it('returns plain text unchanged for safe strings', () => {
    assert.strictEqual(yamlScalar('Hello world'), 'Hello world');
  });

  it('quotes strings containing a colon', () => {
    const r = yamlScalar('key: value');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.endsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes('key: value'), `Expected content preserved, got: ${r}`);
  });

  it('quotes strings containing a hash', () => {
    const r = yamlScalar('value # comment');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings starting with a digit', () => {
    const r = yamlScalar('1 Laget');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings with leading whitespace', () => {
    const r = yamlScalar(' leading');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings with trailing whitespace', () => {
    const r = yamlScalar('trailing ');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it("escapes embedded single quotes by doubling them (when string requires quoting)", () => {
    // Strings that contain ':' get quoted; any ' inside must be doubled.
    const r = yamlScalar("key: it's value");
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes("''"), `Expected doubled single quote, got: ${r}`);
  });

  it("quotes and escapes a string that starts with a single quote", () => {
    // Starts with ' → matches /^[\s"'0-9]/ → gets quoted, inner ' doubled
    const r = yamlScalar("'hello'");
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes("''hello''"), `Expected doubled quotes around content, got: ${r}`);
  });

  it('quotes strings starting with double-quote character', () => {
    const r = yamlScalar('"quoted"');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });
});

// ── buildEventYaml ────────────────────────────────────────────────────────────

describe('buildEventYaml', () => {
  function baseEvent(overrides = {}) {
    return {
      id: 'frukost-2025-06-22-0800',
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
      description: null,
      link: null,
      owner: { name: 'Anna Andersson', email: '' },
      meta: { created_at: '2025-06-22 07:00', updated_at: '2025-06-22 07:00' },
      ...overrides,
    };
  }

  it('starts with the event id as the YAML list item', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.startsWith('- id: frukost-2025-06-22-0800'), `Got: ${yaml}`);
  });

  it('includes title field', () => {
    const yaml = buildEventYaml(baseEvent({ title: 'Frukost' }));
    assert.ok(yaml.includes('title: Frukost'), `Got: ${yaml}`);
  });

  it('includes date, start, end as quoted strings', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes("date: '2025-06-22'"), `Got: ${yaml}`);
    assert.ok(yaml.includes("start: '08:00'"), `Got: ${yaml}`);
    assert.ok(yaml.includes("end: '09:00'"), `Got: ${yaml}`);
  });

  it('includes location and responsible', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('location: Matsalen'), `Got: ${yaml}`);
    assert.ok(yaml.includes('responsible: Alla'), `Got: ${yaml}`);
  });

  it('writes description: null when description is null', () => {
    const yaml = buildEventYaml(baseEvent({ description: null }));
    assert.ok(yaml.includes('description: null'), `Got: ${yaml}`);
  });

  it('writes description as a literal block scalar (|) when present', () => {
    const yaml = buildEventYaml(baseEvent({ description: 'Kom hungrig.' }));
    assert.ok(yaml.includes('description: |'), `Got: ${yaml}`);
    assert.ok(yaml.includes('Kom hungrig.'), `Got: ${yaml}`);
  });

  it('indents each description line by 4 spaces', () => {
    const yaml = buildEventYaml(baseEvent({ description: 'Line one.\nLine two.' }));
    assert.ok(yaml.includes('    Line one.'), `Got: ${yaml}`);
    assert.ok(yaml.includes('    Line two.'), `Got: ${yaml}`);
  });

  it('writes link: null when link is null', () => {
    const yaml = buildEventYaml(baseEvent({ link: null }));
    assert.ok(yaml.includes('link: null'), `Got: ${yaml}`);
  });

  it('writes link value when link is present', () => {
    const yaml = buildEventYaml(baseEvent({ link: 'https://example.com' }));
    assert.ok(yaml.includes('https://example.com'), `Got: ${yaml}`);
  });

  it('includes owner name', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('name:'), `Got: ${yaml}`);
    assert.ok(yaml.includes('Anna Andersson'), `Got: ${yaml}`);
  });

  it("escapes single quotes in owner name", () => {
    const yaml = buildEventYaml(baseEvent({ owner: { name: "O'Brien", email: '' } }));
    assert.ok(yaml.includes("O''Brien"), `Expected escaped single quote, got: ${yaml}`);
  });

  it('includes meta created_at and updated_at', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('created_at: 2025-06-22 07:00'), `Got: ${yaml}`);
    assert.ok(yaml.includes('updated_at: 2025-06-22 07:00'), `Got: ${yaml}`);
  });

  it('applies yamlScalar to title with special chars', () => {
    const yaml = buildEventYaml(baseEvent({ title: 'Lunch: pasta & sallad' }));
    // colon in title should cause it to be quoted
    assert.ok(yaml.includes("'Lunch: pasta & sallad'"), `Got: ${yaml}`);
  });

  it('produces output parseable as valid YAML structure', () => {
    const yaml = require('js-yaml');
    const block = buildEventYaml(baseEvent({ description: 'Multi\nline.' }));
    // buildEventYaml emits a YAML list item (starts with "- "), so yaml.load
    // returns an array; the event is at index 0.
    const parsed = yaml.load(block);
    assert.ok(Array.isArray(parsed), `Expected array, got: ${typeof parsed}`);
    const event = parsed[0];
    assert.strictEqual(event.id, 'frukost-2025-06-22-0800');
    assert.strictEqual(event.title, 'Frukost');
    assert.ok(event.description.includes('Multi'), `Got: ${JSON.stringify(event.description)}`);
  });
});
