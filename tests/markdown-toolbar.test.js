'use strict';

// Tests for the markdown toolbar (02-§57.1–57.13).
//
// The toolbar logic lives in source/assets/js/client/markdown-toolbar.js.
// The core text-manipulation functions (applyWrap, applyPrefix) are exported
// via module.exports when running under Node.js (typeof window === 'undefined')
// so they can be unit-tested here.
//
// Structural/HTML tests verify that both form pages include the toolbar
// container and script tag.
//
// Manual checkpoints (must be verified in a browser):
//   MDT-M01 (02-§57.1): open /lagg-till.html, click each toolbar button,
//     verify correct syntax is inserted into the description textarea.
//   MDT-M02 (02-§57.9): inspect toolbar CSS — all values use design tokens.
//   MDT-M03 (02-§57.12): confirm no live preview is rendered.
//   MDT-M04 (02-§57.11): confirm no new entries in package.json dependencies.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { applyWrap, applyPrefix, BUTTONS } = require(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'markdown-toolbar.js'),
);

// ── Helper ──────────────────────────────────────────────────────────────────

/** Simulate applying a toolbar action to a text with a selection range. */
function apply(text, selStart, selEnd, actionIndex) {
  const btn = BUTTONS[actionIndex];
  if (btn.type === 'wrap') {
    return applyWrap(text, selStart, selEnd, btn.before, btn.after, btn.placeholder);
  }
  return applyPrefix(text, selStart, selEnd, btn.prefix, btn.placeholder);
}

// ── 02-§57.2 — Wrap selected text ──────────────────────────────────────────

describe('02-§57.2 — Toolbar wraps selected text (MDT-01..06)', () => {
  it('MDT-01: Bold wraps selected text with **', () => {
    const r = apply('hello world', 6, 11, 0); // select "world"
    assert.equal(r.text, 'hello **world**');
    assert.equal(r.selStart, 8); // cursor after **
    assert.equal(r.selEnd, 13);  // before **
  });

  it('MDT-02: Italic wraps selected text with *', () => {
    const r = apply('hello world', 6, 11, 1);
    assert.equal(r.text, 'hello *world*');
    assert.equal(r.selStart, 7);
    assert.equal(r.selEnd, 12);
  });

  it('MDT-03: Heading prefixes selected text with ## ', () => {
    const r = apply('hello world', 0, 11, 2);
    assert.equal(r.text, '## hello world');
  });

  it('MDT-04: Bullet list prefixes selected text with - ', () => {
    const r = apply('hello world', 0, 11, 3);
    assert.equal(r.text, '- hello world');
  });

  it('MDT-05: Numbered list prefixes selected text with 1. ', () => {
    const r = apply('hello world', 0, 11, 4);
    assert.equal(r.text, '1. hello world');
  });

  it('MDT-06: Block quote prefixes selected text with > ', () => {
    const r = apply('hello world', 0, 11, 5);
    assert.equal(r.text, '> hello world');
  });
});

// ── 02-§57.3 — Insert placeholder when no selection ─────────────────────────

describe('02-§57.3 — Toolbar inserts placeholder when no selection (MDT-07..12)', () => {
  it('MDT-07: Bold inserts **placeholder** and selects placeholder', () => {
    const r = apply('hello ', 6, 6, 0);
    assert.ok(r.text.includes('**'), 'has bold markers');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });

  it('MDT-08: Italic inserts *placeholder* and selects placeholder', () => {
    const r = apply('hello ', 6, 6, 1);
    assert.ok(r.text.includes('*'), 'has italic marker');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });

  it('MDT-09: Heading inserts ## placeholder and selects placeholder', () => {
    const r = apply('', 0, 0, 2);
    assert.ok(r.text.startsWith('## '), 'has heading prefix');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });

  it('MDT-10: Bullet list inserts - placeholder and selects placeholder', () => {
    const r = apply('', 0, 0, 3);
    assert.ok(r.text.startsWith('- '), 'has bullet prefix');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });

  it('MDT-11: Numbered list inserts 1. placeholder and selects placeholder', () => {
    const r = apply('', 0, 0, 4);
    assert.ok(r.text.startsWith('1. '), 'has numbered prefix');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });

  it('MDT-12: Block quote inserts > placeholder and selects placeholder', () => {
    const r = apply('', 0, 0, 5);
    assert.ok(r.text.startsWith('> '), 'has quote prefix');
    assert.ok(r.selEnd > r.selStart, 'placeholder is selected');
  });
});

// ── 02-§57.4 — Multi-line prefix ───────────────────────────────────────────

