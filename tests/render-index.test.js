'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// render-index.js exports only renderIndexPage and convertMarkdown publicly.
// inlineHtml and extractHeroImage / extractH1 are also exported for testing.
const {
  renderIndexPage,
  convertMarkdown,
  extractHeroImage,
  extractH1,
} = require('../source/build/render-index');

// ── inlineHtml (tested indirectly through convertMarkdown) ───────────────────
// We test inline Markdown transformation via paragraph blocks.

describe('convertMarkdown – inline Markdown', () => {
  it('converts bold (**text**) to <strong>', () => {
    const html = convertMarkdown('**Hello**');
    assert.ok(html.includes('<strong>Hello</strong>'), `Got: ${html}`);
  });

  it('converts a link ([text](url)) to <a>', () => {
    const html = convertMarkdown('[Click here](https://example.com)');
    assert.ok(html.includes('<a href="https://example.com">Click here</a>'), `Got: ${html}`);
  });

  it('converts an image (![alt](src)) to <img> with loading="lazy"', () => {
    const html = convertMarkdown('![A cat](cat.jpg)');
    assert.ok(html.includes('<img src="cat.jpg" alt="A cat" class="content-img" loading="lazy">'), `Got: ${html}`);
  });

  it('leaves plain text unchanged', () => {
    const html = convertMarkdown('Just a sentence.');
    assert.ok(html.includes('Just a sentence.'), `Got: ${html}`);
  });

  it('handles multiple inline elements in one paragraph', () => {
    const html = convertMarkdown('See **this** [link](https://x.com).');
    assert.ok(html.includes('<strong>this</strong>'), `Got: ${html}`);
    assert.ok(html.includes('<a href="https://x.com">link</a>'), `Got: ${html}`);
  });
});

// ── convertMarkdown – block types ────────────────────────────────────────────

describe('convertMarkdown – block types', () => {
  it('renders a paragraph', () => {
    const html = convertMarkdown('Hello world.');
    assert.ok(html.includes('<p>Hello world.</p>'), `Got: ${html}`);
  });

  it('renders an h1 heading', () => {
    const html = convertMarkdown('# Title');
    assert.ok(html.includes('<h1>Title</h1>'), `Got: ${html}`);
  });

  it('renders an h2 heading', () => {
    const html = convertMarkdown('## Subtitle');
    assert.ok(html.includes('<h2>Subtitle</h2>'), `Got: ${html}`);
  });

  it('renders an h3 heading', () => {
    const html = convertMarkdown('### Small');
    assert.ok(html.includes('<h3>Small</h3>'), `Got: ${html}`);
  });

  it('renders a blockquote', () => {
    const html = convertMarkdown('> A quote.');
    assert.ok(html.includes('<blockquote>A quote.</blockquote>'), `Got: ${html}`);
  });

  it('renders a horizontal rule', () => {
    const html = convertMarkdown('---');
    assert.ok(html.includes('<hr>'), `Got: ${html}`);
  });

  it('renders an unordered list', () => {
    const html = convertMarkdown('- Item one\n- Item two\n- Item three');
    assert.ok(html.includes('<ul>'), `Got: ${html}`);
    assert.ok(html.includes('<li>Item one</li>'), `Got: ${html}`);
    assert.ok(html.includes('<li>Item two</li>'), `Got: ${html}`);
    assert.ok(html.includes('<li>Item three</li>'), `Got: ${html}`);
  });

  it('renders multiple paragraphs separated by blank lines', () => {
    const html = convertMarkdown('First para.\n\nSecond para.');
    assert.ok(html.includes('<p>First para.</p>'), `Got: ${html}`);
    assert.ok(html.includes('<p>Second para.</p>'), `Got: ${html}`);
  });

  it('joins adjacent non-blank lines into one paragraph', () => {
    const html = convertMarkdown('Line one.\nLine two.');
    assert.ok(html.includes('Line one.'), `Got: ${html}`);
    assert.ok(html.includes('Line two.'), `Got: ${html}`);
    // Both lines should be in the same <p>, not two separate ones
    const pTags = (html.match(/<p>/g) || []).length;
    assert.strictEqual(pTags, 1, `Expected 1 <p>, got ${pTags}`);
  });

  it('returns empty string for empty input', () => {
    const html = convertMarkdown('');
    assert.strictEqual(html, '');
  });

  it('returns empty string for whitespace-only input', () => {
    const html = convertMarkdown('   \n\n   ');
    assert.strictEqual(html.trim(), '');
  });
});

// ── convertMarkdown – headingOffset ──────────────────────────────────────────

