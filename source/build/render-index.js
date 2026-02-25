'use strict';

const { pageNav, pageFooter } = require('./layout');

/**
 * Converts inline Markdown (images, links, bold) to HTML.
 * Content files are author-controlled so no HTML escaping is applied.
 */
function inlineHtml(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-img" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Finds the first image in a markdown string, removes it, and returns both.
 * Used to hoist the hero image out of the body content.
 */
function extractHeroImage(md) {
  const match = md.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (!match) return { heroSrc: null, heroAlt: null, md };
  const remaining = md
    .replace(match[0], '')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
  return { heroSrc: match[2], heroAlt: match[1], md: remaining };
}

/**
 * Extracts the text of the first # heading in a markdown string.
 */
function extractH1(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1].trim() : null;
}

function renderBlock(b) {
  switch (b.type) {
    case 'h':         return `<h${b.level}>${inlineHtml(b.text)}</h${b.level}>`;
    case 'blockquote': return `<blockquote>${inlineHtml(b.text)}</blockquote>`;
    case 'hr':        return '<hr>';
    case 'ul':
      return `<ul>\n${b.items.map((it) => `  <li>${inlineHtml(it)}</li>`).join('\n')}\n</ul>`;
    case 'p':         return `<p>${inlineHtml(b.text)}</p>`;
    default:          return '';
  }
}

/**
 * Converts a Markdown subset to HTML.
 * Handles: headings (h1–h3), blockquotes, hr, unordered lists, paragraphs.
 *
 * headingOffset shifts all heading levels down (pass 1 for non-primary sections).
 *
 * collapsible: when true, wraps each ## section (after offset) in
 * <details class="accordion"><summary>…</summary>…</details>.
 * Closed by default. Add `collapsible: true` in sections.yaml to enable.
 */
function convertMarkdown(md, headingOffset = 0, collapsible = false) {
  const lines = md.split('\n');
  const blocks = [];
  let paraLines = [];

  function flushPara() {
    const text = paraLines.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    paraLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(3 + headingOffset, 6), text: line.slice(4).trim() });
    } else if (line.startsWith('## ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(2 + headingOffset, 6), text: line.slice(3).trim() });
    } else if (line.startsWith('# ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(1 + headingOffset, 6), text: line.slice(2).trim() });
    } else if (line.startsWith('> ')) {
      flushPara();
      blocks.push({ type: 'blockquote', text: line.slice(2) });
    } else if (line.trim() === '---') {
      flushPara();
      blocks.push({ type: 'hr' });
    } else if (line.startsWith('- ')) {
      flushPara();
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      i--;
      blocks.push({ type: 'ul', items });
    } else if (line.trim() === '') {
      flushPara();
    } else {
      paraLines.push(line);
    }
  }
  flushPara();

  if (!collapsible) {
    return blocks.map(renderBlock).join('\n');
  }

  // Group content by the ## heading level (= 2 + headingOffset after rendering).
  // Each group becomes a <details> accordion. Content before the first ## is
  // rendered normally (e.g. the section h1/h2 title stays visible).
  const splitLevel = 2 + headingOffset;
  const groups = [];
  let current = { accordion: false, summary: null, blocks: [] };

  for (const block of blocks) {
    if (block.type === 'h' && block.level === splitLevel) {
      groups.push(current);
      current = { accordion: true, summary: block.text, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  groups.push(current);

  return groups
    .map((g) => {
      const inner = g.blocks.map(renderBlock).join('\n');
      if (!g.accordion) return inner;
      const indented = inner.split('\n').map((l) => (l ? '    ' + l : '')).join('\n');
      return [
        '<details class="accordion">',
        `  <summary>${inlineHtml(g.summary)}</summary>`,
        '  <div class="accordion-body">',
        indented,
        '  </div>',
        '</details>',
      ].join('\n');
    })
    .join('\n');
}

/**
 * Renders the full index.html.
 *
 * @param {object} opts
 * @param {string|null} opts.heroSrc  - path to hero image
 * @param {string|null} opts.heroAlt  - alt text for hero image
 * @param {Array<{id: string, navLabel: string, html: string}>} opts.sections
 */
function renderIndexPage({ heroSrc, heroAlt, sections }, footerHtml = '', navSections = []) {
  const heroHtml = heroSrc
    ? `\n  <div class="hero">\n    <img src="${heroSrc}" alt="${heroAlt || ''}" class="hero-img" fetchpriority="high">\n  </div>`
    : '';

  const contentSections = sections
    .map((s, i) => {
      const inner = s.html
        .split('\n')
        .map((l) => (l ? '      ' + l : ''))
        .join('\n');
      const cls = i === 0 ? ' class="section-first"' : '';
      return `    <section id="${s.id}"${cls}>\n${inner}\n    </section>`;
    })
    .join('\n\n');

  const preloadHtml = heroSrc
    ? `\n  <link rel="preload" as="image" href="${heroSrc}">`
    : '';

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SB Sommar</title>
  <link rel="stylesheet" href="style.css">${preloadHtml}
</head>
<body>
${pageNav('index.html', navSections)}${heroHtml}
  <div class="content">
${contentSections}
  </div>
  <script src="nav.js"></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderIndexPage, convertMarkdown, extractHeroImage, extractH1 };