describe('02-§57.4 — Prefix applied per line for multi-line selections (MDT-13..15)', () => {
  it('MDT-13: Bullet list prefixes each line', () => {
    const text = 'line one\nline two\nline three';
    const r = apply(text, 0, text.length, 3);
    const lines = r.text.split('\n');
    assert.equal(lines.length, 3);
    for (const line of lines) {
      assert.ok(line.startsWith('- '), `"${line}" should start with "- "`);
    }
  });

  it('MDT-14: Numbered list prefixes each line with incrementing numbers', () => {
    const text = 'a\nb\nc';
    const r = apply(text, 0, text.length, 4);
    const lines = r.text.split('\n');
    assert.ok(lines[0].startsWith('1. '), 'first line starts with 1.');
    assert.ok(lines[1].startsWith('2. '), 'second line starts with 2.');
    assert.ok(lines[2].startsWith('3. '), 'third line starts with 3.');
  });

  it('MDT-15: Block quote prefixes each line', () => {
    const text = 'line one\nline two';
    const r = apply(text, 0, text.length, 5);
    const lines = r.text.split('\n');
    for (const line of lines) {
      assert.ok(line.startsWith('> '), `"${line}" should start with "> "`);
    }
  });
});

// ── 02-§57.5 — Toolbar present in both forms ───────────────────────────────

describe('02-§57.5 — Toolbar in both forms (MDT-16..17)', () => {
  const { renderAddPage } = require('../source/build/render-add');
  const addHtml = renderAddPage(
    { name: 'Test', location: 'Test', start_date: '2099-01-01', end_date: '2099-01-07', opens_for_editing: '2099-01-01' },
    ['Servicehus'],
    '/api',
  );

  const { renderEditPage } = require('../source/build/render-edit');
  const editHtml = renderEditPage(
    { name: 'Test', location: 'Test', start_date: '2099-01-01', end_date: '2099-01-07', opens_for_editing: '2099-01-01' },
    ['Servicehus'],
    '/api',
  );

  it('MDT-16: lagg-till.html includes md-toolbar container and script', () => {
    assert.ok(addHtml.includes('md-toolbar'), 'has md-toolbar class');
    assert.ok(addHtml.includes('markdown-toolbar.js'), 'loads markdown-toolbar.js');
  });

  it('MDT-17: redigera.html includes md-toolbar container and script', () => {
    assert.ok(editHtml.includes('md-toolbar'), 'has md-toolbar class');
    assert.ok(editHtml.includes('markdown-toolbar.js'), 'loads markdown-toolbar.js');
  });
});

// ── 02-§57.6 — Button order ────────────────────────────────────────────────

describe('02-§57.6 — Button order (MDT-18)', () => {
  it('MDT-18: BUTTONS array is in order: bold, italic, heading, bullet, numbered, quote', () => {
    assert.equal(BUTTONS.length, 6, 'exactly 6 buttons');
    assert.equal(BUTTONS[0].id, 'bold');
    assert.equal(BUTTONS[1].id, 'italic');
    assert.equal(BUTTONS[2].id, 'heading');
    assert.equal(BUTTONS[3].id, 'bullet-list');
    assert.equal(BUTTONS[4].id, 'numbered-list');
    assert.equal(BUTTONS[5].id, 'blockquote');
  });
});

// ── 02-§57.7 — SVG icons ───────────────────────────────────────────────────

describe('02-§57.7 — Inline SVG icons (MDT-19)', () => {
  it('MDT-19: every button has an svg property containing <svg', () => {
    for (const btn of BUTTONS) {
      assert.ok(
        btn.svg && btn.svg.includes('<svg'),
        `button "${btn.id}" must have an inline SVG`,
      );
    }
  });
});

// ── 02-§57.8 — Accessible labels ───────────────────────────────────────────

describe('02-§57.8 — Accessible aria-label (MDT-20)', () => {
  it('MDT-20: every button has a non-empty label property', () => {
    for (const btn of BUTTONS) {
      assert.ok(
        btn.label && btn.label.length > 0,
        `button "${btn.id}" must have a label for aria-label`,
      );
    }
  });
});

// ── 02-§57.10 — Shared file loaded by both forms ───────────────────────────

describe('02-§57.10 — Shared markdown-toolbar.js (MDT-21..22)', () => {
  it('MDT-21: markdown-toolbar.js source file exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'markdown-toolbar.js');
    assert.ok(fs.existsSync(filePath), 'file exists');
  });

  it('MDT-22: both rendered pages reference the same script filename', () => {
    const { renderAddPage } = require('../source/build/render-add');
    const addHtml = renderAddPage(
      { name: 'T', location: 'T', start_date: '2099-01-01', end_date: '2099-01-07', opens_for_editing: '2099-01-01' },
      ['S'], '/api',
    );
    const { renderEditPage } = require('../source/build/render-edit');
    const editHtml = renderEditPage(
      { name: 'T', location: 'T', start_date: '2099-01-01', end_date: '2099-01-07', opens_for_editing: '2099-01-01' },
      ['S'], '/api',
    );
    const re = /markdown-toolbar\.js/;
    assert.ok(re.test(addHtml), 'add page loads markdown-toolbar.js');
    assert.ok(re.test(editHtml), 'edit page loads markdown-toolbar.js');
  });
});

// ── 02-§57.13 — Focus indicator CSS ────────────────────────────────────────

describe('02-§57.13 — Focus indicator (MDT-23)', () => {
  it('MDT-23: style.css contains .md-toolbar button focus-visible rule', () => {
    const css = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
      'utf8',
    );
    assert.ok(
      css.includes('.md-toolbar') && css.includes('focus-visible'),
      'CSS must have a .md-toolbar focus-visible rule',
    );
  });
});