describe('convertMarkdown – headingOffset', () => {
  it('shifts h1 to h2 with offset 1', () => {
    const html = convertMarkdown('# Title', 1);
    assert.ok(html.includes('<h2>Title</h2>'), `Got: ${html}`);
  });

  it('shifts h2 to h3 with offset 1', () => {
    const html = convertMarkdown('## Section', 1);
    assert.ok(html.includes('<h3>Section</h3>'), `Got: ${html}`);
  });

  it('shifts h3 to h4 with offset 1', () => {
    const html = convertMarkdown('### Sub', 1);
    assert.ok(html.includes('<h4>Sub</h4>'), `Got: ${html}`);
  });

  it('caps heading level at h6 when offset is large', () => {
    // h3 + offset 5 = level 8, capped at 6
    const html = convertMarkdown('### Deep', 5);
    assert.ok(html.includes('<h6>Deep</h6>'), `Got: ${html}`);
    assert.ok(!html.includes('<h7>'), `Got unexpected h7: ${html}`);
    assert.ok(!html.includes('<h8>'), `Got unexpected h8: ${html}`);
  });

  it('leaves non-heading blocks unchanged by offset', () => {
    const html = convertMarkdown('A paragraph.', 2);
    assert.ok(html.includes('<p>A paragraph.</p>'), `Got: ${html}`);
  });
});

// ── convertMarkdown – collapsible ────────────────────────────────────────────

describe('convertMarkdown – collapsible mode', () => {
  const md = [
    '# Section Title',
    '',
    '## Accordion One',
    '',
    'Content of one.',
    '',
    '## Accordion Two',
    '',
    'Content of two.',
  ].join('\n');

  it('wraps ## sections in <details class="accordion">', () => {
    const html = convertMarkdown(md, 0, true);
    assert.ok(html.includes('<details class="accordion">'), `Got: ${html}`);
  });

  it('uses <summary> for ## heading text', () => {
    const html = convertMarkdown(md, 0, true);
    assert.ok(html.includes('<summary>Accordion One</summary>'), `Got: ${html}`);
    assert.ok(html.includes('<summary>Accordion Two</summary>'), `Got: ${html}`);
  });

  it('wraps accordion body in <div class="accordion-body">', () => {
    const html = convertMarkdown(md, 0, true);
    assert.ok(html.includes('<div class="accordion-body">'), `Got: ${html}`);
  });

  it('content before first ## is rendered normally (not in accordion)', () => {
    const html = convertMarkdown(md, 0, true);
    assert.ok(html.includes('<h1>Section Title</h1>'), `Got: ${html}`);
    // The h1 should NOT be inside a <details>
    const detailsIndex = html.indexOf('<details');
    const h1Index = html.indexOf('<h1>');
    assert.ok(h1Index < detailsIndex || detailsIndex === -1, 'h1 should appear before any <details>');
  });

  it('content inside accordion is rendered and indented', () => {
    const html = convertMarkdown(md, 0, true);
    assert.ok(html.includes('Content of one.'), `Got: ${html}`);
    assert.ok(html.includes('Content of two.'), `Got: ${html}`);
  });

  it('without collapsible, ## sections are plain headings', () => {
    const html = convertMarkdown(md, 0, false);
    assert.ok(!html.includes('<details'), `Got unexpected <details>: ${html}`);
    assert.ok(html.includes('<h2>Accordion One</h2>'), `Got: ${html}`);
  });

  it('no content produces no accordion elements', () => {
    const html = convertMarkdown('', 0, true);
    assert.ok(!html.includes('<details'), `Got unexpected <details>: ${html}`);
  });
});

// ── extractHeroImage ─────────────────────────────────────────────────────────

describe('extractHeroImage', () => {
  it('extracts src and alt from the first image', () => {
    const md = '![A beautiful camp](images/hero.jpg)\n\nSome text.';
    const { heroSrc, heroAlt } = extractHeroImage(md);
    assert.strictEqual(heroSrc, 'images/hero.jpg');
    assert.strictEqual(heroAlt, 'A beautiful camp');
  });

  it('removes the image from the returned md', () => {
    const md = '![Hero](images/hero.jpg)\n\nSome text.';
    const { md: remaining } = extractHeroImage(md);
    assert.ok(!remaining.includes('![Hero]'), `Expected image removed, got: ${remaining}`);
    assert.ok(remaining.includes('Some text.'), `Expected text preserved, got: ${remaining}`);
  });

  it('returns null heroSrc when no image is present', () => {
    const md = 'No image here.';
    const { heroSrc, heroAlt, md: remaining } = extractHeroImage(md);
    assert.strictEqual(heroSrc, null);
    assert.strictEqual(heroAlt, null);
    assert.strictEqual(remaining, md);
  });

  it('only extracts the first image when multiple are present', () => {
    const md = '![First](first.jpg)\n\n![Second](second.jpg)';
    const { heroSrc, md: remaining } = extractHeroImage(md);
    assert.strictEqual(heroSrc, 'first.jpg');
    assert.ok(remaining.includes('![Second]'), `Expected second image kept, got: ${remaining}`);
  });

  it('handles an image with empty alt text', () => {
    const md = '![](images/bg.jpg)\n\nText.';
    const { heroSrc, heroAlt } = extractHeroImage(md);
    assert.strictEqual(heroSrc, 'images/bg.jpg');
    assert.strictEqual(heroAlt, '');
  });
});

