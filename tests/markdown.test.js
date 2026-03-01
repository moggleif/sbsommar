'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Module under test — will be created in Phase 4
const { renderDescriptionHtml, stripMarkdown } = require('../source/build/markdown');

// ── renderDescriptionHtml (02-§56.1, 02-§56.2, 02-§56.6, 02-§56.7, 02-§56.10) ──

describe('renderDescriptionHtml (02-§56.1, 02-§56.2, 02-§56.6, 02-§56.7)', () => {
  it('MKD-D01 (02-§56.7): plain text is wrapped in <p> tags', () => {
    const html = renderDescriptionHtml('Hello world');
    assert.ok(html.includes('<p>Hello world</p>'), `Expected <p> wrapper, got: ${html}`);
  });

  it('MKD-D02 (02-§56.1): bold markdown renders as <strong>', () => {
    const html = renderDescriptionHtml('This is **bold** text');
    assert.ok(html.includes('<strong>bold</strong>'), `Expected <strong>, got: ${html}`);
  });

  it('MKD-D03 (02-§56.1): italic markdown renders as <em>', () => {
    const html = renderDescriptionHtml('This is *italic* text');
    assert.ok(html.includes('<em>italic</em>'), `Expected <em>, got: ${html}`);
  });

  it('MKD-D04 (02-§56.1): links render as <a> tags', () => {
    const html = renderDescriptionHtml('See [example](https://example.com)');
    assert.ok(html.includes('<a href="https://example.com">example</a>'), `Expected <a>, got: ${html}`);
  });

  it('MKD-D05 (02-§56.1): unordered lists render as <ul>/<li>', () => {
    const html = renderDescriptionHtml('Items:\n- one\n- two');
    assert.ok(html.includes('<ul>'), `Expected <ul>, got: ${html}`);
    assert.ok(html.includes('<li>one</li>'), `Expected <li>one</li>, got: ${html}`);
  });

  it('MKD-D06 (02-§56.7): multiple paragraphs render correctly', () => {
    const html = renderDescriptionHtml('First paragraph.\n\nSecond paragraph.');
    assert.ok(html.includes('<p>First paragraph.</p>'), `Expected first <p>, got: ${html}`);
    assert.ok(html.includes('<p>Second paragraph.</p>'), `Expected second <p>, got: ${html}`);
  });

  it('MKD-D07 (02-§56.6): <script> tags are removed from output', () => {
    const html = renderDescriptionHtml('Hello <script>alert(1)</script> world');
    assert.ok(!html.includes('<script>'), `Script tag must be removed, got: ${html}`);
    assert.ok(!html.includes('</script>'), `Closing script tag must be removed, got: ${html}`);
  });

  it('MKD-D08 (02-§56.6): <iframe> tags are removed from output', () => {
    const html = renderDescriptionHtml('Hello <iframe src="evil.com"></iframe> world');
    assert.ok(!html.includes('<iframe'), `iframe tag must be removed, got: ${html}`);
  });

  it('MKD-D09 (02-§56.6): <object> tags are removed from output', () => {
    const html = renderDescriptionHtml('Hello <object data="evil.swf"></object> world');
    assert.ok(!html.includes('<object'), `object tag must be removed, got: ${html}`);
  });

  it('MKD-D10 (02-§56.6): <embed> tags are removed from output', () => {
    const html = renderDescriptionHtml('Hello <embed src="evil.swf"> world');
    assert.ok(!html.includes('<embed'), `embed tag must be removed, got: ${html}`);
  });

  it('MKD-D11 (02-§56.6): on* event handler attributes are removed', () => {
    const html = renderDescriptionHtml('Hello <div onclick="alert(1)">click</div> world');
    assert.ok(!html.includes('onclick'), `onclick must be removed, got: ${html}`);
  });

  it('MKD-D12 (02-§56.6): javascript: URIs in links are removed', () => {
    const html = renderDescriptionHtml('[click](javascript:alert(1))');
    assert.ok(!html.includes('javascript:'), `javascript: URI must be removed, got: ${html}`);
  });

  it('MKD-D13 (02-§56.7): null input returns empty string', () => {
    const html = renderDescriptionHtml(null);
    assert.strictEqual(html, '');
  });

  it('MKD-D14 (02-§56.7): empty string input returns empty string', () => {
    const html = renderDescriptionHtml('');
    assert.strictEqual(html, '');
  });

  it('MKD-D15 (02-§56.10): function is exported from markdown.js', () => {
    assert.strictEqual(typeof renderDescriptionHtml, 'function');
  });
});

// ── stripMarkdown (02-§56.4, 02-§56.5, 02-§56.10) ──────────────────────────

describe('stripMarkdown (02-§56.4, 02-§56.5)', () => {
  it('MKD-D16 (02-§56.4): strips bold syntax', () => {
    const text = stripMarkdown('This is **bold** text');
    assert.ok(!text.includes('**'), `Bold markers should be stripped, got: ${text}`);
    assert.ok(text.includes('bold'), `Bold word should remain, got: ${text}`);
  });

  it('MKD-D17 (02-§56.4): strips italic syntax', () => {
    const text = stripMarkdown('This is *italic* text');
    assert.ok(!text.includes('*'), `Italic markers should be stripped, got: ${text}`);
    assert.ok(text.includes('italic'), `Italic word should remain, got: ${text}`);
  });

  it('MKD-D18 (02-§56.4): strips link syntax, keeps text', () => {
    const text = stripMarkdown('See [example](https://example.com)');
    assert.ok(text.includes('example'), `Link text should remain, got: ${text}`);
    assert.ok(!text.includes('['), `Brackets should be stripped, got: ${text}`);
    assert.ok(!text.includes(']('), `Link syntax should be stripped, got: ${text}`);
  });

  it('MKD-D19 (02-§56.4): strips heading syntax', () => {
    const text = stripMarkdown('# Heading');
    assert.ok(!text.match(/^#/), `Heading marker should be stripped, got: ${text}`);
    assert.ok(text.includes('Heading'), `Heading text should remain, got: ${text}`);
  });

  it('MKD-D20 (02-§56.4): strips list markers', () => {
    const text = stripMarkdown('- item one\n- item two');
    assert.ok(text.includes('item one'), `List item text should remain, got: ${text}`);
    assert.ok(text.includes('item two'), `List item text should remain, got: ${text}`);
  });

  it('MKD-D21 (02-§56.5): plain text passes through unchanged', () => {
    const text = stripMarkdown('Just plain text here');
    assert.strictEqual(text.trim(), 'Just plain text here');
  });

  it('MKD-D22 (02-§56.4): null input returns empty string', () => {
    const text = stripMarkdown(null);
    assert.strictEqual(text, '');
  });

  it('MKD-D23 (02-§56.4): empty string returns empty string', () => {
    const text = stripMarkdown('');
    assert.strictEqual(text, '');
  });

  it('MKD-D24 (02-§56.10): function is exported from markdown.js', () => {
    assert.strictEqual(typeof stripMarkdown, 'function');
  });
});
