'use strict';

/**
 * Converts inline Markdown (images, links, bold) to HTML.
 * Content files are author-controlled so no HTML escaping is applied.
 */
function inlineHtml(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-img">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Converts a Markdown subset to HTML.
 * Handles: headings (h1–h2), hr, unordered lists, paragraphs.
 *
 * headingOffset shifts all heading levels down by that amount.
 * Pass 1 for non-primary sections so their h1 becomes h2, h2 becomes h3, etc.
 */
function convertMarkdown(md, headingOffset = 0) {
  const lines = md.split('\n');
  const blocks = [];
  let paraLines = [];

  function flushPara() {
    const text = paraLines.join(' ').trim();
    if (text) blocks.push({ type: 'h', level: null, text: null, paraText: text });
    paraLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(1 + headingOffset, 6), text: line.slice(2).trim() });
    } else if (line.startsWith('## ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(2 + headingOffset, 6), text: line.slice(3).trim() });
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

  return blocks
    .map((b) => {
      if (b.type === 'h' && b.level !== null) {
        return `<h${b.level}>${inlineHtml(b.text)}</h${b.level}>`;
      }
      if (b.type === 'h' && b.paraText) {
        return `<p>${inlineHtml(b.paraText)}</p>`;
      }
      if (b.type === 'hr') return '<hr>';
      if (b.type === 'ul') {
        return `<ul>\n${b.items.map((it) => `  <li>${inlineHtml(it)}</li>`).join('\n')}\n</ul>`;
      }
      return '';
    })
    .join('\n');
}

/**
 * Wraps pre-rendered HTML content in the index page shell.
 */
function renderIndexPage(bodyHtml) {
  const indented = bodyHtml
    .split('\n')
    .map((l) => (l ? '    ' + l : ''))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SB Sommar</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="page-nav">
    <a class="nav-link active" href="index.html">Hem</a>
    <a class="nav-link" href="schema.html">Schema</a>
    <a class="nav-link" href="lagg-till.html">Lägg till aktivitet</a>
  </nav>
  <div class="content">
${indented}
  </div>
</body>
</html>
`;
}

module.exports = { renderIndexPage, convertMarkdown };
