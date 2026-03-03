'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'source', 'content', 'images');
const CONTENT_DIR = path.join(__dirname, '..', 'source', 'content');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getImageFiles() {
  return fs.readdirSync(IMAGES_DIR).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
}

function getMarkdownImageRefs() {
  const refs = [];
  const mdFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const re = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      refs.push({ file, alt: m[1], image: m[2] });
    }
  }
  return refs;
}

// ── 02-§68.1–68.4 — Naming convention ───────────────────────────────────────

describe('02-§68.1–68.4 — Image filename naming convention', () => {
  const images = getImageFiles();

  it('FNM-01: all filenames are lowercase', () => {
    const bad = images.filter(f => f !== f.toLowerCase());
    assert.deepStrictEqual(bad, [], `Non-lowercase filenames: ${bad.join(', ')}`);
  });

  it('FNM-02: no Swedish characters in filenames', () => {
    const bad = images.filter(f => /[äöåéÄÖÅÉ]/.test(f));
    assert.deepStrictEqual(bad, [], `Swedish characters in: ${bad.join(', ')}`);
  });

  it('FNM-03: words separated by hyphens, no underscores', () => {
    const bad = images.filter(f => f.includes('_'));
    assert.deepStrictEqual(bad, [], `Underscores in: ${bad.join(', ')}`);
  });

  it('FNM-04: no camelCase in filenames', () => {
    const nameOnly = f => f.replace(/\.[^.]+$/, '');
    const bad = images.filter(f => /[a-z][A-Z]/.test(nameOnly(f)));
    assert.deepStrictEqual(bad, [], `CamelCase in: ${bad.join(', ')}`);
  });
});

// ── 02-§68.6 — Markdown references point to existing files ──────────────────

describe('02-§68.6 — Markdown image references', () => {
  it('FNM-05: all markdown image refs point to existing files', () => {
    const refs = getMarkdownImageRefs();
    const existing = new Set(getImageFiles());
    const broken = refs.filter(r => !existing.has(r.image));
    assert.deepStrictEqual(
      broken.map(r => `${r.file}: ${r.image}`),
      [],
      'Broken image references in markdown',
    );
  });
});

// ── 02-§68.7 — local.yaml image_path fields point to existing files ────────

describe('02-§68.7 — local.yaml image references', () => {
  it('FNM-06: all local.yaml image_path values point to existing files', () => {
    const yaml = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'data', 'local.yaml'), 'utf8',
    );
    const refs = [];
    const re = /images\/([^\s"']+\.webp)/g;
    let m;
    while ((m = re.exec(yaml)) !== null) {
      refs.push(m[1]);
    }
    const existing = new Set(getImageFiles());
    const broken = refs.filter(r => !existing.has(r));
    assert.deepStrictEqual(broken, [], `Broken image refs in local.yaml: ${broken.join(', ')}`);
  });
});

// ── 02-§68.8 — Build script image paths point to existing files ─────────────

describe('02-§68.8 — Build script image references', () => {
  it('FNM-07: render-index.js image refs point to existing files', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'render-index.js'), 'utf8',
    );
    const refs = [];
    const re = /images\/([^\s"'`]+\.webp)/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      refs.push(m[1]);
    }
    const existing = new Set(getImageFiles());
    const broken = refs.filter(r => !existing.has(r));
    assert.deepStrictEqual(broken, [], `Broken image refs in render-index.js: ${broken.join(', ')}`);
  });

  it('FNM-08: render.js image refs point to existing files', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'render.js'), 'utf8',
    );
    const refs = [];
    const re = /images\/([^\s"'`]+\.webp)/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      refs.push(m[1]);
    }
    const existing = new Set(getImageFiles());
    const broken = refs.filter(r => !existing.has(r));
    assert.deepStrictEqual(broken, [], `Broken image refs in render.js: ${broken.join(', ')}`);
  });
});

// ── 02-§68.11 — No broken image references overall ─────────────────────────

describe('02-§68.11 — All image files are referenced', () => {
  it('FNM-09: every image file is referenced somewhere', () => {
    const images = getImageFiles();
    const mdRefs = getMarkdownImageRefs().map(r => r.image);

    const yaml = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'data', 'local.yaml'), 'utf8',
    );
    const yamlRefs = [];
    const reY = /images\/([^\s"']+\.webp)/g;
    let m;
    while ((m = reY.exec(yaml)) !== null) yamlRefs.push(m[1]);

    const renderIndex = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'render-index.js'), 'utf8',
    );
    const render = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'render.js'), 'utf8',
    );
    const jsRefs = [];
    const reJ = /images\/([^\s"'`]+\.webp)/g;
    while ((m = reJ.exec(renderIndex)) !== null) jsRefs.push(m[1]);
    while ((m = reJ.exec(render)) !== null) jsRefs.push(m[1]);

    const allRefs = new Set([...mdRefs, ...yamlRefs, ...jsRefs]);
    const unreferenced = images.filter(f => !allRefs.has(f));
    assert.deepStrictEqual(unreferenced, [], `Unreferenced images: ${unreferenced.join(', ')}`);
  });
});
