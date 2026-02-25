'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderLocationAccordions,
} = require('../source/build/render-index');

// ── renderLocationAccordions (02-§35.3–35.8) ────────────────────────────────

describe('renderLocationAccordions', () => {
  const locations = [
    {
      id: 'ga-idrott',
      name: 'GA Idrott',
      information: 'Ena halvan används för mer rörelse.',
      image_path: 'images/GA_idrott.webp',
    },
    {
      id: 'fritidsgarden',
      name: 'Fritidsgården',
      information: 'Kom ihåg, det tar cirka 15-20 minuter.',
      image_path: [
        'images/fritids_entre-1.webp',
        'images/fritids_tvrum.webp',
      ],
    },
    {
      id: 'andreas-taltet',
      name: 'AndreasTältet',
      information: '',
      image_path: '',
    },
  ];

  it('LOC-01 (02-§35.3): each location renders as <details class="accordion">', () => {
    const html = renderLocationAccordions(locations);
    const count = (html.match(/<details class="accordion">/g) || []).length;
    assert.strictEqual(count, 3, `Expected 3 accordions, got ${count}`);
  });

  it('LOC-02 (02-§35.4): location name appears as <summary> text', () => {
    const html = renderLocationAccordions(locations);
    assert.ok(html.includes('<summary>GA Idrott</summary>'), `Got: ${html}`);
    assert.ok(html.includes('<summary>Fritidsgården</summary>'), `Got: ${html}`);
    assert.ok(html.includes('<summary>AndreasTältet</summary>'), `Got: ${html}`);
  });

  it('LOC-03 (02-§35.5): information text appears in accordion body', () => {
    const html = renderLocationAccordions(locations);
    assert.ok(html.includes('Ena halvan används för mer rörelse.'), `Got: ${html}`);
    assert.ok(html.includes('Kom ihåg, det tar cirka 15-20 minuter.'), `Got: ${html}`);
  });

  it('LOC-04 (02-§35.6): single image_path renders one <img>', () => {
    const html = renderLocationAccordions(locations);
    assert.ok(
      html.includes('<img src="images/GA_idrott.webp"'),
      `Expected single image, got: ${html}`,
    );
  });

  it('LOC-05 (02-§35.6): array image_path renders multiple <img> elements', () => {
    const html = renderLocationAccordions(locations);
    assert.ok(
      html.includes('<img src="images/fritids_entre-1.webp"'),
      `Expected first image, got: ${html}`,
    );
    assert.ok(
      html.includes('<img src="images/fritids_tvrum.webp"'),
      `Expected second image, got: ${html}`,
    );
  });

  it('LOC-06 (02-§35.7): empty info and image still renders an accordion', () => {
    const html = renderLocationAccordions([
      { id: 'empty', name: 'Empty Place', information: '', image_path: '' },
    ]);
    assert.ok(html.includes('<details class="accordion">'), `Got: ${html}`);
    assert.ok(html.includes('<summary>Empty Place</summary>'), `Got: ${html}`);
  });

  it('LOC-07 (02-§35.8): accordions appear in input order', () => {
    const html = renderLocationAccordions(locations);
    const pos1 = html.indexOf('GA Idrott');
    const pos2 = html.indexOf('Fritidsgården');
    const pos3 = html.indexOf('AndreasTältet');
    assert.ok(pos1 < pos2, 'GA Idrott should come before Fritidsgården');
    assert.ok(pos2 < pos3, 'Fritidsgården should come before AndreasTältet');
  });

  it('LOC-08: images have loading="lazy" attribute', () => {
    const html = renderLocationAccordions(locations);
    const imgs = html.match(/<img [^>]+>/g) || [];
    for (const img of imgs) {
      assert.ok(img.includes('loading="lazy"'), `Expected lazy loading on: ${img}`);
    }
  });

  it('LOC-09: empty locations array returns empty string', () => {
    const html = renderLocationAccordions([]);
    assert.strictEqual(html, '');
  });

  it('LOC-10: images have alt text derived from location name', () => {
    const html = renderLocationAccordions(locations);
    assert.ok(
      html.includes('alt="GA Idrott"'),
      `Expected alt text from name, got: ${html}`,
    );
  });
});