// ── extractH1 ────────────────────────────────────────────────────────────────

describe('extractH1', () => {
  it('extracts text of the first # heading', () => {
    const md = '# Welcome to camp\n\nSome text.';
    assert.strictEqual(extractH1(md), 'Welcome to camp');
  });

  it('returns null when there is no h1', () => {
    const md = '## Only h2\n\nSome text.';
    assert.strictEqual(extractH1(md), null);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(extractH1(''), null);
  });

  it('works when h1 is not on the first line', () => {
    const md = 'Intro text.\n\n# Delayed Heading\n\nMore text.';
    assert.strictEqual(extractH1(md), 'Delayed Heading');
  });

  it('trims whitespace from heading text', () => {
    const md = '#   Spaces Around   \n\nText.';
    assert.strictEqual(extractH1(md), 'Spaces Around');
  });
});

// ── renderIndexPage – image loading performance (02-§25.1–25.4) ─────────────

describe('renderIndexPage – image loading performance (02-§25.1–25.4)', () => {
  const basePage = {
    heroSrc: 'images/hero.webp',
    heroAlt: 'Camp river',
    sections: [{ id: 'intro', navLabel: 'Intro', html: '<p>Hello</p>' }],
  };

  it('IMG-01 (02-§25.1): content images have loading="lazy"', () => {
    const md = '![A photo](images/photo.webp)';
    const html = convertMarkdown(md);
    assert.ok(
      html.includes('loading="lazy"'),
      `Expected loading="lazy" on content image, got: ${html}`,
    );
  });

  it('IMG-02 (02-§25.2): hero image does NOT have loading="lazy"', () => {
    const html = renderIndexPage(basePage);
    const heroMatch = html.match(/<img[^>]*class="hero-img"[^>]*>/);
    assert.ok(heroMatch, 'Expected a hero-img element');
    assert.ok(
      !heroMatch[0].includes('loading="lazy"'),
      `Hero image must not have loading="lazy", got: ${heroMatch[0]}`,
    );
  });

  it('IMG-03 (02-§25.3): homepage head includes a preload link for the hero image', () => {
    const html = renderIndexPage(basePage);
    const preload = `<link rel="preload" as="image" href="images/hero.webp">`;
    assert.ok(
      html.includes(preload),
      `Expected hero preload link in <head>, got head: ${html.slice(0, 500)}`,
    );
    // Must be inside <head>, not <body>
    const headEnd = html.indexOf('</head>');
    const preloadPos = html.indexOf(preload);
    assert.ok(preloadPos < headEnd, 'Preload link must be inside <head>');
  });

  it('IMG-04 (02-§25.3): preload href is dynamic, not hardcoded', () => {
    const page = { ...basePage, heroSrc: 'images/custom-hero.webp' };
    const html = renderIndexPage(page);
    assert.ok(
      html.includes('href="images/custom-hero.webp"'),
      'Preload href should match the dynamic hero source',
    );
  });

  it('IMG-05 (02-§25.3): no preload link when there is no hero image', () => {
    const page = { ...basePage, heroSrc: null };
    const html = renderIndexPage(page);
    assert.ok(
      !html.includes('rel="preload"'),
      'No preload link should be emitted when heroSrc is null',
    );
  });

  it('IMG-06 (02-§25.4): hero image has fetchpriority="high"', () => {
    const html = renderIndexPage(basePage);
    const heroMatch = html.match(/<img[^>]*class="hero-img"[^>]*>/);
    assert.ok(heroMatch, 'Expected a hero-img element');
    assert.ok(
      heroMatch[0].includes('fetchpriority="high"'),
      `Hero image must have fetchpriority="high", got: ${heroMatch[0]}`,
    );
  });

  it('IMG-07 (02-§25.5): first-section images do NOT have loading="lazy"', () => {
    const page = {
      heroSrc: 'images/hero.webp',
      heroAlt: 'Camp river',
      sections: [
        { id: 'intro', navLabel: 'Intro', html: '<p>Text <img src="images/logo.webp" alt="Logo" class="content-img" loading="lazy"></p>' },
        { id: 'about', navLabel: 'About', html: '<p><img src="images/photo.webp" alt="Photo" class="content-img" loading="lazy"></p>' },
      ],
    };
    const html = renderIndexPage(page);
    // First section (id="intro") must not contain loading="lazy"
    const firstSection = html.match(/<section id="intro"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(firstSection, 'Expected a section with id="intro"');
    assert.ok(
      !firstSection[1].includes('loading="lazy"'),
      `First section must not have loading="lazy", got: ${firstSection[1]}`,
    );
    // Second section should still have loading="lazy"
    const secondSection = html.match(/<section id="about"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(secondSection, 'Expected a section with id="about"');
    assert.ok(
      secondSection[1].includes('loading="lazy"'),
      `Non-first sections must keep loading="lazy", got: ${secondSection[1]}`,
    );
  });
});
